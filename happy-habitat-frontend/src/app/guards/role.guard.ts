import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard = (allowedRoles: string[]): CanActivateFn => {
  return (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    // Primero verificar autenticación
    if (!authService.checkAuth()) {
      router.navigate(['/auth/login'], { 
        queryParams: { returnUrl: state.url } 
      });
      return false;
    }

    // Verificar roles
    if (authService.hasAnyRole(allowedRoles)) {
      return true;
    }

    // Si no tiene el rol necesario, redirigir a home o mostrar error
    router.navigate(['/home']);
    return false;
  };
};

