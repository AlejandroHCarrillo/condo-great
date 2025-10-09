import { v4 as UUIDV4 } from 'uuid';
import { HorasDelDia, WeekDays } from "../../enums/tiempo.enum";
import { HorarioAmenidad } from "../interfaces/amenidad-horario.interface";

export const horarioAmenidadesData : HorarioAmenidad[] = [
    {
        amenidadId: "d847101d-6286-4938-a25e-3de84208d547", // alberca
        horario: [
            {
                id: UUIDV4(),
                day: WeekDays.MONDAY,
                horainicio: HorasDelDia.H06_00,
                horafin: HorasDelDia.H22_00,
                isOpen: false,
                nota: "Cerrada por mantenimiento"
            },
            {
                id: UUIDV4(),
                day: WeekDays.TUESDAY,
                horainicio: HorasDelDia.H06_00,
                horafin: HorasDelDia.H22_00,
                isOpen: true,
                nota: ""
            },
            {
                id: UUIDV4(),
                day: WeekDays.WEDNESDAY,
                horainicio: HorasDelDia.H06_00,
                horafin: HorasDelDia.H22_00,
                isOpen: true,
                nota: ""
            },
            {
                id: UUIDV4(),
                day: WeekDays.THURSDAY,
                horainicio: HorasDelDia.H06_00,
                horafin: HorasDelDia.H10_00,
                isOpen: false,
                nota: "Cerrada por mantenimiento"
            },
            {
                id: UUIDV4(),
                day: WeekDays.THURSDAY,
                horainicio: HorasDelDia.H10_00,
                horafin: HorasDelDia.H22_00,
                isOpen: true,
                nota: ""
            },
            {
                id: UUIDV4(),
                day: WeekDays.FRIDAY,
                horainicio: HorasDelDia.H06_00,
                horafin: HorasDelDia.H22_00,
                isOpen: true,
                nota: ""
            },
            {
                id: UUIDV4(),
                day: WeekDays.SATURDAY,
                horainicio: HorasDelDia.H06_00,
                horafin: HorasDelDia.H22_00,
                isOpen: true,
                nota: ""
            },
            {
                id: UUIDV4(),
                day: WeekDays.SUNDAY,
                horainicio: HorasDelDia.H06_00,
                horafin: HorasDelDia.H22_00,
                isOpen: true,
                nota: ""
            },
        ]
    },
    {
        amenidadId: "efaaa463-7ab3-45e3-926d-4bb244c9dc95", // Casa club residentes
        horario: [
            {
                id: UUIDV4(),
                day: WeekDays.MONDAY,
                horainicio: HorasDelDia.H06_00,
                horafin: HorasDelDia.H22_00,
                isOpen: true,
                nota: "abierto casa club"
            },
            {
                id: UUIDV4(),
                day: WeekDays.TUESDAY,
                horainicio: HorasDelDia.H06_00,
                horafin: HorasDelDia.H22_00,
                isOpen: true,
                nota: ""
            },
            {
                id: UUIDV4(),
                day: WeekDays.WEDNESDAY,
                horainicio: HorasDelDia.H10_00,
                horafin: HorasDelDia.H22_00,
                isOpen: true,
                nota: ""
            },
            {
                id: UUIDV4(),
                day: WeekDays.THURSDAY,
                horainicio: HorasDelDia.H10_00,
                horafin: HorasDelDia.H22_00,
                isOpen: true,
                nota: ""
            },
            {
                id: UUIDV4(),
                day: WeekDays.FRIDAY,
                horainicio: HorasDelDia.H06_00,
                horafin: HorasDelDia.H22_00,
                isOpen: true,
                nota: ""
            },
        ]
    },
    {
        amenidadId: "4f4f568d-78cc-498b-aaba-f9a02c783ccf", // casa club eventos
        horario: [
            {
                id: UUIDV4(),
                day: WeekDays.MONDAY,
                horainicio: HorasDelDia.H06_00,
                horafin: HorasDelDia.H22_00,
                isOpen: false,
                nota: "Cerrada por mantenimiento"
            },
            {
                id: UUIDV4(),
                day: WeekDays.TUESDAY,
                horainicio: HorasDelDia.H06_00,
                horafin: HorasDelDia.H22_00,
                isOpen: true,
                nota: ""
            },
            {
                id: UUIDV4(),
                day: WeekDays.WEDNESDAY,
                horainicio: HorasDelDia.H06_00,
                horafin: HorasDelDia.H22_00,
                isOpen: true,
                nota: ""
            },
            {
                id: UUIDV4(),
                day: WeekDays.THURSDAY,
                horainicio: HorasDelDia.H06_00,
                horafin: HorasDelDia.H10_00,
                isOpen: false,
                nota: "Cerrada por mantenimiento"
            },
            {
                id: UUIDV4(),
                day: WeekDays.THURSDAY,
                horainicio: HorasDelDia.H10_00,
                horafin: HorasDelDia.H22_00,
                isOpen: true,
                nota: ""
            },
            {
                id: UUIDV4(),
                day: WeekDays.FRIDAY,
                horainicio: HorasDelDia.H06_00,
                horafin: HorasDelDia.H22_00,
                isOpen: true,
                nota: ""
            },
            {
                id: UUIDV4(),
                day: WeekDays.SATURDAY,
                horainicio: HorasDelDia.H06_00,
                horafin: HorasDelDia.H22_00,
                isOpen: true,
                nota: ""
            },
            {
                id: UUIDV4(),
                day: WeekDays.SUNDAY,
                horainicio: HorasDelDia.H06_00,
                horafin: HorasDelDia.H22_00,
                isOpen: true,
                nota: ""
            },
        ]
    }
];