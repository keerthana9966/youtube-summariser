import re
from typing import Optional

from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api._errors import (
    CouldNotRetrieveTranscript,
    NoTranscriptFound,
    TranscriptsDisabled,
    VideoUnavailable,
)

_api = YouTubeTranscriptApi()
_PREFERRED_LANGUAGES = ["en"]


def extract_video_id(url: str) -> Optional[str]:
    patterns = [
        r"(?:youtube\.com/watch\?v=|youtu\.be/|youtube\.com/embed/|youtube\.com/v/)([a-zA-Z0-9_-]{11})",
        r"youtube\.com/shorts/([a-zA-Z0-9_-]{11})",
    ]
    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    if re.fullmatch(r"[a-zA-Z0-9_-]{11}", url.strip()):
        return url.strip()
    return None


def _transcript_to_text(fetched) -> str:
    return " ".join(snippet.text for snippet in fetched)


def _select_transcript(transcript_list):
    """Pick the best transcript, supporting manual and auto-generated captions."""
    try:
        return transcript_list.find_transcript(_PREFERRED_LANGUAGES)
    except NoTranscriptFound:
        pass

    for transcript in transcript_list:
        if not transcript.is_generated:
            return transcript

    for transcript in transcript_list:
        if transcript.is_generated:
            return transcript

    return None


def fetch_transcript(video_id: str) -> str:
    try:
        transcript_list = _api.list(video_id)
        transcript = _select_transcript(transcript_list)
        if transcript is None:
            raise ValueError("No transcript available for this video.")

        return _transcript_to_text(transcript.fetch())

    except TranscriptsDisabled:
        raise ValueError("Transcripts are disabled for this video.") from None
    except VideoUnavailable:
        raise ValueError("Video is unavailable or does not exist.") from None
    except NoTranscriptFound:
        raise ValueError("No transcript found for this video.") from None
    except CouldNotRetrieveTranscript as exc:
        raise ValueError(str(exc)) from exc
    except ValueError:
        raise
    except Exception as exc:
        raise ValueError(f"Failed to fetch transcript: {exc}") from exc
