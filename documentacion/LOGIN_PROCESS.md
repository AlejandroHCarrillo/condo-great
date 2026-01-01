# Proceso de Login Exitoso - Flujo Completo

Este documento describe el flujo completo del proceso de login exitoso en la aplicación, desde que el usuario envía las credenciales hasta que se guarda la sesión.

## 📋 Resumen del Flujo

```
Usuario → LoginComponent → AuthService → Backend API → AuthService → SessionService → localStorage
```

## 🔄 Flujo Detallado Paso a Paso

### 1. **Usuario envía el formulario** (`login.component.ts`)

**Archivo:** `src/app/auth/login/login.component.ts`

```typescript
onSubmit(): void {
  // Validación del formulario
  if (this.loginForm.invalid) {
    this.loginForm.markAllAsTouched();
    return;
  }

  // Obtener credenciales
  const { username, password } = this.loginForm.value;
  
  // Llamar al servicio de autenticación
  this.authService.login({ username, password }).subscribe({
    next: () => {
      // Redirigir a home o returnUrl
      const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/home';
      this.router.navigate([returnUrl]);
    },
    error: (error) => {
      // Manejar error
      this.errorMessage.set(error?.error?.message || 'Error al iniciar sesión');
    }
  });
}
```

**Datos enviados:**
```typescript
{
  username: "elgrandeahc",
  password: "ahc123"
}
```

---

### 2. **AuthService procesa el login** (`auth.service.ts`)

**Archivo:** `src/app/services/auth.service.ts`

```typescript
login(credentials: LoginRequest): Observable<AuthResponse> {
  this.isLoading.set(true);
  
  // Verificar si está en modo mock
  if (environment.auth?.useMockAuth) {
    return this.mockLogin(credentials);
  }
  
  // LLAMADA REAL AL BACKEND
  return this.http.post<LoginResponse>(`${this.API_URL}/login`, credentials).pipe(
    // Transformar LoginResponse del backend a AuthResponse del frontend
    switchMap((loginResponse) => {
      const authResponse = mapLoginResponseToAuthResponse(loginResponse);
      return of(authResponse);
    }),
    // Procesar respuesta exitosa
    tap((response) => {
      this.handleAuthSuccess(response);
      this.isLoading.set(false);
    }),
    // Manejar errores
    catchError((error) => {
      this.isLoading.set(false);
      return throwError(() => error);
    })
  );
}
```

**Request HTTP:**
```
POST http://localhost:5080/api/auth/login
Content-Type: application/json

{
  "username": "elgrandeahc",
  "password": "ahc123"
}
```

---

### 3. **Backend procesa el login** (`AuthController.cs`)

**Archivo:** `AIGreatBackend/GreatSoft.Be.API/Controllers/AuthController.cs`

```csharp
[HttpPost("login")]
public async Task<ActionResult<LoginResponse>> Login([FromBody] LoginRequest request)
{
    var response = await _authService.LoginAsync(request);
    return Ok(response);
}
```

**Response del Backend:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "username": "elgrandeahc",
  "email": "admin@greatsoft.com",
  "role": "Admin",
  "expiresAt": "2024-01-15T10:30:00Z"
}
```

**Tipo:** `LoginResponse`

---

### 4. **Mapper transforma la respuesta** (`auth.mapper.ts`)

**Archivo:** `src/app/shared/mappers/auth.mapper.ts`

```typescript
export function mapLoginResponseToAuthResponse(loginResponse: LoginResponse): AuthResponse {
  const expiresAt = new Date(loginResponse.expiresAt);
  const now = new Date();
  const expiresIn = Math.floor((expiresAt.getTime() - now.getTime()) / 1000);

  // Crear UserInfo desde LoginResponse
  const user: UserInfo = {
    id: '', // Se completará después si es necesario
    fullname: loginResponse.username, // Temporal
    username: loginResponse.username,
    email: loginResponse.email,
    role: mapRoleToEnum(loginResponse.role) // "Admin" → RolesEnum.ADMIN_COMPANY
  };

  return {
    token: loginResponse.token,
    refreshToken: undefined, // El backend no devuelve refreshToken aún
    user,
    expiresIn
  };
}
```

**Transformación:**
- `LoginResponse` (backend) → `AuthResponse` (frontend)
- `role: "Admin"` → `role: RolesEnum.ADMIN_COMPANY`
- Calcula `expiresIn` en segundos

---

### 5. **AuthService guarda la sesión** (`auth.service.ts`)

**Archivo:** `src/app/services/auth.service.ts`

```typescript
private handleAuthSuccess(response: AuthResponse): void {
  // Guardar en localStorage
  this.sessionService.saveSession(response);
  
  // Actualizar signals reactivos
  this.isAuthenticated.set(true);
  this.currentUser.set(response.user);
}
```

**Datos guardados:**
- Token JWT
- Información del usuario (`UserInfo`)
- Tiempo de expiración

---

### 6. **SessionService guarda en localStorage** (`session.service.ts`)

**Archivo:** `src/app/services/session.service.ts`

```typescript
saveSession(authResponse: AuthResponse): void {
  // Guardar token
  if (authResponse.token) {
    localStorage.setItem('hh_token', authResponse.token);
  }

  // Guardar refresh token si existe
  if (authResponse.refreshToken) {
    localStorage.setItem('hh_refresh_token', authResponse.refreshToken);
  }

  // Guardar información del usuario
  if (authResponse.user) {
    localStorage.setItem('hh_user', JSON.stringify(authResponse.user));
  }

  // Guardar tiempo de expiración
  if (authResponse.expiresIn) {
    const expiryTime = Date.now() + (authResponse.expiresIn * 1000);
    localStorage.setItem('hh_token_expiry', expiryTime.toString());
  }
}
```

**localStorage guardado:**
```javascript
{
  "hh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "hh_user": "{\"id\":\"\",\"fullname\":\"elgrandeahc\",\"username\":\"elgrandeahc\",\"email\":\"admin@greatsoft.com\",\"role\":\"ADMIN_COMPANY\"}",
  "hh_token_expiry": "1705312200000"
}
```

---

### 7. **Redirección al home** (`login.component.ts`)

```typescript
this.router.navigate([returnUrl]); // '/home' o la URL de retorno
```

---

## 📊 Estructura de Datos

### LoginRequest (Frontend → Backend)
```typescript
interface LoginRequest {
  username: string;
  password: string;
}
```

### LoginResponse (Backend → Frontend)
```typescript
interface LoginResponse {
  token: string;
  username: string;
  email: string;
  role: string;
  expiresAt: string; // ISO date string
}
```

### AuthResponse (Interno Frontend)
```typescript
interface AuthResponse {
  token: string;
  refreshToken?: string;
  user: UserInfo;
  expiresIn?: number; // segundos
}
```

### UserInfo (Usuario Logueado)
```typescript
interface UserInfo {
  id?: string;
  fullname: string;
  username: string;
  email: string;
  addres?: string;
  role: RolesEnum;
  unidadhabitacional?: Comunidad;
}
```

---

## 🔐 Verificación de Sesión

### Al iniciar la aplicación (`auth.service.ts`)

```typescript
constructor() {
  // Verificar si hay sesión guardada al inicializar
  this.checkStoredSession();
}

private checkStoredSession(): void {
  if (this.checkAuth()) {
    // Sesión válida encontrada
    return;
  }
}

checkAuth(): boolean {
  const token = this.sessionService.getToken();
  const user = this.sessionService.getUser();
  
  if (token && user && !this.sessionService.isTokenExpired()) {
    this.isAuthenticated.set(true);
    this.currentUser.set(user);
    return true;
  }
  
  this.logout();
  return false;
}
```

---

## 🎯 Puntos Clave

1. **Validación**: El formulario valida username (mínimo 3 caracteres) y password (mínimo 6 caracteres)

2. **Transformación**: El backend devuelve `LoginResponse`, pero el frontend necesita `AuthResponse` con `UserInfo`

3. **Persistencia**: La sesión se guarda en `localStorage` con 4 claves:
   - `hh_token`: Token JWT
   - `hh_refresh_token`: Refresh token (si existe)
   - `hh_user`: Información del usuario (JSON)
   - `hh_token_expiry`: Timestamp de expiración

4. **Signals Reactivos**: 
   - `isAuthenticated`: Indica si el usuario está autenticado
   - `currentUser`: Contiene el `UserInfo` del usuario actual

5. **Mapeo de Roles**: Los roles del backend se mapean a enums del frontend:
   - `"Admin"` → `RolesEnum.ADMIN_COMPANY`
   - `"Resident"` → `RolesEnum.RESIDENT`
   - etc.

---

## 🐛 Debugging

Para ver el proceso completo en la consola del navegador:

1. Abre las DevTools (F12)
2. Ve a la pestaña "Network"
3. Filtra por "login"
4. Revisa:
   - Request: Credenciales enviadas
   - Response: Token y datos del usuario
5. Ve a "Application" → "Local Storage"
6. Verifica las claves guardadas: `hh_token`, `hh_user`, etc.

---

## 📝 Notas Importantes

- El `UserInfo.id` puede estar vacío inicialmente porque el `LoginResponse` del backend no incluye el ID del usuario
- Si necesitas el ID completo del usuario, deberías hacer una llamada adicional a `/api/users/{id}` después del login
- El token JWT contiene el `userId` en el claim `NameIdentifier`, que puede ser extraído si es necesario

