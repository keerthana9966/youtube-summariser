import json
import re
from typing import Optional, Tuple
from urllib.parse import parse_qs, urlparse

import httpx
from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api._errors import (
    CouldNotRetrieveTranscript,
    NoTranscriptFound,
    TranscriptsDisabled,
    VideoUnavailable,
)

_api = YouTubeTranscriptApi()
_PREFERRED_LANGUAGES = ["en", "en-US", "en-GB", "en-CA", "en-IN"]


def extract_video_id(url: str) -> Optional[str]:
    """
    Extract YouTube 11-character video ID from virtually any YouTube URL format.
    Supports:
    - https://www.youtube.com/watch?v=VIDEO_ID (any param order)
    - https://youtu.be/VIDEO_ID
    - https://www.youtube.com/shorts/VIDEO_ID
    - https://www.youtube.com/live/VIDEO_ID
    - https://www.youtube.com/embed/VIDEO_ID
    - https://m.youtube.com/watch?v=VIDEO_ID
    - https://music.youtube.com/watch?v=VIDEO_ID
    - Raw 11-character ID
    """
    if not url:
        return None

    cleaned = url.strip().strip("<>\"'")

    # Raw 11-character ID check
    if re.fullmatch(r"[a-zA-Z0-9_-]{11}", cleaned):
        return cleaned

    try:
        parsed = urlparse(cleaned)
        netloc = parsed.netloc.lower()

        # Handle youtu.be shortlinks
        if "youtu.be" in netloc:
            path_part = parsed.path.strip("/").split("/")[0]
            if re.fullmatch(r"[a-zA-Z0-9_-]{11}", path_part):
                return path_part

        # Handle standard youtube domains (youtube.com, m.youtube.com, music.youtube.com)
        if "youtube.com" in netloc:
            # Query parameter v=
            if parsed.query:
                query_params = parse_qs(parsed.query)
                if "v" in query_params and query_params["v"]:
                    vid = query_params["v"][0]
                    if re.fullmatch(r"[a-zA-Z0-9_-]{11}", vid):
                        return vid

            # Paths like /shorts/ID, /live/ID, /embed/ID, /v/ID
            path_segments = [p for p in parsed.path.split("/") if p]
            if len(path_segments) >= 2 and path_segments[0] in ("shorts", "live", "embed", "v"):
                vid = path_segments[1]
                if re.fullmatch(r"[a-zA-Z0-9_-]{11}", vid):
                    return vid
    except Exception:
        pass

    # Fallback regex search
    patterns = [
        r"(?:v=|\/v\/|\/embed\/|\/shorts\/|\/live\/|youtu\.be\/)([a-zA-Z0-9_-]{11})",
        r"(?:youtube\.com/watch\?.*v=)([a-zA-Z0-9_-]{11})",
    ]
    for pattern in patterns:
        match = re.search(pattern, cleaned)
        if match:
            return match.group(1)

    return None


def fetch_video_metadata(video_id: str) -> dict:
    """Fetch video title, author, thumbnail, and description."""
    title = ""
    author = ""
    thumbnail = f"https://i.ytimg.com/vi/{video_id}/hqdefault.jpg"
    description = ""

    # 1. YouTube oEmbed API (reliable, fast, no credentials needed)
    try:
        oembed_url = (
            f"https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v={video_id}&format=json"
        )
        with httpx.Client(timeout=4.0) as client:
            resp = client.get(oembed_url)
            if resp.status_code == 200:
                data = resp.json()
                title = data.get("title", "")
                author = data.get("author_name", "")
                if data.get("thumbnail_url"):
                    thumbnail = data.get("thumbnail_url")
    except Exception:
        pass

    # 2. Watch page for description and detailed metadata
    try:
        headers = {
            "User-Agent": (
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            ),
            "Accept-Language": "en-US,en;q=0.9",
        }
        with httpx.Client(timeout=5.0, headers=headers) as client:
            page_resp = client.get(f"https://www.youtube.com/watch?v={video_id}")
            if page_resp.status_code == 200:
                html = page_resp.text
                if not title:
                    title_match = re.search(r"<title>(.*?)</title>", html)
                    if title_match:
                        title = title_match.group(1).replace(" - YouTube", "").strip()

                desc_match = re.search(r'"shortDescription":"(.*?)(?<!\\)"', html)
                if desc_match:
                    raw_desc = desc_match.group(1)
                    try:
                        description = json.loads(f'"{raw_desc}"')
                    except Exception:
                        description = raw_desc.replace("\\n", "\n").replace('\\"', '"')
    except Exception:
        pass

    if not title:
        title = f"YouTube Video ({video_id})"

    return {
        "title": title,
        "author": author or "YouTube Creator",
        "thumbnail_url": thumbnail,
        "description": description.strip(),
    }


def _transcript_to_text(fetched) -> str:
    return " ".join(snippet.text for snippet in fetched)


def _select_and_fetch_transcript(transcript_list) -> str:
    """
    Select the best transcript:
    1. Direct English transcript (manual or auto)
    2. Any transcript translated to English if translatable
    3. First available manual transcript
    4. First available auto-generated transcript
    """
    # 1. Try preferred English languages
    try:
        transcript = transcript_list.find_transcript(_PREFERRED_LANGUAGES)
        return _transcript_to_text(transcript.fetch())
    except Exception:
        pass

    # 2. Try translating any available transcript to English
    for transcript in transcript_list:
        if getattr(transcript, "is_translatable", False):
            try:
                translated = transcript.translate("en")
                return _transcript_to_text(translated.fetch())
            except Exception:
                pass

    # 3. Fallback to any manual transcript
    for transcript in transcript_list:
        if not transcript.is_generated:
            try:
                return _transcript_to_text(transcript.fetch())
            except Exception:
                pass

    # 4. Fallback to any generated transcript
    for transcript in transcript_list:
        if transcript.is_generated:
            try:
                return _transcript_to_text(transcript.fetch())
            except Exception:
                pass

    raise ValueError("No readable transcript found in transcript list.")


def fetch_transcript_or_fallback(video_id: str) -> dict:
    """
    Attempts to fetch video transcript. If unavailable, falls back to metadata + description.
    Never fails completely for a valid video.
    """
    metadata = fetch_video_metadata(video_id)
    transcript_text = ""
    source = "transcript"

    try:
        transcript_list = _api.list(video_id)
        transcript_text = _select_and_fetch_transcript(transcript_list)
    except (TranscriptsDisabled, NoTranscriptFound, CouldNotRetrieveTranscript, VideoUnavailable, ValueError) as exc:
        # Fallback to description if transcript not available
        source = "description"
        if metadata.get("description"):
            transcript_text = (
                f"Video Title: {metadata['title']}\n"
                f"Creator: {metadata['author']}\n\n"
                f"Video Description & Notes:\n{metadata['description']}"
            )
        else:
            transcript_text = (
                f"Video Title: {metadata['title']}\n"
                f"Creator: {metadata['author']}\n\n"
                f"This video does not have public subtitles or extended description available."
            )
    except Exception as exc:
        source = "description"
        if metadata.get("description"):
            transcript_text = (
                f"Video Title: {metadata['title']}\n"
                f"Creator: {metadata['author']}\n\n"
                f"Video Description & Notes:\n{metadata['description']}"
            )
        else:
            raise ValueError(f"Unable to retrieve content for video {video_id}: {exc}") from exc

    return {
        "text": transcript_text,
        "source": source,
        "title": metadata["title"],
        "author": metadata["author"],
        "thumbnail_url": metadata["thumbnail_url"],
    }
