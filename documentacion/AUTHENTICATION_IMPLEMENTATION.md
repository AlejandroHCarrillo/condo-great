# Implementación de Autenticación - Frontend con Backend

## 📋 Resumen

Este documento describe la implementación de la conexión del frontend **happy-habitat-frontend** con los endpoints de autenticación del backend **AIGreatBackend**.

**Fecha de implementación:** 2024-12-19  
**Backend:** AIGreatBackend (.NET 8.0)  
**Frontend:** happy-habitat-frontend (Angular)

---

## ✅ Cambios Realizados

### 1. Actualización de Interfaces (`auth.interface.ts`)

Se actualizaron las interfaces para que coincidan con los DTOs del backend:

#### LoginRequest
- ✅ Ya coincidía: `username`, `password` (camelCase se mapea automáticamente a PascalCase)

#### RegisterRequest
- ✅ Actualizado para incluir:
  - `firstName: string`
  - `lastName: string`
  - `username: string`
  - `email: string`
  - `password: string`
  - `roleId: string` (GUID del rol)

#### LoginResponse (Nueva)
- ✅ Interfaz que coincide con el DTO del backend:
  - `token: string`
  - `username: string`
  - `email: string`
  - `role: string`
  - `expiresAt: string` (ISO date string)

#### UserDto (Nueva)
- ✅ Interfaz que coincide con el DTO del backend:
  - `id: string`
  - `firstName: string`
  - `lastName: string`
  - `username: string`
  - `email: string`
  - `isActive: boolean`
  - `createdAt: string`
  - `roleId: string`
  - `roleName: string`
  - `companies?: Array<{companyId, companyName}>`

#### ForgotPasswordRequest (Nueva)
- ✅ Interfaz que coincide con el DTO del backend:
  - `email: string` (el backend solo acepta email, no username)

#### ResetPasswordRequest (Nueva)
- ✅ Interfaz que coincide con el DTO del backend:
  - `email: string`
  - `newPassword: string`
  - `token: string` (token recibido por email)

---

### 2. Creación de Mapper (`auth.mapper.ts`)

Se creó un mapper para transformar las respuestas del backend al formato esperado por el frontend:

#### Funciones Principales:

1. **`mapRoleToEnum(roleName: string): RolesEnum`**
   - Mapea los nombres de roles del backend a los enums del frontend
   - Mapeo:
     - `SysAdmin` → `SYSTEM_ADMIN`
     - `Admin` → `ADMIN_COMPANY`
     - `Manager` → `ADMIN_COMPANY`
     - `Resident` → `RESIDENT`
     - `ResidentPower` → `COMITEE_MEMBER`
     - `Vigilance` → `VIGILANCE`
     - `Supervision` → `ADMIN_COMPANY`

2. **`mapLoginResponseToAuthResponse(loginResponse: LoginResponse): AuthResponse`**
   - Transforma `LoginResponse` del backend a `AuthResponse` del frontend
   - Calcula `expiresIn` desde `expiresAt`
   - Crea un `UserInfo` básico (se completará cuando se obtenga el usuario completo)

3. **`mapUserDtoToUserInfo(userDto: UserDto): UserInfo`**
   - Transforma `UserDto` del backend a `UserInfo` del frontend
   - Combina `firstName` y `lastName` en `fullname`
   - Mapea el rol usando `mapRoleToEnum`

4. **`updateAuthResponseWithUser(authResponse: AuthResponse, userDto: UserDto): AuthResponse`**
   - Actualiza un `AuthResponse` con información completa del usuario

---

### 3. Actualización del Servicio de Autenticación (`auth.service.ts`)

#### Login
- ✅ Conectado al endpoint `/api/auth/login`
- ✅ Transforma `LoginResponse` a `AuthResponse` usando el mapper
- ✅ Maneja errores correctamente

#### Register
- ✅ Conectado al endpoint `/api/auth/register`
- ✅ Envía `RegisterRequest` con `firstName`, `lastName`, `username`, `email`, `password`, `roleId`
- ✅ Después del registro, hace login automáticamente

#### Forgot Password
- ✅ Conectado al endpoint `/api/auth/forgot-password`
- ✅ Acepta `usernameOrEmail` pero lo convierte a `email` para el backend
- ✅ Si no contiene `@`, agrega `@email.com` (temporal, debería mejorarse)

#### Reset Password
- ✅ Conectado al endpoint `/api/auth/reset-password`
- ✅ Cambió la firma de `resetPassword(currentPassword, newPassword)` a `resetPassword(email, newPassword, token)`
- ✅ Usa el token recibido por email en lugar de la contraseña actual

#### Refresh Token
- ⚠️ **PENDIENTE**: El endpoint `/api/auth/refresh` no existe en el backend
- El frontend ya tiene el código preparado, solo falta implementar el endpoint en el backend

---

### 4. Actualización de Componentes

#### RegisterComponent
- ✅ Actualizado el formulario para incluir `firstName` y `lastName` en lugar de `fullname`
- ✅ Agregado campo `roleId` (por defecto usa un placeholder)
- ⚠️ **NOTA**: El `roleId` debería obtenerse dinámicamente del backend llamando a `/api/roles`

#### ResetPasswordComponent
- ✅ Actualizado el formulario para incluir `email` y `token` en lugar de `currentPassword`
- ✅ Cambiado el flujo para usar el token de reset recibido por email

---

## 🔧 Configuración

### Environment
El archivo `environment.ts` ya está configurado:
```typescript
apiUrl: 'http://localhost:5080/api'
useMockAuth: false // Ya está desactivado para usar el backend real
```

### CORS
El backend ya está configurado para aceptar requests desde `http://localhost:4200`

---

## 📝 Notas Importantes

### 1. Mapeo de Roles
Los roles del backend usan nombres diferentes a los del frontend. El mapper se encarga de la conversión, pero es importante mantener la consistencia.

### 2. RoleId en Registro
Actualmente el componente de registro usa un GUID placeholder para `roleId`. **Se recomienda:**
- Crear un servicio para obtener los roles disponibles desde `/api/roles`
- Permitir al usuario seleccionar el rol (o asignar uno por defecto como "Resident")

### 3. Información Completa del Usuario
El `LoginResponse` del backend solo incluye información básica (username, email, role). Si se necesita información completa del usuario:
- Hacer una llamada adicional a `/api/users/{id}` después del login
- O modificar el backend para que devuelva más información en el `LoginResponse`

### 4. Refresh Token
El endpoint `/api/auth/refresh` no está implementado en el backend. El frontend está preparado para usarlo cuando esté disponible.

### 5. Forgot Password - Email vs Username
El backend solo acepta `email` en `ForgotPasswordRequest`, pero el frontend acepta `usernameOrEmail`. Actualmente se hace una conversión simple, pero debería mejorarse para:
- Validar si es un email válido
- Si es username, buscar el email del usuario primero

---

## 🧪 Pruebas

### Endpoints Disponibles para Probar:

1. **Login:**
   - Usuario: `elgrandeahc`
   - Password: `ahc123`
   - O cualquier usuario creado en el seed

2. **Register:**
   - Requiere `firstName`, `lastName`, `username`, `email`, `password`, `roleId`
   - El `roleId` debe ser un GUID válido de un rol existente

3. **Forgot Password:**
   - Envía el email del usuario
   - El backend devuelve éxito siempre (por seguridad)

4. **Reset Password:**
   - Requiere `email`, `newPassword`, `token`
   - El token debe ser el recibido por email (actualmente no implementado completamente)

---

## 🚀 Próximos Pasos

1. **Implementar endpoint `/api/auth/refresh` en el backend**
2. **Crear servicio de roles** para obtener roles disponibles en el registro
3. **Mejorar el flujo de forgot password** para manejar username/email correctamente
4. **Implementar sistema de tokens** para reset password (si no está implementado)
5. **Obtener información completa del usuario** después del login si es necesario

---

## 📚 Referencias

- Backend Controllers: `AIGreatBackend/GreatSoft.Be.API/Controllers/AuthController.cs`
- Backend DTOs: `AIGreatBackend/GreatSoft.Be.Application/DTOs/Auth/`
- Frontend Service: `happy-habitat-frontend/src/app/services/auth.service.ts`
- Frontend Interfaces: `happy-habitat-frontend/src/app/shared/interfaces/auth.interface.ts`
- Frontend Mapper: `happy-habitat-frontend/src/app/shared/mappers/auth.mapper.ts`

---

**Última actualización:** 2024-12-19

