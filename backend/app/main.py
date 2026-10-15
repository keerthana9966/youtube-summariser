import os
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from app.routes.summarize import router as summarize_router

app = FastAPI(
    title="YouTube Summarizer API",
    description="AI-powered YouTube video summarizer API",
    version="1.1.0",
)

# Open CORS configuration for easy local development and cloud hosting
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(summarize_router)


@app.get("/health")
async def health():
    return {"status": "ok"}


# Detect if frontend production build exists
# Candidates:
# 1. ../frontend/dist (relative to app/main.py)
# 2. ./frontend/dist (relative to root)
candidate_dists = [
    Path(__file__).resolve().parent.parent.parent / "frontend" / "dist",
    Path("frontend/dist").resolve(),
    Path("../frontend/dist").resolve(),
]

frontend_dist = None
for dist_path in candidate_dists:
    if dist_path.exists() and (dist_path / "index.html").exists():
        frontend_dist = dist_path
        break

if frontend_dist:
    assets_dir = frontend_dist / "assets"
    if assets_dir.exists():
        app.mount("/assets", StaticFiles(directory=str(assets_dir)), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        # Don't intercept API routes
        if full_path.startswith("api/") or full_path == "api":
            return {"error": "Not found"}
        target_file = frontend_dist / full_path
        if target_file.is_file():
            return FileResponse(target_file)
        return FileResponse(frontend_dist / "index.html")
else:
    @app.get("/")
    async def root():
        return {
            "message": "YouTube Summarizer API is running",
            "docs": "/docs",
            "health": "/health",
        }
