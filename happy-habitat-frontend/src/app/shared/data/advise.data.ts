import { Advise } from "../interfaces/advise.inteface";

export const avisos: Advise[] = 
[
  {
    id: 1,
    title: 'Mantenimiento de alberca',
    description: 'El mantenimiento mensual de la alberca se realizará el 2025-09-06. Se recomienda no usarla ese día.',
    publishdate: new Date('2025-09-06')
  },
  {
    id: 2,
    title: 'Poda de áreas verdes',
    description: 'La poda general de jardines se llevará a cabo el 2025-09-13. Favor de retirar objetos personales.',
    publishdate: new Date('2025-09-13')
  },
  {
    id: 3,
    title: 'Revisión de luminarias',
    description: 'Se inspeccionarán las luminarias del fraccionamiento el 2025-09-20. Reporta focos fundidos antes de esa fecha.',
    publishdate: new Date('2025-09-20')
  },
  {
    id: 4,
    title: 'Jornada de limpieza comunitaria',
    description: 'Invitamos a todos los vecinos a participar en la limpieza de áreas comunes el 2025-09-27.',
    publishdate: new Date('2025-09-27')
  },
  {
    id: 5,
    title: 'Mantenimiento de cisterna',
    description: 'Se realizará limpieza y revisión de la cisterna el 2025-10-04. El servicio de agua podría verse afectado temporalmente.',
    publishdate: new Date('2025-10-04')
  },
  {
    id: 6,
    title: 'Reunión vecinal mensual',
    description: 'La reunión de vecinos se llevará a cabo en el salón común el 2025-10-11 a las 18:00 hrs.',
    publishdate: new Date('2025-10-11')
  },
  {
    id: 7,
    title: 'Fumigación preventiva',
    description: 'Se fumigarán áreas comunes el 2025-10-18. Evita transitar por zonas tratadas durante ese día.',
    publishdate: new Date('2025-10-18')
  },
  {
    id: 8,
    title: 'Reparación de portón eléctrico',
    description: 'El portón principal estará en mantenimiento el 2025-10-25. Usa el acceso peatonal alternativo.',
    publishdate: new Date('2025-10-25')
  },
  {
    id: 9,
    title: 'Instalación de cámaras de seguridad',
    description: 'Se instalarán nuevas cámaras en puntos estratégicos el 2025-11-01. Habrá personal técnico en el área.',
    publishdate: new Date('2025-11-01')
  },
  {
    id: 10,
    title: 'Decoración de temporada',
    description: 'El comité decorará áreas comunes con temática otoñal el 2025-11-08. Puedes donar adornos si lo deseas.',
    publishdate: new Date('2025-11-08')
  }
];
