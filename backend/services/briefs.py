from fastapi import HTTPException
from pydantic import ValidationError
from contract.models import Brief, BriefRequest
import backend.deps as deps


def create_brief(req: BriefRequest) -> Brief:
    """Handle POST /api/brief: redact -> engine.generate_brief -> validate -> create session -> return."""
    engine = deps.get_engine()
    repo = deps.get_repo()

    clean_problem = engine.redact(req.problem_statement)
    team_dict = req.team.model_dump()

    raw_brief = engine.generate_brief(clean_problem, team_dict)

    try:
        brief = Brief.model_validate(raw_brief)
    except ValidationError as e:
        first_err = str(e.errors()[0]["msg"])[:200]
        raise HTTPException(
            status_code=502,
            detail=f"AI layer returned an invalid Brief: {first_err}"
        )

    session_id = repo.create_session(clean_problem, team_dict, brief.model_dump())
    brief.session_id = session_id
    return brief
