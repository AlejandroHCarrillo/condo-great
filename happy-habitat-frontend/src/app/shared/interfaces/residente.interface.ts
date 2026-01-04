import { tipoComunidadEnum } from "../../enums/tipo-comunidad.enum";

export interface Residente {
  id?: string;
  fullname: string;
  email?: string;
  phone?: string;
  number?:string;
  address: string;
  comunidades?: string[];
}
