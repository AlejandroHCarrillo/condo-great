import { v4 as UUIDV4 } from 'uuid';
import { Preferencia, PreferenciaUsuario } from '../interfaces/preferencia.interface';

export const preferenciasData: Preferencia[] = [
  {
    id: UUIDV4(),
    descripcion: "Instrucciones para las podas",
  }, 
  {
    id: UUIDV4(),
    descripcion: "Recepcion de paqueteria",
  }, 
  {
    id: UUIDV4(),
    descripcion: "Canales de comunicacion",
    opciones: ['email', 'sms', 'whatsapp' ]
  }, 
  {
    id: UUIDV4(),
    descripcion: "Tipos de alertas",
    opciones: ['mantenimiento', 'seguridad', 'eventos', 'pagos']
  }, 
  {
    id: UUIDV4(),
    descripcion: "Numero de ocupantes de casa",
  }, 
  {
    id: UUIDV4(),
    descripcion: "Deseo recibo fiscal",
    opciones: ['mantenimiento', 'seguridad', 'eventos', 'pagos']

  }, 
  {
    id: UUIDV4(),
    descripcion: "Datos fiscales",
  }, 
  {
    id: UUIDV4(),
    descripcion: "Tengo mascotas",
    opciones: ['Si', 'No']
  }, 
  {
    id: UUIDV4(),
    descripcion: "Deseo recibir notificaciones",
  }, 
];

export const preferenciasUsuariosData: PreferenciaUsuario[] = [
  {
    idResidente: '',     // Identificador residente 
    idPreferencia: '',   // Identificador único 
    valores: ['','']     // Texto principal del post
  }
]