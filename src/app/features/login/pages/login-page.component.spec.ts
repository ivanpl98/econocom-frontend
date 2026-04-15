import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of, throwError, BehaviorSubject } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { LoginPageComponent } from './login-page.component';
import { LoginService } from '../services/login.service';
import { AuthService } from 'src/app/core/auth/auth.service';
import { LoginCredentials } from 'src/app/core/models/login-credentials';
import { LoginResponse } from 'src/app/core/models/login-response';

// Simulamos los componentes hijos para no tener que cargar todos sus módulos y HTML
import { Component, EventEmitter, Output } from '@angular/core';
@Component({ selector: 'app-login-banner', standalone: true, template: '' })
class MockLoginBannerComponent { }

@Component({ selector: 'app-login-form', standalone: true, template: '' })
class MockLoginFormComponent {
  @Output() formSubmit = new EventEmitter<LoginCredentials>();
  @Output() ssoLoginClick = new EventEmitter<void>();
  @Output() registerSubmit = new EventEmitter<LoginCredentials>();
}

describe('LoginPageComponent', () => {
  let component: LoginPageComponent;
  let fixture: ComponentFixture<LoginPageComponent>;

  // Mocks
  let loginServiceSpy: jasmine.SpyObj<LoginService>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let snackBarSpy: jasmine.SpyObj<MatSnackBar>;
  let routerSpy: jasmine.SpyObj<Router>;

  // Usamos BehaviorSubject para poder simular cambios en la URL (los queryParams)
  let queryParamsSubject: BehaviorSubject<any>;

  beforeEach(async () => {
    loginServiceSpy = jasmine.createSpyObj('LoginService', ['login', 'signUp', 'ssoLogin', 'ssoCallback']);
    authServiceSpy = jasmine.createSpyObj('AuthService', ['setAuthToken']);
    snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    queryParamsSubject = new BehaviorSubject<any>({});

    await TestBed.configureTestingModule({
      imports: [LoginPageComponent, MockLoginBannerComponent, MockLoginFormComponent, NoopAnimationsModule],
      providers: [
        { provide: LoginService, useValue: loginServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: MatSnackBar, useValue: snackBarSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: { queryParams: queryParamsSubject.asObservable() } }
      ]
    })
      .overrideProvider(MatSnackBar, { useValue: snackBarSpy })
      .compileComponents();

    fixture = TestBed.createComponent(LoginPageComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('ngOnInit (SSO Callback Flow)', () => {
    it('should NOT call processSsoCallback if there is NO code in queryParams', () => {
      // Espiamos el método privado saltándonos el tipado de TypeScript
      const spy = spyOn<any>(component, 'processSsoCallback');
      queryParamsSubject.next({}); // URL sin código
      fixture.detectChanges();
      expect(spy).not.toHaveBeenCalled();
    });

    it('should call processSsoCallback if code is present in URL', () => {
      const spy = spyOn<any>(component, 'processSsoCallback');
      queryParamsSubject.next({ code: 'fake-auth0-code' }); // Simulamos vuelta de Auth0
      fixture.detectChanges();
      expect(spy).toHaveBeenCalledWith('fake-auth0-code');
    });
  });

  describe('onLoginFormSubmit (Login Flow)', () => {
    const credentials: LoginCredentials = { email: 'a@a.com', password: '123' };
    const response: LoginResponse = { token: 't', refreshToken: 'r', email: 'a@a.com', tokenType: 'Bearer' };

    it('should set tokens, show success snackbar and navigate on SUCCESS', () => {
      loginServiceSpy.login.and.returnValue(of(response)); // of() emula un observable exitoso

      component.onLoginFormSubmit(credentials);

      expect(authServiceSpy.setAuthToken).toHaveBeenCalledWith('Bearer', 't', 'r');
      expect(snackBarSpy.open).toHaveBeenCalledWith('¡Bienvenido de nuevo!', 'Cerrar', jasmine.any(Object));
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('should show specific error snackbar on 401 ERROR', () => {
      loginServiceSpy.login.and.returnValue(throwError(() => ({ status: 401 })));

      component.onLoginFormSubmit(credentials);

      expect(authServiceSpy.setAuthToken).not.toHaveBeenCalled();
      expect(snackBarSpy.open).toHaveBeenCalledWith('Usuario o contraseña incorrectos.', 'Cerrar', jasmine.objectContaining({ panelClass: ['snackbar-error'] }));
    });

    it('should show generic error snackbar on 500 ERROR', () => {
      // Simulamos un error 500 (Servidor caído)
      loginServiceSpy.login.and.returnValue(throwError(() => ({ status: 500 })));

      component.onLoginFormSubmit({ email: 'a@a.com', password: '123' });

      // Esperamos el mensaje de la rama "else"
      expect(snackBarSpy.open).toHaveBeenCalledWith('Ha ocurrido un error al iniciar sesión.', 'Cerrar', jasmine.any(Object));
    });

    it('should show generic error on 500 ERROR during register', () => {
      loginServiceSpy.signUp.and.returnValue(throwError(() => ({ status: 500 })));

      component.onRegisterClick({ email: 'new@a.com', password: '123' });

      expect(snackBarSpy.open).toHaveBeenCalledWith('Ha ocurrido un error al crear la cuenta.', 'Cerrar', jasmine.any(Object));
    });
  });

  describe('onRegisterClick (Register Flow)', () => {
    const credentials: LoginCredentials = { email: 'new@a.com', password: '123' };

    it('should show success snackbar on SUCCESS', () => {
      loginServiceSpy.signUp.and.returnValue(of({} as LoginResponse));

      component.onRegisterClick(credentials);

      expect(snackBarSpy.open).toHaveBeenCalledWith('¡Registro exitoso! Ya puedes iniciar sesión.', 'Cerrar', jasmine.objectContaining({ panelClass: ['snackbar-exito'] }));
    });

    it('should show conflict error on 401 (or 409) ERROR', () => {
      loginServiceSpy.signUp.and.returnValue(throwError(() => ({ status: 401 })));

      component.onRegisterClick(credentials);

      expect(snackBarSpy.open).toHaveBeenCalledWith('Este email ya está registrado.', 'Cerrar', jasmine.objectContaining({ panelClass: ['snackbar-error'] }));
    });
  });

  describe('processSsoCallback', () => {
    it('should set token, clean URL and show success on SUCCESS', () => {
      const response: LoginResponse = { token: 't', refreshToken: 'r', email: 'sso@a.com', tokenType: 'Bearer' };
      loginServiceSpy.ssoCallback.and.returnValue(of(response));

      component.processSsoCallback('valid-code');

      expect(authServiceSpy.setAuthToken).toHaveBeenCalledWith('Bearer', 't', 'r');
      expect(snackBarSpy.open).toHaveBeenCalledWith('¡Inicio de sesión SSO exitoso!', 'Cerrar', jasmine.any(Object));
      expect(routerSpy.navigate).toHaveBeenCalledWith(['login'], jasmine.objectContaining({ queryParams: { code: null } }));
    });

    it('should show error and clean URL on ERROR', () => {
      loginServiceSpy.ssoCallback.and.returnValue(throwError(() => new Error('SSO Failed')));

      component.processSsoCallback('invalid-code');

      expect(snackBarSpy.open).toHaveBeenCalledWith('Error al validar el código SSO.', 'Cerrar', jasmine.objectContaining({ panelClass: ['snackbar-error'] }));
      expect(routerSpy.navigate).toHaveBeenCalledWith(['login'], jasmine.objectContaining({ queryParams: { code: null } }));
    });
  });
});