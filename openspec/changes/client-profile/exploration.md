# Exploration: Client Profile Page Redesign

## Current State
The existing file `apps/app-main/src/app/dashboard/clients/[id]/page.tsx` is 375 lines long. It implements a student profile view that fetches contact data via `contactsService.getContactById(id)`, interactions via `crmService.getInteractions(id)`, and reviews. It has basic tab navigation (`timeline` | `programs` | `reviews`) and uses GSAP for fade-in animations.
However, it lacks the key features requested:
- Directly assigning templates/schedules to the mentee from this page.
- Visualizing gamification stats (active streaks / racha).
- Structured history of actions.
- Premium UI aesthetics consistent with the Quantic branding.

## Affected Areas
- `apps/app-main/src/app/dashboard/clients/[id]/page.tsx` — Main page component to be rewritten.
- `apps/app-main/src/features/crm/services/contacts.service.ts` — Used to fetch contact public information.
- `apps/app-main/src/features/crm/services/crm.service.ts` — Used to fetch timeline/history data.

## Approaches

### Option A: Complete Wipe and Step-by-Step Rebuild (User Request)
Wipe `apps/app-main/src/app/dashboard/clients/[id]/page.tsx` completely and build it up incrementally.
- **Pros**: Clean code slate, eliminates any legacy clutter, allows building a tailored, premium UI step-by-step as requested by the user.
- **Cons**: Temporary loss of functionality until all features are implemented.
- **Complexity**: Low to Medium.

### Option B: Partial Refactoring of Existing Component
Keep the existing layout and incrementally inject new sections/tabs for templates, schedule assignment, and streaks.
- **Pros**: Retains GSAP transitions and existing fetching logic.
- **Cons**: Restrained by existing structure, might preserve code that doesn't follow newer clean-code/atomic standards, harder to achieve a fresh "wow" premium look.
- **Complexity**: Medium.

## Recommendation
Go with **Option A (Complete Wipe and Rebuild)**. The user explicitly requested to clean the file first to iterate from scratch. This gives us full freedom to design a beautiful, high-fidelity dashboard for the client profile, incorporating glassmorphism, clean layouts, and specific action modals.

## Risks
- **Broken Imports / Functions**: We must ensure all imported services (e.g. `contactsService`, `crmService`, `apiClient`) and modal components (`BookingModal`) are correctly wired.
- **Data Completeness**: If the mock/backend APIs do not return all required fields for streaks, we should handle fallbacks gracefully.

## Ready for Proposal
**Yes**. The exploration is complete. The next step is to create the proposal detailing the new layout architecture and specs.
