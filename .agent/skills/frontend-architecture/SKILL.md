# Frontend Architecture & Atomic Design Skill

This skill defines the standards for building high-quality, scalable web applications using Next.js, React, and Tailwind CSS.

## 1. Screaming Architecture (Feature-Based)
The codebase should be organized by business domain, not by technical role.
- **`src/features/`**: The core of the application. Each feature (e.g., `auth`, `inventory`, `orders`) should contain its own components, hooks, services, and types.
- **Benefit**: High cohesion and easy navigation. To change "Auth" logic, you only look inside `features/auth`.

## 2. Atomic Design System
Shared UI components located in `src/shared/ui/` must follow the Atomic Design hierarchy:
- **Atoms**: Basic building blocks (Buttons, Inputs, Icons, Typography). They have no dependencies.
- **Molecules**: Groups of atoms working together (Search input + Search button, Form Label + Input).
- **Organisms**: Complex UI sections (Navbar, Dynamic Table, Sidebar, Multi-step Form).
- **Templates/Layouts**: Page structures without specific content.

## 3. Container-Presentational Pattern
Separate logic from UI:
- **Components**: Presentational only. They receive data via `props` and emit events via callbacks. They are "dumb".
- **Hooks/Features**: Containers that handle business logic, API calls, and state management.
- **Rule**: Never put an API call directly inside a UI component in `shared/ui`.

## 4. Service Layer & API Handling
- **Adapters**: Define services in `features/[feature]/services/`. These services should use a shared HTTP client (Axios/Fetch) configured in `core/`.
- **Interceptors**: Use global interceptors for JWT injection and error handling (401 redirection).
- **Type Safety**: Use Zod or TypeScript interfaces to validate and type API responses.

## 5. State Management
- **Local State**: Use `useState` / `useReducer`.
- **Server State**: Use React Query (TanStack Query) for caching and synchronization.
- **Global State**: Use specialized stores (GPX, Signals, or Redux) only if truly necessary for cross-feature communication.

## 6. Formatting & Naming
- **Components**: PascalCase (e.g., `PrimaryButton.tsx`).
- **Hooks**: camelCase with `use` prefix (e.g., `useAuth.ts`).
- **Files**: Use `.tsx` for components and `.ts` for logic.
- **Multi-line Imports**: Follow the project standard (3+ items = multi-line).
