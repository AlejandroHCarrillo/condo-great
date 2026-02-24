import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommunityConfigurationsService } from '../../../services/community-configurations.service';
import { CommunityConfiguration } from '../../../shared/interfaces/community-configuration.interface';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'hh-configuracion-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './configuracion-detail.component.html'
})
export class ConfiguracionDetailComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private configsService = inject(CommunityConfigurationsService);
  private authService = inject(AuthService);

  config = signal<CommunityConfiguration | null>(null);
  isLoading = signal<boolean>(true);

  constructor() {
    this.route.params.subscribe((params) => {
      const id = params['id'];
      if (id) {
        this.loadConfig(id);
      }
    });
  }

  loadConfig(id: string): void {
    this.isLoading.set(true);
    this.configsService.getById(id).subscribe({
      next: (item) => {
        this.config.set(item);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.router.navigate(['/admincompany/configuracion']);
      }
    });
  }

  getComunidadNombre(c: CommunityConfiguration): string {
    return (
      c.communityName ??
      this.authService.currentUser()?.communities?.find((com) => com.id === c.communityId)?.nombre ??
      'Sin comunidad'
    );
  }

  goBack(): void {
    const comunidadId = this.route.snapshot.queryParams['comunidad'];
    if (comunidadId) {
      this.router.navigate(['/admincompany/configuracion'], { queryParams: { comunidad: comunidadId } });
    } else {
      this.router.navigate(['/admincompany/configuracion']);
    }
  }
}
