import { menuItem } from "../interfaces/menu-item.interface";
const adminOptions: menuItem[] = [
  {
    id: 301,
    title: 'Usuarios',
    path: "usuarios",
    icon: "fa-regular fa-circle-user"
  },
  {
    id: 302,
    title: 'Coto',
    path: "colonia",
    icon: ""
  },
    {
    id: 303,
    title: 'Residente',
    path: "colonia",
    icon: ""
  },

]

export const menuOptions: menuItem[] = [
  {
    id: 1,
    title: 'Inicio',
    path: "home",
    icon: `fa-solid fa-house`
  },
  {
    id: 2,
    title: 'Dashboard',
    path: "dashboard",
    icon: "fa-solid fa-gauge"
  },
  {
    id: 2,
    title: 'Registro',
    path: "registro",
    icon: "fa-solid fa-address-book"
  },
  {
    id: 2,
    title: 'Directorio de Servicios',
    path: "proveedores",
    icon: "fa-solid fa-phone-volume"
  },
    {
    id: 2,
    title: 'Social network',
    path: "social",
    icon: "fa-solid fa-users-rays"
  },
  {
    id: 3,
    title: 'Administracion',
    path: "administracion",
    icon: "fa-solid fa-user-tie",
    child: [...adminOptions]
  },
  {
    id: 3,
    title: 'Seguridad',
    path: "Seguridad",
    icon: "fa-solid fa-user-shield"
  },
  {
    id: 3,
    title: 'Finanzas',
    path: "Supervisor",
    icon: "fa-solid fa-file-invoice-dollar"
  },
  {
    id: 3,
    title: 'Pagos',
    path: "Supervisor",
    icon: "fa-solid fa-money-bill-1-wave"
  },
  {
    id: 3,
    title: 'Transparencia',
    path: "Supervisor",
    icon: "fa-solid fa-eye"
  },
  {
    id: 3,
    title: 'Morosos',
    path: "Supervisor",
    icon: "fa-solid fa-person-burst"
  },
  {
    id: 2,
    title: 'Amenidades',
    path: "Amenidades",
    icon: "fa-solid fa-people-roof"
  },

    {
    id: 2,
    title: 'Mis tickets',
    path: "mistickets",
    icon: "fa-solid fa-ticket"
  },
    {
    id: 2,
    title: 'Documentos',
    path: "documents",
    icon: "fa-solid fa-file-lines"
  },
    {
    id: 2,
    title: 'Encuestas',
    path: "encuestas",
    icon: "fa-solid fa-chart-simple"
  },
    {
    id: 2,
    title: 'Avisos',
    path: "avisos",
    icon: "fa-solid fa-bullhorn"
  },
    {
    id: 2,
    title: 'Configuracion',
    path: "configuracion",
    icon: "fa-solid fa-gears"
  },
];

// <i class="fa-solid fa-motorcycle"></i>
// fa-solid fa-chart-line
// <i class="fa-solid fa-truck-moving"></i>
//  <i class="fa-solid fa-users-viewfinder"></i>
// <i class="fa-solid fa-sim-card"></i>
// <i class="fa-solid fa-gauge"></i>
// <i class="fa-solid fa-magnifying-glass"></i>