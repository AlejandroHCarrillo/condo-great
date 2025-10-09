import { HorasDelDia, WeekDays } from "../../enums/tiempo.enum";

export interface Horario{
    id?: string;
    day: WeekDays;         //dia de la semana Lun-Mar...
    horainicio: HorasDelDia; // hora en formato 24 horas hh:mm
    horafin: HorasDelDia;    // hora en formato 24 horas hh:mm
    isOpen: boolean;    // Esta abierto o cerrado
    nota: string;
}
