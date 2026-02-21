import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EncuestasService } from '../../../services/encuestas.service';
import { AuthService } from '../../../services/auth.service';
import { Encuesta } from '../../../shared/interfaces/encuesta.interface';

@Component({
  selector: 'hh-encuesta-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './encuesta-detail.component.html'
})
export class EncuestaDetailComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private encuestasService = inject(EncuestasService);
  private authService = inject(AuthService);

  encuesta = signal<Encuesta | null>(null);
  isLoading = signal<boolean>(true);

  constructor() {
    this.route.params.subscribe((params) => {
      const id = params['id'];
      if (id) {
        this.loadEncuesta(id);
      }
    });
  }

  loadEncuesta(id: string): void {
    this.isLoading.set(true);
    this.encuestasService.getById(id).subscribe({
      next: (item) => {
        this.encuesta.set(item);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.router.navigate(['/admincompany/encuestas']);
      }
    });
  }

  getComunidadNombre(e: Encuesta): string {
    return (
      e.communityName ??
      this.authService.currentUser()?.communities?.find((com) => com.id === e.communityId)?.nombre ??
      'Sin comunidad'
    );
  }

  formatDate(value: string): string {
    if (!value) return '-';
    return new Date(value).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  goBack(): void {
    const comunidadId = this.route.snapshot.queryParams['comunidad'];
    if (comunidadId) {
      this.router.navigate(['/admincompany/encuestas'], { queryParams: { comunidad: comunidadId } });
    } else {
      this.router.navigate(['/admincompany/encuestas']);
    }
  }
}
