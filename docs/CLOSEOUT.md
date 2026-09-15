# Close-out plan — Tue 15 Sep → Wed 30 Sep

**Where we are:** M0–M3 done. The app persists, runs the reviewed NPHCDA
schedule, plans and schedules reminders, exports a PDF, and gates Plus through
RevenueCat. Tracks B and C ran ahead; Track A caught up in one push. Nothing
architectural is left.

**What's left is not code.** It's polish, store assets, a listing, a video, and
two written paragraphs that are literally what the judges score. Everything
below is scheduled so that **Wed 23 Sep is submit day, not build day.**

Rules for the last week: merge daily · smoke on a fresh install after every
merge · nobody starts anything new after Sat 20 · cut scope, never the date.

---

## Musa — Track B + lead

| When | Do |
|---|---|
| **Tue 15** | Merge #11 (M3). Full `docs/SMOKE.md` on the dev build, fresh install. Fix what fails. Decide the two things only the lead can: **team Representative** for the prize (in writing, with the split), and **price** (see Decisions). |
| **Wed 16 – Thu 17** | M5 polish, the Design Award pass: VoiceOver label on every interactive element · Dynamic Type at the largest size on every screen · Reanimated transitions on the timeline and sheets · haptics audit · empty/error states · tap the schedule citation → opens the source · disclaimer placement · iPhone SE pass on the simulator. |
| **Fri 18** | Screenshots: 1179×2556, no device frame, from the iPhone 16/17 Pro simulator — home, dose sheet, record card, settings. App Store description. **The Peace Prize paragraph and the Design Award paragraph** — draft them, then Faruq reads them cold. |
| **Sat 19 – Sun 20** | Demo video. Script it first, then record on a real phone. Under two minutes, public on YouTube. The 40-second core: add child → schedule → mark given → record card → share PDF. Budget the whole weekend; it always takes longer. |
| **Mon 22 – Tue 23** | TestFlight smoke on the release build. Submit Wednesday. |

## Faruq — Track A

| When | Do |
|---|---|
| **Tue 15** | Review and approve #11. |
| **Wed 16 – Thu 17** | **Backup helpers** (your M4 item, the last blocked feature): pure `serializeBackup(children, records, prefs) → string` and `validateBackup(json) → parsed \| error`. Round-trip tested, multi-child, rejects garbage without throwing. Abdullah builds the file I/O on top. |
| **Fri 18** | Golden file stays green through any polish. If Musa's WHO check gave a deep link, swap `sourceUrl` to it. Then: second phone for smoke — you run the script on yours, independently. |
| **Sat 19 →** | Bug-fix from smoke. **Read Musa's Peace Prize and Design Award paragraphs cold** — you're the reviewer who isn't the author. |

## Abdullah — Track C

| When | Do |
|---|---|
| **Tue 15** | `git pull main` (non-negotiable, you're three merges behind). Dev build with M3. **Publish a paywall template** for the `default` offering in the RevenueCat dashboard. **Sandbox tester Apple IDs** for all three of us. Register the friend's UDID or skip him for TestFlight. |
| **Wed 16** | **App Store Connect listing**, all of it: name, subtitle, category (Medical), keywords, support URL, **privacy policy URL live**, age rating, **privacy labels: data not collected**, **availability: all countries** (judges are in the US — this is a disqualifier), subscription live with the **7-day trial**, Paid Apps agreement confirmed active. |
| **Thu 17** | `BackupService` on Faruq's helpers: write JSON to a file, share sheet, import from Files with validation. Swap the RevenueCat key from Test Store to the **App Store key** for release builds (your own comment in `app.config.ts`). |
| **Fri 18** | **Icon** 1024×1024, notification icon, splash — replace every Expo default in `assets/`. `eas build --profile production` → `eas submit` → **TestFlight**. All three of us install from TestFlight and run smoke. |
| **Sat 19 – Mon 22** | Rebuild and re-push to TestFlight as fixes land. Write the **App Review notes**: no login, how to reach the paywall, sandbox works, trial is live. |
| **Tue 22** | Final production build, everyone smokes it. |
| **Wed 23** | **Submit for review.** |

---

## After submit — Thu 24 → Wed 30

- **Thu 24 – Sat 26** — buffer for one rejection. Video final cut. Devpost fields filled in a draft.
- **Sun 27** — Devpost submitted. App live. Three days early, on purpose.
- **Mon 28 – Wed 30** — slack. Respond to App Review if it comes back.

## Decisions the lead makes this week

1. **Representative.** One name, and the split, written down before there's money to argue about.
2. **Price.** Live sandbox shows $9.99 / $79.99 / $99.99. That's a Western SaaS price for a record-keeping aid aimed at Nigerian parents, and a Peace Prize judge will see it. Recommend the mock's numbers: **$2.99/mo, $19.99/yr, $49.99 lifetime** — still real revenue, doesn't undercut the impact story. Abdullah changes it in App Store Connect; nothing in the app changes.
3. **The friend.** TestFlight on Fri 18, not the dev build. Same answer for anyone else who asks.
4. **OneSignal category.** No. It pulls against local-only, adds a privacy label, and the $25k isn't worth the risk to the category we can actually win.

## Cut order, if Mon 22 arrives and we're behind

Backup → animations → child photo (never started) → dark-mode refinement.
Never: the schedule, persistence, the record card, the PDF, the trial.

## Submission checklist (Devpost)

- [ ] App live on the App Store, available in the US
- [ ] Free trial live (or promo code in the entry)
- [ ] 1024×1024 icon
- [ ] ≥1 screenshot at 1179×2556, no frame
- [ ] Demo video < 2 min, public YouTube/Vimeo, real device
- [ ] Peace Prize paragraph: how it benefits individuals / community / society
- [ ] Design Award paragraph: unique design elements, what to look for
- [ ] RevenueCat integration (it is)
- [ ] Representative named
