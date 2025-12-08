import { Component, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { UserInfo } from '../../../interfaces/user-info.interface';

@Component({
  selector: 'hh-user-info',
  imports: [CommonModule, RouterLink],
  templateUrl: './user-info.component.html',
  styles: ``
})
export class UserInfoComponent {
  private authService = inject(AuthService);
  
  currentUser = this.authService.currentUser;

  constructor() {
    // Verificar autenticación al inicializar
    effect(() => {
      if (!this.authService.isAuthenticated()) {
        // Usuario no autenticado
      }
    });
  }

  logout(): void {
    this.authService.logout();
  }

  getRoleDisplayName(role: string): string {
    const roleNames: { [key: string]: string } = {
      'SYSTEM_ADMIN': 'Administrador del Sistema',
      'ADMIN_COMPANY': 'Administrador',
      'COMITEE_MEMBER': 'Miembro del Comité',
      'RESIDENT': 'Residente',
      'TENANT': 'Inquilino',
      'VIGILANCE': 'Vigilancia'
    };
    return roleNames[role] || role;
  }
}
