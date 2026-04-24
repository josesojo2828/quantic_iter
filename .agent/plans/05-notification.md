# Plan 05: Notifications Service

Este microservicio es el encargado de la comunicación asíncrona hacia los usuarios (Talleres, Trabajadores y Clientes).

## 🎯 Objetivos
- Automatizar el envío de alertas de avances en trabajos mecánicos.
- Gestionar recordatorios de citas y turnos.
- Alertar sobre niveles bajos de stock en el inventario.
- Centralizar todos los canales de notificación (Email, SMS, Push, WhatsApp).

## 🛠️ Checklist de Implementación

### Backend (Notification Service)
- [ ] **Event Broker**: Implementar la lógica para escuchar eventos de todos los microservicios (usando Kafka, RabbitMQ o Redis Pub/Sub).
- [ ] **Plantillas**: Sistema de gestión de templates para correos y mensajes dinámicos.
- [ ] **Canales**:
    - [ ] Email (Nodemailer/SendGrid).
    - [ ] WhatsApp API Integration.
    - [ ] Notificaciones Push para la App Mobile.
- [ ] **Preferencias**: Lógica para que cada usuario decida qué alertas recibir y por qué canal.

### Frontend (Dashboard)
- [ ] **Centro de Notificaciones**: Bandeja de entrada interna para alertas rápidas.
- [ ] **Configuración de Alertas**: Panel de control para que el taller configure sus mensajes automáticos.

## ⚙️ Integración
- Es un microservicio totalmente reactivo; reacciona a eventos de **Core** (Trabajos), **CRM** (Citas) e **Inventario**.
- Valida identidades consultando al microservicio **Auth-Tenant** si es necesario.
