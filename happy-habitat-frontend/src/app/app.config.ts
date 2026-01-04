import { ApplicationConfig, provideZoneChangeDetection, ErrorHandler } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { authInterceptor } from './interceptors/auth.interceptor';
import { loggingInterceptor } from './interceptors/logging.interceptor';
import { errorInterceptor } from './interceptors/error.interceptor';
import { GlobalErrorHandler } from './utils/error-handler.util';


export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(routes),
    // HttpClient con interceptores (orden: logging, error, auth)
    provideHttpClient(
      withInterceptors([loggingInterceptor, errorInterceptor, authInterceptor])
    ),
    // Global Error Handler
    { provide: ErrorHandler, useClass: GlobalErrorHandler },
    // Hash strategy
    { provide: LocationStrategy, useClass:HashLocationStrategy }]
};
