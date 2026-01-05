import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { UploadImageComponent } from "../../../shared/upload-image/upload-image.component";
import { PetsService } from '../../../services/pets.service';
import { UsersService } from '../../../services/users.service';
import { NotificationService } from '../../../services/notification.service';
import { LoggerService } from '../../../services/logger.service';
import { CreatePetRequest, PetDto, UpdatePetRequest } from '../../../shared/interfaces/pet.interface';
import { catchError, tap, throwError, of } from 'rxjs';
import { GenericListComponent, ColumnConfig } from "../../../shared/components/generic-list/generic-list.component";

@Component({
  selector: 'hh-regist-pet',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, UploadImageComponent, GenericListComponent],
  templateUrl: './registrar-mascota.component.html'
})
export class RegistroMascotaComponent implements OnInit {
  private fb = inject(FormBuilder);
  private petsService = inject(PetsService);
  private usersService = inject(UsersService);
  private notificationService = inject(NotificationService);
  private logger = inject(LoggerService);

  isSubmitting = false;
  isLoadingPets = signal(false);
  pets = signal<PetDto[]>([]);
  showModal = signal(false);
  showDeleteModal = signal(false);
  petToDelete: PetDto | null = null;
  editingPetId: string | null = null; // ID de la mascota que se está editando

  // Configuración de columnas para la lista
  petColumns: ColumnConfig[] = [
    { 
      key: 'name', 
      label: 'Nombre'
    },
    { 
      key: 'species', 
      label: 'Especie',
      formatter: (value) => value ? value.charAt(0).toUpperCase() + value.slice(1) : '-'
    },
    { 
      key: 'breed', 
      label: 'Raza',
      formatter: (value) => value || '-'
    },
    { 
      key: 'age', 
      label: 'Edad',
      formatter: (value) => value ? `${value} año${value !== 1 ? 's' : ''}` : '-'
    },
    { 
      key: 'color', 
      label: 'Color',
      formatter: (value) => value ? value.charAt(0).toUpperCase() + value.slice(1) : '-'
    },
    /*
    { 
      key: 'createdAt', 
      label: 'Fecha de registro',
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
    */
  ];

  mascotaForm = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(2)]],
    especie: ['', [Validators.required, Validators.minLength(2)]],
    raza: [''],
    edad: [null as number | null, [Validators.required, Validators.min(0), Validators.max(30)]],
    color: ['', [Validators.required, Validators.minLength(2)]]
  });

  ngOnInit(): void {
    this.loadPets();
  }

  /**
   * Carga las mascotas del residente actual usando el residentId del currentUser
   */
  loadPets(): void {
    this.isLoadingPets.set(true);
    
    // Obtener el usuario actual del servicio
    const currentUser = this.usersService.getCurrentUser();
    
    // Validar que existe el usuario y tiene residentInfo
    if (!currentUser) {
      this.logger.warn('No current user found. Cannot load pets.', 'RegistroMascotaComponent');
      this.notificationService.showError(
        'No se encontró información del usuario. Por favor, inicie sesión nuevamente.',
        'Error de Usuario'
      );
      this.isLoadingPets.set(false);
      this.pets.set([]);
      return;
    }
    
    // Obtener el residentId del currentUser
    const residentId = currentUser.residentInfo?.id;
    
    // Validar que existe el residentId
    if (!residentId || typeof residentId !== 'string' || residentId.trim() === '') {
      this.logger.warn('No valid resident ID found in current user. Cannot load pets.', 'RegistroMascotaComponent', { 
        userId: currentUser.id,
        hasResidentInfo: !!currentUser.residentInfo 
      });
      this.notificationService.showWarning(
        'No se encontró información del residente asociado a su cuenta.',
        'Información no disponible'
      );
      this.isLoadingPets.set(false);
      this.pets.set([]);
      return;
    }
    
    // Cargar las mascotas usando el residentId del currentUser
    const residentIdString = residentId.trim();
    this.logger.debug('Loading pets for resident', 'RegistroMascotaComponent', { residentId: residentIdString });
    
    this.petsService.getPetsByResidentId(residentIdString).pipe(
      catchError((error) => {
        this.logger.error('Error loading pets', error, 'RegistroMascotaComponent', { residentId: residentIdString });
        this.notificationService.showError(
          error.error?.message || 'Error al cargar las mascotas. Por favor, intente nuevamente.',
          'Error'
        );
        return of([]);
      })
    ).subscribe({
      next: (pets) => {
        this.pets.set(pets);
        this.isLoadingPets.set(false);
        this.logger.debug('Pets loaded successfully', 'RegistroMascotaComponent', { 
          count: pets.length,
          residentId: residentIdString 
        });
      },
      error: () => {
        this.isLoadingPets.set(false);
        this.pets.set([]);
      }
    });
  }

  /**
   * Maneja el clic en una fila de la lista
   */
  onPetClick(pet: PetDto): void {
    // Aquí puedes implementar lógica adicional, como abrir un modal de detalles
    console.log('Mascota seleccionada:', pet);
  }

  /**
   * Maneja la edición de una mascota
   */
  onEditPet(pet: PetDto): void {
    this.editingPetId = pet.id;
    
    // Cargar los datos de la mascota en el formulario
    this.mascotaForm.patchValue({
      nombre: pet.name,
      especie: pet.species,
      raza: pet.breed || '',
      edad: pet.age,
      color: pet.color
    });
    
    // Abrir el modal
    this.openNewPetModal();
  }

  /**
   * Maneja la eliminación de una mascota
   */
  onDeletePet(pet: PetDto): void {
    this.petToDelete = pet;
    this.showDeleteModal.set(true);
    setTimeout(() => {
      const modal = document.getElementById('deletePetModal') as HTMLDialogElement;
      if (modal) {
        modal.showModal();
      }
    }, 0);
  }

  /**
   * Confirma la eliminación de la mascota
   */
  confirmDeletePet(): void {
    if (!this.petToDelete) {
      return;
    }

    const pet = this.petToDelete;
    
    this.petsService.deletePet(pet.id).pipe(
      tap(() => {
        // Remover de la lista local inmediatamente
        this.pets.update(currentPets => 
          currentPets.filter(p => p.id !== pet.id)
        );
        
        this.notificationService.showSuccess(
          `Mascota ${pet.name} eliminada exitosamente`,
          'Éxito'
        );

        // Elimina la mascota de la lista local
        // this.loadPets();
        this.pets.set(this.pets().filter(p => p.id !== pet.id));

        // Cerrar el modal de confirmación
        this.closeDeleteModal();
      }),
      catchError((error) => {
        this.notificationService.showError(
          error.error?.message || 'Error al eliminar la mascota. Por favor, intente nuevamente.',
          'Error'
        );
        return throwError(() => error);
      })
    ).subscribe({
      next: () => {
        // La eliminación fue exitosa, la lista ya fue actualizada en el tap
        this.logger.debug(`Pet ${pet.id} deleted successfully`, 'RegistroMascotaComponent');
      },
      error: (error) => {
        this.logger.error('Error deleting pet', error, 'RegistroMascotaComponent');
      }
    });
  }

  /**
   * Cierra el modal de confirmación de eliminación
   */
  closeDeleteModal(): void {
    const modal = document.getElementById('deletePetModal') as HTMLDialogElement;
    if (modal) {
      modal.close();
    }
    this.showDeleteModal.set(false);
    this.petToDelete = null;
  }

  /**
   * Abre el modal de registro de mascota
   */
  openNewPetModal(): void {
    this.showModal.set(true);
    // Usar el método showModal() del elemento dialog
    setTimeout(() => {
      const modal = document.getElementById('newPetModal') as HTMLDialogElement;
      if (modal) {
        modal.showModal();
      }
    }, 0);
  }

  /**
   * Abre el modal para nueva mascota (sin datos)
   */
  openNewPetModalForCreate(): void {
    this.editingPetId = null;
    this.mascotaForm.reset({
      nombre: '',
      especie: '',
      raza: '',
      edad: null,
      color: ''
    });
    this.openNewPetModal();
  }

  /**
   * Cierra el modal de registro de mascota
   */
  closeModal(): void {
    const modal = document.getElementById('newPetModal') as HTMLDialogElement;
    if (modal) {
      modal.close();
    }
    this.showModal.set(false);
    this.editingPetId = null;
    // Resetear el formulario al cerrar
    this.mascotaForm.reset({
      nombre: '',
      especie: '',
      raza: '',
      edad: null,
      color: ''
    });
  }

  registrarMascota() {
    if (this.mascotaForm.invalid) {
      this.mascotaForm.markAllAsTouched();
      this.notificationService.showWarning(
        'Por favor, complete todos los campos requeridos correctamente',
        'Formulario incompleto'
      );
      return;
    }

    if (this.isSubmitting) {
      return;
    }

    // Obtener el usuario actual del servicio
    const currentUser = this.usersService.getCurrentUser();
    
    // Validar que existe el usuario y tiene residentInfo
    if (!currentUser) {
      this.notificationService.showError(
        'No se encontró información del usuario. Por favor, inicie sesión nuevamente.',
        'Error de Usuario'
      );
      return;
    }
    
    // Obtener el residentId del currentUser
    const residentId = currentUser.residentInfo?.id;
    
    // Validar que existe el residentId
    if (!residentId || typeof residentId !== 'string' || residentId.trim() === '') {
      this.notificationService.showError(
        'No se pudo obtener el ID del residente. Por favor, inicie sesión nuevamente.',
        'Error de Residente'
      );
      return;
    }

    this.isSubmitting = true;
    const residentIdString = residentId.trim();
    const formValue = this.mascotaForm.value;
    
    // Si estamos editando, actualizar; si no, crear
    const petOperation = this.editingPetId
      ? this.petsService.updatePet(this.editingPetId, {
          residentId: residentIdString,
          name: formValue.nombre || '',
          species: formValue.especie || '',
          breed: formValue.raza || '',
          age: formValue.edad || 0,
          color: formValue.color || ''
        } as UpdatePetRequest)
      : this.petsService.createPet({
          residentId: residentIdString,
          name: formValue.nombre || '',
          species: formValue.especie || '',
          breed: formValue.raza || '',
          age: formValue.edad || 0,
          color: formValue.color || ''
        } as CreatePetRequest);

    petOperation.pipe(
      tap(() => {
        const action = this.editingPetId ? 'actualizada' : 'registrada';
        this.notificationService.showSuccess(
          `Mascota ${action} exitosamente`,
          'Éxito'
        );
        
        // Resetear el formulario
        this.mascotaForm.reset({
          nombre: '',
          especie: '',
          raza: '',
          edad: null,
          color: ''
        });
        
        // Cerrar el modal
        this.closeModal();
        
        // Recargar la lista de mascotas
        this.loadPets();
      }),
      catchError((error) => {
        const action = this.editingPetId ? 'actualizar' : 'registrar';
        this.notificationService.showError(
          error.error?.message || `Error al ${action} la mascota. Por favor, intente nuevamente.`,
          'Error'
        );
        throw error;
      })
    ).subscribe({
      next: () => {
        this.isSubmitting = false;
      },
      error: () => {
        this.isSubmitting = false;
      }
    });
  }
}