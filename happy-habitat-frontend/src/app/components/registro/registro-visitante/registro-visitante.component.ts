import { JsonPipe, TitleCasePipe } from '@angular/common';
import { Component, inject, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormUtils } from '../../../utils/form-utils';
import { ShowFormErrorTemplateComponent } from '../../../shared/show-form-error-template/show-form-error-template.component';
import { colors } from '../../../shared/data/colors.data';

@Component({
  selector: 'hh-registro-visitante',
  imports: [JsonPipe, ReactiveFormsModule, ShowFormErrorTemplateComponent, TitleCasePipe],
  templateUrl: './registro-visitante.component.html',
  styleUrl: './registro-visitante.component.css'
})
export class RegistroVisitanteComponent {
  private fb = inject(FormBuilder);
  formUtils = FormUtils;

  colores = [...colors];

  myForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(5)]], 
    totalpersons: [1, [Validators.required, Validators.min(1)]], 
    cardescription: ['', ], 
    carcolor: ['', ], 
    carplates: ['', ], 
    subject: ['', [Validators.required, Validators.minLength(10)]], 
    arriveDate: ['', [Validators.required]], 
    departureDate: ['', ], 
  });

  onSave(): void {
    if (this.myForm.invalid) {
      this.myForm.markAllAsTouched();
      return;
    }

    console.log('Visitante registrado', this.myForm.value);

    // Resetear el formulario con valores por defecto
    this.myForm.reset({ 
      name: '', 
      totalpersons: 1, 
      cardescription: '', 
      carcolor: '', 
      carplates: '', 
      subject: '', 
      arriveDate: '', 
      departureDate: '' 
    });
  }
}
