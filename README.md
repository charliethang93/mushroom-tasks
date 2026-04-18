# 🍄 Mushroom Tasks

Gamified to-do app with a MapleStory-style mushroom pet that levels up as you complete tasks. Mobile-first PWA.

## What you're getting

- React + Vite app (fast, tiny build)
- Works offline via service worker
- Installable to your phone home screen ("Add to Home Screen")
- Data lives in your browser's `localStorage` — private to your device, never sent anywhere
- No backend, no database, no signup

---

## 🚀 Quick deploy (Vercel — easiest, ~5 minutes)

### 1. Install Node.js if you don't have it
Get it from https://nodejs.org (any version ≥ 18 is fine). Verify in terminal:
```bash
node --version
```

### 2. Install dependencies and test locally
From inside this folder:
```bash
npm install
npm run dev
```
Open http://localhost:5173 in your browser. You should see the app. Press `Ctrl+C` to stop the dev server when you're done testing.

### 3. Push to GitHub
- Create a new empty repo on https://github.com (e.g. `mushroom-tasks`). Don't add a README/license — keep it empty.
- In the project folder:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/mushroom-tasks.git
git push -u origin main
```

### 4. Deploy via Vercel
- Go to https://vercel.com and sign up with your GitHub account (free tier is plenty for this)
- Click **"Add New Project"** → import your `mushroom-tasks` repo
- Vercel auto-detects Vite — leave all settings as defaults
- Click **"Deploy"**
- After ~30 seconds you'll get a URL like `https://mushroom-tasks-abc123.vercel.app`

### 5. Add to your phone's home screen
**iPhone (Safari):**
1. Open the Vercel URL in Safari
2. Tap the Share button (square with arrow up)
3. Scroll down → tap **"Add to Home Screen"**
4. Tap "Add" — the mushroom icon appears on your home screen
5. Tap it — opens fullscreen, no browser bar, just like a native app

**Android (Chrome):**
1. Open the Vercel URL in Chrome
2. Tap the menu (⋮) → **"Install app"** or **"Add to Home Screen"**
3. Confirm — icon appears on your home screen

### 6. (Optional) Custom domain
In Vercel project settings → Domains → add your own domain if you have one. Otherwise the `*.vercel.app` URL works forever.

---

## Future updates

When you (or I) make changes:
```bash
git add .
git commit -m "What changed"
git push
```
Vercel auto-rebuilds and re-deploys in ~30 seconds. Refresh your phone's home-screen app and you'll see the new version.

---

## Alternative: Netlify (also free, equally simple)

Same basic flow:
1. Push to GitHub
2. Go to https://netlify.com → "Add new site" → "Import from GitHub" → pick your repo
3. Build command: `npm run build`, publish directory: `dist`
4. Deploy

---

## Local development

```bash
npm install        # one time
npm run dev        # start dev server at http://localhost:5173
npm run build      # production build → ./dist
npm run preview    # serve the production build locally to test
```

---

## File structure

```
mushroom-pwa/
├── package.json
├── vite.config.js
├── index.html              # entry point with PWA meta tags + SW registration
├── public/
│   ├── manifest.json       # PWA manifest (app name, icons, colors)
│   ├── sw.js               # service worker for offline support
│   ├── icon.svg            # source app icon
│   ├── icon-192.png        # PWA icon (small)
│   └── icon-512.png        # PWA icon (large)
└── src/
    ├── main.jsx            # React entry
    └── MushroomTasks.jsx   # the entire app component
```

---

## Troubleshooting

**App doesn't work offline?** Service workers only register on HTTPS (or localhost). Vercel/Netlify both serve HTTPS by default.

**Updates not showing on home-screen app?** Pull-to-refresh inside the app, or close and reopen it. The service worker uses network-first for HTML so updates land quickly.

**Lost your tasks?** Data is in `localStorage` keyed to the deployed URL. If you change the URL, the data won't migrate. Don't clear browser data for the site or you'll wipe progress.

**Want backups?** You could add an export/import JSON button to the app — let me know.
