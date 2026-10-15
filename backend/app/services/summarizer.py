import logging
from typing import Optional, Tuple

import google.generativeai as genai

from app.config import settings
from app.services.extractive_summarizer import summarize_extractive

logger = logging.getLogger(__name__)

STYLE_PROMPTS = {
    "standard": (
        "You are an expert YouTube content summarizer. Provide a crisp, engaging, and well-structured summary with:\n"
        "### Overview\n"
        "(2-3 clear sentences explaining what this video is about and why it matters)\n\n"
        "### Key Points\n"
        "(5-7 comprehensive bullet points highlighting the core concepts, discussions, and arguments)\n\n"
        "### Main Takeaways\n"
        "(2-3 actionable conclusions or memorable lessons from the video)\n\n"
        "Format cleanly in GitHub markdown."
    ),
    "detailed": (
        "You are an expert YouTube research analyst. Provide an in-depth, comprehensive summary with:\n"
        "### Executive Summary\n"
        "(Detailed background and purpose of the video)\n\n"
        "### In-Depth Breakdown\n"
        "(Comprehensive bullet points grouped with bold subtitles covering each phase of the video)\n\n"
        "### Key Quotes & Noteworthy Ideas\n"
        "(Memorable insights or arguments made in the video)\n\n"
        "### Final Conclusions & Impact\n"
        "Format cleanly in GitHub markdown."
    ),
    "tldr": (
        "You are a master of brevity. Provide an ultra-concise 30-second TL;DR summary with:\n"
        "### TL;DR\n"
        "(1-2 sentences capturing the bottom line)\n\n"
        "### Quick Bullet Points\n"
        "(3-4 punchy, high-impact takeaways)\n\n"
        "Format cleanly in GitHub markdown."
    ),
    "actionable": (
        "You are a practical coach and analyst. Summarize this YouTube video focusing on actionability:\n"
        "### Core Concept\n"
        "(Brief context)\n\n"
        "### Actionable Steps & Best Practices\n"
        "(Numbered list of concrete steps, strategies, or techniques viewers can apply)\n\n"
        "### Common Mistakes & Gotchas\n"
        "(What to watch out for, based on the video)\n\n"
        "### Key Takeaway\n"
        "Format cleanly in GitHub markdown."
    ),
}


def summarize_transcript(
    transcript: str,
    title: str = "",
    author: str = "",
    style: str = "standard",
    user_api_key: Optional[str] = None,
) -> Tuple[str, str]:
    """
    Summarize video content using Gemini AI if key is provided,
    otherwise gracefully falls back to built-in extractive NLP.
    Returns: (summary_text, model_name)
    """
    api_key = (user_api_key or "").strip() or settings.gemini_api_key.strip()
    system_prompt = STYLE_PROMPTS.get(style, STYLE_PROMPTS["standard"])

    if api_key:
        # Candidate models to try in order of capability / availability
        candidate_models = [
            "gemini-2.0-flash",
            "gemini-1.5-flash",
            settings.gemini_model,
            "gemini-1.5-pro",
        ]
        # Remove duplicates while preserving order
        candidate_models = list(dict.fromkeys(candidate_models))

        # Truncate to reasonable context window if exceptionally long (e.g. 80,000 chars)
        max_chars = 80000
        truncated = transcript[:max_chars]
        if len(transcript) > max_chars:
            truncated += "\n\n[Transcript truncated for token limit]"

        prompt_content = (
            f"Video Title: {title or 'Unknown'}\n"
            f"Creator: {author or 'Unknown'}\n\n"
            f"Content/Transcript:\n{truncated}"
        )

        try:
            genai.configure(api_key=api_key)
        except Exception as exc:
            logger.warning(f"Failed to configure Gemini API: {exc}")

        last_error = None
        for model_name in candidate_models:
            try:
                model = genai.GenerativeModel(
                    model_name=model_name,
                    system_instruction=system_prompt,
                )

                response = model.generate_content(
                    f"Please summarize the following YouTube video content according to your instructions:\n\n{prompt_content}",
                    generation_config=genai.GenerationConfig(
                        temperature=0.3,
                        max_output_tokens=1500,
                    ),
                )

                if response and response.text:
                    return response.text.strip(), model_name
            except Exception as exc:
                last_error = exc
                logger.info(f"Model {model_name} failed: {exc}, trying next model...")
                continue

        logger.warning(
            f"All Gemini models failed or quota exceeded: {last_error}. Falling back to extractive engine."
        )

    # Built-in NLP extractive fallback
    nlp_summary = summarize_extractive(
        text=transcript,
        title=title,
        author=author,
        style=style,
    )
    return nlp_summary, "built-in-nlp"
