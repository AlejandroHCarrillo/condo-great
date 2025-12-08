import { inject } from '@angular/core';
import { LoggerService } from '../services/logger.service';

// Cache para instancias de logger
let loggerInstance: LoggerService | null = null;

function getLogger(): LoggerService {
  if (!loggerInstance) {
    // Intentar obtener del injector si está disponible
    try {
      loggerInstance = inject(LoggerService, { optional: true }) || new LoggerService();
    } catch {
      loggerInstance = new LoggerService();
    }
  }
  return loggerInstance;
}

/**
 * Decorador para logging automático de métodos
 * 
 * @example
 * ```typescript
 * class MyService {
 *   @LogMethod('MyService')
 *   myMethod(param: string) {
 *     // ...
 *   }
 * }
 * ```
 */
export function LogMethod(context?: string) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    const className = target.constructor.name;
    const logContext = context || className;

    descriptor.value = function (...args: any[]) {
      const logger = getLogger();
      const startTime = Date.now();
      
      // Log de inicio
      logger.debug(
        `Method called: ${className}.${propertyName}`,
        logContext,
        { args: sanitizeArgs(args) }
      );

      try {
        const result = method.apply(this, args);
        
        // Si es una promesa, loggear cuando se resuelva
        if (result && typeof result.then === 'function') {
          return result
            .then((res: any) => {
              const duration = Date.now() - startTime;
              logger.debug(
                `Method completed: ${className}.${propertyName} (${duration}ms)`,
                logContext,
                { duration, result: sanitizeResult(res) }
              );
              return res;
            })
            .catch((error: any) => {
              const duration = Date.now() - startTime;
              logger.error(
                `Method failed: ${className}.${propertyName} (${duration}ms)`,
                error,
                logContext,
                { duration }
              );
              throw error;
            });
        } else {
          // Si no es promesa, loggear inmediatamente
          const duration = Date.now() - startTime;
          logger.debug(
            `Method completed: ${className}.${propertyName} (${duration}ms)`,
            logContext,
            { duration, result: sanitizeResult(result) }
          );
        }
        
        return result;
      } catch (error) {
        const duration = Date.now() - startTime;
        logger.error(
          `Method error: ${className}.${propertyName} (${duration}ms)`,
          error as Error,
          logContext,
          { duration }
        );
        throw error;
      }
    };

    return descriptor;
  };
}

/**
 * Decorador para logging de errores en métodos
 */
export function LogError(context?: string) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    const className = target.constructor.name;
    const logContext = context || className;

    descriptor.value = function (...args: any[]) {
      try {
        const result = method.apply(this, args);
        
        // Si es promesa, capturar errores
        if (result && typeof result.then === 'function') {
          return result.catch((error: any) => {
            const logger = getLogger();
            logger.error(
              `Method error: ${className}.${propertyName}`,
              error,
              logContext,
              { args: sanitizeArgs(args) }
            );
            throw error;
          });
        }
        
        return result;
      } catch (error) {
        const logger = getLogger();
        logger.error(
          `Method error: ${className}.${propertyName}`,
          error as Error,
          logContext,
          { args: sanitizeArgs(args) }
        );
        throw error;
      }
    };

    return descriptor;
  };
}

/**
 * Sanitiza argumentos para logging
 */
function sanitizeArgs(args: any[]): any {
  return args.map(arg => {
    if (arg instanceof Error) {
      return { error: arg.message, stack: arg.stack };
    }
    if (typeof arg === 'function') {
      return '[Function]';
    }
    if (arg && typeof arg === 'object') {
      try {
        JSON.stringify(arg);
        return arg;
      } catch {
        return '[Circular Reference]';
      }
    }
    return arg;
  });
}

/**
 * Sanitiza resultados para logging
 */
function sanitizeResult(result: any): any {
  if (result instanceof Error) {
    return { error: result.message };
  }
  if (typeof result === 'function') {
    return '[Function]';
  }
  if (result && typeof result === 'object') {
    try {
      const str = JSON.stringify(result);
      // Limitar tamaño del resultado loggeado
      if (str.length > 500) {
        return { _truncated: true, _size: str.length };
      }
      return result;
    } catch {
      return '[Circular Reference]';
    }
  }
  return result;
}

