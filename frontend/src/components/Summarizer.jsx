import { useState } from "react";

const EXAMPLES = [
  { label: "Rick Astley", url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
  { label: "Shorts Video", url: "https://www.youtube.com/shorts/kJQP7kiw5Fk" },
  { label: "Steve Jobs Speech", url: "https://www.youtube.com/watch?v=UF8uR6Z6KLc" },
];

function formatSummary(text) {
  if (!text) return null;

  return text.split("\n").map((line, index) => {
    const trimmed = line.trim();
    if (!trimmed) return null;

    if (trimmed.startsWith("### ")) {
      const heading = trimmed.replace(/^###\s*/, "");
      return (
        <div key={index} className="mt-5 mb-2.5 first:mt-0">
          <h3 className="text-sm font-bold tracking-tight text-slate-900 uppercase tracking-wider text-slate-500">
            {heading}
          </h3>
          <div className="h-px bg-slate-100 mt-1 mb-2"></div>
        </div>
      );
    }

    if (trimmed.startsWith("## ") || trimmed.startsWith("# ")) {
      const heading = trimmed.replace(/^#+\s*/, "");
      return (
        <h2 key={index} className="text-base font-bold text-slate-900 mt-5 mb-2">
          {heading}
        </h2>
      );
    }

    if (trimmed.startsWith("- ") || trimmed.startsWith("* ") || trimmed.startsWith("• ")) {
      const content = trimmed.replace(/^[-*•]\s*/, "");
      return (
        <li key={index} className="ml-2 mb-2 flex items-start gap-2.5 text-slate-700 text-sm leading-relaxed">
          <span className="text-red-500 mt-1 shrink-0 text-xs">▸</span>
          <span>{renderFormattedInline(content)}</span>
        </li>
      );
    }

    if (/^\d+\.\s/.test(trimmed)) {
      const match = trimmed.match(/^(\d+)\.\s*(.*)/);
      return (
        <li key={index} className="ml-2 mb-2 flex items-start gap-2 text-slate-700 text-sm leading-relaxed">
          <span className="font-mono text-xs font-bold text-slate-400 shrink-0 mt-0.5">{match ? match[1] : index}.</span>
          <span>{renderFormattedInline(match ? match[2] : trimmed)}</span>
        </li>
      );
    }

    if (trimmed.startsWith(">")) {
      const quote = trimmed.replace(/^>\s*/, "");
      return (
        <blockquote key={index} className="my-3 rounded-xl border-l-2 border-slate-300 bg-slate-50 p-3 text-xs italic text-slate-600">
          {renderFormattedInline(quote)}
        </blockquote>
      );
    }

    return (
      <p key={index} className="mb-2.5 text-sm leading-relaxed text-slate-700">
        {renderFormattedInline(trimmed)}
      </p>
    );
  });
}

function renderFormattedInline(text) {
  const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-slate-900">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return (
        <em key={i} className="italic text-slate-800">
          {part.slice(1, -1)}
        </em>
      );
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code key={i} className="rounded bg-slate-100 px-1 py-0.5 font-mono text-xs text-slate-800">
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

export default function Summarizer() {
  const [url, setUrl] = useState("");
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e, overrideUrl) => {
    if (e) e.preventDefault();
    const targetUrl = (overrideUrl || url).trim();
    if (!targetUrl) return;

    setLoading(true);
    setError(null);
    setSummaryData(null);

    try {
      const response = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: targetUrl }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to summarize video");
      }

      setSummaryData(data);
    } catch (err) {
      setError(err.message || "Failed to fetch summary. Please check the URL.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!summaryData?.summary) return;
    try {
      await navigator.clipboard.writeText(summaryData.summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div className="space-y-6">
      {/* Minimalist Input Form */}
      <form onSubmit={(e) => handleSubmit(e)} className="space-y-3">
        <div className="relative flex items-center rounded-2xl bg-white border border-slate-200 shadow-sm transition focus-within:border-slate-400 focus-within:shadow-md p-1.5">
          <div className="pl-3.5 pr-2 text-slate-400">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </div>

          <input
            id="url-input"
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste YouTube video URL..."
            className="flex-1 bg-transparent py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none"
            disabled={loading}
          />

          {url && !loading && (
            <button
              id="clear-url-btn"
              type="button"
              onClick={() => setUrl("")}
              className="p-1.5 text-slate-400 hover:text-slate-600 transition mr-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}

          <button
            id="summarize-btn"
            type="submit"
            disabled={loading || !url.trim()}
            className="flex items-center gap-1.5 rounded-xl bg-slate-900 hover:bg-black px-5 py-2.5 text-xs font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-30 active:scale-95"
          >
            {loading ? (
              <>
                <svg className="h-3.5 w-3.5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span>Summarizing...</span>
              </>
            ) : (
              <span>Summarize</span>
            )}
          </button>
        </div>

        {/* Subtle Example Chips */}
        <div className="flex items-center gap-2 text-xs text-slate-400 pl-1">
          <span>Examples:</span>
          {EXAMPLES.map((ex, i) => (
            <button
              key={i}
              id={`sample-btn-${i}`}
              type="button"
              onClick={() => {
                setUrl(ex.url);
                handleSubmit(null, ex.url);
              }}
              className="text-slate-500 hover:text-slate-900 underline decoration-slate-300 underline-offset-2 transition"
            >
              {ex.label}
            </button>
          ))}
        </div>
      </form>

      {/* Error Message */}
      {error && (
        <div id="error-alert" className="rounded-xl bg-red-50 border border-red-200/80 p-3.5 text-xs text-red-700">
          {error}
        </div>
      )}

      {/* Minimalist Loading Indicator */}
      {loading && (
        <div id="loading-card" className="rounded-2xl bg-white border border-slate-200 p-8 text-center space-y-3 shadow-xs">
          <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />
          <p className="text-xs text-slate-500">Extracting content and summarizing video...</p>
        </div>
      )}

      {/* Plain, Clean Summary Result */}
      {summaryData && !loading && (
        <article id="summary-result-card" className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
          {/* Video Header */}
          <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-3 min-w-0 pr-3">
              <img
                src={summaryData.thumbnail_url}
                alt={summaryData.title}
                className="h-11 w-16 rounded-lg object-cover border border-slate-200 shrink-0"
              />
              <div className="min-w-0">
                <a
                  href={`https://www.youtube.com/watch?v=${summaryData.video_id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm font-bold text-slate-900 hover:text-red-600 transition truncate block"
                >
                  {summaryData.title}
                </a>
                <p className="text-xs text-slate-500 truncate">{summaryData.author}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                id="copy-summary-btn"
                onClick={handleCopy}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-2xs"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>

          {/* Clean Summary Body */}
          <div className="p-5 sm:p-6 text-slate-800">
            {formatSummary(summaryData.summary)}
          </div>
        </article>
      )}
    </div>
  );
}
