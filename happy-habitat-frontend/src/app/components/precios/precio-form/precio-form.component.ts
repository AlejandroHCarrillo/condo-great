import { Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { switchMap, catchError, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { CommunityPricesService } from '../../../services/community-prices.service';
import { AuthService } from '../../../services/auth.service';
import { UsersService } from '../../../services/users.service';
import { CommunitiesService } from '../../../services/communities.service';
import { Comunidad } from '../../../interfaces/comunidad.interface';
import { RolesEnum } from '../../../enums/roles.enum';
import { mapCommunityDtoToComunidad } from '../../../shared/mappers/community.mapper';
import type {
  CreateCommunityPriceDto,
  UpdateCommunityPriceDto
} from '../../../shared/interfaces/community-price.interface';

@Component({
  selector: 'hh-precio-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './precio-form.component.html'
})
export class PrecioFormComponent implements OnInit, OnDestroy {
  private pricesService = inject(CommunityPricesService);
  private authService = inject(AuthService);
  private usersService = inject(UsersService);
  private communitiesService = inject(CommunitiesService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private destroy$ = new Subject<void>();

  isEditMode = signal(false);
  priceId = signal<string | null>(null);
  communityIdFromRoute = signal<string | null>(null);
  isLoading = signal(false);
  isSaving = signal(false);
  errorMessage = signal<string | null>(null);
  private loadedCommunities = signal<Comunidad[]>([]);
  displayedCommunityName = signal<string>('');

  comunidadesAsociadas = computed(() => {
    const user = this.authService.currentUser();
    if (!user) return [];
    if (user.communities?.length) return user.communities;
    return this.loadedCommunities().length ? this.loadedCommunities() : [];
  });

  form = {
    communityId: '' as string,
    concepto: '',
    monto: 0 as number,
    isActive: true
  };

  ngOnInit(): void {
    const user = this.authService.currentUser();
    if (user?.selectedRole === RolesEnum.ADMIN_COMPANY && !user.communities?.length && user.id) {
      this.loadCommunitiesForAdmin(user.id);
    }

    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe((paramMap) => {
      const communityId = paramMap.get('communityId');
      const id = paramMap.get('id');
      if (communityId) {
        this.isEditMode.set(false);
        this.priceId.set(null);
        this.communityIdFromRoute.set(communityId);
        this.form.communityId = communityId;
        this.resetFormExceptCommunity();
      } else if (id) {
        this.isEditMode.set(true);
        this.priceId.set(id);
        this.loadPrice(id);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private resetFormExceptCommunity(): void {
    this.form.concepto = '';
    this.form.monto = 0;
    this.form.isActive = true;
  }

  private loadCommunitiesForAdmin(userId: string): void {
    this.usersService
      .getUserById(userId)
      .pipe(
        switchMap((userDto) => {
          const ids = userDto.userCommunityIds;
          if (!ids?.length) return of([]);
          return forkJoin(ids.map((id) => this.communitiesService.getCommunityById(id)));
        }),
        catchError(() => of([]))
      )
      .subscribe((dtos) => {
        this.loadedCommunities.set(dtos.map((dto) => mapCommunityDtoToComunidad(dto)));
      });
  }

  private loadPrice(id: string): void {
    if (!id?.trim()) return;
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.pricesService.getById(id).subscribe({
      next: (price) => {
        if (price) {
          this.form.communityId = price.communityId ?? '';
          this.form.concepto = price.concepto ?? '';
          this.form.monto = price.monto ?? 0;
          this.form.isActive = price.isActive ?? true;
          const name = price.communityName?.trim() || this.getCommunityNameById(price.communityId);
          this.displayedCommunityName.set(name || price.communityId || '—');
        } else {
          this.errorMessage.set('No se encontró el precio.');
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('No se pudo cargar el precio.');
        this.isLoading.set(false);
      }
    });
  }

  get title(): string {
    return this.isEditMode() ? 'Editar precio' : 'Nuevo precio';
  }

  save(): void {
    this.errorMessage.set(null);
    const communityId = this.form.communityId?.trim();
    if (!communityId) {
      this.errorMessage.set('Debe seleccionar una comunidad.');
      return;
    }
    if (!this.form.concepto?.trim()) {
      this.errorMessage.set('El concepto es obligatorio.');
      return;
    }
    if (this.form.monto < 0) {
      this.errorMessage.set('El monto no puede ser negativo.');
      return;
    }
    this.isSaving.set(true);

    if (this.isEditMode()) {
      const id = this.priceId();
      if (!id) {
        this.isSaving.set(false);
        return;
      }
      const dto: UpdateCommunityPriceDto = {
        communityId,
        concepto: this.form.concepto.trim(),
        monto: Number(this.form.monto),
        isActive: this.form.isActive
      };
      this.pricesService.update(id, dto).subscribe({
        next: () => {
          this.isSaving.set(false);
          this.router.navigate(['/admincompany/precios'], this.getNavigateBackOptions());
        },
        error: () => {
          this.errorMessage.set('Error al guardar los cambios.');
          this.isSaving.set(false);
        }
      });
    } else {
      const dto: CreateCommunityPriceDto = {
        communityId,
        concepto: this.form.concepto.trim(),
        monto: Number(this.form.monto),
        isActive: this.form.isActive
      };
      this.pricesService.create(dto).subscribe({
        next: () => {
          this.isSaving.set(false);
          this.router.navigate(['/admincompany/precios'], this.getNavigateBackOptions());
        },
        error: () => {
          this.errorMessage.set('Error al crear el precio.');
          this.isSaving.set(false);
        }
      });
    }
  }

  private getCommunityNameById(communityId: string): string {
    if (!communityId) return '';
    const list = this.comunidadesAsociadas();
    const found = list.find((c) => c.id === communityId);
    return found?.nombre ?? '';
  }

  private getNavigateBackOptions(): { queryParams?: { comunidad: string } } {
    const communityId = this.communityIdFromRoute() || this.form.communityId?.trim();
    return communityId ? { queryParams: { comunidad: communityId } } : {};
  }

  cancel(): void {
    this.router.navigate(['/admincompany/precios'], this.getNavigateBackOptions());
  }
}
