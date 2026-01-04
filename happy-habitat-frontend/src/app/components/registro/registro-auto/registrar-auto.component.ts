import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { VehiclesService } from '../../../services/vehicles.service';
import { UsersService } from '../../../services/users.service';
import { NotificationService } from '../../../services/notification.service';
import { LoggerService } from '../../../services/logger.service';
import { CreateVehicleRequest, VehicleDto } from '../../../shared/interfaces/vehicle.interface';
import { catchError, tap, of } from 'rxjs';
import { GenericListComponent, ColumnConfig } from "../../../shared/components/generic-list/generic-list.component";

@Component({
  selector: 'hh-registrar-auto',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, GenericListComponent],
  templateUrl: './registrar-auto.component.html'
})
export class RegistroAutoComponent implements OnInit {
  private fb = inject(FormBuilder);
  private vehiclesService = inject(VehiclesService);
  private usersService = inject(UsersService);
  private notificationService = inject(NotificationService);
  private logger = inject(LoggerService);

  isLoadingVehicles = signal(false);
  vehicles = signal<VehicleDto[]>([]);
  showModal = signal(false);
  
  // Año actual para validación del formulario
  currentYear = new Date().getFullYear();

  // Configuración de columnas para la lista
  vehicleColumns: ColumnConfig[] = [
    { 
      key: 'brand', 
      label: 'Marca',
      formatter: (value) => value ? value.charAt(0).toUpperCase() + value.slice(1) : '-'
    },
    { 
      key: 'model', 
      label: 'Modelo',
      formatter: (value) => value ? value.charAt(0).toUpperCase() + value.slice(1) : '-'
    },
    { 
      key: 'year', 
      label: 'Año',
      formatter: (value) => value ? value.toString() : '-'
    },
    { 
      key: 'color', 
      label: 'Color',
      formatter: (value) => value ? value.charAt(0).toUpperCase() + value.slice(1) : '-'
    },
    { 
      key: 'licensePlate', 
      label: 'Placas',
      formatter: (value) => value ? value.toUpperCase() : '-'
    },
    { 
      key: 'vehicleTypeName', 
      label: 'Tipo',
      formatter: (value) => value ? value.charAt(0).toUpperCase() + value.slice(1) : '-'
    },
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
  ];

  autoForm = this.fb.group({
    marca: ['', Validators.required],
    modelo: ['', Validators.required],
    año: [null as number | null, [Validators.required, Validators.min(1980), Validators.max(this.currentYear)]],
    color: ['', Validators.required],
    placas: ['', [Validators.required, Validators.pattern(/^[A-Z0-9\-]{6,10}$/)]]
  });

  ngOnInit(): void {
    this.loadVehicles();
  }

  /**
   * Carga los vehículos del residente actual usando el residentId del currentUser
   */
  loadVehicles(): void {
    this.isLoadingVehicles.set(true);
    console.log('Cargando vehículos');
    // Obtener el usuario actual del servicio
    const currentUser = this.usersService.getCurrentUser();
    console.log('Este es currentUser: ', currentUser);
    // Validar que existe el usuario y tiene residentInfo
    if (!currentUser) {
      this.logger.warn('No current user found. Cannot load vehicles.', 'RegistroAutoComponent');
      this.notificationService.showError(
        'No se encontró información del usuario. Por favor, inicie sesión nuevamente.',
        'Error de Usuario'
      );
      this.isLoadingVehicles.set(false);
      this.vehicles.set([]);
      return;
    }
    
    // Obtener el residentId del currentUser
    const residentId = currentUser.residentInfo?.id;
    console.log('Este es residentId para cargar vehículos: ', residentId);
    // Validar que existe el residentId
    if (!residentId || typeof residentId !== 'string' || residentId.trim() === '') {
      this.logger.warn('No valid resident ID found in current user. Cannot load vehicles.', 'RegistroAutoComponent', { 
        userId: currentUser.id,
        hasResidentInfo: !!currentUser.residentInfo 
      });
      this.notificationService.showWarning(
        'No se encontró información del residente asociado a su cuenta.',
        'Información no disponible'
      );
      this.isLoadingVehicles.set(false);
      this.vehicles.set([]);
      return;
    }
    
    // Cargar los vehículos usando el residentId del currentUser
    const residentIdString = residentId.trim();
    this.logger.debug('Loading vehicles for resident', 'RegistroAutoComponent', { residentId: residentIdString });
    
    this.vehiclesService.getVehiclesByResidentId(residentIdString).pipe(
      catchError((error) => {
        this.logger.error('Error loading vehicles', error, 'RegistroAutoComponent', { residentId: residentIdString });
        this.notificationService.showError(
          error.error?.message || 'Error al cargar los vehículos. Por favor, intente nuevamente.',
          'Error'
        );
        return of([]);
      })
    ).subscribe({
      next: (vehicles) => {
        this.vehicles.set(vehicles);
        this.isLoadingVehicles.set(false);
        this.logger.debug('Vehicles loaded successfully', 'RegistroAutoComponent', { 
          count: vehicles.length,
          residentId: residentIdString 
        });
      },
      error: () => {
        this.isLoadingVehicles.set(false);
        this.vehicles.set([]);
      }
    });
  }

  /**
   * Maneja el clic en una fila de la lista
   */
  onVehicleClick(vehicle: VehicleDto): void {
    // Aquí puedes implementar lógica adicional, como abrir un modal de detalles
    console.log('Vehículo seleccionado:', vehicle);
  }

  /**
   * Abre el modal de registro de vehículo
   */
  openNewVehicleModal(): void {
    this.showModal.set(true);
    setTimeout(() => {
      const modal = document.getElementById('newVehicleModal') as HTMLDialogElement;
      if (modal) {
        modal.showModal();
      }
    }, 0);
  }

  /**
   * Abre el modal para nuevo vehículo (sin datos)
   */
  openNewVehicleModalForCreate(): void {
    this.autoForm.reset({
      marca: '',
      modelo: '',
      año: null,
      color: '',
      placas: ''
    });
    this.openNewVehicleModal();
  }

  /**
   * Cierra el modal de registro de vehículo
   */
  closeModal(): void {
    const modal = document.getElementById('newVehicleModal') as HTMLDialogElement;
    if (modal) {
      modal.close();
    }
    this.showModal.set(false);
    // Resetear el formulario al cerrar
    this.autoForm.reset({
      marca: '',
      modelo: '',
      año: null,
      color: '',
      placas: ''
    });
  }

  registrarAuto() {
    if (this.autoForm.invalid) {
      this.autoForm.markAllAsTouched();
      this.notificationService.showWarning(
        'Por favor, complete todos los campos requeridos correctamente',
        'Formulario incompleto'
      );
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
    
    const residentIdString = residentId.trim();
    
    // Preparar el request para crear el vehículo
    const formValue = this.autoForm.value;
    
    // Obtener el tipo de vehículo: si el usuario ya tiene vehículos, usar el tipo del primero
    // Si no, mostrar un error indicando que se necesita seleccionar el tipo
    const existingVehicles = this.vehicles();
    let vehicleTypeId = '';
    
    if (existingVehicles.length > 0) {
      // Usar el tipo del primer vehículo existente como referencia
      vehicleTypeId = existingVehicles[0].vehicleTypeId;
    } else {
      // Si no hay vehículos existentes, necesitamos que el usuario seleccione el tipo
      // Por ahora, mostrar un mensaje de error
      this.notificationService.showError(
        'No se puede determinar el tipo de vehículo. Por favor, contacte al administrador o implemente un selector de tipos de vehículos.',
        'Tipo de vehículo requerido'
      );
      return;
    }
    
    const request: CreateVehicleRequest = {
      residentId: residentIdString,
      brand: formValue.marca || '',
      vehicleTypeId: vehicleTypeId,
      model: formValue.modelo || '',
      year: formValue.año || 0,
      color: formValue.color || '',
      licensePlate: formValue.placas || ''
    };

    // Crear el vehículo
    this.vehiclesService.createVehicle(request).pipe(
      tap((vehicle) => {
        if (vehicle) {
          this.notificationService.showSuccess(
            'Vehículo registrado exitosamente',
            'Éxito'
          );
          
          // Cerrar el modal
          this.closeModal();
          
          // Recargar la lista de vehículos
          this.loadVehicles();
        }
      }),
      catchError((error) => {
        this.notificationService.showError(
          error.error?.message || 'Error al registrar el vehículo. Por favor, intente nuevamente.',
          'Error'
        );
        return of(null);
      })
    ).subscribe();
  }
}