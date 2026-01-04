# Database Seeders - AIGreatBackend

## 📋 Resumen

Este documento describe los seeders de la base de datos del backend **AIGreatBackend**. El seeder se encuentra en `GreatSoft.Be.Infrastructure/Data/DataSeeder.cs` y se ejecuta automáticamente al iniciar la aplicación.

**Ubicación:** `AIGreatBackend/GreatSoft.Be.Infrastructure/Data/DataSeeder.cs`  
**Ejecución:** Automática en `Program.cs` al iniciar la aplicación

---

## 🔧 Configuración

### Control de Ejecución

El seeder se ejecuta en `Program.cs` con la siguiente lógica:

```csharp
// Verificar si se debe recrear la base de datos
var recreateDatabase = configuration.GetValue<bool>("DatabaseSettings:RecreateDatabaseOnStartup", false);

if (recreateDatabase)
{
    // Elimina y recrea la base de datos
    await DataSeeder.EnsureDatabaseCreatedAsync(context);
}
else
{
    // Solo crea la base de datos si no existe
    await context.Database.EnsureCreatedAsync();
}

// Seed de datos iniciales
await DataSeeder.SeedDataAsync(context, passwordService);
```

**Configuración en `appsettings.json`:**
```json
{
  "DatabaseSettings": {
    "RecreateDatabaseOnStartup": false
  }
}
```

### Protección contra Duplicados

El seeder verifica si los datos ya existen antes de insertarlos:

```csharp
if (context.Roles.Any() || context.CommunityTypes.Any() || 
    context.VehicleTypes.Any() || context.ProviderServiceTypes.Any())
{
    return; // No ejecuta el seed si ya hay datos
}
```

---

## 📊 Datos Sembrados

### 1. ProviderServiceTypes (8 tipos)

| Code | Name |
|------|------|
| `COMIDA` | Comida |
| `ASEO` | Aseo |
| `JARDINERIA` | Jardinería |
| `PLOMERIA` | Plomería |
| `ALBANILERIA` | Albañilería |
| `GAS` | Gas |
| `ELECTRICIDAD` | Electricidad |
| `PINTURA` | Pintura |

### 2. VehicleTypes (5 tipos)

| Code | Name |
|------|------|
| `AUTO` | Auto |
| `MOTOCICLETA` | Motocicleta |
| `CAMIONETA` | Camioneta |
| `SUV` | SUV |
| `MOTO` | Moto |

### 3. CommunityTypes (6 tipos)

| Code | Name |
|------|------|
| `COLONIA` | Colonia |
| `FRACCIONAMIENTO` | Fraccionamiento |
| `COTO` | Coto |
| `EDIFICIO` | Edificio |
| `CONDOMINIO` | Condominio |
| `COMUNIDAD` | Comunidad |

### 4. Company (1 empresa)

- **ID:** `f713434b-62ff-4057-8caa-1b2bfa356ef5` (fijo)
- **Name:** "Compañía de Administración Happy Habitat"
- **Address:** "Calle Principal 123, Madrid"
- **ContactName:** "María García"
- **Phone:** "+34 123 456 789"
- **Email:** "contacto@happyhabitat.com"

### 5. Roles (7 roles)

| Name | RoleType | Description |
|------|----------|-------------|
| `Admin` | Admin | Administrator role with full access |
| `SysAdmin` | SysAdmin | System Administrator role |
| `Manager` | Manager | Manager role |
| `Resident` | Resident | Resident role |
| `ResidentPower` | ResidentPower | Resident Power role |
| `Vigilance` | Vigilance | Vigilance role |
| `Supervision` | Supervision | Supervision role |

**⚠️ Nota:** Los IDs de los roles son generados dinámicamente (Guid.NewGuid()), por lo que cambian en cada ejecución del seeder.

### 6. Users (16 usuarios)

#### Usuarios Administrativos (4 usuarios)

1. **Admin User**
   - Username: `elgrandeahc`
   - Password: `ahc123`
   - Email: `admin@greatsoft.com`
   - Role: `Admin`
   - **⚠️ Este es el usuario principal para login**

2. **SysAdmin User**
   - Username: `sysadmin`
   - Password: `sysadmin123`
   - Email: `sysadmin@greatsoft.com`
   - Role: `SysAdmin`

3. **Company Admin 1**
   - Username: `juan.perez`
   - Password: `admin123`
   - Email: `juan.perez@happyhabitat.com`
   - Role: `Admin`
   - Vinculado a la empresa

4. **Company Admin 2**
   - Username: `ana.martinez`
   - Password: `admin123`
   - Email: `ana.martinez@happyhabitat.com`
   - Role: `Admin`
   - Vinculado a la empresa

#### Usuarios Manager (2 usuarios)

5. **Company Manager 1**
   - Username: `carlos.rodriguez`
   - Password: `manager123`
   - Email: `carlos.rodriguez@happyhabitat.com`
   - Role: `Manager`
   - Vinculado a la empresa

6. **Company Manager 2**
   - Username: `laura.sanchez`
   - Password: `manager123`
   - Email: `laura.sanchez@happyhabitat.com`
   - Role: `Manager`
   - Vinculado a la empresa

#### Usuarios Residentes (10 usuarios)

Los usuarios residentes se crean automáticamente para cada residente. Todos tienen:
- Password: `resident123`
- Role: `Resident`
- Username generado desde el nombre completo (ej: `maria.gonzalez`)

**Residentes creados:**
1. María González López
2. José Martínez Ruiz
3. Ana Fernández García
4. Carlos Sánchez Pérez
5. Laura Rodríguez Torres
6. Pedro Jiménez Moreno
7. Isabel Díaz Hernández
8. Miguel Ángel López Martín
9. Carmen Ruiz Gómez
10. Francisco Javier Serrano Castro

### 7. Community (1 comunidad)

- **Name:** "Fraccionamiento Las Flores"
- **Type:** Fraccionamiento
- **Location:** "Avenida Principal 456, Madrid, España"
- **Lat:** 402416
- **Lng:** -3704
- **HousingCount:** 50
- **ContactPhone:** "+34 987 654 321"
- **ContactEmail:** "contacto@lasflores.com"

### 8. Residents (10 residentes)

Todos los residentes están vinculados a "Fraccionamiento Las Flores" y tienen:
- Casa número: 101-110
- Dirección: "Calle Rosas [número], Fraccionamiento Las Flores"
- Email y teléfono únicos
- Usuario asociado con password `resident123`

### 9. Vehicles (0-2 vehículos por residente, generados aleatoriamente)

**Características:**
- Generación aleatoria (0, 1 o 2 vehículos por residente)
- Marcas: Toyota, Ford, Volkswagen, Nissan, Honda, Chevrolet, BMW, Mercedes-Benz, Audi, Hyundai
- Modelos específicos por marca
- Colores: Blanco, Negro, Gris, Plateado, Azul, Rojo, Verde, Beige
- Años: 2015-2023
- Placas únicas generadas aleatoriamente (formato: 3 letras + 3 números)
- Tipo de vehículo asignado según marca/modelo

### 10. Pets (0-2 mascotas por residente, generadas aleatoriamente)

**Características:**
- 70% de probabilidad de que un residente tenga mascotas
- 0, 1 o 2 mascotas por residente
- Especies:
  - 70% Perros
  - 25% Gatos
  - 5% Aves
- Razas específicas por especie
- Edades: 1-14 años
- Colores variados según especie
- Nombres aleatorios de una lista predefinida

### 11. ResidentVisits (2-4 visitas para los primeros 4 residentes)

**Características:**
- Solo los primeros 4 residentes tienen visitas
- 2-4 visitas por residente
- Fechas: últimos 30 días
- 80% de visitas finalizadas, 20% en progreso
- Duración: 1-6 horas
- 60% de visitantes con vehículo
- Motivos: Visita familiar, Entrega de paquete, Reunión de trabajo, etc.

### 12. ResidentProviders (10 proveedores)

| Name | Service Type | Phone | Email |
|------|--------------|-------|-------|
| Restaurante El Buen Sabor | COMIDA | +34 911 234 567 | contacto@buensabor.com |
| Limpieza Profesional Express | ASEO | +34 912 345 678 | info@limpiezaexpress.com |
| Jardines y Paisajismo Verde | JARDINERIA | +34 913 456 789 | contacto@jardinesverde.com |
| Fontanería Rápida 24/7 | PLOMERIA | +34 914 567 890 | emergencias@fontaneria24.com |
| Construcciones y Reformas Martínez | ALBANILERIA | +34 915 678 901 | presupuestos@construccionesmartinez.com |
| Gas Seguro y Rápido | GAS | +34 916 789 012 | servicio@gasseguro.com |
| Pizza Delivery Express | COMIDA | +34 917 890 123 | pedidos@pizzaexpress.com |
| Electricistas Certificados Pro | ELECTRICIDAD | +34 918 901 234 | contacto@electricistaspro.com |
| Pinturas y Decoración Premium | PINTURA | +34 919 012 345 | presupuestos@pinturaspremium.com |
| Limpieza Profunda Especializada | ASEO | +34 920 123 456 | info@limpiezaprofunda.com |

---

## 🔑 Credenciales de Acceso

### Usuarios para Testing

| Username | Password | Role | Descripción |
|----------|----------|------|-------------|
| `elgrandeahc` | `ahc123` | Admin | Usuario principal admin |
| `sysadmin` | `sysadmin123` | SysAdmin | Administrador del sistema |
| `juan.perez` | `admin123` | Admin | Admin de empresa |
| `ana.martinez` | `admin123` | Admin | Admin de empresa |
| `carlos.rodriguez` | `manager123` | Manager | Manager de empresa |
| `laura.sanchez` | `manager123` | Manager | Manager de empresa |
| `maria.gonzalez` | `resident123` | Resident | Residente |
| `jose.martinez` | `resident123` | Resident | Residente |
| `ana.fernandez` | `resident123` | Resident | Residente |
| `carlos.sanchez` | `resident123` | Resident | Residente |
| `laura.rodriguez` | `resident123` | Resident | Residente |
| `pedro.jimenez` | `resident123` | Resident | Residente |
| `isabel.diaz` | `resident123` | Resident | Residente |
| `miguel.lopez` | `resident123` | Resident | Residente |
| `carmen.ruiz` | `resident123` | Resident | Residente |
| `francisco.serrano` | `resident123` | Resident | Residente |

---

## ⚠️ Consideraciones Importantes

### 1. IDs Dinámicos
- La mayoría de los IDs son generados con `Guid.NewGuid()`, por lo que **cambian en cada ejecución del seeder**
- Solo el `CompanyId` tiene un GUID fijo: `f713434b-62ff-4057-8caa-1b2bfa356ef5`

### 2. Datos Aleatorios
- Vehículos, mascotas y visitas se generan aleatoriamente
- Los resultados pueden variar entre ejecuciones

### 3. Protección contra Duplicados
- El seeder verifica si ya existen datos antes de insertar
- Si ya hay datos, no ejecuta el seed

### 4. Recreación de Base de Datos
- Si `RecreateDatabaseOnStartup: true`, se **elimina toda la base de datos** antes de crear una nueva
- ⚠️ **CUIDADO:** Esto borra todos los datos existentes

### 5. Passwords
- Todas las contraseñas están hasheadas usando `IPasswordService.HashPassword()`
- Las contraseñas en texto plano están documentadas arriba para testing

---

## 🚀 Cómo Usar

### Ejecutar Seeder Manualmente

El seeder se ejecuta automáticamente al iniciar la aplicación. Para forzar la recreación:

1. Editar `appsettings.json`:
```json
{
  "DatabaseSettings": {
    "RecreateDatabaseOnStartup": true
  }
}
```

2. Iniciar la aplicación
3. El seeder se ejecutará automáticamente
4. Cambiar `RecreateDatabaseOnStartup` a `false` para evitar borrar datos en futuros inicios

### Verificar Datos Sembrados

Puedes verificar los datos usando:
- Swagger UI: `http://localhost:5080/swagger`
- Endpoints de la API:
  - `GET /api/roles` - Ver roles
  - `GET /api/users` - Ver usuarios
  - `GET /api/communities` - Ver comunidades
  - `GET /api/vehicles` - Ver vehículos
  - `GET /api/pets` - Ver mascotas
  - `GET /api/residentproviders` - Ver proveedores

---

## 📝 Notas para Desarrollo

### Para el Frontend

1. **RoleId en Registro:**
   - Los IDs de roles cambian en cada ejecución
   - Se debe obtener dinámicamente desde `/api/roles`
   - O usar el nombre del rol y buscar el ID

2. **Testing:**
   - Usar las credenciales documentadas arriba
   - El usuario `elgrandeahc` / `ahc123` es el principal para testing

3. **Datos de Prueba:**
   - Hay 10 residentes con datos completos
   - Hay vehículos y mascotas generados aleatoriamente
   - Hay visitas de ejemplo para los primeros 4 residentes

---

**Última actualización:** 2024-12-19  
**Archivo:** `AIGreatBackend/GreatSoft.Be.Infrastructure/Data/DataSeeder.cs`

