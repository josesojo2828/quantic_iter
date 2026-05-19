# Plan 07: Subscription Worker (Cron Job Engine)

Servicio de lógica ejecutora en background, aislado del tráfico HTTP de mentees, enfocado exclusivamente a barrer y comprobar el estado de modelo de negocio y enviar transacciones programadas.

## 🎯 Objetivos
- Concentrar tareas asíncronas cronometradas en un entorno que NO escale horizontalmente y no cruce jobs por colisión, o que use Distributed Locks.
- Garantizar la no-duplicidad en cobros mediante pasarelas (Stripe/PayPal/Mercadopago).

## 🛠️ Checklist de Implementación

### Backend (Worker Environment)
- [ ] **Despliegue Replicado Limitado**: En Kubernetes, debe tener obligatoriamente `Replicas: 1` a menos que se use Redis Lock (Redlock) o colas especializadas como BullMQ.
- [ ] **Motor de CRON / Scheduler**: Tareas que corren a las 00:00 UTC, p. e. revisar planes vencidos.
- [ ] **Ciclo de Pagos**: Llamadas a pasarelas de pago y detección de transacciones declinadas.
- [ ] **Notificador (Event Producer)**: Si la tarjeta rebota, no avisa él... EMITE un evento de Kafka (`PaymentFailed`). Entonces el **Notifications Service** manda el correo y el **Auth-Tenant** bloquea el login a la plataforma.

## ⚙️ Arquitectura de Integración
Es un componente invisible para los UIs y Frontends; su contacto con el entorno es a través del Bus de Eventos y, opcionalmente, consultas (gRPC o base de datos compartida controlada) para leer suscripciones de la base del `Auth-Tenant`.
