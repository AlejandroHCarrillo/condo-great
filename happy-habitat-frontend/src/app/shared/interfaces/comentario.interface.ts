export interface Comentario {
  id: number;             // Identificador único del comentario
  postId: number;         // ID del post al que pertenece
  autorId: number;        // ID del residente que escribió el comentario
  contenido: string;      // Texto del comentario
  fechaCreacion: Date;    // Fecha y hora en que se publicó
  esVisible?: boolean;    // (Opcional) Si el comentario está aprobado o moderado
}
