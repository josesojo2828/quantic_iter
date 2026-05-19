# Plan 05: Notifications Service

Microservicio de infraestructura agnóstica responsable de unificar, renderizar y despachar TODAS las comunicaciones del SaaS hacia el exterior de forma asíncrona.

## 🎯 Objetivos
- Desvincular al resto del entorno de la pesada de procesar envíos a APIs de terceros.
- Centralizar un solo Motor de Plantillas que aplique el Branding/White-labeling del SaaS o Tenant.
- Actuar como hub multicanal (Email, Push, SMS, Webhooks).

## 🛠️ Checklist de Implementación

### Backend (Notification Service)
- [ ] **Message Consumer**: Suscriptores activos al Event Bus/Broker que escuchen intenciones estándar (ej. `SendNotificationCommand`).
- [ ] **Template Renderer**: Motor de renderizado (EJS u Handlebars) capaz de recibir payloads dinámicos y compilarlos con una Master Template.
- [ ] **Gestor de Proveedores (Adapters Strategy)**:
    - [ ] Módulo Email (Nodemailer, SendGrid, Amazon SES).
    - [ ] Módulo Push (Firebase Cloud Messaging - FCM).
    - [ ] Módulo Texting (Twilio, Gupshup, Vonage).
- [ ] **Reliability / Log de Envíos**: Rastro en Base de Datos de envíos exitosos y fallidos, y sistema automático de reintentos (Dead Letter Queue routing).

### Frontend (Dashboard)
- [ ] **Centro In-App (Bandeja)**: Feed interno de alertas (la clásica campanita) para avisos inmediatos en vivo al equipo utilizando WebSockets/Realtime Gateway.
- [ ] **Notification Settings**: Control granular de switch de notificaciones por usuario final (Opt-In / Opt-Out de canales).

## ⚙️ Arquitectura de Integración (Event-Driven)
- Naturaleza: Es el **sumidero de eventos** definitivo. **Auth-Tenant** envía acá para avisos de bienvenida, **CRM** para turnos, **Finance** para facturar, **Core** para alertas operativas.
- Simpleza en contratos: Solo espera en su payload cosas lógicas: `{ templateId, to, context: { name, extraData } }`. No sabe qué es un core ni para qué industria trabaja el SaaS.
