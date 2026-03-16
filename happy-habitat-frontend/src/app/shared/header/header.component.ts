import { Component, inject, computed } from '@angular/core';
import { NavBarComponent } from "../nav-bar/nav-bar.component";
import { UserInfoComponent } from "./user-info/user-info.component";
import { AdminCompanyContextService } from '../../services/admin-company-context.service';

@Component({
  selector: 'hh-header',
  imports: [NavBarComponent, UserInfoComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  private readonly adminContext = inject(AdminCompanyContextService);

  title = 'Happy Habitat';
  subtitle = 'Administrando comunidades en armonia';

  /** Muestra el nombre de la comunidad en un tercer renglón cuando hay una seleccionada (y no es "Todas"). */
  readonly showCommunityRow = computed(() => {
    const id = this.adminContext.selectedId();
    const name = this.adminContext.selectedName();
    return id && id !== 'all' && !!name;
  });
  readonly selectedCommunityName = this.adminContext.selectedName;
}
