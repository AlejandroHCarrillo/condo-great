import { Router } from '@angular/router';
import type { Comunidad } from '../../../interfaces/comunidad.interface';
import { Component, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { GenericListComponent, ColumnConfig } from '../../../shared/components/generic-list/generic-list.component';
import { CommunitiesService, CommunityDto, CreateCommunityRequest, UpdateCommunityRequest } from '../../../services/communities.service';
import { LoggerService } from '../../../services/logger.service';
import { NotificationService } from '../../../services/notification.service';
import { mapCommunityDtosToComunidades } from '../../../shared/mappers/community.mapper';
import { tipoComunidadEnum } from '../../../enums/tipo-comunidad.enum';
import { TruncatePipe } from '../../../shared/pipes/truncate.pipe';
import { rxResource } from '../../../utils/rx-resource.util';
import { catchError, of, switchMap } from 'rxjs';

@Component({
  selector: 'hh-comunidad',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, GenericListComponent, TruncatePipe],
  templateUrl: './comunidad.component.html',
  styles: ``
})
export class ComunidadComponent {
  private fb = inject(FormBuilder);
  private communitiesService = inject(CommunitiesService);
  private logger = inject(LoggerService);
  private notificationService = inject(NotificationService);
  
  // Signal para refrescar la lista de comunidades
  private refreshTrigger = signal(0);
  
  // Resource para cargar todas las comunidades
  communitiesResource = rxResource({
    request: () => ({ refresh: this.refreshTrigger() }),
    loader: () => {
      return this.communitiesService.getAllCommunities().pipe(
        catchError((error) => {
          this.logger.error('Error loading communities', error, 'ComunidadComponent');
          this.notificationService.showError(
            'Error al cargar las comunidades. Por favor, intenta nuevamente.',
            'Error'
          );
          return of([]);
        })
      );
    }
  });

  // Comunidades mapeadas desde el resource
  comunidades = computed(() => {
    const dtos = this.communitiesResource.value() ?? [];
    const comunidades = mapCommunityDtosToComunidades(dtos);
    if (comunidades.length > 0) {
      this.logger.info('Communities loaded successfully', 'ComunidadComponent', { 
        count: comunidades.length 
      });
    }
    return comunidades;
  });

  // Estado de carga
  isLoading = computed(() => this.communitiesResource.isLoading());
  errorMessage = computed(() => {
    const error = this.communitiesResource.error();
    return error ? 'Error al cargar las comunidades. Por favor, intenta nuevamente.' : null;
  });

  // Signals para modales
  showModal = signal(false);
  showDeleteModal = signal(false);
  showInfoModal = signal(false);
  communityToDelete: CommunityDto | null = null;
  selectedCommunity: Comunidad | null = null;
  editingCommunityId: string | null = null;

  // Signal para obtener una comunidad por ID (para editar)
  private editCommunityIdSignal = signal<string | null>(null);
  editCommunityResource = rxResource({
    request: () => ({ id: this.editCommunityIdSignal() }),
    loader: ({ request }) => {
      if (!request.id) {
        return of(null);
      }
      return this.communitiesService.getCommunityById(request.id).pipe(
        catchError((error) => {
          this.logger.error('Error loading community for edit', error, 'ComunidadComponent');
          this.notificationService.showError(
            'Error al cargar la información de la comunidad',
            'Error'
          );
          return of(null);
        })
      );
    }
  });

  // Signal para obtener una comunidad por ID (para eliminar)
  private deleteCommunityIdSignal = signal<string | null>(null);
  deleteCommunityResource = rxResource({
    request: () => ({ id: this.deleteCommunityIdSignal() }),
    loader: ({ request }) => {
      if (!request.id) {
        return of(null);
      }
      return this.communitiesService.getCommunityById(request.id).pipe(
        catchError((error) => {
          this.logger.error('Error loading community for delete', error, 'ComunidadComponent');
          this.notificationService.showError(
            'Error al cargar la información de la comunidad',
            'Error'
          );
          return of(null);
        })
      );
    }
  });

  // Signal para crear comunidad
  private createRequestSignal = signal<CreateCommunityRequest | null>(null);
  createCommunityResource = rxResource({
    request: () => ({ request: this.createRequestSignal() }),
    loader: ({ request }) => {
      if (!request.request) {
        return of(null);
      }
      return this.communitiesService.createCommunity(request.request).pipe(
        catchError((error) => {
          this.logger.error('Error creating community', error, 'ComunidadComponent', { request: request.request });
          this.notificationService.showError(
            error.error?.message || 'Error al crear la comunidad. Por favor, intente nuevamente.',
            'Error'
          );
          return of(null);
        })
      );
    }
  });

  // Signal para actualizar comunidad
  private updateRequestSignal = signal<{ id: string; request: UpdateCommunityRequest } | null>(null);
  updateCommunityResource = rxResource({
    request: () => ({ data: this.updateRequestSignal() }),
    loader: ({ request }) => {
      if (!request.data) {
        return of(null);
      }
      return this.communitiesService.updateCommunity(request.data.id, request.data.request).pipe(
        catchError((error) => {
          this.logger.error('Error updating community', error, 'ComunidadComponent', { 
            id: request.data!.id,
            request: request.data!.request,
            errorDetails: error 
          });
          this.notificationService.showError(
            error.error?.message || 'Error al actualizar la comunidad. Por favor, intente nuevamente.',
            'Error'
          );
          return of(null);
        })
      );
    }
  });

  // Signal para eliminar comunidad
  private deleteIdSignal = signal<string | null>(null);
  deleteCommunityActionResource = rxResource({
    request: () => ({ id: this.deleteIdSignal() }),
    loader: ({ request }) => {
      if (!request.id) {
        return of(null);
      }
      return this.communitiesService.deleteCommunity(request.id).pipe(
        catchError((error) => {
          this.logger.error('Error deleting community', error, 'ComunidadComponent');
          this.notificationService.showError(
            error.error?.message || 'Error al eliminar la comunidad. Por favor, intente nuevamente.',
            'Error'
          );
          return of(null);
        }),
        switchMap(() => of(true))
      );
    }
  });

  // Effects para manejar las respuestas de los resources
  constructor() {
    // Flags para evitar ejecuciones múltiples de los effects
    let createProcessed = false;
    let updateProcessed = false;
    let deleteProcessed = false;
    let editProcessed = false;
    let deleteLoadProcessed = false;

    // Effect para manejar la creación exitosa
    effect(() => {
      const result = this.createCommunityResource.value();
      const request = this.createRequestSignal();
      if (result && request && !createProcessed) {
        createProcessed = true;
        this.logger.info('Community created successfully', 'ComunidadComponent', { response: result });
        this.notificationService.showSuccess(
          'Comunidad creada exitosamente',
          'Éxito'
        );
        this.closeModal();
        this.refreshCommunities();
        setTimeout(() => {
          this.createRequestSignal.set(null);
          createProcessed = false;
        }, 100);
      } else if (!request) {
        createProcessed = false;
      }
    });

    // Effect para manejar la actualización exitosa
    effect(() => {
      const result = this.updateCommunityResource.value();
      const request = this.updateRequestSignal();
      if (result && request && !updateProcessed) {
        updateProcessed = true;
        this.logger.info('Community updated successfully', 'ComunidadComponent', { 
          id: result.id,
          response: result 
        });
        this.notificationService.showSuccess(
          'Comunidad actualizada exitosamente',
          'Éxito'
        );
        this.editingCommunityId = null;
        this.closeModal();
        this.refreshCommunities();
        setTimeout(() => {
          this.updateRequestSignal.set(null);
          updateProcessed = false;
        }, 100);
      } else if (!request) {
        updateProcessed = false;
      }
    });

    // Effect para manejar la eliminación exitosa
    effect(() => {
      const result = this.deleteCommunityActionResource.value();
      const deleteId = this.deleteIdSignal();
      if (result && deleteId && !deleteProcessed) {
        deleteProcessed = true;
        const community = this.communityToDelete;
        if (community) {
          this.logger.debug(`Community ${community.id} deleted successfully`, 'ComunidadComponent');
          this.notificationService.showSuccess(
            `Comunidad ${community.nombre} eliminada exitosamente`,
            'Éxito'
          );
          this.closeDeleteModal();
          this.refreshCommunities();
          setTimeout(() => {
            this.deleteIdSignal.set(null);
            deleteProcessed = false;
          }, 100);
        }
      } else if (!deleteId) {
        deleteProcessed = false;
      }
    });

    // Effect para manejar la carga de comunidad para editar
    effect(() => {
      const dto = this.editCommunityResource.value();
      const editId = this.editCommunityIdSignal();
      if (dto && dto.id && editId && !editProcessed) {
        editProcessed = true;
        this.editingCommunityId = dto.id;
        this.logger.debug('Loading community for edit', 'ComunidadComponent', { 
          id: dto.id,
          nombre: dto.nombre 
        });

        this.communityForm.patchValue({
          nombre: dto.nombre,
          descripcion: dto.descripcion,
          direccion: dto.direccion,
          contacto: dto.contacto,
          email: dto.email,
          phone: dto.phone,
          tipoComunidad: dto.tipoComunidad || '',
          latitud: dto.latitud ?? null,
          longitud: dto.longitud ?? null,
          cantidadViviendas: dto.cantidadViviendas || 0
        });
        this.openNewCommunityModal();
        setTimeout(() => {
          this.editCommunityIdSignal.set(null);
          editProcessed = false;
        }, 100);
      } else if (!editId) {
        editProcessed = false;
      }
    });

    // Effect para manejar la carga de comunidad para eliminar
    effect(() => {
      const dto = this.deleteCommunityResource.value();
      const deleteId = this.deleteCommunityIdSignal();
      if (dto && deleteId && !deleteLoadProcessed) {
        deleteLoadProcessed = true;
        this.communityToDelete = dto;
        this.showDeleteModal.set(true);
        setTimeout(() => {
          const modal = document.getElementById('deleteCommunityModal') as HTMLDialogElement;
          if (modal) {
            modal.showModal();
          }
          this.deleteCommunityIdSignal.set(null);
          deleteLoadProcessed = false;
        }, 0);
      } else if (!deleteId) {
        deleteLoadProcessed = false;
      }
    });
  }

  // Tipos de comunidad para el select
  tiposComunidad = Object.values(tipoComunidadEnum);

  // Configuración de columnas para la lista genérica
  communityColumns: ColumnConfig[] = [
    { 
      key: 'nombre', 
      label: 'Nombre',
      formatter: (value) => value ? value.charAt(0).toUpperCase() + value.slice(1) : '-'
    },
    { 
      key: 'tipoUnidadHabitacional', 
      label: 'Tipo',
      formatter: (value) => value || '-'
    },
    /*
    { 
      key: 'cantidadviviendas', 
      label: 'Viviendas',
      formatter: (value) => value ? value.toString() : '0'
    },
    */
    { 
      key: 'ubicacion', 
      label: 'Ubicación',
      formatter: (value) => {
        if (!value) return '-';
        if (value.length <= 25) return value;
        return value.substring(0, 25) + '...';
      }
    },
    /*
    { 
      key: 'contacto', 
      label: 'Contacto',
      formatter: (value) => value || '-'
    }
    */
  ];

  // Formulario para crear/editar comunidades
  communityForm = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(3)]],
    descripcion: ['', Validators.required],
    direccion: ['', Validators.required],
    contacto: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', Validators.required],
    tipoComunidad: ['', Validators.required],
    latitud: [null as number | null],
    longitud: [null as number | null],
    cantidadViviendas: [0, [Validators.required, Validators.min(0)]]
  });

  /**
   * Refresca la lista de comunidades
   */
  refreshCommunities(): void {
    this.refreshTrigger.update(v => v + 1);
    this.communitiesResource.refetch();
  }

  /**
   * Maneja el clic en una fila de la lista (mostrar información)
   */
  onCommunityClick(community: Comunidad): void {
    this.selectedCommunity = community;
    this.showInfoModal.set(true);
    setTimeout(() => {
      const modal = document.getElementById('infoCommunityModal') as HTMLDialogElement;
      if (modal) {
        modal.showModal();
      }
    }, 0);
  }

  /**
   * Maneja la edición de una comunidad
   */
  onEditCommunity(community: Comunidad): void {
    // Obtener el DTO completo del backend para editar
    if (!community.id) {
      this.notificationService.showError('No se pudo obtener el ID de la comunidad', 'Error');
      return;
    }

    this.editCommunityIdSignal.set(community.id);
    this.editCommunityResource.refetch();
  }

  /**
   * Maneja la eliminación de una comunidad
   */
  onDeleteCommunity(community: Comunidad): void {
    if (!community.id) {
      this.notificationService.showError('No se pudo obtener el ID de la comunidad', 'Error');
      return;
    }

    // Obtener el DTO completo
    this.deleteCommunityIdSignal.set(community.id);
    this.deleteCommunityResource.refetch();
  }

  /**
   * Confirma la eliminación de la comunidad
   */
  confirmDeleteCommunity(): void {
    if (!this.communityToDelete) {
      return;
    }

    const community = this.communityToDelete;
    this.deleteIdSignal.set(community.id);
    this.deleteCommunityActionResource.refetch();
  }

  /**
   * Cierra el modal de confirmación de eliminación
   */
  closeDeleteModal(): void {
    const modal = document.getElementById('deleteCommunityModal') as HTMLDialogElement;
    if (modal) {
      modal.close();
    }
    this.showDeleteModal.set(false);
    this.communityToDelete = null;
  }

  /**
   * Cierra el modal de información
   */
  closeInfoModal(): void {
    const modal = document.getElementById('infoCommunityModal') as HTMLDialogElement;
    if (modal) {
      modal.close();
    }
    this.showInfoModal.set(false);
    this.selectedCommunity = null;
  }

  /**
   * Abre el modal de registro de comunidad
   */
  openNewCommunityModal(): void {
    this.showModal.set(true);
    setTimeout(() => {
      const modal = document.getElementById('newCommunityModal') as HTMLDialogElement;
      if (modal) {
        modal.showModal();
      }
    }, 0);
  }

  /**
   * Abre el modal para nueva comunidad (sin datos)
   */
  openNewCommunityModalForCreate(): void {
    this.editingCommunityId = null;
    this.communityForm.reset({
      nombre: '',
      descripcion: '',
      direccion: '',
      contacto: '',
      email: '',
      phone: '',
      tipoComunidad: '',
      latitud: null,
      longitud: null,
      cantidadViviendas: 0
    });
    this.openNewCommunityModal();
  }

  /**
   * Cierra el modal de registro de comunidad
   */
  closeModal(): void {
    const modal = document.getElementById('newCommunityModal') as HTMLDialogElement;
    if (modal) {
      modal.close();
    }
    this.showModal.set(false);
    this.editingCommunityId = null;
    this.communityForm.reset({
      nombre: '',
      descripcion: '',
      direccion: '',
      contacto: '',
      email: '',
      phone: '',
      tipoComunidad: '',
      latitud: null,
      longitud: null,
      cantidadViviendas: 0
    });
  }

  /**
   * Guarda o actualiza una comunidad
   */
  saveCommunity(): void {
    if (this.communityForm.invalid) {
      this.communityForm.markAllAsTouched();
      this.notificationService.showWarning(
        'Por favor, complete todos los campos requeridos correctamente',
        'Formulario incompleto'
      );
      return;
    }

    const formValue = this.communityForm.value;
    
    const request: CreateCommunityRequest | UpdateCommunityRequest = {
      nombre: formValue.nombre || '',
      descripcion: formValue.descripcion || '',
      direccion: formValue.direccion || '',
      contacto: formValue.contacto || '',
      email: formValue.email || '',
      phone: formValue.phone || '',
      tipoComunidad: formValue.tipoComunidad || '',
      latitud: formValue.latitud ?? null,
      longitud: formValue.longitud ?? null,
      cantidadViviendas: formValue.cantidadViviendas || 0
    };

    // Validar que tenemos un ID si estamos editando
    if (this.editingCommunityId && this.editingCommunityId.trim() !== '') {
      const communityId = this.editingCommunityId.trim();
      this.logger.debug('Updating community', 'ComunidadComponent', { 
        id: communityId,
        request 
      });
      
      // Validar formato de GUID
      const guidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!guidPattern.test(communityId)) {
        this.logger.error('Invalid GUID format', null, 'ComunidadComponent', { id: communityId });
        this.notificationService.showError(
          'El ID de la comunidad no tiene un formato válido',
          'Error'
        );
        return;
      }
      
      this.updateRequestSignal.set({ id: communityId, request: request as UpdateCommunityRequest });
      this.updateCommunityResource.refetch();
    } else {
      this.logger.debug('Creating new community', 'ComunidadComponent', { request });
      
      this.createRequestSignal.set(request as CreateCommunityRequest);
      this.createCommunityResource.refetch();
    }
  }
}
