import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { ReactiveFormsModule, NonNullableFormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatButtonModule } from "@angular/material/button";

/**
 * Componente que representa la ventana modal para el registro de nuevos usuarios.
 * Muestra un formulario para introducir un email y una contraseña.
 */
@Component({
  selector: 'app-register-modal',
  standalone: true,
  imports: [CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDialogModule,
    ReactiveFormsModule],
  templateUrl: './register-modal.component.html',
  styleUrls: ['./register-modal.component.scss']
})
export class RegisterModalComponent {

  private fb = inject(NonNullableFormBuilder);
  // Referencia a esta misma ventana modal para poder cerrarla y devolver datos
  private dialogRef = inject(MatDialogRef<RegisterModalComponent>);

  // Formulario reactivo para el registro
  registerForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  /**
   * Valida el formulario y, si es correcto, cierra el modal retornando
   * los datos introducidos (email y password) al componente que lo abrió.
   */
  onSubmit() {
    if (this.registerForm.valid) {
      this.dialogRef.close(this.registerForm.getRawValue());
    } else {
      // Forzamos la validación visual si el formulario es inválido
      this.registerForm.markAllAsTouched();
    }
  }

  /**
   * Cierra el modal sin realizar ninguna acción.
   */
  onCancel() {
    this.dialogRef.close();
  }
}
