import { ErrorHandlingOptions } from '../shared/interfaces/error.interface';

/**
 * Interfaz extendida para opciones de manejo de errores con contexto
 * Incluye toda la información necesaria para manejar errores de forma consistente
 */
export interface ErrorHandlerOptions extends ErrorHandlingOptions {
  /**
   * Contexto donde ocurrió el error (nombre del componente, servicio, etc.)
   * Se usa para identificar el origen del error en los logs
   */
  context: string;
  
  /**
   * Mensaje personalizado para mostrar al usuario
   * Si no se proporciona, se usará el mensaje por defecto según el tipo de error
   */
  userMessage?: string;
  
  /**
   * Metadata adicional para el error
   * Útil para agregar información contextual adicional
   */
  metadata?: { [key: string]: any };
}

/**
 * Tipo para opciones parciales de manejo de errores
 * Permite pasar solo las propiedades necesarias
 */
export type PartialErrorHandlerOptions = Partial<ErrorHandlerOptions> & {
  context?: string; // Contexto opcional pero recomendado
};

