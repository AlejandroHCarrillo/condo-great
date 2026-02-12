import { v4 as UUIDV4 } from 'uuid';
import { Preferencia, PreferenciaUsuario } from '../interfaces/preferencia.interface';

// IDs fijos para las preferencias (para que sean consistentes)
const PREF_PODAS_ID = '11111111-1111-1111-1111-111111111111';
const PREF_PAQUETERIA_ID = '22222222-2222-2222-2222-222222222222';
const PREF_CANALES_COMUNICACION_ID = '33333333-3333-3333-3333-333333333333';
const PREF_TIPOS_ALERTAS_ID = '44444444-4444-4444-4444-444444444444';
const PREF_NUMERO_OCUPANTES_ID = '55555555-5555-5555-5555-555555555555';
const PREF_RECIBO_FISCAL_ID = '66666666-6666-6666-6666-666666666666';
const PREF_DATOS_FISCALES_ID = '77777777-7777-7777-7777-777777777777';
const PREF_TENGO_MASCOTAS_ID = '88888888-8888-8888-8888-888888888888';
const PREF_NOTIFICACIONES_ID = '99999999-9999-9999-9999-999999999999';

export const preferenciasData: Preferencia[] = [
  {
    id: PREF_PODAS_ID,
    descripcion: "Instrucciones para las podas",
  }, 
  {
    id: PREF_PAQUETERIA_ID,
    descripcion: "Recepcion de paqueteria",
  }, 
  {
    id: PREF_CANALES_COMUNICACION_ID,
    descripcion: "Canales de comunicacion",
    opciones: ['email', 'sms', 'whatsapp' ]
  }, 
  {
    id: PREF_TIPOS_ALERTAS_ID,
    descripcion: "Tipos de alertas",
    opciones: ['mantenimiento', 'seguridad', 'eventos', 'pagos']
  }, 
  {
    id: PREF_NUMERO_OCUPANTES_ID,
    descripcion: "Numero de ocupantes de casa",
  }, 
  {
    id: PREF_RECIBO_FISCAL_ID,
    descripcion: "Deseo recibo fiscal",
    opciones: ['Si', 'No']
  }, 
  {
    id: PREF_DATOS_FISCALES_ID,
    descripcion: "Datos fiscales",
  }, 
  {
    id: PREF_TENGO_MASCOTAS_ID,
    descripcion: "Tengo mascotas",
    opciones: ['Si', 'No']
  }, 
  {
    id: PREF_NOTIFICACIONES_ID,
    descripcion: "Deseo recibir notificaciones",
  }, 
];

// ID del residente elgrandeahc (usando el mismo ID del usuario)
const ELGRANDEAHC_RESIDENT_ID = 'AAAAAAAA-AAAA-AAAA-AAAA-AAAAAAAAAAAA';

export const preferenciasUsuariosData: PreferenciaUsuario[] = [
  // Preferencias para el usuario elgrandeahc - todas las preferencias
  {
    idResidente: ELGRANDEAHC_RESIDENT_ID,
    idPreferencia: PREF_PODAS_ID,
    valores: ['Podar cada 2 semanas', 'Mantener altura de 1.5m']
  },
  {
    idResidente: ELGRANDEAHC_RESIDENT_ID,
    idPreferencia: PREF_PAQUETERIA_ID,
    valores: ['Recibir en portería', 'Notificar por email']
  },
  {
    idResidente: ELGRANDEAHC_RESIDENT_ID,
    idPreferencia: PREF_CANALES_COMUNICACION_ID,
    valores: ['email', 'whatsapp']
  },
  {
    idResidente: ELGRANDEAHC_RESIDENT_ID,
    idPreferencia: PREF_TIPOS_ALERTAS_ID,
    valores: ['mantenimiento', 'seguridad', 'eventos']
  },
  {
    idResidente: ELGRANDEAHC_RESIDENT_ID,
    idPreferencia: PREF_NUMERO_OCUPANTES_ID,
    valores: ['4 personas']
  },
  {
    idResidente: ELGRANDEAHC_RESIDENT_ID,
    idPreferencia: PREF_RECIBO_FISCAL_ID,
    valores: ['Si']
  },
  {
    idResidente: ELGRANDEAHC_RESIDENT_ID,
    idPreferencia: PREF_DATOS_FISCALES_ID,
    valores: ['RFC: AHEL123456ABC', 'Razón Social: Alejandro Hernandez']
  },
  {
    idResidente: ELGRANDEAHC_RESIDENT_ID,
    idPreferencia: PREF_TENGO_MASCOTAS_ID,
    valores: ['Si']
  },
  {
    idResidente: ELGRANDEAHC_RESIDENT_ID,
    idPreferencia: PREF_NOTIFICACIONES_ID,
    valores: ['Sí, recibir todas las notificaciones']
  }
]