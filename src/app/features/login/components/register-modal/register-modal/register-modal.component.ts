import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { ReactiveFormsModule, NonNullableFormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatButtonModule } from "@angular/material/button";

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
  private dialogRef = inject(MatDialogRef<RegisterModalComponent>);

  registerForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  onSubmit() {
    if (this.registerForm.valid) {
      this.dialogRef.close(this.registerForm.getRawValue());
    } else {
      this.registerForm.markAllAsTouched();
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
}
