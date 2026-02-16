import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EncuestasService } from '../../../services/encuestas.service';
import { AuthService } from '../../../services/auth.service';
import type {
  Encuesta,
  PreguntaEncuestaDto,
  SubmitEncuestaRespuestasDto,
  SubmitRespuestaItemDto
} from '../../../shared/interfaces/encuesta.interface';

/** Tipo: 0 Texto, 1 SiNo, 2 OpcionUnica, 3 OpcionMultiple */
const TIPO_TEXTO = 0;
const TIPO_SINO = 1;
const TIPO_OPCION_UNICA = 2;
const TIPO_OPCION_MULTIPLE = 3;

@Component({
  selector: 'hh-resident-encuesta-responder',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './resident-encuesta-responder.component.html'
})
export class ResidentEncuestaResponderComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private encuestasService = inject(EncuestasService);
  private authService = inject(AuthService);

  encuesta = signal<Encuesta | null>(null);
  isLoading = signal(true);
  isSaving = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  /** Por preguntaId: valor (string o para múltiple array de opciones seleccionadas). */
  respuestas: Record<string, string | string[]> = {};

  encuestaId(): string | null {
    return this.route.snapshot.paramMap.get('id');
  }

  ngOnInit(): void {
    const id = this.encuestaId();
    if (!id) {
      this.router.navigate(['/resident/encuestas']);
      return;
    }
    this.encuestasService.getById(id).subscribe({
      next: (e) => {
        this.encuesta.set(e ?? null);
        if (e?.preguntas) {
          e.preguntas.forEach((p) => {
            if (p.tipoPregunta === TIPO_OPCION_MULTIPLE) this.respuestas[p.id] = [];
            else this.respuestas[p.id] = '';
          });
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('No se pudo cargar la encuesta.');
        this.isLoading.set(false);
      }
    });
  }

  isTexto(p: PreguntaEncuestaDto): boolean {
    return p.tipoPregunta === TIPO_TEXTO;
  }
  isSiNo(p: PreguntaEncuestaDto): boolean {
    return p.tipoPregunta === TIPO_SINO;
  }
  isOpcionUnica(p: PreguntaEncuestaDto): boolean {
    return p.tipoPregunta === TIPO_OPCION_UNICA;
  }
  isOpcionMultiple(p: PreguntaEncuestaDto): boolean {
    return p.tipoPregunta === TIPO_OPCION_MULTIPLE;
  }

  getValor(preguntaId: string): string {
    const v = this.respuestas[preguntaId];
    return typeof v === 'string' ? v : (Array.isArray(v) ? (v as string[]).join(',') : '');
  }
  setValor(preguntaId: string, value: string): void {
    this.respuestas[preguntaId] = value;
  }

  isOpcionMultipleChecked(preguntaId: string, opcion: string): boolean {
    const v = this.respuestas[preguntaId];
    return Array.isArray(v) && v.includes(opcion);
  }
  toggleOpcionMultiple(preguntaId: string, opcion: string): void {
    const v = this.respuestas[preguntaId];
    if (!Array.isArray(v)) return;
    const idx = v.indexOf(opcion);
    if (idx === -1) v.push(opcion);
    else v.splice(idx, 1);
  }

  buildPayload(): SubmitEncuestaRespuestasDto {
    const enc = this.encuesta();
    const items: SubmitRespuestaItemDto[] = [];
    if (!enc?.preguntas) return { respuestas: items };
    for (const p of enc.preguntas) {
      const v = this.respuestas[p.id];
      if (v == null) continue;
      if (Array.isArray(v)) {
        (v as string[]).forEach((r) => items.push({ preguntaId: p.id, respuesta: r }));
      } else {
        const s = (v as string)?.trim();
        if (s !== '') items.push({ preguntaId: p.id, respuesta: s });
      }
    }
    return { respuestas: items };
  }

  submit(): void {
    const id = this.encuestaId();
    if (!id) return;
    this.errorMessage.set(null);
    this.successMessage.set(null);
    const payload = this.buildPayload();
    if (payload.respuestas.length === 0) {
      this.errorMessage.set('Debes responder al menos una pregunta.');
      return;
    }
    this.isSaving.set(true);
    this.encuestasService.submitRespuestas(id, payload).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.successMessage.set('Respuestas enviadas correctamente.');
        setTimeout(() => this.router.navigate(['/resident/encuestas']), 2000);
      },
      error: (err) => {
        this.isSaving.set(false);
        const msg = typeof err?.error === 'string' ? err.error : err?.error?.message ?? err?.message;
        this.errorMessage.set(msg ?? 'Error al enviar las respuestas.');
      }
    });
  }

  back(): void {
    this.router.navigate(['/resident/encuestas']);
  }
}
