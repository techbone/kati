# Smoke script

Run on a real device after every merge to `main`, and in full at every milestone
boundary. Takes about six minutes. Report pass/fail in the group with the step
number if it fails.

Automated tests cover the schedule maths. This covers everything they can't:
persistence, permissions, native modules, and the actual demo path.

## Setup

Delete the app first. A fresh install is the only way to catch a broken
migration or a bad first-run experience — which is exactly what a judge sees.

## Steps

1. **Cold launch.** Splash resolves, no flash of unstyled content, no error.
2. **Onboarding.** Add a child: name, birth date ~3 months ago, sex. Lands on home.
3. **Schedule is right.** Birth and 6-week visits show as overdue or given-able;
   9-month visit shows upcoming. Spot-check one due date by hand against the
   child's birth date.
4. **Mark given.** Open a dose, mark it given with today's date. Status flips to
   given immediately; the visit card updates; summary count increases.
5. **Mark given in the past.** Mark another dose given with a date two weeks ago.
   It records that date, not today.
6. **Skip.** Mark a dose skipped. Distinct from given in the UI.
7. **Undo.** Clear that record. Returns to overdue/upcoming correctly.
8. **Persistence.** Force-quit from the app switcher. Relaunch. Every change from
   steps 4–7 survived. *(This is the step that catches the worst bugs.)*
9. **Notifications.** Settings → reminders on → permission prompt appears and is
   granted. Diagnostics shows a scheduled count between 1 and 48, never more.
10. **Reminder re-sync.** Background the app, foreground it. Count is stable, not
    growing. *(Catches duplicate scheduling — a silent, nasty bug.)*
11. **Record card.** Open it. Every given dose shows with its date. Layout holds
    at the largest Dynamic Type setting.
12. **Export.** Tap export. PDF renders, share sheet opens, save to Files and open
    it. Text is legible and nothing is cut off.
13. **Paywall.** As a free user, add a second child → paywall appears. Cancel →
    returns cleanly with no second child created.
14. **Purchase and restore.** Sandbox purchase completes → second child now adds.
    Delete and reinstall the app → Restore Purchases returns premium.
15. **Small screen.** Repeat steps 2, 4 and 11 on an iPhone SE. Nothing clipped,
    nothing scrolls horizontally.
16. **Dark mode.** Toggle system appearance on home, record card and paywall.
    No unreadable text, no white boxes.
17. **Offline.** Airplane mode on. Everything in steps 2–12 still works. *(This is
    the product promise — it must never regress.)*

## Before submitting to App Review

- [ ] Steps 1–17 pass on a TestFlight build, not a dev build
- [ ] Listing is **not** geo-restricted — available in the United States
- [ ] Free trial is live on the subscription, or a promo code is in the Devpost entry
- [ ] In-app NPHCDA source citation and "not medical advice" disclaimer present
- [ ] Privacy labels say data not collected, and that is actually true
- [ ] Privacy policy URL resolves
