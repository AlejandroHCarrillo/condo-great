import type { MudanzaType } from './../../../shared/interfaces/in-out.interface';
import { JsonPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormUtils } from '../../../utils/form-utils';
import { ShowFormErrorTemplateComponent } from '../../../shared/show-form-error-template/show-form-error-template.component';
import { colors } from '../../../shared/data/colors.data';

@Component({
  selector: 'hh-registro-mudanza',
  imports: [JsonPipe, ReactiveFormsModule, ShowFormErrorTemplateComponent],
  templateUrl: './registro-mudanza.component.html'
})
export class RegistroMudanzaComponent {
  private fb = inject(FormBuilder);
  formUtils = FormUtils;
  colores = [...colors];

  myForm: FormGroup = this.fb.group({
    in_out: ['', [Validators.required, Validators.minLength(5)]], //this.fb.control('', Validators.required),
    residentname: ['', [Validators.required, Validators.min(1)]], //this.fb.control(0, [Validators.required, Validators.min(0)]),
    address: ['', ], //this.fb.control(0, [Validators.required, Validators.min(0)])
    company: ['', ], //this.fb.control(0, [Validators.required, Validators.min(0)])
    carplates: ['', ], //this.fb.control(0, [Validators.required, Validators.min(0)])
    arriveDate: ['', [Validators.required]], //this.fb.control(0, [Validators.required, Validators.min(0)])
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
