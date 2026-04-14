import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from "@angular/material/icon";
import { MatMenuModule } from "@angular/material/menu";

@Component({
  selector: 'app-login-form-footer',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatMenuModule],
  templateUrl: './login-form-footer.component.html',
  styleUrls: ['./login-form-footer.component.scss']
})
export class LoginFormFooterComponent {

}
