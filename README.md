# first — Next.js 16 + Firebase Auth

[![CI](https://github.com/ivaresaki/first/actions/workflows/ci.yml/badge.svg)](https://github.com/ivaresaki/first/actions/workflows/ci.yml)
[![Integration Tests](https://github.com/ivaresaki/first/actions/workflows/integration.yml/badge.svg)](https://github.com/ivaresaki/first/actions/workflows/integration.yml)

A [Next.js 16](https://nextjs.org) learning project with Firebase Authentication, Tailwind CSS v4, and a full Vitest test suite.

## Features

- `/login` — email/password login with Firebase Auth, remember me, and password visibility toggle
- Vitest unit, hook, and component tests
- Firebase Auth emulator for integration tests

## Getting started

Copy the environment file and fill in your Firebase project values:

```bash
cp .env.local.example .env.local   # then edit with your Firebase config
pnpm install
pnpm dev
```

Open [http://localhost:3000/login](http://localhost:3000/login).

## Commands

| Command | Description |
|---|---|
| `pnpm dev` | Start dev server (Turbopack) |
| `pnpm build` | Production build |
| `pnpm lint` | Run ESLint |
| `pnpm test:run` | Run unit/hook/component tests (44 tests) |
| `pnpm test` | Run tests in watch mode |
| `pnpm test:integration` | Run Firebase emulator integration tests |

## Integration tests

Requires the [Firebase CLI](https://firebase.google.com/docs/cli) and Java 17+.

```bash
firebase emulators:start --only auth   # in one terminal
pnpm test:integration                  # in another
```
