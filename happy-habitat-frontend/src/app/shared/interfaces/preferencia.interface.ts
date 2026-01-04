export interface Preferencia {
  id: string;              // Identificador único 
  descripcion: string;     // Título de la publicación
  opciones?: string[];     // Texto principal del post
}

export interface PreferenciaUsuario {
  idResidente: string;     // Identificador residente 
  idPreferencia: string;   // Identificador único 
  // descripcion: string;     // Título de la publicación
  valores?: string[];      // Texto principal del post
}