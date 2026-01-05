import { Comunicado } from "../interfaces/comunicado.interface";
import { v4 as UUIDV4 } from 'uuid';

export const comunicadosdata: Comunicado[] = [
  {
    id: UUIDV4(),
    titulo: 'Propuesta de reglamento revisión',
    subtitulo: 'Cierre temporal por limpieza',
    descripcion: `Estimados condóminos:
    
    Durante el taller de revisión del reglamento no fue posible concluir con todas las preguntas y observaciones planteadas por los vecinos. 

    Con el fin de que todos puedan participar activamente en este proceso, la administración compartirá el reglamento con el texto resaltado en aquellos partes que están propuestas para modificación.

    Le recordamos que ustedes son quienes construyen y deciden estas modificaciones. Por ello, los invitamos a enviarnos sus dudas, comentarios o sugerencias a través de Whatsapp al número de la administración

    La fecha límite para poder recibir este tipo de información será el 12 de Septiembre del presente año.

    De esta forma podremos integrar todas las opiniones para la siguiente revisión y asegurar que el reglamento refleje las necesidades y acuerdos de nuestra comunidad. 

    ¡Gracias por su participación y compromiso!

    Este es el link en donde encontrarán la propuesta de reglamento con las señalizaciones específicas. 

    https://drive.google.com/file/d/1OG95bOMdZKWme-90_dg3VhTuYs1jMlfd/view?usp=sharing`
    ,
    fecha: '2025-09-08',
    // imagen: 'images/anuncios/manenimiento_alberca.png'
  },
  {
    id: UUIDV4(),
    titulo: 'Mantenimiento de la alberca',
    subtitulo: 'Cierre temporal por limpieza',
    descripcion: 'La alberca estará cerrada el 2025-09-12 para realizar limpieza profunda y revisión del sistema de filtrado.',
    fecha: '2025-09-12',
    imagen: 'images/anuncios/manenimiento_alberca.png'
  },
  {
    id: UUIDV4(),
    titulo: 'Jornada de reciclaje',
    subtitulo: 'Trae tus residuos separados',
    descripcion: 'Este sábado 2025-09-14 se instalará un punto de acopio en el parque central para reciclaje de papel, plástico y electrónicos.',
    fecha: '2025-09-14',
    imagen: 'images/anuncios/jornada-reciclaje.png'
  },
  {
    id: UUIDV4(),
    titulo: 'Fumigación preventiva',
    subtitulo: 'Control de plagas en áreas comunes',
    descripcion: 'El lunes 2025-09-16 se realizará fumigación en jardines y pasillos. Evita transitar por zonas tratadas durante ese día.',
    fecha: '2025-09-16',
    imagen: 'images/anuncios/fumigacion.png'
  },
  {
    id: UUIDV4(),
    titulo: 'Reunión vecinal mensual',
    subtitulo: 'Temas de seguridad y mantenimiento',
    descripcion: 'La reunión se llevará a cabo el 2025-09-20 a las 18:00 hrs en el salón común. Participa y haz escuchar tu voz.',
    fecha: '2025-09-20',
    imagen: 'images/anuncios/reunion-mensual.png'
  },
  {
    id: UUIDV4(),
    titulo: 'Instalación de cámaras',
    subtitulo: 'Mejora de seguridad perimetral',
    descripcion: 'El 2025-09-22 se instalarán nuevas cámaras en los accesos principales. Habrá personal técnico en el área.',
    fecha: '2025-09-22',
    imagen: 'images/anuncios/instalacion-camaras.png'
  },
  {
    id: UUIDV4(),
    titulo: 'Decoración de otoño',
    subtitulo: 'Convocatoria para voluntarios',
    descripcion: 'El comité invita a decorar áreas comunes con temática otoñal el 2025-09-25. Puedes donar adornos o ayudar en el montaje.',
    fecha: '2025-09-25',
    imagen: 'images/anuncios/decoracion-otono.png'
  },
  {
    id: UUIDV4(),
    titulo: 'Poda de árboles',
    subtitulo: 'Mantenimiento de áreas verdes',
    descripcion: 'El 2025-09-28 se realizará poda en los jardines del lado norte. Favor de retirar objetos personales cercanos.',
    fecha: '2025-09-28',
    imagen: 'images/anuncios/poda-arboles.png'
  },
  {
    id: UUIDV4(),
    titulo: 'Taller de compostaje',
    subtitulo: 'Aprende a reducir residuos orgánicos',
    descripcion: 'El 2025-10-01 se impartirá un taller gratuito sobre compostaje en el salón común. Cupo limitado, regístrate con anticipación.',
    fecha: '2025-10-01',
    imagen: 'images/anuncios/taller-compostaje.png'
  },
  {
    id: UUIDV4(),
    titulo: 'Reparación del portón',
    subtitulo: 'Acceso restringido temporalmente',
    descripcion: 'El portón principal estará en mantenimiento el 2025-10-03. Usa el acceso peatonal alternativo durante ese día.',
    fecha: '2025-10-03',
    imagen: 'images/anuncios/reparacion-porton.png'
  },
  {
    id: UUIDV4(),
    titulo: 'Festival comunitario',
    subtitulo: 'Música, comida y juegos',
    descripcion: 'El 2025-10-06 se celebrará el festival anual en el parque central. ¡Trae a tu familia y disfruta!',
    fecha: '2025-10-06',
    imagen: 'images/anuncios/festival-comunitario.png'
  }
];