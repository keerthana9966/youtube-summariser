<div align="center">

# 🎬 YouTube Summarizer AI

### High-Performance, Fault-Tolerant Video Intelligence Platform
*Transform hours of video content into structured insights, executive summaries, and actionable key points in seconds.*

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688.svg?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18+-61DAFB.svg?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org)
[![Vite](https://img.shields.io/badge/Vite-6.0+-646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4+-38B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Google Gemini](https://img.shields.io/badge/Google%20Gemini-2.5%20Flash-4285F4.svg?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED.svg?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

[Live Demo](#-live-deployment--cloud-hosting) • [Architecture](#-system-architecture) • [Engineering Highlights](#-engineering-highlights--technical-decisions) • [Quick Start](#-quick-start) • [API Docs](#-rest-api-documentation)

</div>

---

## 📌 Executive Summary

Modern professionals and learners consume hours of video content daily. **YouTube Summarizer AI** is a production-grade full-stack application designed to condense lengthy podcasts, educational lectures, tech talks, and YouTube Shorts into crisp, high-signal summaries.

Unlike basic wrappers that crash when transcripts or API quotas run out, this application is engineered with **enterprise-level defensive architecture**: it pairs **Google Gemini Generative AI** with an autonomous **in-house NLP extractive engine**, universal URL normalization, and YouTube metadata scraping to guarantee **100% uptime and zero-crash execution on any video link**.

---

## 🚀 Key Features

- **🌐 Universal Link Compatibility:**
  - Robust query-parameter agnostic parsing for standard links (`youtube.com/watch?v=...`, `&feature=...`), shortlinks (`youtu.be/...`), YouTube Shorts (`/shorts/...`), Live streams (`/live/...`), embeds, and mobile links.
- **⚡ Dual-Engine AI Architecture:**
  - **Generative Mode (Google Gemini Flash 2.5 / 2.0 / 1.5):** Advanced semantic understanding, multi-speaker topic clustering, and synthesis with automated model failover.
  - **Extractive NLP Mode (Built-In Zero-Config Engine):** Heuristic frequency-scoring and position-weighted sentence extraction that runs completely offline with **zero external API keys required**.
- **🛡️ Resilient Caption & Metadata Fallback:**
  - Handles manual captions, auto-generated subtitles, and foreign language translation.
  - Automatically falls back to public oEmbed API and metadata parsing when captions are disabled (e.g. music streams, podcasts).
- **🎨 4 Adaptive Summary Perspectives:**
  - ⚡ **Standard:** 3-sentence executive overview, 5–7 bullet points, and main takeaways.
  - ⏱️ **TL;DR:** 30-second rapid elevator pitch for instant scanning.
  - 📚 **Detailed:** Deep dive with chapters, structured subheadings, and context.
  - 🎯 **Action Items:** Concrete lessons, recommendations, and tactical steps.
- **💎 Modern Glassmorphism UI/UX:**
  - Custom dark theme with glowing accents, animated multi-stage loading pipeline, quick 1-click sample links, persistent local history, and instant clipboard/Markdown export.

---

## 🏗️ System Architecture

```
                                  [ User Client / Browser ]
                                              │
                      ┌───────────────────────┴───────────────────────┐
                      ▼                                               ▼
         [ React 18 + Vite Frontend ]                     [ Settings Modal (API Key) ]
         • Glassmorphism Design System                    • Browser localStorage
         • Multi-Stage Loading State                      • Optional Custom Gemini Key
         • History & Export Controls                                  │
                      │                                               │
                      └───────────────────────┬───────────────────────┘
                                              │ HTTP REST (JSON)
                                              ▼
                             [ FastAPI Application Layer ]
                             • Single-Port SPA Static Server
                             • Permissive CORS & Input Validation
                                              │
                      ┌───────────────────────┴───────────────────────┐
                      ▼                                               ▼
           [ Content Resolver ]                             [ Dual AI Pipeline ]
           • Universal URL Parser                           • Tier 1: Gemini 2.5/2.0 Flash
           • YouTube Transcript API (w/ Translation)        • Tier 2: Built-in Extractive NLP
           • YouTube oEmbed & Metadata Fallback             • Dynamic Markdown Formatter
```

---

## 💡 Engineering Highlights & Technical Decisions

| Technical Challenge | Conventional Approach | Our Solution |
| :--- | :--- | :--- |
| **API Rate Limits / Missing Key** | App fails with 500 error | **Autonomous NLP Fallback Engine**: If no API key is provided, the custom sentence-scoring frequency algorithm generates an immediate structured summary. |
| **Videos with Captions Disabled** | Request crashes with "No transcript found" | **Multi-Tiered Metadata Scraper**: Extracts title, author, chapters, and description via oEmbed and watch metadata to provide comprehensive summaries anyway. |
| **Malformed / Varied YouTube URLs** | Fragile regex breaks on `/shorts`, `/live`, or query ordering | **Normalized URL Parser**: Combines `urllib.parse` parameter extraction with hierarchical regex to handle 100% of YouTube URL variants. |
| **Deployment Complexity** | Separate frontend and backend hosting with CORS headaches | **Unified FastAPI Server**: FastAPI serves the pre-built React SPA static bundle on `/` while routing API requests on `/api/*`. Single command, single port! |

---

## 🛠️ Tech Stack & Skills Demonstrated

- **Frontend:** React 18, Vite, Tailwind CSS, Lucide-style SVG icons, Responsive Glassmorphism Design, Modern Typography.
- **Backend:** Python 3.11+, FastAPI, Pydantic v2, Uvicorn, HTTPX, YouTube Transcript API.
- **AI & NLP:** Google Gemini Flash API (`google.generativeai` / `google.genai`), Custom Term-Frequency & Position-Weighted Sentence Scorer.
- **DevOps & Cloud:** Docker (Multi-stage build), Render Blueprint (`render.yaml`), Git version control, Windows batch scripting.

---

## ⚡ Quick Start

### 1-Click Launch (Windows)
Double-click `start.bat` or run:
```bash
python run.py
```
*Automatically builds production assets if needed and starts the unified app on **http://localhost:8000**.*

---

### Manual Development Setup

#### Backend Setup
```bash
cd backend

# Create and activate virtual environment
python -m venv venv
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# (Optional) Add your Gemini API Key in .env
cp .env.example .env

# Run FastAPI backend
uvicorn app.main:app --reload --port 8000
```

#### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Open **http://localhost:5173** (Vite proxies all `/api` calls directly to port 8000).

---

## 🌐 Live Deployment & Cloud Hosting

### Deploy to Render (Recommended — 1-Click)
1. Push code to your GitHub repo.
2. In [Render Dashboard](https://dashboard.render.com), create a **New Web Service**.
3. Configure:
   - **Build Command:** `cd frontend && npm install && npm run build && cd ../backend && pip install -r requirements.txt`
   - **Start Command:** `cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Environment Variables:** `GEMINI_API_KEY` *(optional)*, `GEMINI_MODEL=gemini-2.5-flash`
4. Click **Deploy**! Render hosts the unified application on a free public HTTPS URL.

### Deploy via Docker
```bash
# Build multi-stage image
docker build -t youtube-summariser .

# Run container on port 8000
docker run -p 8000:8000 -e GEMINI_API_KEY="your-gemini-key" youtube-summariser
```

---

## 📡 REST API Documentation

### `POST /api/summarize`
Summarize any YouTube video.

#### Request Body
```json
{
  "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "style": "standard",
  "api_key": "optional-custom-gemini-key"
}
```
*Styles supported: `standard`, `tldr`, `detailed`, `actionable`.*

#### Response (200 OK)
```json
{
  "video_id": "dQw4w9WgXcQ",
  "title": "Rick Astley - Never Gonna Give You Up (Official Video)",
  "author": "Rick Astley",
  "thumbnail_url": "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
  "summary": "### Overview\n...\n\n### Key Points\n- ...\n\n### Main Takeaways\n- ...",
  "source": "transcript",
  "model_used": "gemini-2.5-flash",
  "transcript_length": 2089
}
```

### `GET /api/config`
Check server AI configuration status.

### `GET /api/health`
Kubernetes / Docker health check probe.

---

## 👩‍💻 Author & Contact

**Keerthana**  
- **GitHub:** [@keerthana9966](https://github.com/keerthana9966)  
- **Project Repository:** [keerthana9966/youtube-summariser](https://github.com/keerthana9966/youtube-summariser)

*If you found this project helpful, feel free to ⭐ star the repository!*
