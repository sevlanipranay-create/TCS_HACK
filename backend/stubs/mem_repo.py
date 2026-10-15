import copy
from datetime import datetime, timezone
import secrets
from typing import Any, Dict, List, Optional

_sessions: Dict[str, Dict[str, Any]] = {}
_messages: Dict[str, List[Dict[str, Any]]] = {}
_tasks: Dict[str, Dict[str, bool]] = {}


def init() -> None:
    """Idempotent initialization."""
    global _sessions, _messages, _tasks
    # Preserve existing state if called repeatedly
    if _sessions is None:
        _sessions = {}
        _messages = {}
        _tasks = {}


def create_session(problem: str, team: dict, brief: dict) -> str:
    """Generate 12-hex-char ID, store created_at as UTC ISO text, return session_id."""
    init()
    session_id = secrets.token_hex(6)
    created_at = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

    _sessions[session_id] = {
        "id": session_id,
        "created_at": created_at,
        "problem": problem,
        "team": copy.deepcopy(team),
        "brief": copy.deepcopy(brief),
        "last_judge": None,
    }
    _messages[session_id] = []
    _tasks[session_id] = {}
    return session_id


def get_session(session_id: str) -> Optional[dict]:
    """Return session dict or None."""
    init()
    s = _sessions.get(session_id)
    if s is None:
        return None
    return copy.deepcopy(s)


def add_message(session_id: str, role: str, content: str, stage: str) -> None:
    """Store message. Raise KeyError if session does not exist."""
    init()
    if session_id not in _sessions:
        raise KeyError(f"Session {session_id} not found")

    created_at = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    _messages[session_id].append({
        "role": role,
        "content": content,
        "stage": stage,
        "created_at": created_at,
    })


def list_messages(session_id: str) -> list:
    """Return list of messages for session, oldest first."""
    init()
    return copy.deepcopy(_messages.get(session_id, []))


def set_task_done(session_id: str, task_id: str, done: bool) -> None:
    """Upsert task done state. Raise KeyError if session does not exist."""
    init()
    if session_id not in _sessions:
        raise KeyError(f"Session {session_id} not found")

    _tasks[session_id][task_id] = done


def get_task_states(session_id: str) -> dict:
    """Return {task_id: bool} for session."""
    init()
    return copy.deepcopy(_tasks.get(session_id, {}))


def save_judge(session_id: str, report: dict) -> None:
    """Save judge report. Raise KeyError if session does not exist."""
    init()
    if session_id not in _sessions:
        raise KeyError(f"Session {session_id} not found")

    _sessions[session_id]["last_judge"] = copy.deepcopy(report)
