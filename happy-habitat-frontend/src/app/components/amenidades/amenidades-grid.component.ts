import { Component, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AmenidadesService } from '../../services/amenidades.service';
import { AmenitySchedulesService } from '../../services/amenity-schedules.service';
import { ImageUrlService } from '../../services/image-url.service';
import { AdminCompanyContextService } from '../../services/admin-company-context.service';
import { AmenidadHorarioModalComponent } from './amenidad-horario-modal/amenidad-horario-modal.component';
import { Amenidad } from '../../shared/interfaces/amenidad.interface';
import { Horario } from '../../shared/interfaces/horario.interface';
import { AmenityScheduleDto } from '../../shared/interfaces/amenity-schedule.interface';
import { DAY_OF_WEEK_LABELS } from '../../shared/interfaces/amenity-schedule.interface';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-amenidades-grid',
  standalone: true,
  imports: [CommonModule, RouterLink, AmenidadHorarioModalComponent],
  templateUrl: './amenidades-grid.component.html'
})
export class AmenidadesGridComponent {
  private amenidadesService = inject(AmenidadesService);
  private schedulesService = inject(AmenitySchedulesService);
  private imageUrlService = inject(ImageUrlService);
  private adminContext = inject(AdminCompanyContextService);

  amenidades = signal<Amenidad[]>([]);
  schedulesByAmenityId = signal<Record<string, AmenityScheduleDto[]>>({});
  isLoading = signal(true);
  errorMessage = signal<string | null>(null);
  /** True cuando no hay una comunidad concreta seleccionada en el contexto (vacío o "all"). */
  noCommunitySelected = signal(false);

  /** Imagen por defecto cuando la amenidad no tiene imagen */
  protected readonly defaultImage =
    'data:image/svg+xml,' + encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="120" viewBox="0 0 200 120" fill="none" stroke="%23999" stroke-width="1"><rect width="200" height="120" fill="%23f3f4f6" rx="4"/><path d="M80 50h40M80 60h40M80 70h25"/></svg>'
    );

  constructor() {
    effect(() => {
      const communityId = this.adminContext.selectedId();
      this.loadAmenidades(communityId);
    });
  }

  private loadAmenidades(communityId: string): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    if (!communityId || communityId === 'all') {
      this.noCommunitySelected.set(true);
      this.amenidades.set([]);
      this.schedulesByAmenityId.set({});
      this.isLoading.set(false);
      return;
    }
    this.noCommunitySelected.set(false);
    this.amenidadesService.getAmenitiesByCommunityId(communityId).pipe(
      catchError(() => {
        this.errorMessage.set('No se pudieron cargar las amenidades.');
        this.isLoading.set(false);
        return of([]);
      })
    ).subscribe((list) => {
      this.amenidades.set(list);
      this.isLoading.set(false);
      if (list.length > 0) {
        this.loadAllSchedules(list.map(a => a.id));
      } else {
        this.schedulesByAmenityId.set({});
      }
    });
  }

  private loadAllSchedules(amenityIds: string[]): void {
    const requests = amenityIds.map(id =>
      this.schedulesService.getByAmenityId(id).pipe(catchError(() => of([])))
    );
    forkJoin(requests).subscribe((results) => {
      const map: Record<string, AmenityScheduleDto[]> = {};
      amenityIds.forEach((id, i) => { map[id] = results[i] ?? []; });
      this.schedulesByAmenityId.set(map);
    });
  }

  getHorariosAmenidad(amenidadId: string): Horario[] {
    const map = this.schedulesByAmenityId();
    const list = map[amenidadId];
    if (!list?.length) return [];
    return list.map(d => ({
      id: d.id,
      day: (DAY_OF_WEEK_LABELS[d.dayOfWeek] ?? '') as Horario['day'],
      horainicio: d.horaInicio as Horario['horainicio'],
      horafin: d.horaFin as Horario['horafin'],
      isOpen: d.isOpen,
      nota: d.nota ?? ''
    }));
  }

  getImagenUrl(amenidad: Amenidad): string {
    const path = (amenidad?.imagen ?? '').toString().trim();
    if (path) return this.imageUrlService.getImageUrl(path);
    return this.defaultImage;
  }

  formatCosto(costo: number | null | undefined): string {
    if (costo == null) return 'Sin costo';
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(costo);
  }
}
