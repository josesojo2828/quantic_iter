# Flujos de Experiencia - MentorQuantic Aura Edition

## 01. Central de Operaciones del Mentor (Coach Dashboard)

El objetivo de este flujo es permitir al Coach/Mentor gestionar su conocimiento, sus alumnos y su negocio desde una interfaz única, fluida y "weightless" (sin fricción).

### Flujo A: Creación de Producto (Programa + Recursos)
1. **Acceso**: El mentor entra a `Biblioteca > Programas`.
2. **Acción**: Click en "Nuevo Programa".
3. **Detalle**: Define nombre, descripción y crea las **Fases** (Drag-and-drop).
4. **Vinculación**: En cada fase, puede abrir un cajón (drawer) de "Recursos" y arrastrar artículos/PDFs/Videos ya existentes o crear uno nuevo ahí mismo.
5. **Resultado**: Un programa estructurado listo para ser asignado.

### Flujo B: Onboarding de Mentee (Alumno)
1. **Acceso**: El mentor va a `Comunidad > Alumnos`.
2. **Acción**: Click en "Inscribir Alumno".
3. **Selección**: Elige un programa del catálogo.
4. **Automatización**: El sistema dispara el mail de bienvenida y habilita la primera fase de recursos para el alumno.
5. **XP Inicial**: Se le asignan los primeros puntos de XP por "Unirse al programa".

### Flujo C: Gestión de Negocio (Business Tiers)
1. **Acceso**: El owner/mentor va a `Configuración > Planes de Suscripción`.
2. **Acción**: Define el "Plan Pro" con acceso a "Recursos VIP".
3. **Validación**: Vincula el Tier con los programas específicos.
4. **Monitoreo**: Vista de cuántos alumnos están en cada plan y su estado de pago (vía Finance Microservice).

## 02. Experiencia del Mentoriado (Mentee App)

### Flujo D: Consumo de Contenido
1. **Dashboard**: El alumno ve su "Siguiente Paso" (la fase activa de su programa).
2. **Acceso**: Click en la fase -> Lista de Recursos.
3. **Gamificación**: Al marcar un recurso como "Leído/Visto", se dispara una animación de XP y se desbloquea el siguiente recurso (si aplica).
4. **Evidence**: Si la fase requiere tarea, el alumno sube su "Evidencia" (foto/link) y el Coach recibe una notificación push para review.

---
> [!TIP]
> Usaremos **GSAP** para todas las transiciones entre estados de los flujos para mantener la estética "Aura" (transparencias, blur, movimientos suaves).
