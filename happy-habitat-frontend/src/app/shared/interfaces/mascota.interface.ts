export interface Mascota {
  id: number;            // Identificador único de la mascota
  nombre: string;        // Nombre de la mascota
  especie: string;       // Ej. perro, gato, ave
  raza: string;          // Raza específica (ej. Labrador, Siamés)
  edad: number;          // Edad en años
  color: string;         // Color predominante
  idResidente: number;   // ID del residente propietario
}