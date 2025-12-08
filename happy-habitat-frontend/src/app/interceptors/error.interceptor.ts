import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ErrorService } from '../services/error.service';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const errorService = inject(ErrorService);
  const router = inject(Router);
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Normalizar el error
      const appError = errorService.normalizeError(error, 'HTTP');

      // Manejar errores específicos
      switch (error.status) {
        case 401:
          // Si es 401 y no estamos en la página de login, redirigir
          if (!router.url.includes('/auth/login')) {
            errorService.handleError(error, {
              showNotification: true,
              redirectTo: '/auth/login',
              logError: true
            });
            authService.logout();
          } else {
            // Si estamos en login, solo mostrar el error sin redirigir
            errorService.handleError(error, {
              showNotification: true,
              logError: true
            });
          }
          break;

        case 403:
          errorService.handleError(error, {
            showNotification: true,
            logError: true
          });
          break;

        case 404:
          // Para 404, solo loggear, no mostrar notificación (puede ser muy molesto)
          errorService.handleError(error, {
            showNotification: false,
            logError: true
          });
          break;

        case 422:
        case 400:
          // Errores de validación - mostrar notificación
          errorService.handleError(error, {
            showNotification: true,
            logError: true
          });
          break;

        case 429:
          // Rate limiting - mostrar notificación
          errorService.handleError(error, {
            showNotification: true,
            logError: true
          });
          break;

        case 500:
        case 502:
        case 503:
        case 504:
          // Errores del servidor - mostrar notificación
          errorService.handleError(error, {
            showNotification: true,
            logError: true
          });
          break;

        default:
          // Otros errores HTTP
          if (error.status >= 500) {
            errorService.handleError(error, {
              showNotification: true,
              logError: true
            });
          } else {
            // Errores 4xx que no son críticos
            errorService.handleError(error, {
              showNotification: false,
              logError: true
            });
          }
      }

      // Propagar el error para que los componentes puedan manejarlo si es necesario
      return throwError(() => error);
    })
  );
};

