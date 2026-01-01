// Interfaces para Pets - coinciden con los DTOs del backend

export interface CreatePetRequest {
  residentId: string; // GUID
  name: string;
  species: string;
  breed: string;
  age: number;
  color: string;
}

export interface UpdatePetRequest {
  residentId: string; // GUID
  name: string;
  species: string;
  breed: string;
  age: number;
  color: string;
}

export interface PetDto {
  id: string;
  residentId: string;
  residentName: string;
  name: string;
  species: string;
  breed: string;
  age: number;
  color: string;
  createdAt: string; // ISO date string
}

