import { useState } from "react";

function formatSummary(text) {
  return text.split("\n").map((line, index) => {
    const trimmed = line.trim();
    if (!trimmed) return null;

    if (trimmed.startsWith("### ") || trimmed.startsWith("## ") || trimmed.startsWith("# ")) {
      const heading = trimmed.replace(/^#+\s*/, "");
      return (
        <h3 key={index} className="mb-2 mt-4 text-base font-semibold text-white first:mt-0">
          {heading}
        </h3>
      );
    }

    if (trimmed.startsWith("- ") || trimmed.startsWith("* ") || trimmed.startsWith("• ")) {
      return (
        <li key={index} className="ml-4 list-disc text-gray-300">
          {trimmed.replace(/^[-*•]\s*/, "")}
        </li>
      );
    }

    if (/^\d+\.\s/.test(trimmed)) {
      return (
        <li key={index} className="ml-4 list-decimal text-gray-300">
          {trimmed.replace(/^\d+\.\s*/, "")}
        </li>
      );
    }

    if (trimmed.startsWith("**") && trimmed.endsWith("**")) {
      return (
        <p key={index} className="mb-1 font-semibold text-white">
          {trimmed.replace(/\*\*/g, "")}
        </p>
      );
    }

    return (
      <p key={index} className="mb-2 leading-relaxed text-gray-300">
        {trimmed}
      </p>
    );
  });
}

export default function Summarizer() {
  const [url, setUrl] = useState("");
  const [summary, setSummary] = useState(null);
  const [videoId, setVideoId] = useState(null);
  const [transcriptLength, setTranscriptLength] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    setError(null);
    setSummary(null);
    setVideoId(null);
    setTranscriptLength(null);

    try {
      const response = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to summarize video");
      }

      setSummary(data.summary);
      setVideoId(data.video_id);
      setTranscriptLength(data.transcript_length);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!summary) return;
    await navigator.clipboard.writeText(summary);
  };

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <label htmlFor="url" className="mb-2 block text-sm font-medium text-gray-300">
            YouTube Video URL
          </label>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                <svg
                  className="h-5 w-5 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                  />
                </svg>
              </div>
              <input
                id="url"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full rounded-xl border border-gray-700 bg-gray-800/50 py-3.5 pl-12 pr-4 text-white placeholder-gray-500 transition focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                disabled={loading}
              />
            </div>
            <button
              type="submit"
              disabled={loading || !url.trim()}
              className="flex items-center gap-2 rounded-xl bg-red-600 px-6 py-3.5 font-semibold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <>
                  <svg
                    className="h-5 w-5 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Summarizing...
                </>
              ) : (
                <>
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  Summarize
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4">
          <svg
            className="mt-0.5 h-5 w-5 shrink-0 text-red-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      {loading && (
        <div className="rounded-2xl border border-gray-800 bg-gray-900/50 p-8">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="h-12 w-12 animate-pulse rounded-full bg-red-600/20" />
            <div className="space-y-2">
              <p className="font-medium text-white">Fetching transcript...</p>
              <p className="text-sm text-gray-400">
                This may take a few seconds depending on video length
              </p>
            </div>
          </div>
        </div>
      )}

      {summary && !loading && (
        <div className="overflow-hidden rounded-2xl border border-gray-800 bg-gray-900/50">
          <div className="flex items-center justify-between border-b border-gray-800 px-6 py-4">
            <div className="flex items-center gap-3">
              {videoId && (
                <img
                  src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
                  alt="Video thumbnail"
                  className="h-12 w-20 rounded-lg object-cover"
                />
              )}
              <div>
                <h2 className="font-semibold text-white">Summary</h2>
                {transcriptLength && (
                  <p className="text-xs text-gray-500">
                    Based on {transcriptLength.toLocaleString()} characters of transcript
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 rounded-lg border border-gray-700 px-3 py-1.5 text-sm text-gray-300 transition hover:border-gray-600 hover:bg-gray-800 hover:text-white"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              Copy
            </button>
          </div>
          <div className="px-6 py-5">
            <div className="prose-sm max-w-none">{formatSummary(summary)}</div>
          </div>
        </div>
      )}

      {!summary && !loading && !error && (
        <div className="rounded-2xl border border-dashed border-gray-800 p-10 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-800/50">
            <svg
              className="h-8 w-8 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h3 className="mb-2 text-lg font-medium text-gray-300">
            No summary yet
          </h3>
          <p className="text-sm text-gray-500">
            Paste a YouTube URL above and click Summarize to get started
          </p>
        </div>
      )}
    </div>
  );
}
