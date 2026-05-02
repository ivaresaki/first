# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
pnpm dev        # start dev server (Turbopack, http://localhost:3000)
pnpm build      # production build (Turbopack)
pnpm start      # start production server
pnpm lint       # run ESLint directly (not `next lint` — that was removed in v16)
```

No test runner is configured yet.

## Architecture

This is a **Next.js 16** App Router project with React 19.2 and Tailwind CSS v4.

- `app/layout.tsx` — root layout: loads Geist fonts, sets `<html>` and `<body>` classes
- `app/page.tsx` — home page (Server Component by default)
- `app/globals.css` — global styles (Tailwind entry point)
- `@/*` path alias resolves to the repo root

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
