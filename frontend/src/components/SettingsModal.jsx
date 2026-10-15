import { useState, useEffect } from "react";

export default function SettingsModal({ isOpen, onClose, onSave, currentKey, currentModel }) {
  const [key, setKey] = useState(currentKey || "");
  const [model, setModel] = useState(currentModel || "gemini-2.5-flash");
  const [showKey, setShowKey] = useState(false);
  const [savedMessage, setSavedMessage] = useState(false);

  useEffect(() => {
    setKey(currentKey || "");
    setModel(currentModel || "gemini-2.5-flash");
  }, [currentKey, currentModel, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave({ apiKey: key.trim(), model });
    setSavedMessage(true);
    setTimeout(() => {
      setSavedMessage(false);
      onClose();
    }, 800);
  };

  const handleClear = () => {
    setKey("");
    onSave({ apiKey: "", model });
    setSavedMessage(true);
    setTimeout(() => {
      setSavedMessage(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div 
        id="settings-modal"
        className="w-full max-w-lg rounded-3xl bg-white p-6 sm:p-7 shadow-2xl border border-slate-200 text-slate-800"
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 text-white shadow-md shadow-red-500/20">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">AI Engine Settings</h3>
              <p className="text-xs text-slate-500">Configure Gemini API or use built-in engine</p>
            </div>
          </div>
          <button
            id="close-settings-btn"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mt-5 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="gemini-key-input" className="text-xs sm:text-sm font-semibold text-slate-700">
                Google Gemini API Key
              </label>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-xs font-semibold text-red-600 hover:text-red-700 flex items-center gap-1 transition"
              >
                <span>Get free key</span>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>

            <div className="relative">
              <input
                id="gemini-key-input"
                type={showKey ? "text" : "password"}
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full rounded-xl border border-slate-300 bg-slate-50/80 px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-red-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 font-mono transition"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-500 hover:text-slate-800"
              >
                {showKey ? "Hide" : "Show"}
              </button>
            </div>
            <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
              Optional. Stored locally in your browser. If left empty, the app seamlessly runs using the built-in fast NLP engine.
            </p>
          </div>

          <div>
            <label htmlFor="model-select" className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">
              Preferred Gemini Model
            </label>
            <select
              id="model-select"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-slate-50/80 px-3.5 py-2.5 text-sm text-slate-900 focus:border-red-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 transition font-medium"
            >
              <option value="gemini-2.5-flash">Gemini 2.5 Flash (Recommended - Fastest & Smartest)</option>
              <option value="gemini-2.0-flash">Gemini 2.0 Flash (Fast & Versatile)</option>
              <option value="gemini-1.5-flash">Gemini 1.5 Flash (Lightweight & Reliable)</option>
              <option value="gemini-1.5-pro">Gemini 1.5 Pro (Deep Reasoning)</option>
            </select>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-3.5">
            <div className="flex items-start gap-2.5">
              <span className="text-amber-600 mt-0.5 text-sm">💡</span>
              <p className="text-xs text-amber-900 leading-relaxed">
                <span className="font-semibold">Zero-Config Ready:</span> Even without an API key, you and your live demo visitors can summarize any YouTube link immediately using the built-in summarizer!
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-100">
          <button
            id="clear-key-btn"
            type="button"
            onClick={handleClear}
            className="text-xs font-semibold text-slate-500 hover:text-red-600 transition"
          >
            Clear Stored Key
          </button>
          
          <div className="flex items-center gap-2.5">
            <button
              id="cancel-settings-btn"
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              id="save-settings-btn"
              type="button"
              onClick={handleSave}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-md shadow-red-500/25 transition active:scale-95"
            >
              {savedMessage ? "Saved!" : "Save Settings"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
