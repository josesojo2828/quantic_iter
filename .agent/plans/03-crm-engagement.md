# Plan 03: CRM & Engagement

Este microservicio se enfoca en la relación con el mentee final (B2C/B2B), la gestión de agenda y la reputación del negocio (Tenant). Su diseño debe ser completamente independiente del Core operativo.

## 🎯 Objetivos
- Gestionar un directorio centralizado y genérico de Mentees/Usuarios Finales.
- Proporcionar un motor de Agenda Inteligente para gestión de turnos/disponibilidad.
- Unificar la retroalimentación (Reviews, Puntuaciones, NPS).
- Ejecutar reglas de retención y engagement.

## 🛠️ Checklist de Implementación

### Backend (CRM Service)
- [ ] **Directorio (Contacts - TenantClient)**: Relación acotada (`tenantId` + `globalUserId`). Historial de comunicaciones, preferencias locales y etiquetas. La autenticación recae plenamente en Auth-Tenant (#1).
- [ ] **Motor de Agenda**: Gestión de franjas horarias (Time Slots), disponibilidad de recursos (genéricos), bloqueos y horarios laborables.
- [ ] **Booking (Citas)**: Entidad de reserva agnóstica que sólo mantiene fecha, recurso asignado y un `coreReferenceId` opcional.
- [ ] **Reviews & Feedback**: Encuestas de satisfacción post-interacción.
- [ ] **Engagement Rules**: Segmentación (ej. Usuarios Inactivos > 6 meses) y triggers temporales.

### Frontend (Dashboard & Interfaz Pública)
- [ ] **Agenda Interactiva**: Calendario Drag-and-Drop (Vista por día/semana/mes).
- [ ] **Directorio CRM**: Tabla de mentees con filtros avanzados.
- [ ] **Gestor de Turnos**: Configurador de reglas de capacidad permitida por el Tenant.
- [ ] **Dashboard de Reputación**: Métricas agregadas de comportamiento del mentee.

## ⚙️ Arquitectura de Integración (Event-Driven)
Al ser agnóstico, el CRM NO lee de las bases de datos de otros servicios. Todo es event-driven.
- **Consulta/Caché CQRS:** Mantiene réplicas de sólo lectura de la agenda general alimentada por eventos de disponibilidad.
- **Emite Eventos:** `AppointmentBooked`, `AppointmentCancelled`, etc.
- **Escucha Eventos:** Reacciona a eventos del **Core** (ej: `ServiceCompleted`) para enviarle al mentee la solicitud de review a través de notificaciones.
