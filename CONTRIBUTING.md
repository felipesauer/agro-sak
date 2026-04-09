# Contributing

Thank you for your interest in contributing to Agro SAK.

## Getting Started

```bash
git clone https://github.com/felipesauer/agro-sak.git
cd agro-sak
npm install
npm run dev
```

## Project Structure

```
src/
  core/         # Pure domain logic (calculate/validate functions), zero React
    agronomic/  # 16 modules — liming, gypsum, npk, irrigation, etc.
    financial/  # 16 modules — break-even, crop-profit, payback, etc.
    grain/      #  7 modules — drying-loss, silo-dimensioning, etc.
    operational/# 12 modules — fuel, harvest-cost, machinery, etc.
    tax/        #  2 modules — funrural, itr
    utilities/  #  8 modules — unit-converter, gps-area, tank-mix, etc.
  tools/        # One .tsx per calculator — UI only, imports logic from core/
  components/   # Shared UI components (InputField, ResultCard, etc.)
  data/         # Tool registry and reference data (constants, lookup tables)
  db/           # Dexie IndexedDB layer and reactive hooks
  hooks/        # Shared React hooks (useCalculator, useSEO, etc.)
  utils/        # Pure utility functions (formatters, export-csv)
api/            # Vercel serverless proxy functions
```

## Adding a New Tool

1. **Create the core module** `src/core/<category>/<tool-name>.ts`:
   - Export a typed `Input` and `Result` interface.
   - Export `calculate<Name>(input: Input): Result` — pure function, no React.
   - Export `validate<Name>(input: Input): string | null` — returns error message or null.
2. **Create the test file** `src/core/<category>/<tool-name>.test.ts`:
   - Cover calculate happy path, edge cases, and all validate branches.
   - Target 95%+ branch coverage.
3. **Create the UI** `src/tools/<category>/<ToolName>.tsx`:
   - Import `calculate`/`validate` from the core module.
   - Use `useCalculator` hook with a local `Inputs` interface (string fields for form state).
   - Local `calculate()` wrapper parses strings → numbers → calls core function.
   - Keep all UI/JSX here; **no business logic in .tsx files**.
4. Register it in `src/data/tools.ts` with a unique `id`, `slug`, and `category`.
5. Add the lazy import and route in `src/App.tsx`.

## Architecture Rules

- **Core modules are pure** — no React, no DOM, no side effects, no imports from `src/tools/` or `src/components/`.
- **UI components import from core/** — never duplicate calculation logic in `.tsx` files.
- **Reference data** lives in `src/data/` — imported by both UI and core modules as needed.

## Code Style

- TypeScript strict mode — no `any`.
- Tailwind CSS only — no inline styles or external CSS files.
- No external state management — use `useState`/`useReducer` and the Dexie hooks.
- Format with the project ESLint config (`npm run lint`) before committing.
- Run `npm test` — all 897+ tests must pass.

## Pull Requests

- One logical change per PR.
- Title: `feat: add <slug> tool` / `fix: <short description>` / `chore: <short description>`.
- PRs that add tools must include the core module, tests, and the UI component.
- All existing lint checks and tests must pass.

## Reporting Bugs

Open an issue and include: browser, OS, reproduction steps, and expected vs actual behavior.
