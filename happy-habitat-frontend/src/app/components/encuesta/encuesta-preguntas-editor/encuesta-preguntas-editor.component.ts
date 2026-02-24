import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import type { PreguntaFormItem, TipoPreguntaEncuesta } from '../../../shared/interfaces/encuesta.interface';

const TIPO_OPTIONS: { value: TipoPreguntaEncuesta; label: string }[] = [
  { value: 0, label: 'Texto libre' },
  { value: 1, label: 'Sí / No' },
  { value: 2, label: 'Opción única' },
  { value: 3, label: 'Opción múltiple' }
];

@Component({
  selector: 'hh-encuesta-preguntas-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './encuesta-preguntas-editor.component.html'
})
export class EncuestaPreguntasEditorComponent {
  private _preguntas: PreguntaFormItem[] = [];

  @Input() set preguntas(value: PreguntaFormItem[] | null | undefined) {
    this._preguntas = value?.length ? value.map((p) => ({ ...p, opciones: p.opciones ? [...p.opciones] : [] })) : [];
  }
  get preguntas(): PreguntaFormItem[] {
    return this._preguntas;
  }
  @Output() preguntasChange = new EventEmitter<PreguntaFormItem[]>();

  readonly tipoOptions = TIPO_OPTIONS;

  needsOpciones(tipo: TipoPreguntaEncuesta): boolean {
    return tipo === 2 || tipo === 3;
  }

  addPregunta(): void {
    this.emit([...this._preguntas, { tipo: 0, pregunta: '', opciones: [] }]);
  }

  removePregunta(index: number): void {
    this.emit(this._preguntas.filter((_, i) => i !== index));
  }

  updatePregunta(index: number, field: 'tipo' | 'pregunta', value: string | number): void {
    const normalized = field === 'tipo' ? (typeof value === 'string' ? Number(value) : value) : value;
    const list = this._preguntas.map((p, i) => (i !== index ? p : { ...p, [field]: normalized }));
    if (field === 'tipo') {
      const tipo = normalized as TipoPreguntaEncuesta;
      list[index] = { ...list[index], tipo, opciones: this.needsOpciones(tipo) ? (list[index].opciones ?? ['']) : undefined };
    }
    this.emit(list);
  }

  getOpciones(index: number): string[] {
    const p = this._preguntas[index];
    if (!p || !this.needsOpciones(p.tipo)) return [];
    return p.opciones?.length ? p.opciones : [''];
  }

  setOpcion(preguntaIndex: number, opcionIndex: number, value: string): void {
    const p = this._preguntas[preguntaIndex];
    if (!p || !this.needsOpciones(p.tipo)) return;
    const opciones = [...(p.opciones ?? [''])];
    if (opcionIndex >= opciones.length) opciones.length = opcionIndex + 1;
    opciones[opcionIndex] = value;
    const list = this._preguntas.map((item, i) =>
      i !== preguntaIndex ? item : { ...item, opciones }
    );
    this.emit(list);
  }

  addOpcion(preguntaIndex: number): void {
    const p = this._preguntas[preguntaIndex];
    if (!p || !this.needsOpciones(p.tipo)) return;
    const opciones = [...(p.opciones ?? ['']), ''];
    const list = this._preguntas.map((item, i) =>
      i !== preguntaIndex ? item : { ...item, opciones }
    );
    this.emit(list);
  }

  removeOpcion(preguntaIndex: number, opcionIndex: number): void {
    const p = this._preguntas[preguntaIndex];
    if (!p?.opciones || opcionIndex < 0 || opcionIndex >= p.opciones.length) return;
    const opciones = p.opciones.filter((_, i) => i !== opcionIndex);
    const list = this._preguntas.map((item, i) =>
      i !== preguntaIndex ? item : { ...item, opciones: opciones.length ? opciones : undefined }
    );
    this.emit(list);
  }

  private emit(list: PreguntaFormItem[]): void {
    this._preguntas = list;
    this.preguntasChange.emit(list.map((p) => ({ ...p, opciones: p.opciones?.length ? p.opciones : undefined })));
  }
}
