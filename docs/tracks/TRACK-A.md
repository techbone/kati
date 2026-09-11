# Track A — Engine

**Owner: Faruq ([@Simplyauf](https://github.com/Simplyauf))**

You own the part of Kati that has to be *correct*. Everything on screen is
computed by your code from two inputs: the national schedule, and what the
parent recorded. If your layer is right, the app is trustworthy. If it's wrong,
a parent misses a dose.

## You own

```
src/domain/    pure TypeScript — the schedule engine, date maths, reminder planning
src/data/      SQLite: migrations + repositories
src/store/     the Zustand store the UI reads from
```

## You never touch

`src/app`, `src/ui`, `src/hooks` (Abdullah), `src/services` (Musa).
If you need a screen changed, ask Abdullah. If you need a native capability,
ask Musa for the interface.

## The one hard constraint on your layer

**`src/domain/**` must stay pure.** No React, no Expo, no I/O, no `Date.now()`,
no `new Date()` without an argument. Time is always a *parameter*.

ESLint enforces the imports. The clock rule is on you, and it's the one that
matters most: it's what makes "a dose due today", "one day overdue", and "a
child born on 29 February" testable in milliseconds instead of by changing your
phone's system clock.

```ts
// ✗ untestable
function isOverdue(item) { return item.dueDate < new Date(); }

// ✓ every edge case becomes one line of test
function isOverdue(item: ScheduleItem, today: ISODate) { ... }
```

---

## M1 — Sat 12 / Sun 13 Sep

### A1. The schedule table (do this first, and slowly)

Write `src/domain/schedule/nphcda.ts` exporting a `ScheduleDefinition`
(the type is in [`src/contracts/schedule.ts`](../../src/contracts/schedule.ts)).

- Source it from **NPHCDA** (National Primary Health Care Development Agency)
  routine immunization schedule. Put the real URL in `sourceUrl` — it gets
  displayed in-app, so it has to be a link a parent could actually open.
- `version: 'NPHCDA-2024.1'` — bump whenever the table changes.
- `offsetDays` is days from birth. 6 weeks = 42, 10 weeks = 70, 14 weeks = 98,
  9 months = 273. Use the week/month figures the source states, converted
  consistently — don't mix "6 weeks" and "1.5 months".
- Fill in `protectsAgainst` for every dose. It's what makes the detail sheet
  worth reading, and it's two minutes per row while you're already in the source.

> **This table does not merge on your review alone.** Abdullah reads every row
> against the NPHCDA source before approving. That's not distrust, it's the
> control we agreed on for the one thing in this app that can cause harm. Put
> the source link in the PR description so his review is a five-minute job.

Then **delete `src/services/mock/placeholderSchedule.ts`** — it exists only
because your real table didn't yet.

### A2. The engine

In `src/domain/schedule/`:

```ts
computeScheduleItems(child, records, schedule, today): ScheduleItem[]
groupIntoVisits(items): ScheduleVisit[]
computeSummary(items): ScheduleSummary
```

Status resolution, in this exact order:

1. A record exists → its status wins (`given` / `skipped`). A dose given three
   weeks late is still `given`, never `overdue`.
2. `daysUntilDue < 0` → `overdue`
3. `0 <= daysUntilDue <= DUE_WINDOW_DAYS` → `due`
4. otherwise → `upcoming`

Export `DUE_WINDOW_DAYS = 14` from your module. A visit's status is the worst
status across its items, ordered `overdue > due > upcoming > given/skipped`.

### A3. Tests — this is the deliverable, not an afterthought

`jest.config.js` already fails the build under 90% lines / 80% branches on
`src/domain`. Cases that must be covered:

- a dose due exactly today (boundary, both sides)
- one day overdue, and one day inside the due window
- a dose given late — stays `given`
- a dose skipped
- a child born 29 Feb
- a child born today (everything at offset 0 is due)
- a child older than the whole schedule (nothing crashes, everything resolved)
- a birth date in the future (don't crash — decide the behaviour and test it)

Plus a **golden-file test**: the full computed schedule for a fixed birth date
and a fixed `today`, snapshotted. Any future change to the dose table or the
engine shows up as a reviewable diff instead of a silent behaviour change.

```bash
npm run test -- --coverage
```

**Done when:** `npm run verify` green, placeholder deleted, Abdullah approved
the table against source, golden file committed.

---

## M2 — Mon 14 / Tue 15 Sep: the real data layer

SQLite via `expo-sqlite`. Tables: `child`, `dose_record`, `prefs`,
`schema_migrations`. A migration runner that is **safe to re-run** — test that
running it twice is a no-op, because that's what happens on every app launch.

Then implement the real store against
[`src/contracts/store.ts`](../../src/contracts/store.ts) — the same interface
`src/services/mock/mockStore.ts` already satisfies. Writes go
**action → repository → SQLite → set state**, never the reverse.

When yours lands, Abdullah changes one import and the mock dies. If his screens
need more than that one-line change, the contract was wrong — we fix the
contract, not the screens.

---

## Working with your AI on this

Your assistant reads `CLAUDE.md` automatically when you open the repo, which
points it at the architecture and these rules. Worth saying explicitly at the
start of a session:

> I'm on Track A of this repo. Read CLAUDE.md, docs/ARCHITECTURE.md and
> docs/tracks/TRACK-A.md first. I only edit src/domain, src/data and src/store.
> Domain code must stay pure — no React, no Expo, no clock reads, time is always
> a parameter.

Two things to push back on if it suggests them: putting the schedule in the
database (it belongs in version control where it can be diffed), and reading
the current date inside domain functions (it must be injected).

**And do not let it write the dose table from memory.** That's the one task in
this repo where a confident-sounding wrong answer is dangerous. Open the NPHCDA
source, read the rows yourself, type them in.
