import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { ResidentsService } from '../../../services/residents.service';
import { CargosResidenteService } from '../../../services/cargos-residente.service';
import { PagosResidenteService } from '../../../services/pagos-residente.service';
import { Residente } from '../../../shared/interfaces/residente.interface';
import { CargoResidente } from '../../../shared/interfaces/cargo-residente.interface';
import { PagosResidente } from '../../../shared/interfaces/pagos-residente.interface';

export interface HistorialRow {
  date: string;
  type: 'cargo' | 'pago';
  description: string;
  cargoAmount: number;
  pagoAmount: number;
  balanceAfter: number;
  id: string;
  pagoAplicado?: boolean;
}

@Component({
  selector: 'hh-historial-pagos-residente',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './historial-pagos-residente.component.html'
})
export class HistorialPagosResidenteComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private location = inject(Location);
  private residentsService = inject(ResidentsService);
  private cargosService = inject(CargosResidenteService);
  private pagosService = inject(PagosResidenteService);

  residentId = signal<string>('');
  resident = signal<Residente | null>(null);
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  /** Lista unificada de cargos y pagos, del más reciente al más antiguo, con saldo corrido. */
  rows = signal<HistorialRow[]>([]);

  /** Saldo actual (último balanceAfter o 0). */
  saldoActual = computed(() => {
    const r = this.rows();
    return r.length > 0 ? r[0].balanceAfter : 0;
  });

  ngOnInit(): void {
    this.route.params
      .pipe(
        switchMap((params) => {
          const id = params['residentId'];
          if (!id) return of(null);
          this.residentId.set(id);
          this.isLoading.set(true);
          this.errorMessage.set(null);
          return this.residentsService.getResidentById(id).pipe(
            catchError(() => {
              this.errorMessage.set('No se pudo cargar el residente.');
              return of(null);
            })
          );
        })
      )
      .subscribe((resident) => {
        if (resident) {
          this.resident.set(resident);
          const rid = resident.residentId ?? resident.id ?? this.residentId();
          if (rid) {
            this.loadHistorial(rid);
          } else {
            this.errorMessage.set('ID de residente no disponible.');
            this.rows.set([]);
            this.isLoading.set(false);
          }
        } else {
          if (this.residentId()) this.resident.set(null);
          this.rows.set([]);
          this.isLoading.set(false);
        }
      });
  }

  private loadHistorial(residentId: string): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    forkJoin({
      cargos: this.cargosService.getByResidentId(residentId).pipe(catchError(() => of([]))),
      pagos: this.pagosService.getByResidentId(residentId).pipe(catchError(() => of([])))
    }).subscribe({
      next: ({ cargos, pagos }) => {
        const unified = this.buildHistorialRows(cargos, pagos);
        this.rows.set(unified);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('No se pudo cargar el historial.');
        this.rows.set([]);
        this.isLoading.set(false);
      }
    });
  }

  /**
   * Construye filas unificadas: cargos (solo anteriores a la fecha actual) y pagos ordenados por fecha asc,
   * se calcula saldo corrido, luego se devuelve ordenado del más reciente al más antiguo.
   */
  private buildHistorialRows(cargos: CargoResidente[], pagos: PagosResidente[]): HistorialRow[] {
    const rows: HistorialRow[] = [];
    const todayStr = this.getTodayDateString();

    for (const c of cargos) {
      const cargoDateStr = (c.fecha ?? '').split('T')[0];
      if (cargoDateStr && cargoDateStr < todayStr) {
        rows.push({
          date: c.fecha,
          type: 'cargo',
          description: c.descripcion || 'Cargo',
          cargoAmount: c.monto ?? 0,
          pagoAmount: 0,
          balanceAfter: 0,
          id: c.id
        });
      }
    }
    for (const p of pagos) {
      rows.push({
        date: p.fechaPago,
        type: 'pago',
        description: p.concepto?.trim() || 'Pago',
        cargoAmount: 0,
        pagoAmount: p.monto ?? 0,
        balanceAfter: 0,
        id: p.id,
        pagoAplicado: p.status === 'Aplicado'
      });
    }

    // Ordenar por fecha ascendente (más antiguo primero) para calcular saldo corrido
    rows.sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id));

    let balance = 0;
    for (const row of rows) {
      if (row.type === 'cargo') balance += row.cargoAmount;
      else if (row.pagoAplicado) balance -= row.pagoAmount;
      row.balanceAfter = balance;
    }

    // Del más reciente al más antiguo
    rows.sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));
    return rows;
  }

  /** Fecha de hoy en formato YYYY-MM-DD (solo fecha, sin hora) para comparar. */
  private getTodayDateString(): string {
    const t = new Date();
    const y = t.getFullYear();
    const m = String(t.getMonth() + 1).padStart(2, '0');
    const d = String(t.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  formatDate(value: string): string {
    if (!value) return '—';
    const d = new Date(value);
    return d.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  }

  goBack(): void {
    this.location.back();
  }

  goToResident(): void {
    const id = this.resident()?.id ?? this.residentId();
    if (id) this.router.navigate(['/admincompany/residentes', id]);
  }
}
