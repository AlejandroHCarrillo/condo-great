import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { rxResource } from '../../../utils/rx-resource.util';
import { AuthService } from '../../../services/auth.service';
import { UsersService } from '../../../services/users.service';
import { ResidentsService } from '../../../services/residents.service';
import { CommunitiesService } from '../../../services/communities.service';
import { Residente } from '../../../shared/interfaces/residente.interface';
import { Comunidad } from '../../../interfaces/comunidad.interface';
import { RolesEnum } from '../../../enums/roles.enum';
import { mapCommunityDtoToComunidad } from '../../../shared/mappers/community.mapper';

@Component({
  selector: 'hh-admincompany-residentes',
  imports: [CommonModule, FormsModule],
  templateUrl: './admincompany-residentes.component.html'
})
export class AdmincompanyResidentesComponent implements OnInit {
  private authService = inject(AuthService);
  private usersService = inject(UsersService);
  private residentsService = inject(ResidentsService);
  private communitiesService = inject(CommunitiesService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  selectedComunidadId = signal<string>('');
  private loadedCommunitiesForAdmin = signal<Comunidad[]>([]);

  comunidadesAsociadas = computed(() => {
    const user = this.authService.currentUser();
    if (!user) return [];
    if (user.communities?.length) return user.communities;
    const loaded = this.loadedCommunitiesForAdmin();
    return loaded.length ? loaded : [];
  });

  private residentsResource = rxResource({
    request: () => ({
      comunidadId: this.selectedComunidadId(),
      comunidades: this.comunidadesAsociadas()
    }),
    loader: ({ request }) => {
      if (!request.comunidadId) return of([]);
      const communityIds =
        request.comunidadId === 'all'
          ? request.comunidades.map(c => c.id ?? '').filter(Boolean)
          : [request.comunidadId];
      if (!communityIds.length) return of([]);
      return communityIds.length === 1
        ? this.residentsService.getResidentsByCommunityId(communityIds[0])
        : this.residentsService.getResidentsByCommunities(communityIds);
    }
  });

  residentesFiltrados = computed(() => this.residentsResource.value() ?? []);
  isLoading = computed(() => this.residentsResource.isLoading());

  getComunidadNombre(comunidadId: string): string {
    return this.comunidadesAsociadas().find(c => c.id === comunidadId)?.nombre ?? 'Sin comunidad';
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const comunidadId = params['comunidad'];
      if (comunidadId) this.selectedComunidadId.set(comunidadId);
    });

    const user = this.authService.currentUser();
    if (user?.selectedRole === RolesEnum.ADMIN_COMPANY && !user.communities?.length && user.id) {
      this.loadCommunitiesForAdmin(user.id);
    }
  }

  private loadCommunitiesForAdmin(userId: string): void {
    this.usersService.getUserById(userId).pipe(
      switchMap(userDto => {
        const ids = userDto.userCommunityIds;
        if (!ids?.length) return of([]);
        return forkJoin(ids.map(id => this.communitiesService.getCommunityById(id)));
      }),
      catchError(() => of([]))
    ).subscribe(communityDtos => {
      const comunidades = communityDtos.map(dto => mapCommunityDtoToComunidad(dto));
      this.loadedCommunitiesForAdmin.set(comunidades);
    });
  }

  onComunidadChange(value: string | Event): void {
    const comunidadId = typeof value === 'string' ? value : (value.target as HTMLSelectElement).value;
    this.selectedComunidadId.set(comunidadId);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { comunidad: comunidadId || null },
      queryParamsHandling: 'merge'
    });
  }

  viewResidentDetail(residente: Residente): void {
    if (residente.id) {
      this.router.navigate(['/admincompany/residentes', residente.id], {
        queryParams: { comunidad: this.selectedComunidadId() || null }
      });
    }
  }
}

