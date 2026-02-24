export interface PagosResidente {
  id: string;
  residenteId: string;
  residentName?: string | null;
  residentNumber?: string | null;
  fechaPago: string;
  monto: number;
  status: string; // PorConfirmar, Aplicado, Cancelado
  concepto?: string | null;
  urlComprobante?: string | null;
  nota?: string | null;
  createdAt: string;
  updatedAt?: string | null;
  createdByUserId?: string | null;
  updatedByUserId?: string | null;
}

export interface CreatePagosResidenteDto {
  residenteId: string;
  fechaPago: string;
  monto: number;
  status: string;
  concepto?: string | null;
  urlComprobante?: string | null;
  nota?: string | null;
  createdByUserId?: string | null;
}

export interface UpdatePagosResidenteDto {
  residenteId: string;
  fechaPago: string;
  monto: number;
  status: string;
  concepto?: string | null;
  urlComprobante?: string | null;
  nota?: string | null;
  updatedByUserId?: string | null;
}

export const STATUS_PAGO_OPCIONES = [
  { value: 'PorConfirmar', label: 'Por confirmar' },
  { value: 'Aplicado', label: 'Aplicado' },
  { value: 'Cancelado', label: 'Cancelado' }
] as const;
