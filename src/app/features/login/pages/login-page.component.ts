import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginBannerComponent } from "../components/banner/login-banner.component";
import { LoginFormComponent } from "../components/form/login-form.component";

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, LoginBannerComponent, LoginFormComponent],
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss']
})
export class LoginPageComponent {

}
