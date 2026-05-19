# Plan 01: Authentication & Authorization

Este microservicio es la puerta de entrada al ecosistema Quantic. Gestiona la identidad, los permisos y el modelo de negocio (SaaS).

## 🎯 Objetivos
- Centralizar la identidad de todos los usuarios (Academiaes, Trabajadores, Mentees, Admins).
- Gestionar el ciclo de vida de los Academiaes (Tenants) y sus **Sub-sucursales (Branches)**.
- Controlar el acceso basado en Roles, Permisos y Locación (Branch-based RBAC) — ahora **Dinámico y Granular**.
- Administrar planes y suscripciones, manteniendo el historial financiero de los mismos.

## 🛠️ Checklist de Implementación

### Backend (Auth-Tenant Service)
- [x] **Auth Core**: Login, Registro de Academia, Recuperación de contraseña.
- [x] **Multi-tenancy**: Aislamiento de datos por `tenantId` (gestionado a nivel de `UserRole` para permitir acceso multi-tenant).
- [x] **Dynamic RBAC & Permissions (NUEVO)**: Evolución de roles estáticos; ahora se utilizan modelos `Role` y `Permission` en Prisma, y overrides granulares con `extraPermissions` en la tabla `UserRole`.
- [x] **Sub-branches**: CRUD de sucursales vinculadas al `Tenant` (Auto-creación de "Sede Central" al registro).
- [x] **Modulos Staff y User-Branch Association**: Lógica para vincular usuarios a una sucursal específica a través del módulo `Staff`.
- [x] **Onboarding (Invitaciones) (NUEVO)**: Módulo de `Invitation` con tokens de uso único, tiempos de expiración y vinculación al registro para invitar empleados a sucursales.
- [x] **Suscripciones y Trazabilidad (NUEVO)**: Integración con base de datos real para `SubscriptionPlan`, `Subscription` y rastro con `SubscriptionHistory` (Upgrades/Downgrades/Cancelaciones). Validaciones de configuraciones (ej: `maxUsers`).
- [x] **Admin Console Backend**: Módulo `admin` para gestión global de la plataforma (Login as Admin).
- [x] **Admin Dashboard Frontend**: Interfaz administrativa global en `apps/admin-front`.

### Frontend (App Main)
- [x] **Auth Flow**: Pantallas de login/registro dinámicas.
- [x] **Team Management**: Listado y edición de trabajadores.
- [x] **Branch Management**: Pantalla para crear y editar sucursales.
- [x] **Pricing & Billing**: Gestión del plan activo y el historial.
- [x] **Role Filtering**: Restricción basada en los nuevos permisos granulares obtenidos dinámicamente del backend.

## 🛡️ Seguridad y Arquitectura Hexagonal
- JWT (Access y Refresh Tokens) manejado en capa Core.
- Encriptación de contraseñas con Argon2.
- Validación estructurada de límites de suscripción en operaciones de escritura.
- RBAC Dinámico en guards para prevenir acceso no autorizado por sucursal.
