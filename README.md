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

### 1. Vercel (Full-Stack Frontend + Backend Serverless)
MindCare is configured for direct 1-click Vercel deployment with preconfigured `vercel.json` and serverless API handlers in `/api`:
1. Push this repository to GitHub, GitLab, or Bitbucket.
2. In Vercel, click **Add New Project** and import your repository.
3. Vercel automatically detects the build configuration:
   - **Framework Preset**: Vite
   - **Build Command**: `vite build`
   - **Output Directory**: `dist`
4. *(Optional)* Under **Environment Variables**, add:
   - `GEMINI_API_KEY`: Your Google Gemini API key (for AI voice, chat, vision)
   - `MONGODB_URI`: Your MongoDB Atlas URI (if omitted, runs on built-in resilient datastore)
   - `JWT_SECRET`: Any random secure string (defaults to built-in fallback)
5. Click **Deploy**! Your entire frontend, SPA routing, and backend API endpoints (`/api/*`) are live instantly with zero configuration errors.

### 2. Google Cloud Run
MindCare is packaged with a multi-stage `Dockerfile` and listens on `0.0.0.0:${PORT}`:
```bash
gcloud run deploy mindcare \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 3000
```



---



---

## 🛠 Available Terminal Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts Express server with Vite middleware on `http://localhost:3000` |
| `npm run build` | Compiles Vite frontend & bundles `server.ts` into `dist/server.cjs` |
| `npm start` | Executes the production bundle (`node dist/server.cjs`) |
| `npm run lint` | Runs TypeScript type verification (`tsc --noEmit`) |
| `npm run clean` | Deletes existing `dist/` build directory |
