import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { inject } from '@angular/core';
import { LoggerService } from './app/services/logger.service';

// Detectar fallo de carga de chunks (p. ej. tras reinicio del dev server o nueva versión)
function isChunkLoadError(error: unknown): boolean {
  const message = typeof error === 'object' && error && 'message' in error
    ? String((error as { message: string }).message)
    : String(error);
  return /Failed to fetch dynamically imported module|Loading chunk \d+ failed|Loading CSS chunk \d+ failed/i.test(message);
}

window.addEventListener('error', (event) => {
  if (isChunkLoadError(event.error)) {
    event.preventDefault();
    window.location.reload();
    return;
  }
  console.error('Global error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  if (isChunkLoadError(event.reason)) {
    event.preventDefault();
    window.location.reload();
    return;
  }
  console.error('Unhandled promise rejection:', event.reason);
});

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => {
    console.error('Bootstrap error:', err);
  });
