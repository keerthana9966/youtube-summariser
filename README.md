# YouTube Summarizer

An AI-powered web app that summarizes YouTube videos by fetching their transcripts and generating concise summaries using OpenAI.

## Project Structure

```
youtube-summariser/
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── main.py          # FastAPI app entry point
│   │   ├── config.py        # Environment settings
│   │   ├── routes/
│   │   │   └── summarize.py # API endpoints
│   │   └── services/
│   │       ├── transcript.py  # YouTube transcript fetching
│   │       └── summarizer.py  # OpenAI summarization
│   ├── requirements.txt
│   └── .env.example
└── frontend/                # React + Tailwind frontend
    ├── src/
    │   ├── App.jsx
    │   ├── main.jsx
    │   ├── index.css
    │   └── components/
    │       └── Summarizer.jsx
    ├── package.json
    ├── vite.config.js
    └── tailwind.config.js
```

## Prerequisites

- Python 3.10+
- Node.js 18+
- OpenAI API key

## Setup

### Backend

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY
```

Run the backend:

```bash
uvicorn app.main:app --reload --port 8000
```

API docs: http://localhost:8000/docs

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

## Usage

1. Start both the backend and frontend servers
2. Paste a YouTube video URL into the input field
3. Click **Summarize** to get an AI-generated summary

## API Endpoints

| Method | Endpoint        | Description              |
|--------|-----------------|--------------------------|
| GET    | `/api/health`   | Health check             |
| POST   | `/api/summarize`| Summarize a YouTube video|

### POST /api/summarize

**Request:**
```json
{
  "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
}
```

**Response:**
```json
{
  "video_id": "dQw4w9WgXcQ",
  "summary": "...",
  "transcript_length": 4521
}
```

## Notes

- Videos must have captions/transcripts enabled
- Long transcripts are truncated to ~12,000 characters before summarization
- The frontend proxies API requests to the backend during development
