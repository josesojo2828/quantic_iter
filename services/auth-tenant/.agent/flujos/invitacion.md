# Flujo de Invitación de Equipo 👥✉️

Este documento describe el proceso técnico y de negocio para invitar a nuevos miembros (Mecánicos, Recepcionistas, etc.) a un mentoría (Tenant) dentro del ecosistema **Quantic**.

## Overview
El objetivo es permitir que un `MENTOR_OWNER` o `SUPER_ADMIN` invite a una persona a su organización de forma segura, garantizando que el nuevo usuario nazca con el rol, mentoría y sucursal correctos.

## Diagrama de Secuencia

```mermaid
sequenceDiagram
    participant Owner as Mentor Owner
    participant API as Auth-Tenant Microservice
    participant DB as MongoDB (Prisma)
    participant Notification as Notification Service (#5)
    participant User as Invited Member

    Owner->>API: POST /invitation/send {email, roleId, branchId}
    API->>API: Validate Permissions (STAFF_CREATE)
    API->>DB: Create Invitation {token, expiresAt, ...}
    API-->>Owner: 201 Created (Success)
    API->>Notification: Emit Event: invitation.created
    Notification-->>User: Send Email with Link & Token
    
    User->>API: GET /invitation/validate/:token
    API->>DB: Check Token (Exists? Expired? Used?)
    DB-->>API: Invitation Data
    API-->>User: 200 OK (Token Valid)

    User->>API: POST /auth/register (with Token)
    API->>DB: Create/Link User to Tenant & Branch
    API->>DB: Mark Invitation as Accepted
    API-->>User: 201 Created + JWT Access
```

## Referencia de API

### 1. Enviar Invitación
`POST /invitation/send`
- **Seguridad**: Requiere `JwtAuth` y permiso `staff:create` o `saas:admin`.
- **Payload**:
  ```json
  {
    "email": "mecanico@garaje.com",
    "roleId": "676...",
    "branchId": "676..." // Opcional
  }
  ```
- **Lógica**: Genera un token de 128-bits. Expora en 7 días por defecto.

### 2. Validar Token
`GET /invitation/validate/:token`
- **Seguridad**: Público.
- **Respuesta**: Devuelve los detalles de la invitación (email, rol, tenant) si es válida.

### 3. Aceptar Invitación
`POST /invitation/accept/:token`
- **Seguridad**: Requiere `JwtAuth` (Usuario logueado).
- **Uso**: Para usuarios que YA tienen cuenta en Quantic y quieren unirse a otro mentoría.

## Reglas de Negocio & Seguridad
1. **Un Solo Pase**: No se pueden enviar múltiples invitaciones pendientes al mismo email para el mismo mentoría.
2. **Expiración**: El token queda inválido automáticamente después de 7 días.
3. **Uso Único**: Una vez aceptada (`acceptedAt != null`), el token ya no puede ser validado.
4. **RBAC Atómico**: La invitación determina el Rol final del usuario, impidiendo escalación de privilegios no autorizada.

---
*Documentación generada por Antigravity - Arquitectura SaaS Quantic.*
