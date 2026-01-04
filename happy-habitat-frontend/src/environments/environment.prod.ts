import { LogLevel } from '../app/shared/interfaces/log.interface';

export const environment = {
  production: true,
  apiUrl: 'https://api.happyhabitat.com/api', // Cambiar según tu backend de producción
  apiVersion: 'v1',
  appName: 'Happy Habitat',
  appVersion: '0.0.0',
  // Configuración de logging
  logging: {
    level: LogLevel.WARN, // En producción, solo warnings y errores
    enableConsole: false, // No mostrar en consola en producción
    enableRemote: true, // Enviar logs al servidor en producción
    enableStackTraces: true
  },
  // Configuración de autenticación
  auth: {
    // En producción, siempre usar la API real
    useMockAuth: false
  }
};

