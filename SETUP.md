# CallShield - Setup & Deployment Guide

## 1. Local Development Setup

### Requirements:
- Node.js (v18+ or v20+)
- npm or yarn
- Android Studio (for Android app build)

### Step-by-Step Backend & Dashboard Launch:

1. **Install npm packages:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   Copy `.env.example` to `.env`:
   ```env
   GEMINI_API_KEY="your_gemini_api_key"
   PORT=3000
   ```

3. **Run Dev Server:**
   ```bash
   npm run dev
   ```
   Access web dashboard at `http://localhost:3000`.

---

## 2. Cloud Deployment Instructions

### Frontend (Vercel)
1. Push project repository to GitHub.
2. Connect repository on [Vercel](https://vercel.com).
3. Set Framework Preset to **Vite**.
4. Set Output Directory to `dist`.
5. Deploy!

### Backend (Render / Cloud Run)
1. Create a Web Service on [Render](https://render.com) or Cloud Run.
2. Build Command: `npm run build`
3. Start Command: `npm start`
4. Environment Variables:
   - `NODE_ENV`: `production`
   - `GEMINI_API_KEY`: *(Optional for AI pattern analysis)*

---

## 3. Android Kotlin Integration Guide

1. Open Android Studio → **Open existing project** or create a new Android app with package `com.callshield.app`.
2. Ensure your `build.gradle.kts` includes Retrofit, Gson, and Room Database dependencies.
3. Replace `BASE_URL` in `CallShieldApi.kt` with your deployed backend server URL.
4. Run application on a physical Android test device (Emulators may not receive cellular ringing broadcasts).
5. Accept permissions on device startup:
   - Read Phone State
   - Read Call Log
   - Answer Phone Calls
