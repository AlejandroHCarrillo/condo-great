import { v4 as UUIDV4 } from 'uuid';
import { RolesEnum } from "../../enums/roles.enum";
import { Usuario } from "../interfaces/usuario-interface";

export const usuariosData: Usuario[] =
[
  {
    id: UUIDV4(),
    role: RolesEnum.SYSTEM_ADMIN,
    username: "sysadmin01",
    password: "securePass01",
    ResidentInfo: {
      id: "res-001",
      fullname: "Carlos Méndez",
      email: "carlos.mendez@example.com",
      phone: "5523456789",
      address: "Av. Reforma 123, CDMX",
      comunidades: ["fcdc9a85-88b7-4109-84b3-a75107392d87"]
    }
  },
  {
    id: UUIDV4(),
    role: RolesEnum.ADMIN_COMPANY,
    username: "admincom02",
    password: "securePass02",
    ResidentInfo: {
      id: "res-002",
      fullname: "Lucía Torres",
      email: "lucia.torres@example.com",
      phone: "5534567890",
      address: "Calle 5 de Mayo 45, QRO",
      comunidades: ["ff7bc6fb-0f13-4e37-beb4-7d428520c227", "c4a28c40-a2c7-4190-961c-f3f52ad19c1d"]
    }
  },
  {
    id: UUIDV4(),
    role: RolesEnum.COMITEE_MEMBER,
    username: "comite03",
    password: "securePass03",
    ResidentInfo: {
      id: "res-003",
      fullname: "Jorge Ramírez",
      email: "jorge.ramirez@example.com",
      phone: "5545678901",
      address: "Privada San Miguel 8, QRO",
      comunidades: ["aa2f0511-bedd-413c-8681-34f3eee11ac9"]
    }
  },
  {
    id: UUIDV4(),
    role: RolesEnum.RESIDENT,
    username: "residente04",
    password: "securePass04",
    ResidentInfo: {
      id: "res-004",
      fullname: "Ana López",
      email: "ana.lopez@example.com",
      phone: "5556789012",
      address: "Calle Gardenia 10, El Marqués",
      comunidades: ["9f3cfa42-d4cd-41b3-95d4-e8f6ffdb204c"]
    }
  },
  {
    id: UUIDV4(),
    role: RolesEnum.VIGILANCE,
    username: "vigilante05",
    password: "securePass05",
    ResidentInfo: {
      id: "res-005",
      fullname: "Miguel Herrera",
      email: "miguel.herrera@example.com",
      phone: "5567890123",
      address: "Av. del Sol 200, QRO",
      comunidades: ["fcdc9a85-88b7-4109-84b3-a75107392d87", "ff7bc6fb-0f13-4e37-beb4-7d428520c227"]
    }
  },
  {
    id: UUIDV4(),
    role: RolesEnum.RESIDENT,
    username: "residente06",
    password: "securePass06",
    ResidentInfo: {
      id: "res-006",
      fullname: "Paola Sánchez",
      email: "paola.sanchez@example.com",
      phone: "5578901234",
      address: "Calle Palma Real 45, QRO",
      comunidades: ["c4a28c40-a2c7-4190-961c-f3f52ad19c1d"]
    }
  },
  {
    id: UUIDV4(),
    role: RolesEnum.COMITEE_MEMBER,
    username: "comite07",
    password: "securePass07",
    ResidentInfo: {
      id: "res-007",
      fullname: "Roberto Díaz",
      email: "roberto.diaz@example.com",
      phone: "5589012345",
      address: "Av. Universidad 300, CDMX",
      comunidades: ["aa2f0511-bedd-413c-8681-34f3eee11ac9", "9f3cfa42-d4cd-41b3-95d4-e8f6ffdb204c"]
    }
  },
  {
    id: UUIDV4(),
    role: RolesEnum.ADMIN_COMPANY,
    username: "admincom08",
    password: "securePass08",
    ResidentInfo: {
      id: "res-008",
      fullname: "Verónica Ruiz",
      email: "veronica.ruiz@example.com",
      phone: "5590123456",
      address: "Calle del Bosque 77, QRO",
      comunidades: ["fcdc9a85-88b7-4109-84b3-a75107392d87"]
    }
  },
  {
    id: UUIDV4(),
    role: RolesEnum.VIGILANCE,
    username: "vigilante09",
    password: "securePass09",
    ResidentInfo: {
      id: "res-009",
      fullname: "Eduardo Gómez",
      email: "eduardo.gomez@example.com",
      phone: "5512345678",
      address: "Calle Cedros 12, QRO",
      comunidades: ["ff7bc6fb-0f13-4e37-beb4-7d428520c227", "c4a28c40-a2c7-4190-961c-f3f52ad19c1d"]
    }
  },
  {
    id: UUIDV4(),
    role: RolesEnum.SYSTEM_ADMIN,
    username: "sysadmin10",
    password: "securePass10",
    ResidentInfo: {
      id: "res-010",
      fullname: "María Fernanda",
      email: "maria.fernanda@example.com",
      phone: "5523456780",
      address: "Av. Central 100, CDMX",
      comunidades: ["aa2f0511-bedd-413c-8681-34f3eee11ac9"]
    }
  }
]
