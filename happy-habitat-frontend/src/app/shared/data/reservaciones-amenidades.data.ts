import { Amenidad } from "../interfaces/amenidad.interface";
import { v4 as UUIDV4 } from 'uuid';
import { ReservacionAmenidad } from "../interfaces/reservacion-amenidad.interface";

export const reservacionesamenidadesdata: ReservacionAmenidad[] = 
[
  {
    id: UUIDV4(),
    amenidadId: "d847101d-6286-4938-a25e-3de84208d547", // Alberca
    residenteId: "4f8ddeb4-01a3-4bdf-bc4a-7c43f5d27ef7", // Alejandro el grande
    numPersonas: 5,
    horario: new Date("2025-09-30 12:00")
  },
  {
    id: UUIDV4(),
    amenidadId: "d847101d-6286-4938-a25e-3de84208d547", // Alberca
    residenteId: "4f8ddeb4-01a3-4bdf-bc4a-7c43f5d27ef7", // Alejandro el grande
    numPersonas: 5,
    horario: new Date("2025-09-30 12:00")
  },
  {
    id: UUIDV4(),
    amenidadId: "d847101d-6286-4938-a25e-3de84208d547", // Alberca
    residenteId: "4f8ddeb4-01a3-4bdf-bc4a-7c43f5d27ef7", // Alejandro el grande
    numPersonas: 21,
    horario: new Date("2025-10-02 12:00")
  },
  {
    id: UUIDV4(),
    amenidadId: "d847101d-6286-4938-a25e-3de84208d547", // Alberca
    residenteId: "4f8ddeb4-01a3-4bdf-bc4a-7c43f5d27ef7", // Alejandro el grande
    numPersonas: 35,
    horario: new Date("2025-10-05 11:00")
  },
  {
    id: UUIDV4(),
    amenidadId: "d847101d-6286-4938-a25e-3de84208d547", // Alberca
    residenteId: "4f8ddeb4-01a3-4bdf-bc4a-7c43f5d27ef7", // Alejandro el grande
    numPersonas: 4,
    horario: new Date("2025-10-04 12:00")
  },
  {
    id: UUIDV4(),
    amenidadId: "d847101d-6286-4938-a25e-3de84208d547", // Alberca
    residenteId: "4f8ddeb4-01a3-4bdf-bc4a-7c43f5d27ef7", // Alejandro el grande
    numPersonas: 7,
    horario: new Date("2025-10-04 12:00")
  },
  {
    id: UUIDV4(),
    amenidadId: "4f4f568d-78cc-498b-aaba-f9a02c783ccf", // Casa club Eventos
    residenteId: "4f8ddeb4-01a3-4bdf-bc4a-7c43f5d27ef7", // Alejandro el grande
    numPersonas: 70,
    horario: new Date("2025-10-04 10:00")
  },
  {
    id: UUIDV4(),
    amenidadId: "efaaa463-7ab3-45e3-926d-4bb244c9dc95", // Casa club residentes
    residenteId: "4f8ddeb4-01a3-4bdf-bc4a-7c43f5d27ef7", // Alejandro el grande
    numPersonas: 7,
    horario: new Date("2025-10-01 10:00")
  },

];
