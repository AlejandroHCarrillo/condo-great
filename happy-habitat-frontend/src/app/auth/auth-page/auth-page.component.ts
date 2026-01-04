import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NotificationContainerComponent } from '../../shared/components/notification-container/notification-container.component';

@Component({
  selector: 'hh-auth-page',
  imports: [RouterOutlet, NotificationContainerComponent],
  templateUrl: './auth-page.component.html',
  styleUrl: './auth-page.component.css'
})
export class AuthPageComponent {

}
