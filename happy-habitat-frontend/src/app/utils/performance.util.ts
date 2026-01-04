import { LoggerService } from '../services/logger.service';

/**
 * Clase para medir performance de operaciones
 */
export class PerformanceMonitor {
  private startTime: number = 0;
  private operationName: string;
  private logger: LoggerService;
  private context?: string;

  constructor(operationName: string, logger: LoggerService, context?: string) {
    this.operationName = operationName;
    this.logger = logger;
    this.context = context;
    this.start();
  }

  start(): void {
    this.startTime = performance.now();
  }

  end(data?: any): number {
    const duration = performance.now() - this.startTime;
    
    this.logger.performance(
      this.operationName,
      duration,
      this.context,
      data
    );

    return duration;
  }

  mark(label: string): void {
    const elapsed = performance.now() - this.startTime;
    this.logger.debug(
      `Performance mark: ${this.operationName} - ${label}`,
      this.context,
      { elapsed, mark: label }
    );
  }
}

/**
 * Decorador para medir performance de métodos
 */
export function MeasurePerformance(context?: string) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    const className = target.constructor.name;
    const logContext = context || className;

    descriptor.value = function (...args: any[]) {
      const logger = new LoggerService();
      const monitor = new PerformanceMonitor(
        `${className}.${propertyName}`,
        logger,
        logContext
      );

      try {
        const result = method.apply(this, args);
        
        // Si es promesa, medir cuando se complete
        if (result instanceof Promise) {
          result
            .then((res) => {
              monitor.end({ success: true });
              return res;
            })
            .catch((error) => {
              monitor.end({ success: false, error: error.message });
              throw error;
            });
        } else {
          monitor.end({ success: true });
        }
        
        return result;
      } catch (error) {
        monitor.end({ success: false, error: (error as Error).message });
        throw error;
      }
    };

    return descriptor;
  };
}

/**
 * Función helper para medir performance de operaciones
 */
export function measurePerformance<T>(
  operationName: string,
  logger: LoggerService,
  fn: () => T,
  context?: string
): T {
  const monitor = new PerformanceMonitor(operationName, logger, context);
  try {
    const result = fn();
    monitor.end({ success: true });
    return result;
  } catch (error) {
    monitor.end({ success: false, error: (error as Error).message });
    throw error;
  }
}

/**
 * Función helper para medir performance de operaciones async
 */
export async function measurePerformanceAsync<T>(
  operationName: string,
  logger: LoggerService,
  fn: () => Promise<T>,
  context?: string
): Promise<T> {
  const monitor = new PerformanceMonitor(operationName, logger, context);
  try {
    const result = await fn();
    monitor.end({ success: true });
    return result;
  } catch (error) {
    monitor.end({ success: false, error: (error as Error).message });
    throw error;
  }
}

