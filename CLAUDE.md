@AGENTS.md

# Kati

Offline-first child immunization tracker built on Nigeria's national schedule.
Replaces the paper child health card that parents lose. iOS first, App Store,
RevenueCat Shipaton — Peace Prize category.

**Ship deadline: app live on the App Store by Wed 30 Sep 2026, 11:45pm PDT.**
See `docs/MILESTONES.md`. Submit to App Review on **Wed 23 Sep** — that date is
the real deadline, everything after is rejection buffer.

## Orienting yourself (read this first)

Three people work in this repo on separate tracks, and **you only edit the files
your track owns.** Work out which track you're on before changing anything —
from the current branch prefix (`a/…`, `b/…`, `c/…`), from what the user says, or
by asking them outright. Then read that brief:

| Track | Owner | Owns | Brief |
|---|---|---|---|
| A — Engine | Faruq | `src/domain`, `src/data`, `src/store` | `docs/tracks/TRACK-A.md` |
| B — Surface | Musa | `src/app`, `src/ui`, `src/hooks` | `docs/tracks/TRACK-B.md` |
| C — Platform | Abdullah | `src/services`, `app.config.ts`, `eas.json`, `assets` | `docs/tracks/TRACK-C.md` |

If a task needs a file outside the current track, **stop and say so** rather than
editing it. Cross-track edits cause merge conflicts for two other people who are
mid-change in the same file. The exception is `src/contracts/**`, which is frozen
and needs agreement from all three owners — flag it, don't quietly change it.

Also read `docs/ARCHITECTURE.md` before your first change. It explains *why* the
layering is the way it is, which matters more than the rules themselves.

## Non-negotiables

1. **No backend, no accounts, no network.** All data lives in on-device SQLite.
   This is a privacy decision, not a shortcut — it's children's health data, and
   it makes the App Store privacy labels say "data not collected".
2. **Never guess a dose interval.** Every entry in the schedule table cites
   NPHCDA and is reviewed by a second person before merge. A wrong interval here
   is real-world harm, not a bug.
3. **Never argue for or against vaccination in copy.** The app is a
   record-keeping aid, not medical advice. That disclaimer ships in-app.
4. **Never geo-restrict the App Store listing.** Judges download from the US.

## Layering

```
src/app, src/ui   →  store  →  domain  →  contracts
src/services      →  domain (pure) + native modules
```

- `src/contracts/**` — types only. **Frozen.** A change needs all three owners.
- `src/domain/**` — pure TypeScript. No React, no Expo, no I/O. Runs in plain Jest.
- `src/data/**` — SQLite. A leaf: imports nothing from ui/services.
- `src/store/**` — the only seam between UI and data.
- `src/services/**` — every native side effect, behind an interface in `contracts/services.ts`.
- `src/ui`, `src/app` — never import from `@/data` or `@/domain`.

These rules are enforced by `no-restricted-imports` in `eslint.config.js`. If one
fires, the fix is almost never to add an exception.

## Before you push

```bash
npm run verify     # typecheck + lint + test — must be green
```

Nothing merges to `main` red — CI enforces it on every PR. See `docs/TRACKS.md`
for ownership and merge rules, `docs/SMOKE.md` for the on-device regression
script, and `docs/MILESTONES.md` for what's due when.

## Conventions

- No `any`. No `@ts-expect-error` without a one-line reason on the same line.
- Dates are calendar dates in local time (`ISODate`, `YYYY-MM-DD`), never UTC
  instants. Always go through `src/domain/date`.
- Branded IDs (`ChildId`, `DoseId`) — construct with the `as*` helpers, never cast.
- Branches: `a/<topic>`, `b/<topic>`, `c/<topic>`. Commits: `feat(scope):`, `fix(scope):`.
