import { Component, inject, Input, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { BannersService } from '../../../services/banners.service';
import { Banner } from '../../../shared/interfaces/banner.interface';
import { catchError, of, tap } from 'rxjs';

export enum BannerPeriod {
  Month = 'month',        // 30 días
  Bimester = 'bimester',  // 60 días
  Quarter = 'quarter',    // 90 días
  HalfYear = 'halfYear',  // 180 días
  Year = 'year'           // 365 días
}

@Component({
  selector: 'hh-banner-carousel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './banner-carousel.component.html',
  styleUrl: './banner-carousel.component.css'
})
export class BannerCarouselComponent {
  private bannersService = inject(BannersService);

  // Input para configurar el período desde el componente padre
  @Input() period: BannerPeriod = BannerPeriod.Month;

  // Signal para rastrear el estado de carga
  private isLoadingState = signal(true);

  // Usar toSignal para convertir el observable a una señal
  // El observable carga todos los banners y filtra solo los activos
  private bannersResource = toSignal(
    this.bannersService.getAllBanners().pipe(
      catchError((error) => {
        console.error('Error loading banners', error);
        this.isLoadingState.set(false);
        return of([]);
      }),
      tap(() => {
        // Cuando el observable emite un valor, la carga está completa
        this.isLoadingState.set(false);
      })
    ),
    { initialValue: [] as Banner[] }
  );

  // Banners activos obtenidos del resource
  allBanners = computed(() => {
    const banners = this.bannersResource() ?? [];
    // Filtrar solo los banners activos
    return banners.filter(b => b.isActive);
  });

  // Estado de carga basado en el signal de estado
  isLoading = computed(() => {
    return this.isLoadingState();
  });

  // Banners filtrados según el período configurado
  banners = computed(() => {
    const all = this.allBanners();
    
    if (all.length === 0) return [];
    
    const today = new Date();
    const periodDates = this.getPeriodDates(today, this.period);
    
    const filtered = all.filter(banner => this.isBannerInPeriod(banner, periodDates.start, periodDates.end));
    
    // Debug: mostrar información sobre el filtrado
    console.log('Banner filtering:', {
      totalBanners: all.length,
      period: this.period,
      periodStart: periodDates.start.toISOString(),
      periodEnd: periodDates.end.toISOString(),
      filteredCount: filtered.length,
      banners: filtered.map(b => ({
        title: b.title,
        startDate: b.startDate,
        endDate: b.endDate
      }))
    });
    
    return filtered;
  });

  /**
   * Obtiene las fechas de inicio y fin según el período configurado
   * Para Year: muestra todo el año actual (desde 1 de enero hasta 31 de diciembre)
   * Para otros períodos: calcula desde hoy hasta los próximos X días
   * Usa UTC para evitar problemas de timezone
   */
  getPeriodDates(date: Date, period: BannerPeriod): { start: Date; end: Date } {
    let start: Date;
    let end: Date;

    if (period === BannerPeriod.Year) {
      // Para el año, mostrar todo el año actual (desde 1 de enero hasta 31 de diciembre)
      const currentYear = date.getUTCFullYear();
      start = new Date(Date.UTC(currentYear, 0, 1)); // 1 de enero en UTC
      end = new Date(Date.UTC(currentYear, 11, 31, 23, 59, 59, 999)); // 31 de diciembre en UTC
    } else {
      // Para otros períodos, desde hoy hasta los próximos X días
      // Obtener la fecha actual en UTC (solo fecha, sin hora)
      const todayUTC = new Date(Date.UTC(
        date.getUTCFullYear(),
        date.getUTCMonth(),
        date.getUTCDate()
      ));
      start = todayUTC;
      
      let daysToAdd = 0;

      switch (period) {
        case BannerPeriod.Month:
          daysToAdd = 30;
          break;
        case BannerPeriod.Bimester:
          daysToAdd = 60;
          break;
        case BannerPeriod.Quarter:
          daysToAdd = 90;
          break;
        case BannerPeriod.HalfYear:
          daysToAdd = 180;
          break;
      }

      end = new Date(Date.UTC(
        todayUTC.getUTCFullYear(),
        todayUTC.getUTCMonth(),
        todayUTC.getUTCDate() + daysToAdd,
        23, 59, 59, 999
      ));
    }

    return { start, end };
  }

  /**
   * Verifica si un banner está dentro del período especificado
   * El período va desde hoy hasta los próximos X días
   * Usa UTC para evitar problemas de timezone
   */
  isBannerInPeriod(banner: Banner, periodStart: Date, periodEnd: Date): boolean {
    // Si el banner no tiene fechas, se muestra siempre
    if (!banner.startDate && !banner.endDate) {
      return true;
    }

    // Parsear fechas del banner (formato YYYY-MM-DD) en UTC
    let bannerStart: Date | null = null;
    let bannerEnd: Date | null = null;

    if (banner.startDate) {
      const startDateStr = banner.startDate.split('T')[0]; // Solo la fecha, sin hora
      const [year, month, day] = startDateStr.split('-').map(Number);
      bannerStart = new Date(Date.UTC(year, month - 1, day)); // month es 0-indexed
    }

    if (banner.endDate) {
      const endDateStr = banner.endDate.split('T')[0]; // Solo la fecha, sin hora
      const [year, month, day] = endDateStr.split('-').map(Number);
      bannerEnd = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));
    }

    // Si el banner tiene fecha de inicio y es después del fin del período, no se muestra
    if (bannerStart && bannerStart.getTime() > periodEnd.getTime()) {
      return false;
    }

    // Si el banner tiene fecha de fin y es antes del inicio del período, no se muestra
    if (bannerEnd && bannerEnd.getTime() < periodStart.getTime()) {
      return false;
    }

    // Si hay solapamiento (el banner se solapa con el período), se muestra
    // Esto incluye:
    // - Banners que empiezan dentro del período
    // - Banners que terminan dentro del período
    // - Banners que abarcan todo el período
    // - Banners que están completamente dentro del período
    return true;
  }

  /**
   * Hace scroll suave al elemento del carousel especificado
   */
  scrollToItem(itemId: string): void {
    const element = document.getElementById(itemId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
    }
  }

  /**
   * Genera un ID único para cada item del carousel
   */
  getItemId(index: number): string {
    return `banner-item-${index}`;
  }

  /**
   * Obtiene la ruta correcta de la imagen
   * Asegura que la ruta comience con / si no lo hace
   */
  getImagePath(path: string): string {
    if (!path) return '';
    // Si la ruta ya comienza con /, la devolvemos tal cual
    if (path.startsWith('/')) {
      return path;
    }
    // Si no, agregamos el / al inicio
    return `/${path}`;
  }

  /**
   * Maneja errores al cargar imágenes
   */
  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    // Si la imagen falla, intentamos con una ruta alternativa o mostramos un placeholder
    console.warn('Error loading banner image:', img.src);
    // Opcional: establecer una imagen por defecto
    // img.src = '/images/banners/default-banner.png';
  }

  /**
   * Formatea las fechas del banner para mostrarlas en el título
   * Retorna un string con el rango de fechas o una fecha única
   */
  formatBannerDate(banner: Banner): string {
    if (!banner.startDate && !banner.endDate) {
      return '';
    }

    const formatDate = (dateStr: string): string => {
      const date = new Date(dateStr.split('T')[0] + 'T00:00:00');
      return date.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    };

    if (banner.startDate && banner.endDate) {
      // Si ambas fechas son iguales, mostrar solo una
      if (banner.startDate === banner.endDate) {
        return formatDate(banner.startDate);
      }
      // Mostrar rango de fechas
      return `${formatDate(banner.startDate)} - ${formatDate(banner.endDate)}`;
    } else if (banner.startDate) {
      return `Desde ${formatDate(banner.startDate)}`;
    } else if (banner.endDate) {
      return `Hasta ${formatDate(banner.endDate)}`;
    }

    return '';
  }
}

