import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormUtils } from '../../../utils/form-utils';
import { ShowFormErrorTemplateComponent } from '../../../shared/show-form-error-template/show-form-error-template.component';
import { InOut } from '../../../shared/interfaces/in-out.interface';

@Component({
  selector: 'hh-registro-mudanza',
  imports: [CommonModule, ReactiveFormsModule, ShowFormErrorTemplateComponent],
  templateUrl: './registro-mudanza.component.html',
  styleUrl: './registro-mudanza.component.css'
})
export class RegistroMudanzaComponent {
  private fb = inject(FormBuilder);
  formUtils = FormUtils;
  isLoading = signal<boolean>(false);
  successMessage = signal<string | null>(null);
  errorMessage = signal<string | null>(null);

  // Opciones para el tipo de mudanza
  tipoMudanzaOptions = [
    { value: InOut.Ingreso, label: 'Ingreso' },
    { value: InOut.Salida, label: 'Salida' }
  ];

  myForm: FormGroup = this.fb.group({
    in_out: ['', [Validators.required]], // Tipo de mudanza: Ingreso o Salida
    residentname: ['', [Validators.required, Validators.minLength(3)]], // Nombre del residente
    address: ['', [Validators.required, Validators.minLength(5)]], // Dirección
    company: [''], // Compañía o vehículo (opcional)
    carplates: [''], // Placas del vehículo (opcional)
    arriveDate: ['', [Validators.required]], // Fecha de la mudanza
  });

  onSave(): void {
    if (this.myForm.invalid) {
      this.myForm.markAllAsTouched();
      this.errorMessage.set('Por favor, completa todos los campos requeridos.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const formValue = this.myForm.value;
    console.log('Mudanza registrada', formValue);

    // Aquí puedes hacer la llamada a la API para guardar la mudanza
    // Simular guardado (reemplazar con llamada real a la API)
    setTimeout(() => {
      this.isLoading.set(false);
      this.successMessage.set('Mudanza registrada exitosamente.');
      
      // Limpiar el mensaje después de 5 segundos
      setTimeout(() => {
        this.successMessage.set(null);
      }, 5000);

      // Resetear el formulario con valores por defecto
      this.myForm.reset({
        in_out: '',
        residentname: '',
        address: '',
        company: '',
        carplates: '',
        arriveDate: ''
      });
    }, 1000);
  }

  /**
   * Obtiene el nombre del tipo de mudanza
   */
  getTipoMudanzaLabel(value: InOut): string {
    const option = this.tipoMudanzaOptions.find(opt => opt.value === value);
    return option?.label || '';
  }
}
