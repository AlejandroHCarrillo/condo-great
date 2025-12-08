import { Component, input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, Notification, NotificationType } from '../../../services/notification.service';

@Component({
  selector: 'hh-notification',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification.component.html',
  styleUrl: './notification.component.css'
})
export class NotificationComponent {
  notification = input.required<Notification>();
  private notificationService = inject(NotificationService);

  NotificationType = NotificationType;

  dismiss(): void {
    this.notificationService.dismiss(this.notification().id);
  }

  getIconClass(): string {
    switch (this.notification().type) {
      case NotificationType.SUCCESS:
        return 'fa-circle-check';
      case NotificationType.ERROR:
        return 'fa-circle-xmark';
      case NotificationType.WARNING:
        return 'fa-triangle-exclamation';
      case NotificationType.INFO:
        return 'fa-circle-info';
      default:
        return 'fa-circle-info';
    }
  }

  getAlertClass(): string {
    switch (this.notification().type) {
      case NotificationType.SUCCESS:
        return 'alert-success';
      case NotificationType.ERROR:
        return 'alert-error';
      case NotificationType.WARNING:
        return 'alert-warning';
      case NotificationType.INFO:
        return 'alert-info';
      default:
        return 'alert-info';
    }
  }
}

