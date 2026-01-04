import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../../services/notification.service';
import { NotificationComponent } from '../notification/notification.component';

@Component({
  selector: 'hh-notification-container',
  standalone: true,
  imports: [CommonModule, NotificationComponent],
  templateUrl: './notification-container.component.html',
  styleUrl: './notification-container.component.css'
})
export class NotificationContainerComponent {
  private notificationService = inject(NotificationService);
  
  notifications = this.notificationService.notifications;
}

