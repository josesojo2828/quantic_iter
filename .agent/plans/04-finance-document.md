# Plan 04: Finance & Document

Este microservicio gestiona la parte administrativa, presupuestaria y documental de los servicios mecánicos.

## 🎯 Objetivos
- Generar Presupuestos (Cotizaciones) precisos y técnicos.
- Gestionar el almacenamiento de Archivos (Fotos de vehículos, facturas de terceros, documentos legales).
- Proporcionar Reportes de rendimiento financiero para el Dueño.

## 🛠️ Checklist de Implementación

### Backend (Finance Service)
- [ ] **Presupuestos**: Generación de PDFs a partir de datos de la Work Order (Microservicio **Core**).
- [ ] **Almacenamiento**: Integración con un servicio de storage (S3 o similar) para guardado de fotos y documentos.
- [ ] **Reportes**: Agregación de datos financieros (Costos vs Ingresos) por periodo.
- [ ] **Facturación**: Integración (opcional) con servicios de impuestos locales.

### Frontend (Dashboard)
- [ ] **Editor de Presupuestos**: Interfaz para añadir ítems, mano de obra y descuentos.
- [ ] **Gestor Documental**: Galería de fotos del auto (Antes/Después) y visor de archivos.
- [ ] **Centro de Reportes**: Gráficos interactivos de rentabilidad y gastos de stock.

## ⚙️ Integración
- Depende de los datos operativos de **Core** (Work Orders y Repuestos).
- Verifica límites de suscripción en **Auth-Tenant** (ej: Límite de almacenamiento).
