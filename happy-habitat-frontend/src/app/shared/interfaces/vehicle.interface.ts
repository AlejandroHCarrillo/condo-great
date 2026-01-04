// Interfaces para Vehicles - coinciden con los DTOs del backend

export interface CreateVehicleRequest {
  residentId: string; // GUID
  brand: string;
  vehicleTypeId: string; // GUID
  model: string;
  year: number;
  color: string;
  licensePlate: string;
}

export interface UpdateVehicleRequest {
  residentId: string; // GUID
  brand: string;
  vehicleTypeId: string; // GUID
  model: string;
  year: number;
  color: string;
  licensePlate: string;
}

export interface VehicleDto {
  id: string;
  residentId: string;
  residentName: string;
  brand: string;
  vehicleTypeId: string;
  vehicleTypeName: string;
  model: string;
  year: number;
  color: string;
  licensePlate: string;
  createdAt: string; // ISO date string
}

