import { Component, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { UserInfo } from '../../../interfaces/user-info.interface';
import { RolesEnum } from '../../../enums/roles.enum';

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

  getRoleDisplayName(role: RolesEnum): string {
    const roleNames: { [key in RolesEnum]: string } = {
      [RolesEnum.SYSTEM_ADMIN]: 'Administrador del Sistema',
      [RolesEnum.ADMIN_COMPANY]: 'Administrador',
      [RolesEnum.COMITEE_MEMBER]: 'Miembro del Comité',
      [RolesEnum.RESIDENT]: 'Residente',
      [RolesEnum.TENANT]: 'Inquilino',
      [RolesEnum.VIGILANCE]: 'Vigilancia'
    };
    return roleNames[role] || role;
  }
}
