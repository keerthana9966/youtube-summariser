from typing import Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.config import settings
from app.services.summarizer import summarize_transcript
from app.services.transcript import (
    extract_video_id,
    fetch_transcript_or_fallback,
)

router = APIRouter(prefix="/api", tags=["summarize"])


class SummarizeRequest(BaseModel):
    url: str = Field(..., min_length=1, description="YouTube video URL or video ID")
    style: Optional[str] = Field("standard", description="Summary style: standard, detailed, tldr, actionable")
    api_key: Optional[str] = Field(None, description="Optional custom Gemini API key")


class SummarizeResponse(BaseModel):
    video_id: str
    title: str
    author: str
    thumbnail_url: str
    summary: str
    source: str
    model_used: str
    transcript_length: int


@router.post("/summarize", response_model=SummarizeResponse)
async def summarize_video(request: SummarizeRequest):
    video_id = extract_video_id(request.url)
    if not video_id:
        raise HTTPException(
            status_code=400,
            detail=(
                "Invalid YouTube URL. Please provide a valid YouTube link "
                "(e.g., https://www.youtube.com/watch?v=..., https://youtu.be/..., or Shorts/Live link)."
            ),
        )

    try:
        content_data = fetch_transcript_or_fallback(video_id)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch content for video: {exc}",
        ) from exc

    transcript_text = content_data["text"]
    title = content_data["title"]
    author = content_data["author"]
    thumbnail_url = content_data["thumbnail_url"]
    source = content_data["source"]

    try:
        summary, model_used = summarize_transcript(
            transcript=transcript_text,
            title=title,
            author=author,
            style=request.style or "standard",
            user_api_key=request.api_key,
        )
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate summary: {exc}",
        ) from exc

    return SummarizeResponse(
        video_id=video_id,
        title=title,
        author=author,
        thumbnail_url=thumbnail_url,
        summary=summary,
        source=source,
        model_used=model_used,
        transcript_length=len(transcript_text),
    )


@router.get("/config")
async def get_config():
    return {
        "has_backend_gemini_key": bool(settings.gemini_api_key.strip()),
        "default_model": settings.gemini_model,
    }


@router.get("/health")
async def health_check():
    return {"status": "ok"}
