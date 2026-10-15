#!/usr/bin/env python3
"""
run_all.py - Unified Launcher for Hackathon Mentor AI.
Starts both backend and frontend processes, waits for health readiness, and manages graceful shutdown.

Usage:
    python run_all.py [--port 8000] [--fake]
"""

import argparse
import os
import signal
import subprocess
import sys
import time

try:
    import httpx
except ImportError:
    import urllib.request as urllib_req
    httpx = None


def wait_for_health(url: str, timeout: float = 30.0) -> bool:
    start_time = time.time()
    while time.time() - start_time < timeout:
        try:
            if httpx:
                with httpx.Client(timeout=1.0) as client:
                    resp = client.get(url)
                    if resp.status_code == 200:
                        return True
            else:
                with urllib_req.urlopen(url, timeout=1.0) as resp:
                    if resp.status == 200:
                        return True
        except Exception:
            pass
        time.sleep(0.5)
    return False


def terminate_proc(proc: subprocess.Popen, name: str):
    if proc and proc.poll() is None:
        print(f"Stopping {name} (PID {proc.pid})...")
        try:
            if sys.platform == "win32":
                # On Windows, taskkill kills the entire process tree cleanly
                subprocess.run(
                    ["taskkill", "/F", "/T", "/PID", str(proc.pid)],
                    stdout=subprocess.DEVNULL,
                    stderr=subprocess.DEVNULL,
                )
            else:
                proc.terminate()
                try:
                    proc.wait(timeout=3)
                except subprocess.TimeoutExpired:
                    proc.kill()
        except Exception as e:
            print(f"Error stopping {name}: {e}")


def main():
    parser = argparse.ArgumentParser(description="Run Hackathon Mentor AI")
    parser.add_argument("--port", type=int, default=8000, help="Backend port (default: 8000)")
    parser.add_argument("--fake", action="store_true", help="Run with tests.fake_server for testing")
    args = parser.parse_args()

    repo_root = os.path.abspath(os.path.dirname(__file__))
    frontend_dir = os.path.join(repo_root, "frontend")

    app_target = "tests.fake_server:app" if args.fake else "backend.main:app"
    backend_cmd = [
        sys.executable,
        "-m",
        "uvicorn",
        app_target,
        "--port",
        str(args.port),
    ]

    print("==================================================")
    print("🚀 LAUNCHING HACKATHON MENTOR AI")
    print(f"Backend Target: {app_target} on port {args.port}")
    print(f"Frontend Directory: {frontend_dir}")
    print("==================================================")

    # 1. Start Backend
    print("Starting backend server...")
    backend_proc = subprocess.Popen(
        backend_cmd,
        cwd=repo_root,
    )

    # 2. Start Frontend if frontend directory exists
    frontend_proc = None
    if os.path.exists(frontend_dir):
        print("Starting frontend Vite dev server...")
        frontend_proc = subprocess.Popen(
            "npm run dev",
            cwd=frontend_dir,
            shell=True,
        )

    # 3. Wait for Backend readiness
    health_url = f"http://127.0.0.1:{args.port}/api/health"
    print(f"Waiting for backend health check at {health_url}...")
    is_ready = wait_for_health(health_url, timeout=25.0)

    if is_ready:
        print("\n" + "=" * 50)
        print("🎉 Hackathon Mentor AI is UP and RUNNING!")
        print("👉 Frontend UI:      http://localhost:5173")
        print(f"👉 Backend API Docs: http://127.0.0.1:{args.port}/docs")
        print(f"👉 Health Check:     {health_url}")
        print("Press Ctrl+C to stop both servers.")
        print("=" * 50 + "\n")
    else:
        print(f"\n⚠️  Backend failed to report healthy on {health_url} within 25 seconds.")

    try:
        while True:
            # Check if backend crashed
            if backend_proc.poll() is not None:
                print(f"Backend process exited with code {backend_proc.returncode}")
                break
            time.sleep(1)
    except KeyboardInterrupt:
        print("\nReceived Ctrl+C, shutting down services...")
    finally:
        terminate_proc(backend_proc, "Backend")
        if frontend_proc:
            terminate_proc(frontend_proc, "Frontend")
        print("All processes stopped. Goodbye!")


if __name__ == "__main__":
    main()
