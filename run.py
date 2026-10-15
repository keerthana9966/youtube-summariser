"""
Convenience launcher to run the YouTube Summarizer application.
Runs on http://localhost:8000 serving both API and Frontend.
"""
import sys
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent
BACKEND = ROOT / "backend"
FRONTEND = ROOT / "frontend"

def main():
    print("=" * 60)
    print("🚀 Starting YouTube Summarizer AI")
    print("=" * 60)
    
    # Check if frontend is built
    dist = FRONTEND / "dist"
    if not dist.exists():
        print("📦 Building frontend assets for production...")
        subprocess.run("npm run build", cwd=FRONTEND, shell=True)

    print("\n🌐 Serving at: http://localhost:8000")
    print("📖 API Documentation: http://localhost:8000/docs\n")
    
    # Launch uvicorn
    import uvicorn
    sys.path.insert(0, str(BACKEND))
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)

if __name__ == "__main__":
    main()
