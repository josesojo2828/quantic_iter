# Plan 01: Authentication & Authorization

Este microservicio es la puerta de entrada al ecosistema Quantic. Gestiona la identidad, los permisos y el modelo de negocio (SaaS).

## 🎯 Objetivos
- Centralizar la identidad de todos los usuarios (Talleres, Trabajadores, Clientes, Admins).
- Gestionar el ciclo de vida de los Talleres (Tenants) y sus **Sub-sucursales (Branches)**.
- Controlar el acceso basado en Roles, Permisos y Locación (Branch-based RBAC).
- Administrar planes y suscripciones.

## 🛠️ Checklist de Implementación

### Backend (Auth-Tenant Service)
- [x] **Auth Core**: Login, Registro de Taller, Recuperación de contraseña.
- [x] **Multi-tenancy**: Aislamiento de datos por `tenantId`.
- [x] **RBAC**: Middleware de roles (`OWNER`, `MECHANIC`, `RECEPTIONIST`, `ADMIN`).
- [x] **Sub-branches**: CRUD de sucursales vinculadas al `Tenant` (Auto-creación de "Sede Central" al registro).
- [x] **User-Branch Association**: Lógica para vincular usuarios a una sucursal específica.
- [x] **Suscripciones**: Integración con pasarela de pagos y validación de límites (Usuarios y Sucursales).
- [x] **Admin Console Backend**: Endpoints para gestión global de la plataforma (Login as Admin).
- [x] **Admin Dashboard Frontend**: Interfaz administrativa global en `apps/admin-front`.

### Frontend (App Main)
- [x] **Auth Flow**: Pantallas de login/registro dinámicas.
- [x] **Team Management**: Listado y edición de trabajadores.
- [x] **Branch Management**: Pantalla para crear y editar sucursales.
- [x] **Pricing & Billing**: Gestión del plan activo.
- [x] **Role Filtering**: Restricción de vistas financieras para mecánicos.

## 🛡️ Seguridad
- JWT con rotación de Refresh Tokens.
- Encriptación de contraseñas con Argon2.
- Validación de límites de suscripción en cada operación de escritura.
