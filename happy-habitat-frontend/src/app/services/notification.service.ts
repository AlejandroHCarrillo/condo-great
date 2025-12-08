import { Injectable, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

export enum NotificationType {
  SUCCESS = 'success',
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info'
}

export interface Notification {
  id: string;
  type: NotificationType;
  title?: string;
  message: string;
  duration?: number; // Duración en ms, 0 = permanente
  timestamp: Date;
  dismissed: boolean;
  action?: {
    label: string;
    handler: () => void;
  };
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  // Signal para las notificaciones activas
  notifications = signal<Notification[]>([]);
  
  // Duración por defecto (5 segundos)
  private defaultDuration = 5000;

  /**
   * Muestra una notificación de éxito
   */
  showSuccess(message: string, title?: string, duration?: number): string {
    return this.show(NotificationType.SUCCESS, message, title, duration);
  }

  /**
   * Muestra una notificación de error
   */
  showError(message: string, title?: string, duration?: number): string {
    return this.show(NotificationType.ERROR, message, title, duration || 0); // Errores no se auto-descartan
  }

  /**
   * Muestra una notificación de advertencia
   */
  showWarning(message: string, title?: string, duration?: number): string {
    return this.show(NotificationType.WARNING, message, title, duration);
  }

  /**
   * Muestra una notificación de información
   */
  showInfo(message: string, title?: string, duration?: number): string {
    return this.show(NotificationType.INFO, message, title, duration);
  }

  /**
   * Muestra una notificación genérica
   */
  show(
    type: NotificationType,
    message: string,
    title?: string,
    duration?: number
  ): string {
    const id = this.generateId();
    const notification: Notification = {
      id,
      type,
      title,
      message,
      duration: duration !== undefined ? duration : this.defaultDuration,
      timestamp: new Date(),
      dismissed: false
    };

    // Agregar a la lista
    this.notifications.update(notifications => [notification, ...notifications]);

    // Auto-descartar si tiene duración
    if (notification.duration && notification.duration > 0) {
      setTimeout(() => {
        this.dismiss(id);
      }, notification.duration);
    }

    return id;
  }

  /**
   * Descartar una notificación
   */
  dismiss(id: string): void {
    this.notifications.update(notifications =>
      notifications.map(notif =>
        notif.id === id ? { ...notif, dismissed: true } : notif
      )
    );

    // Limpiar después de la animación
    setTimeout(() => {
      this.notifications.update(notifications =>
        notifications.filter(notif => notif.id !== id)
      );
    }, 300);
  }

  /**
   * Descartar todas las notificaciones
   */
  dismissAll(): void {
    this.notifications().forEach(notif => this.dismiss(notif.id));
  }

  /**
   * Genera un ID único
   */
  private generateId(): string {
    return `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

