import { RolesEnum } from "../../enums/roles.enum";
import { Residente } from "../interfaces/residente.interface";
import { Usuario } from "../interfaces/usuario-interface";

const usuarioLoggeado: Usuario = {
    id: 'EWQ-RETRTFC-ERTDSF-EFGHT-SDSD',
    role: RolesEnum.SYSTEM_ADMIN,
    username: "ahcarrillo",
    password: "ZXXXXXXX",
    ResidentInfo: {
                id: "B120-AHC-654ASD65",
                fullname: "Alejandro H. Carrillo",
                email: "alejandro.hernandez@superrito.com",
                phone: "5523456789",
                address: "Av. Reforma 123, CDMX",
                comunidades: ["fcdc9a85-88b7-4109-84b3-a75107392d87"],
    }
}