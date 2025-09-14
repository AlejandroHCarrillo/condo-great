import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { UploadImageComponent } from "../../../shared/upload-image/upload-image.component";

@Component({
  selector: 'hh-regist-pet',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, UploadImageComponent],
  templateUrl: './registrar-mascota.component.html'
})
export class RegistroMascotaComponent {
    fb = inject(FormBuilder);

  mascotaForm = this.fb.group({
    id: [null, Validators.required],
    nombre: ['', Validators.required],
    especie: ['', Validators.required],
    raza: [''],
    edad: [null, [Validators.required, Validators.min(0)]],
    color: ['', Validators.required],
    idResidente: [null, Validators.required]
  });

  registrarMascota() {
    if (this.mascotaForm.valid) {
      const nuevaMascota = this.mascotaForm.value;
      console.log('🐾 Mascota registrada:', nuevaMascota);
      // Aquí podrías enviar los datos a una API o servicio
    } else {
      console.warn('⚠️ Formulario inválido');
    }
  }
}