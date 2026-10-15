import importlib
import logging

logger = logging.getLogger("backend")

REQUIRED_ENGINE_ATTRS = ["redact", "generate_brief", "mentor_reply", "judge"]
REQUIRED_REPO_ATTRS = [
    "init", "create_session", "get_session", "add_message",
    "list_messages", "set_task_done", "get_task_states", "save_judge"
]


def is_valid_engine(mod) -> bool:
    if mod is None:
        return False
    return all(hasattr(mod, attr) and callable(getattr(mod, attr)) for attr in REQUIRED_ENGINE_ATTRS)


def is_valid_repo(mod) -> bool:
    if mod is None:
        return False
    return all(hasattr(mod, attr) and callable(getattr(mod, attr)) for attr in REQUIRED_REPO_ATTRS)


def resolve_engine():
    try:
        import ai.engine as ai_engine
        if is_valid_engine(ai_engine):
            return ai_engine
    except Exception:
        pass
    import backend.stubs.stub_engine as stub_engine
    return stub_engine


def resolve_repo():
    try:
        import database.repository as db_repo
        if is_valid_repo(db_repo):
            return db_repo
    except Exception:
        pass
    import backend.stubs.mem_repo as mem_repo
    return mem_repo


# Picks implementations at import time
engine = resolve_engine()
repo = resolve_repo()


def get_engine():
    global engine
    if is_valid_engine(engine):
        return engine
    return resolve_engine()


def get_repo():
    global repo
    if is_valid_repo(repo):
        return repo
    return resolve_repo()


def log_startup():
    eng = get_engine()
    rp = get_repo()
    logger.info(f"backend using engine={eng.__name__} repo={rp.__name__}")


# Log on import
log_startup()
