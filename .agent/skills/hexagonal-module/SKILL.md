---
name: hexagonal-module
description: Pattern for creating new modules in the Auth-Tenant microservice using Hexagonal Architecture, Modular Monolith principles, and Kafka-based Audit logging.
---

# Hexagonal Module Skill

Use this skill to create new modules in the `auth-tenant` microservice. All modules must follow the Hexagonal Architecture (Ports & Adapters) and link to the centralized Audit system.

## 1. Directory Structure

Every module `[name]` must be located in `src/modules/[name]` with the following structure:

```text
src/modules/[name]/
├── [name].module.ts          # Module entry point (NestJS)
├── application/              # Use Cases (Framework agnostic logic)
│   └── [name].service.ts
├── domain/                   # Business Logic & Ports
│   ├── [entity].entity.ts    # Pure Domain Entity
│   └── [name].repository.ts  # Port (Interface)
└── infrastructure/           # Adapters
    ├── controllers/          # HTTP Controllers (NestJS)
    │   └── [name].controller.ts
    └── persistence/          # Database Adapters (Prisma)
        └── prisma-[name].repository.ts
```

## 2. Implementation Checklist

### Domain Layer (Ports)
1. Define a pure **Entity** class.
2. Define an **Interface** for the repository (`I[Name]Repository`).
3. Define **DTOs** or **Query Types** needed for the repository methods to avoid `any`.

### Application Layer (Use Cases)
1. Use `import type` for repository ports to satisfy `isolatedModules`.
2. Inject the repository using `@Inject('I[Name]Repository')`.
3. Standardize Audit emitting:
    - Inject `@Inject('AUDIT_SERVICE') private readonly auditClient: ClientKafka`.
    - Implement a `private async emitAudit` method.
    - Emit events for `CREATE`, `UPDATE_FULL`, `UPDATE_PARTIAL`, and `DELETE`.

### Infrastructure Layer (Adapters)
1. **Persistence**: Implement the repository port using Prisma. Ensure all return types are manually mapped to Domain Entities.
2. **Controller**: 
    - Use `@CheckPermissions('module.action')` for all endpoints.
    - Standardize CRUD paths:
        - `GET /` (Paginated search)
        - `GET /:id` (Find unique)
        - `POST /` (Create)
        - `PUT /:id` (Complete update)
        - `PATCH /:id` (Field update)
        - `DELETE /:id` (Soft delete)
3. **Module**: Register providers and controllers. Link the repository via `{ provide: 'I[Name]Repository', useClass: Prisma[Name]Repository }`.

## 3. Mandatory Patterns

### Standardized Search (Repository Port)
```typescript
export interface [Name]Query {
  skip?: number;
  take?: number;
  orderBy?: string;
  search?: string;
}
```

### Audit Payload Pattern
```typescript
await this.emitAudit({ 
  userId, 
  tenantId, 
  action: AuditAction.CREATE, 
  module: '[name]', 
  payload: dto 
});
```

### Dependency Injection
Always use strings for interface injection:
```typescript
constructor(
  @Inject('I[Name]Repository') private readonly repository: I[Name]Repository
) {}
```

## 4. Integration with Common
- Use `src/common/prisma/prisma.service`.
- Use `src/common/auth/guards/permissions.guard`.
- Use `src/common/auth/decorators/permissions.decorator`.
