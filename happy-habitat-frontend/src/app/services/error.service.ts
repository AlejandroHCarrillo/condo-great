import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { LoggerService } from './logger.service';
import { AppError, ErrorType, ErrorSeverity, ErrorHandlingOptions, ErrorNotification } from '../shared/interfaces/error.interface';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root'
})
export class ErrorService {
  private logger = inject(LoggerService);
  private router = inject(Router);
  private notificationService = inject(NotificationService);

  // Signal para tracking de errores activos
  activeErrors = signal<ErrorNotification[]>([]);
  
  // Configuración por defecto
  private defaultOptions: ErrorHandlingOptions = {
    showNotification: true,
    logError: true,
    retryable: false
  };

  /**
   * Maneja un error de forma centralizada
   */
  handleError(error: any, options: Partial<ErrorHandlingOptions> = {}): AppError {
    // Usar el contexto de las opciones si está disponible
    const context = options.context;
    const appError = this.normalizeError(error, context);
    const finalOptions = { ...this.defaultOptions, ...options };

    // Loggear el error
    if (finalOptions.logError) {
      this.logger.error(
        appError.message,
        appError.originalError,
        appError.context || context || 'ErrorService',
        {
          type: appError.type,
          severity: appError.severity,
          code: appError.code,
          metadata: appError.metadata
        }
      );
    }

    // Mostrar notificación al usuario
    if (finalOptions.showNotification && appError.userMessage) {
      this.showErrorNotification(appError);
    }

    // Agregar a errores activos
    this.addActiveError(appError);

    // Ejecutar handler personalizado si existe
    if (finalOptions.customHandler) {
      finalOptions.customHandler(appError);
    }

    // Redirección si está configurada
    if (finalOptions.redirectTo) {
      this.router.navigate([finalOptions.redirectTo]);
    }

    return appError;
  }

  /**
   * Normaliza diferentes tipos de errores a AppError
   */
  normalizeError(error: any, context?: string): AppError {
    // Si ya es un AppError, retornarlo
    if (error && error.type && error.severity) {
      return error as AppError;
    }

    // Error HTTP
    if (error instanceof HttpErrorResponse) {
      return this.normalizeHttpError(error, context);
    }

    // Error de JavaScript
    if (error instanceof Error) {
      return {
        type: ErrorType.UNKNOWN,
        severity: ErrorSeverity.MEDIUM,
        message: error.message,
        userMessage: this.getUserFriendlyMessage(ErrorType.UNKNOWN),
        originalError: error,
        context,
        stack: error.stack,
        timestamp: new Date()
      };
    }

    // Error genérico
    return {
      type: ErrorType.UNKNOWN,
      severity: ErrorSeverity.MEDIUM,
      message: String(error),
      userMessage: 'Ha ocurrido un error inesperado. Por favor, intenta nuevamente.',
      originalError: error,
      context,
      timestamp: new Date()
    };
  }

  /**
   * Normaliza errores HTTP
   */
  private normalizeHttpError(error: HttpErrorResponse, context?: string): AppError {
    const status = error.status;
    let type: ErrorType;
    let severity: ErrorSeverity;
    let userMessage: string;

    switch (status) {
      case 400:
        type = ErrorType.VALIDATION;
        severity = ErrorSeverity.LOW;
        userMessage = this.getValidationErrorMessage(error);
        break;
      case 401:
        type = ErrorType.UNAUTHORIZED;
        severity = ErrorSeverity.HIGH;
        userMessage = 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.';
        break;
      case 403:
        type = ErrorType.FORBIDDEN;
        severity = ErrorSeverity.HIGH;
        userMessage = 'No tienes permisos para realizar esta acción.';
        break;
      case 404:
        type = ErrorType.NOT_FOUND;
        severity = ErrorSeverity.MEDIUM;
        userMessage = 'El recurso solicitado no fue encontrado.';
        break;
      case 422:
        type = ErrorType.VALIDATION;
        severity = ErrorSeverity.LOW;
        userMessage = this.getValidationErrorMessage(error);
        break;
      case 429:
        type = ErrorType.HTTP;
        severity = ErrorSeverity.MEDIUM;
        userMessage = 'Demasiadas solicitudes. Por favor, espera un momento e intenta nuevamente.';
        break;
      case 500:
      case 502:
      case 503:
      case 504:
        type = ErrorType.SERVER;
        severity = ErrorSeverity.HIGH;
        userMessage = 'Error en el servidor. Por favor, intenta más tarde.';
        break;
      default:
        if (status >= 500) {
          type = ErrorType.SERVER;
          severity = ErrorSeverity.HIGH;
        } else {
          type = ErrorType.HTTP;
          severity = ErrorSeverity.MEDIUM;
        }
        userMessage = this.getUserFriendlyMessage(type);
    }

    return {
      type,
      severity,
      message: error.message || `HTTP ${status} ${error.statusText}`,
      userMessage,
      code: status,
      originalError: error,
      context: context || 'HTTP',
      timestamp: new Date(),
      metadata: {
        url: error.url,
        status: error.status,
        statusText: error.statusText,
        error: error.error
      }
    };
  }

  /**
   * Obtiene mensaje de error de validación del response
   */
  private getValidationErrorMessage(error: HttpErrorResponse): string {
    const errorBody = error.error;
    
    if (errorBody?.message) {
      return errorBody.message;
    }
    
    if (errorBody?.errors && Array.isArray(errorBody.errors)) {
      return errorBody.errors.join(', ');
    }
    
    if (errorBody?.errors && typeof errorBody.errors === 'object') {
      const messages = Object.values(errorBody.errors).flat() as string[];
      return messages.join(', ');
    }
    
    return 'Los datos proporcionados no son válidos. Por favor, verifica e intenta nuevamente.';
  }

  /**
   * Obtiene mensaje amigable para el usuario según el tipo de error
   */
  private getUserFriendlyMessage(type: ErrorType): string {
    const messages: { [key in ErrorType]: string } = {
      [ErrorType.HTTP]: 'Error al procesar la solicitud. Por favor, intenta nuevamente.',
      [ErrorType.VALIDATION]: 'Los datos proporcionados no son válidos.',
      [ErrorType.BUSINESS]: 'No se puede completar la operación solicitada.',
      [ErrorType.NETWORK]: 'Error de conexión. Verifica tu conexión a internet.',
      [ErrorType.UNAUTHORIZED]: 'No estás autenticado. Por favor, inicia sesión.',
      [ErrorType.FORBIDDEN]: 'No tienes permisos para realizar esta acción.',
      [ErrorType.NOT_FOUND]: 'El recurso solicitado no fue encontrado.',
      [ErrorType.SERVER]: 'Error en el servidor. Por favor, intenta más tarde.',
      [ErrorType.UNKNOWN]: 'Ha ocurrido un error inesperado. Por favor, intenta nuevamente.'
    };
    
    return messages[type] || messages[ErrorType.UNKNOWN];
  }

  /**
   * Muestra notificación de error
   */
  private showErrorNotification(error: AppError): void {
    this.notificationService.showError(
      error.userMessage || error.message,
      this.getNotificationTitle(error)
    );
  }

  /**
   * Obtiene el título de la notificación según la severidad
   */
  private getNotificationTitle(error: AppError): string {
    const titles: { [key in ErrorSeverity]: string } = {
      [ErrorSeverity.LOW]: 'Advertencia',
      [ErrorSeverity.MEDIUM]: 'Error',
      [ErrorSeverity.HIGH]: 'Error Importante',
      [ErrorSeverity.CRITICAL]: 'Error Crítico'
    };
    
    return titles[error.severity] || 'Error';
  }

  /**
   * Agrega error a la lista de errores activos
   */
  private addActiveError(error: AppError): void {
    const notification: ErrorNotification = {
      id: this.generateErrorId(),
      error,
      timestamp: new Date(),
      dismissed: false
    };

    this.activeErrors.update(errors => {
      // Mantener solo los últimos 20 errores
      return [notification, ...errors].slice(0, 20);
    });
  }

  /**
   * Genera un ID único para el error
   */
  private generateErrorId(): string {
    return `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Descartar un error
   */
  dismissError(errorId: string): void {
    this.activeErrors.update(errors =>
      errors.map(err => err.id === errorId ? { ...err, dismissed: true } : err)
    );
  }

  /**
   * Limpiar todos los errores descartados
   */
  clearDismissedErrors(): void {
    this.activeErrors.update(errors => errors.filter(err => !err.dismissed));
  }

  /**
   * Obtener el último error
   */
  getLastError(): AppError | null {
    const errors = this.activeErrors();
    return errors.length > 0 ? errors[0].error : null;
  }

  /**
   * Verificar si hay errores activos
   */
  hasActiveErrors(): boolean {
    return this.activeErrors().some(err => !err.dismissed);
  }
}

