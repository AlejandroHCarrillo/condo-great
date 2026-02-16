/** Tipo de pregunta: Texto = 0, SiNo = 1, OpcionUnica = 2, OpcionMultiple = 3 */
export type TipoPreguntaEncuesta = 0 | 1 | 2 | 3;

/** Item de pregunta para el formulario (crear/editar encuesta). */
export interface PreguntaFormItem {
  tipo: TipoPreguntaEncuesta;
  pregunta: string;
  opciones?: string[];
}

/** Pregunta devuelta por la API (con opciones). */
export interface PreguntaEncuestaDto {
  id: string;
  tipoPregunta: number;
  pregunta: string;
  opciones: string[];
}

export interface Encuesta {
  id: string;
  communityId: string;
  communityName?: string | null;
  titulo: string;
  descripcion: string;
  fechaInicio: string;
  fechaFin: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string | null;
  preguntas?: PreguntaEncuestaDto[];
}

/** Pregunta para crear/actualizar (sin id). */
export interface CreatePreguntaEncuestaDto {
  tipoPregunta: number;
  pregunta: string;
  opciones?: string[];
}

export interface CreateEncuestaDto {
  communityId: string;
  titulo: string;
  descripcion: string;
  fechaInicio: string;
  fechaFin: string;
  isActive?: boolean;
  preguntas?: CreatePreguntaEncuestaDto[];
}

export interface UpdateEncuestaDto {
  communityId: string;
  titulo: string;
  descripcion: string;
  fechaInicio: string;
  fechaFin: string;
  isActive: boolean;
  preguntas?: CreatePreguntaEncuestaDto[];
}

/** Una respuesta a una pregunta (para enviar desde el residente). */
export interface SubmitRespuestaItemDto {
  preguntaId: string;
  respuesta: string;
}

/** Payload para enviar las respuestas del residente a una encuesta. */
export interface SubmitEncuestaRespuestasDto {
  respuestas: SubmitRespuestaItemDto[];
}
