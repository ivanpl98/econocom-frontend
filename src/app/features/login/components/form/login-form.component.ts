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

  @Output() formSubmit = new EventEmitter<LoginCredentials>();
  @Output() ssoLoginClick = new EventEmitter<void>();
  @Output() registerClick = new EventEmitter<LoginCredentials>();

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  onSubmit() {
    if (this.loginForm.valid) {
      const credentials: LoginCredentials = this.loginForm.getRawValue();
      this.formSubmit.emit(credentials);
    } else {
      this.loginForm.markAllAsTouched();
    }
  }

  onSsoLogin() {
    this.ssoLoginClick.emit();
  }

  abrirModalRegistro() {
    const dialogRef = this.dialog.open(RegisterModalComponent, {
      width: '400px', // Le damos un ancho elegante
      disableClose: false // Permite cerrar haciendo clic fuera
    });

    dialogRef.afterClosed().subscribe(datosRegistro => {
      if (datosRegistro) {
        console.log('Datos recibidos del modal de registro:', datosRegistro);
        this.registerClick.emit(datosRegistro);
      }
    });
  }
}
