import { HttpErrorResponse, HttpInterceptorFn, HttpRequest, HttpEvent, HttpHandlerFn } from "@angular/common/http";
import { inject } from "@angular/core";
import { AuthService } from "./auth.service";
import { BehaviorSubject, catchError, filter, switchMap, take, throwError, Observable } from "rxjs";
import { Router } from "@angular/router";
import { LoginService } from "src/app/features/login/services/login.service";
import { LoginResponse } from "../models/login-response";

let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService);
    const loginService = inject(LoginService);
    const authToken = authService.getAuthToken();
    const router = inject(Router);

    let authReq = req;
    const isAuthRoute = req.url.includes('/login') || req.url.includes('/register') || req.url.includes('/refresh');

    if (authToken && !isAuthRoute) {
        authReq = addTokenHeader(req, authToken);
    }

    return next(authReq).pipe(
        catchError((error: HttpErrorResponse) => {
            // 3. Si el error es 401 y NO estamos intentando loguearnos...
            if (error.status === 401 && !isAuthRoute) {
                return handle401Error(authReq, next, authService, loginService, router);
            }
            // Si es otro tipo de error, lo dejamos pasar
            return throwError(() => error);
        })
    );
};

function addTokenHeader(request: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
    return request.clone({
        setHeaders: { Authorization: token }
    });
}

function handle401Error(
    request: HttpRequest<unknown>,
    next: HttpHandlerFn,
    authService: AuthService,
    loginService: LoginService,
    router: Router
): Observable<HttpEvent<unknown>> {
    
    if (!isRefreshing) {
        isRefreshing = true;
        refreshTokenSubject.next(null);

        return loginService.refreshToken().pipe(
            switchMap((response: LoginResponse): Observable<HttpEvent<unknown>> => {
                isRefreshing = false;
                const newToken = `${response.tokenType} ${response.token}`;

                authService.setAuthToken(response.tokenType, response.token, response.refreshToken);

                refreshTokenSubject.next(newToken);
                
                return next(addTokenHeader(request, newToken));
            }),
            catchError((err) => {
                isRefreshing = false;
                authService.clearAuthToken();
                router.navigate(['/login']);
                return throwError(() => err);
            })
        );
    } else {
        return refreshTokenSubject.pipe(
            filter(token => token !== null),
            take(1),
            switchMap((token): Observable<HttpEvent<unknown>> => {
                return next(addTokenHeader(request, token as string));
            })
        );
    }
}