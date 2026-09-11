# Architecture

## The one-line version

SQLite holds what the parent did. Code holds what the national schedule says.
Everything on screen is computed from those two by pure functions.

## Why it's shaped this way

The schedule is a fixed table — it belongs in version control where it can be
diffed and reviewed, not in a database where a migration could silently corrupt
it. The parent's records are mutable and personal — those belong in SQLite.
Keeping them apart means the riskiest logic in the app (when is a dose due, is
it overdue) is a pure function of two inputs and a date, which is exactly what
you can cover with fast tests and trust under a deadline.

## Layers

| Layer | Path | Rule |
|---|---|---|
| Contracts | `src/contracts` | Types only. Frozen. The shared vocabulary. |
| Domain | `src/domain` | Pure. No React, Expo, I/O, or `Date.now()` — time is a parameter. |
| Data | `src/data` | SQLite: migrations + repositories. A leaf. |
| Store | `src/store` | Zustand. The only thing UI is allowed to read from. |
| Services | `src/services` | Native side effects behind interfaces. |
| UI | `src/ui`, `src/app` | Expo Router screens + design system. |

Enforced by ESLint, not by memory. See `eslint.config.js`.

## State

One Zustand store holding **all** data in memory, mirroring SQLite.

The dataset is tiny — a handful of children and ~30 dose records each. Holding
it all in memory removes an entire category of cache-invalidation bug, which is
worth more than the memory. Writes go: action → repository → SQLite → set state.
Never the reverse.

Derived data (`ScheduleItem[]`, `ScheduleVisit[]`, `ScheduleSummary`) is never
stored. It is computed by pure selectors over `AppState` + the schedule
definition + today's date. Selectors are memoised on
`(childId, recordsVersion, today)`.

## The schedule engine

```ts
computeScheduleItems(child, records, schedule, today) → ScheduleItem[]
```

Pure, total, deterministic. `today` is always passed in, never read from the
clock, so every edge case is directly testable: a dose due today, a dose one day
overdue, a child born on 29 February, a birth date in the future.

Status resolution, in order: an existing record wins (`given` / `skipped`);
otherwise `overdue` if the due date has passed, `due` inside the due window,
`upcoming` beyond it.

## Notifications

iOS keeps only the **64 soonest** pending local notifications and silently drops
the rest. An immunization schedule runs two years, so a naive
"schedule everything" loses the later reminders with no error.

The fix is to treat the scheduled set as derived state, exactly like the UI:

```ts
planReminders(children, records, schedule, prefs, now) → ReminderPlan   // pure, capped at 48
notificationService.sync(plan)                                          // cancel all, schedule plan
```

`sync` runs on app foreground and after every mutation. It is idempotent —
cancel everything, schedule the plan. No diffing, nothing to get out of step.
The planner is pure, so "which reminders should exist" is unit-tested without
touching a device.

## Purchases

RevenueCat behind `PurchaseService`. Entitlement `kati_plus` gates exactly three
things, listed in `contracts/store.ts`: more than one child, PDF export, backup.

`react-native-purchases` is a native module — **it does not run in Expo Go**.
Everyone needs an EAS development build before they can see a paywall. That is
M0 work, not week-two work.

A `MockPurchaseService` satisfies the same interface so UI and tests never need
the native module or a sandbox account.

## Export

`expo-print` renders an HTML template to PDF, `expo-sharing` opens the share
sheet. `buildHtml()` is a pure string function, so the template is snapshot-
tested and you can iterate on it without a device. This is the clinic-showable
artifact — it is the product, not a feature.

## What we deliberately left out

No sync, no auth, no push server, no analytics SDK, no iPad, no Android release.
Each of those costs days and none of them wins the Peace Prize category.
