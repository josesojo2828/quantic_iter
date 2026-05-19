# Plan 06: Audit Service (Centralized Logging)

Microservicio agnóstico que actúa como consumidor pasivo (sinkhole) y bóveda inmutable de todas las acciones que ocurren en cualquier servicio de la red.

## 🎯 Objetivos
- Mantener una Bitácora estricta para trazabilidad administrativa, legal y de seguridad.
- Centralizar el log de todos los eventos del sistema usando Apache Kafka.
- Ser puramente reactivo (no bloquea NINGUNA petición del usuario).

## 🛠️ Checklist de Implementación

### Backend (Audit Service)
- [ ] **Kafka Consumer**: Escucha todos los tópicos designados a auditoría con un "Consumer Group" particular.
- [ ] **Almacenamiento Inmutable (Append-Only)**: Guardado veloz de las tramas (ideal en bases como MongoDB, ElasticSearch, o TimescaleDB) sin opción de hacer `UPDATE` o `DELETE`.
- [ ] **Indexación**: Búsqueda por `tenantId`, `userId`, `action` temporal para facilitar consultas rápidas.
- [ ] **API de Lectura**: Endpoints REST / GraphQL de uso exclusivo por el "Admin Console Dashboard" para auditar fallas o comportamientos.

## ⚙️ Arquitectura de Integración (Event-Driven)
- Funciona 100% asíncrono. Ningún microservicio, sea Auth-Tenant o CRM, "espera" respuesta de Audit. Solo publican el evento y continúan.
- Modelo de Evento Base de Auditoría: `{ timestamp, service, tenantId, userId, action, payload, originalState, newState }`
