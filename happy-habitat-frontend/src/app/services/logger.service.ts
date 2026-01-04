import { Injectable, inject, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { LogLevel, LogEntry, LogConfig, LogContext } from '../shared/interfaces/log.interface';
import { SessionService } from './session.service';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class LoggerService {
  private sessionService = inject(SessionService);
  private http = inject(HttpClient);

  private logBuffer: LogEntry[] = [];
  private flushTimer?: ReturnType<typeof setInterval>;
  
  private config: LogConfig = {
    level: environment.logging?.level ?? (environment.production ? LogLevel.WARN : LogLevel.DEBUG),
    enableConsole: environment.logging?.enableConsole ?? true,
    enableRemote: environment.logging?.enableRemote ?? environment.production,
    remoteUrl: environment.apiUrl ? `${environment.apiUrl}/logs` : undefined,
    batchSize: 10,
    flushInterval: 30000, // 30 segundos
    enableStackTraces: environment.logging?.enableStackTraces ?? true,
    enableTimestamp: true,
    enableContext: true
  };

  // Signal para tracking de errores críticos
  criticalErrors = signal<LogEntry[]>([]);

  constructor() {
    // Iniciar flush automático si está habilitado el logging remoto
    if (this.config.enableRemote && this.config.flushInterval) {
      this.startAutoFlush();
    }
  }

  /**
   * Configura el servicio de logging
   */
  configure(config: Partial<LogConfig>): void {
    this.config = { ...this.config, ...config };
    
    // Reiniciar auto-flush si cambió la configuración
    if (this.config.enableRemote && this.config.flushInterval) {
      this.stopAutoFlush();
      this.startAutoFlush();
    }
  }

  /**
   * Log de nivel DEBUG
   */
  debug(message: string, context?: LogContext, data?: any): void {
    this.log(LogLevel.DEBUG, message, context, data);
  }

  /**
   * Log de nivel INFO
   */
  info(message: string, context?: LogContext, data?: any): void {
    this.log(LogLevel.INFO, message, context, data);
  }

  /**
   * Log de nivel WARN
   */
  warn(message: string, context?: LogContext, data?: any): void {
    this.log(LogLevel.WARN, message, context, data);
  }

  /**
   * Log de nivel ERROR
   */
  error(message: string, error?: Error | any, context?: LogContext, data?: any): void {
    const errorData = this.extractErrorData(error);
    const stack = error instanceof Error ? error.stack : undefined;
    
    const entry = this.createLogEntry(LogLevel.ERROR, message, context, { ...data, ...errorData }, stack);
    
    // Agregar a errores críticos
    this.criticalErrors.update(errors => {
      const updated = [entry, ...errors].slice(0, 50); // Mantener solo los últimos 50
      return updated;
    });

    this.processLog(entry);
  }

  /**
   * Log de excepciones no manejadas
   */
  exception(error: Error, context?: LogContext, data?: any): void {
    this.error(
      `Unhandled Exception: ${error.message}`,
      error,
      context,
      data
    );
  }

  /**
   * Log de eventos de usuario
   */
  event(eventName: string, properties?: { [key: string]: any }, context?: LogContext): void {
    this.info(`Event: ${eventName}`, context, properties);
  }

  /**
   * Log de performance
   */
  performance(operation: string, duration: number, context?: LogContext, data?: any): void {
    this.info(`Performance: ${operation}`, context, { duration, ...data });
  }

  /**
   * Método principal de logging
   */
  private log(level: LogLevel, message: string, context?: LogContext, data?: any): void {
    if (level < this.config.level) {
      return; // No loggear si el nivel es menor al configurado
    }

    const entry = this.createLogEntry(level, message, context, data);
    this.processLog(entry);
  }

  /**
   * Crea una entrada de log
   */
  private createLogEntry(
    level: LogLevel,
    message: string,
    context?: LogContext,
    data?: any,
    stack?: string
  ): LogEntry {
    const contextStr = this.formatContext(context);
    const user = this.sessionService.getUser();

    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: contextStr,
      data: this.sanitizeData(data),
      stack: this.config.enableStackTraces ? stack : undefined,
      userId: user?.id,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined
    };
  }

  /**
   * Procesa el log (consola y/o remoto)
   */
  private processLog(entry: LogEntry): void {
    // Log a consola
    if (this.config.enableConsole) {
      this.logToConsole(entry);
    }

    // Agregar al buffer para envío remoto
    if (this.config.enableRemote) {
      this.logBuffer.push(entry);
      
      // Flush si el buffer alcanza el tamaño máximo
      if (this.logBuffer.length >= (this.config.batchSize || 10)) {
        this.flush();
      }
    }
  }

  /**
   * Log a consola con formato
   */
  private logToConsole(entry: LogEntry): void {
    const style = this.getConsoleStyle(entry.level);
    const prefix = this.getLogPrefix(entry);
    
    const logMessage = `${prefix} ${entry.message}`;
    const logData = entry.data ? [entry.data] : [];
    const logContext = entry.context ? [`[${entry.context}]`] : [];

    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(`%c${logMessage}`, style, ...logContext, ...logData);
        break;
      case LogLevel.INFO:
        console.info(`%c${logMessage}`, style, ...logContext, ...logData);
        break;
      case LogLevel.WARN:
        console.warn(`%c${logMessage}`, style, ...logContext, ...logData);
        break;
      case LogLevel.ERROR:
        console.error(`%c${logMessage}`, style, ...logContext, ...logData);
        if (entry.stack) {
          console.error(entry.stack);
        }
        break;
    }
  }

  /**
   * Obtiene el prefijo del log
   */
  private getLogPrefix(entry: LogEntry): string {
    const parts: string[] = [];
    
    if (this.config.enableTimestamp) {
      const time = new Date(entry.timestamp).toLocaleTimeString();
      parts.push(`[${time}]`);
    }
    
    parts.push(`[${LogLevel[entry.level]}]`);
    
    return parts.join(' ');
  }

  /**
   * Obtiene el estilo de consola según el nivel
   */
  private getConsoleStyle(level: LogLevel): string {
    const styles: { [key: number]: string } = {
      [LogLevel.DEBUG]: 'color: #6c757d; font-weight: normal',
      [LogLevel.INFO]: 'color: #0d6efd; font-weight: normal',
      [LogLevel.WARN]: 'color: #ffc107; font-weight: bold',
      [LogLevel.ERROR]: 'color: #dc3545; font-weight: bold'
    };
    return styles[level] || '';
  }

  /**
   * Formatea el contexto
   */
  private formatContext(context?: LogContext): string | undefined {
    if (!context) return undefined;
    
    if (typeof context === 'string') {
      return context;
    }
    
    return Object.entries(context)
      .map(([key, value]) => `${key}:${value}`)
      .join(', ');
  }

  /**
   * Sanitiza los datos para evitar circular references
   */
  private sanitizeData(data: any): any {
    if (!data) return undefined;
    
    try {
      // Intentar serializar para detectar referencias circulares
      JSON.stringify(data);
      return data;
    } catch (error) {
      // Si hay referencia circular, crear una versión simplificada
      if (data instanceof Error) {
        return {
          name: data.name,
          message: data.message,
          stack: data.stack
        };
      }
      
      return { _error: 'Circular reference detected', _type: typeof data };
    }
  }

  /**
   * Extrae datos de un error
   */
  private extractErrorData(error: any): any {
    if (!error) return {};
    
    if (error instanceof Error) {
      return {
        errorName: error.name,
        errorMessage: error.message,
        errorStack: error.stack
      };
    }
    
    if (error?.error) {
      return {
        errorResponse: error.error,
        status: error.status,
        statusText: error.statusText,
        url: error.url
      };
    }
    
    return { error };
  }

  /**
   * Envía logs al servidor
   */
  flush(): void {
    if (!this.config.enableRemote || this.logBuffer.length === 0 || !this.config.remoteUrl) {
      return;
    }

    const logsToSend = [...this.logBuffer];
    this.logBuffer = [];

    this.http.post(this.config.remoteUrl, { logs: logsToSend }).subscribe({
      next: () => {
        // Logs enviados exitosamente
      },
      error: (error) => {
        // Si falla el envío, volver a agregar al buffer (solo los últimos para evitar overflow)
        this.logBuffer = [...logsToSend.slice(-5), ...this.logBuffer].slice(0, 50);
        console.warn('Failed to send logs to server', error);
      }
    });
  }

  /**
   * Inicia el flush automático
   */
  private startAutoFlush(): void {
    if (this.config.flushInterval) {
      this.flushTimer = setInterval(() => {
        this.flush();
      }, this.config.flushInterval);
    }
  }

  /**
   * Detiene el flush automático
   */
  private stopAutoFlush(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = undefined;
    }
  }

  /**
   * Limpia el buffer y envía logs pendientes
   */
  destroy(): void {
    this.stopAutoFlush();
    this.flush();
  }
}

