import { HorasDelDia, WeekDays } from "../../enums/tiempo.enum";
import { Horario } from "./horario.interface";

export interface HorarioAmenidad{
    id?: string,
    amenidadId: string;
    horario: Horario[]    
}
