export interface CargoResidente {
  id: string;
  residentId: string;
  residentName?: string | null;
  residentNumber?: string | null;
  fecha: string;
  descripcion: string;
  monto: number;
  estatus: string; // Activo, Cancelado, Pagado, Pago Parcial
  createdAt: string;
  updatedAt?: string | null;
  createdByUserId?: string | null;
  updatedByUserId?: string | null;
}

export interface CreateCargoResidenteDto {
  residentId: string;
  fecha: string;
  descripcion: string;
  monto: number;
  estatus: string;
  createdByUserId?: string | null;
}

export interface UpdateCargoResidenteDto {
  residentId: string;
  fecha: string;
  descripcion: string;
  monto: number;
  estatus: string;
  updatedByUserId?: string | null;
}

export const ESTATUS_CARGO_OPCIONES = [
  { value: 'Activo', label: 'Activo' },
  { value: 'Cancelado', label: 'Cancelado' },
  { value: 'Pagado', label: 'Pagado' },
  { value: 'Pago Parcial', label: 'Pago Parcial' }
] as const;
