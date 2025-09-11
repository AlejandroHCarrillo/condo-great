export interface Anuncio {
  id: number;
  titulo: string;
  subtitulo: string;
  descripcion: string;
  fecha: string; // formato ISO: 'YYYY-MM-DD'
  imagen: string;
}