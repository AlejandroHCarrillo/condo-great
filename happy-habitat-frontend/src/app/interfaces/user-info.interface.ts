import { RolesEnum } from "../enums/roles.enum";
import { Comunidad } from "./comunidad.interface";

export interface ResidentInfo {
    id?: string;
    fullname: string;
    email?: string;
    phone?: string;
    number?: string;
    address: string;
    comunidades?: string[];
}

export interface UserInfo{
    id?: string;
    fullname: string;
    username: string;
    email: string;
    addres?: string;
    role: RolesEnum;
    unidadhabitacional?: Comunidad;
    residentInfo?: ResidentInfo;
}