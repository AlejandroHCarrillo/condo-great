# Sistema de Manejo de Errores Centralizado - Happy Habitat

## 📋 Descripción

Sistema completo y centralizado para el manejo de errores en toda la aplicación. Proporciona normalización de errores, notificaciones al usuario, logging automático, y manejo inteligente según el tipo de error.

## ✅ Características Implementadas

### 1. **Servicio Centralizado de Errores** (`ErrorService`)

- ✅ Normalización de diferentes tipos de errores a `AppError`
- ✅ Manejo inteligente de errores HTTP (400, 401, 403, 404, 422, 429, 500, etc.)
- ✅ Mensajes amigables para el usuario según el tipo de error
- ✅ Tracking de errores activos con signals
- ✅ Integración automática con el sistema de logging
- ✅ Opciones configurables de manejo (notificaciones, redirección, etc.)

### 2. **Servicio de Notificaciones** (`NotificationService`)

- ✅ Notificaciones toast para diferentes tipos (success, error, warning, info)
- ✅ Auto-descarte configurable por duración
- ✅ Notificaciones persistentes (para errores críticos)
- ✅ Signals reactivos para estado de notificaciones
- ✅ Sistema de acciones en notificaciones

### 3. **Interceptor HTTP de Errores** (`errorInterceptor`)

- ✅ Captura automática de todos los errores HTTP
- ✅ Manejo inteligente según el código de estado
- ✅ Redirección automática para errores 401
- ✅ Notificaciones automáticas según la severidad
- ✅ Integración con el sistema de autenticación

### 4. **Global Error Handler Mejorado**

- ✅ Captura errores no manejados globalmente
- ✅ Integración con ErrorService
- ✅ Logging automático de excepciones
- ✅ Preparado para integración con servicios de monitoreo

### 5. **Clases de Errores Personalizadas**

- ✅ `AppErrorClass` - Clase base
- ✅ `ValidationError` - Errores de validación
- ✅ `BusinessError` - Errores de negocio
- ✅ `NetworkError` - Errores de red
- ✅ `UnauthorizedError` - Errores de autenticación
- ✅ `ForbiddenError` - Errores de permisos
- ✅ `NotFoundError` - Recurso no encontrado

### 6. **Componentes UI**

- ✅ `NotificationComponent` - Componente individual de notificación
- ✅ `NotificationContainerComponent` - Contenedor global de notificaciones
- ✅ Animaciones y estilos con DaisyUI/TailwindCSS
- ✅ Posicionamiento fijo en la esquina superior derecha

## 🚀 Uso

### Uso Básico del ErrorService

```typescript
import { inject } from '@angular/core';
import { ErrorService } from './services/error.service';

export class MyComponent {
  private errorService = inject(ErrorService);

  handleError() {
    try {
      // código que puede fallar
    } catch (error) {
      this.errorService.handleError(error, {
        showNotification: true,
        logError: true,
        context: 'MyComponent'
      });
    }
  }
}
```

### Manejo de Errores HTTP

Los errores HTTP se manejan automáticamente por el interceptor. Sin embargo, puedes manejarlos manualmente:

```typescript
this.http.get('/api/data').subscribe({
  next: (data) => {
    // éxito
  },
  error: (error) => {
    // El interceptor ya maneja el error, pero puedes agregar lógica adicional
    const appError = this.errorService.normalizeError(error, 'MyComponent');
    
    if (appError.type === ErrorType.VALIDATION) {
      // Manejar errores de validación específicamente
    }
  }
});
```

### Uso del NotificationService

```typescript
import { inject } from '@angular/core';
import { NotificationService } from './services/notification.service';

export class MyComponent {
  private notificationService = inject(NotificationService);

  showSuccess() {
    this.notificationService.showSuccess(
      'Operación completada exitosamente',
      'Éxito'
    );
  }

  showError() {
    this.notificationService.showError(
      'Ha ocurrido un error',
      'Error',
      0 // 0 = permanente, no se auto-descarta
    );
  }

  showWarning() {
    this.notificationService.showWarning(
      'Esta acción puede tener consecuencias',
      'Advertencia'
    );
  }

  showInfo() {
    this.notificationService.showInfo(
      'Información importante',
      'Información'
    );
  }
}
```

### Usar Clases de Errores Personalizadas

```typescript
import { ValidationError, BusinessError } from './shared/errors/app-error.class';
import { ErrorService } from './services/error.service';

export class MyService {
  private errorService = inject(ErrorService);

  validateData(data: any) {
    if (!data.email) {
      throw new ValidationError(
        'Email is required',
        { email: ['Email es requerido'] },
        { userMessage: 'Por favor, proporciona un email válido.' }
      );
    }
  }

  processPayment(amount: number) {
    if (amount <= 0) {
      throw new BusinessError(
        'Invalid amount',
        'INVALID_AMOUNT',
        { userMessage: 'El monto debe ser mayor a cero.' }
      );
    }
  }
}
```

### Usar Helpers

```typescript
import { ErrorHelpers } from './utils/error-helpers';
import { ErrorService, NotificationService } from './services';

export class MyComponent {
  private errorService = inject(ErrorService);
  private notificationService = inject(NotificationService);

  handleError(error: any) {
    // Manejo simple de error
    ErrorHelpers.handleError(
      this.errorService,
      error,
      'Ha ocurrido un error al procesar tu solicitud'
    );

    // O mostrar notificación directamente
    ErrorHelpers.showError(
      this.notificationService,
      'Error al guardar los datos',
      'Error'
    );
  }
}
```

## 📊 Tipos de Errores

### ErrorType Enum

- `HTTP` - Errores HTTP genéricos
- `VALIDATION` - Errores de validación (400, 422)
- `BUSINESS` - Errores de lógica de negocio
- `NETWORK` - Errores de conexión
- `UNAUTHORIZED` - No autenticado (401)
- `FORBIDDEN` - Sin permisos (403)
- `NOT_FOUND` - Recurso no encontrado (404)
- `SERVER` - Errores del servidor (500+)
- `UNKNOWN` - Errores desconocidos

### ErrorSeverity Enum

- `LOW` - Baja severidad (validaciones, advertencias)
- `MEDIUM` - Severidad media (errores recuperables)
- `HIGH` - Alta severidad (requiere atención)
- `CRITICAL` - Severidad crítica (sistema afectado)

## ⚙️ Configuración del Manejo de Errores

### Opciones de ErrorHandlingOptions

```typescript
interface ErrorHandlingOptions {
  showNotification?: boolean;    // Mostrar notificación al usuario
  logError?: boolean;            // Loggear el error
  redirectTo?: string;           // Redirigir a una ruta
  retryable?: boolean;           // Si el error es recuperable
  retryCount?: number;          // Número de reintentos
  customHandler?: (error: AppError) => void; // Handler personalizado
}
```

### Ejemplo de Configuración Personalizada

```typescript
this.errorService.handleError(error, {
  showNotification: true,
  logError: true,
  redirectTo: '/error-page',
  customHandler: (appError) => {
    if (appError.severity === ErrorSeverity.CRITICAL) {
      // Enviar a servicio de monitoreo
      this.sendToMonitoring(appError);
    }
  }
});
```

## 🔄 Flujo de Manejo de Errores

1. **Error Ocurre** → Capturado por interceptor, handler global, o manualmente
2. **Normalización** → Convertido a `AppError` con tipo y severidad
3. **Logging** → Registrado en el sistema de logging
4. **Notificación** → Mostrado al usuario (si está configurado)
5. **Tracking** → Agregado a errores activos
6. **Acción** → Redirección, handler personalizado, etc.

## 📝 Mapeo de Errores HTTP

| Código | Tipo | Severidad | Notificación | Acción |
|--------|------|-----------|--------------|--------|
| 400 | VALIDATION | LOW | ✅ Sí | - |
| 401 | UNAUTHORIZED | HIGH | ✅ Sí | Logout + Redirect |
| 403 | FORBIDDEN | HIGH | ✅ Sí | - |
| 404 | NOT_FOUND | MEDIUM | ❌ No | - |
| 422 | VALIDATION | LOW | ✅ Sí | - |
| 429 | HTTP | MEDIUM | ✅ Sí | - |
| 500+ | SERVER | HIGH | ✅ Sí | - |

## 🎨 Componentes UI

### NotificationContainer

El contenedor de notificaciones está integrado en `app.component.html` y se muestra automáticamente en la esquina superior derecha.

### Personalización de Notificaciones

```typescript
// Notificación con acción
this.notificationService.show('error', 'Error al guardar', 'Error', 0, {
  label: 'Reintentar',
  handler: () => this.retry()
});
```

## 🔍 Tracking de Errores

```typescript
export class ErrorMonitorComponent {
  private errorService = inject(ErrorService);

  // Obtener errores activos
  errors = this.errorService.activeErrors;

  // Verificar si hay errores
  hasErrors = this.errorService.hasActiveErrors();

  // Obtener último error
  lastError = this.errorService.getLastError();

  // Descartar un error
  dismissError(errorId: string) {
    this.errorService.dismissError(errorId);
  }
}
```

## 🛠️ Mejores Prácticas

1. **Deja que el interceptor maneje errores HTTP comunes**
   ```typescript
   // ✅ Bueno - El interceptor maneja automáticamente
   this.http.get('/api/data').subscribe(...);

   // ❌ Evitar - Solo si necesitas lógica específica
   this.http.get('/api/data').subscribe({
     error: (err) => {
       // Lógica específica aquí
     }
   });
   ```

2. **Usa clases de errores personalizadas para errores de negocio**
   ```typescript
   // ✅ Bueno
   throw new BusinessError('Invalid operation', 'INVALID_OP');

   // ❌ Evitar
   throw new Error('Invalid operation');
   ```

3. **Proporciona mensajes amigables al usuario**
   ```typescript
   // ✅ Bueno
   this.errorService.handleError(error, {
     userMessage: 'No se pudo guardar. Por favor, verifica los datos.'
   });

   // ❌ Evitar
   this.errorService.handleError(error); // Mensaje genérico
   ```

4. **Usa el contexto para debugging**
   ```typescript
   this.errorService.handleError(error, {
     context: 'PaymentService.processPayment'
   });
   ```

## 📚 Archivos Creados

- `src/app/services/error.service.ts` - Servicio principal
- `src/app/services/notification.service.ts` - Servicio de notificaciones
- `src/app/interceptors/error.interceptor.ts` - Interceptor HTTP
- `src/app/shared/interfaces/error.interface.ts` - Interfaces
- `src/app/shared/errors/app-error.class.ts` - Clases de errores
- `src/app/shared/components/notification/` - Componentes de notificación
- `src/app/utils/error-helpers.ts` - Helpers

## 🔄 Integración con Servicios de Monitoreo

Para integrar con Sentry, LogRocket, etc.:

```typescript
// En GlobalErrorHandler o ErrorService
handleError(error: any, options: ErrorHandlingOptions = {}): AppError {
  const appError = this.normalizeError(error);
  
  // Integración con Sentry
  if (appError.severity === ErrorSeverity.CRITICAL) {
    // Sentry.captureException(error, {
    //   tags: { type: appError.type, severity: appError.severity },
    //   extra: appError.metadata
    // });
  }
  
  // ... resto del código
}
```

## 🎯 Próximos Pasos Sugeridos

1. Integrar con servicio de monitoreo (Sentry, LogRocket)
2. Agregar página de error personalizada
3. Implementar retry automático para errores recuperables
4. Agregar métricas de errores
5. Dashboard de errores para administradores

