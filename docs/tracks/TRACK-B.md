# Track B — Surface

**Owner: Abdullah ([@abkaaar](https://github.com/abkaaar))**

You own everything a judge and a parent actually see. The Peace Prize is scored
on impact, but a panel forms its opinion in the first fifteen seconds of the
demo video — and that's your work.

Two audiences, same screens: a parent in a clinic queue holding a baby in one
arm, and a judge scrolling a submission list. Both need it legible at a glance.

## You own

```
src/app/      Expo Router screens (routes stay thin)
src/ui/       design system: theme tokens + reusable components
src/hooks/    view-level hooks
```

## You never touch

`src/domain`, `src/data`, `src/store` (Faruq), `src/services` (Musa).

## You are not blocked on anyone

This is the whole point of how the repo is set up. You build against
[`src/contracts/store.ts`](../../src/contracts/store.ts), running on
`src/services/mock/mockStore.ts` — a working in-memory store that already
satisfies the real interface.

```ts
import { useMockStore } from '@/services/mock/mockStore';

const children = useMockStore((s) => s.children);
const addChild = useMockStore((s) => s.addChild);
```

When Faruq's real store lands in M2, you change that import to `@/store` and
**nothing else**. If a screen needs more than that one-line change, the contract
was wrong — say so, and we fix the contract rather than bending your screen.

ESLint will stop you importing from `@/data` or `@/domain`. That's deliberate:
the store is your only data source.

---

## M1 — Sat 12 / Sun 13 Sep

### B1. Theme tokens → `src/ui/theme/`

Colour (light **and** dark), a type scale, spacing, radii. Pull every value
from tokens, never hardcode a hex or a magic number in a screen.

Two constraints that are cheap now and expensive to retrofit:

- **Dynamic Type.** Use `useWindowDimensions` + scalable font sizes. A parent
  who has set large text must be able to read this. It's also an accessibility
  point a judge can check in ten seconds.
- **Dark mode from the start.** Every token defined in both schemes. Adding it
  in M5 means touching every screen twice.

### B2. Primitives → `src/ui/components/`

`Screen` (safe areas + scroll), `Text`, `Button`, `Card`, `Pill` (the status
badge — given / due / overdue / upcoming), `EmptyState`, `Sheet`.

Build these before screens. Every hour here saves three later.

### B3. First screens

- **Onboarding** → add a child: name, birth date, sex. Date picker is
  `@react-native-community/datetimepicker`, already installed.
- **Home** — the one that matters. The visit timeline, **grouped by clinic
  trip**, not a flat list of doses. A parent thinks "when do I next go", not
  "when is PCV 2 due". `ScheduleVisit` in the contracts is already shaped for
  this: one card per visit, with the doses inside it.
- A **next visit hero** at the top: what's next, when, how many doses.

Verify on **iPhone SE and Pro Max widths** before you open the PR. Nothing
clipped, nothing scrolling sideways.

**Done when:** `npm run verify` green, both widths checked, demo path
(launch → add child → see the timeline) works end to end on the mock store.

---

## Also yours: reviewing the schedule table

Faruq's M1 PR contains the NPHCDA dose table. **You are the second pair of
eyes** — open the source link in his PR description and check every row against
it before approving.

It's a five-minute job and it's the single most important review in this
project. Everything else we can patch after launch. A wrong dose interval
reaches a real parent.

---

## Later

- **M2** — dose detail sheet, mark-given with a date picker (defaults to today,
  must allow past dates), mark-skipped, undo, child switcher, settings.
- **M3** — the record card: the clinic-showable artifact. Print-shaped, dense,
  every given dose with its date. This is the screenshot that sells the app.
- **M4** — paywall screen and the gating UI. Gates are exactly three:
  more than one child, PDF export, backup.
- **M5** — polish: empty states, VoiceOver labels on every interactive element,
  haptics, Reanimated transitions on the timeline.

---

## Working with your AI on this

It reads `CLAUDE.md` automatically. Worth opening a session with:

> I'm on Track B of this repo. Read CLAUDE.md, docs/ARCHITECTURE.md and
> docs/tracks/TRACK-B.md first. I only edit src/app, src/ui and src/hooks.
> I read data only from the store contract — currently
> src/services/mock/mockStore.ts — never from src/data or src/domain.

If it starts reaching into `@/domain` to compute a due date, stop it — that
value comes from the store's selectors. And keep it honest about Expo SDK 57:
`AGENTS.md` tells it to check the versioned docs, because a lot of RN answers
it knows are for older versions.
