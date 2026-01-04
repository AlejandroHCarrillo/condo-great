# Análisis de Endpoints del Backend - Conexión con Frontend

## 📋 Resumen Ejecutivo

Este documento analiza todos los endpoints disponibles en el backend **AIGreatBackend** y cómo pueden ser conectados al frontend **happy-habitat-frontend**.

**Base URL del Backend:** `http://localhost:5080/api`

---

## 🔐 1. AUTENTICACIÓN (`/api/auth`)

### Endpoints Disponibles:

| Método | Endpoint | Descripción | Estado Frontend | Prioridad |
|--------|----------|-------------|-----------------|-----------|
| `POST` | `/api/auth/login` | Iniciar sesión | ✅ **CONECTADO** | 🔴 Alta |
| `POST` | `/api/auth/register` | Registrar nuevo usuario | ✅ **CONECTADO** | 🔴 Alta |
| `POST` | `/api/auth/forgot-password` | Solicitar reset de contraseña | ✅ **CONECTADO** | 🟡 Media |
| `POST` | `/api/auth/reset-password` | Resetear contraseña | ✅ **CONECTADO** | 🟡 Media |
| `POST` | `/api/auth/refresh` | Refrescar token JWT | ❌ **NO EXISTE** | 🟡 Media |

### Componentes Frontend Relacionados:
- `auth/login/login.component.ts` ✅
- `auth/register/register.component.ts` ✅
- `auth/forgot-password/forgot-password.component.ts` ✅
- `auth/reset-password/reset-password.component.ts` ✅
- `services/auth.service.ts` ✅ (usa `/refresh` pero no existe en backend)

### ⚠️ Acción Requerida:
- **Implementar endpoint `/api/auth/refresh`** en el backend para renovar tokens JWT

---

## 👥 2. USUARIOS (`/api/users`)

### Endpoints Disponibles:

| Método | Endpoint | Descripción | Autenticación | Roles Requeridos | Estado Frontend | Prioridad |
|--------|----------|-------------|---------------|------------------|-----------------|-----------|
| `GET` | `/api/users` | Obtener todos los usuarios | ✅ Requerida | - | ⚠️ **PENDIENTE** | 🔴 Alta |
| `GET` | `/api/users/{id}` | Obtener usuario por ID | ✅ Requerida | - | ⚠️ **PENDIENTE** | 🟡 Media |
| `POST` | `/api/users` | Crear nuevo usuario | ✅ Requerida | `SysAdmin` | ⚠️ **PENDIENTE** | 🔴 Alta |
| `PUT` | `/api/users/{id}` | Actualizar usuario | ✅ Requerida | - | ⚠️ **PENDIENTE** | 🟡 Media |
| `DELETE` | `/api/users/{id}` | Eliminar usuario | ✅ Requerida | - | ⚠️ **PENDIENTE** | 🟡 Media |

### Componentes Frontend Relacionados:
- `components/users/user-list.component.ts` ⚠️ (usa datos mock)
- `components/users/user.component.ts` ⚠️

### 📝 Notas:
- El frontend tiene componentes de lista y edición de usuarios pero usan datos mock
- Necesita servicio Angular para conectar con estos endpoints

---

## 🎭 3. ROLES (`/api/roles`)

### Endpoints Disponibles:

| Método | Endpoint | Descripción | Autenticación | Estado Frontend | Prioridad |
|--------|----------|-------------|---------------|-----------------|-----------|
| `GET` | `/api/roles` | Obtener todos los roles | ✅ Requerida | ⚠️ **PENDIENTE** | 🟡 Media |
| `GET` | `/api/roles/{id}` | Obtener rol por ID | ✅ Requerida | ⚠️ **PENDIENTE** | 🟢 Baja |
| `POST` | `/api/roles` | Crear nuevo rol | ✅ Requerida | ⚠️ **PENDIENTE** | 🟡 Media |
| `PUT` | `/api/roles/{id}` | Actualizar rol | ✅ Requerida | ⚠️ **PENDIENTE** | 🟡 Media |
| `DELETE` | `/api/roles/{id}` | Eliminar rol | ✅ Requerida | ⚠️ **PENDIENTE** | 🟡 Media |

### Componentes Frontend Relacionados:
- `guards/role.guard.ts` ✅ (usa roles pero no consume API)
- `enums/roles.enum.ts` ✅

### 📝 Notas:
- Los roles se usan en guards pero no hay componente de gestión de roles
- Útil para administración del sistema

---

## 🏘️ 4. COMUNIDADES (`/api/communities`)

### Endpoints Disponibles:

| Método | Endpoint | Descripción | Autenticación | Estado Frontend | Prioridad |
|--------|----------|-------------|---------------|-----------------|-----------|
| `GET` | `/api/communities` | Obtener todas las comunidades | ✅ Requerida | ⚠️ **PENDIENTE** | 🔴 Alta |
| `GET` | `/api/communities/{id}` | Obtener comunidad por ID | ✅ Requerida | ⚠️ **PENDIENTE** | 🟡 Media |
| `POST` | `/api/communities` | Crear nueva comunidad | ✅ Requerida | ⚠️ **PENDIENTE** | 🔴 Alta |
| `PUT` | `/api/communities/{id}` | Actualizar comunidad | ✅ Requerida | ⚠️ **PENDIENTE** | 🟡 Media |
| `DELETE` | `/api/communities/{id}` | Eliminar comunidad | ✅ Requerida | ⚠️ **PENDIENTE** | 🟡 Media |

### Componentes Frontend Relacionados:
- `components/system-administation/comunidades/comunidades-list.component.ts` ⚠️ (usa datos mock)
- `components/system-administation/comunidades/comunidad.component.ts` ⚠️
- `interfaces/comunidad.interface.ts` ✅
- `shared/data/comunidades.data.ts` ⚠️ (datos mock)

### 📝 Notas:
- El frontend tiene componentes de gestión de comunidades pero usan datos mock
- **ALTA PRIORIDAD** - Es funcionalidad core del sistema

---

## 🏢 5. EMPRESAS (`/api/companies`)

### Endpoints Disponibles:

| Método | Endpoint | Descripción | Autenticación | Roles Requeridos | Estado Frontend | Prioridad |
|--------|----------|-------------|---------------|------------------|-----------------|-----------|
| `GET` | `/api/companies` | Obtener todas las empresas | ✅ Requerida | - | ⚠️ **PENDIENTE** | 🟡 Media |
| `GET` | `/api/companies/{id}` | Obtener empresa por ID | ✅ Requerida | - | ⚠️ **PENDIENTE** | 🟡 Media |
| `POST` | `/api/companies` | Crear nueva empresa | ✅ Requerida | `SysAdmin` | ⚠️ **PENDIENTE** | 🟡 Media |
| `PUT` | `/api/companies/{id}` | Actualizar empresa | ✅ Requerida | - | ⚠️ **PENDIENTE** | 🟡 Media |
| `DELETE` | `/api/companies/{id}` | Eliminar empresa | ✅ Requerida | - | ⚠️ **PENDIENTE** | 🟡 Media |

### Componentes Frontend Relacionados:
- No hay componentes específicos en el frontend

### 📝 Notas:
- No hay UI para gestión de empresas en el frontend
- Podría ser útil para administración de empresas que gestionan comunidades

---

## 🚗 6. VEHÍCULOS (`/api/vehicles`)

### Endpoints Disponibles:

| Método | Endpoint | Descripción | Autenticación | Estado Frontend | Prioridad |
|--------|----------|-------------|---------------|-----------------|-----------|
| `GET` | `/api/vehicles` | Obtener todos los vehículos | ✅ Requerida | ⚠️ **PENDIENTE** | 🟡 Media |
| `GET` | `/api/vehicles/{id}` | Obtener vehículo por ID | ✅ Requerida | ⚠️ **PENDIENTE** | 🟢 Baja |
| `GET` | `/api/vehicles/resident/{residentId}` | Obtener vehículos por residente | ✅ Requerida | ⚠️ **PENDIENTE** | 🔴 Alta |
| `POST` | `/api/vehicles` | Crear nuevo vehículo | ✅ Requerida | ⚠️ **PENDIENTE** | 🔴 Alta |
| `PUT` | `/api/vehicles/{id}` | Actualizar vehículo | ✅ Requerida | ⚠️ **PENDIENTE** | 🟡 Media |
| `DELETE` | `/api/vehicles/{id}` | Eliminar vehículo | ✅ Requerida | ⚠️ **PENDIENTE** | 🟡 Media |

### Componentes Frontend Relacionados:
- `components/registro/registro-auto/registrar-auto.component.ts` ⚠️ (solo console.log, no envía a API)

### 📝 Notas:
- El componente de registro de auto existe pero no está conectado al backend
- **ALTA PRIORIDAD** - Funcionalidad de registro de vehículos

---

## 🐾 7. MASCOTAS (`/api/pets`)

### Endpoints Disponibles:

| Método | Endpoint | Descripción | Autenticación | Estado Frontend | Prioridad |
|--------|----------|-------------|---------------|-----------------|-----------|
| `GET` | `/api/pets` | Obtener todas las mascotas | ✅ Requerida | ⚠️ **PENDIENTE** | 🟡 Media |
| `GET` | `/api/pets/{id}` | Obtener mascota por ID | ✅ Requerida | ⚠️ **PENDIENTE** | 🟢 Baja |
| `GET` | `/api/pets/resident/{residentId}` | Obtener mascotas por residente | ✅ Requerida | ⚠️ **PENDIENTE** | 🔴 Alta |
| `POST` | `/api/pets` | Crear nueva mascota | ✅ Requerida | ⚠️ **PENDIENTE** | 🔴 Alta |
| `PUT` | `/api/pets/{id}` | Actualizar mascota | ✅ Requerida | ⚠️ **PENDIENTE** | 🟡 Media |
| `DELETE` | `/api/pets/{id}` | Eliminar mascota | ✅ Requerida | ⚠️ **PENDIENTE** | 🟡 Media |

### Componentes Frontend Relacionados:
- `components/registro/registro-mascota/registrar-mascota.component.ts` ⚠️ (solo console.log, no envía a API)

### 📝 Notas:
- El componente de registro de mascota existe pero no está conectado al backend
- **ALTA PRIORIDAD** - Funcionalidad de registro de mascotas

---

## 👋 8. VISITAS DE RESIDENTES (`/api/residentvisits`)

### Endpoints Disponibles:

| Método | Endpoint | Descripción | Autenticación | Estado Frontend | Prioridad |
|--------|----------|-------------|---------------|-----------------|-----------|
| `GET` | `/api/residentvisits` | Obtener todas las visitas | ✅ Requerida | ⚠️ **PENDIENTE** | 🟡 Media |
| `GET` | `/api/residentvisits/{id}` | Obtener visita por ID | ✅ Requerida | ⚠️ **PENDIENTE** | 🟢 Baja |
| `GET` | `/api/residentvisits/resident/{residentId}` | Obtener visitas por residente | ✅ Requerida | ⚠️ **PENDIENTE** | 🔴 Alta |
| `POST` | `/api/residentvisits` | Crear nueva visita | ✅ Requerida | ⚠️ **PENDIENTE** | 🔴 Alta |
| `PUT` | `/api/residentvisits/{id}` | Actualizar visita | ✅ Requerida | ⚠️ **PENDIENTE** | 🟡 Media |
| `DELETE` | `/api/residentvisits/{id}` | Eliminar visita | ✅ Requerida | ⚠️ **PENDIENTE** | 🟡 Media |

### Componentes Frontend Relacionados:
- `components/registro/registro-visitante/registro-visitante.component.ts` ⚠️ (solo console.log, no envía a API)

### 📝 Notas:
- El componente de registro de visitante existe pero no está conectado al backend
- **ALTA PRIORIDAD** - Funcionalidad de registro de visitantes

---

## 🛠️ 9. PROVEEDORES DE RESIDENTES (`/api/residentproviders`)

### Endpoints Disponibles:

| Método | Endpoint | Descripción | Autenticación | Estado Frontend | Prioridad |
|--------|----------|-------------|---------------|-----------------|-----------|
| `GET` | `/api/residentproviders` | Obtener todos los proveedores | ✅ Requerida | ⚠️ **PENDIENTE** | 🔴 Alta |
| `GET` | `/api/residentproviders/{id}` | Obtener proveedor por ID | ✅ Requerida | ⚠️ **PENDIENTE** | 🟡 Media |
| `GET` | `/api/residentproviders/service-type/{serviceTypeId}` | Obtener proveedores por tipo de servicio | ✅ Requerida | ⚠️ **PENDIENTE** | 🔴 Alta |
| `POST` | `/api/residentproviders` | Crear nuevo proveedor | ✅ Requerida | ⚠️ **PENDIENTE** | 🟡 Media |
| `PUT` | `/api/residentproviders/{id}` | Actualizar proveedor | ✅ Requerida | ⚠️ **PENDIENTE** | 🟡 Media |
| `DELETE` | `/api/residentproviders/{id}` | Eliminar proveedor | ✅ Requerida | ⚠️ **PENDIENTE** | 🟡 Media |

### Componentes Frontend Relacionados:
- `components/proveedores-residentes/services/proveedores-residentes.service.ts` ⚠️ (usa API externa de países, necesita cambiar)
- `components/proveedores-residentes/components/proveedores-list/proveedores-list.component.ts` ⚠️
- `components/proveedores-residentes/components/proveedores-servicios.component.ts` ⚠️

### 📝 Notas:
- El servicio actual usa una API externa de países (restcountries.com) como placeholder
- **ALTA PRIORIDAD** - Necesita ser reemplazado por el endpoint del backend
- El endpoint `/service-type/{serviceTypeId}` es muy útil para filtrar proveedores

---

## 📊 Resumen de Estado

### ✅ Endpoints Conectados (4/45):
- ✅ `/api/auth/login`
- ✅ `/api/auth/register`
- ✅ `/api/auth/forgot-password`
- ✅ `/api/auth/reset-password`

### ⚠️ Endpoints Pendientes de Conectar (41/45):
- 🔴 **Alta Prioridad:** 20 endpoints
- 🟡 **Media Prioridad:** 18 endpoints
- 🟢 **Baja Prioridad:** 3 endpoints

### ❌ Endpoints Faltantes en Backend (1):
- ❌ `/api/auth/refresh` (necesario para renovar tokens JWT)

---

## 🎯 Plan de Implementación Recomendado

### Fase 1: Funcionalidades Core (Alta Prioridad)
1. **Autenticación:**
   - ✅ Ya conectado
   - ⚠️ Implementar `/api/auth/refresh` en backend

2. **Comunidades:**
   - Crear servicio Angular `communities.service.ts`
   - Conectar `comunidades-list.component.ts`
   - Conectar `comunidad.component.ts`

3. **Registro de Vehículos:**
   - Crear servicio Angular `vehicles.service.ts`
   - Conectar `registrar-auto.component.ts`

4. **Registro de Mascotas:**
   - Crear servicio Angular `pets.service.ts`
   - Conectar `registrar-mascota.component.ts`

5. **Registro de Visitantes:**
   - Crear servicio Angular `resident-visits.service.ts`
   - Conectar `registro-visitante.component.ts`

6. **Proveedores:**
   - Actualizar `proveedores-residentes.service.ts` para usar backend
   - Conectar componentes de proveedores

### Fase 2: Gestión de Usuarios (Media Prioridad)
7. **Usuarios:**
   - Crear servicio Angular `users.service.ts`
   - Conectar `user-list.component.ts`
   - Conectar `user.component.ts`

### Fase 3: Funcionalidades Adicionales (Baja Prioridad)
8. **Roles, Empresas:**
   - Crear servicios y componentes según necesidad

---

## 🔧 Consideraciones Técnicas

### Autenticación JWT
- Todos los endpoints (excepto auth) requieren token JWT
- El interceptor `auth.interceptor.ts` ya está configurado para agregar el token
- Verificar que el token se envíe correctamente en cada request

### CORS
- ✅ Ya configurado en backend para `http://localhost:4200`

### Manejo de Errores
- El frontend tiene `error.interceptor.ts` configurado
- Verificar que los errores del backend se manejen correctamente

### DTOs y Interfaces
- Verificar que las interfaces TypeScript del frontend coincidan con los DTOs del backend
- Puede ser necesario crear mappers para transformar datos

---

## 📝 Notas Finales

- El backend está bien estructurado con arquitectura en capas
- El frontend tiene la estructura base pero necesita servicios para conectar con el backend
- La mayoría de componentes tienen la UI lista pero usan datos mock
- Priorizar la conexión de funcionalidades core antes de avanzar con funcionalidades secundarias

---

**Última actualización:** 2024-12-19
**Backend:** AIGreatBackend (.NET 8.0)
**Frontend:** happy-habitat-frontend (Angular)

