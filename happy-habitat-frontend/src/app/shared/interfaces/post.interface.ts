import { Comentario } from "./comentario.interface";

export interface Post {
  id: number;              // Identificador único del post
  titulo: string;          // Título de la publicación
  contenido: string;       // Texto principal del post
  autorId: number;         // ID del residente que lo creó
  fechaCreacion: Date;     // Fecha y hora de creación
  etiquetas: string[];     // Lista de etiquetas o categorías
  imagenUrl?: string;      // (Opcional) URL de imagen asociada
  esDestacado?: boolean;   // (Opcional) Si el post debe mostrarse como destacado
  comentarios?: Comentario[];
}