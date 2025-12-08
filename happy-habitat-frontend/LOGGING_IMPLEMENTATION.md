# Sistema de Logging - Happy Habitat

## 📋 Descripción

Sistema de logging moderno y adaptable implementado para toda la aplicación. Proporciona logging estructurado, niveles configurables, contexto, y soporte para envío remoto de logs.

## ✅ Características Implementadas

### 1. **Servicio de Logging Centralizado** (`LoggerService`)

- ✅ Niveles de log: DEBUG, INFO, WARN, ERROR
- ✅ Contexto/etiquetas para identificar el origen
- ✅ Formateo estructurado con timestamps
- ✅ Stack traces para errores
- ✅ Sanitización de datos (evita referencias circulares)
- ✅ Buffer de logs para envío en batch
- ✅ Flush automático configurable
- ✅ Envío remoto opcional a servidor
- ✅ Signals reactivos para tracking de errores críticos

### 2. **Interceptor HTTP** (`loggingInterceptor`)

- ✅ Logging automático de todas las peticiones HTTP
- ✅ Método, URL, status code, duración
- ✅ Detección de peticiones lentas (>5s)
- ✅ Sanitización de headers sensibles (Authorization, Cookie, etc.)
- ✅ Logging de errores HTTP con detalles completos

### 3. **Decoradores para Logging Automático**

- ✅ `@LogMethod()` - Logging automático de métodos
- ✅ `@LogError()` - Captura automática de errores
- ✅ `@MeasurePerformance()` - Medición de performance

### 4. **Utilidades de Logging**

- ✅ `GlobalErrorHandler` - Captura errores no manejados globalmente
- ✅ `PerformanceMonitor` - Clase para medir performance
- ✅ Helpers para manejo de errores
- ✅ Funciones para medir performance async/sync

### 5. **Configuración en Environment**

- ✅ Configuración por ambiente (desarrollo/producción)
- ✅ Niveles de log configurables
- ✅ Habilitar/deshabilitar consola y logging remoto
- ✅ Control de stack traces

## 🚀 Uso

### Uso Básico del LoggerService

```typescript
import { inject } from '@angular/core';
import { LoggerService } from './services/logger.service';

export class MyComponent {
  private logger = inject(LoggerService);

  myMethod() {
    // Log de información
    this.logger.info('Operación iniciada', 'MyComponent');
    
    // Log de debug
    this.logger.debug('Detalles de la operación', 'MyComponent', { data: 'value' });
    
    // Log de advertencia
    this.logger.warn('Algo inusual ocurrió', 'MyComponent', { reason: 'xyz' });
    
    // Log de error
    try {
      // código que puede fallar
    } catch (error) {
      this.logger.error('Error en operación', error, 'MyComponent', { context: 'data' });
    }
  }
}
```

### Logging de Eventos de Usuario

```typescript
this.logger.event('button_clicked', {
  buttonName: 'submit',
  page: 'login'
}, 'LoginComponent');
```

### Logging de Performance

```typescript
// Opción 1: Usar el método directo
this.logger.performance('data_load', duration, 'DataService', { recordCount: 100 });

// Opción 2: Usar PerformanceMonitor
const monitor = new PerformanceMonitor('data_processing', this.logger, 'DataService');
// ... código ...
monitor.end({ recordsProcessed: 50 });

// Opción 3: Usar helper function
const result = await measurePerformanceAsync(
  'fetchData',
  this.logger,
  () => this.http.get('/api/data').toPromise(),
  'DataService'
);
```

### Usar Decoradores

```typescript
import { LogMethod, LogError, MeasurePerformance } from '../utils/log.decorator';

export class MyService {
  @LogMethod('MyService')
  myMethod(param: string) {
    // Este método será loggeado automáticamente
    return this.doSomething(param);
  }

  @LogError('MyService')
  riskyMethod() {
    // Solo se loggearán los errores
    return this.doSomethingRisky();
  }

  @MeasurePerformance('MyService')
  expensiveOperation() {
    // Se medirá el tiempo de ejecución
    return this.doExpensiveWork();
  }
}
```

### Configurar el Logger

```typescript
import { LogLevel } from './shared/interfaces/log.interface';
import { LoggerService } from './services/logger.service';

export class AppComponent {
  private logger = inject(LoggerService);

  constructor() {
    // Configurar logging en runtime
    this.logger.configure({
      level: LogLevel.INFO,
      enableConsole: true,
      enableRemote: true,
      enableStackTraces: true
    });
  }
}
```

### Integración con Servicios HTTP

El interceptor HTTP está configurado automáticamente. Todas las peticiones HTTP se loggean automáticamente:

```typescript
// Esto se loggea automáticamente:
this.http.get('/api/users').subscribe(...);
// Log: "HTTP GET /api/users - 200 (150ms)"
```

### Manejo Global de Errores

El `GlobalErrorHandler` captura automáticamente todos los errores no manejados:

```typescript
// Cualquier error no capturado será loggeado automáticamente
throw new Error('Unhandled error');
// Se loggea automáticamente con contexto completo
```

## 📊 Niveles de Log

- **DEBUG (0)**: Información detallada para debugging (solo desarrollo)
- **INFO (1)**: Información general sobre el funcionamiento de la app
- **WARN (2)**: Advertencias sobre situaciones inusuales
- **ERROR (3)**: Errores que requieren atención
- **NONE (4)**: Deshabilitar todos los logs

## ⚙️ Configuración

### Environment Development

```typescript
// src/environments/environment.ts
logging: {
  level: LogLevel.DEBUG,        // Todos los logs
  enableConsole: true,           // Mostrar en consola
  enableRemote: false,          // No enviar al servidor
  enableStackTraces: true       // Incluir stack traces
}
```

### Environment Production

```typescript
// src/environments/environment.prod.ts
logging: {
  level: LogLevel.WARN,          // Solo warnings y errores
  enableConsole: false,          // No mostrar en consola
  enableRemote: true,            // Enviar al servidor
  enableStackTraces: true       // Incluir stack traces
}
```

## 🔧 Configuración Avanzada

### Envío Remoto de Logs

El servicio puede enviar logs al servidor en batches:

```typescript
// Configurar en el servicio
this.logger.configure({
  enableRemote: true,
  remoteUrl: 'https://api.example.com/logs',
  batchSize: 10,              // Enviar cada 10 logs
  flushInterval: 30000        // O cada 30 segundos
});
```

### Endpoint Esperado del Backend

```
POST /api/logs
Content-Type: application/json

{
  "logs": [
    {
      "timestamp": "2025-01-15T10:30:00.000Z",
      "level": 3,
      "message": "Error message",
      "context": "ComponentName",
      "data": { ... },
      "stack": "...",
      "userId": "user-123",
      "url": "https://app.com/page",
      "userAgent": "..."
    }
  ]
}
```

## 📝 Mejores Prácticas

1. **Usa contexto descriptivo**: Siempre proporciona un contexto claro
   ```typescript
   this.logger.info('User logged in', 'AuthService'); // ✅ Bueno
   this.logger.info('User logged in'); // ❌ Sin contexto
   ```

2. **No loggees información sensible**: El logger sanitiza automáticamente, pero evita loggear:
   - Contraseñas
   - Tokens completos
   - Información personal sensible

3. **Usa el nivel apropiado**:
   - DEBUG: Solo para desarrollo
   - INFO: Eventos importantes del negocio
   - WARN: Situaciones que requieren atención
   - ERROR: Solo para errores reales

4. **Incluye datos relevantes**:
   ```typescript
   this.logger.error('Failed to save', error, 'DataService', {
     recordId: record.id,
     operation: 'save'
   });
   ```

5. **Usa decoradores para métodos críticos**:
   ```typescript
   @LogMethod('PaymentService')
   processPayment(amount: number) {
     // Logging automático
   }
   ```

## 🔍 Monitoreo de Errores Críticos

El servicio mantiene un signal con los últimos errores críticos:

```typescript
export class ErrorMonitorComponent {
  private logger = inject(LoggerService);
  
  errors = this.logger.criticalErrors;
  
  // Los errores se actualizan automáticamente
}
```

## 🎯 Integración con Servicios de Monitoreo

Para integrar con servicios como Sentry, LogRocket, etc., puedes extender el `GlobalErrorHandler`:

```typescript
@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private logger = inject(LoggerService);

  handleError(error: Error | any): void {
    this.logger.exception(error, 'GlobalErrorHandler');
    
    // Integración con Sentry
    // Sentry.captureException(error);
    
    // Integración con LogRocket
    // LogRocket.captureException(error);
  }
}
```

## 📈 Métricas y Performance

El sistema incluye logging de performance automático:

```typescript
// Peticiones HTTP lentas se loggean automáticamente
// Si una petición tarda >5s, se genera un WARN

// También puedes medir manualmente:
const monitor = new PerformanceMonitor('operation', this.logger);
// ... código ...
monitor.end(); // Loggea la duración
```

## 🛠️ Troubleshooting

### Los logs no aparecen en consola

1. Verifica el nivel de log en `environment.ts`
2. Asegúrate de que `enableConsole: true`
3. Revisa que el nivel del log sea >= al nivel configurado

### Los logs no se envían al servidor

1. Verifica `enableRemote: true`
2. Verifica que `remoteUrl` esté configurado
3. Revisa la consola del navegador para errores de red
4. Verifica que el endpoint del backend esté disponible

### Demasiados logs

1. Aumenta el nivel de log (de DEBUG a INFO o WARN)
2. Reduce la frecuencia de logs en operaciones repetitivas
3. Usa contexto para filtrar logs específicos

## 📚 Archivos Creados

- `src/app/services/logger.service.ts` - Servicio principal
- `src/app/interceptors/logging.interceptor.ts` - Interceptor HTTP
- `src/app/utils/log.decorator.ts` - Decoradores
- `src/app/utils/error-handler.util.ts` - Error handler global
- `src/app/utils/performance.util.ts` - Utilidades de performance
- `src/app/shared/interfaces/log.interface.ts` - Interfaces

## 🔄 Próximos Pasos Sugeridos

1. Integrar con servicio de monitoreo (Sentry, LogRocket)
2. Agregar dashboard de logs en tiempo real
3. Implementar filtros de logs por contexto
4. Agregar métricas de uso de la aplicación
5. Implementar alertas automáticas para errores críticos

