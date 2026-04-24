# Plan 03: CRM & Engagement

Este microservicio se enfoca en la relación con el cliente, la gestión de turnos y la reputación del taller.

## 🎯 Objetivos
- Gestionar una base de datos centralizada de Clientes.
- Implementar una Agenda Inteligente para citas.
- Medir la satisfacción del cliente mediante Puntuación y Feedback.
- Fomentar la lealtad del cliente.

## 🛠️ Checklist de Implementación

### Backend (CRM Service)
- [ ] **Clientes**: Perfil detallado, historial de contacto, preferencias.
- [ ] **Agenda**: Gestión de disponibilidad por taller, bloqueos de fechas, sobre-asignación.
- [ ] **Citas**: Sistema de reserva de turnos vinculado a servicios del microservicio **Core**.
- [ ] **Reviews**: Lógica de calificación (estrellas y comentarios) post-servicio.
- [ ] **Engagement**: Segmentación de clientes (ej: Clientes VIP, Clientes inactivos).

### Frontend (Dashboard & Pública)
- [ ] **Agenda Visual**: Calendario drag-and-drop para administración de turnos.
- [ ] **Directorio de Clientes**: Búsqueda avanzada y CRM básico.
- [ ] **Widget de Calificación**: Interfaz para que el cliente deje su feedback.
- [ ] **Dashboard de Reputación**: Análisis de métricas de satisfacción.

## ⚙️ Integración
- Consume datos del microservicio **Core** (servicios y disponibilidad de mecánicos).
- Envía eventos a **Notifications** para confirmar citas y pedir reviews.
