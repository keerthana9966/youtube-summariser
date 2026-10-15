import Navbar from "./components/Navbar";
import Summarizer from "./components/Summarizer";

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-[#fafafa] text-slate-800 selection:bg-red-500/20 selection:text-red-700">
      <Navbar />

      <main className="flex-1 mx-auto w-full max-w-2xl px-4 sm:px-6 py-12 sm:py-16">
        {/* Minimalist Hero */}
        <div className="text-center mb-8 space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Summarize any YouTube video
          </h1>
          <p className="text-sm text-slate-500">
            Paste a link below to get clear key points in seconds.
          </p>
        </div>

        <Summarizer />
      </main>

      <footer className="border-t border-slate-100 py-6 text-center text-xs text-slate-400">
        AI YouTube Summarizer
      </footer>
    </div>
  );
}

export default App;
