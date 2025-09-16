export interface Documento {
  id: string;                // Identificador único del documento
  titulo: string;            // Título del documento
  descripcion: string;       // Descripción breve
  fecha: string;         // Fecha de subida o creación
  usuarioSubio: string;      // Nombre o ID del usuario que lo subió
  nombreDocumento: string;   // Nombre original del archivo
  urlDoc: string;             // URL pública o protegida del documento
}

