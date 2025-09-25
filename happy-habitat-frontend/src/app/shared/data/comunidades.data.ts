import { tipoComunidadEnum } from "../../enums/tipo-comunidad.enum";
import { Comunidad } from "../../interfaces/comunidad.interface";
import { v4 as UUIDV4 } from 'uuid';

export const comunidadesData: Comunidad[] = 
[
  {
    id: "fcdc9a85-88b7-4109-84b3-a75107392d87",
    tipoUnidadHabitacional: tipoComunidadEnum.FRACCIONAMIENTO,
    nombre: "Residencial El Pueblito",
    ubicacion: "Av. Paseo del Pueblito 123, El Pueblito, QRO",
    latlng: {
      lat: 20.5821,
      lng: -100.3897
    },
    cantidadviviendas: 120,
    contacto: "admin@elpueblito.mx"
  },
  {
    id: "ff7bc6fb-0f13-4e37-beb4-7d428520c227",
    tipoUnidadHabitacional: tipoComunidadEnum.COLONIA,
    nombre: "Colonia Las Palmas",
    ubicacion: "Calle Palma Real 45, Querétaro, QRO",
    latlng: {
      lat: 20.5932,
      lng: -100.3921
    },
    cantidadviviendas: 85,
    contacto: "contacto@laspalmas.org"
  },
  {
    id: "c4a28c40-a2c7-4190-961c-f3f52ad19c1d",
    tipoUnidadHabitacional: tipoComunidadEnum.COTO,
    nombre: "Coto San Miguel",
    ubicacion: "Privada San Miguel 8, Corregidora, QRO",
    latlng: {
      lat: 20.5798,
      lng: -100.3865
    },
    cantidadviviendas: 60,
    contacto: "info@cotosanmiguel.com"
  },
  {
    id: "aa2f0511-bedd-413c-8681-34f3eee11ac9",
    tipoUnidadHabitacional: tipoComunidadEnum.FRACCIONAMIENTO,
    nombre: "Villa del Sol",
    ubicacion: "Av. del Sol 200, Querétaro, QRO",
    latlng: {
      lat: 20.6001,
      lng: -100.395
    },
    cantidadviviendas: 150,
    contacto: "villa@delsol.mx"
  },
  {
    id: "9f3cfa42-d4cd-41b3-95d4-e8f6ffdb204c",
    tipoUnidadHabitacional: tipoComunidadEnum.COLONIA,
    nombre: "Colonia Jardines",
    ubicacion: "Calle Gardenia 10, El Marqués, QRO",
    latlng: {
      lat: 20.6105,
      lng: -100.3802
    },
    cantidadviviendas: 95,
    contacto: "jardines@comunidad.org"
  }
];

// [
//   {
//     id: UUIDV4(),
//     tipoUnidadHabitacional: tipoComunidadEnum.FRACCIONAMIENTO,
//     nombre: "Residencial El Pueblito",
//     ubicacion: "Av. Paseo del Pueblito 123, El Pueblito, QRO",
//     latlng: { "lat": 20.5821, "lng": -100.3897 },
//     cantidadviviendas: 120,
//     contacto: "admin@elpueblito.mx"
//   },
//   {
//     id: UUIDV4(),
//     tipoUnidadHabitacional: tipoComunidadEnum.COLONIA,
//     nombre: "Colonia Las Palmas",
//     ubicacion: "Calle Palma Real 45, Querétaro, QRO",
//     latlng: { "lat": 20.5932, "lng": -100.3921 },
//     cantidadviviendas: 85,
//     contacto: "contacto@laspalmas.org"
//   },
//   {
//     id: UUIDV4(),
//     tipoUnidadHabitacional: tipoComunidadEnum.COTO,
//     nombre: "Coto San Miguel",
//     ubicacion: "Privada San Miguel 8, Corregidora, QRO",
//     latlng: { "lat": 20.5798, "lng": -100.3865 },
//     cantidadviviendas: 60,
//     contacto : "info@cotosanmiguel.com"
//   },
//   {
//     id: UUIDV4(),
//     tipoUnidadHabitacional: tipoComunidadEnum.FRACCIONAMIENTO,
//     nombre: "Villa del Sol",
//     ubicacion: "Av. del Sol 200, Querétaro, QRO",
//     latlng: { "lat": 20.6001, "lng": -100.3950 },
//     cantidadviviendas: 150,
//     contacto: "villa@delsol.mx"
//   },
//   {
//     id: UUIDV4(),
//     tipoUnidadHabitacional: tipoComunidadEnum.COLONIA,
//     nombre: "Colonia Jardines",
//     ubicacion: "Calle Gardenia 10, El Marqués, QRO",
//     latlng: { "lat": 20.6105, "lng": -100.3802 },
//     cantidadviviendas: 95,
//     contacto: "jardines@comunidad.org"
//   }
// ];