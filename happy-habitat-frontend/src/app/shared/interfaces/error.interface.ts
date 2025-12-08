export enum ErrorType {
  HTTP = 'HTTP',
  VALIDATION = 'VALIDATION',
  BUSINESS = 'BUSINESS',
  NETWORK = 'NETWORK',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  SERVER = 'SERVER',
  UNKNOWN = 'UNKNOWN'
}

export enum ErrorSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export interface AppError {
  type: ErrorType;
  severity: ErrorSeverity;
  message: string;
  userMessage?: string; // Mensaje amigable para el usuario
  code?: string | number;
  originalError?: any;
  context?: string;
  timestamp?: Date;
  stack?: string;
  metadata?: { [key: string]: any };
}

export interface ErrorNotification {
  id: string;
  error: AppError;
  timestamp: Date;
  dismissed: boolean;
}

export interface ErrorHandlingOptions {
  showNotification?: boolean;
  logError?: boolean;
  redirectTo?: string;
  retryable?: boolean;
  retryCount?: number;
  customHandler?: (error: AppError) => void;
  context?: string; // Contexto para identificar el origen del error
}

