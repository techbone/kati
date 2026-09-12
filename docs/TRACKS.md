# Tracks, ownership, and how we don't break each other

Three people, one repo, nineteen days. The rule that makes this work is simple:
**you only ever edit files your track owns.**

## Ownership

| Track | Owner | Owns | Never touches |
|---|---|---|---|
| **A — Engine** | Faruq | `src/domain/**`, `src/data/**`, `src/store/**` | `src/app`, `src/ui`, `src/services` |
| **B — Surface** | Musa | `src/app/**`, `src/ui/**`, `src/hooks/**` | `src/domain`, `src/data`, `src/services` |
| **C — Platform** | Abdullah | `src/services/**`, `app.config.ts`, `eas.json`, `assets/**` | `src/domain`, `src/ui` |

Shared, changed only by agreement: `src/contracts/**`, `package.json`,
`tsconfig.json`, `eslint.config.js`, `jest.config.js`, `docs/**`.

Abdullah also owns everything only he has access to: EAS builds, App Store
Connect, RevenueCat dashboard, TestFlight, submission.

## Why the seams hold

Track B is never blocked on Track A, because B codes against
`contracts/store.ts` and runs on `services/mock/mockStore.ts` from day one. When
A's real store lands, B changes one import. **If a screen needs more than that
one-line change, the contract was wrong — fix the contract, not the screen.**

Track C is never blocked on either, because every service is an interface in
`contracts/services.ts` with a mock implementation.

## Changing a contract

`src/contracts/**` is frozen. If you need a change:

1. Say so in the group before you write it.
2. All three agree.
3. One person makes the change and pushes it to `main` alone, in its own commit.
4. Everyone rebases immediately.

A contract change mid-day is the single most expensive thing we can do to each
other. Expect two or three across the whole project; be suspicious of the fourth.

## Branches and merging

- Branch off `main`: `a/schedule-engine`, `b/home-screen`, `c/notifications`.
- Rebase on `main` before you merge. Never merge `main` into your branch.
- `npm run verify` green before merge. No exceptions, no "I'll fix it after".
- Merge small and often — at minimum once a day. A three-day branch in a
  nineteen-day project is a merge conflict with a countdown on it.

## Everybody PRs, including Musa

`main` is protected: no direct pushes, from anyone. Every change — Musa's
included — goes through a branch and a PR. Musa's PRs can be self-approved and
merged the moment they're green — the point isn't a slower review, it's that
nothing skips the check.

**The check runs on your machine, not on GitHub.** GitHub Actions isn't
available on this repo right now, so `npm install` installs a git `pre-push`
hook (`.githooks/pre-push`) that runs `npm run verify` and refuses to push a red
branch. It's on all three machines the moment you've run `npm install`. The
Actions workflow stays in the repo and takes over automatically if Actions
becomes available.

`git push --no-verify` bypasses it. If you ever type that, say so in the PR.

1. Branch, commit, push: `git push -u origin a/schedule-engine` — the hook
   runs verify first and stops you if it's red.
2. Open the PR. `CODEOWNERS` auto-requests the right reviewer by path.
3. Reviewer for your track (or, for a shared/`contracts` change, all three)
   approves. Skim > rubber-stamp: an owner reading a PR outside their track
   still catches "this doesn't match the contract" faster than a demo does.
4. **Squash merge.** Keeps `main`'s history one commit per feature — easier to
   `git bisect` or roll back a tag if something breaks four days from now.
5. Delete the branch after merge. Everyone `git pull` on `main` before
   branching again for their next piece.

Branch protection on `main` (set up once, in GitHub repo settings → Rules):
require a PR before merging, require 1 approving review, dismiss stale
approvals on new commits, block force pushes. (No status-check requirement
until Actions works.)

## Integration checkpoints

Every evening, all three merge to `main`, then one person runs `docs/SMOKE.md`
on a real device and reports pass/fail in the group.

At each milestone boundary, after smoke passes, tag it:

```bash
git tag -a m2-done -m "M2: real data layer, mock store deleted"
```

Tags are our rollback points. If something breaks on the 27th we need to be able
to get back to known-good in one command, not by reading git log.

## Standup

Ten minutes, once a day, three questions each: what landed, what's blocked,
**what am I about to touch that isn't mine**. That third one is what prevents
the collisions.
