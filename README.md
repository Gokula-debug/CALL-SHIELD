# CallShield - Spam Call Detection & Blocking Platform

> **Tagline:** *"Detect. Block. Protect."*

CallShield is a full-stack spam call detection and auto-blocking ecosystem comprising a React web dashboard, Node.js + Express backend service with rule-based & AI spam analysis, REST APIs, and an Android Kotlin application (BroadcastReceiver + Foreground Service + Room Database + Retrofit client).

---

## 🌟 Architecture Overview

```
 ┌────────────────────────┐      REST API (JSON)      ┌─────────────────────────────┐
 │                        │ ◄───────────────────────► │                             │
 │ Android App (Kotlin)   │  POST /api/calls/check    │  Node.js + Express Backend  │
 │ - CallReceiver         │  POST /api/calls/log      │ - Rule Engine (0-100)       │
 │ - CallBlockerService   │                           │ - Blacklist Matching        │
 │ - Room DB              │                           │ - Telephony Pattern Analysis│
 │ - Retrofit Client      │                           │ - Gemini AI Intelligence    │
 └────────────────────────┘                           └──────────────┬──────────────┘
                                                                     │
                                                                     ▼
                                                      ┌─────────────────────────────┐
                                                      │  React.js Dashboard         │
                                                      │ - Live Stats & Charts       │
                                                      │ - Blacklist Manager         │
                                                      │ - Call Reports & Exports    │
                                                      │ - Interactive Simulator     │
                                                      │ - API Playground            │
                                                      └─────────────────────────────┘
```

---

## 🚀 Key Features

### 1. React Web Dashboard
- **Telemetry Overview:** Real-time metrics for Total Calls, Safe Calls, Spam Calls, and Blocked Calls Today.
- **Live Spam Engine Widget:** Test any phone number on the fly with risk score breakdown, recommendation badge, and reasons.
- **Traffic Telemetry Charts:** Hourly call volume distribution (Safe vs Spam) and Spam Score risk range pie visualization using Recharts.
- **Blacklist Manager:** Add, search, and delete blacklisted numbers with custom reason tags or pre-filled scam presets.
- **Reports & Export Engine:** Filter history by time (Today, Week, Month) and status (Blocked, Safe, Suspicious), export as CSV or JSON.
- **Incoming Call Interceptor Simulator:** Interactive phone device mockup to test ringing events and watch auto-rejection live.
- **Android App Source Center:** Interactive code viewer for all Kotlin Android files with copy-to-clipboard and single-file download.
- **Interactive REST API Console:** Test all backend REST APIs directly in the browser with custom JSON payloads.

### 2. Node.js + Express Backend
- **Spam Scoring Engine:** Calculates a 0-100 risk score:
  - `0 - 30`: Safe (Allowed)
  - `31 - 70`: Suspicious (Flagged)
  - `71 - 100`: Spam (Auto-Rejected)
- **Multi-layered Risk Evaluation:**
  - Blacklist matching (Score 100)
  - Toll-free spammers (`+1-800`, `+1-888`, `+1-877`, `+1-855`)
  - Wangiri One-Ring international scam prefixes
  - High-cost Premium rate traps (`+1-900`)
  - Sequential / Repetitive spoofed digit patterns
  - Frequency & burst call velocity
  - Optional Gemini AI pattern intelligence
- **Security Middlewares:** CORS, Helmet headers, Rate limiting, Input validation.

### 3. Android Kotlin Application
- **CallReceiver (`BroadcastReceiver`):** Listens for `TelephonyManager.ACTION_PHONE_STATE_CHANGED` and extracts incoming caller number.
- **CallBlockerService (`ForegroundService`):** Queries `/api/calls/check`, auto-ends spam calls using `TelecomManager.endCall()`, logs results to Room DB & REST backend.
- **Room Database (`AppDatabase`):** Local offline SQLite database caching call history.
- **Retrofit Client (`CallShieldApi`):** Clean REST network handler.

---

## 📡 REST API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/calls/check` | Evaluates phone number and returns `{ "spam": true, "score": 95, "recommendation": "REJECT" }` |
| `POST` | `/api/calls/log` | Stores a new call log entry |
| `GET` | `/api/calls` | Fetches all recorded call logs |
| `GET` | `/api/blacklist` | Fetches active blacklist directory |
| `POST` | `/api/blacklist` | Adds a number to the blacklist |
| `DELETE` | `/api/blacklist/:id` | Removes a number from the blacklist |
| `GET` | `/api/stats` | Returns system-wide statistics and chart telemetry |
| `GET` | `/api/settings` | Fetches system settings (autoReject, spamThreshold, etc.) |
| `POST` | `/api/settings` | Updates system settings |

---

## 🛠️ Installation & Setup

1. **Clone & Install Dependencies:**
   ```bash
   npm install
   ```

2. **Environment Configuration (`.env`):**
   ```env
   GEMINI_API_KEY="your_optional_gemini_api_key"
   PORT=3000
   ```

3. **Start Development Server:**
   ```bash
   npm run dev
   ```

4. **Production Build:**
   ```bash
   npm run build
   npm start
   ```

---

## 📱 Android Compilation Guide

1. Open Android Studio and create a new project with Package Name `com.callshield.app`.
2. Copy files from the **Android App Center** tab in the web dashboard into `app/src/main/java/com/callshield/app/`.
3. Set your backend URL in `CallShieldApiClient.BASE_URL`.
4. Build & install APK on your physical Android device. Grant `READ_PHONE_STATE` and `ANSWER_PHONE_CALLS` permissions when prompted.
