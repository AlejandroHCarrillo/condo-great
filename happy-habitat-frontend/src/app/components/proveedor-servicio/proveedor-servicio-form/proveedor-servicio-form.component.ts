import { Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { ProveedorServicioService } from '../../../services/proveedor-servicio.service';
import { AuthService } from '../../../services/auth.service';
import type {
  ProveedorServicio,
  CreateProveedorServicioDto,
  UpdateProveedorServicioDto
} from '../../../shared/interfaces/proveedor-servicio.interface';
import { PhoneFormatPipe } from '../../../shared/pipes/phone-format.pipe';

@Component({
  selector: 'hh-proveedor-servicio-form',
  standalone: true,
  imports: [CommonModule, FormsModule, PhoneFormatPipe],
  templateUrl: './proveedor-servicio-form.component.html'
})
export class ProveedorServicioFormComponent implements OnInit, OnDestroy {
  private service = inject(ProveedorServicioService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private destroy$ = new Subject<void>();

  isEditMode = signal(false);
  itemId = signal<string | null>(null);
  communityIdFromRoute = signal<string | null>(null);
  isLoading = signal(false);
  isSaving = signal(false);
  errorMessage = signal<string | null>(null);

  comunidadesAsociadas = computed(() => (this.authService.currentUser()?.communities ?? []) as { id?: string; nombre: string }[]);

  form = {
    communityId: '' as string,
    giro: '',
    nombre: '',
    telefono: '' as string | null,
    email: '' as string | null,
    descripcion: '' as string | null,
    paginaWeb: '' as string | null,
    rating: null as number | null
  };

  title = computed(() => (this.isEditMode() ? 'Editar proveedor de servicios' : 'Nuevo proveedor de servicios'));

  /** Deshabilita el select de comunidad cuando viene por ruta (nuevo/:communityId) o en edición. */
  isCommunitySelectDisabled = computed(() => !!this.communityIdFromRoute() || this.isEditMode());

  onPhoneInput(raw: string): void {
    const digits = raw.replace(/\D/g, '').slice(0, 10);
    this.form.telefono = digits || null;
  }

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe((paramMap) => {
      const communityId = paramMap.get('communityId');
      const id = paramMap.get('id');
      if (communityId) this.communityIdFromRoute.set(communityId);
      if (id && id !== 'nuevo') {
        this.isEditMode.set(true);
        this.itemId.set(id);
        this.loadItem(id);
      } else {
        this.form.communityId = communityId ?? '';
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadItem(id: string): void {
    this.isLoading.set(true);
    this.service.getById(id).subscribe({
      next: (item: ProveedorServicio | null) => {
        if (item) {
          this.form.communityId = item.communityId ?? '';
          this.form.giro = item.giro;
          this.form.nombre = item.nombre;
          this.form.telefono = item.telefono ?? null;
          this.form.email = item.email ?? null;
          this.form.descripcion = item.descripcion ?? null;
          this.form.paginaWeb = item.paginaWeb ?? null;
          this.form.rating = item.rating ?? null;
        }
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  save(): void {
    this.errorMessage.set(null);
    if (!this.form.giro.trim() || !this.form.nombre.trim()) {
      this.errorMessage.set('Giro y nombre son obligatorios.');
      return;
    }
    const email = this.form.email?.trim();
    if (email && !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
      this.errorMessage.set('El email no tiene un formato válido.');
      return;
    }
    this.isSaving.set(true);
    const id = this.itemId();
    if (this.isEditMode() && id) {
      const dto: UpdateProveedorServicioDto = {
        communityId: this.form.communityId,
        giro: this.form.giro.trim(),
        nombre: this.form.nombre.trim(),
        telefono: this.form.telefono?.trim() || undefined,
        email: this.form.email?.trim() || undefined,
        descripcion: this.form.descripcion?.trim() || undefined,
        paginaWeb: this.form.paginaWeb?.trim() || undefined,
        rating: this.form.rating ?? undefined
      };
      this.service.update(id, dto).subscribe({
        next: () => this.navigateBack(),
        error: () => this.isSaving.set(false)
      });
    } else {
      const dto: CreateProveedorServicioDto = {
        communityId: this.form.communityId,
        giro: this.form.giro.trim(),
        nombre: this.form.nombre.trim(),
        telefono: this.form.telefono?.trim() || undefined,
        email: this.form.email?.trim() || undefined,
        descripcion: this.form.descripcion?.trim() || undefined,
        paginaWeb: this.form.paginaWeb?.trim() || undefined,
        rating: this.form.rating ?? undefined
      };
      this.service.create(dto).subscribe({
        next: () => this.navigateBack(),
        error: () => this.isSaving.set(false)
      });
    }
  }

  cancel(): void {
    this.navigateBack();
  }

  private navigateBack(): void {
    this.isSaving.set(false);
    const comunidadId = this.route.snapshot.queryParams['comunidad'] ?? this.form.communityId;
    if (comunidadId) {
      this.router.navigate(['/admincompany/proveedores-servicios'], { queryParams: { comunidad: comunidadId } });
    } else {
      this.router.navigate(['/admincompany/proveedores-servicios']);
    }
  }
}
