export interface Comunicado {
  id: string;
  communityId?: string | null;
  communityName?: string | null;
  titulo: string;
  subtitulo: string;
  descripcion: string;
  fecha: string; // Fecha en formato ISO string (serializada desde DateTime del backend)
  imagen?: string | null;
  createdAt?: string;
}