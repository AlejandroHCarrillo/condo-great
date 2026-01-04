# Required API Endpoints Analysis

Based on the frontend analysis, the following endpoints are required in the backend:

## 1. Authentication Endpoints (`/api/auth`)

### POST `/api/auth/login`
- **Request**: `LoginRequest`
  ```typescript
  {
    username: string;
    password: string;
  }
  ```
- **Response**: `LoginResponse` or `AuthResponse`
  ```typescript
  {
    token: string;
    userId: string;
    username: string;
    email: string;
    role: string;
    expiresAt: string; // ISO date string
    residentInfo?: ResidentInfoDto;
  }
  ```
- **Status**: ✅ Implemented (but needs to match frontend response structure)

### POST `/api/auth/register`
- **Request**: `RegisterRequest`
  ```typescript
  {
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    password: string;
    roleId: string; // GUID
  }
  ```
- **Response**: `UserDto` or `AuthResponse`
- **Status**: ⚠️ Partially implemented (needs firstName, lastName, email fields)

### POST `/api/auth/forgot-password`
- **Request**: `ForgotPasswordRequest`
  ```typescript
  {
    email: string; // Frontend sends usernameOrEmail but backend expects email
  }
  ```
- **Response**: `{ message: string }`
- **Status**: ✅ Implemented (but expects username, not email)

### POST `/api/auth/reset-password`
- **Request**: `ResetPasswordRequest`
  ```typescript
  {
    email: string;
    newPassword: string;
    token: string;
  }
  ```
- **Response**: `{ message: string }`
- **Status**: ❌ Not implemented

### POST `/api/auth/refresh`
- **Request**: `{ refreshToken: string }`
- **Response**: `AuthResponse`
- **Status**: ❌ Not implemented

### POST `/api/auth/change-password`
- **Request**: `ChangePasswordDto`
- **Response**: `{ message: string }`
- **Status**: ✅ Implemented

---

## 2. Users Endpoints (`/api/users`)

### GET `/api/users/me/resident`
- **Response**: `string` (resident ID)
- **Status**: ❌ Not implemented
- **Note**: Returns the resident ID for the currently authenticated user

### GET `/api/users`
- **Response**: `UserDto[]`
- **Status**: ✅ Implemented

### GET `/api/users/{id}`
- **Response**: `UserDto`
- **Status**: ✅ Implemented

### POST `/api/users`
- **Request**: `CreateUserDto`
- **Response**: `UserDto`
- **Status**: ✅ Implemented

### PUT `/api/users/{id}`
- **Request**: `UpdateUserDto`
- **Response**: `UserDto`
- **Status**: ✅ Implemented

### DELETE `/api/users/{id}`
- **Response**: `204 No Content`
- **Status**: ✅ Implemented

---

## 3. Vehicles Endpoints (`/api/vehicles`)

### GET `/api/vehicles`
- **Response**: `VehicleDto[]`
- **Status**: ❌ Not implemented

### GET `/api/vehicles/{id}`
- **Response**: `VehicleDto`
- **Status**: ❌ Not implemented

### GET `/api/vehicles/resident/{residentId}`
- **Response**: `VehicleDto[]`
- **Status**: ❌ Not implemented

### POST `/api/vehicles`
- **Request**: `CreateVehicleRequest`
  ```typescript
  {
    residentId: string; // GUID
    brand: string;
    vehicleTypeId: string; // GUID
    model: string;
    year: number;
    color: string;
    licensePlate: string;
  }
  ```
- **Response**: `VehicleDto`
- **Status**: ❌ Not implemented

### PUT `/api/vehicles/{id}`
- **Request**: `UpdateVehicleRequest`
- **Response**: `VehicleDto`
- **Status**: ❌ Not implemented

### DELETE `/api/vehicles/{id}`
- **Response**: `204 No Content`
- **Status**: ❌ Not implemented

---

## 4. Pets Endpoints (`/api/pets`)

### GET `/api/pets`
- **Response**: `PetDto[]`
- **Status**: ❌ Not implemented

### GET `/api/pets/{id}`
- **Response**: `PetDto`
- **Status**: ❌ Not implemented

### GET `/api/pets/resident/{residentId}`
- **Response**: `PetDto[]`
- **Status**: ❌ Not implemented

### POST `/api/pets`
- **Request**: `CreatePetRequest`
  ```typescript
  {
    residentId: string; // GUID
    name: string;
    species: string;
    breed: string;
    age: number;
    color: string;
  }
  ```
- **Response**: `PetDto`
- **Status**: ❌ Not implemented

### PUT `/api/pets/{id}`
- **Request**: `UpdatePetRequest`
- **Response**: `PetDto`
- **Status**: ❌ Not implemented

### DELETE `/api/pets/{id}`
- **Response**: `204 No Content`
- **Status**: ❌ Not implemented

---

## 5. Resident Visits Endpoints (`/api/residentvisits`)

### GET `/api/residentvisits`
- **Response**: `ResidentVisitDto[]`
- **Status**: ❌ Not implemented

### GET `/api/residentvisits/{id}`
- **Response**: `ResidentVisitDto`
- **Status**: ❌ Not implemented

### GET `/api/residentvisits/resident/{residentId}`
- **Response**: `ResidentVisitDto[]`
- **Status**: ❌ Not implemented

### POST `/api/residentvisits`
- **Request**: `CreateResidentVisitRequest`
  ```typescript
  {
    residentId: string; // GUID
    visitorName: string;
    totalPeople: number;
    vehicleColor?: string | null;
    licensePlate?: string | null;
    subject: string;
    arrivalDate: string; // ISO date string
    departureDate?: string | null; // ISO date string
  }
  ```
- **Response**: `ResidentVisitDto`
- **Status**: ❌ Not implemented

### PUT `/api/residentvisits/{id}`
- **Request**: `UpdateResidentVisitRequest`
- **Response**: `ResidentVisitDto`
- **Status**: ❌ Not implemented

### DELETE `/api/residentvisits/{id}`
- **Response**: `204 No Content`
- **Status**: ❌ Not implemented

---

## Summary

### ✅ Implemented Endpoints (8)
- Authentication: login, register, forgot-password, change-password
- Users: CRUD operations

### ⚠️ Partially Implemented (2)
- Authentication: register (needs firstName, lastName, email)
- Authentication: forgot-password (expects username, frontend sends email)

### ❌ Missing Endpoints (19)
- Authentication: reset-password, refresh
- Users: GET /me/resident
- Vehicles: All 6 endpoints
- Pets: All 6 endpoints
- Resident Visits: All 6 endpoints

### Required Entities/DTOs to Create
1. **Vehicle** entity and DTOs
2. **VehicleType** entity (for vehicleTypeId)
3. **Pet** entity and DTOs
4. **ResidentVisit** entity and DTOs
5. **Resident** entity (for residentId relationships)
6. Update **User** entity to include firstName, lastName, email
7. Update **RegisterDto** to match frontend requirements

---

## Notes

1. The frontend expects `LoginResponse` with specific fields (userId, email, role, expiresAt, residentInfo)
2. The frontend sends `RegisterRequest` with firstName, lastName, email - these fields need to be added to User entity
3. The frontend uses `residentId` (GUID) for relationships - need to create Resident entity
4. All entities should use GUIDs as IDs
5. All date fields should be ISO 8601 strings
6. The API base URL is configured as `http://localhost:5080/api` in the frontend environment

