import { RolesEnum } from "../enums/roles.enum";
import { Comunidad } from "./comunidad.interface";

export interface UserInfo{
    id?: string;
    fullname: string;
    username: string;
    email: string;
    addres?: string;
    role: RolesEnum;
    unidadhabitacional?: Comunidad;    
}