import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard = (allowedRoles: string[]): CanActivateFn => {
  return (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    console.log('[RoleGuard] Checking route:', state.url);
    console.log('[RoleGuard] Allowed roles:', allowedRoles);

    // Primero verificar autenticación
    if (!authService.checkAuth()) {
      console.log('[RoleGuard] User not authenticated, redirecting to login');
      router.navigate(['/auth/login'], { 
        queryParams: { returnUrl: state.url } 
      });
      return false;
    }

    const user = authService.currentUser();
    console.log('[RoleGuard] Current user:', user);
    console.log('[RoleGuard] User role:', user?.role);

    // Verificar roles
    if (authService.hasAnyRole(allowedRoles)) {
      console.log('[RoleGuard] User has required role, allowing access');
      return true;
    }

    // Si no tiene el rol necesario, redirigir a home o mostrar error
    console.log('[RoleGuard] User does not have required role, redirecting to home');
    router.navigate(['/home']);
    return false;
  };
};

