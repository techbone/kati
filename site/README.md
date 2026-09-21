# Kati marketing site

Static landing page and privacy policy for App Store Connect and the public web.

This folder is separate from the Expo mobile app (`src/`). Open these files in a
browser — they are not bundled into the iOS build.

## Local preview

From the repo root:

```bash
npx --yes serve site
```

Or open `site/index.html` directly. Motion loads from a CDN, so you need a
network connection for animations.

## GitHub Pages

1. Repo **Settings → Pages**.
2. Source: **Deploy from a branch**.
3. Branch: `main`, folder: **`/site`** (or `/` if you prefer root and move files later).

### Privacy URL for App Store Connect

After Pages is live:

| Pages folder setting | Privacy policy URL |
|---|---|
| `/site` | `https://<owner>.github.io/kati/privacy.html` |
| `/` (root) with site files at root | `https://<owner>.github.io/kati/privacy.html` |
| `/` with this `site/` folder still nested | `https://<owner>.github.io/kati/site/privacy.html` |

For org `techbone` and repo `kati` with Pages set to `/site`:

`https://techbone.github.io/kati/privacy.html`

Paste that URL into App Store Connect → App Privacy / Privacy Policy URL.

## Files

| File | Role |
|---|---|
| `index.html` | Landing page |
| `privacy.html` | Privacy policy (ASC URL target) |
| `styles.css` | Shared styles |
| `main.js` | Motion animations for the landing page |

Brand colours match the app (`#1F5F4A` primary, Fraunces display).
