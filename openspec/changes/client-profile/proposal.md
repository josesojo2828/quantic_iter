# Proposal: Client Profile Redesign

## Intent
Redesign the client profile view (`StudentProfilePage`) to empower coaches to manage student templates, schedules, monitor contact details, view action histories, and track active streaks.

## Scope

### In Scope
- Wiping existing `page.tsx` and building a premium glassmorphic dashboard.
- Displaying client public info (avatar, email, role, academy).
- Action tabs:
  - **Ficha (Data)**: Detailed client profile, contact, active streak widget.
  - **Asignación (Assign)**: Modal or inline action to assign templates/programs and schedules.
  - **Historial (History)**: Vertical timeline showing completed actions, milestones, and sessions.
- Unlocked streaks (racha) display using a visual Flame widget.

### Out of Scope
- Creating new backend API endpoints (we use existing endpoints: `/mentor/programs`, `/crm/contacts`, `/crm/interactions`, `/crm/reviews`).
- Modifying the tenant context or settings.

## Approach
Wipe the current file and implement a structured dashboard with:
1. **Header Component**: Mentee overview with name, email, streak count, and action buttons.
2. **Tabbed Content Navigation**:
   - Tab 1: Ficha (Data & Contacts)
   - Tab 2: Asignaciones (Programs and Templates with assignment modal)
   - Tab 3: Historial (Timeline of crm interactions)
3. Incorporate GSAP animations for transitions.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `apps/app-main/src/app/dashboard/clients/[id]/page.tsx` | Modified | Rewritten completely for new features. |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Missing client fields | Low | Implement robust typescript interfaces and UI fallbacks. |
| API failures on assign | Medium | Handle error states with toast notifications. |

## Rollback Plan
Run `git checkout -- apps/app-main/src/app/dashboard/clients/[id]/page.tsx` to restore the original 375-line file.

## Dependencies
- `@/features/crm/services/contacts.service`
- `@/features/crm/services/crm.service`
- `@/core/api/api.client`

## Success Criteria
- [ ] Coaches can view client public information and streak metric.
- [ ] Coaches can see client's action history timeline.
- [ ] Coaches can assign templates using the Assign Modal.
