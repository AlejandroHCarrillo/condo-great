import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { AuthPageComponent } from './auth-page/auth-page.component';
import { authGuard } from '../guards/auth.guard';

/**
 * Rutas de autenticación con layout propio (AuthPageComponent)
 * Estas rutas se cargan de forma lazy desde /auth en app.routes.ts
 * 
 * Estructura:
 * - /auth → AuthPageComponent (layout sin header/menu/footer)
 *   - /auth/login → LoginComponent (se muestra dentro del router-outlet de AuthPageComponent)
 *   - /auth/register → RegisterComponent (se muestra dentro del router-outlet de AuthPageComponent)
 *   - /auth/forgot-password → ForgotPasswordComponent (se muestra dentro del router-outlet de AuthPageComponent)
 *   - /auth/reset-password → ResetPasswordComponent (se muestra dentro del router-outlet de AuthPageComponent) - Requiere autenticación
 */
export const authRoutes: Routes = [
    {
        path: '', // Corresponde a /auth cuando se carga desde app.routes.ts
        component: AuthPageComponent, // Layout de autenticación (sin header/menu/footer)
        children: [
            {
                path: 'login', // /auth/login
                component: LoginComponent
            },
            {
                path: 'register', // /auth/register
                component: RegisterComponent
            },
            {
                path: 'forgot-password', // /auth/forgot-password
                component: ForgotPasswordComponent
            },
            {
                path: 'reset-password', // /auth/reset-password - Requiere autenticación
                component: ResetPasswordComponent,
                canActivate: [authGuard]
            },
            {
                path: '', // /auth → redirige a /auth/login
                redirectTo: 'login',
                pathMatch: 'full'
            },
            {
                path: '**', // Cualquier otra ruta en /auth/* → redirige a /auth/login
                redirectTo: 'login'
            }
        ]
    }
];

export default authRoutes;