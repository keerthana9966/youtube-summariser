from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.summarizer import summarize_transcript
from app.services.transcript import extract_video_id, fetch_transcript

router = APIRouter(prefix="/api", tags=["summarize"])


class SummarizeRequest(BaseModel):
    url: str = Field(..., min_length=1, description="YouTube video URL or video ID")


class SummarizeResponse(BaseModel):
    video_id: str
    summary: str
    transcript_length: int


@router.post("/summarize", response_model=SummarizeResponse)
async def summarize_video(request: SummarizeRequest):
    video_id = extract_video_id(request.url)
    if not video_id:
        raise HTTPException(
            status_code=400,
            detail="Invalid YouTube URL. Please provide a valid YouTube video link.",
        )

    try:
        transcript = fetch_transcript(video_id)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    try:
        summary = summarize_transcript(transcript)
    except ValueError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate summary: {exc}",
        ) from exc

    return SummarizeResponse(
        video_id=video_id,
        summary=summary,
        transcript_length=len(transcript),
    )


@router.get("/health")
async def health_check():
    return {"status": "ok"}
