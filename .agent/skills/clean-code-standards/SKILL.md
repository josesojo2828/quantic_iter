# Clean Code & Architectural Standards Skill

This skill defines the rigorous quality and architectural standards for the Quantic Ecosystem projects. Follow these rules to ensure a scalable, type-safe, and maintainable codebase.

## 1. Hexagonal Architecture & Modular Monolith
- **Domain Layer**: Contains Entities and Repository Ports (interfaces). MUST NOT depend on any external framework (NestJS, Prisma, etc.).
- **Application Layer**: Contains Services using Domain Ports. Coordinates business logic.
- **Infrastructure Layer**: Contains Controllers and Persistence Adapters (Prisma). Implements Domain Ports.

## 2. Type Safety & Metadata (The "No Any" Rule)
- **NO `any` or `unknown`**: Always define specific interfaces or classes for your data.
- **Classes for DTOs**: Use `class` instead of `interface` for data transfer objects (DTOs) and Request objects used in decorated signatures (Controllers). This is required for NestJS metadata reflection and `isolatedModules` compatibility.
- **Example**:
  ```typescript
  export class CreateUserDto {
    email!: string;
    name!: string;
  }
  ```

## 3. Import Formatting
- **Multi-line Imports**: Use when you have 3 or more items or if the line exceeds 80 characters.
  ```typescript
  import {
    Injectable,
    NotFoundException,
    Inject,
  } from '@nestjs/common';
  ```
- **Single-line Imports**: Use for simple imports with 1 or 2 items.
  ```typescript
  import { Module } from '@nestjs/common';
  ```
- **Type Imports**: Always use `import type` when importing interfaces used as type hints in decorated constructors to avoid `isolatedModules` errors.
  ```typescript
  import type { IRepository } from '../domain/repository';
  ```

## 4. Async / Await Integrity
- **No Redundant `async`**: Never mark a method as `async` if it doesn't contain an `await` or return a Promise manually.
- **Always `await` Promises**: If a method returns a Promise and you are in an `async` function, you MUST `await` it unless it's a deliberate fire-and-forget pattern (e.g., audit logs, but document why).
- **Audit Logs Exception**: Audit emissions using Kafka `emit` return Observables; do NOT `await` them.

## 5. Visual Formatting & Spacing
- **Constructor Braces**: Maintain consistent spacing `{ }` in empty constructors to satisfy both Prettier and ESLint.
- **Consistent Gaps**: 1 empty line between logical blocks, but no double empty lines.
- **Naming**: Use `I` prefix for Repository Interfaces (Ports) to clearly distinguish them from implementations.

## 6. Decorators & Request Handling
- **Prefer Custom Decorators**: Use decorators like `@GetUser()` instead of accessing `@Request() req` directly to decouple controllers from the underlying HTTP framework.
- **DTOs for All Bodies**: Use class-based DTOs for all `@Body()` parameters, even for partial or dynamic updates (e.g., `UpdateFieldDto` instead of an inline type).

## 7. Audit & Logging
- Every CRUD operation MUST trigger an audit log via `@mentor/shared` Kafka client.
- Always include `previousState` in `UPDATE` and `DELETE` actions for traceability.
