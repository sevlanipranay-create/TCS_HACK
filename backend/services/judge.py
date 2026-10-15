from fastapi import HTTPException
from pydantic import ValidationError
from contract.models import JudgeReport, JudgeRequest
import backend.deps as deps


def evaluate_judge(req: JudgeRequest) -> JudgeReport:
    """Handle POST /api/judge: redact text fields -> engine.judge -> validate -> save -> return."""
    engine = deps.get_engine()
    repo = deps.get_repo()

    s = repo.get_session(req.session_id)
    if not s:
        raise HTTPException(status_code=404, detail=f"Session {req.session_id} not found")

    # Redact every free-text judge field
    clean_submission = {
        "idea_summary": engine.redact(req.idea_summary),
        "features_built": [engine.redact(f) for f in req.features_built],
        "demo_script": engine.redact(req.demo_script),
        "known_limits": [engine.redact(k) for k in req.known_limits],
        "minutes_left": req.minutes_left,
    }

    raw_report = engine.judge(s["brief"], clean_submission, s["team"])

    try:
        report = JudgeReport.model_validate(raw_report)
    except ValidationError as e:
        first_err = str(e.errors()[0]["msg"])[:200]
        raise HTTPException(
            status_code=502,
            detail=f"AI layer returned an invalid JudgeReport: {first_err}"
        )

    repo.save_judge(req.session_id, report.model_dump())
    return report
