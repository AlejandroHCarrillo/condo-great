import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { EncuestasService } from '../../../services/encuestas.service';
import { AuthService } from '../../../services/auth.service';
import { Encuesta } from '../../../shared/interfaces/encuesta.interface';

@Component({
  selector: 'hh-resident-encuestas',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './resident-encuestas.component.html'
})
export class ResidentEncuestasComponent implements OnInit {
  private encuestasService = inject(EncuestasService);
  private authService = inject(AuthService);

  isLoading = signal(true);
  errorMessage = signal<string | null>(null);
  encuestas = signal<Encuesta[]>([]);

  /** Encuestas activas y vigentes (isActive, hoy entre fechaInicio y fechaFin). */
  encuestasActivas = computed(() => {
    const list = this.encuestas();
    const now = new Date();
    return list.filter(
      (e) =>
        e.isActive &&
        new Date(e.fechaInicio) <= now &&
        new Date(e.fechaFin) >= now
    );
  });

  private getCommunityId(): string | null {
    const user = this.authService.currentUser();
    if (!user) return null;
    if (user.communities?.length) return user.communities[0].id ?? null;
    return user.residentInfo?.comunidad?.id ?? null;
  }

  ngOnInit(): void {
    const communityId = this.getCommunityId();
    if (!communityId) {
      this.errorMessage.set('No se pudo determinar tu comunidad.');
      this.isLoading.set(false);
      return;
    }
    this.encuestasService.getByCommunityId(communityId).subscribe({
      next: (list) => {
        this.encuestas.set(list);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('No se pudieron cargar las encuestas.');
        this.isLoading.set(false);
      }
    });
  }
}
