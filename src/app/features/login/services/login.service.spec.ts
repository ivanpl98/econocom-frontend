import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

import { LoginService } from './login.service';
import { AuthService } from 'src/app/core/auth/auth.service';
import { LoginCredentials } from 'src/app/core/models/login-credentials';
import { LoginResponse } from 'src/app/core/models/login-response';

describe('LoginService', () => {
  let service: LoginService;
  let httpMock: HttpTestingController;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    // Mockeamos el AuthService porque el refreshToken() lo necesita
    const spy = jasmine.createSpyObj('AuthService', ['getRefreshToken']);

    TestBed.configureTestingModule({
      providers: [
        LoginService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: spy }
      ]
    });

    service = TestBed.inject(LoginService);
    httpMock = TestBed.inject(HttpTestingController);
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
  });

  // Verificamos que no queden peticiones HTTP colgando después de cada test
  afterEach(() => {
    httpMock.verify(); 
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should perform login POST request correctly', () => {
    // Preparamos los datos
    const mockCredentials: LoginCredentials = { email: 'test@test.com', password: '123' };
    const mockResponse: LoginResponse = { token: 'jwt-access', refreshToken: 'jwt-refresh', email: 'test@test.com', tokenType: 'Bearer' };

    // Llamamos al método
    service.login(mockCredentials).subscribe(response => {
      // Comprobamos que la respuesta del servicio es la que emulamos
      expect(response).toEqual(mockResponse);
    });

    // Interceptamos la petición y verificamos URL, método y cuerpo
    const req = httpMock.expectOne(`${environment.authApiUrl}/login`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockCredentials);
    
    // Enviamos la respuesta simulada para que el subscribe se ejecute
    req.flush(mockResponse); 
  });

  it('should perform signUp POST request correctly', () => {
    const mockCredentials: LoginCredentials = { email: 'new@test.com', password: '123' };
    const mockResponse: LoginResponse = { token: 'jwt', refreshToken: 'ref', email: 'new@test.com', tokenType: 'Bearer' };

    service.signUp(mockCredentials).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${environment.authApiUrl}/register`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockCredentials);
    req.flush(mockResponse);
  });

  it('should perform refreshToken GET request with Authorization header', () => {
    const mockResponse: LoginResponse = { token: 'new-jwt', refreshToken: 'new-ref', email: 'test@test.com', tokenType: 'Bearer' };
    
    // Simulamos que el AuthService devuelve un refresh token guardado
    authServiceSpy.getRefreshToken.and.returnValue('my-saved-refresh-token');

    service.refreshToken().subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${environment.authApiUrl}/refresh`);
    expect(req.request.method).toBe('GET');
    
    // Verificamos que se haya inyectado la cabecera
    expect(req.request.headers.get('Authorization')).toBe('my-saved-refresh-token');
    req.flush(mockResponse);
  });

  it('should perform ssoCallback GET request with code parameter', () => {
    const code = 'auth0-secret-code';
    const mockResponse: LoginResponse = { token: 'jwt', refreshToken: 'ref', email: 'sso@test.com', tokenType: 'Bearer' };

    service.ssoCallback(code).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    // Comprobamos que la URL contenga el query param del código
    const req = httpMock.expectOne(`${environment.authApiUrl}/sso/callback?code=${code}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });
});