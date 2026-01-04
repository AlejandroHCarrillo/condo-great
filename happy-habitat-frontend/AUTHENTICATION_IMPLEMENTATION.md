# Implementación de Autenticación - Happy Habitat

## ✅ Componentes Implementados

### 1. **Configuración de HttpClient**
- ✅ `HttpClient` configurado en `app.config.ts` con `provideHttpClient()`
- ✅ Interceptor HTTP configurado para agregar tokens automáticamente

### 2. **Archivos de Environment**
- ✅ `src/environments/environment.ts` - Configuración de desarrollo
- ✅ `src/environments/environment.prod.ts` - Configuración de producción
- ✅ `angular.json` actualizado para usar el environment correcto en producción

### 3. **Servicios de Autenticación**

#### `AuthService` (`src/app/services/auth.service.ts`)
- ✅ Método `login()` - Inicia sesión con username y password
- ✅ Método `register()` - Registra nuevos usuarios
- ✅ Método `logout()` - Cierra sesión
- ✅ Método `refreshToken()` - Refresca el token de autenticación
- ✅ Método `checkAuth()` - Verifica si el usuario está autenticado
- ✅ Métodos `hasRole()` y `hasAnyRole()` - Verificación de roles
- ✅ Signals reactivos: `isAuthenticated`, `currentUser`, `isLoading`

#### `SessionService` (`src/app/services/session.service.ts`)
- ✅ Gestión de tokens en localStorage
- ✅ Guardado y recuperación de información de usuario
- ✅ Verificación de expiración de tokens
- ✅ Limpieza de sesión

### 4. **Guards de Ruta**

#### `authGuard` (`src/app/guards/auth.guard.ts`)
- ✅ Protege rutas que requieren autenticación
- ✅ Redirige al login si no está autenticado
- ✅ Preserva la URL de retorno (`returnUrl`)

#### `roleGuard` (`src/app/guards/role.guard.ts`)
- ✅ Protege rutas basadas en roles
- ✅ Verifica que el usuario tenga uno de los roles permitidos
- ✅ Redirige si no tiene permisos

### 5. **Interceptor HTTP**

#### `authInterceptor` (`src/app/interceptors/auth.interceptor.ts`)
- ✅ Agrega automáticamente el token Bearer a todas las peticiones HTTP
- ✅ Maneja errores 401 (Unauthorized)
- ✅ Intenta refrescar el token automáticamente
- ✅ Cierra sesión si el refresh falla

### 6. **Componentes de Autenticación**

#### `LoginComponent`
- ✅ Formulario reactivo con validaciones
- ✅ Manejo de errores
- ✅ Estados de carga
- ✅ Redirección después del login exitoso
- ✅ UI con DaisyUI/TailwindCSS

#### `RegisterComponent`
- ✅ Formulario reactivo completo
- ✅ Validación de contraseñas coincidentes
- ✅ Validación de email
- ✅ Validación de username (blacklist)
- ✅ Manejo de errores
- ✅ Estados de carga

#### `AuthPageComponent`
- ✅ Layout para rutas de autenticación
- ✅ Router outlet para login/register

### 7. **Actualización de Rutas**

- ✅ Rutas públicas: `/auth/login`, `/auth/register`
- ✅ Rutas protegidas con `authGuard`: `/home`, `/dashboard`, `/amenidades`, etc.
- ✅ Rutas protegidas con `roleGuard`: `/sysadmin` (solo SYSTEM_ADMIN y ADMIN_COMPANY)
- ✅ Redirección automática a login si no está autenticado

### 8. **Componente User Info**

- ✅ Muestra información del usuario autenticado
- ✅ Dropdown con opciones (Dashboard, Documentos, Logout)
- ✅ Botón de login si no está autenticado
- ✅ Muestra nombre, unidad habitacional y rol

## 📋 Interfaces Creadas

### `auth.interface.ts`
- `LoginRequest` - Datos para login
- `RegisterRequest` - Datos para registro
- `AuthResponse` - Respuesta del servidor
- `TokenPayload` - Payload del JWT (opcional)

## 🔧 Configuración Necesaria

### 1. Actualizar URLs de API

Edita `src/environments/environment.ts` y `environment.prod.ts` con las URLs reales de tu backend:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api', // Cambiar por tu URL
  // ...
};
```

### 2. Endpoints Esperados del Backend

El servicio de autenticación espera los siguientes endpoints:

- `POST /api/auth/login` - Iniciar sesión
  ```json
  {
    "username": "string",
    "password": "string"
  }
  ```

- `POST /api/auth/register` - Registrar usuario
  ```json
  {
    "username": "string",
    "email": "string",
    "password": "string",
    "fullname": "string",
    "phone": "string (opcional)"
  }
  ```

- `POST /api/auth/refresh` - Refrescar token
  ```json
  {
    "refreshToken": "string"
  }
  ```

### 3. Respuesta Esperada del Backend

Todas las respuestas de autenticación deben seguir este formato:

```typescript
{
  token: string;           // JWT token
  refreshToken?: string;   // Refresh token (opcional)
  user: UserInfo;          // Información del usuario
  expiresIn?: number;      // Tiempo de expiración en segundos
}
```

## 🚀 Uso

### Proteger una Ruta

```typescript
{
  path: 'mi-ruta',
  component: MiComponente,
  canActivate: [authGuard]
}
```

### Proteger una Ruta por Rol

```typescript
{
  path: 'admin',
  component: AdminComponent,
  canActivate: [roleGuard([RolesEnum.SYSTEM_ADMIN, RolesEnum.ADMIN_COMPANY])]
}
```

### Usar el Servicio de Autenticación

```typescript
import { AuthService } from './services/auth.service';

export class MiComponente {
  private authService = inject(AuthService);
  
  // Verificar autenticación
  isAuthenticated = this.authService.isAuthenticated;
  
  // Obtener usuario actual
  currentUser = this.authService.currentUser;
  
  // Verificar rol
  isAdmin = this.authService.hasRole(RolesEnum.SYSTEM_ADMIN);
  
  // Cerrar sesión
  logout() {
    this.authService.logout();
  }
}
```

## 📝 Notas Importantes

1. **Tokens**: Los tokens se almacenan en `localStorage`. Para mayor seguridad, considera usar `sessionStorage` o implementar HttpOnly cookies.

2. **Refresh Token**: El interceptor intenta refrescar el token automáticamente cuando recibe un 401. Asegúrate de que tu backend soporte este flujo.

3. **Seguridad**: Las validaciones del lado del cliente son solo para UX. Siempre valida en el backend.

4. **Testing**: Para probar sin backend, puedes mockear el `AuthService` o usar herramientas como JSON Server.

## 🔄 Próximos Pasos Sugeridos

1. Implementar "Recordar sesión" (remember me)
2. Agregar recuperación de contraseña
3. Implementar verificación de email
4. Agregar autenticación de dos factores (2FA)
5. Implementar rate limiting en el frontend
6. Agregar logging de eventos de autenticación

