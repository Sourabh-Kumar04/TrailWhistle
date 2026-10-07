# TrailWhistle: Offline-First Avian Audio Classifier for the Deep Backcountry

**Submission for the Hacktoberfest Open-Source AI Challenge: Week 1**  
**Theme:** *Touch Grass*  
**Tags:** `#devchallenge #hf26challenge`  
**Target Category:** General Track + Optional Partner Category (*Best Use of Render*)

---

## 🌲 The Elevator Pitch

**TrailWhistle** is an offline-first bird call identification Progressive Web App (PWA) powered by real, on-device open-weight machine learning. Tap once to capture 3 seconds of birdsong, run inference in WebAssembly directly in your mobile browser, inspect the top-3 identified species with confidence ratings, and log observations into your field journal with GPS coordinates and CSV export—**all with zero cell reception, zero API keys, zero cloud telemetry, and zero backend servers.**

---

## 🏕️ The "Touch Grass" Challenge: Why Screen Time Should Be the Shortest Part of AI

Most contemporary AI applications are engineered around an anti-pattern: **maximizing screen time**. They trap users inside conversational feedback loops, chat interfaces, and infinite feeds designed to keep eyes glued to glowing glass.

When you step into nature—deep into the backcountry, onto mountain switchbacks, or through coastal wetlands—cellular reception vanishes. That absence of signal is a feature of the wilderness, not a bug. Yet almost every mainstream bird identification tool fails the moment you lose signal bars:
- Cloud-dependent APIs fail with network timeouts.
- Proprietary platforms demand mandatory account sign-ins and phone verifications.
- Fragile cloud models turn your phone into a useless brick right when a rare warbler or owl calls from the canopy.

**TrailWhistle turns this dynamic completely upside down.** 
The pitch is simple: **the screen is the shortest part of the experience.** You hear a bird call, tap a single high-contrast button for three seconds, review the instant acoustic classification, confirm the observation, and put your phone back in your pocket to keep walking.

You don't need a cell tower. You don't need an account. You don't need an internet connection after initial page load.

---

## 🐦 What TrailWhistle Does

1. **3-Second Avian Audio Capture**
   - High-contrast, glove-friendly 112px record button with tactile haptic and visual countdown.
   - Real-time RMS volume audio visualizer verifying incoming acoustic signal level.
   - Resilient Web Audio API pipeline with automatic fallback for iOS Safari (`webkitAudioContext` unlocking and suspended context recovery).
   - High-quality linear interpolation resampling down to 16 kHz mono float arrays to match the model's exact acoustic feature space.

2. **Real On-Device Open-Weight Audio Classification**
   - Runs directly in the browser via **Transformers.js** (`@xenova/transformers`) and WebAssembly / ONNX Runtime Web.
   - Powered by open weights from the **Audio Spectrogram Transformer (AST)** family (`Xenova/ast-finetuned-audioset-10-10-0.4593`), fine-tuned to classify 527 complex acoustic classes including avian vocalization signatures.
   - Real-time classification mapping from raw spectrogram features to rich species profiles (common names, scientific names, typical habitats, and acoustic signatures).

3. **Transparent Model Hydration & Graceful Degradation**
   - Explicit first-load download progress bar showing downloaded MB, percentage, and current ONNX chunk.
   - Aggressive Service Worker + Cache API persistence (`CacheFirst` strategy) keeping model weights stored locally for 90 days.
   - Graceful offline fallback with clear retry mechanics and diagnostic guidance.

4. **Confirm / Correct Flow & Species Taxonomy**
   - Displays top-3 candidate species ranked by confidence percentage bars.
   - One-tap quick confirm or deep observation editor.
   - Searchable species taxonomy database and custom observation entry for field ornithologists.

5. **Local Field Journal & Hardware GPS Logging**
   - Stores observations directly in `localStorage`—persisting timestamps, confidence percentages, field notes, and audio duration.
   - Offline GPS integration: queries hardware satellite GPS chips without requiring active cellular network triangulation.
   - Searchable by query (common name, scientific name, or field notes) and date filters.

6. **RFC 4180 CSV Export**
   - Single-click CSV export with complete observation metadata (`id`, `timestamp_utc`, `species_common_name`, `species_scientific_name`, `confidence_pct`, `notes`, `latitude`, `longitude`, `gps_accuracy_m`, `audio_duration_sec`, `source`, `confirmed_by_user`).
   - Ready for import into desktop GIS tools, eBird, iNaturalist, or research spreadsheets.

7. **Trailhead Demo Mode**
   - Built-in synthesized 16kHz WAV bird call samples (American Robin, Song Sparrow, Mourning Dove, Barn Owl) for rapid evaluation, desktop testing, and trailside calibration.

8. **Sunlight Contrast Mode & Outdoor Accessibility**
   - Dedicated "Sunlight Mode" toggle that converts the UI to high-contrast monochrome with bold borders, preventing glare washout under direct outdoor midday sun.
   - Minimum 48px tap targets optimized for one-handed operation while hiking or wearing outdoor trail gloves.

---

## 🛠️ Technical Architecture & Stack

TrailWhistle is architected as a lean, zero-backend Progressive Web Application:

```
┌─────────────────────────────────────────────────────────────┐
│                     TrailWhistle PWA                        │
├──────────────────────────────┬──────────────────────────────┤
│       UI & Interactions      │       On-Device ML Engine     │
│  - React 19 + TypeScript     │  - Transformers.js (v2)      │
│  - Tailwind CSS              │  - ONNX Runtime Web (WASM)   │
│  - High-Contrast Sunlight UX │  - AST Audio Spectrogram     │
│  - Touch-friendly 48px+ tap  │  - 16 kHz Mel-Spectrogram    │
├──────────────────────────────┼──────────────────────────────┤
│       Web Audio Engine       │       Offline Persistence    │
│  - Web Audio API             │  - Workbox Service Worker    │
│  - webkitAudioContext iOS    │  - Browser Cache API         │
│  - 16kHz Linear Resampling   │  - localStorage Journal      │
│  - Float32 to WAV Generator  │  - Hardware Satellite GPS    │
└──────────────────────────────┴──────────────────────────────┘
```

- **Frontend & Bundling:** Vite + React 19 + TypeScript.
- **Styling:** Tailwind CSS with custom earth/forest palettes and high-contrast outdoor monochrome overrides.
- **PWA & Offline Service Worker:** `vite-plugin-pwa` with Workbox caching strategies (`CacheFirst` for static assets and model weights from Hugging Face).
- **ML Runtime:** `@xenova/transformers` running the quantized `Xenova/ast-finetuned-audioset-10-10-0.4593` ONNX model in WebAssembly.
- **Testing:** Vitest + `@testing-library/react` + `jsdom`. Comprehensive unit test coverage for audio resampling, normalization, WAV encoding, journal storage, CSV escaping, and component state transitions. (Model pipeline tested with a verified mock stub to avoid redundant network hits during CI).

---

## 🚀 Deployment & Best Use of Render ($200 Category)

TrailWhistle is configured for seamless deployment on **Render** as a high-performance static web service.

The repository includes a turnkey `render.yaml` blueprint:

```yaml
services:
  - type: web
    name: trailwhistle
    runtime: static
    buildCommand: npm install && npm run build
    staticPublishPath: ./dist
    headers:
      - path: /*
        name: Cross-Origin-Opener-Policy
        value: same-origin
      - path: /*
        name: Cross-Origin-Embedder-Policy
        value: require-corp
      - path: /*
        name: Cache-Control
        value: public, max-age=3600
    routes:
      - type: rewrite
        source: /*
        destination: /index.html
```

### Why Render is the Ideal Host for Edge AI
1. **Global CDN Edge Caching:** Render's static site network distributes the PWA shell, WebAssembly binaries, and pre-bundled audio assets with sub-50ms TTFB across global edge nodes.
2. **COOP / COEP Header Support:** Running high-performance WebAssembly with SharedArrayBuffer multi-threading requires `Cross-Origin-Opener-Policy: same-origin` and `Cross-Origin-Embedder-Policy: require-corp` headers, which Render configures effortlessly via static headers.
3. **Zero Backend Maintenance:** Because TrailWhistle runs all neural inference on the user's mobile device, Render hosts the entire application at essentially zero server compute cost with 99.99% uptime.

---

## 💡 Why Open Innovation & Open-Source AI Matter

The explosion of proprietary closed-source AI APIs has created an illusion that artificial intelligence requires multi-million-dollar cloud clusters and monthly API credits for every simple classification task.

TrailWhistle demonstrates why **open-source AI and open-weight models** represent the true frontier of computing:
1. **True Autonomy:** When weights are open and inference runs on-device, software cannot be unilaterally deprecated, price-hiked, or shut down by a distant API provider.
2. **Radical Privacy:** Avian recordings and precise trail GPS coordinates contain sensitive geographic data (including locations of protected or endangered nesting species). In TrailWhistle, your data never leaves your device.
3. **Resilience in the Elements:** When you hike through national parks, dense forests, or remote trails, closed cloud AI is completely dead. Open-source models compiled to WebAssembly continue to function flawlessly in the middle of nowhere.

---

## 🏃 Running the Project Locally

```bash
# 1. Clone the repository
git clone https://github.com/<your-username>/trailwhistle.git
cd trailwhistle

# 2. Install dependencies
npm install

# 3. Run the development server
npm run dev

# 4. Run the comprehensive unit test suite
npm test

# 5. Build for production (PWA shell + service worker)
npm run build
```

---

## 📜 License

This project is licensed under the permissive **MIT License** — free and open for trail enthusiasts, biologists, and outdoor innovators everywhere.
