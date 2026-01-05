import { Component } from '@angular/core';
import { comunicadosdata } from '../../shared/data/announcement.data';
import { ComunicadosPostsComponent } from '../../components/comunicados/comunicados-posts.component';
import { ReservacionesComponent } from "../../components/reservaciones/reservaciones.component";
import { BannerCarouselComponent, BannerPeriod } from '../../shared/components/banner-carousel/banner-carousel.component';

@Component({
  selector: 'hh-home-page',
  imports: [ComunicadosPostsComponent, BannerCarouselComponent],
  templateUrl: './home-page.component.html',
  styles: ``
})
export class HomePageComponent {
  comunicados = [...comunicadosdata];
  
  // Configuración del período de banners (puedes cambiar este valor)
  bannerPeriod: BannerPeriod = BannerPeriod.HalfYear;  // Año (365 días)
  // Otras opciones:
  // BannerPeriod.Bimester  - Bimestre (60 días)
  // BannerPeriod.Quarter   - Trimestre (90 días)
  // BannerPeriod.HalfYear  - Medio año (180 días)
  // BannerPeriod.Year      - Año (365 días)
}
