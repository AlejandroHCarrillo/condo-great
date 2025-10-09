export interface Comunicado {
  id?: string;
  titulo: string;
  subtitulo: string;
  descripcion: string;
  fecha: Date; // formato ISO: 'YYYY-MM-DD'
  imagen?: string;
  comunidad?: string;
}