# Cupola Explorer – ISS Tracker

Cupola Explorer is a Phase 1 prototype that renders a real-time view of the International Space Station (ISS) orbiting Earth. The app combines React, Vite, TailwindCSS, and Three.js to produce a responsive 3D visualization with live telemetry sourced from NASA's Open Notify API.

## Getting Started

```bash
npm install
npm run dev
```

The development server runs at [http://localhost:5173](http://localhost:5173). The interface updates automatically with new ISS position data every five seconds.

## Features

- 🌍 High-resolution Three.js Earth globe with atmospheric cloud layer
- 🛰️ Real-time ISS marker and trailing orbit path
- 🔁 Live telemetry panel with latitude, longitude, and last update timestamp
- 📱 Responsive, dark-themed UI optimized for desktop and mobile

## Data Source

Position data is retrieved from the public [NASA Open Notify ISS API](https://api.open-notify.org/iss-now.json). Basic caching avoids redundant requests while keeping the visualization fresh.
