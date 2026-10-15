# database/repository.py
import json
import os
import secrets
import sqlite3
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional


def _get_db_path() -> str:
    return os.getenv("MENTOR_DB", "mentor.db")


def _get_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(_get_db_path(), timeout=5.0)
    conn.execute("PRAGMA journal_mode=WAL;")
    conn.execute("PRAGMA busy_timeout=5000;")
    conn.execute("PRAGMA foreign_keys=ON;")
    return conn


def init() -> None:
    """Initialize SQLite database with required tables idempotently."""
    conn = _get_connection()
    try:
        with conn:
            conn.execute(
                """
                CREATE TABLE IF NOT EXISTS sessions (
                    id TEXT PRIMARY KEY,
                    created_at TEXT NOT NULL,
                    problem TEXT NOT NULL,
                    team TEXT NOT NULL,
                    brief TEXT NOT NULL,
                    last_judge TEXT
                );
                """
            )
            conn.execute(
                """
                CREATE TABLE IF NOT EXISTS messages (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    session_id TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
                    role TEXT NOT NULL,
                    content TEXT NOT NULL,
                    stage TEXT NOT NULL,
                    created_at TEXT NOT NULL
                );
                """
            )
            conn.execute(
                """
                CREATE TABLE IF NOT EXISTS task_states (
                    session_id TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
                    task_id TEXT NOT NULL,
                    done INTEGER NOT NULL DEFAULT 0,
                    PRIMARY KEY (session_id, task_id)
                );
                """
            )
    finally:
        conn.close()


def create_session(problem: str, team: dict, brief: dict) -> str:
    """Create a new session, storing UTC ISO text with seconds precision, returning 12-hex-character ID."""
    init()
    session_id = secrets.token_hex(6)  # exactly 12 hex characters
    created_at = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    conn = _get_connection()
    try:
        with conn:
            conn.execute(
                """
                INSERT INTO sessions (id, created_at, problem, team, brief, last_judge)
                VALUES (?, ?, ?, ?, ?, NULL);
                """,
                (session_id, created_at, problem, json.dumps(team), json.dumps(brief)),
            )
        return session_id
    finally:
        conn.close()


def get_session(session_id: str) -> Optional[dict]:
    """Retrieve session dictionary or None if not found."""
    init()
    conn = _get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            """
            SELECT id, created_at, problem, team, brief, last_judge
            FROM sessions
            WHERE id = ?;
            """,
            (session_id,),
        )
        row = cursor.fetchone()
        if not row:
            return None
        return {
            "id": row[0],
            "created_at": row[1],
            "problem": row[2],
            "team": json.loads(row[3]),
            "brief": json.loads(row[4]),
            "last_judge": json.loads(row[5]) if row[5] else None,
        }
    finally:
        conn.close()


def add_message(session_id: str, role: str, content: str, stage: str) -> None:
    """Add a message to the session's chat history. Raises KeyError if session does not exist."""
    init()
    conn = _get_connection()
    try:
        with conn:
            cursor = conn.cursor()
            cursor.execute("SELECT 1 FROM sessions WHERE id = ?;", (session_id,))
            if not cursor.fetchone():
                raise KeyError(f"Session '{session_id}' does not exist.")
            created_at = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
            cursor.execute(
                """
                INSERT INTO messages (session_id, role, content, stage, created_at)
                VALUES (?, ?, ?, ?, ?);
                """,
                (session_id, role, content, stage, created_at),
            )
    finally:
        conn.close()


def list_messages(session_id: str) -> list:
    """List messages for a session in chronological order (oldest first)."""
    init()
    conn = _get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            """
            SELECT role, content, stage, created_at
            FROM messages
            WHERE session_id = ?
            ORDER BY id ASC;
            """,
            (session_id,),
        )
        return [
            {
                "role": row[0],
                "content": row[1],
                "stage": row[2],
                "created_at": row[3],
            }
            for row in cursor.fetchall()
        ]
    finally:
        conn.close()


def set_task_done(session_id: str, task_id: str, done: bool) -> None:
    """Upsert task completion state. Raises KeyError if session does not exist."""
    init()
    conn = _get_connection()
    try:
        with conn:
            cursor = conn.cursor()
            cursor.execute("SELECT 1 FROM sessions WHERE id = ?;", (session_id,))
            if not cursor.fetchone():
                raise KeyError(f"Session '{session_id}' does not exist.")
            cursor.execute(
                """
                INSERT INTO task_states (session_id, task_id, done)
                VALUES (?, ?, ?)
                ON CONFLICT(session_id, task_id) DO UPDATE SET done = excluded.done;
                """,
                (session_id, task_id, 1 if done else 0),
            )
    finally:
        conn.close()


def get_task_states(session_id: str) -> dict:
    """Return dictionary of task states: {task_id: bool}."""
    init()
    conn = _get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            """
            SELECT task_id, done
            FROM task_states
            WHERE session_id = ?;
            """,
            (session_id,),
        )
        return {row[0]: bool(row[1]) for row in cursor.fetchall()}
    finally:
        conn.close()


def save_judge(session_id: str, report: dict) -> None:
    """Save judge report to session. Raises KeyError if session does not exist."""
    init()
    conn = _get_connection()
    try:
        with conn:
            cursor = conn.cursor()
            cursor.execute("SELECT 1 FROM sessions WHERE id = ?;", (session_id,))
            if not cursor.fetchone():
                raise KeyError(f"Session '{session_id}' does not exist.")
            cursor.execute(
                """
                UPDATE sessions
                SET last_judge = ?
                WHERE id = ?;
                """,
                (json.dumps(report), session_id),
            )
    finally:
        conn.close()
