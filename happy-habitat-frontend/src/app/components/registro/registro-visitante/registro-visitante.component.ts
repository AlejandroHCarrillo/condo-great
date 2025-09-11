import { JsonPipe, TitleCasePipe } from '@angular/common';
import { Component, inject, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormUtils } from '../../../utils/form-utils';
import { ShowFormErrorTemplateComponent } from '../../../shared/show-form-error-template/show-form-error-template.component';
import { colors } from '../../../shared/data/colors.data';

@Component({
  selector: 'hh-registro-visitante',
  imports: [JsonPipe, ReactiveFormsModule, ShowFormErrorTemplateComponent, TitleCasePipe],
  templateUrl: './registro-visitante.component.html'
})
export class RegistroVisitanteComponent {
  private fb = inject(FormBuilder);
  formUtils = FormUtils;

  colores = [...colors];

  myForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(5)]], //this.fb.control('', Validators.required),
    totalpersons: [1, [Validators.required, Validators.min(1)]], //this.fb.control(0, [Validators.required, Validators.min(0)]),
    cardescription: ['', ], //this.fb.control(0, [Validators.required, Validators.min(0)])
    carcolor: ['', ], //this.fb.control(0, [Validators.required, Validators.min(0)])
    carplates: ['', ], //this.fb.control(0, [Validators.required, Validators.min(0)])
    subject: ['', [Validators.required, Validators.minLength(10)]], //this.fb.control(0, [Validators.required, Validators.min(0)])
    arriveDate: ['', [Validators.required]], //this.fb.control(0, [Validators.required, Validators.min(0)])
    departureDate: ['', ], //this.fb.control(0, [Validators.required, Validators.min(0)])
  });

    onSave(): void {
    if (this.myForm.invalid) {
      this.myForm.markAllAsTouched();
      return;
    }

    console.log('Visitante registrado', this.myForm.value);

    this.myForm.reset({ name: '', price: 0, inStorage: 0 });
  }
}
