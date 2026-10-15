from datetime import datetime, timezone
import math
from typing import Dict, List, Optional, Union

from fastapi import HTTPException
from contract.models import (
    Brief, CheckpointState, NextTask, PhaseProgress, Progress, Stage
)
import backend.deps as deps

STAGE_ORDER: List[Stage] = ["understand", "users", "ideate", "build", "validate", "pitch"]


def compute_progress(
    brief: Union[Brief, dict],
    task_states: Dict[str, bool],
    created_at: str,
    elapsed_override: Optional[int] = None,
) -> Progress:
    """Pure function implementing the exact Contract Block PROGRESS formula."""
    if isinstance(brief, dict):
        brief_obj = Brief.model_validate(brief)
    else:
        brief_obj = brief

    minutes_total = sum(p.minutes for p in brief_obj.workflow)
    if minutes_total <= 0:
        minutes_total = 75

    if elapsed_override is not None:
        minutes_elapsed = elapsed_override
    else:
        try:
            c_at = datetime.fromisoformat(created_at.replace("Z", "+00:00"))
            if c_at.tzinfo is None:
                c_at = c_at.replace(tzinfo=timezone.utc)
        except Exception:
            c_at = datetime.now(timezone.utc)
        now_utc = datetime.now(timezone.utc)
        minutes_elapsed = math.floor((now_utc - c_at).total_seconds() / 60)

    # Clamp to 0..minutes_total
    minutes_elapsed = max(0, min(minutes_total, minutes_elapsed))

    tasks_total = len(brief_obj.tasks)
    tasks_done = 0
    total_task_minutes = sum(t.minutes for t in brief_obj.tasks)
    done_task_minutes = 0
    next_task = None

    for t in brief_obj.tasks:
        is_done = task_states.get(t.id, t.done)
        if is_done:
            tasks_done += 1
            done_task_minutes += t.minutes
        else:
            if next_task is None:
                next_task = NextTask(id=t.id, title=t.title, owner_role=t.owner_role)

    percent_done = (
        round(100 * done_task_minutes / total_task_minutes)
        if total_task_minutes > 0
        else 0
    )
    percent_done = max(0, min(100, percent_done))

    expected_percent = (
        round(100 * minutes_elapsed / minutes_total)
        if minutes_total > 0
        else 0
    )
    expected_percent = max(0, min(100, expected_percent))

    if percent_done < expected_percent - 15:
        status = "behind"
    elif percent_done > expected_percent + 15:
        status = "ahead"
    else:
        status = "on_track"

    checkpoint_states: List[CheckpointState] = []
    for cp in brief_obj.checkpoints:
        if cp.at_minute < minutes_elapsed:
            st = "passed"
        elif minutes_elapsed <= cp.at_minute <= minutes_elapsed + 5:
            st = "due_now"
        else:
            st = "upcoming"
        checkpoint_states.append(
            CheckpointState(at_minute=cp.at_minute, check=cp.check, state=st)
        )

    by_phase: List[PhaseProgress] = []
    for phase_name in STAGE_ORDER:
        phase_tasks = [t for t in brief_obj.tasks if t.phase == phase_name]
        if not phase_tasks:
            continue
        p_done = sum(1 for t in phase_tasks if task_states.get(t.id, t.done))
        by_phase.append(
            PhaseProgress(phase=phase_name, done=p_done, total=len(phase_tasks))
        )

    return Progress(
        percent_done=percent_done,
        tasks_done=tasks_done,
        tasks_total=tasks_total,
        minutes_elapsed=minutes_elapsed,
        minutes_total=minutes_total,
        expected_percent=expected_percent,
        status=status,
        next_task=next_task,
        by_phase=by_phase,
        checkpoints=checkpoint_states,
    )


def get_session_progress(
    session_id: str, elapsed_min: Optional[int] = None
) -> Progress:
    """Handle GET /api/sessions/{id}/progress: return Progress or 404."""
    repo = deps.get_repo()
    s = repo.get_session(session_id)
    if not s:
        raise HTTPException(status_code=404, detail=f"Session {session_id} not found")

    task_states = repo.get_task_states(session_id) or {}
    return compute_progress(
        s["brief"], task_states, s["created_at"], elapsed_min
    )
