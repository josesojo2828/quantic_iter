# Multitenancy de Usuarios (Context Switching) 👥🌐🔄

En el ecosistema **Quantic**, un usuario no está "atado" a un solo taller de por vida. Este flujo permite que una sola identidad digital (`User`) interactúe con múltiples organizaciones (`Tenants`) con diferentes privilegios.

## El Concepto de Contexto
El **Contexto** es la combinación de `(Usuario, Taller, Rol)`. 
Un usuario puede tener N contextos activos en la base de datos, pero solo **UNO** activo en su sesión de navegación (JWT).

## Diagrama de Flujo: Login y Cambio de Contexto

```mermaid
graph TD
    A[Usuario: Login] --> B{¿Tiene múltiples contextos?}
    B -- No --> C[Emitir JWT con Tenant único]
    B -- Sí --> D[Backend devuelve lista de Tenants]
    D --> E[Usuario selecciona Tenant]
    E --> F[Backend emite JWT para ese contexto]
    
    F --> G[Navegación normal]
    G --> H[Usuario elige 'Cambiar Taller']
    H --> I[POST /auth/switch-tenant {tenantId}]
    I --> J{¿Tiene permiso en ese Tenant?}
    J -- Sí --> K[Emitir NUEVO JWT con otro Tenant context]
    J -- No --> L[Error: 403 Forbidden]
```

## Estructura de Datos (Prisma)
Aprovechamos la tabla intermedia `UserRole` que ya tiene:
- `userId`
- `tenantId`
- `roleId`
- `branchId` (opcional)

### Adición Propuesta
Añadir `lastTenantId` en el modelo `User` para mejorar la UX:
```prisma
model User {
  ...
  lastTenantId String? @db.ObjectId
}
```

## Estrategia de JWT
El token JWT debe contener siempre el `tenantId` y los `permissions` asociados a **ese** contexto específico.

```json
{
  "sub": "user_id_123",
  "email": "juan@mail.com",
  "tenantId": "tenant_a_456",
  "role": "mechanic",
  "permissions": ["service:read", "inventory:update"],
  "iat": 171378...",
  "exp": 171383..."
}
```

## Endpoints Requeridos

### 1. Perfil y Contextos
`GET /auth/me`
Devuelve el usuario actual y un array de todos sus contextos (Talleres donde tiene rol).

### 2. Cambio de Contexto
`POST /auth/switch-context`
**Payload**: `{ "tenantId": "..." }`
**Lógica**:
1. Valida que el usuario logueado pertenezca a ese `tenantId`.
2. Busca el rol y permisos para ese par (Usuario, Tenant).
3. Genera un nuevo JWT y lo devuelve (o lo setea en cookies).
4. Actualiza `lastTenantId` en la DB.

---
*Documentación generada por Antigravity - Arquitectura SaaS Quantic.*
