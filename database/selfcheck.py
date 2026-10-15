from concurrent.futures import ThreadPoolExecutor
import os
from pathlib import Path
import shutil
import sys
import tempfile

if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

# Support running directly or as a module
if __package__ is None or __package__ == "":
    sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
    from database import repository
else:
    from . import repository


def run_checks() -> bool:
    temp_dir = tempfile.mkdtemp(prefix="mentor_test_")
    # Subfolder that does not exist yet to test parent dir creation
    temp_db = Path(temp_dir) / "nested_dir" / "mentor_test.db"
    os.environ["MENTOR_DB"] = str(temp_db)

    all_passed = True

    try:
        # Check 1: init() twice does not fail, including when DB folder does not exist yet
        try:
            repository.init()
            repository.init()
            assert temp_db.exists(), "DB file was not created"
            print("PASS: init() twice does not fail, including when the DB folder does not exist yet")
        except Exception as e:
            all_passed = False
            print(f"FAIL: init() twice test: {e}")

        # Check 2: create_session then get_session returns identical team and brief dicts;
        # last_judge is None; the id is 12 hex characters
        problem = "Fix the latency in database indexing"
        team = {
            "team_size": 4,
            "skills": ["python", "sqlite"],
            "minutes_available": 120,
            "preferred_stack": "python",
        }
        brief = {
            "source": "rules",
            "summary": "Sample brief structure for testing",
            "mvp": {"goal": "Speed up indexing"},
        }

        session_id = None
        try:
            session_id = repository.create_session(problem, team, brief)
            assert isinstance(session_id, str), "session_id is not a string"
            assert len(session_id) == 12, f"session_id length {len(session_id)} != 12"
            assert all(c in "0123456789abcdefABCDEF" for c in session_id), "session_id is not hex"

            session = repository.get_session(session_id)
            assert session is not None, "get_session returned None"
            assert session["id"] == session_id, "session id mismatch"
            assert session["problem"] == problem, "problem mismatch"
            assert session["team"] == team, "team dict mismatch"
            assert session["brief"] == brief, "brief dict mismatch"
            assert session["last_judge"] is None, "last_judge is not None initially"
            assert "created_at" in session, "created_at missing"
            print("PASS: create_session then get_session returns identical team and brief dicts; last_judge is None; the id is 12 hex characters")
        except Exception as e:
            all_passed = False
            print(f"FAIL: create_session / get_session test: {e}")

        # Check 3: get_session("nope") is None; add_message, set_task_done and save_judge on an unknown session raise KeyError
        try:
            assert repository.get_session("nope") is None, "get_session('nope') did not return None"

            add_msg_raised = False
            try:
                repository.add_message("nope", "user", "hello", "understand")
            except KeyError:
                add_msg_raised = True
            assert add_msg_raised, "add_message on unknown session did not raise KeyError"

            set_task_raised = False
            try:
                repository.set_task_done("nope", "t1", True)
            except KeyError:
                set_task_raised = True
            assert set_task_raised, "set_task_done on unknown session did not raise KeyError"

            save_judge_raised = False
            try:
                repository.save_judge("nope", {"overall": 80})
            except KeyError:
                save_judge_raised = True
            assert save_judge_raised, "save_judge on unknown session did not raise KeyError"

            print("PASS: get_session('nope') is None; add_message, set_task_done and save_judge on an unknown session raise KeyError")
        except Exception as e:
            all_passed = False
            print(f"FAIL: unknown session KeyError checks: {e}")

        # Check 4: 3 messages come back oldest first with role, content, stage, created_at
        try:
            repository.add_message(session_id, "user", "Message 1", "understand")
            repository.add_message(session_id, "mentor", "Message 2", "understand")
            repository.add_message(session_id, "user", "Message 3", "ideate")

            msgs = repository.list_messages(session_id)
            assert len(msgs) == 3, f"Expected 3 messages, got {len(msgs)}"
            expected = [
                ("user", "Message 1", "understand"),
                ("mentor", "Message 2", "understand"),
                ("user", "Message 3", "ideate"),
            ]
            for m, exp in zip(msgs, expected):
                assert m["role"] == exp[0], f"Role mismatch: {m['role']} != {exp[0]}"
                assert m["content"] == exp[1], f"Content mismatch: {m['content']} != {exp[1]}"
                assert m["stage"] == exp[2], f"Stage mismatch: {m['stage']} != {exp[2]}"
                assert "created_at" in m, "created_at missing from message dict"

            assert msgs[0]["created_at"] <= msgs[1]["created_at"] <= msgs[2]["created_at"]
            print("PASS: 3 messages come back oldest first with role, content, stage, created_at")
        except Exception as e:
            all_passed = False
            print(f"FAIL: list_messages test: {e}")

        # Check 5: set_task_done true, then false, then true gives get_task_states {"t1": True}; two tasks are tracked independently
        try:
            repository.set_task_done(session_id, "t1", True)
            repository.set_task_done(session_id, "t1", False)
            repository.set_task_done(session_id, "t1", True)
            assert repository.get_task_states(session_id) == {"t1": True}, "t1 state mismatch"

            repository.set_task_done(session_id, "t2", False)
            assert repository.get_task_states(session_id) == {"t1": True, "t2": False}, "t1/t2 state mismatch"
            print("PASS: set_task_done true, then false, then true gives get_task_states {'t1': True}; two tasks are tracked independently")
        except Exception as e:
            all_passed = False
            print(f"FAIL: task tracking test: {e}")

        # Check 6: save_judge twice: get_session().last_judge is the second report
        report1 = {"overall": 65, "verdict": "almost_ready"}
        report2 = {"overall": 95, "verdict": "ready"}
        try:
            repository.save_judge(session_id, report1)
            repository.save_judge(session_id, report2)
            sess = repository.get_session(session_id)
            assert sess["last_judge"] == report2, f"last_judge mismatch: {sess['last_judge']} != {report2}"
            print("PASS: save_judge twice: get_session().last_judge is the second report")
        except Exception as e:
            all_passed = False
            print(f"FAIL: save_judge twice test: {e}")

        # Check 7: A message containing SQL injection text ("x'); DROP TABLE sessions;--") and Hindi text ("नमस्ते")
        # round-trips unchanged and the sessions table still exists
        try:
            special_content = "x'); DROP TABLE sessions;-- नमस्ते"
            repository.add_message(session_id, "user", special_content, "pitch")
            all_msgs = repository.list_messages(session_id)
            assert all_msgs[-1]["content"] == special_content, f"Content corrupted: {all_msgs[-1]['content']}"

            # Check sessions table still exists and contains session
            sess_check = repository.get_session(session_id)
            assert sess_check is not None, "Sessions table was dropped or session missing"
            print("PASS: A message containing SQL injection text ('x\\'); DROP TABLE sessions;--') and Hindi text round-trips unchanged and the sessions table still exists")
        except Exception as e:
            all_passed = False
            print(f"FAIL: SQL injection and Unicode test: {e}")

        # Check 8: 8 threads x 25 messages each: 200 rows in total and no "database is locked" error
        try:
            threaded_session_id = repository.create_session("Concurrent session", team, brief)

            def send_messages(thread_idx: int):
                for i in range(25):
                    repository.add_message(
                        threaded_session_id,
                        "user" if (i + thread_idx) % 2 == 0 else "mentor",
                        f"Thread {thread_idx} message {i}",
                        "build",
                    )

            with ThreadPoolExecutor(max_workers=8) as executor:
                futures = [executor.submit(send_messages, t) for t in range(8)]
                for f in futures:
                    f.result()

            threaded_msgs = repository.list_messages(threaded_session_id)
            assert len(threaded_msgs) == 200, f"Expected 200 messages, got {len(threaded_msgs)}"
            print("PASS: 8 threads x 25 messages each: 200 rows in total and no 'database is locked' error")
        except Exception as e:
            all_passed = False
            print(f"FAIL: Multi-threading concurrency test: {e}")

        # Check 9: Data survives calling init() again and re-reading the session
        try:
            repository.init()
            survived_sess = repository.get_session(session_id)
            assert survived_sess is not None, "Session disappeared after init()"
            assert survived_sess["problem"] == problem, "Problem data corrupted after init()"
            assert survived_sess["team"] == team, "Team data corrupted after init()"
            assert survived_sess["brief"] == brief, "Brief data corrupted after init()"
            assert survived_sess["last_judge"] == report2, "Last judge corrupted after init()"

            survived_tasks = repository.get_task_states(session_id)
            assert survived_tasks == {"t1": True, "t2": False}, "Tasks corrupted after init()"

            survived_msgs = repository.list_messages(session_id)
            # 3 original + 1 special sql-injection = 4 messages
            assert len(survived_msgs) == 4, f"Expected 4 messages, got {len(survived_msgs)}"
            print("PASS: Data survives calling init() again and re-reading the session")
        except Exception as e:
            all_passed = False
            print(f"FAIL: Data persistence after init() test: {e}")

    finally:
        # Cleanup temp directory
        try:
            shutil.rmtree(temp_dir)
        except Exception:
            pass

    return all_passed


def main() -> None:
    success = run_checks()
    if success:
        sys.exit(0)
    else:
        sys.exit(1)


if __name__ == "__main__":
    main()
