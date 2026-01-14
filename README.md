# 🦊 Root Board Game Tracker

A SvelteKit SPA for tracking game statistics for the board game **Root**.

## Features

- 📊 Track games with players, factions, maps, landmarks, hirelings, and scores
- 👑 Mark winners and view final scores
- 🗺️ Support for all official Root maps (Autumn, Winter, Lake, Mountain)
- 🐾 Track hirelings and landmarks used in each game
- 📝 Add notes to your games
- 📖 View game history
- 💾 Data stored locally in browser using IndexedDB

## Tech Stack

- **SvelteKit 2.x** - Web framework (static SPA mode)
- **Tailwind CSS 4.x** - Utility-first CSS
- **Dexie.js** - IndexedDB wrapper for browser storage
- **TypeScript** - Type safety

## Getting Started

### Install dependencies

```sh
npm install
```

### Start the development server

```sh
npm run dev
```

The app will be available at `http://localhost:5173`.

## Data Storage

All game data is stored locally in your browser using IndexedDB. Data persists across browser sessions but is specific to each browser/device.

## Supported Game Elements

### Factions

- **Base Game**: Marquise de Cat, Eyrie Dynasties, Woodland Alliance, Vagabond
- **Riverfolk Expansion**: Riverfolk Company, Lizard Cult, Second Vagabond
- **Underworld Expansion**: Underground Duchy, Corvid Conspiracy
- **Marauder Expansion**: Lord of the Hundreds, Keepers in Iron

### Maps

Autumn (Fall), Winter, Lake, Mountain

### Landmarks & Hirelings

Full support for official landmarks and hirelings from all expansions.

## Building for Production

```sh
npm run build
```

This creates a static build in the `build` folder that can be deployed to any static hosting service (Netlify, Vercel, GitHub Pages, etc.).

Preview the production build:

```sh
npm run preview
```
