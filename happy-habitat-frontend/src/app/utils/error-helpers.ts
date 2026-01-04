import { ErrorService } from '../services/error.service';
import { NotificationService } from '../services/notification.service';
import { AppError, ErrorHandlingOptions } from '../shared/interfaces/error.interface';
import { HttpErrorResponse } from '@angular/common/http';

/**
 * Helper para manejar errores de forma simple en componentes
 */
export class ErrorHelpers {
  /**
   * Maneja un error HTTP de forma simple
   */
  static handleHttpError(
    errorService: ErrorService,
    error: HttpErrorResponse,
    options?: Partial<ErrorHandlingOptions>
  ): AppError {
    return errorService.handleError(error, {
      showNotification: true,
      logError: true,
      ...options
    });
  }

  /**
   * Maneja un error genérico
   */
  static handleError(
    errorService: ErrorService,
    error: any,
    userMessage?: string,
    options?: Partial<ErrorHandlingOptions>
  ): AppError {
    return errorService.handleError(error, {
      showNotification: true,
      logError: true,
      ...options
    });
  }

  /**
   * Muestra un mensaje de error al usuario
   */
  static showError(
    notificationService: NotificationService,
    message: string,
    title: string = 'Error'
  ): void {
    notificationService.showError(message, title);
  }

  /**
   * Muestra un mensaje de éxito al usuario
   */
  static showSuccess(
    notificationService: NotificationService,
    message: string,
    title: string = 'Éxito'
  ): void {
    notificationService.showSuccess(message, title);
  }

  /**
   * Muestra un mensaje de advertencia al usuario
   */
  static showWarning(
    notificationService: NotificationService,
    message: string,
    title: string = 'Advertencia'
  ): void {
    notificationService.showWarning(message, title);
  }

  /**
   * Muestra un mensaje informativo al usuario
   */
  static showInfo(
    notificationService: NotificationService,
    message: string,
    title: string = 'Información'
  ): void {
    notificationService.showInfo(message, title);
  }
}

