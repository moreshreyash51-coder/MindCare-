# 🧠 MindCare — Cognitive Health & Memory Assistance

MindCare is an accessible, senior-friendly cognitive support and memory assistance web application built for elderly individuals experiencing memory challenges (mild cognitive impairment, dementia, Alzheimer's) and their family caregivers.

---

## ⚡ Instant Run on Localhost (Zero Configuration Required)

MindCare is built to run out-of-the-box on `http://localhost:3000` with **no required database installations or external API keys**. It includes a resilient, self-seeding in-memory datastore with demo accounts and graceful fallbacks.

### Prerequisites
- Node.js 18+ (Node.js 20 or 22 recommended)
- npm 9+

### 1. Clone & Install Dependencies
```bash
git clone <your-repo-url>
cd mindcare
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

Open your browser and navigate to:
```
http://localhost:3000
```
- Frontend (Vite) and backend (Express) run simultaneously on port `3000`.
- API health check: `http://localhost:3000/api/health`
- Database status: `http://localhost:3000/api/db/status`

---

## 🚀 Production Build & Local Test

To test the optimized production build on localhost:

```bash
# 1. Clean and build client + server bundles
npm run build

# 2. Launch the compiled production server
npm start
```

MindCare will start on `http://localhost:3000` (or the port specified by the `PORT` environment variable).

---

## 🔑 Demo Login Accounts

Pre-seeded accounts are loaded automatically into both local in-memory storage and MongoDB:

| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **Patient** | `eleanor@example.com` | `password123` | Eleanor Vance (Large buttons, spoken cues, safe zone in Maplewood, NJ) |
| **Caregiver** | `sarah@example.com` | `password123` | Sarah Vance (Caregiver view, GPS geofencing, daily schedule manager) |
| **Patient 2** | `arthur@example.com` | `password123` | Arthur Vance (Gentle cognitive games & nostalgia reminders) |

---

## 🐳 Easy Docker Deployment

### Run with Docker:
```bash
# Build the production image
docker build -t mindcare .

# Run the container
docker run -p 3000:3000 mindcare
```
Then visit `http://localhost:3000`.

### Run with Docker Compose:
```bash
docker compose up -d
```

---

## ☁️ Cloud Deployment Guides

### 1. Google Cloud Run
MindCare is packaged with a multi-stage `Dockerfile` and listens on `0.0.0.0:${PORT}`:
```bash
gcloud run deploy mindcare \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 3000
```

### 2. Render / Railway
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`
- **Health Check Path**: `/api/health`
- **Port**: Automatic (MindCare reads `process.env.PORT`)

---

## ⚙️ Environment Variables (Optional)

Create a `.env` file in the root directory if you want to enable external MongoDB or Gemini AI capabilities:

```env
# Optional: Google Gemini API key for AI assistant features (Voice Chat, Photo Recall)
GEMINI_API_KEY=""

# Optional: MongoDB connection URI (e.g. MongoDB Atlas or local mongod)
# If omitted, MindCare uses the built-in resilient datastore automatically.
MONGODB_URI="mongodb://localhost:27017/mindcare"

# Optional: JWT Secret for session authentication
JWT_SECRET="mindcare_super_secret_jwt_key_2026"

# Optional: Port override (defaults to 3000)
PORT=3000
```

---

## 🛠 Available Terminal Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts Express server with Vite middleware on `http://localhost:3000` |
| `npm run build` | Compiles Vite frontend & bundles `server.ts` into `dist/server.cjs` |
| `npm start` | Executes the production bundle (`node dist/server.cjs`) |
| `npm run lint` | Runs TypeScript type verification (`tsc --noEmit`) |
| `npm run clean` | Deletes existing `dist/` build directory |
