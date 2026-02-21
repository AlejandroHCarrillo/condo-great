# condo-great
Aplicación de administración de condominios.

## Documentación

- [Formato estándar de errores de la API](documentacion/API_ERROR_FORMAT.md): estructura de respuestas de error (`code`, `message`, `errors`, `traceId`) y códigos HTTP.

### Producción (backend)

- **Jwt:Key**: Obligatorio; no usar la clave por defecto.
- **Cors:Origins**: Configurar con los orígenes del frontend (ej. `https://app.ejemplo.com`).
- **Database:RecreateOnStartup**: Debe estar en `false`. En producción la aplicación no arranca si está en `true` para evitar pérdida de datos.
