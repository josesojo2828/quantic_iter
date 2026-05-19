# Gamification Engine Standards

Esta skill define la lógica, fórmulas y reglas de negocio para el motor de gamificación de MentorQuantic. El objetivo es garantizar un sistema de progresión justo, motivador y consistente.

## 1. XP Engine (Puntos de Experiencia)

### Valores Base de Recompensa
- **Check-in de Hábito:** `+10 XP`
- **Tarea Completada (Baja):** `+20 XP`
- **Tarea Completada (Media):** `+50 XP`
- **Tarea Completada (Alta):** `+100 XP`
- **Asistencia a Sesión:** `+30 XP`
- **Milestone de Programa:** `+200 XP`

### Multiplicadores de Racha
- **Racha 7 días (Habits):** `1.2x` en XP de hábitos.
- **Racha 30 días (Habits):** `1.5x` en XP de hábitos.

## 2. Sistema de Niveles (Progression)

### Fórmula de Nivel
El sistema utiliza una curva de dificultad progresiva.
`XP_necesario = 100 * (nivel ^ 1.5)`

| Nivel | XP Acumulado | Título Default |
|-------|--------------|----------------|
| 1 | 0 | Novato |
| 2 | 280 | Aprendiz |
| 3 | 520 | Iniciado |
| 4 | 800 | Avanzado |
| 5 | 1120 | Experto |
| 10 | 3160 | Maestro |

*Nota: Los títulos son configurables por Tenant vía `LevelConfig`.*

## 3. Lógica de Rachas (Streaks)

- **Ventana de Tiempo:** Un día se considera de `00:00:00` a `23:59:59` en la zona horaria del Tenant.
- **Grace Period:** Opcional (configurado por mentor), permite 1 día de "perdón" sin romper la racha.
- **Cálculo:** Se dispara un evento `HabitCheckinCompleted`. El motor verifica si el último check-in fue hace exactamente 1 día. Si sí, `streak++`. Si no, `streak = 1`.

## 4. Evaluación de Logros (Badges)

Los badges se evalúan mediante un motor de reglas asíncrono (Event-Driven):
- **Eventos Gatillo:** `TaskApproved`, `HabitCheckinCompleted`, `SessionCompleted`.
- **Tipos de Reglas:**
  - `COUNT`: "Completar 10 tareas".
  - `STREAK`: "Mantener racha de 7 días en hábito X".
  - `SPECIFIC`: "Completar la primera tarea del programa Y".

## 5. Leaderboards

- **Alcance:** Global, Por Programa, Por Grupo.
- **Actualización:** Casi real-time (vía agregación de `XpTransaction`).
- **Métrica:** XP ganado en los últimos 30 días (Ranking Dinámico) y XP Total (Ranking Histórico).

---
**REGLA DE IMPLEMENTACIÓN:** Todas las transacciones de XP deben ser atómicas y estar registradas en la tabla `XpTransaction` para permitir auditoría y recálculo en caso de errores.
