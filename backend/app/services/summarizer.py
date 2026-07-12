import google.generativeai as genai

from app.config import settings

_SYSTEM_PROMPT = (
    "You are a helpful assistant that summarizes YouTube video transcripts. "
    "Provide a clear, well-structured summary with:\n"
    "1. A brief overview (2-3 sentences)\n"
    "2. Key points as bullet points\n"
    "3. Main takeaways\n"
    "Keep the summary concise but informative."
)


def summarize_transcript(transcript: str) -> str:
    if not settings.gemini_api_key:
        raise ValueError(
            "Gemini API key is not configured. Set GEMINI_API_KEY in backend/.env"
        )

    genai.configure(api_key=settings.gemini_api_key)

    truncated = transcript[:12000]
    if len(transcript) > 12000:
        truncated += "\n\n[Transcript truncated for summarization]"

    model = genai.GenerativeModel(
        model_name=settings.gemini_model,
        system_instruction=_SYSTEM_PROMPT,
    )

    response = model.generate_content(
        f"Please summarize the following YouTube video transcript:\n\n{truncated}",
        generation_config=genai.GenerationConfig(
            temperature=0.3,
            max_output_tokens=1000,
        ),
    )

    if not response.text:
        raise ValueError("Gemini returned an empty summary.")

    return response.text.strip()
