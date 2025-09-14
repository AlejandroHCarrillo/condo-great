import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-agregar-comentario',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-comment.component.html'
})
export class AgregarComentarioComponent {
  fb = inject(FormBuilder);
  comentarioForm = this.fb.group({
    postId: [null, Validators.required],
    autorId: [null, Validators.required],
    contenido: ['', [Validators.required, Validators.maxLength(500)]]
  });

  enviarComentario() {
    if (this.comentarioForm.valid) {
      const comentario = {
        ...this.comentarioForm.value,
        fechaCreacion: new Date()
      };
      console.log('💬 Comentario enviado:', comentario);
      // Aquí podrías enviarlo a una API o servicio
    } else {
      console.warn('⚠️ Formulario inválido');
    }
  }
}