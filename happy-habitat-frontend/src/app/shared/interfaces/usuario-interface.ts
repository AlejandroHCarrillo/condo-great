import { RolesEnum } from "../../enums/roles.enum";
import { Residente } from "./residente.interface";

export interface Usuario {
  id?: string;
  role: RolesEnum;
  username: string;
  password: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  ResidentInfo?: Residente;
}
