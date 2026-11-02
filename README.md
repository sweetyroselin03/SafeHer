# SafeHer – Women's Safety & Emergency Response System

> **A University Internet Programming Capstone Project**  
> *Offline-First • Privacy-First • Zero-Server Emergency Assistance Progressive Web Application (PWA)*

---

## 1. Project Overview & Philosophy

Women experiencing personal safety emergencies often face delays when using traditional safety applications due to complex multi-step workflows, unreliable cell coverage, and dependence on centralized cloud databases. Traditional solutions also pose severe privacy risks by collecting sensitive live GPS coordinate histories and personal information on external servers.

**SafeHer** is designed around a single guiding principle:  
**Offline-first, privacy-first, zero-server emergency assistance.**

- **No Centralized Application Backend:** Operates directly within client browser hardware.
- **No Mandatory Login or Signup:** Immediate access without authentication walls.
- **No External Cloud Databases:** Zero transmission of coordinates, contacts, or voice recordings to Firebase, Supabase, or any private server.
- **Standard Browser API Leverage:** Geolocation API, Web Audio API, DeviceMotionEvent, MediaRecorder API, Battery Status API, Cache Storage API, and IndexedDB.
- **Offline Reliability:** All deterrence, siren, fake call, audio evidence, and cached SOS messages remain operable with zero cellular or Wi-Fi data connectivity.

---

## 2. Technology Stack

### Frontend & Application Architecture
- **Framework & Language:** React 19 with TypeScript
- **Build System & Bundler:** Vite 8
- **Styling:** Tailwind CSS v4 with bespoke CSS design tokens, responsive glassmorphism, and accessible color scales
- **Iconography:** Lucide React
- **Client Routing:** React Router v7 (`createBrowserRouter`, `RouterProvider`)
- **State Management:** Zustand (reactive, zero-boilerplate local store)
- **Local Database:** IndexedDB (for audio binary blobs and evidence metadata) & localStorage (for profile, contacts, settings, and incident history)

### Browser APIs & Device Services
- **Geolocation API:** `navigator.geolocation.getCurrentPosition()` with high accuracy, bounded timeout, and cached fallback.
- **Web Audio API:** Real-time dual-frequency synthetic audio generation for the emergency siren alarm and realistic telecom telephone ring cadence without external audio files.
- **MediaRecorder API & getUserMedia:** Client-side microphone audio evidence recording with runtime MIME-type auto-detection (`audio/webm`, `audio/mp4`, `audio/ogg`).
- **DeviceMotionEvent API:** Opt-in accelerometer shake-to-SOS with iOS 13+ permission support, 3D magnitude calculation, debounce windows, and calibration tests.
- **Battery Status API:** Genuine browser detection of battery percentage and charging state with graceful degradation.
- **Vibration API:** Haptic pulses for emergency activation, touch feedback, and realistic call ring patterns.
- **Web Share API & Deep Linking:** Pre-formatted WhatsApp deep links (`wa.me`) and native device sharing.
- **Service Worker & Cache Storage:** Precached application shell, versioned static assets, and offline navigation fallback via `vite-plugin-pwa`.

### Quality Assurance & Automated Testing
- **Test Runner:** Vitest v5
- **Testing Library:** `@testing-library/react`, `@testing-library/jest-dom`
- **Compiler:** TypeScript (`tsc -b`)
- **Linter:** Oxlint

---

## 3. Application Design System

SafeHer features a tailored safety-tech aesthetic prioritizing clarity, emergency speed, and accessible contrast:

| Color Role | Hex Code | Purpose |
|---|---|---|
| **Primary** | `#5B214C` (Deep Plum) | Brand identity, primary headers, primary contact badges |
| **Emergency** | `#E53945` (Crimson Red) | Main SOS hold control, siren alarm, emergency telephone 112 |
| **Secondary** | `#F7DDE7` (Rose Petal) | Subtle card borders, tags, progress indicator rings |
| **Background** | `#FFF9FB` / `#140D17` (Dark) | Clean, non-glare surface for daytime and nighttime usage |
| **Surface** | `#FFFFFF` / `#1E1423` (Dark) | High-contrast elevated component cards |
| **Success** | `#17865D` (Emerald) | Verified hardware permissions, online status, saved evidence |
| **Warning** | `#E9A23B` (Amber) | Stale cached location notices, battery warnings, offline notifications |

---

## 4. Feature & Module Breakdown

### Module 1: PWA and Instant SOS Engine
1. **Hold-for-SOS Activation:** Large circular red button requiring a configurable hold duration (default 1.5s) to eliminate false triggers, with a haptic pulse, animated SVG progress ring, and accessible 1-tap toggle for motor accessibility.
2. **GPS Geolocation Acquisition:** Acquires fresh coordinates with ± accuracy. If GPS is slow or unavailable, instantly falls back to cached coordinates with clear age labeling (e.g. "Captured 2 mins ago") and never misrepresents stale coordinates as live.
3. **Emergency Message Generator:** Formats an emergency dispatch message containing Google Maps links, coordinates, user display name, medical notes (allergies/blood group), and custom situational notes.
4. **WhatsApp Deep Link Routing:** Pre-fills the WhatsApp conversation with trusted contacts or general chat picker (`wa.me`). Clearly discloses that external sending requires user confirmation within WhatsApp.
5. **Emergency Contacts Manager:** Complete CRUD system storing contacts locally with primary designation, relationship category, phone sanitization, and direct test-message ping.
6. **Shake-to-SOS Accelerometer Detection:** Listens to `DeviceMotionEvent` acceleration magnitude $\sqrt{a_x^2 + a_y^2 + a_z^2}$, debounced across configurable thresholds (12 to 40 m/s²) with cooldown windows.

### Module 2: Disguise & Deterrence Engine
1. **Realistic Fake Incoming Call Simulator:**
   - Fullscreen simulated incoming call screen with realistic caller identity (default "Mom – Mobile").
   - Dual-tone telephone ring synthesizer (440 Hz + 480 Hz) generated dynamically on the audio chip with synchronized vibration cadence (`[800, 400, 800, 1500]`).
   - Active call state with live timer, mock in-call controls (Mute, Speaker, Keypad), and local Web Speech Synthesis playing reassuring conversational lines ("Hey! Where are you right now? I'm waiting nearby with the car...").
   - Configurable trigger delays: Immediately, 10s, 30s, or 1 minute.
2. **Emergency Siren Synthesizer:**
   - Web Audio API oscillating emergency alarm cycling between 650 Hz and 1250 Hz.
   - Master volume slider and live animated waveform bars.
   - Functions 100% offline without downloading any sound clips.
3. **Visual Emergency Strobe:**
   - High-contrast alternating red-and-white optical beacon to signal for help at night.
   - Includes seizure warning and accessibility toggle for a steady, non-flashing red emergency beacon for photosensitive users.
4. **Combined Deterrence Mode:**
   - Single-tap activation that triggers the acoustic Siren Alarm and begins Audio Evidence Recording simultaneously.

### Module 3: Evidence Capture, Power Guard, and Storage
1. **Audio Evidence Recorder:**
   - `MediaRecorder` capture with runtime MIME auto-detection (`audio/webm`, `audio/mp4`, `audio/ogg`).
   - Live recording duration counter and animated sound wave bars.
   - Start, pause, resume, and stop controls.
   - Saves raw audio binary Blobs directly into local `IndexedDB`.
2. **Evidence Library Vault:**
   - Displays all recorded sessions with creation timestamps, duration, and file size.
   - In-browser HTML5 audio player for instant review.
   - Export feature to save recordings directly to device file storage.
   - Rename and delete functionality with storage quota indicators.
3. **Battery Monitor & Power Guard:**
   - Genuine `navigator.getBattery()` monitoring of battery percentage and charging state.
   - Graceful fallback messaging on unsupported browsers without fabricating fake values.
4. **Chronological Incident Audit Trail:**
   - Logs verified safety events (`sos_activated`, `whatsapp_opened`, `location_captured`, `fake_call`, `siren_activated`, `recording_created`, `strobe_activated`).
   - Filter by event type, delete single entries, or clear all history.
   - One-tap JSON export for personal records.

---

## 5. Application Architecture

```
safeher/
├── public/
│   ├── icons/
│   │   ├── icon-192x192.png
│   │   ├── icon-512x512.png
│   │   ├── icon-512x512-maskable.png
│   │   └── logo.svg
│   ├── apple-touch-icon.png
│   └── favicon.ico
├── src/
│   ├── app/
│   │   ├── App.tsx             # Root application component with dark mode sync
│   │   └── router.tsx          # Full client-side route declarations
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx      # Top bar with greeting, battery, and online pill
│   │   │   ├── BottomNav.tsx   # Fixed bottom navigation with floating SOS trigger
│   │   │   └── AppLayout.tsx   # Layout wrapper with global shake detection
│   │   └── emergency/
│   │       └── SOSButton.tsx   # Hold-to-SOS button with circular SVG progress ring
│   ├── pages/
│   │   ├── WelcomePage.tsx     # 3-step onboarding with permission checklist
│   │   ├── DashboardPage.tsx   # Personal Safety Dashboard
│   │   ├── SOSPage.tsx         # Emergency Action Screen with GPS & dispatch
│   │   ├── ContactsPage.tsx    # Emergency Contact Manager
│   │   ├── SafetyToolsPage.tsx # Safety Tools & Deterrence Hub
│   │   ├── FakeCallPage.tsx    # Fake Incoming Call Simulator & Audio Engine
│   │   ├── SirenPage.tsx       # Acoustic Emergency Siren Synthesizer
│   │   ├── StrobePage.tsx      # Visual Emergency Strobe Beacon
│   │   ├── RecorderPage.tsx    # Live Microphone Audio Evidence Recorder
│   │   ├── EvidencePage.tsx    # Evidence Vault (IndexedDB audio management)
│   │   ├── HistoryPage.tsx     # Incident Audit Trail & JSON export
│   │   └── SettingsPage.tsx    # Profile, Safety Calibrations & Permissions
│   ├── services/
│   │   ├── storageService.ts   # Safe localStorage serialization & versioning
│   │   ├── indexedDBService.ts # IndexedDB audio Blob transactions & quota query
│   │   ├── geolocationService.ts# GPS coordinates acquisition & age formatting
│   │   ├── whatsappService.ts  # WhatsApp link generation & message sanitization
│   │   ├── motionService.ts    # DeviceMotionEvent shake calibration & iOS support
│   │   ├── fakeCallService.ts  # Telecom ring synthesis & Speech synthesis voice
│   │   ├── sirenService.ts     # Web Audio API emergency oscillating siren
│   │   ├── recordingService.ts # MediaRecorder audio capture lifecycle
│   │   ├── batteryService.ts   # Battery Status API detection
│   │   ├── incidentService.ts  # Local verifiable incident auditing
│   │   └── sosService.ts       # SOS engine orchestrating dispatch & haptics
│   ├── hooks/
│   │   ├── useOnlineStatus.ts  # Reactive network status hook
│   │   ├── useBattery.ts       # Reactive battery state hook
│   │   ├── useShakeDetection.ts# Accelerometer shake listener hook
│   │   └── usePWAInstall.ts    # PWA install prompt handler hook
│   ├── store/
│   │   └── useAppStore.ts      # Zustand state store
│   ├── tests/
│   │   ├── setup.ts            # Vitest mocks for AudioContext, Geo & Vibration
│   │   ├── whatsappService.test.ts
│   │   ├── storageService.test.ts
│   │   ├── geolocationService.test.ts
│   │   ├── incidentService.test.ts
│   │   ├── sirenService.test.ts
│   │   └── sosWorkflow.test.tsx
│   ├── types/
│   │   └── index.ts            # Complete TypeScript domain models
│   ├── index.css               # Tailwind CSS v4 design tokens and keyframe rules
│   └── main.tsx                # React DOM root mounting
├── index.html                  # HTML5 shell with PWA manifest & mobile meta tags
├── vite.config.ts              # Vite + React + Tailwind + VitePWA + Vitest config
├── tsconfig.json               # TypeScript workspace configuration
└── package.json
```

---

## 6. Installation & Execution

### Prerequisites
- Node.js (v18 or higher; tested on v24)
- npm (v9 or higher)

### Installation
```bash
git clone <repository-url>
cd safeher
npm install
```

### Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your mobile browser or desktop browser with responsive mode enabled.

### Run Automated Tests
```bash
# Execute unit and integration tests
npm test

# Run tests in interactive watch mode
npm run test:watch
```

### Production Build
```bash
npm run build
```
Generates an optimized, precached PWA bundle in the `dist/` folder, including `sw.js`, workbox runtime, and web manifest.

### Preview Production Build
```bash
npm run preview
```

---

## 7. Browser Compatibility Matrix

| Feature | Android Chrome | iOS Safari | Desktop Chrome / Edge | Firefox |
|---|---|---|---|---|
| **PWA Installation** | Full Support | Add to Home Screen | Full Support | Limited |
| **Geolocation (GPS)** | Full Support | Full Support (HTTPS) | Full Support | Full Support |
| **WhatsApp Deep Links** | Direct App Launch | Direct App Launch | Web / App Launch | Web / App Launch |
| **Web Audio Siren** | Full Support | Full Support (User gesture)| Full Support | Full Support |
| **Microphone Recording**| Full Support | Full Support (iOS 14.3+) | Full Support | Full Support |
| **IndexedDB Audio Storage**| Full Support | Full Support | Full Support | Full Support |
| **Shake Detection** | Full Support | Full Support (iOS 13+ opt-in)| Unsupported (No accelerometer)| Unsupported on desktop |
| **Vibration API** | Full Support | Unsupported by WebKit | Unsupported on PC | Unsupported on PC |
| **Battery Status API**| Full Support (Chrome Android)| Unsupported by Apple | Full Support | Unsupported |

*Note: For features unsupported by a particular platform (e.g. Battery Status or Vibration on iOS), SafeHer provides clear fallback UI states without application errors.*

---

## 8. Deployment Procedure

SafeHer requires **HTTPS** in production so that service workers, geolocation, and microphone APIs can function securely.

### Deploying to Vercel
1. Install the Vercel CLI: `npm i -g vercel`
2. Run `vercel` in the project root directory.
3. Accept the default build command (`npm run build`) and output directory (`dist`).

### Deploying to Netlify
1. Connect your repository to Netlify.
2. Set Build Command: `npm run build`
3. Set Publish Directory: `dist`
4. Add a `_redirects` file in `public/` containing: `/*    /index.html   200` to support client-side routing.

---

## 9. Feature Completion Checklist

- [x] Modern React 19 + TypeScript + Vite + Tailwind CSS v4 architecture
- [x] Responsive layout with Mobile First design and dark mode toggle
- [x] Comprehensive 3-slide Onboarding flow with transparent permission requests
- [x] Circular Hold-for-SOS activation button with haptic feedback & 1-tap accessibility fallback
- [x] GPS acquisition with fresh accuracy calculation and cached-location fallback with age indication
- [x] WhatsApp emergency message preparation with Google Maps URL and medical notes
- [x] Emergency Contacts manager with localStorage persistence, primary designation, and ping testing
- [x] Shake-to-SOS accelerometer detector with calibration slider and test mode
- [x] Simulated Fake Incoming Call with custom caller, delay countdown, synthetic ringing, vibration, and synthesized voice conversation
- [x] Synthesized oscillating acoustic siren via Web Audio API (650Hz – 1250Hz) with volume control
- [x] Visual Emergency Strobe flasher with photosensitivity warning and steady-light alternative
- [x] Combined Emergency Deterrence mode (simultaneous siren + audio evidence recording)
- [x] Microphone Audio Evidence Recorder with runtime MIME detection and IndexedDB binary Blob storage
- [x] Evidence Vault page with playback, export to disk, renaming, and storage quota indicators
- [x] Battery Status API monitoring with genuine browser detection and low battery alerts
- [x] Incident history audit trail with filtering and full JSON export
- [x] PWA Web App Manifest, maskable icons, and service worker precaching for offline support
- [x] Vitest automated test suite with 17 passing unit and integration tests
- [x] Zero-server, zero-cloud data guarantee ensuring absolute privacy for women's personal safety

---

## 10. License & Academic Attribution
Developed as an Internet Programming University Capstone Project. SafeHer is released under the **MIT License**.
