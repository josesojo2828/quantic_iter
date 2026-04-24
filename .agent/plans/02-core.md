# Plan 02: Core Workshop Operations

Este microservicio gestiona la operatividad técnica del taller: vehículos, repuestos y el flujo de los trabajos mecánicos.

## 🎯 Objetivos
- Mantener un registro exhaustivo de Vehículos.
- Controlar el stock de Inventario y su uso en trabajos.
- Definir y seguir el ciclo de vida de los Trabajos (Work Orders).
- Implementar Checklists de diagnóstico profesional.

## 🛠️ Checklist de Implementación

### Backend (Core Service)
- [ ] **Vehículos**: CRUD, vinculación con dueño, ficha técnica (VIN, Motor, Historial).
- [ ] **Servicios**: Catálogo de servicios ofrecidos (Alineación, Cambio de aceite, etc.).
- [ ] **Inventario**: Control de stock, alertas de reposición, vinculación de costos.
- [ ] **Trabajos (Work Orders)**: Workflow dinámico (Ingreso -> Diagnóstico -> Reparación -> Control de Calidad -> Entrega).
- [ ] **Checklist**: Plantillas personalizables para inspección de vehículos.

### Frontend (Dashboard)
- [ ] **Módulo Vehículos**: Listado y búsqueda rápida.
- [ ] **Centro de Operaciones**: Tablero Kanban para gestión de órdenes de trabajo.
- [ ] **Gestión de Almacén**: Inventario visual con indicadores gráficos.
- [ ] **Visor de Checklists**: Interfaz interactiva para el mecánico.

## ⚙️ Integración
- Se comunica con **Auth-Tenant** para validar permisos de asignación de mecánicos.
- Genera eventos para el microservicio de **Notificaciones** al cambiar estados de trabajo.
