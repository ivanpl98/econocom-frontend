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

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, LoginBannerComponent, LoginFormComponent, MatSnackBarModule],
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss']
})
export class LoginPageComponent implements OnInit {

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
        // Si existe, significa que Auth0 nos acaba de devolver aquí.
        // Llamamos a nuestro método privado para manejarlo.
        console.log('SSO callback detected with code:', code); // Para depuración
        this.processSsoCallback(code);
      }
    });
  }

  // --- MÉTODO AUXILIAR PARA MOSTRAR MENSAJES ---
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

  onSsoLoginClick() {
    this.loginService.ssoLogin();
  }

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

  processSsoCallback(code: string) {
    this.loginService.ssoCallback(code).subscribe({
      next: (response: LoginResponse) => {
        this.authService.setAuthToken(response.tokenType, response.token, response.refreshToken);
        this.mostrarMensaje('¡Inicio de sesión SSO exitoso!');
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
