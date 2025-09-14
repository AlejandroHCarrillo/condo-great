import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'hh-upload-image',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './upload-image.component.html'
})
export class UploadImageComponent {
  sanitizer = inject( DomSanitizer);
  
  imagenSeleccionada: File | null = null;
  vistaPrevia: SafeUrl | null = null;


  onArchivoSeleccionado(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.imagenSeleccionada = input.files[0];

      const reader = new FileReader();
      reader.onload = () => {
        this.vistaPrevia = this.sanitizer.bypassSecurityTrustUrl(reader.result as string);
      };
      reader.readAsDataURL(this.imagenSeleccionada);
    }
  }

  subirImagen() {
    if (this.imagenSeleccionada) {
      console.log('📤 Imagen lista para subir:', this.imagenSeleccionada.name);
      // Aquí podrías enviar la imagen a un servicio o API
    } else {
      console.warn('⚠️ No se ha seleccionado ninguna imagen');
    }
  }
}