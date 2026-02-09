import { Residente } from "../interfaces/residente.interface";
import { v4 as UUIDV4 } from 'uuid';

export const residentesdata: Residente[] = [
  {
    id: "4f8ddeb4-01a3-4bdf-bc4a-7c43f5d27ef7",// UUIDV4(),
    fullname: 'Alejandro El grande',
    number: 'B-120',
    address: 'Calle Jacarandas #101, El Pueblito, QRO',
    email: 'alejandro.grande@example.com',
    phone: '4421234567',
    comunidades: ['fcdc9a85-88b7-4109-84b3-a75107392d87']
  },
  {
    id: "d7576b2c-307d-4d0d-a062-15ee24036485", //UUIDV4(),
    fullname: 'María Fernanda López',
    number: 'C-101',
    address: 'Calle Jacarandas #101, El Pueblito, QRO',
    email: 'maria.lopez@example.com',
    phone: '4421234568',
    comunidades: ['ff7bc6fb-0f13-4e37-beb4-7d428520c227']
  },
  {
    id: UUIDV4(),
    fullname: 'Carlos Ramírez Ortega',
    number: 'C-102',
    address: 'Calle Jacarandas #102, El Pueblito, QRO',
    email: 'carlos.ramirez@example.com',
    phone: '4421234569',
    comunidades: ['c4a28c40-a2c7-4190-961c-f3f52ad19c1d']
  },
  {
    id: UUIDV4(),
    fullname: 'Ana Sofía Torres',
    number: 'C-103',
    address: 'Calle Jacarandas #103, El Pueblito, QRO',
    email: 'ana.torres@example.com',
    phone: '4421234570',
    comunidades: ['ff7bc6fb-0f13-4e37-beb4-7d428520c227']
  },
  {
    id: UUIDV4(),
    fullname: 'Luis Alberto Mendoza',
    number: 'C-104',
    address: 'Calle Jacarandas #104, El Pueblito, QRO',
    email: 'luis.mendoza@example.com',
    phone: '4421234571',
    comunidades: ['aa2f0511-bedd-413c-8681-34f3eee11ac9']
  },
  {
    id: UUIDV4(),
    fullname: 'Gabriela Ruiz Martínez',
    number: 'C-105',
    address: 'Calle Jacarandas #105, El Pueblito, QRO',
    email: 'gabriela.ruiz@example.com',
    phone: '4421234572',
    comunidades: ['9f3cfa42-d4cd-41b3-95d4-e8f6ffdb204c']
  },
  {
    id: UUIDV4(),
    fullname: 'Jorge Iván Salgado',
    number: 'C-106',
    address: 'Calle Jacarandas #106, El Pueblito, QRO',
    email: 'jorge.salgado@example.com',
    phone: '4421234573',
    comunidades: ['fcdc9a85-88b7-4109-84b3-a75107392d87']
  },
  {
    id: UUIDV4(),
    fullname: 'Patricia Gómez',
    number: 'C-107',
    address: 'Calle Jacarandas #107, El Pueblito, QRO',
    email: 'patricia.gomez@example.com',
    phone: '4421234574',
    comunidades: ['c4a28c40-a2c7-4190-961c-f3f52ad19c1d']
  },
  {
    id: UUIDV4(),
    fullname: 'Ricardo Hernández',
    number: 'C-108',
    address: 'Calle Jacarandas #108, El Pueblito, QRO',
    email: 'ricardo.hernandez@example.com',
    phone: '4421234575',
    comunidades: ['ff7bc6fb-0f13-4e37-beb4-7d428520c227']
  },
  {
    id: UUIDV4(),
    fullname: 'Laura Chávez',
    number: 'C-109',
    address: 'Calle Jacarandas #109, El Pueblito, QRO',
    email: 'laura.chavez@example.com',
    phone: '4421234576',
    comunidades: ['aa2f0511-bedd-413c-8681-34f3eee11ac9']
  },
  {
    id: UUIDV4(),
    fullname: 'Daniela Vázquez',
    number: 'C-110',
    address: 'Calle Jacarandas #110, El Pueblito, QRO',
    email: 'daniela.vazquez@example.com',
    phone: '4421234577',
    comunidades: ['9f3cfa42-d4cd-41b3-95d4-e8f6ffdb204c']
  }
];