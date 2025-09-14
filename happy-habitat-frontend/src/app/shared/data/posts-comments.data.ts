import { Comentario } from "../interfaces/comentario.interface";
import { Post } from "../interfaces/post.interface";

export const Posts: Post[] = [
    {
      id: 1,
      titulo: 'Taller de reciclaje',
      contenido: 'Únete al taller para aprender técnicas de reciclaje en casa.',
      autorId: 101,
      fechaCreacion: new Date('2025-09-10'),
      etiquetas: ['comunidad', 'ecología'],
      esDestacado: true
    },
    {
      id: 2,
      titulo: 'Convocatoria para voluntarios',
      contenido: 'Buscamos voluntarios para el evento de limpieza del parque.',
      autorId: 102,
      fechaCreacion: new Date('2025-09-11'),
      etiquetas: ['voluntariado']
    }
  ];

export const PostComments: Comentario[] = [
    {
      id: 1,
      postId: 1,
      autorId: 201,
      contenido: '¡Excelente iniciativa! ¿Dónde será el taller?',
      fechaCreacion: new Date('2025-09-10T14:00')
    },
    {
      id: 2,
      postId: 1,
      autorId: 202,
      contenido: 'Me apunto como voluntario. ¿Hay requisitos?',
      fechaCreacion: new Date('2025-09-11T09:30')
    },
        {
      id: 3,
      postId: 1,
      autorId: 201,
      contenido: '¡Excelente iniciativa! ¿Dónde será el taller?',
      fechaCreacion: new Date('2025-09-10T14:00')
    },
    {
      id: 4,
      postId: 2,
      autorId: 202,
      contenido: 'Me apunto como voluntario. ¿Hay requisitos?',
      fechaCreacion: new Date('2025-09-11T09:30')
    }

  ];