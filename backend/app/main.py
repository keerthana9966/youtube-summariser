from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.summarize import router as summarize_router

app = FastAPI(
    title="YouTube Summarizer API",
    description="Summarize YouTube videos from their transcripts",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(summarize_router)


@app.get("/")
async def root():
    return {"message": "YouTube Summarizer API", "docs": "/docs"}
