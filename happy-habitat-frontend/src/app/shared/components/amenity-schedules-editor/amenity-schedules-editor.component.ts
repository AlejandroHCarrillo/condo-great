import { Component, input, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AmenitySchedulesService } from '../../../services/amenity-schedules.service';
import {
  AmenityScheduleDto,
  CreateAmenityScheduleDto,
  UpdateAmenityScheduleDto,
  DAY_OF_WEEK_LABELS
} from '../../interfaces/amenity-schedule.interface';

@Component({
  selector: 'hh-amenity-schedules-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './amenity-schedules-editor.component.html'
})
export class AmenitySchedulesEditorComponent {
  private schedulesService = inject(AmenitySchedulesService);

  amenityId = input.required<string>();
  title = input<string>('Horarios');
  addButtonLabel = input<string>('Agregar periodo de horario');
  emptyMessage = input<string>('No hay horarios definidos.');

  schedules = signal<AmenityScheduleDto[]>([]);
  schedulesLoading = signal(false);
  scheduleModalOpen = signal(false);
  scheduleEditId = signal<string | null>(null);
  scheduleForm: Partial<CreateAmenityScheduleDto> & { nota?: string } = {
    dayOfWeek: 1,
    horaInicio: '06:00',
    horaFin: '22:00',
    isOpen: true,
    nota: ''
  };
  savingSchedule = signal(false);
  readonly dayLabels = DAY_OF_WEEK_LABELS;
  readonly dayOptions = [1, 2, 3, 4, 5, 6, 7];
  readonly timeOptions = this.buildTimeOptions();

  constructor() {
    effect(() => {
      const id = this.amenityId();
      if (id?.trim()) {
        this.loadSchedules(id);
      } else {
        this.schedules.set([]);
        this.schedulesLoading.set(false);
      }
    });
  }

  private buildTimeOptions(): string[] {
    const opts: string[] = [];
    for (let h = 0; h < 24; h++) {
      for (const m of ['00', '30']) {
        opts.push(`${h.toString().padStart(2, '0')}:${m}`);
      }
    }
    return opts;
  }

  loadSchedules(amenityId: string): void {
    this.schedulesLoading.set(true);
    this.schedulesService.getByAmenityId(amenityId).subscribe({
      next: (list) => {
        this.schedules.set(list);
        this.schedulesLoading.set(false);
      },
      error: () => this.schedulesLoading.set(false)
    });
  }

  getDayLabel(dayOfWeek: number): string {
    return this.dayLabels[dayOfWeek] ?? '';
  }

  openAddScheduleModal(): void {
    const id = this.amenityId();
    if (!id) return;
    this.scheduleEditId.set(null);
    this.scheduleForm = {
      amenityId: id,
      dayOfWeek: 1,
      horaInicio: '06:00',
      horaFin: '22:00',
      isOpen: true,
      nota: ''
    };
    this.scheduleModalOpen.set(true);
  }

  openEditScheduleModal(s: AmenityScheduleDto): void {
    this.scheduleEditId.set(s.id);
    this.scheduleForm = {
      dayOfWeek: s.dayOfWeek,
      horaInicio: s.horaInicio,
      horaFin: s.horaFin,
      isOpen: s.isOpen,
      nota: s.nota ?? ''
    };
    this.scheduleModalOpen.set(true);
  }

  closeScheduleModal(): void {
    this.scheduleModalOpen.set(false);
    this.scheduleEditId.set(null);
  }

  saveSchedule(): void {
    const form = this.scheduleForm;
    const amenityId = this.amenityId();
    if (!amenityId || form.dayOfWeek == null || !form.horaInicio || !form.horaFin) return;
    const editId = this.scheduleEditId();
    this.savingSchedule.set(true);
    if (editId) {
      const dto: UpdateAmenityScheduleDto = {
        dayOfWeek: form.dayOfWeek,
        horaInicio: form.horaInicio,
        horaFin: form.horaFin,
        isOpen: form.isOpen ?? true,
        nota: form.nota ?? ''
      };
      this.schedulesService.update(editId, dto).subscribe({
        next: () => {
          this.savingSchedule.set(false);
          this.closeScheduleModal();
          this.loadSchedules(amenityId);
        },
        error: () => this.savingSchedule.set(false)
      });
    } else {
      const dto: CreateAmenityScheduleDto = {
        amenityId,
        dayOfWeek: form.dayOfWeek,
        horaInicio: form.horaInicio,
        horaFin: form.horaFin,
        isOpen: form.isOpen ?? true,
        nota: form.nota ?? ''
      };
      this.schedulesService.create(dto).subscribe({
        next: () => {
          this.savingSchedule.set(false);
          this.closeScheduleModal();
          this.loadSchedules(amenityId);
        },
        error: () => this.savingSchedule.set(false)
      });
    }
  }

  deleteSchedule(id: string): void {
    if (!confirm('¿Eliminar este periodo de horario?')) return;
    const amenityId = this.amenityId();
    if (!amenityId) return;
    this.schedulesService.delete(id).subscribe({
      next: () => this.loadSchedules(amenityId)
    });
  }
}
