import { Injectable, inject } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { LoginCredentials } from 'src/app/core/models/login-credentials';
import { Observable } from 'rxjs';
import { LoginResponse } from 'src/app/core/models/login-response';
import { AuthService } from 'src/app/core/auth/auth.service';

/**
 * Servicio encargado de gestionar las llamadas a la API de autenticación.
 * Provee métodos para el registro, inicio de sesión (credenciales y SSO) y refresco de tokens.
 */
@Injectable({
  providedIn: 'root'
})
export class LoginService {

  private http: HttpClient = inject(HttpClient);
  private authService: AuthService = inject(AuthService);

  /**
   * Inicia sesión utilizando credenciales clásicas.
   * 
   * @param credentials Objeto con el email y contraseña del usuario.
   * @returns Un Observable que emite la respuesta con los tokens si el login es exitoso.
   */
  login(credentials: LoginCredentials): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${environment.authApiUrl}/login`, credentials);
  }

  /**
   * Registra un nuevo usuario en la plataforma.
   * 
   * @param credentials Objeto con los datos de registro (email y contraseña).
   * @returns Un Observable que emite la respuesta tras la creación de la cuenta.
   */
  signUp(credentials: LoginCredentials): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${environment.authApiUrl}/register`, credentials);
  }

  /**
   * Solicita un nuevo token de acceso a la API utilizando el token de refresco actual.
   * 
   * @returns Un Observable con los nuevos tokens de sesión.
   */
  refreshToken(): Observable<LoginResponse> {
    return this.http.get<LoginResponse>(`${environment.authApiUrl}/refresh`, {
      headers: {
        'Authorization': this.authService.getRefreshToken() || ''
      }
    });
  }

  /**
   * Redirige al usuario a la página de inicio de sesión por Single Sign-On (SSO).
   * Al ser una redirección completa del navegador, no devuelve ningún Observable.
   */
  ssoLogin(): void {
    window.location.href = `${environment.authApiUrl}/sso`;
  }

  /**
   * Procesa la respuesta (callback) tras un inicio de sesión SSO exitoso, 
   * enviando el código de autorización recibido a la API para obtener los tokens.
   * 
   * @param code Código de autorización devuelto en la URL por el proveedor de identidad.
   * @returns Un Observable con los tokens de la sesión del usuario.
   */
  ssoCallback(code: string): Observable<LoginResponse> {
    return this.http.get<LoginResponse>(`${environment.authApiUrl}/sso/callback?code=${code}`);
  }
}
