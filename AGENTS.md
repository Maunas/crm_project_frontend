# CRM Project Frontend - Agent Instructions

## Project Overview
CRM project frontend, with React 19 + TypeScript + Vite, MUI v9.1.0, React Router v7, and React Hook Form. Pure Vite SPA — do not use Next.js patterns.

## Commands
```bash
pnpm dev          # Start dev server (port 5173)
pnpm build        # Type-check + production build
pnpm lint         # ESLint (flat config)
pnpm typecheck    # TypeScript check (tsconfig.app.json)
pnpm precheck     # lint + typecheck (run before commits)
pnpm preview      # Preview production build
```

## Key Architecture

### Path Aliases (vite.config.ts / tsconfig.app.json)
```ts
src/*      → ./src/*
features/* → ./src/features/*/
shared/*   → ./src/components/*
assets/*   → ./src/assets/*
```

### Entry Points
- `src/app/main.tsx` - App bootstrap with MUI ThemeProvider
- `src/app/App.tsx` - Router + UserProvider + ToastContainer
- `src/routes.tsx` - Central route config with nested children

### State Management
- **UserContext** (`src/stores/UserContext.tsx`) - Auth, orgs, active org (org id=1 = global dashboard)
- **LeadNavigationContext** (`src/features/lead/stores/LeadNavigationContext.tsx`) - Lead list pagination/selection state

### API Layer
- `src/lib/axios.ts` - Axios instance with:
  - Auto auth headers (access/refresh tokens via `tokenStore`)
  - `X-Organization-Id` header from localStorage `selected_org`
  - Token refresh interceptor with request queuing
- `VITE_API_BASE_URL` env var (default: `http://localhost:8000`)

### Feature Structure
```
src/features/
  auth/           - Login, signup, user services
  lead/           - Lead list, form, details, import
  workspaces/     - Workspace CRUD
  validations/    - Lead field validations
  leadFields/     - Dynamic lead field definitions
  orgProperties/  - Tags, field sections
  nomenclators/   - Reference data
  fieldAutomation/ - Automation rules
  campaigns/      - Campaign details
  dashboard/      - Global/Org dashboards
  search/         - Global search
```

### UI Components Structure
```
src/components/
  layout/container  - Common Containers, Modals, Papers and Sidebars
  ui/
    buttons/        - Common Buttons, IconButtons, Common Icons
    details/        - Components for showing information
    feedback/       - Toasts, Confirmation Dialogs, Loading Screens
    forms/          - Custom Inputs, FormFeedback
    lists/          - Custom icons, pagination and list/table items
    modals/         - Excel Formula Helper, other common modals
```

### Common Patterns
- **Custom hooks** in `src/hooks/` for reusable logic (pagination, modal, loading, debounce, drag-drop)
- **Service files** per feature (`*Service.ts`, `*Services.ts`) for API calls
- **Types** in `src/types/` (shared, leads, leadFields, users, campaigns, etc.)
- **Shared UI** in `src/components/ui/`, layout in `src/components/layout/`
- **Forms**: React Hook Form + MUI components
- **Toasts**: `react-toastify` via `src/utils/feedback.ts` helpers

### TypeScript Config (Strict)
- `strict: true`, `noUnusedLocals/Parameters: true`
- `verbatimModuleSyntax: true`, `erasableSyntaxOnly: true`
- Run `pnpm typecheck` to verify

### ESLint
- Flat config with `typescript-eslint`, `react-hooks`, `react-refresh`
- `react-refresh/only-export-components: off`

### Testing
No test framework configured yet.

## Gotchas
- Dev server uses polling (`usePolling: true`) for Docker/WSL
- Port 5173 is strict (fails if occupied)
- Org id `1` is special (Global Dashboard) - filtered out in UserContext
- Token refresh uses dynamic import to avoid circular deps
- LocalStorage keys: `user`, `selected_org`, `sel_lead_fields`

## Tasks
- After finishing the entire prompt, use the lint and typecheck command, and fix only the alerts corresponding to the modified files, don't touch any other file
- Before creating a new component, or using a Mui component, check if a similar one already exists inside `src/components`. If you need to update them, ask first
- If a task's scope is ambiguous or requires touching more than ~3-4 files, stop and confirm before proceeding
- Always use pnpm, never modify pnpm-lock.yaml manually
- If the change affects UI, mentally verify it against web-design-guidelines before marking the task complete
- User-facing text (labels, buttons, toasts, validation messages), and comments must be in Spanish. Code in English.
- Use the updated MUI 9.1.0 docs before using one of its components, or by using context7 MCP

## Conventions
- Use existing controlled wrappers (ControlledAutocomplete, etc.) instead of wiring raw MUI inputs with register/Controller directly
- API errors surface via the toast helpers in src/utils/feedback.ts — don't add ad-hoc alert() or inline error states unless the pattern doesn't fit.
- Use theme color tokens (`theme.palette`) instead of hardcoded color values. If the color comes from the backend, use the `getColorShades` util
- If there is a line or block of code a JR Developer wouldn't understand easily, leave a short, concise comment in Spanish explaining it, with no emojis

## Dont's
- Don't install new dependencies unless said otherwise. If there is no choice, ask first
- Don't touch the remote repository
- Never use `any` - fix the underlying type or ask.
- Never log or expose access_token/refresh_token values, even in debug output

## Docs
- When you need to search docs, use Context7 if available
- Save a short summary of each change inside a document in the `src/logs` folder, one file per date. If there is already a file for the current date, append it to the end of the document, in UTF-8

## Skills
- **frontend-design**: apply by default when creating or redesigning UI, not only when explicitly requested.
- **web-design-guidelines**: use when accessibility/UX review is requested, or before closing out a new UI feature.
- **vercel-react-best-practices**: apply ONLY the "client-*" and "async-*" rule categories (client-side data fetching, event listeners, localStorage, JS micro-optimizations). Ignore Server Components / RSC / Next.js rules — this project is a Vite SPA with no SSR.