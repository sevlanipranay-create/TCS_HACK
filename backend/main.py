import logging
import os
import time
from contextlib import asynccontextmanager
from typing import Optional

from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from contract.models import (
    Brief, BriefRequest, ChatRequest, ChatResponse,
    JudgeReport, JudgeRequest, Progress, SessionView,
    TaskState, TaskUpdate
)
import backend.deps as deps
import backend.samples as samples
from backend.services.briefs import create_brief
from backend.services.chat import process_chat
from backend.services.judge import evaluate_judge
from backend.services.progress import get_session_progress
from backend.services.sessions import get_session_view, patch_task

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("backend")


@asynccontextmanager
async def lifespan(app: FastAPI):
    deps.log_startup()
    try:
        deps.get_repo().init()
    except Exception as e:
        logger.warning(f"repo init warning: {e}")
    yield


app = FastAPI(title="Hackathon Mentor AI Backend", lifespan=lifespan)

# CORS configuration
cors_origins_env = os.environ.get(
    "CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173"
)
cors_origins = [orig.strip() for orig in cors_origins_env.split(",") if orig.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def log_requests(request: Request, call_next):
    start = time.perf_counter()
    request.state.session_id = "-"
    request.state.source = "-"

    # Extract session_id from URL path if present
    path_parts = request.url.path.strip("/").split("/")
    if len(path_parts) >= 3 and path_parts[0] == "api" and path_parts[1] == "sessions":
        request.state.session_id = path_parts[2]

    response = await call_next(request)
    duration_ms = round((time.perf_counter() - start) * 1000, 2)
    session_id = getattr(request.state, "session_id", "-")
    source = getattr(request.state, "source", "-")

    logger.info(
        f"{request.method} {request.url.path} status={response.status_code} "
        f"ms={duration_ms} session_id={session_id} source={source}"
    )
    return response


@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(status_code=422, content={"detail": exc.errors()})


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    logger.exception(f"Unhandled exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": f"Internal error: {type(exc).__name__}"}
    )


@app.get("/api/health")
def get_health():
    return {"status": "ok"}


@app.get("/api/samples")
def get_samples():
    return {"samples": samples.SAMPLES}


@app.post("/api/brief", response_model=Brief)
def post_brief(req: BriefRequest, request: Request):
    brief = create_brief(req)
    request.state.session_id = brief.session_id or "-"
    request.state.source = brief.source
    return brief


@app.post("/api/chat", response_model=ChatResponse)
def post_chat(req: ChatRequest, request: Request):
    request.state.session_id = req.session_id
    resp = process_chat(req)
    request.state.source = resp.source
    return resp


@app.get("/api/sessions/{id}", response_model=SessionView)
def get_session(id: str, request: Request):
    request.state.session_id = id
    view = get_session_view(id)
    request.state.source = view.brief.source
    return view


@app.patch("/api/sessions/{id}/tasks/{task_id}", response_model=TaskState)
def patch_session_task(
    id: str, task_id: str, update: TaskUpdate, request: Request
):
    request.state.session_id = id
    return patch_task(id, task_id, update)


@app.get("/api/sessions/{id}/progress", response_model=Progress)
def get_progress(
    id: str, elapsed_min: Optional[int] = None, request: Request = None
):
    if request:
        request.state.session_id = id
    return get_session_progress(id, elapsed_min)


@app.post("/api/judge", response_model=JudgeReport)
def post_judge(req: JudgeRequest, request: Request):
    request.state.session_id = req.session_id
    report = evaluate_judge(req)
    request.state.source = report.source
    return report
