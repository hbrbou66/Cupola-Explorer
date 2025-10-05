# Cupola Explorer – Astronaut Edition

Cupola Explorer immerses you in the International Space Station's orbital experience. Built with React, Vite, TailwindCSS, and Three.js, the Phase 2 release adds a Cupola camera mode, time-lapse playback, dynamic day/night lighting, and subtle weightlessness cues to bring the astronaut perspective home.

## Getting Started

```bash
npm install
npm run dev
npm install --legacy-peer-deps
```

Visit [http://localhost:5173](http://localhost:5173) once the dev server is running. The visualization updates continuously while remaining responsive on desktop and mobile screens.

## Features

- 🚀 **Cupola view** – lock the camera to the ISS with gentle sway (optional via reduced-motion toggle)
- ⏱️ **Time-lapse playback** – scrub ±12 hours, jump between speeds (1× to 200×), and differentiate live vs simulated sessions
- 🌗 **Dynamic terminator shader** – day/night lighting tied to real-time solar position with optional city lights
- 🌌 **Optional overlays** – toggle global clouds, auroral ovals, and city lights; overlays auto-throttle during high-speed playback
- 🫧 **Weightlessness feel** – floating HUD cards and particle drift when enabled, paused automatically during heavy interaction
- 📡 **Live telemetry** – latitude, longitude, altitude, and TLE refresh time with a persistent status feed
- ♿ **Accessibility first** – reduced motion toggle, keyboard-friendly controls, focus outlines, and concise ARIA labels

## Controls & UI

- **View mode panel (left)** – switch between *Orbital Map* (full globe control) and *Cupola View* (ISS first person). Cupola view supports subtle head turns via mouse/touch within ±30°.
- **Time controls (bottom centre)** – play/pause, speed selection (1×, 10×, 60×, 200×), and a timeline scrubber. Keyboard shortcuts: `Space` toggles play, `←/→` adjust ±10 seconds, `Shift + ←/→` adjust ±5 minutes.
- **Toggles (right)** – enable weightlessness, terminator shading, clouds, aurora, city lights, and reduced motion. Weightlessness includes an intensity slider (default 0.4) and respects reduced-motion preferences.
- **Tooltips** – the first run displays a one-line Cupola tip. Dismissals are stored in `localStorage`.

## Data Sources

- **Orbital propagation** – Latest ISS TLE data from [CelesTrak](https://celestrak.org). A bundled fallback TLE is used if live retrieval fails.
- **Textures** – NASA/Three.js Earth day, night, and cloud maps, plus a procedurally generated aurora overlay.

## Reduced Motion & Performance

- Enable *Reduced Motion* to disable Cupola sway, HUD drift, and weightless particles.
- Weightlessness automatically pauses while the globe is being manipulated to keep controls precise.
- High-speed playback (>200×) temporarily hides heavy overlays (clouds, aurora) to maintain smooth frame rates.

## Telemetry & Debugging

- TLE updates are logged in the telemetry panel. In development builds, the console reports any fetch issues and keeps the previous orbital solution active until new data arrives.
- The Three.js scene logs warnings if shaders or textures fail to load.

## Manual Checks

- **Lesson visual fallback** – With the dev server running, temporarily rename or remove a lesson GLB under `public/models/lessons`. Open the Education modal for the affected lesson and confirm the "Lesson visual unavailable" message appears while the rest of the modal remains usable. Restore the asset afterwards.
