# Marketing site moved

The public landing page and privacy policy now live in [`docs/`](../docs/) so
GitHub Pages can publish them (Pages only allows `/` or `/docs` for
branch-based deploys).

| File | Role |
|---|---|
| [`docs/index.html`](../docs/index.html) | Landing page |
| [`docs/privacy.html`](../docs/privacy.html) | Privacy policy (ASC URL) |
| [`docs/terms.html`](../docs/terms.html) | Terms of Use / EULA (ASC URL) |
| [`docs/styles.css`](../docs/styles.css) | Shared styles |
| [`docs/main.js`](../docs/main.js) | Landing animations |

## GitHub Pages

1. Repo **Settings → Pages**.
2. Source: **Deploy from a branch**.
3. Branch: `main`, folder: **`/docs`**.
4. Save.

Live URLs (org `techbone`, repo `kati`):

- Site: `https://techbone.github.io/kati/`
- Privacy: `https://techbone.github.io/kati/privacy.html`
- Terms of Use: `https://techbone.github.io/kati/terms.html`

Paste the privacy URL into App Store Connect → App Privacy / Privacy Policy URL.
Paste the Terms URL into the App Store **Description** (and/or Custom EULA) so
guideline 3.1.2 is satisfied on the product page.

## Local preview

```bash
npx --yes serve docs
```

Engineering markdown under `docs/` (ARCHITECTURE, TRACKS, etc.) stays in the
same folder; Pages serves `index.html` as the homepage.
