import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { Router } from '@angular/router';
import { of, throwError, Subject } from 'rxjs';

import { authInterceptor } from './auth.interceptor';
import { AuthService } from './auth.service';
import { LoginService } from 'src/app/features/login/services/login.service';
import { LoginResponse } from '../models/login-response';

describe('authInterceptor', () => {
  let httpMock: HttpTestingController;
  let httpClient: HttpClient;
  
  // Espías de las dependencias
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let loginServiceSpy: jasmine.SpyObj<LoginService>;
  let routerSpy: jasmine.SpyObj<Router>;

  // Respuesta simulada para cuando el Refresh Token funciona
  const mockRefreshResponse: LoginResponse = {
    token: 'nuevo-access-token',
    refreshToken: 'nuevo-refresh-token',
    tokenType: 'Bearer',
    email: 'test@econocom.com'
  };

  beforeEach(() => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['getAuthToken', 'setAuthToken', 'clearAuthToken']);
    loginServiceSpy = jasmine.createSpyObj('LoginService', ['refreshToken']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: LoginService, useValue: loginServiceSpy },
        { provide: Router, useValue: routerSpy },
        // Configuramos el cliente con tu interceptor funcional
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting()
      ]
    });

    httpMock = TestBed.inject(HttpTestingController);
    httpClient = TestBed.inject(HttpClient);
  });

  afterEach(() => {
    httpMock.verify(); // Aseguramos que no quedan peticiones colgando
  });

  describe('Flujo Normal (Sin Errores)', () => {
    it('debería añadir la cabecera Authorization si hay token y NO es ruta de auth', () => {
      authServiceSpy.getAuthToken.and.returnValue('Bearer mi-token-valido');
      
      httpClient.get('/api/recurso-protegido').subscribe();
      
      const req = httpMock.expectOne('/api/recurso-protegido');
      expect(req.request.headers.get('Authorization')).toBe('Bearer mi-token-valido');
      req.flush({}); // Completar con éxito
    });

    it('NO debería añadir la cabecera en rutas de autenticación (ej. /login)', () => {
      authServiceSpy.getAuthToken.and.returnValue('Bearer token-que-debe-ignorarse');
      
      httpClient.post('/api/auth/login', {}).subscribe();
      
      const req = httpMock.expectOne('/api/auth/login');
      expect(req.request.headers.has('Authorization')).toBeFalse();
      req.flush({});
    });
  });

  describe('handle401Error (Manejo de Refresh Token)', () => {
    
    it('debería refrescar el token y REINTENTAR la petición original con éxito', () => {
      authServiceSpy.getAuthToken.and.returnValue('Bearer token-caducado');
      loginServiceSpy.refreshToken.and.returnValue(of(mockRefreshResponse));

      // Hacemos la petición que va a fallar
      httpClient.get('/api/protegido').subscribe();

      // Simulamos que el backend nos devuelve un 401
      const req1 = httpMock.expectOne('/api/protegido');
      req1.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

      // Verificamos que se llamó al servicio para refrescar
      expect(loginServiceSpy.refreshToken).toHaveBeenCalled();
      
      // Verificamos que se guardaron los nuevos tokens
      expect(authServiceSpy.setAuthToken).toHaveBeenCalledWith('Bearer', 'nuevo-access-token', 'nuevo-refresh-token');

      // El interceptor debería haber clonado y repetido la petición original
      const req2 = httpMock.expectOne('/api/protegido');
      // Comprobamos que el reintento lleva el token nuevo
      expect(req2.request.headers.get('Authorization')).toBe('Bearer nuevo-access-token');
      req2.flush({}); 
    });

    it('debería desloguear y mandar al login si el Refresh Token FALLA', () => {
      authServiceSpy.getAuthToken.and.returnValue('Bearer token-caducado');
      // Simulamos que el endpoint de refresh también devuelve error (ej. refresh caducado)
      loginServiceSpy.refreshToken.and.returnValue(throwError(() => new Error('Refresh invalido')));

      httpClient.get('/api/protegido').subscribe({
        error: (err) => expect(err).toBeTruthy() // Nos aseguramos de que el error llegue al componente
      });

      const req = httpMock.expectOne('/api/protegido');
      req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

      // Verificamos el comportamiento de fallo
      expect(loginServiceSpy.refreshToken).toHaveBeenCalled();
      expect(authServiceSpy.clearAuthToken).toHaveBeenCalled();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('debería encolar múltiples peticiones 401 si ya se está refrescando (isRefreshing = true)', () => {
      authServiceSpy.getAuthToken.and.returnValue('Bearer token-caducado');
      
      // Para simular el "isRefreshing", usamos un Subject. Esto nos permite pausar el tiempo.
      // El refresh no se completará hasta que nosotros digamos .next()
      const refreshSubject = new Subject<LoginResponse>();
      loginServiceSpy.refreshToken.and.returnValue(refreshSubject.asObservable());

      // Petición 1: Da 401. Esto pone `isRefreshing = true` e invoca al refreshSubject
      httpClient.get('/api/endpoint-1').subscribe();
      const req1 = httpMock.expectOne('/api/endpoint-1');
      req1.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

      // Petición 2: Da 401 simultáneamente. Como `isRefreshing` ya es true, debe entrar por el "else" y quedarse encolada
      httpClient.get('/api/endpoint-2').subscribe();
      const req2 = httpMock.expectOne('/api/endpoint-2');
      req2.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

      // Ahora que ambas peticiones están "bloqueadas" esperando, resolvemos el refresco.
      refreshSubject.next(mockRefreshResponse);
      refreshSubject.complete();

      // Verificamos que AMBAS peticiones se han vuelto a intentar con el token nuevo
      const retry1 = httpMock.expectOne('/api/endpoint-1');
      const retry2 = httpMock.expectOne('/api/endpoint-2');

      expect(retry1.request.headers.get('Authorization')).toBe('Bearer nuevo-access-token');
      expect(retry2.request.headers.get('Authorization')).toBe('Bearer nuevo-access-token');

      retry1.flush({});
      retry2.flush({});
    });
  });
});