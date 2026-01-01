# Solución de Problemas - Login Endpoint

## 🔍 Problema Reportado

El endpoint de login no funciona con:
- URL: `http://localhost/5080/api/auth/login` ❌
- Payload: `{ "username": "elgrandeahc", "password": "ABC123" }` ❌

## ✅ Soluciones

### 1. URL Correcta

**❌ Incorrecto:**
```
http://localhost/5080/api/auth/login
```

**✅ Correcto:**
```
http://localhost:5080/api/auth/login
```

**Nota:** Falta el `:` después de `localhost`. El puerto debe ir después de dos puntos.

### 2. Credenciales Correctas

Según el seeder de la base de datos, las credenciales correctas son:

**✅ Credenciales Correctas:**
```json
{
  "username": "elgrandeahc",
  "password": "ahc123"
}
```

**❌ Incorrecto:**
- Password: `ABC123` (mayúsculas)
- Password: `ahc123` (minúsculas) ✅

### 3. Request Completo Correcto

**Método:** `POST`  
**URL:** `http://localhost:5080/api/auth/login`  
**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "username": "elgrandeahc",
  "password": "ahc123"
}
```

### 4. Respuesta Esperada

Si las credenciales son correctas, deberías recibir:

**Status:** `200 OK`

**Response Body:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "username": "elgrandeahc",
  "email": "admin@greatsoft.com",
  "role": "Admin",
  "expiresAt": "2024-12-20T12:00:00Z"
}
```

### 5. Errores Comunes

#### Error 401 Unauthorized
**Causa:** Credenciales incorrectas
**Solución:** Verificar username y password (case-sensitive)

**Response:**
```json
{
  "message": "Invalid username or password"
}
```

#### Error 404 Not Found
**Causa:** URL incorrecta o backend no está corriendo
**Solución:** 
- Verificar que el backend esté corriendo en el puerto 5080
- Verificar la URL: debe ser `http://localhost:5080/api/auth/login`

#### Error CORS
**Causa:** El frontend está intentando hacer la petición desde un origen no permitido

**Solución:** 
1. Verificar que el backend esté en modo Development
2. Verificar que CORS esté configurado correctamente en `Program.cs`
3. Reiniciar el backend después de cambios en CORS
4. Verificar que el origen del frontend esté permitido

**Orígenes permitidos en desarrollo:**
- `http://localhost:4200` (Angular por defecto)
- `https://localhost:4200`
- `http://localhost:3000`
- `http://127.0.0.1:4200`
- `http://127.0.0.1:3000`
- Cualquier puerto en `localhost` o `127.0.0.1`

**Nota:** En desarrollo, el backend permite cualquier origen de localhost. Si persiste el error:
1. Verifica que el backend esté corriendo
2. Reinicia el backend
3. Verifica que estés usando `http://localhost:5080` (no `https://`)
4. Limpia la caché del navegador

#### Error 500 Internal Server Error
**Causa:** Error en el servidor
**Solución:** Revisar los logs del backend

## 🧪 Pruebas con cURL

### Prueba 1: Login Correcto
```bash
curl -X POST http://localhost:5080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"elgrandeahc","password":"ahc123"}'
```

### Prueba 2: Login con Credenciales Incorrectas
```bash
curl -X POST http://localhost:5080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"elgrandeahc","password":"ABC123"}'
```

## 📋 Credenciales Disponibles para Testing

| Username | Password | Role |
|----------|----------|------|
| `elgrandeahc` | `ahc123` | Admin |
| `sysadmin` | `sysadmin123` | SysAdmin |
| `juan.perez` | `admin123` | Admin |
| `ana.martinez` | `admin123` | Admin |
| `carlos.rodriguez` | `manager123` | Manager |
| `laura.sanchez` | `manager123` | Manager |
| `maria.gonzalez` | `resident123` | Resident |
| `jose.martinez` | `resident123` | Resident |

## 🔧 Verificaciones Adicionales

### 1. Verificar que el Backend esté Corriendo

Abre en el navegador:
```
http://localhost:5080/swagger
```

Deberías ver la documentación de Swagger. Si no aparece, el backend no está corriendo.

### 2. Verificar la Base de Datos

El seeder se ejecuta automáticamente al iniciar la aplicación. Si los usuarios no existen:

1. Verificar `appsettings.json`:
```json
{
  "DatabaseSettings": {
    "RecreateDatabaseOnStartup": false
  }
}
```

2. Si necesitas recrear la base de datos, cambiar a `true` temporalmente.

### 3. Verificar el Endpoint en Swagger

1. Abre `http://localhost:5080/swagger`
2. Busca el endpoint `POST /api/auth/login`
3. Haz clic en "Try it out"
4. Ingresa las credenciales:
   - username: `elgrandeahc`
   - password: `ahc123`
5. Haz clic en "Execute"

## 🐛 Debugging

### Ver Logs del Backend

Los logs del backend mostrarán:
- Intentos de login
- Errores de autenticación
- Errores de validación

### Verificar en el Código

El método de login está en:
- `AIGreatBackend/GreatSoft.Be.Application/Services/AuthService.cs`
- Método: `LoginAsync`

Verifica que:
1. El usuario existe en la base de datos
2. La contraseña está hasheada correctamente
3. El usuario está activo (`IsActive = true`)

## ✅ Checklist de Verificación

- [ ] Backend está corriendo en `http://localhost:5080`
- [ ] URL correcta: `http://localhost:5080/api/auth/login` (con `:`)
- [ ] Username correcto: `elgrandeahc`
- [ ] Password correcto: `ahc123` (minúsculas)
- [ ] Content-Type header: `application/json`
- [ ] Método HTTP: `POST`
- [ ] Base de datos tiene datos (seeder ejecutado)
- [ ] CORS configurado correctamente

## 📞 Si el Problema Persiste

1. Verificar que el backend esté corriendo
2. Revisar los logs del backend
3. Verificar que la base de datos tenga datos
4. Probar con Swagger UI
5. Verificar la configuración de CORS

---

**Última actualización:** 2024-12-19

