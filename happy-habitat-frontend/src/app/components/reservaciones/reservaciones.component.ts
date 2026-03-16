import { ReservacionAmenidad } from './../../shared/interfaces/reservacion-amenidad.interface';
import { Component, computed, inject, signal, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { switchMap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { HorasDelDia, WeekDays } from '../../enums/tiempo.enum';
import { DatePipe, LowerCasePipe } from '@angular/common';
import { Amenidad } from '../../shared/interfaces/amenidad.interface';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Horario } from '../../shared/interfaces/horario.interface';
import { DAY_OF_WEEK_LABELS } from '../../shared/interfaces/amenity-schedule.interface';
import { AmenidadesService } from '../../services/amenidades.service';
import { AmenitySchedulesService } from '../../services/amenity-schedules.service';
import { AuthService } from '../../services/auth.service';
import { ReservacionesService } from '../../services/reservaciones.service';

/** Devuelve el lunes de la semana de la fecha dada. */
function getMondayOfWeek(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

@Component({
  selector: 'hh-reservaciones',
  imports: [FormsModule, DatePipe, LowerCasePipe],
  templateUrl: './reservaciones.component.html',
  styles: ``
})
export class ReservacionesComponent implements OnInit, OnDestroy {

  @ViewChild('reservarModal') reservarModalRef!: ElementRef<HTMLDialogElement>;

  private sanitizer = inject(DomSanitizer);
  private route = inject(ActivatedRoute);
  private amenidadesService = inject(AmenidadesService);
  private schedulesService = inject(AmenitySchedulesService);
  private authService = inject(AuthService);
  private reservacionesService = inject(ReservacionesService);

  readonly diasSemana = [...Object.values(WeekDays)];
  readonly horasDelDia = [...Object.values(HorasDelDia)].filter(x => x >= '10:00' && x <= '21:00' && !x.includes('30'));

  /** Resident desde sesión; null si el usuario no es residente. */
  readonly residente = computed(() => {
    const user = this.authService.currentUser();
    const info = user?.residentInfo;
    if (!info?.id) return null;
    return { id: info.id, casa: info.number ?? info.address ?? '—' };
  });

  /** Semana a mostrar (lunes). Inicial: semana actual. */
  inicioSemana = signal<Date>(getMondayOfWeek(new Date()));

  amenidadesOptions = signal<{ value: string; text: string }[]>([]);
  amenidadId = '';
  isLoadingAmenidad = signal(false);
  amenidad: Amenidad | undefined = undefined;
  horariosAmenidad: Horario[] = [];
  fechaSeleccionada = new Date();
  capacidadMaxima = 35;

  /** Número de personas para la reserva (modal). */
  numPersonasModal = signal(1);
  /** Número de horas a reservar (modal). */
  horasReservadasModal = signal(1);
  /** Usuario aceptó las reglas (modal). */
  rulesAccepted = signal(false);

  /** Todas las reservaciones del residente (desde API). */
  reservaciones = signal<ReservacionAmenidad[]>([]);
  isLoadingReservaciones = signal(false);
  reservacionesError = signal<string | null>(null);

  /** Reservaciones de la amenidad actual y del residente actual (para lista "Mis reservas"). */
  misReservaciones = computed(() => {
    const list = this.reservaciones();
    const amenidadId = this.amenidadId;
    const residentId = this.residente()?.id;
    if (!residentId) return [];
    return list.filter(
      r => r.amenidadId === amenidadId && r.residenteId === residentId
    );
  });

  showMisReservas = signal(false);
  /** Modal de reservar visible. */
  showReservarModal = signal(false);
  isSubmittingReservation = signal(false);
  reservationMessage = signal<{ type: 'success' | 'error'; text: string } | null>(null);

  sanitizeHTML(htmlString: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(htmlString ?? '');
  }

  sumDays(numDias: number): Date {
    const fechaOriginal = this.inicioSemana();
    const fechaSumada = new Date(fechaOriginal);
    fechaSumada.setDate(fechaSumada.getDate() + numDias);
    return fechaSumada;
  }

  getHorarioByDayHour(strDay: string, strHour: string): { day: string; horainicio: string; horafin: string; isOpen: boolean; nota: string } {
    const horario = this.horariosAmenidad
      .filter(s => s.day === strDay)
      .filter(s => s.horainicio <= strHour && s.horafin >= strHour);
    if (horario.length === 0)
      return { day: '', horainicio: '', horafin: '', isOpen: true, nota: '' };
    const s = horario[0];
    return { day: s.day ?? '', horainicio: s.horainicio ?? '', horafin: s.horafin ?? '', isOpen: s.isOpen, nota: s.nota ?? '' };
  }

  /** Máximo de personas por reservación: solo PersonasPorReservacion de la amenidad (ej. alberca = 5). */
  get maxPersonasPorReservacion(): number {
    const max = this.amenidad?.personasPorReservacion;
    return max != null && max > 0 ? max : 10;
  }

  /** Máximo de horas por reservación: solo HorasPorReservacion de la amenidad (ej. alberca = 3). */
  get maxHorasPorReservacion(): number {
    const max = this.amenidad?.horasPorReservacion;
    return max != null && max > 0 ? max : 2;
  }

  /** Abre el modal de reserva y fija la fecha/hora seleccionada. */
  openReservarModal(fecha: Date): void {
    this.fechaSeleccionada = new Date(fecha);
    this.rulesAccepted.set(false);
    this.reservationMessage.set(null);
    this.numPersonasModal.set(1);
    this.horasReservadasModal.set(1);
    this.showReservarModal.set(true);
    queueMicrotask(() => this.reservarModalRef?.nativeElement?.showModal?.());
  }

  closeReservarModal(): void {
    this.showReservarModal.set(false);
    this.reservarModalRef?.nativeElement?.close?.();
  }

  setDatetime(fecha: Date, time: string): Date {
    const [horas, minutos] = time.split(':').map(Number);
    const copy = new Date(fecha);
    copy.setHours(horas, minutos, 0, 0);
    return copy;
  }

  constructor() {
    this.route.queryParams.pipe(takeUntilDestroyed()).subscribe(params => {
      const id = params['amenidadId'];
      if (!id) return;
      this.loadAmenidadAndSchedules(id);
    });
  }

  ngOnInit(): void {
    this.loadMyReservations();
    this.loadAmenidadesOptions();
  }

  /** Carga la lista de amenidades desde la API para el selector. */
  private loadAmenidadesOptions(): void {
    this.amenidadesService.getAllAmenities().pipe(
      catchError(() => of([]))
    ).subscribe(list => {
      this.amenidadesOptions.set(list.map(a => ({ value: a.id, text: a.nombre })));
    });
  }

  /** Carga amenidad por id y sus horarios desde la API. */
  private loadAmenidadAndSchedules(id: string): void {
    this.isLoadingAmenidad.set(true);
    this.amenidadId = id;
    this.amenidad = undefined;
    this.horariosAmenidad = [];
    this.amenidadesService.getAmenityById(id).pipe(
      catchError(() => of(null)),
      switchMap(amenity => {
        if (!amenity) {
          this.isLoadingAmenidad.set(false);
          return of(null);
        }
        const opts = this.amenidadesOptions();
        if (!opts.some(o => o.value === amenity.id)) {
          this.amenidadesOptions.set([...opts, { value: amenity.id, text: amenity.nombre }]);
        }
        this.amenidad = amenity;
        this.capacidadMaxima = amenity.capacidadMaxima ?? 99;
        return this.schedulesService.getByAmenityId(id).pipe(catchError(() => of([])));
      })
    ).subscribe(schedules => {
      this.isLoadingAmenidad.set(false);
      if (schedules !== null && schedules.length > 0) {
        this.horariosAmenidad = schedules.map(d => ({
          id: d.id,
          day: (DAY_OF_WEEK_LABELS[d.dayOfWeek] ?? '') as Horario['day'],
          horainicio: d.horaInicio as Horario['horainicio'],
          horafin: d.horaFin as Horario['horafin'],
          isOpen: d.isOpen,
          nota: d.nota ?? ''
        }));
      }
    });
  }

  ngOnDestroy(): void {
    this.closeReservarModal();
  }

  loadMyReservations(): void {
    this.isLoadingReservaciones.set(true);
    this.reservacionesError.set(null);
    this.reservacionesService.getMy().subscribe({
      next: list => {
        this.reservaciones.set(list);
        this.isLoadingReservaciones.set(false);
      },
      error: () => {
        this.reservacionesError.set('No se pudieron cargar sus reservaciones.');
        this.isLoadingReservaciones.set(false);
      }
    });
  }

  /** Ocupación en una celda: solo reservaciones de la amenidad actual en esa fecha/hora. */
  getReservationsByDate(fechaBuscada: Date): number {
    const list = this.reservaciones();
    const amenidadId = this.amenidadId;
    return list.reduce((total, r) => {
      if (r.amenidadId !== amenidadId) return total;
      const horarioDate = typeof r.horario === 'string' ? new Date(r.horario) : r.horario;
      const mismaHora = horarioDate.getTime() === fechaBuscada.getTime();
      return total + (mismaHora ? r.numPersonas ?? 0 : 0);
    }, 0);
  }

  nextWeek(): void {
    const fechaNueva = new Date(this.inicioSemana());
    fechaNueva.setDate(fechaNueva.getDate() + 7);
    this.inicioSemana.set(fechaNueva);
  }

  prevWeek(): void {
    const fechaNueva = new Date(this.inicioSemana());
    fechaNueva.setDate(fechaNueva.getDate() - 7);
    this.inicioSemana.set(fechaNueva);
  }

  selectAmenidadById(amenidadId: string): void {
    if (!amenidadId) {
      this.amenidadId = '';
      this.amenidad = undefined;
      this.horariosAmenidad = [];
      return;
    }
    this.loadAmenidadAndSchedules(amenidadId);
  }

  doReservation(): void {
    const resident = this.residente();
    if (!resident || !this.amenidadId || !this.amenidad) return;
    const numPersonas = Math.max(1, Math.min(this.numPersonasModal(), this.maxPersonasPorReservacion));
    const horasReservadas = Math.max(1, Math.min(this.horasReservadasModal(), this.maxHorasPorReservacion));
    const horario = new Date(this.fechaSeleccionada);

    this.isSubmittingReservation.set(true);
    this.reservationMessage.set(null);
    this.reservacionesService.create({
      amenityId: this.amenidadId,
      horario: horario.toISOString(),
      numPersonas,
      horasReservadas
    }).subscribe({
      next: created => {
        this.isSubmittingReservation.set(false);
        if (created) {
          this.reservaciones.update(list => [...list, created]);
          this.reservationMessage.set({ type: 'success', text: 'Reservación registrada.' });
          this.closeReservarModal();
        } else {
          this.reservationMessage.set({ type: 'error', text: 'No se pudo crear la reservación.' });
        }
      },
      error: () => {
        this.isSubmittingReservation.set(false);
        this.reservationMessage.set({ type: 'error', text: 'Error al crear la reservación.' });
      }
    });
  }

  deleteReservation(reservation: ReservacionAmenidad): void {
    if (!reservation.id) return;
    this.reservacionesService.cancel(reservation.id).subscribe({
      next: () => {
        this.reservaciones.update(list => list.filter(r => r.id !== reservation.id));
      }
    });
  }

  toggleVerReservas(): void {
    this.showMisReservas.update(v => !v);
  }

  setNumPersonasModal(value: unknown): void {
    const n = typeof value === 'number' ? value : Number(value);
    const max = this.maxPersonasPorReservacion;
    this.numPersonasModal.set((n >= 1 && n <= max) ? n : 1);
  }

  setHorasReservadasModal(value: unknown): void {
    const n = typeof value === 'number' ? value : Number(value);
    const max = this.maxHorasPorReservacion;
    this.horasReservadasModal.set((n >= 1 && n <= max) ? n : 1);
  }
}
