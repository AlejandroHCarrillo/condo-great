// Interfaces para Resident Visits - coinciden con los DTOs del backend

export interface CreateResidentVisitRequest {
  residentId: string; // GUID
  visitorName: string;
  totalPeople: number;
  vehicleColor?: string | null;
  licensePlate?: string | null;
  subject: string;
  arrivalDate: string; // ISO date string
  departureDate?: string | null; // ISO date string
}

export interface UpdateResidentVisitRequest {
  residentId: string; // GUID
  visitorName: string;
  totalPeople: number;
  vehicleColor?: string | null;
  licensePlate?: string | null;
  subject: string;
  arrivalDate: string; // ISO date string
  departureDate?: string | null; // ISO date string
}

export interface ResidentVisitDto {
  id: string;
  residentId: string;
  residentName: string;
  visitorName: string;
  totalPeople: number;
  vehicleColor?: string | null;
  licensePlate?: string | null;
  subject: string;
  arrivalDate: string; // ISO date string
  departureDate?: string | null; // ISO date string
  createdAt: string; // ISO date string
}

