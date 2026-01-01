import { LogLevel } from '../app/shared/interfaces/log.interface';

export const environment = {
  production: false,
  apiUrl: 'http://localhost:5080/api', // Backend: AIGreatBackend
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
    // Habilitar llamadas reales a la API del backend
    useMockAuth: false
  }
};

