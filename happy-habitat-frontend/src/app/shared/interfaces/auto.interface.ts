export interface Auto {
  id: number;           // Identificador único del auto
  idResidente: number;  // ID del residente propietario
  marca: string;        // Marca del vehículo (ej. Toyota, Ford)
  modelo: string;       // Modelo específico (ej. Corolla, Mustang)
  año: number;          // Año de fabricación
  color: string;        // Color del vehículo
  placas: string;       // Número de placas (formato alfanumérico)
}
