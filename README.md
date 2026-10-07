# 🌿 TrailWhistle

> **Offline-first, on-device bird call identifier Progressive Web App.**  
> Built for the **Hacktoberfest Open-Source AI Challenge: Week 1** (*Theme: "Touch Grass"*).  
> Zero cloud servers. Zero API keys. Zero cellular data required.

[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)
[![Built with Transformers.js](https://img.shields.io/badge/Model-AST%20Open%20Weights-amber.svg)](https://huggingface.co/Xenova/ast-finetuned-audioset-10-10-0.4593)
[![PWA Ready](https://img.shields.io/badge/PWA-Offline%20First-green.svg)](https://web.dev/progressive-web-apps/)
[![Deployed on Render](https://img.shields.io/badge/Render-Static%20Service-46e3b7.svg)](https://render.com)

---

## 📖 Overview

TrailWhistle gets people off the screen and into the natural world. In remote wilderness, mountain canyons, and deep forests, cellular reception drops to zero. That's usually where traditional AI applications fail.

TrailWhistle is architected from the ground up to run **100% on-device** using open-weight Audio Spectrogram Transformer (AST) models compiled to WebAssembly via **Transformers.js**. The screen is designed to be the **shortest part of your outdoor experience**:
1. Tap once to capture 3 seconds of birdsong.
2. The on-device neural network identifies the top-3 probable bird species with confidence ratings.
3. Confirm or refine the sighting, attach optional GPS coordinates and field notes.
4. The observation is saved to your offline field journal (`localStorage`).
5. Export everything to standard RFC 4180 CSV anytime.

---

## ✨ Features

- 🎙️ **3-Second Avian Audio Capture:** Tactile, glove-friendly 112px touch button with real-time volume meter and countdown timer.
- 🧠 **Real On-Device Neural Inference:** Powered by open weights (`Xenova/ast-finetuned-audioset-10-10-0.4593`) via `@xenova/transformers` in WebAssembly.
- 📊 **Top-3 Species Confidence Bars:** Clear probability ranking with acoustic signature details and habitat bio.
- 📝 **Confirm & Correct Workflow:** One-tap quick confirm or deep species taxonomy search and custom observation logging.
- 📓 **Offline Field Journal:** Persisted locally in `localStorage` with search filtering by species, date, and confirmation status.
- 📍 **Hardware Satellite GPS:** Captures precise latitude, longitude, and accuracy offline without requiring cellular cell-tower triangulation.
- 💾 **RFC 4180 CSV Export:** Instant one-click CSV file export compatible with eBird, iNaturalist, QGIS, and spreadsheets.
- ☀️ **Sunlight Outdoor Mode:** High-contrast monochrome mode built specifically for direct midday sunlight glare.
- 📦 **Installable PWA:** Full Service Worker caching via `vite-plugin-pwa` with 90-day offline cache retention for model weights.
- 🎶 **Pre-Bundled Demo Audio:** Includes built-in 16kHz birdsong clips (American Robin, Song Sparrow, Mourning Dove, Barn Owl) for immediate testing without a live microphone.

---

## 🛠️ Tech Stack

- **Runtime & Bundler:** Vite 8, TypeScript 5.8
- **UI Framework:** React 19, Tailwind CSS 3.4, Lucide React
- **ML Runtime:** `@xenova/transformers` (AST ONNX WebAssembly)
- **Audio Processing:** Web Audio API with `webkitAudioContext` iOS Safari fallback, 16kHz linear resampling, Float32-to-WAV encoding
- **PWA / Service Worker:** `vite-plugin-pwa` (Workbox `CacheFirst` strategies)
- **Testing:** Vitest 5, `@testing-library/react`, `jsdom`
- **Hosting:** Render (`render.yaml` static web service blueprint)

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ (tested on Node.js 24)
- npm 9+

### Installation & Development

```bash
# Clone the repository
git clone https://github.com/<your-username>/trailwhistle.git
cd trailwhistle

# Install dependencies
npm install

# Start local development server
npm run dev
```

Visit `http://localhost:5173` in your browser.

### Running Tests

TrailWhistle includes comprehensive automated unit tests covering audio resampling, normalization, WAV generation, journal filtering, CSV escaping, stubbed classifier mapping, and UI components:

```bash
# Run all tests once
npm test

# Run tests in watch mode
npm run test:watch
```

### Building for Production

```bash
npm run build
```

The production output will be generated in `./dist`, including the application bundle, offline service worker (`sw.js`), and Web Manifest.

To preview the production build locally:
```bash
npm run preview
```

---

## ☁️ Deploying to Render

TrailWhistle is pre-configured for **Render** static site hosting:

1. Connect your repository to Render.
2. Render will automatically detect [`render.yaml`](./render.yaml).
3. The build configuration:
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `./dist`
   - **Headers:** COOP / COEP enabled for optimal WebAssembly execution.

---

## 📝 Challenge Submission

See [`DEVPOST.md`](./DEVPOST.md) for the complete submission post draft, build story, and theme reflections for the **Hacktoberfest Open-Source AI Challenge: Week 1**.

---

## 📄 License

This project is licensed under the [MIT License](./LICENSE).
