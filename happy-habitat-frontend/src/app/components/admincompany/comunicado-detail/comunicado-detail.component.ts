import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ComunicadosService } from '../../../services/comunicados.service';
import { Comunicado } from '../../../shared/interfaces/comunicado.interface';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'hh-comunicado-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './comunicado-detail.component.html'
})
export class ComunicadoDetailComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private comunicadosService = inject(ComunicadosService);
  private authService = inject(AuthService);

  comunicado = signal<Comunicado | null>(null);
  isLoading = signal<boolean>(true);

  constructor() {
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.loadComunicado(id);
      }
    });
  }

  loadComunicado(id: string): void {
    this.isLoading.set(true);
    this.comunicadosService.getComunicadoById(id).subscribe({
      next: (item) => {
        this.comunicado.set(item);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.router.navigate(['/admincompany/comunicados']);
      }
    });
  }

  getComunidadNombre(comunicado: Comunicado): string {
    return comunicado.communityName ?? this.authService.currentUser()?.communities?.find(c => c.id === comunicado.communityId)?.nombre ?? 'Sin comunidad';
  }

  formatFecha(fecha: string): string {
    if (!fecha) return '-';
    try {
      const d = new Date(fecha);
      return isNaN(d.getTime()) ? fecha : d.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch {
      return fecha;
    }
  }

  goBack(): void {
    const comunidadId = this.route.snapshot.queryParams['comunidad'];
    if (comunidadId) {
      this.router.navigate(['/admincompany/comunicados'], { queryParams: { comunidad: comunidadId } });
    } else {
      this.router.navigate(['/admincompany/comunicados']);
    }
  }
}
