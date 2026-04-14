import { inject, Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { LoginCredentials } from '../models/login-credentials';
import { Observable } from 'rxjs';
import { LoginResponse } from '../models/login-response';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private http: HttpClient = inject(HttpClient);


  login(credentials: LoginCredentials): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(environment.authApiUrl, credentials);
  }

  signUp(credentials: LoginCredentials): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${environment.authApiUrl}/register`, credentials);
  }

  refreshToken(): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${environment.authApiUrl}/refresh`, {});
  }

}
