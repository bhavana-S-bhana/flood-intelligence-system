#!/usr/bin/env python3
"""
Server Runner Script for FastAPI REST API & Modern React + Vite Frontend Dashboard
"""
import sys
import os
import subprocess
import time
from pathlib import Path

# Ensure UTF-8 encoding on Windows console
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stderr.reconfigure(encoding='utf-8')

# Ensure project root is in sys.path and environment
PROJECT_ROOT = Path(__file__).resolve().parent
FRONTEND_DIR = PROJECT_ROOT / "frontend"

if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

def get_env():
    env = os.environ.copy()
    env["PYTHONPATH"] = str(PROJECT_ROOT) + os.pathsep + env.get("PYTHONPATH", "")
    return env

def start_fastapi():
    print("[+] Starting FastAPI Backend Server on http://localhost:8000 ...")
    return subprocess.Popen(
        [sys.executable, "-m", "uvicorn", "app.api.routes:app", "--host", "0.0.0.0", "--port", "8000", "--reload"],
        env=get_env()
    )

def start_frontend():
    print("[+] Starting Vite React Dashboard on http://localhost:5173 ...")
    cmd = "npm.cmd run dev" if sys.platform == "win32" else "npm run dev"
    return subprocess.Popen(
        cmd,
        cwd=str(FRONTEND_DIR),
        shell=True,
        env=get_env()
    )

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "--api-only":
        p = start_fastapi()
        p.wait()
    elif len(sys.argv) > 1 and sys.argv[1] == "--frontend-only":
        p = start_frontend()
        p.wait()
    else:
        p_api = start_fastapi()
        time.sleep(2)
        p_front = start_frontend()
        try:
            p_front.wait()
        except KeyboardInterrupt:
            p_api.terminate()
            p_front.terminate()
