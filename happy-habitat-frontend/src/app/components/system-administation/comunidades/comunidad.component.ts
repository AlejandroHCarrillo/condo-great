import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { tipoComunidadEnum } from '../../../enums/tipo-comunidad.enum';
import { Router } from '@angular/router';

@Component({
  selector: 'app-unidad-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './comunidad.component.html',
})
export class ComunidadComponent {
  router = inject(Router);
  private fb = inject(FormBuilder);

  tipos = Object.values(tipoComunidadEnum);

  myForm = this.fb.group({
    tipoUnidadHabitacional: ['', Validators.required],
    nombre: ['', Validators.required],
    ubicacion: ['', Validators.required],
    latlng: this.fb.group({
      lat: [null],
      lng: [null],
    }),
    cantidadviviendas: [0, [Validators.required, Validators.min(1)]],
    contacto: ['', Validators.required],
  });

  submit() {
    if (this.myForm.valid) {
      console.log('Unidad registrada:', this.myForm.value);
    } else {
      console.warn('Formulario inválido');
    }
  }

  goBack() {
    // console.log('Method not implemented.');
    this.router.navigate(['/sysadmin']);
  }
}