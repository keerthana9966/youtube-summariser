import re
from collections import Counter
from typing import List, Tuple

STOPWORDS = {
    "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are",
    "aren't", "as", "at", "be", "because", "been", "before", "being", "below", "between", "both",
    "but", "by", "can't", "cannot", "could", "couldn't", "did", "didn't", "do", "does", "doesn't",
    "doing", "don't", "down", "during", "each", "few", "for", "from", "further", "had", "hadn't",
    "has", "hasn't", "have", "haven't", "having", "he", "he'd", "he'll", "he's", "her", "here",
    "here's", "hers", "herself", "him", "himself", "his", "how", "how's", "i", "i'd", "i'll",
    "i'm", "i've", "if", "in", "into", "is", "isn't", "it", "it's", "its", "itself", "let's", "me",
    "more", "most", "mustn't", "my", "myself", "no", "nor", "not", "of", "off", "on", "once",
    "only", "or", "other", "ought", "our", "ours", "ourselves", "out", "over", "own", "same",
    "shan't", "she", "she'd", "she'll", "she's", "should", "shouldn't", "so", "some", "such",
    "than", "that", "that's", "the", "their", "theirs", "them", "themselves", "then", "there",
    "there's", "these", "they", "they'd", "they'll", "they're", "they've", "this", "those",
    "through", "to", "too", "under", "until", "up", "very", "was", "wasn't", "we", "we'd", "we'll",
    "we're", "we've", "were", "weren't", "what", "what's", "when", "when's", "where", "where's",
    "which", "while", "who", "who's", "whom", "why", "why's", "with", "won't", "would", "wouldn't",
    "you", "you'd", "you'll", "you're", "you've", "your", "yours", "yourself", "yourselves",
    "yeah", "like", "know", "just", "um", "uh", "gonna", "wanna", "got", "get", "really", "thing",
    "things", "going", "right", "okay", "well", "see", "look", "guys", "video", "subscribe"
}


def clean_text(text: str) -> str:
    # Remove subtitles artifacts like [Music], [Applause], ♪, ♫
    text = re.sub(r"\[.*?\]", " ", text)
    text = re.sub(r"[\u266a\u266b♪♫]", " ", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def split_sentences(text: str) -> List[str]:
    cleaned = clean_text(text)
    # Split on sentence terminals
    splits = re.split(r"(?<=[.!?])\s+|\n+", cleaned)
    results = []
    seen = set()

    for s in splits:
        s = s.strip()
        if len(s.split()) < 4:
            continue
        # Avoid exact duplicates
        norm = s.lower()
        if norm in seen:
            continue
        seen.add(norm)
        results.append(s)

    return results


def summarize_extractive(
    text: str,
    title: str = "",
    author: str = "",
    style: str = "standard",
) -> str:
    """
    Intelligent NLP extractive summarizer that runs with zero external API dependencies.
    Provides structured overview, key points, and takeaways.
    """
    sentences = split_sentences(text)
    if not sentences:
        return (
            "### Overview\n"
            f"Summary for \"{title or 'this video'}\" is being processed.\n\n"
            "### Key Points\n"
            "- Content details were extracted from available video metadata.\n"
        )

    # Word frequencies
    all_words = [w.lower() for w in re.findall(r"\b[a-zA-Z]{3,}\b", text)]
    content_words = [w for w in all_words if w not in STOPWORDS]
    freq = Counter(content_words)
    max_f = max(freq.values()) if freq else 1

    scored: List[Tuple[float, int, str]] = []
    for idx, s in enumerate(sentences):
        words = [w.lower() for w in re.findall(r"\b[a-zA-Z]{3,}\b", s)]
        if not words:
            continue

        freq_score = sum(freq.get(w, 0) / max_f for w in words) / len(words)
        # Position weighting
        rel_pos = idx / len(sentences)
        pos_weight = 1.25 if rel_pos < 0.2 else (1.15 if rel_pos > 0.8 else 1.0)

        # Length bonus (optimal 10 - 28 words)
        w_len = len(words)
        if 9 <= w_len <= 30:
            len_bonus = 1.3
        elif w_len < 6 or w_len > 45:
            len_bonus = 0.6
        else:
            len_bonus = 1.0

        score = freq_score * pos_weight * len_bonus
        scored.append((score, idx, s))

    ranked = sorted(scored, key=lambda x: x[0], reverse=True)

    # Determine counts based on style
    if style == "tldr":
        num_overview = 1
        num_points = 3
        num_takeaways = 1
    elif style == "detailed":
        num_overview = 3
        num_points = 7
        num_takeaways = 3
    else:  # standard & actionable
        num_overview = 2
        num_points = 5
        num_takeaways = 2

    # Overview sentences
    overview_candidates = sorted(ranked[:6], key=lambda x: x[1])
    overview_sentences = [c[2] for c in overview_candidates[:num_overview]]
    overview_str = " ".join(overview_sentences)
    if title:
        overview_header = f"**{title}**"
        if author:
            overview_header += f" presented by *{author}*"
        overview_str = f"{overview_header}. {overview_str}"

    # Key points
    key_points = []
    selected_indices = set()
    for s_score, s_idx, s_text in ranked:
        if s_text in overview_sentences:
            continue
        if any(abs(s_idx - prev_idx) <= 1 for prev_idx in selected_indices):
            continue
        formatted_point = s_text.strip()
        if not formatted_point.endswith((".", "!", "?")):
            formatted_point += "."
        key_points.append(formatted_point)
        selected_indices.add(s_idx)
        if len(key_points) >= num_points:
            break

    # Takeaways
    takeaways = []
    for s_score, s_idx, s_text in ranked[num_points:]:
        if s_text in overview_sentences or s_text in key_points:
            continue
        formatted_t = s_text.strip()
        if not formatted_t.endswith((".", "!", "?")):
            formatted_t += "."
        takeaways.append(formatted_t)
        if len(takeaways) >= num_takeaways:
            break

    # Build markdown
    lines = [
        "### Overview",
        overview_str,
        "",
        "### Key Points",
    ]
    for p in key_points:
        lines.append(f"- {p}")

    if style != "tldr" and takeaways:
        lines.extend([
            "",
            "### Main Takeaways" if style != "actionable" else "### Action Items & Lessons",
        ])
        for t in takeaways:
            lines.append(f"- {t}")

    lines.extend([
        "",
        "> *Summary created via Built-in NLP Extractor. Provide a Gemini API key in settings for deep generative AI synthesis.*",
    ])

    return "\n".join(lines)
