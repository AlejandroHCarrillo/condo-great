import { HttpInterceptorFn, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { tap, catchError, finalize } from 'rxjs';
import { LoggerService } from '../services/logger.service';
import { HttpResponseInfo, normalizeHttpResponse } from '../shared/interfaces/http-response.interface';

export const loggingInterceptor: HttpInterceptorFn = (req, next) => {
  const logger = inject(LoggerService);
  const startTime = Date.now();
  const method = req.method;
  const url = req.url;

  // Log de la petición saliente
  logger.debug(`HTTP ${method} ${url}`, 'HTTP', {
    method,
    url,
    headers: sanitizeHeaders(req.headers)
  });

  return next(req).pipe(
    tap({
      next: (response) => {
        const duration = Date.now() - startTime;
        let status = 200;
        
        if (response instanceof HttpResponse) {
          status = response.status;
        } else if (response instanceof HttpErrorResponse) {
          status = response.status;
        }
        
        logger.info(
          `HTTP ${method} ${url} - ${status} (${duration}ms)`,
          'HTTP',
          {
            method,
            url,
            status,
            duration,
            responseSize: getResponseSize(response)
          }
        );
      },
      error: (error: HttpErrorResponse) => {
        const duration = Date.now() - startTime;
        
        logger.error(
          `HTTP ${method} ${url} - ${error.status} ${error.statusText} (${duration}ms)`,
          error,
          'HTTP',
          {
            method,
            url,
            status: error.status,
            statusText: error.statusText,
            duration,
            errorUrl: error.url
          }
        );
      }
    }),
    catchError((error) => {
      // El error ya fue loggeado en el tap
      throw error;
    }),
    finalize(() => {
      // Log de finalización si es necesario
      const duration = Date.now() - startTime;
      if (duration > 5000) {
        logger.warn(
          `Slow HTTP request: ${method} ${url} took ${duration}ms`,
          'HTTP',
          { method, url, duration }
        );
      }
    })
  );
};

// Helper functions
function sanitizeHeaders(headers: any): any {
  if (!headers) return {};
  
  const sanitized: any = {};
  const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key'];
  
  try {
    if (headers.keys) {
      headers.keys().forEach((key: string) => {
        const lowerKey = key.toLowerCase();
        if (sensitiveHeaders.some(h => lowerKey.includes(h))) {
          sanitized[key] = '[REDACTED]';
        } else {
          sanitized[key] = headers.get(key);
        }
      });
    }
  } catch (e) {
    // Si no se pueden leer los headers, retornar objeto vacío
    return {};
  }
  
  return sanitized;
}

function getResponseSize(response: any): number {
  if (!response) return 0;
  
  try {
    // Normalizar la respuesta a HttpResponseInfo para tener acceso tipado al body
    const responseInfo: HttpResponseInfo = normalizeHttpResponse(response);
    const body = responseInfo.body;
    
    if (body === null || body === undefined) {
      return 0;
    }
    
    if (typeof body === 'string') {
      return body.length;
    }
    
    if (typeof body === 'number' || typeof body === 'boolean') {
      return String(body).length;
    }
    
    // Para objetos y arrays, serializar a JSON
    return JSON.stringify(body).length;
  } catch {
    return 0;
  }
}

