# Plan 08: Estrategia de Pivote — Mentor → MentorQuantic

Este documento define la estrategia para reutilizar la base del SaaS de mentoríaes mecánicos y pivotar hacia un **SaaS de Mentoría y Coaching Enterprise** con elementos de gamificación.

## 🎯 Visión del Producto

**MentorQuantic** — Plataforma SaaS para mentores, coaches y líderes que quieren estructurar programas de mentoría con tareas, hábitos, sesiones y seguimiento de progreso, potenciado por un sistema de gamificación que mantiene a los mentoriados comprometidos.

**Público objetivo (Enterprise-first):**
- 🏋️ **Gimnasios / Boxes** que gestionan entrenadores personales y sus mentees
- 🏫 **Academias técnicas** con instructores y alumnos
- 🏢 **Consultoras** con consultores senior y mentees corporativos
- 👔 **Empresas (L&D / RRHH)** con programas de onboarding y mentoring interno
- 🧑‍💼 **Coaches independientes** que manejan sus propios coachees

---

## 📊 Análisis de Reutilización de la Base

### ✅ Servicios 100% Reutilizables (Agnósticos)

| Servicio | Plan | Razón |
|----------|------|-------|
| Notifications (05) | Sin cambios | Solo recibe `{ templateId, to, context }`. No sabe de dominio. |
| Audit Service (06) | Sin cambios | Consume eventos genéricos. Append-only. |
| Subscription Worker (07) | Sin cambios | CRON de pagos. Solo habla con Auth-Tenant y pasarelas. |

### 🔄 Servicios Reutilizables con Cambios de Configuración (~10% de cambio)

| Servicio | Plan | Cambios necesarios |
|----------|------|--------------------|
| Auth-Tenant (01) | Rename de roles, permisos, campos de Tenant | Ver sección detallada abajo |
| CRM-Engagement (03) | Rename de labels en UI | `TenantClient` → Contacto/Mentoriado. Agenda y Booking siguen igual. |
| Finance-Document (04) | Cambios cosméticos | Ya usa `coreEntityId` polimórfico. Solo renombrar labels y templates. |

### 🔴 Servicio que se REEMPLAZA completamente

| Servicio | Plan | Razón |
|----------|------|-------|
| Mentor-Core (02) | **ELIMINAR y crear Mentor-Core** | Mentees, inventario, work orders = dominio de mentoría. No aplica. |

---

## 🔧 Cambios Específicos en Auth-Tenant

### Prisma Schema — Modelo `Tenant`

```diff
model Tenant {
  // Campos que SE MANTIENEN
  id, name, slug, isActive, ownerId, owner
  address, phone, website, logo, legalName, taxId
  userRoles, branches, subscription, subscriptionHistory

  // Campos que CAMBIAN
- mentorEmail String?
+ contactEmail  String?

  // Campos NUEVOS
+ bio           String?   // Descripción del mentor/práctica
+ specialty     String?   // Ej: "Life coaching", "Tech mentoring"
+ socialLinks   Json?     // { linkedin, twitter, website, calendly }
}
```

### Roles — Rename

| Actual (Academia) | Nuevo (Mentor) | Slug |
|-----------------|----------------|------|
| Super Administrador | Super Administrador | `super_admin` (sin cambio) |
| Dueño de Academia | Mentor / Coach | `mentor_owner` |
| Mecánico | Co-Mentor / Facilitador | `facilitator` |
| Recepcionista | Asistente | `assistant` |
| Mentee | Mentoriado / Coachee | `mentee` |

### Permisos — Rename

| Actual | Nuevo | Módulo |
|--------|-------|--------|
| `mentor:read` | `practice:read` | `practice` |
| `mentor:update` | `practice:update` | `practice` |
| `orders:create` | `programs:create` | `programs` |
| `orders:read` | `programs:read` | `programs` |
| `orders:update` | `programs:update` | `programs` |
| `orders:delete` | `programs:delete` | `programs` |
| `inventory:*` | `resources:*` | `resources` |
| `staff:*` | `team:*` | `team` |
| `branches:*` | `branches:*` | (sin cambio) |

**Permisos NUEVOS a agregar:**

| Permiso | Módulo | Descripción |
|---------|--------|-------------|
| `tasks:create` | `tasks` | Crear/asignar tareas |
| `tasks:read` | `tasks` | Ver tareas |
| `tasks:update` | `tasks` | Modificar tareas |
| `habits:create` | `habits` | Crear plantillas de hábitos |
| `habits:read` | `habits` | Ver hábitos |
| `habits:update` | `habits` | Modificar hábitos |
| `sessions:create` | `sessions` | Agendar sesiones |
| `sessions:read` | `sessions` | Ver sesiones |
| `progress:read` | `progress` | Ver progreso de mentoriados |
| `gamification:manage` | `gamification` | Gestionar recompensas y badges |

### Subscription Plans — Rename

| Actual | Nuevo | Config cambios |
|--------|-------|----------------|
| `maxMentees: 50` | `maxMentees: 10, maxCoaches: 1` | Coach individual |
| `maxMentees: 200` | `maxMentees: 50, maxCoaches: 5` | Pequeña organización |
| `maxMentees: 1000` | `maxMentees: 500, maxCoaches: 50` | Enterprise |
| `features: ['inventory']` | `features: ['resources']` | — |
| `features: ['crm']` | `features: ['crm', 'gamification']` | Nuevo feature gate |
| — | `features: ['analytics']` | Enterprise analytics dashboard |

### Sidebar — Nuevos Módulos

```typescript
// sidebar.service.ts — Nueva definición
const allModules: ModuleItem[] = [
  { key: 'dashboard',      label: 'Panel de Control',    icon: 'LayoutDashboard', path: '/dashboard',                module: 'dashboard' },
  { key: 'programs',       label: 'Programas',           icon: 'BookOpen',        path: '/dashboard/programs',       module: 'programs',     permission: 'programs:read' },
  { key: 'tasks',          label: 'Tareas',              icon: 'CheckSquare',     path: '/dashboard/tasks',          module: 'tasks',        permission: 'tasks:read' },
  { key: 'habits',         label: 'Hábitos',             icon: 'Repeat',          path: '/dashboard/habits',         module: 'habits',       permission: 'habits:read' },
  { key: 'sessions',       label: 'Sesiones',            icon: 'Video',           path: '/dashboard/sessions',       module: 'sessions',     permission: 'sessions:read' },
  { key: 'progress',       label: 'Progreso',            icon: 'TrendingUp',      path: '/dashboard/progress',       module: 'progress',     permission: 'progress:read' },
  { key: 'gamification',   label: 'Gamificación',        icon: 'Trophy',          path: '/dashboard/gamification',   module: 'gamification', permission: 'gamification:manage' },
  { key: 'resources',      label: 'Recursos',            icon: 'Library',         path: '/dashboard/resources',      module: 'resources',    permission: 'resources:read' },
  { key: 'team',           label: 'Equipo',              icon: 'Users',           path: '/dashboard/team',           module: 'team',         permission: 'team:read' },
  { key: 'branches',       label: 'Sucursales',          icon: 'Map',             path: '/dashboard/branches',       module: 'branches',     permission: 'branches:read' },
  { key: 'subscriptions',  label: 'Suscripción',         icon: 'CreditCard',      path: '/dashboard/subscriptions',  module: 'subscriptions' },
  { key: 'settings',       label: 'Configuración',       icon: 'Settings',        path: '/dashboard/settings',       module: 'settings' },
];
```

### `RegisterData` — Campo rename

```diff
export class RegisterData {
  email!: string;
  password!: string;
  firstName!: string;
  lastName!: string;
- mentorName!: string;
+ organizationName!: string;
}
```

---

## 📦 Archivos Impactados en Auth-Tenant (Exhaustivo)

| Archivo | Tipo de cambio |
|---------|----------------|
| `prisma/schema.prisma` | Rename `mentorEmail` → `contactEmail`, agregar campos |
| `prisma/seed.ts` | Nuevos roles, permisos, planes |
| `prisma/seed-plans.ts` | Nuevos config de planes |
| `src/modules/auth/domain/auth.repository.ts` | Rename `mentorName` |
| `src/modules/auth/application/auth.service.ts` | Rename `mentor_owner` refs |
| `src/modules/auth/application/sidebar.service.ts` | Módulos nuevos completos |
| `src/modules/auth/infrastructure/persistence/prisma-auth.repository.ts` | Rename campos |
| `src/modules/auth/infrastructure/controllers/*.ts` | Rename DTOs |
| `docker-compose.yml` | Rename containers `mentor_*` → `mentor_*`, network |

---

## 🆕 Nuevo servicio: Mentor-Core (reemplaza Mentor-Core)

Ver archivo: [`02-mentor-core.md`](file:///home/jsojo/Documentos/ecosystem_quantic/memtorquantic/.agent/plans/02-mentor-core.md)
