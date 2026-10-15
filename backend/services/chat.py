from fastapi import HTTPException
from pydantic import ValidationError
from contract.models import ChatRequest, ChatResponse
import backend.deps as deps


def process_chat(req: ChatRequest) -> ChatResponse:
    """Handle POST /api/chat: redact -> mentor_reply -> validate -> store messages -> return."""
    engine = deps.get_engine()
    repo = deps.get_repo()

    s = repo.get_session(req.session_id)
    if not s:
        raise HTTPException(status_code=404, detail=f"Session {req.session_id} not found")

    clean_message = engine.redact(req.message)
    history = repo.list_messages(req.session_id)
    raw_response = engine.mentor_reply(
        s["brief"], history, clean_message, req.stage, s["team"]
    )

    try:
        chat_resp = ChatResponse.model_validate(raw_response)
    except ValidationError as e:
        first_err = str(e.errors()[0]["msg"])[:200]
        raise HTTPException(
            status_code=502,
            detail=f"AI layer returned an invalid ChatResponse: {first_err}"
        )

    # Store user message and mentor reply in repository
    repo.add_message(req.session_id, "user", clean_message, req.stage)
    repo.add_message(req.session_id, "mentor", chat_resp.reply, chat_resp.stage)

    return chat_resp
