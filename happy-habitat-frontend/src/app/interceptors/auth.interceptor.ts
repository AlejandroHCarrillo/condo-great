import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { SessionService } from '../services/session.service';
import { Router } from '@angular/router';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const sessionService = inject(SessionService);
  const router = inject(Router);

  // Obtener el token
  const token = sessionService.getToken();

  // Si hay token, agregarlo al header
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  // Continuar con la petición
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Si el error es 401 (Unauthorized), intentar refrescar el token
      if (error.status === 401 && token && sessionService.getRefreshToken()) {
        // Intentar refrescar el token solo si hay refresh token disponible
        return authService.refreshToken().pipe(
          switchMap((authResponse) => {
            // Reintentar la petición original con el nuevo token
            const newToken = sessionService.getToken();
            if (newToken) {
              req = req.clone({
                setHeaders: {
                  Authorization: `Bearer ${newToken}`
                }
              });
              return next(req);
            }
            return throwError(() => error);
          }),
          catchError((refreshError) => {
            // Si falla el refresh, cerrar sesión
            authService.logout();
            router.navigate(['/auth/login']);
            return throwError(() => refreshError);
          })
        );
      }

      // Si es 401 pero no hay refresh token, cerrar sesión directamente
      if (error.status === 401 && token) {
        authService.logout();
        router.navigate(['/auth/login']);
      }

      // Para otros errores, simplemente propagar el error
      return throwError(() => error);
    })
  );
};

