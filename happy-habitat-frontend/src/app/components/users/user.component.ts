import { SelectOption } from './../../shared/interfaces/select-option.inteface';
import { ReactiveFormsModule, FormBuilder, Validators, FormControl, FormArray } from '@angular/forms';
import { Component, inject, OnInit, computed, signal, effect } from '@angular/core';
import { FormUtils } from '../../utils/form-utils';
import { rolesData } from '../../shared/data/roles.data';
import { JsonPipe } from '@angular/common';
import { ShowFormErrorTemplateComponent } from '../../shared/show-form-error-template/show-form-error-template.component';
import { ComunidadMapper } from '../proveedores-residentes/mappers/comunidad-selectoption.mapper';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { RolesEnum } from '../../enums/roles.enum';
import { UsersService, CreateUserRequest, UpdateUserRequest } from '../../services/users.service';
import { CommunitiesService } from '../../services/communities.service';
import { mapUserDtoToUsuario } from '../../shared/mappers/user.mapper';
import { mapCommunityDtosToComunidades } from '../../shared/mappers/community.mapper';
import { mapRoleToRoleId, mapRoleIdToRole } from '../../shared/mappers/user.mapper';
import { rxResource } from '../../utils/rx-resource.util';
import { catchError, of, switchMap, tap } from 'rxjs';
import { NotificationService } from '../../services/notification.service';
import { LoggerService } from '../../services/logger.service';

@Component({
  selector: 'hh-user-edit',
  imports: [ReactiveFormsModule, ShowFormErrorTemplateComponent, JsonPipe],
  templateUrl: './user.component.html',
  styles: ``
})
export class UserComponent implements OnInit {
  router = inject(Router);
  route = inject(ActivatedRoute);
  fb = inject(FormBuilder);
  authService = inject(AuthService);
  usersService = inject(UsersService);
  communitiesService = inject(CommunitiesService);
  notificationService = inject(NotificationService);
  logger = inject(LoggerService);
  formUtils = FormUtils;

  // Roles disponibles filtrados según el usuario actual
  availableRoles = computed(() => {
    const currentRole = this.currentUser()?.selectedRole;
    
    if (!currentRole) {
      return [];
    }

    switch (currentRole) {
      case RolesEnum.SYSTEM_ADMIN:
        // SYSTEM_ADMIN solo puede crear ADMIN_COMPANY
        return rolesData.filter(r => r.value === RolesEnum.ADMIN_COMPANY);
      
      case RolesEnum.ADMIN_COMPANY:
        // ADMIN_COMPANY puede crear RESIDENT, COMITEE_MEMBER, VIGILANCE
        return rolesData.filter(r => 
          r.value === RolesEnum.RESIDENT || 
          r.value === RolesEnum.COMITEE_MEMBER || 
          r.value === RolesEnum.VIGILANCE
        );
      
      default:
        // Otros roles no pueden crear usuarios
        return [];
    }
  });

  // Cargar comunidades del backend
  private refreshCommunitiesTrigger = signal(0);
  communitiesResource = rxResource({
    request: () => ({ refresh: this.refreshCommunitiesTrigger() }),
    loader: () => {
      return this.communitiesService.getAllCommunities().pipe(
        catchError((error) => {
          this.logger.error('Error loading communities', error, 'UserComponent');
          return of([]);
        })
      );
    }
  });

  availableCommunities = computed(() => {
    const dtos = this.communitiesResource.value() ?? [];
    return mapCommunityDtosToComunidades(dtos);
  });

  comunidadesCombo = computed(() => {
    return ComunidadMapper.mapComunidadesToSelectOptionsArray(this.availableCommunities());
  });

  comunidadesSeleccionadas : SelectOption[] = [];

  // Obtener el usuario actual conectado
  currentUser = computed(() => this.authService.currentUser());

  // Verificar si el usuario actual es ADMIN_COMPANY
  isAdminCompany = computed(() => {
    return this.currentUser()?.selectedRole === RolesEnum.ADMIN_COMPANY;
  });

  // ID del usuario a editar (si existe en la ruta)
  userId = signal<string | null>(null);
  isEditMode = computed(() => this.userId() !== null);

  // Resource para cargar usuario por ID
  // Usar directamente el userId signal y crear un request signal que se actualice
  private userIdRequestSignal = signal<string | null>(null);
  
  userResource = rxResource({
    request: () => this.userIdRequestSignal(),
    loader: ({ request }) => {
      const userId = request; // request es directamente el string | null
      if (!userId) {
        console.log('UserComponent userResource loader - No hay userId, retornando undefined');
        return of(undefined);
      }
      console.log('UserComponent userResource loader - Cargando usuario con ID:', userId);
      return this.usersService.getUserById(userId).pipe(
        tap((userDto: any) => {
          console.log('UserComponent userResource loader - Usuario cargado exitosamente:', userDto);
        }),
        catchError((error) => {
          this.logger.error('Error loading user', error, 'UserComponent');
          console.error('UserComponent userResource loader - Error:', error);
          // No mostrar error aquí, el effect lo manejará
          // Devolver undefined en lugar de null para distinguir entre "no cargado" y "no encontrado"
          return of(undefined);
        })
      );
    }
  });

  // Resource para crear usuario
  private createRequestSignal = signal<CreateUserRequest | null>(null);
  createUserResource = rxResource({
    request: () => ({ request: this.createRequestSignal() }),
    loader: ({ request }) => {
      if (!request.request) {
        return of(null);
      }
      return this.usersService.createUser(request.request).pipe(
        catchError((error) => {
          this.logger.error('Error creating user', error, 'UserComponent');
          this.notificationService.showError(
            error.error?.message || 'Error al crear el usuario',
            'Error'
          );
          return of(null);
        })
      );
    }
  });

  // Resource para actualizar usuario
  private updateRequestSignal = signal<{ id: string; request: UpdateUserRequest } | null>(null);
  updateUserResource = rxResource({
    request: () => ({ data: this.updateRequestSignal() }),
    loader: ({ request }) => {
      if (!request.data) {
        return of(null);
      }
      return this.usersService.updateUser(request.data.id, request.data.request).pipe(
        catchError((error) => {
          this.logger.error('Error updating user', error, 'UserComponent');
          this.notificationService.showError(
            error.error?.message || 'Error al actualizar el usuario',
            'Error'
          );
          return of(null);
        })
      );
    }
  });

  // Resource para eliminar usuario
  private deleteIdSignal = signal<string | null>(null);
  deleteUserResource = rxResource({
    request: () => ({ id: this.deleteIdSignal() }),
    loader: ({ request }) => {
      if (!request.id) {
        return of(null);
      }
      return this.usersService.deleteUser(request.id).pipe(
        catchError((error) => {
          this.logger.error('Error deleting user', error, 'UserComponent');
          this.notificationService.showError(
            error.error?.message || 'Error al eliminar el usuario',
            'Error'
          );
          return of(null);
        })
      );
    }
  });

  isLoading = computed(() => 
    this.userResource.isLoading() || 
    this.createUserResource.isLoading() || 
    this.updateUserResource.isLoading() ||
    this.deleteUserResource.isLoading() ||
    this.communitiesResource.isLoading()
  );

  myForm = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    username: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.minLength(10)]],
    address: ['', [Validators.required, Validators.minLength(1)]],
    role: ['', Validators.required],
    password: ['', Validators.minLength(6)],
    comunidades: this.fb.array([], [Validators.required, Validators.minLength(1)]),
  });

  newComunidad = new FormControl();

  constructor() {
    // Effect para sincronizar userIdRequestSignal con userId y forzar refetch
    effect(() => {
      const id = this.userId();
      const currentRequestId = this.userIdRequestSignal();
      
      if (id !== currentRequestId) {
        console.log('UserComponent constructor effect - Sincronizando userIdRequestSignal con userId:', id);
        this.userIdRequestSignal.set(id);
        // Forzar refetch cuando cambia el userId
        if (id) {
          console.log('UserComponent constructor effect - Forzando refetch para userId:', id);
          this.userResource.refetch();
        }
      }
    });

    // Effect para cargar datos del usuario cuando se obtiene del backend
    effect(() => {
      const userDto = this.userResource.value();
      const id = this.userId();
      const isLoading = this.userResource.isLoading();
      const error = this.userResource.error();
      
      console.log('UserComponent effect - userDto:', userDto, 'id:', id, 'isLoading:', isLoading, 'error:', error);
      
      // Solo procesar si hay un ID (modo edición)
      if (!id) {
        return;
      }
      
      // Si está cargando, no hacer nada aún
      if (isLoading) {
        console.log('UserComponent effect - Aún cargando, esperando...');
        return;
      }
      
      // Si hay un error (404, 500, etc.), el usuario no se encontró o hubo un error
      if (error) {
        console.log('UserComponent effect - Error detectado:', error);
        const errorStatus = (error as any)?.status;
        if (errorStatus === 404) {
          this.notificationService.showError('Usuario no encontrado', 'Error');
        } else {
          this.notificationService.showError('Error al cargar el usuario', 'Error');
        }
        this.router.navigate(['/sysadmin/usuarios']);
        return;
      }
      
      // Si se obtuvo el usuario exitosamente, cargar los datos
      if (userDto) {
        console.log('UserComponent effect - Usuario cargado exitosamente:', userDto);
        this.loadUserDataFromDto(userDto);
      } else {
        console.log('UserComponent effect - userDto es undefined/null pero no hay error ni está cargando');
      }
    });

    // Effect para manejar creación exitosa
    effect(() => {
      const result = this.createUserResource.value();
      const request = this.createRequestSignal();
      
      if (result && request) {
        this.notificationService.showSuccess('Usuario creado exitosamente', 'Éxito');
        this.router.navigate(['/sysadmin/usuarios']);
      }
    });

    // Effect para manejar actualización exitosa
    effect(() => {
      const result = this.updateUserResource.value();
      const request = this.updateRequestSignal();
      
      if (result && request) {
        this.notificationService.showSuccess('Usuario actualizado exitosamente', 'Éxito');
        this.router.navigate(['/sysadmin/usuarios']);
      }
    });

    // Effect para manejar eliminación exitosa
    effect(() => {
      const result = this.deleteUserResource.value();
      const deleteId = this.deleteIdSignal();
      
      if (result !== undefined && deleteId) {
        this.notificationService.showSuccess('Usuario eliminado exitosamente', 'Éxito');
        this.router.navigate(['/sysadmin/usuarios']);
      }
    });

    // Effect para seleccionar automáticamente el primer rol disponible en modo creación
    effect(() => {
      const roles = this.availableRoles();
      const editMode = this.isEditMode();
      const currentRole = this.myForm.get('role')?.value;
      
      // Solo en modo creación, si no hay rol seleccionado y hay roles disponibles
      if (!editMode && !currentRole && roles.length > 0) {
        const firstRole = roles[0];
        this.myForm.get('role')?.setValue(firstRole.value);
      }
    });
  }

  get comunidadesFormArray(){
    return this.myForm.get('comunidades') as FormArray;
  }

  ngOnInit(): void {
    // Obtener el ID de la ruta si existe
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      console.log('UserComponent ngOnInit - ID de la ruta:', id);
      
      if (id) {
        console.log('UserComponent ngOnInit - Estableciendo userId:', id);
        this.userId.set(id);
        // El effect se encargará de actualizar userIdRequestSignal automáticamente
        console.log('UserComponent ngOnInit - userId establecido:', this.userId());
      } else {
        console.log('UserComponent ngOnInit - Modo creación (sin ID)');
        // Modo creación: seleccionar automáticamente el primer rol disponible
        const roles = this.availableRoles();
        if (roles.length > 0) {
          this.myForm.get('role')?.setValue(roles[0].value);
        }
        
        // Modo creación: si es ADMIN_COMPANY, pre-seleccionar su comunidad
        if (this.isAdminCompany()) {
          // Esperar a que las comunidades se carguen
          setTimeout(() => {
            this.preselectAdminCommunity();
          }, 100);
        }
        // En modo creación, el campo password es requerido
        this.myForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
        this.myForm.get('password')?.updateValueAndValidity();
      }
    });
  }

  /**
   * Carga los datos del usuario desde el DTO del backend
   */
  private loadUserDataFromDto(userDto: any): void {
    // Dividir fullName en firstName y lastName si viene de residentInfo
    let firstName = userDto.firstName || '';
    let lastName = userDto.lastName || '';
    
    if (userDto.residentInfo?.fullName) {
      const fullNameParts = userDto.residentInfo.fullName.trim().split(' ');
      firstName = fullNameParts[0] || '';
      lastName = fullNameParts.slice(1).join(' ') || '';
    }
    
    // Rellenar el formulario con los datos del usuario
    this.myForm.patchValue({
      firstName: firstName,
      lastName: lastName,
      username: userDto.username || '',
      email: userDto.residentInfo?.email || userDto.email || '',
      phone: userDto.residentInfo?.phone || '',
      address: userDto.residentInfo?.address || '',
      role: mapRoleIdToRole(userDto.roleId) || ''
    });

    // En modo edición, password no es requerido
    this.myForm.get('password')?.clearValidators();
    this.myForm.get('password')?.updateValueAndValidity();

    // Cargar las comunidades asociadas
    // Usar userCommunityIds si están disponibles, de lo contrario usar residentInfo.communityIds
    let communityIds: string[] = [];
    if (userDto.userCommunityIds && userDto.userCommunityIds.length > 0) {
      communityIds = userDto.userCommunityIds;
    } else {
      communityIds = userDto.residentInfo?.communityIds || 
                      (userDto.residentInfo?.communityId ? [userDto.residentInfo.communityId] : []);
    }
    
    if (communityIds.length > 0) {
      // Esperar a que las comunidades se carguen
      setTimeout(() => {
        this.loadUserCommunities(communityIds);
      }, 100);
    } else if (this.isAdminCompany()) {
      // Si es ADMIN_COMPANY y no hay comunidades, usar la del administrador
      setTimeout(() => {
        this.preselectAdminCommunity();
      }, 100);
    }
  }

  /**
   * Carga las comunidades del usuario en el formulario
   */
  private loadUserCommunities(comunidadIds: string[]): void {
    // Limpiar comunidades existentes
    this.comunidadesFormArray.clear();
    this.comunidadesSeleccionadas = [];

    const combo = this.comunidadesCombo();

    // Agregar cada comunidad
    comunidadIds.forEach(comunidadId => {
      const communityOption = combo.find(
        option => option.value === comunidadId
      );

      if (communityOption) {
        this.comunidadesSeleccionadas.push(communityOption);
        this.comunidadesFormArray.push(this.fb.control(comunidadId, []));
      }
    });

    // Si hay comunidades, establecer la primera en el selector
    if (comunidadIds.length > 0) {
      this.newComunidad.setValue(comunidadIds[0]);
    }
  }

  /**
   * Pre-selecciona la comunidad del administrador
   */
  private preselectAdminCommunity(): void {
    const currentUser = this.currentUser();
    const adminCommunity = currentUser?.residentInfo?.comunidad;
    
    if (adminCommunity?.id) {
      const combo = this.comunidadesCombo();
      // Buscar la opción de comunidad correspondiente
      const communityOption = combo.find(
        option => option.value === adminCommunity.id
      );
      
      if (communityOption) {
        // Verificar si ya está agregada
        const exists = this.comunidadesSeleccionadas.find(
          c => c.value === adminCommunity.id
        );

        if (!exists) {
          // Agregar la comunidad a las seleccionadas
          this.comunidadesSeleccionadas.push(communityOption);
          
          // Agregar al FormArray
          this.comunidadesFormArray.push(this.fb.control(adminCommunity.id, []));
        }
        
        // Establecer el valor en el control para que se muestre seleccionado
        this.newComunidad.setValue(adminCommunity.id);
      }
    }
  }

  onAddCommunity(){
    // Permitir agregar comunidades para todos los roles

    if(this.newComunidad.invalid) return;
    if(!this.newComunidad.value) return;
    
    const newCommunityId = this.newComunidad.value!;
    const combo = this.comunidadesCombo();

    // Buscamos el texto 
    const newSO = this.getCommunityOption(newCommunityId);

    // Verifica si ya ha sido agregada antes y no hace nada
    const comunidadFoundIndex = this.comunidadesSeleccionadas.findIndex(x => x.value === newCommunityId);
    if( comunidadFoundIndex >= 0) {
      alert(`La comunidad ${newSO.text} ya habia sido seleccionada.`);
      return;
    } 
      
    this.comunidadesSeleccionadas.push(newSO);
    this.comunidadesFormArray.push(this.fb.control(newCommunityId, [] ) );
    this.newComunidad.reset();
  }

  onDeleteFavorite(comunidadId: string){
    // Permitir eliminar comunidades para todos los roles

    const index = this.comunidadesSeleccionadas.findIndex(x => x.value === comunidadId);
    
    this.comunidadesSeleccionadas.splice(index, 1);
    this.comunidadesFormArray.removeAt(index);
  }

  onSave(): void {
    if (this.myForm.invalid) {
      this.myForm.markAllAsTouched();
      return;
    }

    const formValue = this.myForm.value;
    const communityIds = this.comunidadesFormArray.value as string[];

    if (communityIds.length === 0) {
      this.notificationService.showError('Debe seleccionar al menos una comunidad', 'Error');
      return;
    }

    const roleId = mapRoleToRoleId(formValue.role as RolesEnum);
    const role = formValue.role as RolesEnum;
    // Para roles que usan Resident (RESIDENT, COMITEE_MEMBER, VIGILANCE), usar communityIds
    // Para otros roles, usar userCommunityIds
    const usesResident = role === RolesEnum.RESIDENT || role === RolesEnum.COMITEE_MEMBER || role === RolesEnum.VIGILANCE;

    if (this.isEditMode()) {
      // Actualizar usuario
      const updateRequest: UpdateUserRequest = {
        roleId: roleId,
        firstName: formValue.firstName || '',
        lastName: formValue.lastName || '',
        username: formValue.username || '',
        email: formValue.email || '',
        isActive: true,
        residentInfo: {
          fullName: `${formValue.firstName || ''} ${formValue.lastName || ''}`.trim(),
          email: formValue.email || '',
          phone: formValue.phone || '',
          address: formValue.address || ''
        },
        communityIds: usesResident ? communityIds : [],
        userCommunityIds: usesResident ? undefined : communityIds
      };

      this.updateRequestSignal.set({
        id: this.userId()!,
        request: updateRequest
      });
    } else {
      // Crear usuario
      if (!formValue.password || formValue.password.length < 6) {
        this.notificationService.showError('La contraseña debe tener al menos 6 caracteres', 'Error');
        return;
      }

      const createRequest: CreateUserRequest = {
        roleId: roleId,
        firstName: formValue.firstName || '',
        lastName: formValue.lastName || '',
        username: formValue.username || '',
        email: formValue.email || '',
        password: formValue.password || '',
        isActive: true,
        residentInfo: {
          fullName: `${formValue.firstName || ''} ${formValue.lastName || ''}`.trim(),
          email: formValue.email || '',
          phone: formValue.phone || '',
          address: formValue.address || ''
        },
        communityIds: usesResident ? communityIds : [],
        userCommunityIds: usesResident ? undefined : communityIds
      };

      this.createRequestSignal.set(createRequest);
    }
  }

  getCommunityOption(communityId: string) : SelectOption{
    const combo = this.comunidadesCombo();
    const retComunity = combo.filter(x => x.value === communityId)[0];
    return retComunity;
  }

  goBack() {
    this.router.navigate(['/sysadmin/usuarios']);
  }

  /**
   * Elimina el usuario actual
   */
  onDelete(): void {
    const userId = this.userId();
    if (!userId) {
      return;
    }

    // Confirmar eliminación
    if (confirm('¿Está seguro de que desea eliminar este usuario? Esta acción no se puede deshacer.')) {
      this.deleteIdSignal.set(userId);
    }
  }
}
