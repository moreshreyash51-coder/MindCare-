# MindCare — Cognitive Health & Memory Assistance

MindCare is an accessible, senior-friendly cognitive support and memory assistance web application built for elderly patients with early-stage cognitive decline (dementia/Alzheimer's) and their family caregivers.

---

## 🚀 Fast Start on Localhost

MindCare is designed to run seamlessly in the terminal with zero mandatory external configuration.

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Development Server
```bash
npm run dev
```

Open your browser to:
```
http://localhost:3000
```

The Express backend and Vite frontend start together on port `3000`.

---

## 🛠 Available Terminal Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the Express server with Vite middleware on `http://localhost:3000` |
| `npm run build` | Builds the production Vite bundle and bundles `server.ts` into `dist/server.cjs` |
| `npm start` | Runs the compiled production server (`node dist/server.cjs`) |
| `npm run lint` | Runs TypeScript type checking (`tsc --noEmit`) |
| `npm run clean` | Cleans previous build artifacts in `dist/` |

---

## ⚙️ Environment Variables (Optional)

Copy `.env.example` to `.env` if you wish to configure optional external services:

```env
# Optional: Google Gemini API key for AI Voice & Camera assistance
GEMINI_API_KEY=""

# Optional: MongoDB connection string (falls back to built-in resilient in-memory database automatically)
MONGODB_URI="mongodb://localhost:27017/mindcare"

# Optional: JWT Secret for authentication sessions
JWT_SECRET="mindcare_super_secret_jwt_key_2026"

# Port (defaults to 3000)
PORT=3000
```

> **Note:** If `MONGODB_URI` or `GEMINI_API_KEY` are not set, MindCare automatically uses its built-in resilient in-memory datastore with pre-seeded demo accounts and graceful fallback responses.

---

## 🌟 Key Features

1. **Custom Photo Uploads in Memory Book**:
   - Patients and caregivers can upload personal photos directly from their local device (PNG, JPG, WEBP), enter web image URLs, or choose from comforting presets.
   - Includes tags, dates, family member relationships, and comforting recall stories.

2. **Relaxing Songs & Music Therapy**:
   - Dedicated music section accessible to both patients and caregivers from the main activity dashboard and navigation bar.
   - Built-in library of soothing piano, acoustic, and nature melodies with high-contrast oversized playback controls.
   - Supports uploading custom audio files or adding MP3 links with Web Audio synthesis fallback.

3. **Voiceover Accessibility & Multi-Language UI**:
   - Spoken voice feedback upon switching languages, announcing the selected language natively.
   - Text-to-speech read-aloud buttons across all main sections.
   - Full UI localized into 16 languages (English, Hindi, Assamese, Bengali, Manipuri, Bodo, Mizo, Khasi, Garo, Nepali, Ao Naga, Kokborok, Spanish, French, German).

4. **Caregiver Location Tracking & Safe Zone Geofencing**:
   - Real-time GPS location updates with visual breadcrumb trail.
   - Interactive safe-zone radius configuration with wandering alert notifications.
   - Battery level monitoring and emergency contact quick-dial buttons.

5. **Cognitive Games Hub**:
   - Memory Match, Picture Recall, and Number Sequence games with adaptive gentle, balanced, and advanced difficulty levels.
