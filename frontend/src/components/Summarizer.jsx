import { useState, useEffect } from "react";

const SAMPLE_VIDEOS = [
  {
    label: "🎵 Never Gonna Give You Up",
    url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    tag: "Captions",
  },
  {
    label: "⚡ YouTube Shorts Demo",
    url: "https://www.youtube.com/shorts/kJQP7kiw5Fk",
    tag: "Shorts",
  },
  {
    label: "🎓 Steve Jobs 2005 Speech",
    url: "https://www.youtube.com/watch?v=UF8uR6Z6KLc",
    tag: "Long Video",
  },
  {
    label: "📻 Lofi Girl (Metadata Test)",
    url: "https://www.youtube.com/watch?v=5qap5aO4i9A",
    tag: "No Captions",
  },
];

const STYLE_OPTIONS = [
  { id: "standard", name: "Standard", desc: "Overview, key points & takeaways", icon: "⚡" },
  { id: "tldr", name: "TL;DR", desc: "Quick 30-sec brief", icon: "⏱️" },
  { id: "detailed", name: "Detailed", desc: "In-depth breakdown & chapters", icon: "📚" },
  { id: "actionable", name: "Action Items", desc: "Key steps, lessons & advice", icon: "🎯" },
];

function formatSummary(text) {
  if (!text) return null;

  return text.split("\n").map((line, index) => {
    const trimmed = line.trim();
    if (!trimmed) return null;

    if (trimmed.startsWith("### ")) {
      const heading = trimmed.replace(/^###\s*/, "");
      return (
        <div key={index} className="mt-6 mb-3 first:mt-0">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-red-500 shadow-sm shadow-red-500/40"></span>
            <span>{heading}</span>
          </h3>
          <div className="h-px bg-slate-200/80 mt-1.5 mb-2 w-full"></div>
        </div>
      );
    }

    if (trimmed.startsWith("## ") || trimmed.startsWith("# ")) {
      const heading = trimmed.replace(/^#+\s*/, "");
      return (
        <h2 key={index} className="text-lg font-bold text-slate-900 mt-6 mb-2 border-b border-slate-200 pb-1">
          {heading}
        </h2>
      );
    }

    if (trimmed.startsWith("- ") || trimmed.startsWith("* ") || trimmed.startsWith("• ")) {
      const bulletContent = trimmed.replace(/^[-*•]\s*/, "");
      return (
        <li key={index} className="ml-2 mb-2 flex items-start gap-2.5 text-slate-700 text-sm leading-relaxed">
          <span className="text-red-500 mt-1 shrink-0 text-xs">▸</span>
          <span>{renderFormattedInline(bulletContent)}</span>
        </li>
      );
    }

    if (/^\d+\.\s/.test(trimmed)) {
      const match = trimmed.match(/^(\d+)\.\s*(.*)/);
      return (
        <li key={index} className="ml-2 mb-2 flex items-start gap-2 text-slate-700 text-sm leading-relaxed">
          <span className="font-mono text-xs font-bold text-amber-600 shrink-0 mt-0.5">{match ? match[1] : index}.</span>
          <span>{renderFormattedInline(match ? match[2] : trimmed)}</span>
        </li>
      );
    }

    if (trimmed.startsWith(">")) {
      const quote = trimmed.replace(/^>\s*/, "");
      return (
        <blockquote key={index} className="my-3 rounded-2xl border-l-4 border-amber-400 bg-amber-50/70 p-3.5 text-xs italic text-amber-950">
          {renderFormattedInline(quote)}
        </blockquote>
      );
    }

    return (
      <p key={index} className="mb-3 text-sm leading-relaxed text-slate-700">
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
        <strong key={i} className="font-bold text-slate-900">
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
        <code key={i} className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs text-red-600 border border-slate-200">
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

export default function Summarizer({ apiKey, preferredModel }) {
  const [url, setUrl] = useState("");
  const [style, setStyle] = useState("standard");
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(1);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState([]);

  // Load history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("yt_summarizer_history");
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch {
      // ignore
    }
  }, []);

  const saveToHistory = (item) => {
    try {
      const updated = [item, ...history.filter((h) => h.video_id !== item.video_id)].slice(0, 6);
      setHistory(updated);
      localStorage.setItem("yt_summarizer_history", JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const clearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem("yt_summarizer_history");
    } catch {
      // ignore
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) setUrl(text.trim());
    } catch {
      // Clipboard permissions denied
    }
  };

  const handleSubmit = async (e, overrideUrl) => {
    if (e) e.preventDefault();
    const targetUrl = (overrideUrl || url).trim();
    if (!targetUrl) return;

    setLoading(true);
    setLoadingStep(1);
    setError(null);
    setSummaryData(null);

    const stepInterval = setInterval(() => {
      setLoadingStep((prev) => (prev < 3 ? prev + 1 : prev));
    }, 1200);

    try {
      const response = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: targetUrl,
          style: style,
          api_key: apiKey || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to summarize video");
      }

      setSummaryData(data);
      saveToHistory(data);
    } catch (err) {
      setError(err.message || "An unexpected error occurred while connecting to backend.");
    } finally {
      clearInterval(stepInterval);
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

  const handleDownloadMarkdown = () => {
    if (!summaryData) return;
    const content = `# Summary: ${summaryData.title}\n\n**Author:** ${summaryData.author}\n**Source:** ${summaryData.source}\n**Model:** ${summaryData.model_used}\n**URL:** https://www.youtube.com/watch?v=${summaryData.video_id}\n\n---\n\n${summaryData.summary}`;
    const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = `summary-${summaryData.video_id}.md`;
    link.click();
    URL.revokeObjectURL(blobUrl);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Search and Input Container */}
      <section className="relative rounded-3xl bg-white p-5 sm:p-7 shadow-xl border border-slate-200/80 glow-card">
        <form onSubmit={(e) => handleSubmit(e)} className="space-y-5">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="url-input" className="text-xs sm:text-sm font-bold tracking-wide text-slate-800 flex items-center gap-2">
                <span>Enter YouTube Video URL</span>
                <span className="text-[11px] font-normal text-slate-500 hidden sm:inline">(Supports all links, Shorts, and Live)</span>
              </label>

              <div className="flex items-center gap-2">
                {url && (
                  <button
                    id="clear-url-btn"
                    type="button"
                    onClick={() => setUrl("")}
                    className="text-xs font-semibold text-slate-500 hover:text-red-600 transition"
                  >
                    Clear
                  </button>
                )}
                <button
                  id="paste-url-btn"
                  type="button"
                  onClick={handlePaste}
                  className="flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg border border-slate-200 transition"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <span>Paste</span>
                </button>
              </div>
            </div>

            <div className="relative flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </div>
                <input
                  id="url-input"
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="Paste YouTube link: https://youtube.com/watch?v=... or /shorts/..."
                  className="w-full rounded-2xl border border-slate-300 bg-slate-50/70 py-3.5 pl-12 pr-4 text-sm text-slate-900 placeholder-slate-400 shadow-inner transition focus:border-red-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20"
                  disabled={loading}
                />
              </div>

              <button
                id="summarize-btn"
                type="submit"
                disabled={loading || !url.trim()}
                className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 px-7 py-3.5 text-sm font-bold text-white shadow-md shadow-red-500/25 transition hover:from-red-500 hover:to-rose-500 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {loading ? (
                  <>
                    <svg className="h-4 w-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <span>Summarize Video</span>
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Style Selector Tabs */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Summary Style</span>
              <span className="text-xs text-slate-400">Pick format preference</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {STYLE_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  id={`style-btn-${opt.id}`}
                  type="button"
                  onClick={() => setStyle(opt.id)}
                  className={`flex flex-col items-start p-3 rounded-2xl border text-left transition ${
                    style === opt.id
                      ? "border-red-500 bg-red-50/80 text-red-700 shadow-sm ring-1 ring-red-400"
                      : "border-slate-200 bg-slate-50/60 text-slate-600 hover:border-slate-300 hover:bg-slate-100"
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold">
                    <span>{opt.icon}</span>
                    <span>{opt.name}</span>
                  </div>
                  <span className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Sample Links */}
          <div className="pt-3 border-t border-slate-100">
            <span className="text-xs font-semibold text-slate-600 mr-2">Try sample:</span>
            <div className="inline-flex flex-wrap gap-2 mt-2">
              {SAMPLE_VIDEOS.map((sample, idx) => (
                <button
                  key={idx}
                  id={`sample-btn-${idx}`}
                  type="button"
                  onClick={() => {
                    setUrl(sample.url);
                    handleSubmit(null, sample.url);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700 hover:border-red-300 hover:bg-red-50 hover:text-red-700 transition shadow-xs"
                >
                  <span>{sample.label}</span>
                  <span className="text-[10px] text-slate-400 font-mono">({sample.tag})</span>
                </button>
              ))}
            </div>
          </div>
        </form>
      </section>

      {/* Error Alert */}
      {error && (
        <div id="error-alert" className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-800 animate-fade-in shadow-sm">
          <svg className="mt-0.5 h-5 w-5 shrink-0 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="space-y-1">
            <p className="text-sm font-bold text-red-900">Could not summarize video</p>
            <p className="text-xs text-red-700 leading-relaxed">{error}</p>
          </div>
        </div>
      )}

      {/* Multi-step Loading Animation */}
      {loading && (
        <div id="loading-card" className="rounded-3xl bg-white p-8 text-center space-y-6 shadow-xl border border-slate-200/80 glow-card">
          <div className="relative mx-auto flex h-16 w-16 items-center justify-center">
            <div className="absolute inset-0 animate-ping rounded-full bg-red-500/20" />
            <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-red-600 to-rose-500 text-white shadow-md shadow-red-500/30">
              <svg className="h-6 w-6 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-bold text-slate-900">Analyzing YouTube Content</h3>
            <p className="text-xs text-slate-500">
              {loadingStep === 1 && "Verifying link, video title, and channel info..."}
              {loadingStep === 2 && "Fetching video transcripts, captions, and notes..."}
              {loadingStep === 3 && "Synthesizing structured points and takeaways..."}
            </p>
          </div>

          {/* Progress step dots */}
          <div className="flex items-center justify-center gap-3">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={`h-2 rounded-full transition-all duration-300 ${
                  loadingStep >= step ? "w-8 bg-red-500" : "w-2 bg-slate-200"
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Summary Results Card */}
      {summaryData && !loading && (
        <article id="summary-result-card" className="rounded-3xl bg-white overflow-hidden shadow-xl border border-slate-200/90 glow-card">
          {/* Top Video Header */}
          <div className="p-5 sm:p-6 border-b border-slate-200 bg-slate-50/70">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start sm:items-center gap-4">
                <a
                  href={`https://www.youtube.com/watch?v=${summaryData.video_id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="relative group shrink-0 overflow-hidden rounded-xl border border-slate-300/80 shadow-sm"
                  title="Open on YouTube"
                >
                  <img
                    src={summaryData.thumbnail_url}
                    alt={summaryData.title}
                    className="h-16 w-28 object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </a>

                <div className="space-y-1">
                  <a
                    href={`https://www.youtube.com/watch?v=${summaryData.video_id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-base font-bold text-slate-900 hover:text-red-600 transition line-clamp-2"
                  >
                    {summaryData.title}
                  </a>
                  <p className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
                    <span>{summaryData.author}</span>
                    <span>•</span>
                    <span className="font-mono text-slate-400">{summaryData.transcript_length.toLocaleString()} chars</span>
                  </p>

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">
                      {summaryData.source === "transcript" ? "📝 Transcript-based" : "📋 Description & Metadata"}
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      ⚡ {summaryData.model_used}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end pt-2 sm:pt-0">
                <button
                  id="copy-summary-btn"
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition shadow-xs"
                  title="Copy formatted markdown"
                >
                  {copied ? (
                    <>
                      <svg className="h-4 w-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-emerald-700">Copied!</span>
                    </>
                  ) : (
                    <>
                      <svg className="h-4 w-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <span>Copy</span>
                    </>
                  )}
                </button>

                <button
                  id="download-md-btn"
                  onClick={handleDownloadMarkdown}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition shadow-xs"
                  title="Download Markdown file"
                >
                  <svg className="h-4 w-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span>Download .md</span>
                </button>
              </div>
            </div>
          </div>

          {/* Formatted Content */}
          <div className="p-6 sm:p-8 bg-white">
            <div className="max-w-none text-slate-800">
              {formatSummary(summaryData.summary)}
            </div>
          </div>
        </article>
      )}

      {/* History / Recent Videos */}
      {history.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <span>🕒 Recent Summaries</span>
              <span className="text-[10px] text-slate-400">({history.length})</span>
            </h4>
            <button
              onClick={clearHistory}
              className="text-xs font-semibold text-slate-500 hover:text-red-600 transition"
            >
              Clear History
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {history.map((item) => (
              <div
                key={item.video_id}
                onClick={() => {
                  setSummaryData(item);
                  setUrl(`https://www.youtube.com/watch?v=${item.video_id}`);
                  window.scrollTo({ top: 300, behavior: "smooth" });
                }}
                className="group flex items-center gap-3 rounded-2xl bg-white p-3 border border-slate-200/90 hover:border-slate-300 cursor-pointer transition hover:shadow-md shadow-xs"
              >
                <img
                  src={item.thumbnail_url}
                  alt={item.title}
                  className="h-12 w-20 rounded-xl object-cover shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-800 truncate group-hover:text-red-600 transition">
                    {item.title}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">
                    {item.author}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
