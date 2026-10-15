# database/selfcheck.py
import os
import tempfile
from database import repository


def run_selfcheck() -> None:
    temp_dir = tempfile.mkdtemp()
    test_db = os.path.join(temp_dir, "test_mentor.db")
    os.environ["MENTOR_DB"] = test_db

    try:
        # 1. Test init
        repository.init()
        assert os.path.exists(test_db), "Database file was not created"

        # 2. Test create_session
        sample_team = {"team_size": 4, "skills": ["Python"], "minutes_available": 75, "preferred_stack": "FastAPI"}
        sample_brief = {"session_id": None, "source": "rules"}
        session_id = repository.create_session("Build campus canteen app", sample_team, sample_brief)
        assert isinstance(session_id, str), "Session ID must be string"
        assert len(session_id) == 12, f"Session ID must be 12 hex chars, got {len(session_id)}"
        int(session_id, 16)  # must be valid hex

        # 3. Test get_session
        sess = repository.get_session(session_id)
        assert sess is not None, "Created session could not be retrieved"
        assert sess["id"] == session_id
        assert sess["problem"] == "Build campus canteen app"
        assert sess["team"]["team_size"] == 4
        assert sess["last_judge"] is None

        # 4. Non-existent session
        assert repository.get_session("nonexistent00") is None

        # 5. Test add_message & list_messages
        repository.add_message(session_id, "user", "Hello mentor", "understand")
        repository.add_message(session_id, "mentor", "Hello team", "understand")
        messages = repository.list_messages(session_id)
        assert len(messages) == 2, f"Expected 2 messages, got {len(messages)}"
        assert messages[0]["role"] == "user"
        assert messages[0]["content"] == "Hello mentor"
        assert messages[1]["role"] == "mentor"
        assert messages[1]["content"] == "Hello team"

        # KeyError on invalid session for add_message
        try:
            repository.add_message("invalid00000", "user", "fail", "understand")
            assert False, "Expected KeyError for nonexistent session"
        except KeyError:
            pass

        # 6. Test set_task_done & get_task_states
        repository.set_task_done(session_id, "t1", True)
        repository.set_task_done(session_id, "t2", False)
        states = repository.get_task_states(session_id)
        assert states.get("t1") is True
        assert states.get("t2") is False
        # update t2 to True
        repository.set_task_done(session_id, "t2", True)
        states = repository.get_task_states(session_id)
        assert states.get("t2") is True

        # KeyError on invalid session for set_task_done
        try:
            repository.set_task_done("invalid00000", "t1", True)
            assert False, "Expected KeyError for nonexistent session"
        except KeyError:
            pass

        # 7. Test save_judge
        sample_report = {"overall": 85, "readiness": "ready"}
        repository.save_judge(session_id, sample_report)
        sess = repository.get_session(session_id)
        assert sess["last_judge"] == sample_report

        # KeyError on invalid session for save_judge
        try:
            repository.save_judge("invalid00000", sample_report)
            assert False, "Expected KeyError for nonexistent session"
        except KeyError:
            pass

        print("DATABASE SELFCHECK: PASS")
    finally:
        if os.path.exists(test_db):
            try:
                os.remove(test_db)
            except Exception:
                pass


if __name__ == "__main__":
    run_selfcheck()
