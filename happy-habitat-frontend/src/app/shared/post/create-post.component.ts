import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'hh-crear-post',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-post.component.html'
})
export class CreatePostComponent {
  fb = inject(FormBuilder);
  postForm = this.fb.group({
    titulo: ['', [Validators.required, Validators.maxLength(100)]],
    contenido: ['', Validators.required],
    autorId: [null, Validators.required],
    etiquetas: [''],
    imagenUrl: [''],
    esDestacado: [false]
  });

//   constructor(private fb: FormBuilder) {}

  crearPost() {
    if (this.postForm.valid) {
      const post = {
        ...this.postForm.value,
        fechaCreacion: new Date(),
        etiquetas: this.postForm.value.etiquetas?.split(',').map(e => e.trim())
      };
      console.log('✅ Post creado:', post);
      // Aquí podrías enviar el post a una API o servicio
    } else {
      console.warn('⚠️ Formulario inválido');
    }
  }
}