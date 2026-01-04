import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { inject } from '@angular/core';
import { LoggerService } from './app/services/logger.service';

// Configurar manejo de errores globales
window.addEventListener('error', (event) => {
  // El GlobalErrorHandler se encargará de esto, pero también lo capturamos aquí
  console.error('Global error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  // Capturar promesas rechazadas no manejadas
  console.error('Unhandled promise rejection:', event.reason);
});

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => {
    console.error('Bootstrap error:', err);
  });
