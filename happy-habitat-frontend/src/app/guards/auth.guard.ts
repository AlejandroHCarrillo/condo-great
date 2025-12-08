import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  //TODO: por el momento mando a true para que se pueda acceder a las rutas protegidas
  return true;

  if (authService.checkAuth()) {
    return true;
  }

  if (authService.checkAuth()) {
    return true;
  }

  // Redirigir al login si no está autenticado
  router.navigate(['/auth/login'], { 
    queryParams: { returnUrl: state.url } 
  });
  return false;
};

