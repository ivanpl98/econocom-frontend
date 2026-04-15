import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private authToken: string | null = null;
  private refreshToken: string | null = null;

  setAuthToken(tokenType: string, token: string, refreshToken: string) {
    this.authToken = `${tokenType} ${token}`;
    this.refreshToken = `${tokenType} ${refreshToken}`;
    localStorage.setItem('authToken', this.authToken);
    localStorage.setItem('refreshToken', this.refreshToken);
  }

  getAuthToken(): string | null {
    if (!this.authToken) this.authToken = localStorage.getItem('authToken');
    return this.authToken;
  }

  getRefreshToken(): string | null {
    if (!this.refreshToken) this.refreshToken = localStorage.getItem('refreshToken');
    return this.refreshToken;
  }

  clearAuthToken() {
    this.authToken = null;
    this.refreshToken = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
  }

  isLoggedIn(): boolean {
    return !!this.getAuthToken();
  }

}
