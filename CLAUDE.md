# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
pnpm dev             # start dev server (Turbopack, http://localhost:3000)
pnpm build           # production build (Turbopack)
pnpm start           # start production server
pnpm lint            # run ESLint directly (not `next lint` — that was removed in v16)
pnpm test            # unit/component tests in watch mode (jsdom)
pnpm test:run        # unit/component tests, one-shot (used in CI)
pnpm test:integration  # Firebase Auth emulator tests (requires emulator — see below)
```

Run a single test file:
```bash
pnpm test path/to/file.test.tsx
```

Integration tests need the Firebase Auth emulator running. The easiest way is via `firebase-tools`:
```bash
npx firebase-tools emulators:exec --only auth --project nextjs-firebase-app-1ff04 "pnpm test:integration"
```

## Architecture

This is a **Next.js 16** App Router project with React 19.2, Tailwind CSS v4, and Firebase Authentication.

- `app/layout.tsx` — root layout: loads Geist fonts, sets `<html>` and `<body>` classes
- `app/page.tsx` — home page (Server Component by default)
- `app/globals.css` — global styles (Tailwind entry point)
- `@/*` path alias resolves to the repo root

### Feature layer pattern

Features are split into three layers (the login feature is the canonical example):

- `lib/` — pure functions with no React or Firebase state: validation (`lib/validation.ts`), error-code mapping (`lib/authErrors.ts`)
- `hooks/` — `'use client'` hooks that own state and call Firebase: `hooks/useLogin.ts` receives an `Auth` instance as a parameter so it can be tested with a mock/emulator auth object
- `components/` — rendering only; imports the hook and lib, no business logic

### Firebase

`lib/firebase.ts` exports a singleton `auth` instance. It conditionally connects to the local Auth emulator when `NEXT_PUBLIC_USE_FIREBASE_EMULATOR=true` (set in `.env.test`). Production uses the real Firebase project.

Integration tests in `__integration__/` initialize a *separate* named Firebase app (`'integration-test'`) to avoid conflicting with the `lib/firebase.ts` singleton. They run in a Node environment (`vitest.integration.config.mts`) while unit/component tests run in jsdom (`vitest.config.ts`).

## Next.js 16 Breaking Changes to Know

This version has significant differences from Next.js 14/15. Read `node_modules/next/dist/docs/` before writing code.

**Async-only request APIs** — synchronous access is fully removed. Always `await` these:
```ts
const cookieStore = await cookies()
const headersList = await headers()
const { slug } = await params        // in page/layout props
const query = await searchParams     // in page props
```
Run `npx next typegen` to generate `PageProps`/`LayoutProps`/`RouteContext` helpers.

**`middleware` → `proxy`** — rename `middleware.ts` to `proxy.ts`, rename the export to `proxy`. The edge runtime is not supported in proxy files; keep using `middleware.ts` if you need edge.

**`revalidateTag` requires a second argument** — the `cacheLife` profile:
```ts
revalidateTag('posts', 'max')   // was: revalidateTag('posts')
```

**`next lint` removed** — use `eslint` directly (already reflected in `package.json`).

**`next build` no longer runs linting** — lint must be run as a separate step.

**PPR changed** — `experimental.ppr` is gone. Use `cacheComponents: true` in `next.config.ts` instead, and read the [migrating-to-cache-components](node_modules/next/dist/docs/01-app/02-guides/migrating-to-cache-components.md) guide before adopting it.

**Instant navigation** — `<Suspense>` boundaries alone are not enough for instant client-side navigations. Also export `unstable_instant` from the route. Read `node_modules/next/dist/docs/01-app/02-guides/instant-navigation.md`.

**`serverRuntimeConfig`/`publicRuntimeConfig` removed** — use environment variables.

**`next/image` with local query strings** — requires `images.localPatterns.search` config.

**Scroll behavior** — Next.js no longer overrides `scroll-behavior` during navigation. Add `data-scroll-behavior="smooth"` to `<html>` if the previous behavior is needed.

**Turbopack is now the default** for both `next dev` and `next build`. Custom `webpack` config in `next.config.ts` will cause build failures unless you pass `--webpack`.
