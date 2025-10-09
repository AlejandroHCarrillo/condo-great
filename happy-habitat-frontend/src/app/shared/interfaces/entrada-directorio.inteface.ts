import { Comentario } from './comentario.interface';
export interface EntradaDirectorio {
    id?: string;
    name: string;
    description: string;
    tipoServicio: string;
    phone: string;
    emai: string;
    img?: string;
    likes?: number;
    comentarios?: Comentario[];
}
