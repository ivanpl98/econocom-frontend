import { Component, inject, Output , EventEmitter} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, NonNullableFormBuilder, Validators } from '@angular/forms';

import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatButtonModule } from "@angular/material/button";
import { MatDialog, MatDialogModule } from "@angular/material/dialog";

import { LoginFormFooterComponent } from "./footer/login-form-footer.component";
import { LoginCredentials } from 'src/app/core/models/login-credentials';
import { RegisterModalComponent } from '../register-modal/register-modal/register-modal.component';

/**
 * Componente visual que renderiza el formulario de inicio de sesión.
 * Utiliza Angular Material para los estilos de los inputs y botones.
 * Al estar diseñado como un componente "tonto" (dumb component), 
 * emite eventos en lugar de comunicarse directamente con servicios.
 */
@Component({
  selector: 'app-login-form',
  standalone: true,
  imports: [CommonModule,
    LoginFormFooterComponent,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    RegisterModalComponent,
    MatDialogModule],
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.scss']
})
export class LoginFormComponent {

  private fb = inject(NonNullableFormBuilder);
  private dialog = inject(MatDialog);

  // Eventos emitidos hacia el componente padre (LoginPageComponent)
  @Output() formSubmit = new EventEmitter<LoginCredentials>();
  @Output() ssoLoginClick = new EventEmitter<void>();
  @Output() registerClick = new EventEmitter<LoginCredentials>();

  // Definición reactiva del formulario con validaciones correspondientes
  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  /**
   * Se ejecuta al pulsar el botón principal del formulario.
   * Valida los campos y, si es correcto, emite las credenciales al padre.
   */
  onSubmit() {
    if (this.loginForm.valid) {
      const credentials: LoginCredentials = this.loginForm.getRawValue();
      this.formSubmit.emit(credentials);
    } else {
      // Si el formulario es inválido, marcamos los campos como tocados
      // para forzar la aparición visual de los errores de Material.
      this.loginForm.markAllAsTouched();
    }
  }

  /**
   * Notifica al componente padre que se desea acceder mediante SSO.
   */
  onSsoLogin() {
    this.ssoLoginClick.emit();
  }

  /**
   * Abre el modal (ventana emergente) de registro delegándolo a Angular Material Dialog.
   * Si el usuario se registra dentro del modal, emite un evento con sus datos.
   */
  abrirModalRegistro() {
    const dialogRef = this.dialog.open(RegisterModalComponent, {
      width: '400px', // Le damos un ancho elegante
      disableClose: false // Permite cerrar haciendo clic fuera
    });

    // Nos suscribimos al evento que se emite cuando el modal se cierra
    dialogRef.afterClosed().subscribe(datosRegistro => {
      if (datosRegistro) {
        console.log('Datos recibidos del modal de registro:', datosRegistro);
        this.registerClick.emit(datosRegistro);
      }
    });
  }
}
