import { Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { switchMap, catchError, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { CommunityProvidersService } from '../../../services/community-providers.service';
import { AuthService } from '../../../services/auth.service';
import { UsersService } from '../../../services/users.service';
import { CommunitiesService } from '../../../services/communities.service';
import { Comunidad } from '../../../interfaces/comunidad.interface';
import { RolesEnum } from '../../../enums/roles.enum';
import { mapCommunityDtoToComunidad } from '../../../shared/mappers/community.mapper';
import type {
  CreateCommunityProviderDto,
  UpdateCommunityProviderDto
} from '../../../shared/interfaces/community-provider.interface';

@Component({
  selector: 'hh-admincompany-proveedor-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admincompany-proveedor-form.component.html'
})
export class AdmincompanyProveedorFormComponent implements OnInit, OnDestroy {
  private providersService = inject(CommunityProvidersService);
  private authService = inject(AuthService);
  private usersService = inject(UsersService);
  private communitiesService = inject(CommunitiesService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private destroy$ = new Subject<void>();

  isEditMode = signal(false);
  providerId = signal<string | null>(null);
  communityIdFromRoute = signal<string | null>(null);
  isLoading = signal(false);
  isSaving = signal(false);
  errorMessage = signal<string | null>(null);
  private loadedCommunities = signal<Comunidad[]>([]);

  comunidadesAsociadas = computed(() => {
    const user = this.authService.currentUser();
    if (!user) return [];
    if (user.communities?.length) return user.communities;
    return this.loadedCommunities().length ? this.loadedCommunities() : [];
  });

  form = {
    communityId: '' as string,
    businessName: '',
    taxId: '' as string | null,
    fullAddress: '' as string | null,
    contactPhones: '' as string | null,
    primaryEmail: '' as string | null,
    websiteOrSocialMedia: '' as string | null,
    primaryContactName: '' as string | null,
    directPhone: '' as string | null,
    mobilePhone: '' as string | null,
    contactEmail: '' as string | null,
    productsOrServices: '' as string | null,
    categoryOrIndustry: '' as string | null,
    paymentMethods: '' as string | null,
    rating: null as number | null,
    orderHistory: '' as string | null,
    pastIncidentsOrClaims: '' as string | null,
    internalNotes: '' as string | null
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
        this.providerId.set(null);
        this.communityIdFromRoute.set(communityId);
        this.form.communityId = communityId;
        this.resetFormExceptCommunity();
      } else if (id) {
        this.isEditMode.set(true);
        this.providerId.set(id);
        this.loadProvider(id);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private resetFormExceptCommunity(): void {
    this.form.businessName = '';
    this.form.taxId = '';
    this.form.fullAddress = '';
    this.form.contactPhones = '';
    this.form.primaryEmail = '';
    this.form.websiteOrSocialMedia = '';
    this.form.primaryContactName = '';
    this.form.directPhone = '';
    this.form.mobilePhone = '';
    this.form.contactEmail = '';
    this.form.productsOrServices = '';
    this.form.categoryOrIndustry = '';
    this.form.paymentMethods = '';
    this.form.rating = null;
    this.form.orderHistory = '';
    this.form.pastIncidentsOrClaims = '';
    this.form.internalNotes = '';
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

  private loadProvider(id: string): void {
    if (!id?.trim()) return;
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.providersService.getById(id).subscribe({
      next: (provider) => {
        if (provider) {
          this.form.communityId = provider.communityId ?? '';
          this.form.businessName = provider.businessName ?? '';
          this.form.taxId = provider.taxId ?? '';
          this.form.fullAddress = provider.fullAddress ?? '';
          this.form.contactPhones = provider.contactPhones ?? '';
          this.form.primaryEmail = provider.primaryEmail ?? '';
          this.form.websiteOrSocialMedia = provider.websiteOrSocialMedia ?? '';
          this.form.primaryContactName = provider.primaryContactName ?? '';
          this.form.directPhone = provider.directPhone ?? '';
          this.form.mobilePhone = provider.mobilePhone ?? '';
          this.form.contactEmail = provider.contactEmail ?? '';
          this.form.productsOrServices = provider.productsOrServices ?? '';
          this.form.categoryOrIndustry = provider.categoryOrIndustry ?? '';
          this.form.paymentMethods = provider.paymentMethods ?? '';
          this.form.rating = provider.rating ?? null;
          this.form.orderHistory = provider.orderHistory ?? '';
          this.form.pastIncidentsOrClaims = provider.pastIncidentsOrClaims ?? '';
          this.form.internalNotes = provider.internalNotes ?? '';
        } else {
          this.errorMessage.set('No se encontró el proveedor.');
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('No se pudo cargar el proveedor.');
        this.isLoading.set(false);
      }
    });
  }

  get title(): string {
    return this.isEditMode() ? 'Editar proveedor' : 'Nuevo proveedor';
  }

  save(): void {
    this.errorMessage.set(null);
    const communityId = this.form.communityId?.trim();
    if (!communityId) {
      this.errorMessage.set('Debe seleccionar una comunidad.');
      return;
    }
    if (!this.form.businessName?.trim()) {
      this.errorMessage.set('El nombre o razón social es obligatorio.');
      return;
    }
    this.isSaving.set(true);

    const trim = (v: string | null) => (v?.trim() || null) as string | null;

    if (this.isEditMode()) {
      const id = this.providerId();
      if (!id) {
        this.isSaving.set(false);
        return;
      }
      const dto: UpdateCommunityProviderDto = {
        communityId,
        businessName: this.form.businessName.trim(),
        taxId: trim(this.form.taxId),
        fullAddress: trim(this.form.fullAddress),
        contactPhones: trim(this.form.contactPhones),
        primaryEmail: trim(this.form.primaryEmail),
        websiteOrSocialMedia: trim(this.form.websiteOrSocialMedia),
        primaryContactName: trim(this.form.primaryContactName),
        directPhone: trim(this.form.directPhone),
        mobilePhone: trim(this.form.mobilePhone),
        contactEmail: trim(this.form.contactEmail),
        productsOrServices: trim(this.form.productsOrServices),
        categoryOrIndustry: trim(this.form.categoryOrIndustry),
        paymentMethods: trim(this.form.paymentMethods),
        rating: this.form.rating,
        orderHistory: trim(this.form.orderHistory),
        pastIncidentsOrClaims: trim(this.form.pastIncidentsOrClaims),
        internalNotes: trim(this.form.internalNotes)
      };
      this.providersService.update(id, dto).subscribe({
        next: () => {
          this.isSaving.set(false);
          this.router.navigate(['/admincompany/proveedores'], this.getNavigateBackOptions());
        },
        error: () => {
          this.errorMessage.set('Error al guardar los cambios.');
          this.isSaving.set(false);
        }
      });
    } else {
      const dto: CreateCommunityProviderDto = {
        communityId,
        businessName: this.form.businessName.trim(),
        taxId: trim(this.form.taxId),
        fullAddress: trim(this.form.fullAddress),
        contactPhones: trim(this.form.contactPhones),
        primaryEmail: trim(this.form.primaryEmail),
        websiteOrSocialMedia: trim(this.form.websiteOrSocialMedia),
        primaryContactName: trim(this.form.primaryContactName),
        directPhone: trim(this.form.directPhone),
        mobilePhone: trim(this.form.mobilePhone),
        contactEmail: trim(this.form.contactEmail),
        productsOrServices: trim(this.form.productsOrServices),
        categoryOrIndustry: trim(this.form.categoryOrIndustry),
        paymentMethods: trim(this.form.paymentMethods),
        rating: this.form.rating,
        orderHistory: trim(this.form.orderHistory),
        pastIncidentsOrClaims: trim(this.form.pastIncidentsOrClaims),
        internalNotes: trim(this.form.internalNotes)
      };
      this.providersService.create(dto).subscribe({
        next: () => {
          this.isSaving.set(false);
          this.router.navigate(['/admincompany/proveedores'], this.getNavigateBackOptions());
        },
        error: () => {
          this.errorMessage.set('Error al crear el proveedor.');
          this.isSaving.set(false);
        }
      });
    }
  }

  private getNavigateBackOptions(): { queryParams?: { comunidad: string } } {
    const communityId = this.communityIdFromRoute() || this.form.communityId?.trim();
    return communityId ? { queryParams: { comunidad: communityId } } : {};
  }

  cancel(): void {
    this.router.navigate(['/admincompany/proveedores'], this.getNavigateBackOptions());
  }
}
