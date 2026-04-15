import { Routes } from '@angular/router';
import { LoginPageComponent } from './features/login/pages/login-page.component';


export const routes: Routes = [
    {
        path: '',
        component: LoginPageComponent
    },
    {
        path: 'login',
        component: LoginPageComponent
    }
];