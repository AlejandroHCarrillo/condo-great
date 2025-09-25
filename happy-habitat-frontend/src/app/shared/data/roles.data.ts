import { RolesEnum } from './../../enums/roles.enum';
export const rolesData: {value:RolesEnum, text:string }[] = 
[
  { 
    value: RolesEnum.SYSTEM_ADMIN, 
    text: "Administrador del sistema" 
  },
  { 
    value: RolesEnum.ADMIN_COMPANY, 
    text: "Administrador de comunidades" 
  },
  { 
    value: RolesEnum.VIGILANCE, 
    text: "Vigilante" 
  },
  { 
    value: RolesEnum.RESIDENT, 
    text: "Residente" 
  },
  { 
    value: RolesEnum.COMITEE_MEMBER, 
    text: "Residente miembro de la mesa directiva" 
  },
];

