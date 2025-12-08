import { LogLevel } from '../app/shared/interfaces/log.interface';

export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api', // Cambiar según tu backend
  apiVersion: 'v1',
  appName: 'Happy Habitat',
  appVersion: '0.0.0',
  // Configuración de logging
  logging: {
    level: LogLevel.DEBUG, // En desarrollo, mostrar todos los logs
    enableConsole: true,
    enableRemote: false, // En desarrollo, no enviar logs remotos por defecto
    enableStackTraces: true
  },
  // Configuración de autenticación
  auth: {
    // TEMPORAL: Deshabilitar llamadas a la API de autenticación
    // Cambiar a false para habilitar las llamadas reales a la API
    useMockAuth: true
  }
};

