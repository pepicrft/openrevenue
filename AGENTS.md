# AGENTS

Guidance for coding agents working in this repo.

## Principles

- Keep changes minimal and focused.
- Prefer TypeScript, Hono, and pnpm.
- Default to Cloudflare-native services (D1 first, KV optional).
- Preserve existing style and file layout.

## Project layout

- `packages/worker`: Cloudflare Worker API (Hono + TypeScript)
- `packages/dashboard`: React dashboard (Vite + Tailwind, shadcn-style components)

## Local commands

```bash
mise install
pnpm install
pnpm -C packages/worker dev
pnpm -C packages/dashboard dev
```

## Conventions

- API endpoints live under `/v1` and must include API key auth.
- Admin endpoints live under `/admin` and require Basic auth if configured.
- Add new endpoints to the README and update `PLAN.md`.
- Do not mock global JS runtime variables in tests. Dependency-inject them into the subject or helpers under test.
- Marketing content is localized. Any copy changes in the marketing page must be mirrored across all locales.

## Tests

- No automated tests yet. If you add tests, document how to run them.
