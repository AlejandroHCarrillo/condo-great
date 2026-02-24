# Formato estándar de errores de la API Happy Habitat

La API utiliza un formato unificado para las respuestas de error devueltas por el middleware global de excepciones y, cuando aplique, en respuestas manuales (BadRequest, Conflict, etc.).

## Estructura de la respuesta de error

Todas las respuestas de error siguen el siguiente formato JSON (camelCase):

```json
{
  "code": "string",
  "message": "string",
  "errors": null | { "campo": ["mensaje1", "mensaje2"] },
  "traceId": "string | null"
}
```

| Campo     | Tipo   | Descripción |
|----------|--------|-------------|
| `code`   | string | Código de error para lógica del cliente (ej. `VALIDATION_ERROR`, `NOT_FOUND`, `UNAUTHORIZED`, `INTERNAL_ERROR`). |
| `message`| string | Mensaje legible para el usuario o para mostrar en la UI. |
| `errors` | object \| null | Opcional. Errores de validación por campo; clave = nombre del campo, valor = array de mensajes. |
| `traceId`| string \| null | Identificador de la petición para correlación en logs (útil en soporte). |

## Códigos HTTP y códigos de error

| HTTP | code (ejemplo) | Uso |
|------|----------------|-----|
| 400  | `BAD_REQUEST`, `INVALID_OPERATION`, `VALIDATION_ERROR` | Datos inválidos o operación no permitida. |
| 401  | `UNAUTHORIZED` | No autenticado (token faltante o inválido). |
| 403  | (futuro)      | Autenticado pero sin permiso para el recurso. |
| 404  | `NOT_FOUND`    | Recurso no encontrado. |
| 409  | (futuro)      | Conflicto (ej. duplicado). |
| 500  | `INTERNAL_ERROR`, `DATABASE_ERROR` | Error interno del servidor; en producción el mensaje es genérico. |

## Uso en el frontend

- Mostrar al usuario preferentemente `message`; usar `code` para decidir flujos (ej. redirigir a login si `UNAUTHORIZED`).
- Si existe `errors`, mostrar errores por campo en formularios (ej. debajo de cada input).
- En desarrollo, `traceId` puede enviarse a soporte o incluirse en logs.

## Validación (400)

Las respuestas 400 por validación de modelos (DataAnnotations) pueden seguir el formato anterior con `code: "VALIDATION_ERROR"` y `errors` con los campos fallidos. El middleware de excepciones devuelve este formato para excepciones no capturadas; los controladores pueden devolver el mismo formato en `BadRequest`/`Conflict` cuando sea aplicable.
