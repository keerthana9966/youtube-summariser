import Summarizer from "./components/Summarizer";

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      <header className="border-b border-gray-800 bg-gray-950/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-4xl items-center gap-3 px-6 py-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600 shadow-lg shadow-red-600/30">
            <svg
              className="h-5 w-5 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">
              YouTube Summarizer
            </h1>
            <p className="text-sm text-gray-400">
              Get AI-powered summaries of any YouTube video
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-10">
        <Summarizer />
      </main>

      <footer className="mt-auto border-t border-gray-800 py-6 text-center text-sm text-gray-500">
        Paste a YouTube URL and let AI summarize the video for you
      </footer>
    </div>
  );
}

export default App;
