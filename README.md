# Kati

An offline-first child immunization tracker built on Nigeria's national schedule.

A parent enters a birth date and gets the full schedule, reminders before every
clinic visit, and a record they can show at the clinic. It replaces the paper
child health card that parents lose — that's the product, and it's the sentence
everything else in here serves.

Built for **RevenueCat Shipaton 2026**, Peace Prize category.
**The app must be live on the App Store by Wed 30 Sep 2026, 11:45pm PDT.**

---

## Start here

**1. Get it running (5 minutes)**

```bash
git clone git@github.com:techbone/kati.git
cd kati
npm install
npm run verify     # typecheck + lint + test — should be green before you change anything
npm start          # then press `i`, or scan the QR with Expo Go for UI-only work
```

> Anything touching RevenueCat needs an **EAS development build**, not Expo Go —
> `react-native-purchases` is a native module. Musa is distributing dev builds.
> You don't need one to start.

**2. Read these three files, in this order** — about fifteen minutes total, and
it will save you a day:

| File | What it tells you |
|---|---|
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | How the app is shaped and *why* it's shaped that way |
| [`docs/TRACKS.md`](docs/TRACKS.md) | Who owns which files, and the PR workflow |
| **`docs/tracks/TRACK-<your letter>.md`** | Your actual job, with acceptance criteria |

**3. Find your track**

| Track | Owner | You own | Your brief |
|---|---|---|---|
| **A — Engine** | Faruq ([@Simplyauf](https://github.com/Simplyauf)) | `src/domain`, `src/data`, `src/store` | [TRACK-A.md](docs/tracks/TRACK-A.md) |
| **B — Surface** | Abdullah ([@abkaaar](https://github.com/abkaaar)) | `src/app`, `src/ui`, `src/hooks` | [TRACK-B.md](docs/tracks/TRACK-B.md) |
| **C — Platform** | Musa ([@techbone](https://github.com/techbone)) | `src/services`, `app.config.ts`, `eas.json`, `assets` | [TRACK-C.md](docs/tracks/TRACK-C.md) |

---

## The four rules

Everything else is negotiable. These aren't.

1. **No backend, no accounts, no network.** All data is in on-device SQLite.
   It's children's health data — this is a design decision, not a shortcut, and
   it's why our App Store privacy label says *data not collected*.
2. **Never guess a dose interval.** Every row in the schedule table cites NPHCDA
   and is checked by a second person before it merges. A wrong interval here is
   real-world harm, not a bug.
3. **Never argue for or against vaccination in any copy.** Kati is a
   record-keeping aid, not medical advice. That disclaimer ships in the app.
4. **Only edit files your track owns.** See [`docs/TRACKS.md`](docs/TRACKS.md).
   If you need something outside your track, ask — don't reach across.

---

## How the code is laid out

```
src/
  contracts/   ← FROZEN. Types only. The shared vocabulary between all three tracks.
  domain/      ← Track A. Pure TypeScript. No React, no Expo, no I/O, no clock reads.
  data/        ← Track A. SQLite: migrations + repositories.
  store/       ← Track A. Zustand. The ONLY thing the UI is allowed to read from.
  services/    ← Track C. Every native side effect, behind an interface.
  ui/, app/    ← Track B. Design system + Expo Router screens.
docs/          ← Architecture, milestones, track briefs, smoke script.
```

The dependency rule, in one line:

```
app / ui  →  store  →  domain  →  contracts
services  →  domain + native modules
```

This is **enforced by ESLint**, not by memory — [`eslint.config.js`](eslint.config.js)
will fail your build if the UI imports from `src/data`, or if domain code imports
React. If a rule fires at you, the fix is almost never to add an exception.

---

## Working agreement

- Branch off `main`: `a/<topic>`, `b/<topic>`, `c/<topic>`.
- `npm run verify` green **before** you open the PR.
- Everyone PRs into `main`, Musa included. CI runs on every change equally.
- Squash merge. Delete the branch. `git pull` before branching again.
- Merge at least once a day. A three-day branch in a nineteen-day project is a
  merge conflict with a countdown on it.

Full detail and the reasoning: [`docs/TRACKS.md`](docs/TRACKS.md).

## Where we are

See [`docs/MILESTONES.md`](docs/MILESTONES.md). The date that actually matters is
**Wed 23 Sep — submit to App Review**, not the 30th. That gives us room to absorb
exactly one rejection.
