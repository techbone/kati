# Track C — Platform

**Owner: Abdullah ([@abkaaar](https://github.com/abkaaar))**

You own everything between the code and the App Store, plus every native side
effect. Your track has the least code and the most risk, because most of it
can't be rushed at the end: Apple review, RevenueCat sandbox, and notification
permissions all have their own clocks.

## You own

```
src/services/    notifications, purchases, export, backup — native side effects
app.config.ts    Expo config, bundle ID, plugins
eas.json         build + submit profiles
assets/          icon, splash, notification icon, store screenshots
```

Plus everything only you can do: EAS builds, App Store Connect, RevenueCat
dashboard, TestFlight, submission.

## You never touch

`src/domain`, `src/data`, `src/store` (Faruq), `src/app`, `src/ui` (Musa).

## The shape of your layer

Every native capability sits behind an interface in
[`src/contracts/services.ts`](../../src/contracts/services.ts). You write the
real implementation; a mock satisfies the same interface so the other two never
need your native module to build or test.

```
NotificationService · PurchaseService · ExportService · BackupService
```

Keep the logic *out* of these. "Which reminders should exist" is a pure function
in Faruq's domain layer; your service just takes the plan and schedules it. That
split is what makes the notification logic testable without a device.

---

## Today — Fri 11 Sep, blocking everyone

These three gate other people's work. Nothing else you do today matters as much.

### C0. Confirm you actually hold the accounts

Before anything else, check you have — not "can get" — these three:

- **Apple Developer Program**, enrolled, with the Paid Apps agreement signed and
  banking and tax forms complete. Without the agreements, in-app purchase
  products cannot go live no matter what the code does.
- **App Store Connect** access at App Manager level or above.
- **RevenueCat** account.

If any of these sits with Musa instead, sort the access transfer *this morning* —
he adds you in App Store Connect under Users and Access. Apple's account plumbing
is the one thing on this project that moves at its own pace and cannot be
compressed by working harder.

### C1. EAS dev build on all three phones

```bash
npm install -g eas-cli
eas login
eas init
npm run dev:build        # eas build --profile development --platform ios
```

`react-native-purchases` is a native module — **it does not run in Expo Go**.
Until this build exists, nobody can see a paywall. Faruq and Musa can work
without it (domain tests and UI run fine in Expo Go), but it must land before M4.

Register all three devices' UDIDs while you're in there, or you'll do the whole
dance again on the 18th.

### C2. App Store Connect record

Create the app. **Confirm the bundle ID** — [`app.config.ts`](../../app.config.ts)
currently says `com.kati.app`. If ASC needs something different, change it
*before* the first build, not after.

Do not geo-restrict the listing. Judges download from the US; a Nigeria-only
listing is an instant zero.

### C3. Subscription product with a 7-day free trial

Shipaton rules require either a free trial or a promo code for judges. A trial is
cleaner and it's a five-minute config now versus a retrofit later.

Then RevenueCat: project, entitlement **`kati_plus_pro`**, offering, products linked.

---

## M1 — this weekend

- `NotificationService` implemented against `expo-notifications`: permission
  request, the granted / denied / undetermined states, and `getScheduledCount()`
  for the diagnostics screen.
- A **privacy policy at a real, live URL**. App Store Connect requires it and it
  blocks submission. Ours is genuinely short — we collect nothing.

## M3 — the export

`ExportService.buildHtml()` is a **pure string function** — snapshot-test it, and
you can iterate on the PDF layout without a device or a rebuild. Then
`expo-print` renders it and `expo-sharing` opens the share sheet.

This is the clinic-showable artifact. It's the product, not a feature — give it
the time it deserves.

## M4 — RevenueCat wired

SDK init, entitlement listener, sandbox purchase tested end to end on a real
device, restore-purchases tested after a delete-and-reinstall. Both paths get
demoed to a judge; both need to actually work.

---

## Play Store + Android RevenueCat

Same product, second store. Package id stays **`com.kati.app`**.

### Code / EAS (already in repo)

- [`app.config.ts`](../../app.config.ts): `android.versionCode`, dual keys
  `revenueCatApiKeyIos` / `revenueCatApiKeyAndroid`.
- Purchase service picks `appl_…` vs `goog_…` by `Platform.OS`.
- [`eas.json`](../../eas.json) `submit.production.android`: internal track, draft
  release. Do **not** commit the Google service-account JSON — use
  `eas submit` / EAS credentials when ready.

### Your checklist (Play Console / Cloud / RC)

1. Create the Play app with application id `com.kati.app`.
2. Store listing, content rating, Data safety; privacy + terms:
   - `https://techbone.github.io/kati/privacy.html`
   - `https://techbone.github.io/kati/terms.html`
3. Create Play Billing products: Monthly, Yearly (7-day trial), Lifetime —
   product ids aligned with iOS / RevenueCat packages.
4. Add license-tester Gmail accounts for purchase testing.
5. Google Cloud service account with Play Developer API access (EAS Submit +
   RevenueCat).
6. RevenueCat → add **Google Play** app; paste Play credentials; link Android
   products to entitlement **`kati_plus_pro`** and the same offering/paywall
   (include Lifetime).
7. EAS secrets: `EXPO_PUBLIC_REVENUECAT_API_KEY_IOS` (`appl_…`) and
   `EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID` (`goog_…`) on production.

### Build / submit

```bash
eas build -p android --profile development
eas build -p android --profile production
eas submit -p android --profile production
```

Smoke: Settings → Upgrade → Monthly / Yearly / Lifetime; purchase + restore on a
license-tester account.

---

## The notification trap

iOS keeps only the **64 soonest** pending local notifications and silently drops
everything past that. An immunization schedule runs two years — a naive
"schedule them all" loses the later reminders with no error and no warning.

The architecture already handles this and you should keep it that way:

```ts
planReminders(...)  → ReminderPlan   // Faruq's, pure, capped at 48
service.sync(plan)                    // yours: cancel everything, schedule the plan
```

`sync` runs on app foreground and after every mutation. Cancel-all-then-schedule
is idempotent — no diffing, nothing to drift out of step. Smoke step 10 exists
specifically to catch a regression here.

---

## Working with your AI on this

> I'm on Track C of this repo. Read CLAUDE.md, docs/ARCHITECTURE.md and
> docs/tracks/TRACK-C.md first. I only edit src/services, app.config.ts,
> eas.json and assets. Services implement the interfaces in
> contracts/services.ts — logic belongs in the domain layer, not in a service.

Expo SDK 57 is recent enough that a lot of remembered answers are stale —
`AGENTS.md` tells it to check the versioned docs, and it's worth holding it to
that for `expo-notifications` in particular, which has changed shape.
