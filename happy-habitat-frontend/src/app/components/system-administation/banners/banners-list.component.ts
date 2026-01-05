import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BannersService } from '../../../services/banners.service';
import { NotificationService } from '../../../services/notification.service';
import { LoggerService } from '../../../services/logger.service';
import { Banner, CreateBannerRequest, UpdateBannerRequest } from '../../../shared/interfaces/banner.interface';
import { GenericListComponent, ColumnConfig } from '../../../shared/components/generic-list/generic-list.component';
import { catchError, tap, throwError, of } from 'rxjs';

@Component({
  selector: 'hh-banners-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, GenericListComponent],
  templateUrl: './banners-list.component.html',
  styleUrl: './banners-list.component.css'
})
export class BannersListComponent implements OnInit {
  private bannersService = inject(BannersService);
  private notificationService = inject(NotificationService);
  private logger = inject(LoggerService);
  private fb = inject(FormBuilder);

  isLoadingBanners = signal(false);
  banners = signal<Banner[]>([]);
  showModal = signal(false);
  showDeleteModal = signal(false);
  bannerToDelete: Banner | null = null;
  editingBannerId: string | null = null;
  isSubmitting = signal(false);

  // Configuración de columnas para la lista
  bannerColumns: ColumnConfig[] = [
    { 
      key: 'title', 
      label: 'Título'
    },
    { 
      key: 'communityName', 
      label: 'Comunidad',
      formatter: (value) => value || 'Todas'
    },
    { 
      key: 'pathImagen', 
      label: 'Imagen',
      formatter: (value) => value || '-'
    },
    { 
      key: 'isActive', 
      label: 'Estado',
      formatter: (value) => value ? 'Activo' : 'Inactivo'
    },
    { 
      key: 'createdAt', 
      label: 'Fecha de creación',
      formatter: (value) => {
        if (!value) return '-';
        const date = new Date(value);
        return date.toLocaleDateString('es-ES', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        });
      }
    }
  ];

  bannerForm: FormGroup = this.fb.group({
    communityId: [null],
    pathImagen: ['', [Validators.required, Validators.minLength(3)]],
    title: ['', [Validators.required, Validators.minLength(3)]],
    text: ['', [Validators.required, Validators.minLength(10)]],
    isActive: [true],
    startDate: [null],
    endDate: [null]
  });

  ngOnInit(): void {
    this.loadBanners();
  }

  /**
   * Carga todos los banners
   */
  loadBanners(): void {
    this.isLoadingBanners.set(true);
    
    this.bannersService.getAllBanners().pipe(
      catchError((error) => {
        this.logger.error('Error loading banners', error, 'BannersListComponent');
        this.notificationService.showError(
          error.error?.message || 'Error al cargar los banners. Por favor, intente nuevamente.',
          'Error'
        );
        return of([]);
      })
    ).subscribe({
      next: (banners) => {
        this.banners.set(banners);
        this.isLoadingBanners.set(false);
        this.logger.debug('Banners loaded successfully', 'BannersListComponent', { 
          count: banners.length
        });
      },
      error: () => {
        this.isLoadingBanners.set(false);
        this.banners.set([]);
      }
    });
  }

  /**
   * Maneja el clic en una fila de la lista
   */
  onBannerClick(banner: Banner): void {
    console.log('Banner seleccionado:', banner);
  }

  /**
   * Maneja la edición de un banner
   */
  onEditBanner(banner: Banner): void {
    this.editingBannerId = banner.id;
    
    // Cargar los datos del banner en el formulario
    this.bannerForm.patchValue({
      communityId: banner.communityId || null,
      pathImagen: banner.pathImagen,
      title: banner.title,
      text: banner.text,
      isActive: banner.isActive,
      startDate: banner.startDate ? banner.startDate.split('T')[0] : null,
      endDate: banner.endDate ? banner.endDate.split('T')[0] : null
    });
    
    // Abrir el modal
    this.openNewBannerModal();
  }

  /**
   * Maneja la eliminación de un banner
   */
  onDeleteBanner(banner: Banner): void {
    this.bannerToDelete = banner;
    this.showDeleteModal.set(true);
    setTimeout(() => {
      const modal = document.getElementById('deleteBannerModal') as HTMLDialogElement;
      if (modal) {
        modal.showModal();
      }
    }, 0);
  }

  /**
   * Confirma la eliminación del banner
   */
  confirmDeleteBanner(): void {
    if (!this.bannerToDelete) {
      return;
    }

    const banner = this.bannerToDelete;
    
    this.bannersService.deleteBanner(banner.id).pipe(
      tap(() => {
        // Remover de la lista local inmediatamente
        this.banners.update(currentBanners => 
          currentBanners.filter(b => b.id !== banner.id)
        );
        
        this.notificationService.showSuccess(
          `Banner "${banner.title}" eliminado exitosamente`,
          'Éxito'
        );

        // Cerrar el modal de confirmación
        this.closeDeleteModal();
      }),
      catchError((error) => {
        this.notificationService.showError(
          error.error?.message || 'Error al eliminar el banner. Por favor, intente nuevamente.',
          'Error'
        );
        return throwError(() => error);
      })
    ).subscribe({
      next: () => {
        this.logger.debug(`Banner ${banner.id} deleted successfully`, 'BannersListComponent');
      },
      error: (error) => {
        this.logger.error('Error deleting banner', error, 'BannersListComponent');
      }
    });
  }

  /**
   * Cierra el modal de confirmación de eliminación
   */
  closeDeleteModal(): void {
    const modal = document.getElementById('deleteBannerModal') as HTMLDialogElement;
    if (modal) {
      modal.close();
    }
    this.showDeleteModal.set(false);
    this.bannerToDelete = null;
  }

  /**
   * Abre el modal de registro de banner
   */
  openNewBannerModal(): void {
    this.showModal.set(true);
    setTimeout(() => {
      const modal = document.getElementById('newBannerModal') as HTMLDialogElement;
      if (modal) {
        modal.showModal();
      }
    }, 0);
  }

  /**
   * Abre el modal para nuevo banner (sin datos)
   */
  openNewBannerModalForCreate(): void {
    this.editingBannerId = null;
    this.bannerForm.reset({
      communityId: null,
      pathImagen: '',
      title: '',
      text: '',
      isActive: true,
      startDate: null,
      endDate: null
    });
    this.openNewBannerModal();
  }

  /**
   * Cierra el modal de registro de banner
   */
  closeModal(): void {
    const modal = document.getElementById('newBannerModal') as HTMLDialogElement;
    if (modal) {
      modal.close();
    }
    this.showModal.set(false);
    this.editingBannerId = null;
    // Resetear el formulario al cerrar
    this.bannerForm.reset({
      communityId: null,
      pathImagen: '',
      title: '',
      text: '',
      isActive: true,
      startDate: null,
      endDate: null
    });
  }

  /**
   * Guarda o actualiza un banner
   */
  saveBanner(): void {
    if (this.bannerForm.invalid) {
      this.bannerForm.markAllAsTouched();
      this.notificationService.showWarning(
        'Por favor, complete todos los campos requeridos correctamente',
        'Formulario incompleto'
      );
      return;
    }

    const formValue = this.bannerForm.value;
    
    if (this.isSubmitting()) {
      return;
    }

    this.isSubmitting.set(true);

    // Si estamos editando, actualizar; si no, crear
    const bannerOperation = this.editingBannerId
      ? this.bannersService.updateBanner(this.editingBannerId, {
          communityId: formValue.communityId || null,
          pathImagen: formValue.pathImagen || '',
          title: formValue.title || '',
          text: formValue.text || '',
          isActive: formValue.isActive ?? true,
          startDate: formValue.startDate || null,
          endDate: formValue.endDate || null
        } as UpdateBannerRequest)
      : this.bannersService.createBanner({
          communityId: formValue.communityId || null,
          pathImagen: formValue.pathImagen || '',
          title: formValue.title || '',
          text: formValue.text || '',
          isActive: formValue.isActive ?? true,
          startDate: formValue.startDate || null,
          endDate: formValue.endDate || null
        } as CreateBannerRequest);

    bannerOperation.pipe(
      tap(() => {
        const action = this.editingBannerId ? 'actualizado' : 'creado';
        this.notificationService.showSuccess(
          `Banner ${action} exitosamente`,
          'Éxito'
        );
        
        // Resetear el formulario
        this.bannerForm.reset({
          communityId: null,
          pathImagen: '',
          title: '',
          text: '',
          isActive: true,
          startDate: null,
          endDate: null
        });
        
        // Resetear el estado de envío
        this.isSubmitting.set(false);
        
        // Cerrar el modal
        this.closeModal();
        
        // Recargar la lista de banners
        this.loadBanners();
      }),
      catchError((error) => {
        const action = this.editingBannerId ? 'actualizar' : 'crear';
        this.notificationService.showError(
          error.error?.message || `Error al ${action} el banner. Por favor, intente nuevamente.`,
          'Error'
        );
        // Resetear el estado de envío en caso de error
        this.isSubmitting.set(false);
        throw error;
      })
    ).subscribe({
      next: () => {
        // Operación exitosa
      },
      error: () => {
        // Error ya manejado
      }
    });
  }
}

