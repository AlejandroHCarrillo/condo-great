import { JsonPipe, TitleCasePipe } from '@angular/common';
import { Component, inject, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormUtils } from '../../../utils/form-utils';
import { ShowFormErrorTemplateComponent } from '../../../shared/show-form-error-template/show-form-error-template.component';
import { colors } from '../../../shared/data/colors.data';
import { ResidentVisitsService } from '../../../services/resident-visits.service';
import { UsersService } from '../../../services/users.service';
import { NotificationService } from '../../../services/notification.service';
import { CreateResidentVisitRequest } from '../../../shared/interfaces/resident-visit.interface';
import { catchError, switchMap, tap } from 'rxjs';

@Component({
  selector: 'hh-registro-visitante',
  imports: [JsonPipe, ReactiveFormsModule, ShowFormErrorTemplateComponent, TitleCasePipe],
  templateUrl: './registro-visitante.component.html',
  styleUrl: './registro-visitante.component.css'
})
export class RegistroVisitanteComponent {
  private fb = inject(FormBuilder);
  private residentVisitsService = inject(ResidentVisitsService);
  private usersService = inject(UsersService);
  private notificationService = inject(NotificationService);
  
  formUtils = FormUtils;
  colores = [...colors];
  isSubmitting = false;

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

    this.isSubmitting = true;

    // Primero obtener el residentId del usuario actual
    this.usersService.getCurrentUserResidentId().pipe(
      switchMap((residentId) => {
        // Preparar el request para crear la visita
        const formValue = this.myForm.value;
        const request: CreateResidentVisitRequest = {
          residentId: residentId,
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

        // Crear la visita
        return this.residentVisitsService.createVisit(request);
      }),
      tap(() => {
        this.notificationService.showSuccess(
          'Visitante registrado exitosamente',
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
      }),
      catchError((error) => {
        this.notificationService.showError(
          error.error?.message || 'Error al registrar el visitante. Por favor, intente nuevamente.',
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
