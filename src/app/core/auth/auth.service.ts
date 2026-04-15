import { Injectable } from '@angular/core';

/**
 * Servicio encargado de gestionar la sesión y los tokens de autenticación del usuario.
 * Proporciona métodos para guardar, obtener, eliminar y verificar el estado de los tokens (JWT o similares)
 * en el almacenamiento local del navegador (`localStorage`).
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // Almacenamos el token principal de acceso y el de refresco en memoria para acceso rápido
  private authToken: string | null = null;
  private refreshToken: string | null = null;

  /**
   * Guarda los tokens de autenticación en la memoria y en el localStorage.
   * 
   * @param tokenType Tipo de token (por ejemplo, 'Bearer').
   * @param token Token de acceso (access token).
   * @param refreshToken Token de refresco (para obtener un nuevo access token).
   */
  setAuthToken(tokenType: string, token: string, refreshToken: string): void {
    // Se concatena el tipo de token (ej. 'Bearer') con el token en sí
    this.authToken = `${tokenType} ${token}`;
    this.refreshToken = `${tokenType} ${refreshToken}`;
    
    // Almacenado persistente en el navegador
    localStorage.setItem('authToken', this.authToken);
    localStorage.setItem('refreshToken', this.refreshToken);
  }

  /**
   * Obtiene el token de acceso actual. 
   * Si no está en la memoria, intenta recuperarlo del localStorage.
   * 
   * @returns El token de acceso formateado o `null` si no existe.
   */
  getAuthToken(): string | null {
    if (!this.authToken) {
      this.authToken = localStorage.getItem('authToken');
    }
    return this.authToken;
  }

  /**
   * Obtiene el token de refresco actual.
   * Si no está en la memoria, intenta recuperarlo del localStorage.
   * 
   * @returns El token de refresco formateado o `null` si no existe.
   */
  getRefreshToken(): string | null {
    if (!this.refreshToken) {
      this.refreshToken = localStorage.getItem('refreshToken');
    }
    return this.refreshToken;
  }

  /**
   * Elimina todos los tokens de autenticación tanto de la memoria como del localStorage.
   * Útil para cerrar la sesión del usuario.
   */
  clearAuthToken(): void {
    this.authToken = null;
    this.refreshToken = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
  }

  /**
   * Verifica si el usuario tiene una sesión activa comprobando la existencia de un token de acceso.
   * 
   * @returns `true` si el token existe, `false` en caso contrario.
   */
  isLoggedIn(): boolean {
    return !!this.getAuthToken();
  }

}
