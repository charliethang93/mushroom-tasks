# 🥚 Tama Tasks

A retro 1990s-Tamagotchi-style to-do app. Complete daily tasks to keep your virtual pet happy, healthy, and energized. Built as a personal productivity tool I actually want to use.

Live at: https://mushroom-tasks.vercel.app

## Features

- **Pet care meters** — Food, Fun, and Energy bars drain over time. Completing tasks refills them. Neglect your pet and it gets sad, then sick.
- **Streak tracking** — Don't break the chain. Current streak in the top bar; best streak in the Stats tab.
- **Achievements** — 13 silent badges to discover as you hit milestones (first task, 100 tasks, 30-day streak, reviving a sick pet, etc.). Locked ones show as "???".
- **Stats** — Total tasks, best day, current/best streaks, plus a 30-day completion chart.
- **Recurring vs one-shot tasks** — Mark tasks "Repeat daily" and they reset every morning at local midnight. One-shot tasks vanish on completion.
- **Local-time aware** — Day boundary follows your phone's clock, not UTC.
- **Offline-capable PWA** — Add to home screen on iOS/Android, works without internet, data stays on your device.

## Tech stack

- React 18 + Vite
- Vanilla CSS (no framework)
- localStorage for persistence
- Service worker for offline support
- Hosted free on Vercel

Pair-programmed with Claude (Anthropic) — design and code iterated through chat.

## Run locally

```bash
npm install
npm run dev    # → http://localhost:5173
```

## Deploy

Push to `main`. Vercel auto-deploys in ~30 seconds.

```bash
git add .
git commit -m "Your change"
git push
```

## File structure

```
mushroom-pwa/
├── index.html              # PWA entry, meta tags, SW registration
├── public/
│   ├── manifest.json       # PWA manifest
│   ├── sw.js               # Service worker
│   ├── icon.svg            # App icon source
│   ├── icon-192.png        # PWA icon (small)
│   └── icon-512.png        # PWA icon (large)
└── src/
    ├── main.jsx            # React entry
    └── MushroomTasks.jsx   # Entire app (single component)
```

## Notes

Data lives in `localStorage` keyed to the deployed URL. Clearing browser data for the site wipes progress. There's no cloud sync — single-device only.
