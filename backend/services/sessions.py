import copy
from fastapi import HTTPException
from contract.models import Brief, ChatMessage, JudgeReport, SessionView, TaskState, TaskUpdate, TeamContext
import backend.deps as deps


def get_session_view(session_id: str) -> SessionView:
    """Handle GET /api/sessions/{id}: return SessionView with tasks merged and messages attached."""
    repo = deps.get_repo()
    s = repo.get_session(session_id)
    if not s:
        raise HTTPException(status_code=404, detail=f"Session {session_id} not found")

    task_states = repo.get_task_states(session_id) or {}
    brief_data = copy.deepcopy(s["brief"])
    brief_data["session_id"] = session_id

    # Merge task states into brief.tasks[].done
    if "tasks" in brief_data and isinstance(brief_data["tasks"], list):
        for t in brief_data["tasks"]:
            tid = t.get("id")
            if tid in task_states:
                t["done"] = task_states[tid]

    brief = Brief.model_validate(brief_data)
    messages = [ChatMessage.model_validate(m) for m in repo.list_messages(session_id)]
    last_judge = JudgeReport.model_validate(s["last_judge"]) if s.get("last_judge") else None

    return SessionView(
        session_id=session_id,
        created_at=s["created_at"],
        problem_statement=s["problem"],
        team=TeamContext.model_validate(s["team"]),
        brief=brief,
        messages=messages,
        last_judge=last_judge,
    )


def patch_task(session_id: str, task_id: str, update: TaskUpdate) -> TaskState:
    """Handle PATCH /api/sessions/{id}/tasks/{task_id}: validate session and task exist, then update."""
    repo = deps.get_repo()
    s = repo.get_session(session_id)
    if not s:
        raise HTTPException(status_code=404, detail=f"Session {session_id} not found")

    brief_tasks = s.get("brief", {}).get("tasks", [])
    task_ids = [t.get("id") for t in brief_tasks if isinstance(t, dict)]
    if task_id not in task_ids:
        raise HTTPException(status_code=404, detail=f"Task {task_id} not found in session")

    repo.set_task_done(session_id, task_id, update.done)
    return TaskState(task_id=task_id, done=update.done)
