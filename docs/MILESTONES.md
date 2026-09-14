# Milestones

**Hard deadline:** app live on the App Store and Devpost submitted by
**Wed 30 Sep 2026, 11:45pm PDT** (≈ 7:45am Thu 1 Oct in Abuja — do not plan
around those hours).

**The date that actually matters is Wed 23 Sep — submit to App Review.** Review
usually takes 1–3 days. Submitting on the 23rd means we can absorb one full
rejection and still land. Submitting on the 26th means one rejection ends the
hackathon.

Each milestone is done when: `npm run verify` is green on `main`, `docs/SMOKE.md`
passes on a real device, and the tag is pushed.

---

## M0 — Fri 11 Sep · Foundation ✅

Expo SDK 57 / RN 0.86 / React 19, TypeScript strict, Expo Router, Jest,
ESLint with the layering rules enforced, frozen contracts, mock store, EAS
profiles, typed app config.

**Exit:** `npm run verify` green · dev build installed on all three phones.

> ⚠️ The development build is M0 work, not later work. `react-native-purchases`
> is a native module and does not run in Expo Go. Nobody can see a paywall until
> this exists. **Abdullah: start the EAS build today.**

---

## M1 — Sat 12 – Sun 13 Sep · Engine and skin, in parallel

**A (Faruq) — the schedule, done properly**
- Source the full routine schedule from NPHCDA. Cite it. **Musa reviews every
  row against the source before merge** — two pairs of eyes, no exceptions.
- `src/domain/schedule/nphcda.ts` as a `ScheduleDefinition`.
- `computeScheduleItems` / `groupIntoVisits` / `computeSummary`, pure, `today`
  injected.
- Tests: due today, one day overdue, given late, skipped, leap-year birth date,
  future birth date, child older than the whole schedule.
- **Golden-file test**: full computed schedule for a fixed birth date and fixed
  today, snapshotted. Any change to the dose table shows up as a reviewable diff.
- Delete `services/mock/placeholderSchedule.ts`.

**B (Musa) — the design system and the first screens**
- Theme tokens: colour (light + dark), type scale on Dynamic Type, spacing, radii.
- Primitives: `Screen`, `Text`, `Button`, `Card`, `Pill`, `EmptyState`, `Sheet`.
- Onboarding → add child (name, birth date, sex) → home.
- Home: visit timeline grouped by clinic trip, status pills, next-visit hero.
- All on `useMockStore`. Verified on iPhone SE and Pro Max widths.

**C (Abdullah) — the platform**
- EAS project init, dev build on all three devices.
- App Store Connect: app record, bundle ID `com.kati.app`, subscription product,
  **7-day free trial** (the rules require a trial or a judge promo code).
- RevenueCat: project, entitlement `kati_plus_pro`, offering, products linked.
- Privacy policy page live at a real URL.
- `NotificationService` interface implemented against Expo, permission flow only.

**Tag `m1-done`.**

---

## M2 — Mon 14 – Tue 15 Sep · Real data

**A** — SQLite migration runner, `child` / `dose_record` / `prefs` /
`schema_migrations` tables, repositories, real Zustand store implementing
`AppStore`. Migration runner tested for re-run safety.

**B** — Dose detail sheet, mark-given with date picker, mark-skipped, undo,
child switcher, settings screen.

**C** — Real notification scheduling, permission denied/undetermined states,
foreground re-sync, diagnostics screen showing the scheduled count.

**Tag `m2-done`.**

---

## M3 — Wed 16 – Thu 17 Sep · Integration 1 — the mock dies

The riskiest day. Track B switches from `useMockStore` to the real store.
Everyone is on real data from here.

**A** — `planReminders`, pure and capped at 48, with tests for the cap ordering.
Selector memoisation.
**B** — The record card screen: the clinic-showable artifact. Print-shaped layout.
**C** — `ExportService`: `buildHtml` + `expo-print` → PDF → share sheet.
Snapshot-test the HTML.

**Exit:** `services/mock/mockStore.ts` deleted. Full smoke on device.
**Tag `m3-done`.**

---

## M4 — Fri 18 – Sat 19 Sep · Money

**A** — Backup export/import as JSON, with validation on import.
**B** — Paywall screen, gating UI, restore-purchases entry point in settings.
**C** — RevenueCat SDK wired, entitlement listener, sandbox purchase tested
end-to-end on device, restore tested, trial verified.

Gates: >1 child, PDF export, backup. Nothing else.

**Tag `m4-done`.**

---

## M5 — Sun 20 – Mon 21 Sep · Polish and hardening

Empty states, loading states, error states. Dynamic Type at largest size.
VoiceOver labels on every interactive element. Haptics. Reanimated transitions
on the timeline. Custom font. The in-app disclaimer and NPHCDA source citation.
Full regression pass on all three devices.

**Tag `m5-done`.**

---

## M6 — Tue 22 Sep · Store assets and release build

1024×1024 icon. Screenshots at 1179×2556, no device frame. App description with
the Peace Prize impact paragraph. Privacy labels: data not collected. Production
build, TestFlight, all three of us install and run smoke from TestFlight.

**Tag `m6-done`.**

---

## 🚩 Wed 23 Sep · SUBMIT TO APP REVIEW

Hard gate. If we are not submitting on the 23rd, we cut scope, not the date.
Cut in this order: backup → animations → child photo → dark mode refinement.

---

## Thu 24 – Sat 26 Sep · Buffer and the video

Demo video: under 2 minutes, public on YouTube or Vimeo, app running on a real
device. Budget a full day — it always takes longer than people expect.
Devpost write-up, including the Peace Prize impact description, which is the
thing being judged as much as the app.

If the app gets rejected, this is the window that saves us.

## Sun 27 Sep · Devpost submitted, app live

Four days early. The remaining days are for the rejection we hope we don't get.

---

## Standing risks

| Risk | Mitigation |
|---|---|
| Wrong dose interval ships | Two-person review of every schedule row; golden-file test |
| Rejection on the 24th | Submit on the 23rd; buffer to the 30th |
| RevenueCat native module surprises | Dev build on day 0, sandbox purchase by M4 |
| iOS 64-notification cap loses reminders | Planner capped at 48, re-synced on foreground |
| Three-way merge conflict | Frozen contracts, strict file ownership, daily merges |
| Demo video underestimated | A whole day budgeted, scripted before it is filmed |

## Optional, only if we are ahead on Mon 21 Sep

OneSignal category — $25,000, needs a live app, the SDK integrated, and one
campaign deployed. It cuts against the local-only design and adds a privacy
label. **Take it only if M5 finished early.** Do not trade the ship date for it.
