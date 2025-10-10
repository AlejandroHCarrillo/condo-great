import { Amenidad } from "../interfaces/amenidad.interface";
import { v4 as UUIDV4 } from 'uuid';

export const reservacionesamenidadesdata: Amenidad[] = 
[
  {
    id: "4f4f568d-78cc-498b-aaba-f9a02c783ccf", // UUIDV4(),
    nombre: "Casa club eventos",
    descripcion: "Casa club del Coto Berlín",
    reglas: `Fines de semana y dias festivos reservar por cuatro horas con un costo de 1500 pesos, 
             los cuales 500 serán usados para la limpieza y 
             1000 seran reembolsados aplicandolos a las cuotas del residente.
             Uso de asador con consto de 500 pesos extra.
             Se puede hacer uso de la alberca NO es exclusivo, por lo que los residentes pueden 
             hacer uso de la alberca.
             `,
    costo: 1500,
    fechaalta: new Date('2025-11-08'),
    imagen: "images/amenidades/coto-berlin-casa-club.png",
    comunidad: "9f3cfa42-d4cd-41b3-95d4-e8f6ffdb204c"
  },
  {
    id: "d847101d-6286-4938-a25e-3de84208d547", // UUIDV4(),
    nombre: "Alberca",
    descripcion: "Alberca del coto berlin.",
    reglas: `<div class="text-lg">Reglas:</div> 
              <ul class="list-disc list-inside text-base-content space-y-1">
              <li>No se permiten bebidas embriagantes.</li>
              <li>Los niños deben ser supervisados por un adulto</li>
              <li>Antes de entar debe asearse en la regadera</li>
             </ul>`,
    costo: 0,
    fechaalta: new Date('2025-11-08'),
    imagen: "images/amenidades/coto-berlin-alberca.jpg",
    comunidad: "9f3cfa42-d4cd-41b3-95d4-e8f6ffdb204c"
  },  
  {
    id: "efaaa463-7ab3-45e3-926d-4bb244c9dc95", // UUIDV4(),
    nombre: "Casa club residentes",
    descripcion: "Casa club del Coto Berlín",
    reglas: `Lunes a viernes se puede reservar sin costo por los residentes durante 2 horas, 
             Se puede hacer uso NO es exclusivo de la alberca.
             `,
    costo: 0,
    fechaalta: new Date('2025-11-08'),
    imagen: "images/amenidades/coto-berlin-casa-club.png",
    comunidad: "9f3cfa42-d4cd-41b3-95d4-e8f6ffdb204c"
  },


  {
    id: "ecee0e3c-c765-464b-a413-a7bfd823b364", // UUIDV4(),
    nombre: "Escalera",
    descripcion: "Escalera de aluminio plana de aluminio",
    reglas: `Todo residente puede usarla registrandose en el sistema,
             esto alerta a vigilancia y a la mesa directiva, 
             lo cual le permite usarla por 48 horas,              
             cuando termine de usarla debe registrar que ya la termino de usar
             dando aviso a vigilancia y a la mesa directiva
             `,
    costo: 0,
    fechaalta: new Date('2025-11-08'),
    imagen: "images/amenidades/coto-berlin-escalera.png",
    comunidad: "9f3cfa42-d4cd-41b3-95d4-e8f6ffdb204c"
  },
  {
    id: UUIDV4(),
    nombre: "Cancha de padel",
    descripcion: "Cancha de padel",
    reglas: `Debe registrarse el el sistma de TYA o al telefono...`,
    costo: 0,
    fechaalta: new Date('2025-11-08'),
    imagen: "images/amenidades/",
    comunidad: "9f3cfa42-d4cd-41b3-95d4-e8f6ffdb204c"
  },
  {
    id: UUIDV4(),
    nombre: "Cancha de futbol rapido",
    descripcion: "Cancha de futbol reapido",
    reglas: `Debe registrarse el el sistma de TYA o al telefono...`,
    costo: 0,
    fechaalta: new Date('2025-11-08'),
    imagen: "images/amenidades/",
    comunidad: "9f3cfa42-d4cd-41b3-95d4-e8f6ffdb204c"
  },
  {
    id: UUIDV4(),
    nombre: "Cancha de basquetbol",
    descripcion: "Cancha de basquetbol",
    reglas: `Debe registrarse el el sistma de TYA o al telefono...`,
    costo: 0,
    fechaalta: new Date('2025-11-08'),
    imagen: "images/amenidades/",
    comunidad: "9f3cfa42-d4cd-41b3-95d4-e8f6ffdb204c"
  },

  // {
  //   id: 10,
  //   title: 'Decoración de temporada',
  //   description: 'El comité decorará áreas comunes con temática otoñal el 2025-11-08. Puedes donar adornos si lo deseas.',
  //   publishdate: new Date('2025-11-08')
  // }
];
