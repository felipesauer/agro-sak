# Contributing

Thank you for your interest in contributing to Agro SAK.

## Getting Started

```bash
git clone https://github.com/your-org/agro-sak.git
cd agro-sak
npm install
npm run dev
```

## Project Structure

```
src/
  tools/        # One file per calculator, grouped by category
  components/   # Shared UI components
  data/         # Tool registry and reference data
  hooks/        # Shared React hooks
  utils/        # Pure utility functions
api/            # Vercel serverless proxy functions
```

## Adding a New Tool

1. Create `src/tools/<category>/<ToolName>.tsx` — export a default React component.
2. Register it in `src/data/tools.ts` with a unique `id`, `slug`, and `category`.
3. Add the lazy import and route in `src/App.tsx`.
4. Keep all logic inside the component file unless shared across multiple tools.

## Code Style

- TypeScript strict mode — no `any`.
- Tailwind CSS only — no inline styles or external CSS files.
- No external state management — use `useState`/`useReducer` and the Dexie hooks.
- Format with the project ESLint config (`npm run lint`) before committing.

## Pull Requests

- One logical change per PR.
- Title: `feat: add <slug> tool` / `fix: <short description>` / `chore: <short description>`.
- PRs that add tools must include a screenshot of the tool rendering correctly.
- All existing lint checks must pass.

## Reporting Bugs

Open an issue and include: browser, OS, reproduction steps, and expected vs actual behavior.
