import { RolesEnum } from "../enums/roles.enum";
import { tipoComunidadEnum } from "../enums/tipo-comunidad.enum";
import { Comunidad } from "./comunidad.interface";

export interface ResidentInfo {
    id?: string;
    fullname: string;
    email?: string;
    phone?: string;
    number?: string;
    address: string;
    tipoComunidad: tipoComunidadEnum;
    comunidad?: Comunidad;
}

export interface UserInfo {
    id?: string;
    fullname: string;
    username: string;
    email: string;
    addres?: string;
    role: RolesEnum;
    residentInfo?: ResidentInfo;
}