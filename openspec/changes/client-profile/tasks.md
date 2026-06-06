# Tasks: Client Profile Redesign

## Phase 1: AssignTemplateModal Component
- [x] 1.1 Create `apps/app-main/src/app/dashboard/clients/components/AssignTemplateModal.tsx` with program templates dropdown.
- [x] 1.2 Implement template selection API query to `/mentor/programs` filtering by `isTemplate`.
- [x] 1.3 Add template assignment submission request POST to `/mentor/programs/{templateId}/assign` with `{ menteeId }` payload.
- [x] 1.4 Handle success and error state toast notifications.

## Phase 2: Client Profile Layout and Tabs
- [x] 2.1 Wipe existing `apps/app-main/src/app/dashboard/clients/[id]/page.tsx` completely.
- [x] 2.2 Rebuild base layout with standard imports, parameters, state, and loader placeholder.
- [x] 2.3 Add glassmorphic page header showing student name, email, role, and a Flame-based Streak widget.
- [x] 2.4 Set up three navigation tabs: "Ficha", "Programas", "Historial".
- [x] 2.5 Add GSAP animations for entering profile cards and tab content.

## Phase 3: Core Implementation & Integration
- [x] 3.1 Fetch client details, crm interactions, crm reviews, and client programs in parallel using `Promise.all`.
- [x] 3.2 Fetch unified progress timeline logs from `/mentor/progress/timeline/{studentId}`.
- [x] 3.3 Combine crm interactions and timeline logs into a case-sorted history array.
- [x] 3.4 Implement frontend `calculateStreak` function using milestone completions from fetched programs.
- [x] 3.5 Bind data to Ficha tab (public details), Programas tab (active programs, trigger modal), and Historial tab (vertical timeline).

## Phase 4: Testing & Verification
- [ ] 4.1 Verify that the client profile displays name and email successfully.
- [ ] 4.2 Validate that the calculated streak matches milestone completions.
- [ ] 4.3 Confirm that assigning a template adds it to the active programs list.
- [ ] 4.4 Test that error responses during template assignment show a toast error.
