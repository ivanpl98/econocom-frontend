import { Component, inject, Output , EventEmitter} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, NonNullableFormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatButtonModule } from "@angular/material/button";

import { LoginFormFooterComponent } from "./footer/login-form-footer.component";
import { LoginCredentials } from 'src/app/core/models/login-credentials';

@Component({
  selector: 'app-login-form',
  standalone: true,
  imports: [CommonModule,
    LoginFormFooterComponent,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    RouterLink],
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.scss']
})
export class LoginFormComponent {

  private fb = inject(NonNullableFormBuilder);

  @Output() formSubmit = new EventEmitter<LoginCredentials>();
  @Output() ssoLoginClick = new EventEmitter<void>();

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
}
