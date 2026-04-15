import { Injectable, inject } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { LoginCredentials } from 'src/app/core/models/login-credentials';
import { Observable } from 'rxjs';
import { LoginResponse } from 'src/app/core/models/login-response';
import { AuthService } from 'src/app/core/auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  private http: HttpClient = inject(HttpClient);
  private authService: AuthService = inject(AuthService);

  login(credentials: LoginCredentials): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${environment.authApiUrl}/login`, credentials);
  }

  signUp(credentials: LoginCredentials): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${environment.authApiUrl}/register`, credentials);
  }

  refreshToken(): Observable<LoginResponse> {
    return this.http.get<LoginResponse>(`${environment.authApiUrl}/refresh`, {
      headers: {
        'Authorization': this.authService.getRefreshToken() || ''
      }
    });
  }

  ssoLogin(): void {
    window.location.href = `${environment.authApiUrl}/sso`;
  }

  ssoCallback(code: string): Observable<LoginResponse> {
    return this.http.get<LoginResponse>(`${environment.authApiUrl}/sso/callback?code=${code}`);
  }
}
