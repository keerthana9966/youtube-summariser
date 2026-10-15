<div align="center">

# 🎬 YouTube Summarizer AI

### High-Performance, Fault-Tolerant Video Intelligence Platform
*Transform hours of video content into structured insights, executive summaries, and actionable key points in seconds.*

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Render-00c7b7.svg?style=for-the-badge&logo=render&logoColor=white)](https://youtube-summariser-k4lk.onrender.com/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688.svg?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18+-61DAFB.svg?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org)
[![Vite](https://img.shields.io/badge/Vite-6.0+-646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4+-38B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Google Gemini](https://img.shields.io/badge/Google%20Gemini-2.5%20Flash-4285F4.svg?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

### 🌐 **Live Application:** [https://youtube-summariser-k4lk.onrender.com](https://youtube-summariser-k4lk.onrender.com/)

[Try Live Demo](https://youtube-summariser-k4lk.onrender.com/) • [Architecture](#-system-architecture) • [Engineering Highlights](#-engineering-highlights--technical-decisions) • [Quick Start](#-quick-start) • [API Docs](#-rest-api-documentation)

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
- **✨ Distraction-Free Minimalist UI:**
  - Modern, elegant light aesthetic with crisp typography, streamlined single-input workflow, instant example links, and 1-click clipboard copy. No unnecessary setup or clutter.

---

## 🏗️ System Architecture

```
                                  [ User Client / Browser ]
                                              │
                                              ▼
                         [ Minimalist React 18 + Vite SPA ]
                         • Clean, Distraction-Free Light Theme
                         • Single-Input Instant Summarization
                         • Formatted Markdown Reader & 1-Click Copy
                                              │
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

- **Frontend:** React 18, Vite, Tailwind CSS, Google Fonts (*Plus Jakarta Sans*), Minimalist UX/UI.
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

### Live Production URL
The platform is live and publicly accessible on Render:
👉 **[https://youtube-summariser-k4lk.onrender.com](https://youtube-summariser-k4lk.onrender.com/)**

### Deploying Your Own Instance on Render
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
  "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
}
```

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
- **Live Demo:** [youtube-summariser-k4lk.onrender.com](https://youtube-summariser-k4lk.onrender.com/)
- **GitHub:** [@keerthana9966](https://github.com/keerthana9966)  
- **Project Repository:** [keerthana9966/youtube-summariser](https://github.com/keerthana9966/youtube-summariser)

*If you found this project helpful, feel free to ⭐ star the repository!*
