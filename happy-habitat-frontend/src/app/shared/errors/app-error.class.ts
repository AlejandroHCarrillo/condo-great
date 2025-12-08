import { AppError, ErrorType, ErrorSeverity } from '../interfaces/error.interface';

/**
 * Clase base para errores de la aplicación
 */
export class AppErrorClass extends Error implements AppError {
  type: ErrorType;
  severity: ErrorSeverity;
  userMessage?: string;
  code?: string | number;
  originalError?: any;
  context?: string;
  timestamp: Date;
  stack?: string;
  metadata?: { [key: string]: any };

  constructor(
    message: string,
    type: ErrorType = ErrorType.UNKNOWN,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    options?: {
      userMessage?: string;
      code?: string | number;
      originalError?: any;
      context?: string;
      metadata?: { [key: string]: any };
    }
  ) {
    super(message);
    this.name = 'AppError';
    this.type = type;
    this.severity = severity;
    this.userMessage = options?.userMessage;
    this.code = options?.code;
    this.originalError = options?.originalError;
    this.context = options?.context;
    this.timestamp = new Date();
    this.metadata = options?.metadata;

    // Mantener el stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppErrorClass);
    }
  }

  /**
   * Convierte el error a un objeto AppError
   */
  toAppError(): AppError {
    return {
      type: this.type,
      severity: this.severity,
      message: this.message,
      userMessage: this.userMessage,
      code: this.code,
      originalError: this.originalError,
      context: this.context,
      timestamp: this.timestamp,
      stack: this.stack,
      metadata: this.metadata
    };
  }
}

/**
 * Error de validación
 */
export class ValidationError extends AppErrorClass {
  constructor(
    message: string,
    validationErrors?: { [key: string]: string[] },
    options?: {
      userMessage?: string;
      context?: string;
    }
  ) {
    super(
      message,
      ErrorType.VALIDATION,
      ErrorSeverity.LOW,
      {
        userMessage: options?.userMessage || 'Los datos proporcionados no son válidos.',
        context: options?.context,
        metadata: validationErrors ? { validationErrors } : undefined
      }
    );
    this.name = 'ValidationError';
  }
}

/**
 * Error de negocio
 */
export class BusinessError extends AppErrorClass {
  constructor(
    message: string,
    code?: string,
    options?: {
      userMessage?: string;
      context?: string;
      metadata?: { [key: string]: any };
    }
  ) {
    super(
      message,
      ErrorType.BUSINESS,
      ErrorSeverity.MEDIUM,
      {
        userMessage: options?.userMessage || message,
        code,
        context: options?.context,
        metadata: options?.metadata
      }
    );
    this.name = 'BusinessError';
  }
}

/**
 * Error de red
 */
export class NetworkError extends AppErrorClass {
  constructor(
    message: string = 'Error de conexión',
    options?: {
      userMessage?: string;
      context?: string;
      originalError?: any;
    }
  ) {
    super(
      message,
      ErrorType.NETWORK,
      ErrorSeverity.HIGH,
      {
        userMessage: options?.userMessage || 'Error de conexión. Verifica tu conexión a internet.',
        context: options?.context,
        originalError: options?.originalError
      }
    );
    this.name = 'NetworkError';
  }
}

/**
 * Error de autorización
 */
export class UnauthorizedError extends AppErrorClass {
  constructor(
    message: string = 'No autorizado',
    options?: {
      userMessage?: string;
      context?: string;
    }
  ) {
    super(
      message,
      ErrorType.UNAUTHORIZED,
      ErrorSeverity.HIGH,
      {
        userMessage: options?.userMessage || 'No estás autenticado. Por favor, inicia sesión.',
        context: options?.context
      }
    );
    this.name = 'UnauthorizedError';
  }
}

/**
 * Error de permisos
 */
export class ForbiddenError extends AppErrorClass {
  constructor(
    message: string = 'Acceso denegado',
    options?: {
      userMessage?: string;
      context?: string;
    }
  ) {
    super(
      message,
      ErrorType.FORBIDDEN,
      ErrorSeverity.HIGH,
      {
        userMessage: options?.userMessage || 'No tienes permisos para realizar esta acción.',
        context: options?.context
      }
    );
    this.name = 'ForbiddenError';
  }
}

/**
 * Error de recurso no encontrado
 */
export class NotFoundError extends AppErrorClass {
  constructor(
    message: string = 'Recurso no encontrado',
    resource?: string,
    options?: {
      userMessage?: string;
      context?: string;
    }
  ) {
    super(
      message,
      ErrorType.NOT_FOUND,
      ErrorSeverity.MEDIUM,
      {
        userMessage: options?.userMessage || `El recurso ${resource || 'solicitado'} no fue encontrado.`,
        context: options?.context,
        metadata: resource ? { resource } : undefined
      }
    );
    this.name = 'NotFoundError';
  }
}

