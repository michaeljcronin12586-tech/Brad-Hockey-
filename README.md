# First Step — Hockey Performance Tracker

A 4-day acceleration, quickness, and hockey strength program for a youth player.
Installable PWA. Tracks completion, logs working weights, and recommends the next
weight once a baseline exists. Off-season (build) and in-season (maintain) phases
adjust volume and progression.

- Progress and logged weights persist in the browser via `localStorage`.
- Header respects device safe areas (notch / status bar).
- Works offline and installs to a home screen (service worker via `vite-plugin-pwa`).

## Run locally

```bash
npm install
npm run dev
```

Open the printed local URL. `npm run build` produces the production bundle in `dist/`.

## Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit: hockey performance tracker PWA"
git branch -M main
git remote add origin https://github.com/<your-username>/<repo-name>.git
git push -u origin main
```

## Deploy to Vercel

1. Go to vercel.com → **Add New → Project**.
2. Import the GitHub repo.
3. Vercel auto-detects Vite — no config needed. Build command `npm run build`,
   output directory `dist`.
4. Deploy. On a phone, open the URL and use "Add to Home Screen" to install it.

## Notes

- Weight numbers are a starting point for a coach or parent to eyeball, not a mandate.
  If form breaks down, that overrides the app's suggestion.
- To reset all saved data, clear the site's storage in the browser, or add a reset
  control in `App.jsx`.
```
