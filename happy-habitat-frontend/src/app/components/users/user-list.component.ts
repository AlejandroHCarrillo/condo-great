import { Component, inject, input, signal, computed, effect } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { GenericListComponent, ColumnConfig } from '../../shared/components/generic-list/generic-list.component';
import { Usuario } from '../../shared/interfaces/usuario-interface';
import { AuthService } from '../../services/auth.service';
import { UsersService } from '../../services/users.service';
import { RolesEnum } from '../../enums/roles.enum';
import { mapUserDtosToUsuarios } from '../../shared/mappers/user.mapper';
import { rxResource } from '../../utils/rx-resource.util';
import { catchError, of } from 'rxjs';
import { NotificationService } from '../../services/notification.service';
import { LoggerService } from '../../services/logger.service';

@Component({
  selector: 'app-user-list',
  imports: [GenericListComponent, FormsModule],
  templateUrl: './user-list.component.html',
  styles: ``
})
export class UserListComponent {
  router = inject(Router);
  authService = inject(AuthService);
  usersService = inject(UsersService);
  notificationService = inject(NotificationService);
  logger = inject(LoggerService);
  
  errorMessage = input<string|unknown|null|undefined>('');
  isEmpty = input<boolean|unknown|null|undefined>(false);

  // Usuario seleccionado para mostrar en el modal
  selectedUsuario: Usuario | null = null;

  // Obtener el usuario actual conectado
  currentUser = computed(() => this.authService.currentUser());

  // Signal para refrescar la lista de usuarios
  private refreshTrigger = signal(0);
  
  // Signal para controlar si mostrar usuarios inactivos
  showInactiveUsers = signal(false);
  
  // Resource para cargar todos los usuarios
  usersResource = rxResource({
    request: () => ({ refresh: this.refreshTrigger(), includeInactive: this.showInactiveUsers() }),
    loader: ({ request }) => {
      return this.usersService.getAllUsers(request.includeInactive).pipe(
        catchError((error) => {
          this.logger.error('Error loading users', error, 'UserListComponent');
          this.notificationService.showError(
            'Error al cargar los usuarios. Por favor, intenta nuevamente.',
            'Error'
          );
          return of([]);
        })
      );
    }
  });

  // Usuarios mapeados desde el resource
  usuarios = computed(() => {
    const dtos = this.usersResource.value() ?? [];
    const usuarios = mapUserDtosToUsuarios(dtos);
    return usuarios;
  });

  // Estado de carga
  isLoading = computed(() => this.usersResource.isLoading());
  
  errorMessageComputed = computed(() => {
    const error = this.usersResource.error();
    return error ? 'Error al cargar los usuarios. Por favor, intenta nuevamente.' : null;
  });

  constructor() {
    // Refrescar la lista inicialmente
    this.refreshUsers();
  }

  /**
   * Refresca la lista de usuarios
   */
  refreshUsers(): void {
    this.refreshTrigger.update(v => v + 1);
    this.usersResource.refetch();
  }

  /**
   * Obtiene el nombre legible de un rol
   */
  private getRoleDisplayName(role: RolesEnum): string {
    const roleNames: Record<RolesEnum, string> = {
      [RolesEnum.SYSTEM_ADMIN]: 'Administrador del Sistema',
      [RolesEnum.ADMIN_COMPANY]: 'Administrador de Comunidad',
      [RolesEnum.COMITEE_MEMBER]: 'Miembro del Comité',
      [RolesEnum.RESIDENT]: 'Residente',
      [RolesEnum.TENANT]: 'Inquilino',
      [RolesEnum.VIGILANCE]: 'Vigilancia'
    };
    return roleNames[role] || role;
  }

  // Configuración de columnas para la lista genérica
  userColumns: ColumnConfig[] = [
    { 
      key: 'fullname', 
      label: 'Nombre completo',
      formatter: (value, item) => {
        // Usar ResidentInfo.fullname si existe, de lo contrario usar firstName + lastName
        if (item?.ResidentInfo?.fullname) {
          return item.ResidentInfo.fullname;
        }
        if (item?.firstName || item?.lastName) {
          return `${item.firstName || ''} ${item.lastName || ''}`.trim() || '-';
        }
        return '-';
      }
    },
    { 
      key: 'role', 
      label: 'Tipo',
      formatter: (value, item) => {
        return item?.role ? this.getRoleDisplayName(item.role) : '-';
      }
    },
    { 
      key: 'email', 
      label: 'Email',
      formatter: (value, item) => {
        // Usar ResidentInfo.email si existe, de lo contrario usar email directo
        return item?.ResidentInfo?.email || item?.email || '-';
      }
    }
  ];

  /**
   * Determina qué roles de usuarios puede ver el rol actual
   */
  private getVisibleRolesForCurrentUser(): RolesEnum[] {
    const currentRole = this.currentUser()?.role;
    
    if (!currentRole) {
      return []; // Si no hay usuario conectado, no mostrar nada
    }

    switch (currentRole) {
      case RolesEnum.SYSTEM_ADMIN:
        // SYSTEM_ADMIN solo puede ver ADMIN_COMPANY
        return [RolesEnum.ADMIN_COMPANY];
      
      case RolesEnum.ADMIN_COMPANY:
        // ADMIN_COMPANY puede ver RESIDENT, COMITEE_MEMBER, VIGILANCE
        return [RolesEnum.RESIDENT, RolesEnum.COMITEE_MEMBER, RolesEnum.VIGILANCE];
      
      default:
        // Otros roles no pueden ver usuarios
        return [];
    }
  }

  /**
   * Determina qué roles puede crear el rol actual
   */
  getCreatableRoles(): RolesEnum[] {
    const currentRole = this.currentUser()?.role;
    
    if (!currentRole) {
      return [];
    }

    switch (currentRole) {
      case RolesEnum.SYSTEM_ADMIN:
        // SYSTEM_ADMIN solo puede crear ADMIN_COMPANY
        return [RolesEnum.ADMIN_COMPANY];
      
      case RolesEnum.ADMIN_COMPANY:
        // ADMIN_COMPANY puede crear RESIDENT, COMITEE_MEMBER, VIGILANCE
        return [RolesEnum.RESIDENT, RolesEnum.COMITEE_MEMBER, RolesEnum.VIGILANCE];
      
      default:
        // Otros roles no pueden crear usuarios
        return [];
    }
  }

  /**
   * Verifica si el usuario actual puede crear usuarios
   */
  canCreateUsers(): boolean {
    return this.getCreatableRoles().length > 0;
  }

  /**
   * Verifica si el usuario actual puede ver el switch de usuarios eliminados
   * Solo SYSTEM_ADMIN y ADMIN_COMPANY pueden verlo
   */
  canViewInactiveUsersSwitch(): boolean {
    const currentRole = this.currentUser()?.role;
    console.log('canViewInactiveUsersSwitch - currentRole:', currentRole);
    return currentRole === RolesEnum.SYSTEM_ADMIN || currentRole === RolesEnum.ADMIN_COMPANY;
  }

  /**
   * Maneja el cambio del switch para mostrar/ocultar usuarios inactivos
   */
  onToggleInactiveUsers(): void {
    // El rxResource detectará el cambio en showInactiveUsers a través del request signal
    // Solo necesitamos forzar un refetch
    this.usersResource.refetch();
  }

  // Transformar usuarios para que las columnas puedan acceder a los datos anidados
  // y filtrar según los permisos del usuario actual
  usuariosForList = computed(() => {
    const visibleRoles = this.getVisibleRolesForCurrentUser();
    
    // Si no hay roles visibles, retornar array vacío
    if (visibleRoles.length === 0) {
      return [];
    }

    // Filtrar usuarios según los roles permitidos
    const filteredUsuarios = this.usuarios().filter(usuario => 
      visibleRoles.includes(usuario.role)
    );

    // Transformar para la lista - asegurarse de preservar el id
    return filteredUsuarios.map(usuario => {
      // Asegurar que el id esté presente y sea válido
      if (!usuario.id) {
        console.error('Usuario sin ID encontrado:', usuario);
      }
      
      const transformed = {
        id: usuario.id, // Preservar el id explícitamente primero
        ...usuario, // Luego hacer el spread para preservar todas las demás propiedades
        fullname: usuario.ResidentInfo?.fullname || 
                  (usuario.firstName || usuario.lastName ? `${usuario.firstName || ''} ${usuario.lastName || ''}`.trim() : '-'),
        email: usuario.ResidentInfo?.email || usuario.email || '-',
        phone: usuario.ResidentInfo?.phone || '-',
        address: usuario.ResidentInfo?.address || '-',
        comunidades: usuario.ResidentInfo?.comunidades || []
      };
      
      return transformed;
    });
  });

  /**
   * Maneja el clic en una fila de la lista (mostrar información)
   */
  onUserClick(usuario: any): void {
    // Buscar el usuario original por ID
    const originalUsuario = this.usuarios().find(u => u.id === usuario.id);
    if (originalUsuario) {
      this.selectedUsuario = originalUsuario;
      setTimeout(() => {
        const modal = document.getElementById('userInfoModal') as HTMLDialogElement;
        if (modal) {
          modal.showModal();
        }
      }, 0);
    }
  }

  /**
   * Maneja el clic en editar
   */
  onEditUser(usuario: any): void {
    // El usuario puede venir del evento, asegurarse de obtener el id correctamente
    const userId = usuario?.id;
    console.log('onEditUser - userId:', userId);
    if (!userId) {
      console.error('onEditUser - No se encontró el ID del usuario:', usuario);
      this.notificationService.showError('No se pudo obtener el ID del usuario para editar', 'Error');
      return;
    }
    
    this.edit(userId);
  }

  /**
   * Maneja el clic en eliminar
   */
  onDeleteUser(usuario: any): void {
    // El usuario puede venir del evento, asegurarse de obtener el id correctamente
    const userId = usuario?.id;
    
    if (!userId) {
      console.error('onDeleteUser - No se encontró el ID del usuario:', usuario);
      this.notificationService.showError('No se pudo obtener el ID del usuario para eliminar', 'Error');
      return;
    }
    
    const nombreUsuario = usuario.ResidentInfo?.fullname || 
                          (usuario.firstName || usuario.lastName ? `${usuario.firstName || ''} ${usuario.lastName || ''}`.trim() : '') ||
                          usuario.username || 'este usuario';
    
    if (confirm(`¿Está seguro de que desea eliminar al usuario ${nombreUsuario}?`)) {
      this.delete(userId);
    }
  }

  /**
   * Obtiene las comunidades formateadas del usuario seleccionado
   */
  getComunidadesFormatted(): string {
    if (!this.selectedUsuario?.ResidentInfo?.comunidades) {
      return '-';
    }
    const comunidades = this.selectedUsuario.ResidentInfo.comunidades;
    return comunidades.length > 0 ? comunidades.join(', ') : '-';
  }

  new() {
    // Verificar que el usuario tenga permisos para crear usuarios
    if (!this.canCreateUsers()) {
      console.warn('El usuario actual no tiene permisos para crear usuarios');
      return;
    }

    const url = `/sysadmin/newusuario`
    console.log("Navegar a: ", url);
    
    this.router.navigate(['/sysadmin/newusuario']);
  }

  edit(userId: string) {
    if (!userId) {
      console.error('edit - userId es null o undefined');
      this.notificationService.showError('No se pudo obtener el ID del usuario para editar', 'Error');
      return;
    }
    
    const url = `/sysadmin/editusuario/${userId}`;
    console.log("Navegar a: ", url);

    this.router.navigate([url]).catch(error => {
      console.error('Error al navegar a la URL de edición:', error);
      this.notificationService.showError('Error al navegar a la página de edición', 'Error');
    });
  }

  delete(userId : string) {
    this.usersService.deleteUser(userId).subscribe({
      next: () => {
        this.notificationService.showSuccess('Usuario eliminado exitosamente', 'Éxito');
        this.refreshUsers();
      },
      error: (error) => {
        this.logger.error('Error deleting user', error, 'UserListComponent');
        this.notificationService.showError(
          error.error?.message || 'Error al eliminar el usuario',
          'Error'
        );
      }
    });
  }
}

