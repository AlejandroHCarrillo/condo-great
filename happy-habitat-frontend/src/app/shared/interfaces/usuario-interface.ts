import { Residente } from "./residente.interface";

export interface Usuario {
  id: number;
  username: string;
  password: string;
  details: Residente;
}
