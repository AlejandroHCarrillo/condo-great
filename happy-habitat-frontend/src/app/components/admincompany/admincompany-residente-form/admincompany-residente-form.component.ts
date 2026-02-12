import { Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { switchMap, catchError, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { ResidentsService } from '../../../services/residents.service';
import { AuthService } from '../../../services/auth.service';
import { UsersService } from '../../../services/users.service';
import { CommunitiesService } from '../../../services/communities.service';
import { Comunidad } from '../../../interfaces/comunidad.interface';
import { RolesEnum } from '../../../enums/roles.enum';
import { mapCommunityDtoToComunidad } from '../../../shared/mappers/community.mapper';
import { CreateResidentDto, UpdateResidentDto } from '../../../shared/interfaces/residente.interface';
import { mapRoleToRoleId } from '../../../shared/mappers/user.mapper';

@Component({
  selector: 'hh-admincompany-residente-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admincompany-residente-form.component.html'
})
export class AdmincompanyResidenteFormComponent implements OnInit, OnDestroy {
  private residentsService = inject(ResidentsService);
  private authService = inject(AuthService);
  private usersService = inject(UsersService);
  private communitiesService = inject(CommunitiesService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private destroy$ = new Subject<void>();

  isEditMode = signal(false);
  residentId = signal<string | null>(null);
  /** ID de comunidad cuando se abre el formulario para nuevo residente (desde la ruta). */
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
    userId: '',
    communityId: '' as string | undefined,
    fullName: '',
    email: '',
    phone: '',
    number: '',
    address: '',
    // Datos para crear el usuario (solo en modo nuevo residente)
    firstName: '',
    lastName: '',
    username: '',
    password: '',
    confirmPassword: ''
  };

  ngOnInit(): void {
    const user = this.authService.currentUser();
    if (user?.selectedRole === RolesEnum.ADMIN_COMPANY && !user.communities?.length && user.id) {
      this.loadCommunitiesForAdmin(user.id);
    }

    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe(paramMap => {
      const communityId = paramMap.get('communityId');
      const id = paramMap.get('id');
      if (communityId) {
        this.isEditMode.set(false);
        this.residentId.set(null);
        this.communityIdFromRoute.set(communityId);
        this.form.communityId = communityId;
        this.resetFormExceptCommunity();
      } else if (id) {
        this.isEditMode.set(true);
        this.residentId.set(id);
        this.loadResident(id);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private resetFormExceptCommunity(): void {
    this.form.userId = '';
    this.form.fullName = '';
    this.form.email = '';
    this.form.phone = '';
    this.form.number = '';
    this.form.address = '';
    this.form.firstName = '';
    this.form.lastName = '';
    this.form.username = '';
    this.form.password = '';
    this.form.confirmPassword = '';
  }

  private loadCommunitiesForAdmin(userId: string): void {
    this.usersService.getUserById(userId).pipe(
      switchMap(userDto => {
        const ids = userDto.userCommunityIds;
        if (!ids?.length) return of([]);
        return forkJoin(ids.map(id => this.communitiesService.getCommunityById(id)));
      }),
      catchError(() => of([]))
    ).subscribe(dtos => {
      this.loadedCommunities.set(dtos.map(dto => mapCommunityDtoToComunidad(dto)));
    });
  }

  private loadResident(id: string): void {
    if (!id?.trim()) return;
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.residentsService.getResidentById(id).subscribe({
      next: resident => {
        if (resident) {
          if (resident.residentId) this.residentId.set(resident.residentId);
          this.form.userId = resident.id ?? '';
          const communityId = resident.comunidades?.[0] ?? '';
          this.form.communityId = communityId || this.form.communityId || '';
          this.form.fullName = resident.fullname ?? '';
          this.form.email = resident.email ?? '';
          this.form.phone = resident.phone ?? '';
          this.form.number = resident.number ?? '';
          this.form.address = resident.address ?? '';
        } else {
          this.errorMessage.set('No se encontró el residente.');
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('No se pudo cargar el residente.');
        this.isLoading.set(false);
      }
    });
  }

  get title(): string {
    return this.isEditMode() ? 'Editar residente' : 'Nuevo residente';
  }

  save(): void {
    this.errorMessage.set(null);
    this.isSaving.set(true);

    if (this.isEditMode()) {
      const id = this.residentId();
      if (!id) {
        this.isSaving.set(false);
        return;
      }
      const dto: UpdateResidentDto = {
        fullName: this.form.fullName.trim(),
        email: this.form.email.trim() || undefined,
        phone: this.form.phone.trim() || undefined,
        number: this.form.number.trim() || undefined,
        address: this.form.address.trim(),
        communityId: this.form.communityId?.trim() || undefined
      };
      this.residentsService.updateResident(id, dto).subscribe({
        next: () => {
          this.isSaving.set(false);
          this.router.navigate(['/admincompany/residentes'], this.getNavigateBackOptions());
        },
        error: () => {
          this.errorMessage.set('Error al guardar los cambios.');
          this.isSaving.set(false);
        }
      });
    } else {
      if (!this.form.password || this.form.password.length < 6) {
        this.errorMessage.set('La contraseña debe tener al menos 6 caracteres.');
        this.isSaving.set(false);
        return;
      }
      if (this.form.password !== this.form.confirmPassword) {
        this.errorMessage.set('La contraseña y su confirmación no coinciden.');
        this.isSaving.set(false);
        return;
      }
      const communityId = this.form.communityId?.trim();
      if (!communityId) {
        this.errorMessage.set('Debe seleccionar una comunidad.');
        this.isSaving.set(false);
        return;
      }
      const createUserRequest = {
        roleId: mapRoleToRoleId(RolesEnum.RESIDENT),
        firstName: this.form.firstName.trim(),
        lastName: this.form.lastName.trim(),
        username: this.form.username.trim(),
        email: this.form.email.trim(),
        password: this.form.password,
        isActive: true,
        communityIds: [communityId]
      };
      this.usersService.createUser(createUserRequest).subscribe({
        next: (user) => {
          const dto: CreateResidentDto = {
            userId: user.id,
            fullName: this.form.fullName.trim() || `${this.form.firstName.trim()} ${this.form.lastName.trim()}`.trim(),
            address: this.form.address.trim(),
            email: this.form.email.trim() || undefined,
            phone: this.form.phone.trim() || undefined,
            number: this.form.number.trim() || undefined,
            communityId
          };
          this.residentsService.createResident(dto).subscribe({
            next: () => {
              this.isSaving.set(false);
              this.router.navigate(['/admincompany/residentes'], this.getNavigateBackOptions());
            },
            error: () => {
              this.errorMessage.set('Usuario creado pero falló la creación del residente. Contacte al administrador.');
              this.isSaving.set(false);
            }
          });
        },
        error: (err) => {
          const msg = err?.error?.message || 'Error al crear el usuario. El nombre de usuario o correo pueden estar en uso.';
          this.errorMessage.set(msg);
          this.isSaving.set(false);
        }
      });
    }
  }

  /** Navega a la lista de residentes preservando la comunidad seleccionada si existe. */
  private getNavigateBackOptions(): { queryParams?: { comunidad: string } } {
    const communityId = this.communityIdFromRoute() || this.form.communityId?.trim();
    return communityId ? { queryParams: { comunidad: communityId } } : {};
  }

  cancel(): void {
    this.router.navigate(['/admincompany/residentes'], this.getNavigateBackOptions());
  }
}
