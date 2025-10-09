import { EntradaDirectorio } from "../interfaces/entrada-directorio.inteface";
import { v4 as UUIDV4 } from 'uuid';

export const directorioProveedoresResidentes: EntradaDirectorio[] = 
[
  {
    id: UUIDV4(),
    name: "Servicios generales de Jardineria la Doble R",
    description: `Ofrezco servicio de limpieza, mantenimiento de plantas, árboles y pasto 🌳🌺🌴
                  contamos con 10 años de experiencia TODO A DOMICILIO. SAN JUAN DEL RÍO. Querétaro #laDobleR`,
    tipoServicio: "Jardineria",
    phone: "+52 1 427 126 9116",
    emai: "", 
    img: "",
  }, 
    {
    id: UUIDV4(),
    name: "Aluminium Martinezs",
    description: "Herrero, Balconero, aluminio",
    tipoServicio: "Herrero",
    phone: "+524272196945",
    emai: "", 
    img: "",
  }, 
  {
    id: UUIDV4(),
    name: 'Gas Exprés Queretano',
    description: 'Distribución de gas LP a domicilio con cobertura en El Pueblito y zonas cercanas.',
    tipoServicio: 'Gas',
    phone: '442-123-4567',
    emai: 'contacto@gasqueretano.com',
    img: 'https://example.com/img/gas.png'
  },
  {
    id: UUIDV4(),
    name: 'URBAN GAS Queretaro',
    description: 'GAS Queretaro Pedidos',
    tipoServicio: 'Gas',
    phone: '442-488-7953',
    emai: '',
    img: ''
  },
  {
    id: UUIDV4(),
    name: 'Juan Servin',
    description: 'Jardineria',
    tipoServicio: 'Jardineria',
    phone: '442 327 9133',
    emai: '',
    img: ''
  },
  {
    id: UUIDV4(),
    name: 'Herrería El Forjador',
    description: 'Fabricación y reparación de portones, barandales y estructuras metálicas.',
    tipoServicio: 'Herrería',
    phone: '442-234-5678',
    emai: 'servicio@elforjador.mx',
    img: 'https://example.com/img/herreria.png'
  },
  {
    id: UUIDV4(),
    name: 'Fumigaciones La Plaga',
    description: 'Control de plagas en áreas comunes, jardines y cisternas. Servicio certificado.',
    tipoServicio: 'Fumigación',
    phone: '442-345-6789',
    emai: 'info@laplaga.com',
    img: 'https://example.com/img/fumigacion.png'
  },
  {
    id: UUIDV4(),
    name: 'Jardinería Verde Vivo',
    description: 'Mantenimiento de áreas verdes, poda de árboles y diseño de jardines.',
    tipoServicio: 'Jardinería',
    phone: '442-456-7890',
    emai: 'verdevivo@jardines.mx',
    img: 'https://example.com/img/jardineria.png'
  },
  {
    id: UUIDV4(),
    name: 'Electricista Don Chuy',
    description: 'Instalaciones eléctricas, reparación de luminarias y revisión de medidores.',
    tipoServicio: 'Electricidad',
    phone: '442-567-8901',
    emai: 'donchuy@electricidad.com',
    img: 'https://example.com/img/electricista.png'
  },
  {
    id: UUIDV4(),
    name: 'Fontanería El Goteo',
    description: 'Reparación de fugas, mantenimiento de cisternas y redes hidráulicas.',
    tipoServicio: 'Fontanería',
    phone: '442-678-9012',
    emai: 'servicio@elgoteo.mx',
    img: 'https://example.com/img/fontaneria.png'
  },
  {
    id: UUIDV4(),
    name: 'Seguridad Integral',
    description: 'Instalación de cámaras, alarmas y monitoreo remoto para zonas residenciales.',
    tipoServicio: 'Seguridad',
    phone: '442-789-0123',
    emai: 'ventas@seguridadintegral.com',
    img: 'https://example.com/img/seguridad.png'
  },
  {
    id: UUIDV4(),
    name: 'Pinturas y Acabados JR',
    description: 'Pintura de muros, fachadas y señalización en espacios comunes.',
    tipoServicio: 'Pintura',
    phone: '442-890-1234',
    emai: 'jr@pinturasjr.com',
    img: 'https://example.com/img/pintura.png'
  },
  {
    id: UUIDV4(),
    name: 'Reparaciones Express',
    description: 'Servicio general de mantenimiento: carpintería, albañilería y ajustes menores.',
    tipoServicio: 'Mantenimiento general',
    phone: '442-901-2345',
    emai: 'express@reparaciones.com',
    img: 'https://example.com/img/mantenimiento.png'
  },
  {
    id: UUIDV4(),
    name: 'Eventos y Toldos Queretaro',
    description: 'Renta de toldos, sillas y sonido para reuniones vecinales y eventos comunitarios.',
    tipoServicio: 'Eventos',
    phone: '442-012-3456',
    emai: 'contacto@eventosqro.mx',
    img: 'https://example.com/img/eventos.png'
  }
];
