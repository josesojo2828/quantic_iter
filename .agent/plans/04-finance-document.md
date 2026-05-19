# Plan 04: Finance & Document

Este microservicio gestiona la parte económica, presupuestaria y de almacenamiento documental que resulta de los servicios operativos. Es estrictamente agnóstico al dominio central.

## 🎯 Objetivos
- Emitir Cotizaciones/Presupuestos genéricos basados en líneas de cobro (Line Items).
- Centralizar el almacenamiento transaccional de Archivos con permisos transverales.
- Procesar analíticas financieras a nivel global para el Tenant.

## 🛠️ Checklist de Implementación

### Backend (Finance Service)
- [ ] **Motor de Presupuestos (Quotes/Invoices)**: Entidad basada en listas de precios (`Item`, `Qty`, `Tax`, `Discount`), vinculada abstractamente a un `coreEntityId` (ej. ID de Reparación o ID de Consulta Médica).
- [ ] **Storage Gateway**: Adaptador robusto (AWS S3/GCS) que maneje subida segregada por tenant, firmas de URL limitadas (Presigned URLs) y validación de cuotas.
- [ ] **Documentos Adjuntos**: Entidad de DB de metadatos para archivos multimedia con tags o contextos (ej: `"before_service_photo"`, `"legal_id"`).
- [ ] **Aggregations & Analytics**: CRON u OLAP simplificado para sumarizar el flujo de caja del Tenant (Revenue vs Costs).

### Frontend (Dashboard)
- [ ] **Editor de Quotes/Presupuestos**: Interfaz estándar para crear proformas detalladas.
- [ ] **Gestor Documental (File Manager)**: Visor de archivos reutilizable como componente UI (`<FileUploader context="medical_scan" />`).
- [ ] **Dashboard Financiero**: Reportes, gráficos interactivos e indicadores contables básicos.

## ⚙️ Arquitectura de Integración (Event-Driven)
- **Desacoplamiento Absoluto:** Todo documento operativo se maneja como `SubjectId` polimórfico. No hay hardcode de 'Mentees' o 'Alumnos'.
- **Escucha Eventos:** Recibe mensajes del **Core** (ej: `BillableItemsGenerated`) para auto-generar presupuestos y enviarlos.
- **Validación transversal:** Realiza llamadas (síncronas vía gRPC o asíncronas) a **Auth-Tenant** para verificar reglas de negocio ligadas a subscripciones (ej: Superó el límite de archivos en disco).
