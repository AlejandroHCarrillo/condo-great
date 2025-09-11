export interface Residente {
  id: number;
  nombreCompleto: string;
  numeroCasa: string;
  address: string;
  phone?: string;
  email?: string;
  rol: 'residente';
}
