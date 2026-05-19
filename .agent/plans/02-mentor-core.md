# Plan 02: Mentor Core — Dominio Central del SaaS de Mentoría

Este microservicio gestiona toda la operatividad de mentoría/coaching: programas, tareas, hábitos, sesiones, progreso y gamificación.

## 🏢 Modelo Enterprise

La plataforma soporta **organizaciones** como Tenant principal. No es solo para mentores individuales — está diseñada para que una empresa contrate y gestione a sus coaches internos.

### Ejemplos de uso Enterprise
| Tipo de Organización | Tenant (Dueño) | Staff (Coaches) | Mentees (Mentees) |
|---------------------|----------------|-----------------|-------------------|
| Gimnasio/Box | Dueño del gym | Entrenadores personales | Miembros/Alumnos |
| Academia técnica | Director | Instructores/Tutores | Estudiantes |
| Consultora | Socio director | Consultores | Mentees corporativos |
| Coach independiente | El mismo coach | — | Sus coachees |
| Empresa (L&D) | RRHH / L&D Lead | Team leads / Mentores | Empleados nuevos (onboarding) |

### Jerarquía de acceso (ya soportada por Auth-Tenant)

```
Tenant (Organización)
├── Branch (Sede/Ubicación — opcional)
│   ├── mentor_owner → Ve TODO. Gestiona coaches, programas globales, analytics.
│   ├── facilitator (Coach/Entrenador) → Ve SOLO sus mentoriados asignados.
│   ├── assistant → Gestiona agenda, comunicaciones. No ve progreso detallado.
│   └── mentee → Ve SOLO su propio progreso, tareas y hábitos.
```

**Dato clave:** El `facilitator` (coach) funciona como un "sub-tenant" virtual. Solo opera dentro de su alcance asignado. El `mentor_owner` tiene visibilidad total de la organización. Esto ya está soportado por el RBAC dinámico del Auth-Tenant con `branchId` + `extraPermissions`.

---

## 🎯 Objetivos
- Permitir al Mentor/Organización crear **Programas de Mentoría** estructurados con fases y objetivos.
- Gestionar **Tareas** asignables con fechas límite, prioridades y evidencias.
- Implementar **Hábitos** recurrentes con tracking diario/semanal.
- Controlar **Sesiones** 1-a-1 o grupales con notas y seguimiento.
- Rastrear el **Progreso** del mentoriado con métricas y milestones.
- Motor de **Gamificación** completo: XP, niveles, badges, rachas, leaderboard.
- Biblioteca de **Recursos** compartidos (artículos, videos, plantillas).
- Gestionar **Grupos** de mentoriados para asignación masiva (clases, bootcamps, cohortes).
- **Anuncios (Announcements)**: Comunicados masivos a grupos u organización con Push Notifications.
- **Mediciones (Metrics)**: Seguimiento histórico de datos configurables (peso, grados, KPIs).
- **Galería de Progreso (Photo Gallery)**: Registro visual (Fotos de progreso, evidencias) usando el storage de Finance-Docs.
- [x] **Invitación Universal (Join Link)**: Link público por Tenant para auto-registro de mentees.
- **Triple-Tier Subscriptions**: Gestión de membresías (SaaS, Enterprise y Pro-Coach).
- **Scope isolation**: Cada coach solo ve lo suyo; el owner ve todo.

---

## 🛠️ Checklist de Implementación

### Backend (Mentor-Core Service)

#### Módulo: Grupos (Groups) 👥
- [x] **CRUD de Grupos**: Nombre, descripción, tipo (`CLASS` / `COHORT` / `TEAM`), capacidad máxima.
- [x] **Membership**: Agregar/remover mentoriados al grupo. Un mentee puede pertenecer a múltiples grupos.
- [x] **Coach Assignment**: Cada grupo tiene un coach responsable.
- [x] **Group → Program link**: Un grupo puede estar vinculado a un programa (ej: "Cohorte Enero 2026 → Programa Bootcamp").
- [x] **Bulk Operations**: Asignar tareas, hábitos o sesiones al GRUPO entero — el sistema crea las instancias individuales automáticamente.
- [x] **Group Dashboard**: Vista del coach con todos los miembros, progreso agregado y asistencia.

#### Módulo: Programas (Programs)
- [x] **CRUD de Programas**: Nombre, descripción, duración estimada, fases/etapas, objetivos.
- [ ] **Program Templates**: Plantillas reutilizables que el mentor/org puede clonar.
- [x] **Enrollment**: Inscripción individual O por grupo a un programa.
- [x] **Coach Assignment**: Vincular un `facilitatorId` al programa (¿quién es el coach responsable?).
- [x] **Program Status**: Workflow (`DRAFT` → `ACTIVE` → `COMPLETED` | `ARCHIVED`).
- [x] **Scope filtering**: El `facilitator` solo ve programas donde es coach. El `mentor_owner` ve todos.

#### Módulo: Tareas (Tasks)
- [x] **CRUD de Tareas**: Título, descripción, fecha límite, prioridad (LOW/MEDIUM/HIGH/URGENT).
- [x] **Asignación**: A mentoriado individual, a un grupo completo, o a un programa.
- [x] **Task Status**: `PENDING` → `IN_PROGRESS` → `SUBMITTED` → `APPROVED` / `REVISION_NEEDED`.
- [ ] **Evidencias**: Upload de archivos/links como prueba de completación (delegado a Finance-Docs Storage).
- [ ] **Recurring Tasks**: Tareas que se regeneran automáticamente (semanal, quincenal).
- [x] **Group Assignment**: Al asignar a un grupo, se crean instancias individuales por cada miembro para tracking personal.

#### Módulo: Hábitos (Habits)
- [x] **CRUD de Hábitos**: Nombre, descripción, frecuencia (diaria/semanal/custom), categoría.
- [x] **Habit Tracker**: Registro diario de completación (check-in con timestamp).
- [x] **Streaks Engine**: Cálculo automático de rachas consecutivas, racha más larga, porcentaje de cumplimiento.
- [ ] **Habit Templates**: Plantillas predefinidas por categoría (salud, productividad, aprendizaje).

#### Módulo: Sesiones (Sessions)
- [x] **CRUD de Sesiones**: Fecha, duración, tipo (1-a-1 / grupal / async), link de videollamada.
- [x] **Group Sessions**: Vincular sesión a un grupo (ej: "Bailoterapia Lunes 7pm" → grupo "Turno Noche").
- [x] **Attendance**: Registro de asistencia por sesión grupal (presente/ausente/justificado).
- [x] **Session Notes**: Notas del mentor post-sesión (privadas o compartidas).
- [x] **Session Feedback**: Rating + comentario del mentoriado tras la sesión.
- [x] **Integración CRM**: Las sesiones alimentan la Agenda del CRM-Engagement automáticamente.

#### Módulo: Progreso (Progress)
- [x] **Dashboard de Mentoriado**: Vista unificada de tareas completadas, hábitos activos, sesiones realizadas.
- [x] **Milestones**: Hitos definidos por el mentor dentro de un programa (ej: "Completar módulo 1").
- [x] **Progress Score**: Métrica calculada: `(tareas_completadas + habitos_cumplidos + sesiones_asistidas) / total_esperado`.
- [x] **Timeline/Journal**: Feed cronológico de toda la actividad del mentoriado.
- [x] **Coach Dashboard**: Resumen de TODOS los mentoriados del coach con filtros (solo para `facilitator`+).
- [x] **Org Dashboard**: Vista del `mentor_owner` con analytics globales: coaches activos, programas, retención.

#### Módulo: Gamificación (Gamification) 🎮
- [x] **XP Engine**: Sincronización con las tareas, hábitos, sesiones y milestones para otorgar XP.
- [x] **Level System**: Definición de niveles basada en XP acumulado.
  - Nivel 1: Novato (0 XP) → Nivel 6: Maestro (15000 XP).
  - Los nombres de niveles son **configurables por la organización/mentor**.
- [ ] **Badges/Logros**: Coleccionables desbloqueables por logros específicos.
  - Badges del sistema: `FIRST_TASK`, `STREAK_7`, `STREAK_30`, `PERFECT_WEEK`, `SESSION_MASTER`, `PROGRAM_GRADUATE`.
  - Badges **custom** creados por el mentor/organización.
- [ ] **Leaderboard**: Ranking opcional entre mentoriados del mismo grupo, programa, coach u organización.
  - Configurable: Público/Privado/Por-grupo/Por-programa/Global.
  - Métricas: XP total, rachas activas, tareas completadas.
- [ ] **Rewards**: Sistema de recompensas canjeables (opcional, config del mentor).
  - Ej: "500 XP = Sesión extra gratuita", "1000 XP = Acceso a recurso premium".

#### Módulo: Mediciones (Measurements/Metrics) 📊
- [x] **Metric Definition**: La organización define qué medir.
- [x] **History Tracking**: Registro de mediciones con fecha.
- [ ] **Photo Evidence**: Vincular fotos a una medición específica (ej: foto de la balanza o del RM).
- [x] **Progress Charts**: Gráficas de evolución.

#### Módulo: Galería de Progreso (Gallery) 📸
- [ ] **Photo Registration**: Registro de fotos con categoría (Frontal, Lateral, Espalda, Comida, Logro).
- [ ] **Before & After Generator**: Herramienta para comparar dos fotos de distintas fechas.
- [ ] **Private/Public Gallery**: Control de privacidad de las fotos (solo mentor, mentee o ambos).
- [ ] **Storage Integration**: Subida vía `Finance-Document` Gateway (MinIO/S3).

#### Módulo: Anuncios (Announcements) 📢
- [x] **CRUD de Anuncios**: Título, cuerpo (markdown), multimedia, target (Todos / Grupo / Programa).
- [x] **Push Triggers**: Integración con Micro #5 para enviar notificaciones push inmediatas.
- [x] **Read Tracking**: Saber quién vio el anuncio.

#### Módulo: Asistencias (Attendance) ✅
- [x] **QR Check-in**: Generación de QR único por mentee para escaneo en entrada física.
- [x] **Manual Check-in**: El coach marca asistencia desde su dashboard.
- [ ] **Attendance Reports**: Reporte de ausentismo y puntualidad.

#### Módulo: Suscripciones de Negocio (Business Subs) 💳
- [x] **Tier Definition**: Configurar planes que el estudiante le paga al Enterprise o al Coach.
- [ ] **Payment Status**: Sincronización con Micro #4 (Finance) para bloquear acceso si no hay pago.

#### Módulo: Recursos (Resources)
- [x] **Content Library**: CRUD de recursos categorizados (artículo, video, PDF, link, plantilla).
- [x] **Asignación a Programas**: Vincular recursos a fases específicas de un programa.
- [x] **Acceso controlado**: Recursos públicos vs. solo para inscritos en programa.
- [x] **Storage**: Delegado al Storage Gateway de Finance-Docs (reutilización).

#### Módulo: Reportes (Reporting) 📄
- [ ] **Mentee Report Card**: PDF con resumen de tareas, asistencia, métricas y XP.
- [ ] **Coach Performance**: Reporte para el owner sobre actividad y éxito de los coaches.

#### Módulo: Automatizaciones Básicas (Automation) 🤖
- [ ] **Daily Reminders**: Push automático si un hábito no se marcó en X hora.
- [x] **Self-Onboarding**: Link público `/join/:tenantSlug` que crea la cuenta del mentee y lo vincula al tenant.
- [ ] **Welcome Program**: Asignación automática de un programa "Intro" al registrarse.

---

### Frontend Aura Edition (Dashboard del Mentor/Organización)

- [x] **Panel Principal**: Resumen de mentoriados activos, tareas pendientes de review, próximas sesiones, coaches activos (enterprise).
- [ ] **Agenda Semanal**: Vista de calendario para el coach con sus sesiones y tareas críticas.
- [ ] **Gestión de Grupos**: CRUD de grupos, asignación masiva, vista de miembros y asistencia.
- [ ] **Gestión de Programas**: Editor de programas con fases drag-and-drop.
- [ ] **Centro de Tareas**: Vista Kanban (PENDING → IN_PROGRESS → SUBMITTED → DONE) con filtros por mentoriado, grupo y coach.
- [ ] **Tracker de Hábitos**: Calendario/heatmap visual estilo GitHub contributions.
- [ ] **Agenda de Sesiones**: Calendario integrado con el CRM, vista por grupo.
- [x] **Panel de Progreso**: Gráficos de progreso por mentoriado/grupo con comparativa temporal.
- [ ] **Centro de Gamificación**: Dashboard con XP, nivel actual, badges, leaderboard por grupo.
- [ ] **Biblioteca de Recursos**: Grid visual con categorías y búsqueda.
- [ ] **Analytics Enterprise**: Para `mentor_owner` — Coaches con más retención, programas más exitosos, NPS promedio.

### Frontend Aura Edition (App del Mentoriado — Vista Mentee)

- [ ] **Mi Dashboard**: XP actual, nivel, racha activa, próximas tareas, próxima sesión.
- [ ] **Mis Tareas**: Lista con estados y opción de subir evidencia.
- [ ] **Mis Hábitos**: Check-in diario con animación de racha.
- [ ] **Mi Progreso**: Timeline personal y milestones alcanzados.
- [ ] **Mis Badges**: Colección visual de logros desbloqueados y bloqueados (silueta).
- [ ] **Mis Recursos**: Acceso a la biblioteca del mentor/programa.
- [ ] **Leaderboard**: Posición en ranking (si está habilitado).


## ⚙️ Integración con Servicios Existentes (Event-Driven)

| Evento emitido por Mentor-Core | Consumidor | Propósito |
|-------------------------------|------------|-----------|
| `TaskSubmitted` | Notifications | Avisar al coach que hay tarea para revisar |
| `TaskApproved` | Notifications, Gamification Engine | Notificar mentoriado + otorgar XP |
| `HabitCheckinCompleted` | Gamification Engine | Calcular rachas + otorgar XP |
| `StreakAchieved` | Notifications, Gamification | Notificar logro + badge check |
| `SessionCompleted` | CRM (feedback request), Notifications | Solicitar review + otorgar XP |
| `MilestoneReached` | Notifications, Gamification | Celebrar + XP bonus |
| `LevelUp` | Notifications | Felicitar al mentoriado |
| `BadgeUnlocked` | Notifications | Notificar nuevo badge |
| `ProgramCompleted` | Notifications, Finance (certificado?) | Celebrar graduación |

---

## 📋 Orden de Ejecución Realizado

### ✅ Fase 1: Preparación de la Base (Auth-Tenant Pivot) - COMPLETADO
### ✅ Fase 2: Mentor-Core — MVP (Backend) - COMPLETADO
### ✅ Fase 3: Gamificación (Backend Core) - COMPLETADO
### ✅ Fase 4: Progreso y Seguimiento Cualitativo (Backend) - COMPLETADO

### ✅ Fase 5: Frontend (Aura Edition) - EN CURSO
1. [x] Estructura Base y ADN Aura.
2. [x] Dashboard del Mentor/Coach (Estructura y Widgets).
3. [ ] Dashboard del Organization Owner (analytics enterprise).
4. [ ] Vista del Mentoriado (con gamificación visual).
5. [ ] Panel de progreso con gráficos y Timeline.
