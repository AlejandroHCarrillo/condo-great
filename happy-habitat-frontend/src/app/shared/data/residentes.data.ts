import { Residente } from "../interfaces/residente.interface";
import { v4 as UUIDV4 } from 'uuid';

export const residentesdata: Residente[] = [
  {
    id: "4f8ddeb4-01a3-4bdf-bc4a-7c43f5d27ef7",// UUIDV4(),
    fullname: 'Alejandro El grande',
    number: 'B-120',
    address: 'Calle Jacarandas #101, El Pueblito, QRO',
    rol: 'residente'
  },
  {
    id: "d7576b2c-307d-4d0d-a062-15ee24036485", //UUIDV4(),
    fullname: 'María Fernanda López',
    number: 'C-101',
    address: 'Calle Jacarandas #101, El Pueblito, QRO',
    rol: 'residente'
  },
  {
    id: UUIDV4(),
    fullname: 'Carlos Ramírez Ortega',
    number: 'C-102',
    address: 'Calle Jacarandas #102, El Pueblito, QRO',
    rol: 'residente'
  },
  {
    id: UUIDV4(),
    fullname: 'Ana Sofía Torres',
    number: 'C-103',
    address: 'Calle Jacarandas #103, El Pueblito, QRO',
    rol: 'residente'
  },
  {
    id: UUIDV4(),
    fullname: 'Luis Alberto Mendoza',
    number: 'C-104',
    address: 'Calle Jacarandas #104, El Pueblito, QRO',
    rol: 'residente'
  },
  {
    id: UUIDV4(),
    fullname: 'Gabriela Ruiz Martínez',
    number: 'C-105',
    address: 'Calle Jacarandas #105, El Pueblito, QRO',
    rol: 'residente'
  },
  {
    id: UUIDV4(),
    fullname: 'Jorge Iván Salgado',
    number: 'C-106',
    address: 'Calle Jacarandas #106, El Pueblito, QRO',
    rol: 'residente'
  },
  {
    id: UUIDV4(),
    fullname: 'Patricia Gómez',
    number: 'C-107',
    address: 'Calle Jacarandas #107, El Pueblito, QRO',
    rol: 'residente'
  },
  {
    id: UUIDV4(),
    fullname: 'Ricardo Hernández',
    number: 'C-108',
    address: 'Calle Jacarandas #108, El Pueblito, QRO',
    rol: 'residente'
  },
  {
    id: UUIDV4(),
    fullname: 'Laura Chávez',
    number: 'C-109',
    address: 'Calle Jacarandas #109, El Pueblito, QRO',
    rol: 'residente'
  },
  {
    id: UUIDV4(),
    fullname: 'Daniela Vázquez',
    number: 'C-110',
    address: 'Calle Jacarandas #110, El Pueblito, QRO',
    rol: 'residente'
  }
];