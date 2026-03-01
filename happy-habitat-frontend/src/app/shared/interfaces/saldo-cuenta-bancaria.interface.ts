export interface SaldoCuentaBancaria {
  id: number;
  communityId: string;
  communityName?: string | null;
  banco: string;
  cuenta: string;
  fechaSaldo: string;
  monto: number;
  createdAt: string;
  updatedAt?: string | null;
  createdByUserId?: string | null;
  updatedByUserId?: string | null;
}

export interface CreateSaldoCuentaBancariaDto {
  communityId: string;
  banco: string;
  cuenta: string;
  fechaSaldo: string;
  monto: number;
  createdByUserId?: string | null;
}

export interface UpdateSaldoCuentaBancariaDto {
  communityId: string;
  banco: string;
  cuenta: string;
  fechaSaldo: string;
  monto: number;
  updatedByUserId?: string | null;
}
