import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'hh-registrar-auto',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './registrar-auto.component.html'
})
export class RegistroAutoComponent {
  fb = inject(FormBuilder);

  autoForm = this.fb.group({
    id: [null, Validators.required],
    marca: ['', Validators.required],
    modelo: ['', Validators.required],
    año: [null, [Validators.required, Validators.min(1980), Validators.max(new Date().getFullYear())]],
    color: ['', Validators.required],
    placas: ['', [Validators.required, Validators.pattern(/^[A-Z0-9\-]{6,10}$/)]],
    idResidente: [null, Validators.required]
  });

  registrarAuto() {
    if (this.autoForm.valid) {
      const nuevoAuto = this.autoForm.value;
      console.log('🚗 Auto registrado:', nuevoAuto);
      // Aquí podrías enviarlo a una API o servicio
    } else {
      console.warn('⚠️ Formulario inválido');
    }
  }
}