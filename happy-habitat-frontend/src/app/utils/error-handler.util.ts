import { ErrorHandler, Injectable, inject } from '@angular/core';
import { LoggerService } from '../services/logger.service';
import { ErrorService } from '../services/error.service';
import { PartialErrorHandlerOptions } from './error-handler-options.interface';

/**
 * Error Handler global para capturar errores no manejados
 */
@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private logger = inject(LoggerService);
  private errorService = inject(ErrorService);

  handleError(error: Error | any): void {
    // Recuperación ante fallo de carga de chunk (versión antigua en caché o dev server reiniciado)
    const message = error?.message ?? String(error);
    if (/Failed to fetch dynamically imported module|Loading chunk \d+ failed|Loading CSS chunk \d+ failed/i.test(message)) {
      typeof window !== 'undefined' && window.location.reload();
      return;
    }

    // Opciones de manejo de error con toda la información necesaria
    const errorHandlerOptions: PartialErrorHandlerOptions = {
      showNotification: true,
      logError: true,
      context: 'GlobalErrorHandler',
      metadata: {
        url: typeof window !== 'undefined' ? window.location.href : undefined,
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined
      }
    };

    // Usar el servicio de errores para manejar el error de forma centralizada
    const appError = this.errorService.handleError(error, errorHandlerOptions);

    // Loggear el error con contexto adicional usando la metadata de las opciones
    this.logger.exception(error, errorHandlerOptions.context || 'GlobalErrorHandler', {
      ...errorHandlerOptions.metadata,
      errorType: appError.type,
      severity: appError.severity
    });

    // Aquí puedes agregar lógica adicional como:
    // - Enviar a un servicio de monitoreo (Sentry, LogRocket, etc.)
    // - Reportar error al servidor
    // if (appError.severity === ErrorSeverity.CRITICAL) {
    //   // Enviar a servicio de monitoreo
    // }
  }
}

/**
 * Función helper para manejar errores de forma consistente
 * @param logger - Servicio de logging
 * @param context - Contexto donde ocurrió el error
 * @returns Función que maneja el error
 */
export function handleError(logger: LoggerService, context: string) {
  return (error: any) => {
    logger.error(
      `Error in ${context}`,
      error,
      context
    );
    throw error;
  };
}

/**
 * Wrapper para funciones async con manejo de errores
 * @param logger - Servicio de logging
 * @param context - Contexto donde ocurrió el error
 * @param fn - Función async a ejecutar
 * @returns Resultado de la función o lanza el error
 */
export async function withErrorHandling<T>(
  logger: LoggerService,
  context: string,
  fn: () => Promise<T>
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    logger.error(
      `Error in ${context}`,
      error,
      context
    );
    throw error;
  }
}

