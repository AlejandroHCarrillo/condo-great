export interface Anuncio {
  id: number;
  titulo: string;
  subtitulo: string;
  descripcion: string;
  fecha: Date; // formato ISO: 'YYYY-MM-DD'
  imagen: string;
}