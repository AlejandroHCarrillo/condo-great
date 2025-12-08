import { HttpResponse, HttpErrorResponse } from '@angular/common/http';

/**
 * Interfaz para representar una respuesta HTTP con toda la información necesaria
 * para logging y procesamiento
 */
export interface HttpResponseInfo {
  body: any;
  status?: number;
  statusText?: string;
  url?: string;
  headers?: any;
}

/**
 * Interfaz para representar cualquier tipo de respuesta HTTP que puede recibir
 * la función normalizeHttpResponse. Incluye todas las propiedades posibles
 * de HttpResponse, HttpErrorResponse y respuestas genéricas.
 */
export interface HttpResponseInput {
  body?: any;
  error?: any;
  status?: number;
  statusText?: string;
  url?: string | null;
  headers?: {
    keys: () => string[];
    get: (key: string) => string | null;
  } | null;
}

/**
 * Type guard para verificar si una respuesta es HttpResponse
 */
export function isHttpResponse(response: any): response is HttpResponse<any> {
  return response instanceof HttpResponse;
}

/**
 * Type guard para verificar si una respuesta es HttpErrorResponse
 */
export function isHttpErrorResponse(response: any): response is HttpErrorResponse {
  return response instanceof HttpErrorResponse;
}

/**
 * Normaliza diferentes tipos de respuestas HTTP a HttpResponseInfo
 * @param response - Respuesta HTTP que puede ser HttpResponse, HttpErrorResponse o cualquier objeto con propiedades HTTP
 * @returns HttpResponseInfo normalizado con toda la información disponible
 */
export function normalizeHttpResponse(response: HttpResponseInput | HttpResponse<any> | HttpErrorResponse | any): HttpResponseInfo {
  // Si es HttpResponse de Angular
  if (isHttpResponse(response)) {
    const httpResponse = response as HttpResponse<any>;
    return {
      body: httpResponse.body,
      status: httpResponse.status,
      statusText: httpResponse.statusText,
      url: httpResponse.url || undefined,
      headers: httpResponse.headers ? Object.fromEntries(
        httpResponse.headers.keys().map(key => [key, httpResponse.headers.get(key)])
      ) : undefined
    };
  }

  // Si es HttpErrorResponse de Angular
  if (isHttpErrorResponse(response)) {
    const errorResponse = response as HttpErrorResponse;
    // HttpErrorResponse tiene 'error' que contiene el cuerpo del error, no 'body'
    return {
      body: errorResponse.error || null,
      status: errorResponse.status,
      statusText: errorResponse.statusText,
      url: errorResponse.url || undefined,
      headers: errorResponse.headers ? Object.fromEntries(
        errorResponse.headers.keys().map(key => [key, errorResponse.headers.get(key)])
      ) : undefined
    };
  }

  // Si es un objeto con estructura HTTP (HttpResponseInput)
  if (response && typeof response === 'object') {
    const httpInput = response as HttpResponseInput;
    return {
      body: httpInput.error || httpInput.body || response,
      status: httpInput.status,
      statusText: httpInput.statusText,
      url: httpInput.url || undefined,
      headers: httpInput.headers ? Object.fromEntries(
        httpInput.headers.keys().map(key => [key, httpInput.headers!.get(key)])
      ) : undefined
    };
  }

  // Si no es una respuesta HTTP estándar, tratar como body directo
  return {
    body: response,
    status: undefined,
    statusText: undefined,
    url: undefined,
    headers: undefined
  };
}

