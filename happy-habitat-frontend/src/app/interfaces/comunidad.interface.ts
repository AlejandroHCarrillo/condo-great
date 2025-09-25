import { tipoComunidadEnum } from "../enums/tipo-comunidad.enum";

export interface Comunidad{
    id?: string;
    tipoUnidadHabitacional: tipoComunidadEnum; 
    nombre: string;
    ubicacion: string;
    latlng?: { lat: number, lng:number };
    cantidadviviendas: number;
    contacto: string;    
}

