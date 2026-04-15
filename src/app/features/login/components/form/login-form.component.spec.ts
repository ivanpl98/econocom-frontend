import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { of } from 'rxjs';

import { LoginFormComponent } from './login-form.component';

describe('LoginFormComponent', () => {
  let component: LoginFormComponent;
  let fixture: ComponentFixture<LoginFormComponent>;
  let dialogSpy: jasmine.SpyObj<MatDialog>;

  beforeEach(async () => {
    dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);

    await TestBed.configureTestingModule({
      imports: [
        LoginFormComponent, 
        ReactiveFormsModule, 
        NoopAnimationsModule,
        MatDialogModule
      ],
      providers: [
        { provide: MatDialog, useValue: dialogSpy }
      ]
    })
    .overrideProvider(MatDialog, { useValue: dialogSpy })
    .compileComponents();

    fixture = TestBed.createComponent(LoginFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Form Validations', () => {
    it('should initialize with an invalid form (empty fields)', () => {
      expect(component.loginForm.valid).toBeFalse();
    });

    it('should mark email as invalid if it has no email format', () => {
      const emailControl = component.loginForm.get('email');
      emailControl?.setValue('correo-falso');
      expect(emailControl?.valid).toBeFalse();
      expect(emailControl?.hasError('email')).toBeTrue();
    });

    it('should mark form as valid when correct data is provided', () => {
      component.loginForm.get('email')?.setValue('test@econocom.com');
      component.loginForm.get('password')?.setValue('123456');
      expect(component.loginForm.valid).toBeTrue();
    });
  });

  describe('Event Emitters (@Output)', () => {
    it('should emit formSubmit event ONLY when form is valid', () => {
      spyOn(component.formSubmit, 'emit');

      // Intento 1: Formulario inválido (no debe emitir)
      component.onSubmit();
      expect(component.formSubmit.emit).not.toHaveBeenCalled();

      // Intento 2: Formulario válido (debe emitir las credenciales)
      component.loginForm.get('email')?.setValue('test@econocom.com');
      component.loginForm.get('password')?.setValue('123456');
      
      component.onSubmit();
      
      expect(component.formSubmit.emit).toHaveBeenCalledWith({
        email: 'test@econocom.com',
        password: '123456'
      });
    });

    it('should emit ssoLoginClick event when onSsoLogin is called', () => {
      spyOn(component.ssoLoginClick, 'emit');
      component.onSsoLogin();
      expect(component.ssoLoginClick.emit).toHaveBeenCalled();
    });
  });

  describe('Modal de Registro (abrirModalRegistro)', () => {
    it('debería abrir el modal y emitir registerClick si devuelve datos al cerrarse', () => {
      // Espiamos el emisor correcto (registerClick)
      spyOn(component.registerClick, 'emit');

      // Simulamos un modal que se cierra devolviendo credenciales
      const dialogRefSpyObj = jasmine.createSpyObj({ 
        afterClosed: of({ email: 'nuevo@correo.com', password: '123' }) 
      });
      dialogSpy.open.and.returnValue(dialogRefSpyObj);

      // Ejecutamos la función
      component.abrirModalRegistro();

      // Verificamos que se abrió el modal
      expect(dialogSpy.open).toHaveBeenCalled();
      
      // Verificamos que emitió los datos recibidos
      expect(component.registerClick.emit).toHaveBeenCalledWith({ 
        email: 'nuevo@correo.com', 
        password: '123' 
      });
    });

    it('NO debería emitir evento si el modal se cierra vacío (Cancelado)', () => {
      spyOn(component.registerClick, 'emit');

      // Simulamos que el usuario cierra el modal dándole a la X (devuelve undefined)
      const dialogRefSpyObj = jasmine.createSpyObj({ 
        afterClosed: of(undefined) 
      });
      dialogSpy.open.and.returnValue(dialogRefSpyObj);

      component.abrirModalRegistro();

      // Comprobamos que NO emitió nada
      expect(component.registerClick.emit).not.toHaveBeenCalled();
    });
  });
});