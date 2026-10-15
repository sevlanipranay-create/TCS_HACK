from contextlib import contextmanager
from datetime import datetime, timezone
import json
import os
from pathlib import Path
import sqlite3
from typing import Any, Dict, List, Optional
import uuid


def _get_db_path() -> str:
    return os.environ.get("MENTOR_DB", "mentor.db")


def _now() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


@contextmanager
def _conn():
    db_path = _get_db_path()
    if db_path != ":memory:":
        parent = Path(db_path).parent
        if str(parent) not in ("", "."):
            parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(db_path, timeout=5.0)
    conn.row_factory = sqlite3.Row
    try:
        conn.execute("PRAGMA foreign_keys=ON")
        conn.execute("PRAGMA busy_timeout=5000")
        if db_path != ":memory:":
            conn.execute("PRAGMA journal_mode=WAL")
        with conn:
            yield conn
    finally:
        conn.close()


def init() -> None:
    schema_path = Path(__file__).resolve().parent / "schema.sql"
    with open(schema_path, "r", encoding="utf-8") as f:
        schema_sql = f.read()
    with _conn() as conn:
        cur = conn.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='sessions'")
        if cur.fetchone():
            cols = [col[1] for col in conn.execute("PRAGMA table_info(sessions)").fetchall()]
            if "team_json" not in cols:
                conn.execute("ALTER TABLE sessions ADD COLUMN team_json TEXT")
                if "team" in cols:
                    conn.execute("UPDATE sessions SET team_json = team WHERE team_json IS NULL")
            if "brief_json" not in cols:
                conn.execute("ALTER TABLE sessions ADD COLUMN brief_json TEXT")
                if "brief" in cols:
                    conn.execute("UPDATE sessions SET brief_json = brief WHERE brief_json IS NULL")
        conn.executescript(schema_sql)


def create_session(problem: str, team: dict, brief: dict) -> str:
    session_id = uuid.uuid4().hex[:12]
    now_str = _now()
    team_json = json.dumps(team)
    brief_json = json.dumps(brief)
    with _conn() as conn:
        conn.execute(
            "INSERT INTO sessions (id, created_at, problem, team_json, brief_json) VALUES (?, ?, ?, ?, ?)",
            (session_id, now_str, problem, team_json, brief_json),
        )
    return session_id


def get_session(session_id: str) -> Optional[dict]:
    with _conn() as conn:
        cursor = conn.execute(
            "SELECT id, created_at, problem, team_json, brief_json FROM sessions WHERE id = ?",
            (session_id,),
        )
        row = cursor.fetchone()
        if not row:
            return None

        judge_cursor = conn.execute(
            "SELECT report_json FROM judge_reports WHERE session_id = ? ORDER BY id DESC LIMIT 1",
            (session_id,),
        )
        judge_row = judge_cursor.fetchone()
        last_judge = json.loads(judge_row["report_json"]) if judge_row else None

        return {
            "id": row["id"],
            "created_at": row["created_at"],
            "problem": row["problem"],
            "team": json.loads(row["team_json"]),
            "brief": json.loads(row["brief_json"]),
            "last_judge": last_judge,
        }


def add_message(session_id: str, role: str, content: str, stage: str) -> None:
    now_str = _now()
    with _conn() as conn:
        cur = conn.execute("SELECT 1 FROM sessions WHERE id = ?", (session_id,))
        if not cur.fetchone():
            raise KeyError(f"unknown session: {session_id}")
        conn.execute(
            "INSERT INTO messages (session_id, role, content, stage, created_at) VALUES (?, ?, ?, ?, ?)",
            (session_id, role, content, stage, now_str),
        )


def list_messages(session_id: str) -> list:
    with _conn() as conn:
        cursor = conn.execute(
            "SELECT role, content, stage, created_at FROM messages WHERE session_id = ? ORDER BY id ASC",
            (session_id,),
        )
        return [
            {
                "role": row["role"],
                "content": row["content"],
                "stage": row["stage"],
                "created_at": row["created_at"],
            }
            for row in cursor.fetchall()
        ]


def set_task_done(session_id: str, task_id: str, done: bool) -> None:
    now_str = _now()
    done_val = 1 if done else 0
    with _conn() as conn:
        cur = conn.execute("SELECT 1 FROM sessions WHERE id = ?", (session_id,))
        if not cur.fetchone():
            raise KeyError(f"unknown session: {session_id}")
        conn.execute(
            """
            INSERT INTO tasks (session_id, task_id, done, updated_at)
            VALUES (?, ?, ?, ?)
            ON CONFLICT(session_id, task_id) DO UPDATE SET
                done = excluded.done,
                updated_at = excluded.updated_at
            """,
            (session_id, task_id, done_val, now_str),
        )


def get_task_states(session_id: str) -> dict:
    with _conn() as conn:
        cursor = conn.execute(
            "SELECT task_id, done FROM tasks WHERE session_id = ?",
            (session_id,),
        )
        return {row["task_id"]: bool(row["done"]) for row in cursor.fetchall()}


def save_judge(session_id: str, report: dict) -> None:
    now_str = _now()
    report_json = json.dumps(report)
    with _conn() as conn:
        cur = conn.execute("SELECT 1 FROM sessions WHERE id = ?", (session_id,))
        if not cur.fetchone():
            raise KeyError(f"unknown session: {session_id}")
        conn.execute(
            "INSERT INTO judge_reports (session_id, report_json, created_at) VALUES (?, ?, ?)",
            (session_id, report_json, now_str),
        )
