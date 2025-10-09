import { SelectOption } from './../../shared/interfaces/select-option.inteface';
import { ReactiveFormsModule, FormBuilder, Validators, FormControl, FormArray } from '@angular/forms';
import { Component, inject } from '@angular/core';
import { FormUtils } from '../../utils/form-utils';
import { rolesData } from '../../shared/data/roles.data';
import { JsonPipe } from '@angular/common';
import { ShowFormErrorTemplateComponent } from '../../shared/show-form-error-template/show-form-error-template.component';
import { comunidadesData } from '../../shared/data/comunidades.data';
import { ComunidadMapper } from '../proveedores-residentes/mappers/comunidad-selectoption.mapper';
import { Router } from '@angular/router';

@Component({
  selector: 'hh-amenidad',
  imports: [ReactiveFormsModule, ShowFormErrorTemplateComponent, JsonPipe],
  templateUrl: './amenidad.component.html',
  styles: ``
})

export class AmenidadComponent {
  router = inject(Router);
  fb = inject(FormBuilder);
  formUtils = FormUtils;

  myForm = this.fb.group({
    nombre: ['', Validators.required],
    descripcion: ['', Validators.required],
    reglas: ['', [Validators.required]],
    costo: [0, [Validators.required, Validators.minLength(10)]],
    imagen: ['']
  });

  onSave(): void {
    if (this.myForm.invalid) {
      this.myForm.markAllAsTouched();
      return;
    }

    console.log('Formulario enviado', this.myForm.value);
    // console.log(fg.controls.length);

    this.myForm.reset();
  }


  goBack() {
    // console.log('Method not implemented.');
    this.router.navigate(['/amenidades/list']);
  }

  

}
