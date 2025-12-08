import { Auto } from "../interfaces/auto.interface";
import { v4 as UUIDV4 } from 'uuid';

export const autos: Auto[] = [
  {
    id: UUIDV4(),
    marca: "Nissan",
    modelo: "Versa",
    año: 2020,
    color: "Rojo",
    placas: "UYZ-123-A",
    residenteId: "101"
  },
  {
    id: UUIDV4(),
    marca: "Volkswagen",
    modelo: "Jetta",
    año: 2018,
    color: "Negro",
    placas: "ABC-456-B",
    residenteId: "101"
  },
  {
    id: UUIDV4(),
    marca: "Chevrolet",
    modelo: "Aveo",
    año: 2019,
    color: "Blanco",
    placas: "LMN-789-C",
    residenteId: "102"
  },
  {
    id: UUIDV4(),
    marca: "Toyota",
    modelo: "Corolla",
    año: 2021,
    color: "Azul",
    placas: "XYZ-321-D",
    residenteId: "102"
  }
];