export interface Amenidad {
  id?: string;
  nombre: string;
  descripcion: string;
  reglas: string;
  costo?: number;
  fechaalta: Date; // formato ISO: 'YYYY-MM-DD'
  imagen?: string;
  comunidad?: string;
  capacidadMaxima?: number;
  reservacionesSimultaneas?: number ;
}