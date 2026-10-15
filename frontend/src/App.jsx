import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Summarizer from "./components/Summarizer";
import SettingsModal from "./components/SettingsModal";

function App() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [preferredModel, setPreferredModel] = useState("gemini-2.5-flash");
  const [serverConfig, setServerConfig] = useState(null);

  useEffect(() => {
    // Load local settings
    const savedKey = localStorage.getItem("yt_gemini_api_key") || "";
    const savedModel = localStorage.getItem("yt_gemini_model") || "gemini-2.5-flash";
    setApiKey(savedKey);
    setPreferredModel(savedModel);

    // Check backend health and config
    fetch("/api/config")
      .then((res) => res.json())
      .then((data) => setServerConfig(data))
      .catch(() => {
        // Backend not reachable or running standalone
      });
  }, []);

  const handleSaveSettings = ({ apiKey: newKey, model: newModel }) => {
    setApiKey(newKey);
    setPreferredModel(newModel);
    localStorage.setItem("yt_gemini_api_key", newKey);
    localStorage.setItem("yt_gemini_model", newModel);
  };

  const hasKey = Boolean(apiKey || serverConfig?.has_backend_gemini_key);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 via-white to-slate-50 text-slate-800 selection:bg-red-500/20 selection:text-red-700">
      <Navbar
        onOpenSettings={() => setIsSettingsOpen(true)}
        hasApiKey={hasKey}
        serverStatus={serverConfig}
      />

      <main className="flex-1 mx-auto w-full max-w-4xl px-4 sm:px-6 py-8 sm:py-12">
        {/* Hero Banner */}
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-red-200 bg-red-50 text-red-600 text-xs font-bold shadow-xs">
            <span>✨</span>
            <span>Summarize any YouTube video in seconds</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
            Skip the fluff. Get instant{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-rose-600 to-amber-600">
              key points & takeaways.
            </span>
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
            Paste any YouTube video link, Short, or Livestream. Our AI extracts transcripts, chapters, and discussions to give you clear, structured insights.
          </p>
        </div>

        <Summarizer apiKey={apiKey} preferredModel={preferredModel} />
      </main>

      <footer className="border-t border-slate-200/80 bg-white/80 py-8 text-center text-xs text-slate-500">
        <div className="mx-auto max-w-4xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-600 font-medium">
            <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
            <span>API Online • Works on any link</span>
          </div>
          <p>
            Built for fast learning • Powered by Google Gemini & YouTube Transcript API
          </p>
          <div>
            <a
              href="https://github.com/keerthana9966/youtube-summariser"
              target="_blank"
              rel="noreferrer"
              className="text-slate-600 hover:text-red-600 font-semibold transition"
            >
              GitHub Repo
            </a>
          </div>
        </div>
      </footer>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSave={handleSaveSettings}
        currentKey={apiKey}
        currentModel={preferredModel}
      />
    </div>
  );
}

export default App;
