import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginBannerComponent } from "../components/banner/login-banner.component";
import { LoginFormComponent } from "../components/form/login-form.component";
import { LoginService } from '../services/login.service';
import { LoginCredentials } from 'src/app/core/models/login-credentials';
import { AuthService } from 'src/app/core/auth/auth.service';
import { LoginResponse } from 'src/app/core/models/login-response';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';

/**
 * Componente principal de la página de inicio de sesión.
 * Actúa como contenedor de la interfaz de login, conectando los componentes visuales (formulario y banner)
 * con los servicios de autenticación y gestionando las respuestas (éxito, errores y Single Sign-On).
 */
@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, LoginBannerComponent, LoginFormComponent, MatSnackBarModule],
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss']
})
export class LoginPageComponent implements OnInit {

  // Inyección de dependencias
  private loginService = inject(LoginService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private snackBar = inject(MatSnackBar);

  ngOnInit(): void {
    // Nos suscribimos a los parámetros de la URL (lo que va después del ?)
    this.route.queryParams.subscribe(params => {
      console.log('Query params:', params); // Para depuración: ver qué parámetros tenemos en la URL
      const code = params['code']; // Buscamos un parámetro llamado "code"

      if (code) {
        // Si existe, significa que Auth0 (u otro proveedor SSO) nos acaba de devolver aquí.
        // Llamamos a nuestro método privado para manejarlo y obtener los tokens.
        console.log('SSO callback detected with code:', code); // Para depuración
        this.processSsoCallback(code);
      }
    });
  }

  /**
   * Muestra notificaciones estilo "toast" o "snackbar" al usuario en la parte inferior de la pantalla.
   * 
   * @param mensaje Texto de la notificación a mostrar.
   * @param tipo Define los estilos aplicados (verifica si es éxito o error).
   */
  private mostrarMensaje(mensaje: string, tipo: 'exito' | 'error' = 'exito') {
    // Usamos una clase CSS personalizada (snackbar-exito o snackbar-error)
    const panelClass = tipo === 'exito' ? 'snackbar-exito' : 'snackbar-error';

    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 5000, // Desaparece a los 5 segundos
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: [panelClass] // Aplicamos estilos personalizados
    });
  }

  /**
   * Manejador para el envío del formulario de inicio de sesión normal (email y contraseña).
   * Llama al servicio correspondiente y, si tiene éxito, guarda el token.
   * 
   * @param credentials Datos del formulario de login.
   */
  onLoginFormSubmit(credentials: LoginCredentials) {
    this.loginService.login(credentials).subscribe({
      next: (response: LoginResponse) => {
        this.authService.setAuthToken(response.tokenType, response.token, response.refreshToken);
        this.mostrarMensaje('¡Bienvenido de nuevo!');
        this.router.navigate(['/login']);
      },
      error: (error) => {
        const msg = error.status === 401
          ? 'Usuario o contraseña incorrectos.'
          : 'Ha ocurrido un error al iniciar sesión.';
        this.mostrarMensaje(msg, 'error');
      }
    });
  }

  /**
   * Dispara el flujo de inicio de sesión a través de SSO (Single Sign-On).
   */
  onSsoLoginClick() {
    this.loginService.ssoLogin();
  }

  /**
   * Manejador para la creación de un nuevo usuario a partir del modal de registro.
   * 
   * @param credentials Datos del formulario de registro.
   */
  onRegisterClick(credentials: LoginCredentials) {
    this.loginService.signUp(credentials).subscribe({
      next: () => {
        this.mostrarMensaje('¡Registro exitoso! Ya puedes iniciar sesión.');
      },
      error: (error) => {
        const msg = error.status === 401 // Ejemplo: Si el backend devuelve 409 Conflict
          ? 'Este email ya está registrado.'
          : 'Ha ocurrido un error al crear la cuenta.';
        this.mostrarMensaje(msg, 'error'); // <-- Mensaje de error
      }
    });
  }

  /**
   * Función encargada de validar el código de autorización obtenido del proveedor SSO.
   * Limpia la URL de parámetros para no persistir el código en la vista y almacena los tokens.
   * 
   * @param code Código de un solo uso retornado por el proveedor SSO en su respuesta.
   */
  processSsoCallback(code: string) {
    this.loginService.ssoCallback(code).subscribe({
      next: (response: LoginResponse) => {
        this.authService.setAuthToken(response.tokenType, response.token, response.refreshToken);
        this.mostrarMensaje('¡Inicio de sesión SSO exitoso!');
        
        // Limpiamos los parámetros de la URL reemplazando la entrada en el historial
        this.router.navigate(['login'], {
          queryParams: { 'code': null },
          queryParamsHandling: 'merge',
          replaceUrl: true
        });
      },
      error: () => {
        this.mostrarMensaje('Error al validar el código SSO.', 'error');
        this.router.navigate(['login'], {
          queryParams: { 'code': null },
          queryParamsHandling: 'merge',
          replaceUrl: true
        });
      }
    });
  }
}
