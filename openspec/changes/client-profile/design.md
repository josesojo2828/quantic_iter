# Design: Client Profile Redesign

## Technical Approach
We will rebuild the Client Profile page from scratch, maintaining only the core imports and GSAP animation concepts. The layout will leverage a premium glassmorphic aesthetic (gradient cards, modern dark-border UI) and consist of:
1. **Header Component**: Contact's name, email, global status, and a Flame-based Streak card.
2. **Tabs Panel**:
   - **Ficha (Data & Contacts)**: Detailed contact fields (firstName, lastName, phone, email, registration date).
   - **Programas (Assign & Active)**: List of active assigned programs and a button to open the `AssignTemplateModal`.
   - **Historial (Unified Timeline)**: Combines CRM interactions and backend progress timeline activity logs in a single vertical timeline.

## Architecture Decisions

### Decision: Rebuild vs Refactor
- **Choice**: Rebuild the client profile file completely.
- **Alternatives considered**: Patching the current 375-line file.
- **Rationale**: The current file has outdated layout styles and lacks support for active streak display, template assignment, and timeline activity logs. A clean rewrite is simpler, less error-prone, and achieves a superior layout.

### Decision: Streak Calculation Method
- **Choice**: Fetch all programs via `/mentor/programs` and filter by `menteeId === id`, then compute the streak by aggregating completions.
- **Alternatives considered**: Mocking the streak or calling the gamification stats (which is restricted to the logged-in student).
- **Rationale**: This leverages existing APIs without needing backend changes, and accurately computes the actual active streak for the mentee.

### Decision: Unified Timeline Logs
- **Choice**: Merge both CRM interactions (`/crm/interactions/contact/...`) and Activity logs (`/mentor/progress/timeline/...`) in the client history tab.
- **Alternatives considered**: Only showing CRM interactions.
- **Rationale**: Gives the coach a 360-degree view of what the mentee has done (both CRM notes and actual dashboard activities like completing milestones).

## Data Flow

```
   [StudentProfilePage]
      ├──> contactsService.getContactById(id)
      ├──> apiClient.get('/mentor/programs') -> Filter by menteeId & Calculate Streak
      ├──> crmService.getInteractions(id) \
      └──> apiClient.get('/mentor/progress/timeline/id') => Combine & Sort by Date -> Unified Timeline
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `apps/app-main/src/app/dashboard/clients/[id]/page.tsx` | Modify | Wipe and rewrite for client profile view. |
| `apps/app-main/src/app/dashboard/clients/components/AssignTemplateModal.tsx` | Create | New modal component to assign a program template to the current client. |

## Interfaces / Contracts

```typescript
export interface ActivityLog {
  id: string;
  type: string;
  title: string;
  description?: string;
  createdAt: string;
}

export interface CombinedTimelineItem {
  id: string;
  type: string; // 'crm' | 'activity'
  title: string;
  description: string;
  date: string;
}
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Component | Tab switching & Modals | Render the components and simulate clicks. |
| Integration | Program template assignment | Verify correct payload sent to `/mentor/programs/{id}/assign`. |

## Migration / Rollout
No migration required.
