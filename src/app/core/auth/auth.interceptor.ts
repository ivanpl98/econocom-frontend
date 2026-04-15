import { HttpErrorResponse, HttpInterceptorFn, HttpRequest, HttpEvent, HttpHandlerFn } from "@angular/common/http";
import { inject } from "@angular/core";
import { AuthService } from "./auth.service";
import { BehaviorSubject, catchError, filter, switchMap, take, throwError, Observable } from "rxjs";
import { Router } from "@angular/router";
import { LoginService } from "src/app/features/login/services/login.service";
import { LoginResponse } from "../models/login-response";

// Control de estado para saber si estamos actualmente refrescando el token
let isRefreshing = false;
// BehaviorSubject que almacenará el nuevo token de acceso una vez renovado
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

/**
 * Interceptor HTTP encargado de añadir el token de autenticación a cada solicitud saliente
 * y de manejar los errores 401 (No Autorizado) intentando refrescar el token de forma transparente.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
    // Inyección de dependencias necesaria, ya que authInterceptor es una función
    const authService = inject(AuthService);
    const loginService = inject(LoginService);
    const router = inject(Router);
    const authToken = authService.getAuthToken();

    let authReq = req;
    
    // Evitamos enviar tokens a las rutas de autenticación (login, registro, refresco de token)
    const isAuthRoute = req.url.includes('/login') || req.url.includes('/register') || req.url.includes('/refresh');

    // Si disponemos de un token y no es una ruta de autenticación, añadimos el header
    if (authToken && !isAuthRoute) {
        authReq = addTokenHeader(req, authToken);
    }

    // Pasamos la petición al siguiente manejador de la cadena y capturamos posibles errores
    return next(authReq).pipe(
        catchError((error: HttpErrorResponse) => {
            // Si el error es 401 y la solicitud NO era hacia una ruta de autorización...
            if (error.status === 401 && !isAuthRoute) {
                return handle401Error(authReq, next, authService, loginService, router);
            }
            // Si es otro tipo de error o ya estamos en rutas de auth, lo dejamos pasar
            return throwError(() => error);
        })
    );
};

/**
 * Añade la cabecera 'Authorization' a una petición HTTP.
 * 
 * @param request Petición original.
 * @param token Token de acceso.
 * @returns La nueva petición clonada con la cabecera incluida.
 */
function addTokenHeader(request: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
    return request.clone({
        setHeaders: { Authorization: token }
    });
}

/**
 * Maneja los errores de tipo 401. Orquesta el proceso de regenerar el token de acceso
 * utilizando el token de refresco, y reintenta la petición fallida subyacente.
 * 
 * @param request Petición fallida inicial por timeout/token expirado
 * @param next Siguiente manejador para reintentar la petición
 * @param authService Servicio de autenticación
 * @param loginService Servicio de inicio de sesión
 * @param router Router para redirigir si el refresco falla
 * @returns Un Observador con la petición original reintentada o un error
 */
function handle401Error(
    request: HttpRequest<unknown>,
    next: HttpHandlerFn,
    authService: AuthService,
    loginService: LoginService,
    router: Router
): Observable<HttpEvent<unknown>> {
    
    if (!isRefreshing) {
        isRefreshing = true;
        refreshTokenSubject.next(null); // Iniciamos el refresco, el token actual aún no está listo

        // Solicitamos un nuevo token de acceso a partir del refresh token
        return loginService.refreshToken().pipe(
            switchMap((response: LoginResponse): Observable<HttpEvent<unknown>> => {
                isRefreshing = false;
                const newToken = `${response.tokenType} ${response.token}`;

                // Guardamos la nueva sesión
                authService.setAuthToken(response.tokenType, response.token, response.refreshToken);

                // Avisamos a las otras peticiones en espera de que ya tenemos un token válido
                refreshTokenSubject.next(newToken);
                
                // Reintentamos la petición original con el nuevo token
                return next(addTokenHeader(request, newToken));
            }),
            catchError((err) => {
                // Si falla el refresco (p. ej. token revocado), deslogueamos totalmente y redirigimos
                isRefreshing = false;
                authService.clearAuthToken();
                router.navigate(['/login']);
                return throwError(() => err);
            })
        );
    } else {
        // Alguien más está refrescando el token de acceso en este momento.
        // Hacemos que la petición espere (se suscriba) hasta que refreshTokenSubject emita un valor válido (no null).
        return refreshTokenSubject.pipe(
            filter(token => token !== null), // Esperar hasta que se asigne 'newToken'
            take(1), // Tomar sólamente el primer token emitido y detener la escucha
            switchMap((token): Observable<HttpEvent<unknown>> => {
                // Reintentar esta petición encolada con el token recibido
                return next(addTokenHeader(request, token as string));
            })
        );
    }
}