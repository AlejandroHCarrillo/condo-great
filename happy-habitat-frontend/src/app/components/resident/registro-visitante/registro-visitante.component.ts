import { TitleCasePipe } from '@angular/common';
import { Component, inject, CUSTOM_ELEMENTS_SCHEMA, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormUtils } from '../../../utils/form-utils';
import { ShowFormErrorTemplateComponent } from '../../../shared/show-form-error-template/show-form-error-template.component';
import { colors } from '../../../shared/data/colors.data';
import { ResidentVisitsService } from '../../../services/resident-visits.service';
import { UsersService } from '../../../services/users.service';
import { NotificationService } from '../../../services/notification.service';
import { CreateResidentVisitRequest, ResidentVisitDto, UpdateResidentVisitRequest } from '../../../shared/interfaces/resident-visit.interface';
import { catchError, tap, throwError, of } from 'rxjs';
import { GenericListComponent, ColumnConfig } from '../../../shared/components/generic-list/generic-list.component';

@Component({
  selector: 'hh-registro-visitante',
  imports: [ReactiveFormsModule, ShowFormErrorTemplateComponent, TitleCasePipe, GenericListComponent],
  templateUrl: './registro-visitante.component.html',
  styleUrl: './registro-visitante.component.css'
})
export class RegistroVisitanteComponent implements OnInit {
  private fb = inject(FormBuilder);
  private residentVisitsService = inject(ResidentVisitsService);
  private usersService = inject(UsersService);
  private notificationService = inject(NotificationService);
  
  formUtils = FormUtils;
  colores = [...colors];
  isSubmitting = false;
  isLoadingVisits = signal(false);
  visits = signal<ResidentVisitDto[]>([]);
  editingVisitId: string | null = null;

  // Configuración de columnas para la lista
  visitColumns: ColumnConfig[] = [
    { 
      key: 'visitorName', 
      label: 'Visitante'
    },
    { 
      key: 'subject', 
      label: 'Motivo',
      formatter: (value) => value || '-'
    },
    { 
      key: 'arrivalDate', 
      label: 'Fecha de ingreso',
      formatter: (value) => {
        if (!value) return '-';
        const date = new Date(value);
        return date.toLocaleDateString('es-ES', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
    },
    { 
      key: 'departureDate', 
      label: 'Fecha de salida',
      formatter: (value) => {
        if (!value) return '-';
        const date = new Date(value);
        return date.toLocaleDateString('es-ES', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
    },
    { 
      key: 'vehicleColor', 
      label: 'Color vehículo',
      formatter: (value) => value ? value.charAt(0).toUpperCase() + value.slice(1) : '-'
    },
    { 
      key: 'licensePlate', 
      label: 'Placas',
      formatter: (value) => value || '-'
    }
  ];

  // Motivos de visita predefinidos
  motivosVisita = [
    'Visita personal',
    'Entrega de Comida',
    'Paquetería',
    'Reparación técnica',
    'Construcción / Remodelación',
    'Otro, especifique en el campo de texto'
  ];

  myForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(5)]], 
    totalpersons: [1, [Validators.required, Validators.min(1)]], 
    quickSubject: [''], // Combo de selección rápida
    subject: ['', [Validators.required, Validators.minLength(10)]], 
    cardescription: ['', ], 
    carcolor: ['', ], 
    carplates: ['', ], 
    arriveDate: ['', [Validators.required]], 
    departureDate: ['', ], 
  });

  ngOnInit(): void {
    this.loadVisits();
  }

  /**
   * Carga las visitas del residente actual
   */
  loadVisits(): void {
    this.isLoadingVisits.set(true);
    
    const currentUser = this.usersService.getCurrentUser();
    
    if (!currentUser) {
      this.notificationService.showError(
        'No se encontró información del usuario. Por favor, inicie sesión nuevamente.',
        'Error de Usuario'
      );
      this.isLoadingVisits.set(false);
      this.visits.set([]);
      return;
    }
    
    const residentId = currentUser.residentInfo?.id;
    
    if (!residentId || typeof residentId !== 'string' || residentId.trim() === '') {
      this.notificationService.showWarning(
        'No se encontró información del residente asociado a su cuenta.',
        'Información no disponible'
      );
      this.isLoadingVisits.set(false);
      this.visits.set([]);
      return;
    }
    
    const residentIdString = residentId.trim();
    
    this.residentVisitsService.getVisitsByResidentId(residentIdString).pipe(
      catchError((error) => {
        this.notificationService.showError(
          error.error?.message || 'Error al cargar las visitas. Por favor, intente nuevamente.',
          'Error'
        );
        return of([]);
      })
    ).subscribe({
      next: (visits) => {
        // Ordenar visitas de más reciente a más antigua por fecha de llegada
        const sortedVisits = [...visits].sort((a, b) => {
          const dateA = new Date(a.arrivalDate).getTime();
          const dateB = new Date(b.arrivalDate).getTime();
          return dateB - dateA; // Orden descendente (más reciente primero)
        });
        this.visits.set(sortedVisits);
        this.isLoadingVisits.set(false);
      },
      error: () => {
        this.isLoadingVisits.set(false);
        this.visits.set([]);
      }
    });
  }

  /**
   * Verifica si una visita es futura (puede ser editada/eliminada)
   * Compara solo las fechas sin considerar la hora
   */
  isFutureVisit = (visit: ResidentVisitDto): boolean => {
    if (!visit.arrivalDate) return false;
    const arrivalDate = new Date(visit.arrivalDate);
    const today = new Date();
    
    // Resetear las horas para comparar solo fechas
    arrivalDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    
    // La visita es futura si la fecha de llegada es hoy o después
    return arrivalDate >= today;
  }

  /**
   * Maneja el clic en una fila de la lista
   */
  onVisitClick(visit: ResidentVisitDto): void {
    console.log('Visita seleccionada:', visit);
  }

  /**
   * Maneja la edición de una visita (solo si es futura)
   */
  onEditVisit(visit: ResidentVisitDto): void {
    if (!this.isFutureVisit(visit)) {
      this.notificationService.showWarning(
        'Solo se pueden modificar las visitas futuras.',
        'Acción no permitida'
      );
      return;
    }

    this.editingVisitId = visit.id;
    
    // Cargar los datos de la visita en el formulario
    const arrivalDate = new Date(visit.arrivalDate);
    const departureDate = visit.departureDate ? new Date(visit.departureDate) : null;
    
    this.myForm.patchValue({
      name: visit.visitorName,
      totalpersons: visit.totalPeople,
      subject: visit.subject,
      carcolor: visit.vehicleColor || '',
      carplates: visit.licensePlate || '',
      arriveDate: arrivalDate.toISOString().split('T')[0],
      departureDate: departureDate ? departureDate.toISOString().split('T')[0] : ''
    });

    // Scroll al formulario
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /**
   * Maneja la eliminación de una visita
   */
  onDeleteVisit(visit: ResidentVisitDto): void {
    if (!this.isFutureVisit(visit)) {
      this.notificationService.showWarning(
        'Solo se pueden eliminar las visitas futuras.',
        'Acción no permitida'
      );
      return;
    }

    if (confirm(`¿Está seguro de que desea eliminar la visita de ${visit.visitorName}?`)) {
      this.residentVisitsService.deleteVisit(visit.id).pipe(
        tap(() => {
          // Eliminar de la lista y mantener el orden (más reciente primero)
          this.visits.update(currentVisits => {
            const filtered = currentVisits.filter(v => v.id !== visit.id);
            // Reordenar después de eliminar
            return filtered.sort((a, b) => {
              const dateA = new Date(a.arrivalDate).getTime();
              const dateB = new Date(b.arrivalDate).getTime();
              return dateB - dateA;
            });
          });
          
          this.notificationService.showSuccess(
            `Visita de ${visit.visitorName} eliminada exitosamente`,
            'Éxito'
          );
        }),
        catchError((error) => {
          this.notificationService.showError(
            error.error?.message || 'Error al eliminar la visita. Por favor, intente nuevamente.',
            'Error'
          );
          return throwError(() => error);
        })
      ).subscribe();
    }
  }

  /**
   * Maneja la selección de un motivo rápido
   */
  onQuickSubjectChange(): void {
    const quickSubject = this.myForm.get('quickSubject')?.value;
    if (quickSubject) {
      this.myForm.patchValue({ subject: quickSubject });
    }
  }

  onSave(): void {
    if (this.myForm.invalid) {
      this.myForm.markAllAsTouched();
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
    
    // Preparar el request para crear la visita
    const formValue = this.myForm.value;
    const request: CreateResidentVisitRequest = {
      residentId: residentIdString,
      visitorName: formValue.name,
      totalPeople: formValue.totalpersons,
      vehicleColor: formValue.carcolor || null,
      licensePlate: formValue.carplates || null,
      subject: formValue.subject,
      arrivalDate: new Date(formValue.arriveDate).toISOString(),
      departureDate: formValue.departureDate 
        ? new Date(formValue.departureDate).toISOString() 
        : null
    };

    // Si estamos editando, actualizar; si no, crear
    const visitOperation = this.editingVisitId
      ? this.residentVisitsService.updateVisit(this.editingVisitId, {
          residentId: residentIdString,
          visitorName: formValue.name,
          totalPeople: formValue.totalpersons,
          vehicleColor: formValue.carcolor || null,
          licensePlate: formValue.carplates || null,
          subject: formValue.subject,
          arrivalDate: new Date(formValue.arriveDate).toISOString(),
          departureDate: formValue.departureDate 
            ? new Date(formValue.departureDate).toISOString() 
            : null
        } as UpdateResidentVisitRequest)
      : this.residentVisitsService.createVisit(request);

    visitOperation.pipe(
      tap(() => {
        const action = this.editingVisitId ? 'actualizada' : 'registrada';
        this.notificationService.showSuccess(
          `Visita ${action} exitosamente`,
          'Éxito'
        );
        
        // Resetear el formulario con valores por defecto
        this.myForm.reset({ 
          name: '', 
          totalpersons: 1, 
          quickSubject: '',
          cardescription: '', 
          carcolor: '', 
          carplates: '', 
          subject: '', 
          arriveDate: '', 
          departureDate: '' 
        });
        
        // Limpiar el ID de edición
        this.editingVisitId = null;
        
        // Recargar la lista de visitas (ya ordenada en loadVisits)
        this.loadVisits();
      }),
      catchError((error) => {
        this.notificationService.showError(
          error.error?.message || 'Error al registrar el visitante. Por favor, intente nuevamente.',
          'Error'
        );
        return throwError(() => error);
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
