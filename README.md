# SkamGuard 🛡️

**Malaysia's Real-Time AI Scam Defense Companion**

> 🏆 Project 2030: MyAI Future Hackathon — Track 5: Secure Digital (FinTech & Security)
>
> Build with AI 2026

---

Malaysia is facing a severe scam crisis:

- **RM 1.57 billion** lost to scams in 2024 alone (↑84% from 2022)
- **35,368 cases** reported — with ~70% going unreported
- **95% are Authorised Fraud** — victims unknowingly transfer money themselves
- **450+ deepfake/voice cloning cases** detected in 2025
- Only **2% of stolen funds** are ever recovered

Every existing tool in Malaysia (Semak Mule, NSRC 997, BNM Alert List) is **reactive** — they only work *after* money is already lost.

**SkamGuard is different.** It's a **proactive, real-time** defense tool that protects Malaysians *at the moment they receive a suspicious message* — before any money leaves their account.

---

## 🔍 What SkamGuard Does

Upload a screenshot or paste a suspicious message, and SkamGuard's AI pipeline instantly:

1. **Extracts** all text, URLs, and phone numbers (OCR for images)
2. **Checks URLs** against VirusTotal + domain age + TLD risk + Malaysian bank phishing detection
3. **Checks phone numbers** against local scammer database + community reports + Semak Mule
4. **Analyzes content** using Gemini AI with Malaysian scam pattern knowledge
5. **Calculates a Risk Score** (0–100) with a clear verdict: `SAFE`, `SUSPICIOUS`, or `DANGEROUS`
6. **Provides an action plan** in Bahasa Malaysia or English — practical steps to protect yourself

### Key Features

- 🖼️ **Screenshot Analysis** — Snap a screenshot of a WhatsApp/SMS message, SkamGuard reads it
- 🔗 **URL Intelligence** — VirusTotal scan, domain age check, free domain detection, bank phishing comparison
- 📱 **Phone Number Verification** — Cross-references local DB, community reports, and Semak Mule portal
- 🧠 **RAG-Powered Context** — Vertex AI Search provides up-to-date scam pattern knowledge
- 🌐 **Bilingual** — Full support for Bahasa Malaysia and English
- 📊 **Risk Report** — Visual risk gauge, red flags list, scam type identification, and numbered action plan

---

## 🏗️ Architecture

```
User submits text/image/phone on /scan
         │
         ▼
POST /api/analyze (server-side only)
         │
         ▼
Genkit Orchestrator Flow (4-step pipeline)
  │
  ├── Step 1: EXTRACTION (Gemini 2.0 Flash — multimodal OCR)
  │
  ├── Step 2: PARALLEL TOOL CALLS
  │   ├── URL Checker (VirusTotal + heuristics + bank phishing)
  │   ├── Phone Checker (local DB + Firebase community reports)
  │   └── RAG Search (Vertex AI Search — scam patterns KB)
  │
  ├── Step 3: DEEP ANALYSIS (Gemini — evidence-based scoring)
  │
  └── Step 4: RISK SCORING (composite 0–100 score)
         │
         ▼
Risk Report displayed on /report
```

### Security-First Design

All AI and third-party API calls are **server-side only** — no API keys are ever exposed to the browser. The client only communicates with `/api/*` routes.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router, TypeScript, Turbopack) |
| **Styling** | Tailwind CSS v4 |
| **UI Components** | Custom components with Lucide React icons |
| **State Management** | Zustand |
| **Validation** | Zod (shared frontend + backend schemas) |
| **AI Model** | Gemini 2.0 Flash (via Firebase Genkit) |
| **AI Orchestrator** | Firebase Genkit (flows, tool calling) |
| **RAG** | Vertex AI Search (scam patterns knowledge base) |
| **URL Security** | VirusTotal API v3 |
| **Phone Verification** | Local JSON DB + Firebase Firestore |
| **Deployment** | Google Cloud Run (Docker, `asia-southeast1`) |
| **Secrets** | Google Cloud Secret Manager |
| **i18n** | Custom JSON-based (BM/EN) |

---

## 🚀 Getting Started

### Prerequisites

- Node.js ≥ 20.0.0
- npm

### Local Development

```bash
# Clone the repo
git clone https://github.com/bilalarief/SkamGuard.git
cd SkamGuard

# Install dependencies
npm install

# Copy env template and fill in your values
cp .env.example .env.local

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Environment Variables

See [`.env.example`](.env.example) for the full template. Key variables:

| Variable | Description | Required |
|---|---|---|
| `GOOGLE_GENAI_API_KEY` | Gemini API key from [AI Studio](https://aistudio.google.com/apikey) | ✅ |
| `VIRUSTOTAL_API_KEY` | VirusTotal API key | Optional |
| `GOOGLE_CLOUD_PROJECT_ID` | GCP project ID (for Vertex AI) | Optional |
| `NEXT_PUBLIC_FIREBASE_*` | Firebase client config | For community reports |

---

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages + API routes
│   ├── api/                # Server-side endpoints (analyze, check-url, check-phone)
│   ├── scan/               # Scan input page
│   ├── report/             # Risk report display
│   └── history/            # Analysis history
├── components/             # UI components (home, scan, report, shared)
├── lib/
│   ├── ai/                 # Genkit flows, tools, prompts, scoring
│   ├── firebase/           # Firebase client + Firestore operations
│   ├── utils/              # Sanitization, formatting
│   └── constants/          # Risk thresholds, scam types
├── hooks/                  # Custom React hooks
├── store/                  # Zustand state management
├── types/                  # TypeScript type definitions
├── i18n/                   # Bilingual translations (ms.json, en.json)
└── data/                   # Static data (scammer phones, bank domains)
```

---

## 🤖 AI-Assisted Development Disclosure

This project was built with the assistance of **AI coding tools**, specifically [Google Antigravity](https://developers.google.com/) (AI coding assistant). The AI was used as a pair programming partner throughout the development process for:

- Architecture design and code structure
- Implementation of features and components
- Debugging and troubleshooting
- Deployment configuration

**Every line of code** in this project is understood, reviewed, and can be fully explained and defended by the development team. The AI served as a productivity tool — all design decisions, product direction, and final implementation choices were made by the human developers.

---

## 👥 Team

Built for the **Project 2030: MyAI Future Hackathon** by GDG On Campus UTM.

---

## 📄 License

MIT
