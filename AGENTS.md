<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Project workflow

- This is a single-package Next.js 16.3.5 App Router project; the application entrypoints are `app/page.tsx`, `app/layout.tsx`, and `app/globals.css`.
- Use npm and the committed `package-lock.json`; install with `npm ci`.
- Available commands are `npm run dev`, `npm run lint`, `npm run build`, and `npm run start`. There is no test script or CI configuration in this repository.
- For focused type checking, run `npx tsc --noEmit`; TypeScript is configured with the `@/*` alias rooted at the repository root.
- `references/pantallas/` contains product/UI reference HTML and screenshots, not application source; its legacy `support.js` currently causes `npm run lint` to report two errors and several warnings.
- Keep Playwright screenshots, logs, and related artifacts under `.playwright-mcp/`; that directory is ignored by git.
- Use Context7 for current framework documentation when Next.js APIs or conventions need verification.


## Spec Driven Development - Skills

- /spec Usaremos esta habilidad para crear las especificaciones.
- /spec-impl esta skill para hacer las implementaciones. 

## Reglas de código

- Usar código limpio, nombres, funciones y variables en inglés