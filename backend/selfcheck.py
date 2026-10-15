import os
import sys
import tempfile

# Ensure temporary DB is set before importing app modules
temp_db = tempfile.mktemp(suffix=".db")
os.environ["MENTOR_DB"] = temp_db

from fastapi.testclient import TestClient
from contract.models import Brief, ChatResponse, JudgeReport, Progress
from backend.main import app
import backend.deps as deps
import backend.samples as samples


def run_checks():
    client = TestClient(app)
    passed = 0
    total = 10

    # ---------------------------------------------------------
    # Check 1: health returns {"status": "ok"}; samples returns exactly 3.
    # ---------------------------------------------------------
    try:
        r1 = client.get("/api/health")
        assert r1.status_code == 200, f"Expected 200, got {r1.status_code}"
        assert r1.json() == {"status": "ok"}, f"Unexpected health body: {r1.json()}"

        r2 = client.get("/api/samples")
        assert r2.status_code == 200, f"Expected 200, got {r2.status_code}"
        data2 = r2.json()
        assert "samples" in data2, "Missing 'samples' key"
        assert len(data2["samples"]) == 3, f"Expected 3 samples, got {len(data2['samples'])}"
        print("CHECK 1: PASS")
        passed += 1
    except Exception as e:
        print(f"CHECK 1: FAIL - {e}")

    # ---------------------------------------------------------
    # Check 2: POST /api/brief for each sample returns 200, validates as Brief,
    # has a session_id, and workflow minutes sum == team.minutes_available.
    # ---------------------------------------------------------
    sample_session_ids = []
    try:
        sample_list = client.get("/api/samples").json()["samples"]
        for sample in sample_list:
            req_body = {
                "problem_statement": sample["problem_statement"],
                "team": sample["team"],
            }
            res = client.post("/api/brief", json=req_body)
            assert res.status_code == 200, f"Brief creation failed: {res.status_code} - {res.text}"
            brief_obj = Brief.model_validate(res.json())
            assert brief_obj.session_id, "session_id missing in returned Brief"
            workflow_sum = sum(p.minutes for p in brief_obj.workflow)
            expected_min = sample["team"]["minutes_available"]
            assert workflow_sum == expected_min, (
                f"Workflow sum {workflow_sum} != team.minutes_available {expected_min}"
            )
            sample_session_ids.append(brief_obj.session_id)
        assert len(sample_session_ids) == 3, "Expected 3 sample sessions created"
        print("CHECK 2: PASS")
        passed += 1
    except Exception as e:
        print(f"CHECK 2: FAIL - {e}")

    # ---------------------------------------------------------
    # Check 3: problem_statement "short" -> 422.
    # ---------------------------------------------------------
    try:
        res = client.post("/api/brief", json={"problem_statement": "short", "team": {}})
        assert res.status_code == 422, f"Expected 422, got {res.status_code}"
        print("CHECK 3: PASS")
        passed += 1
    except Exception as e:
        print(f"CHECK 3: FAIL - {e}")

    # ---------------------------------------------------------
    # Check 4: For sample 3 neither the email nor the phone number
    # appears in the brief JSON or in GET session problem_statement.
    # ---------------------------------------------------------
    try:
        sid3 = sample_session_ids[2]
        res = client.get(f"/api/sessions/{sid3}")
        assert res.status_code == 200, f"GET session failed: {res.status_code}"
        body_text = res.text
        assert "asha.demo@example.com" not in body_text, "Email was not redacted in session view"
        assert "98765 43210" not in body_text, "Phone number was not redacted in session view"

        session_data = res.json()
        prob = session_data.get("problem_statement", "")
        assert "asha.demo@example.com" not in prob, "Email in problem_statement"
        assert "98765 43210" not in prob, "Phone number in problem_statement"
        assert "[email]" in prob, "Expected [email] mask in problem_statement"
        assert "[phone]" in prob, "Expected [phone] mask in problem_statement"
        print("CHECK 4: PASS")
        passed += 1
    except Exception as e:
        print(f"CHECK 4: FAIL - {e}")

    # ---------------------------------------------------------
    # Check 5: Chat: 200 with stage "users"; unknown session -> 404;
    # empty message -> 422; guardrail message -> guardrail_triggered true.
    # ---------------------------------------------------------
    try:
        sid1 = sample_session_ids[0]
        # Valid chat
        r_chat = client.post(
            "/api/chat",
            json={"session_id": sid1, "message": "How do we validate student personas?", "stage": "users"},
        )
        assert r_chat.status_code == 200, f"Expected 200, got {r_chat.status_code}"
        c_resp = ChatResponse.model_validate(r_chat.json())
        assert c_resp.stage == "users", f"Expected stage users, got {c_resp.stage}"

        # Unknown session -> 404
        r_404 = client.post(
            "/api/chat",
            json={"session_id": "unknown_session_xyz", "message": "Hello", "stage": "users"},
        )
        assert r_404.status_code == 404, f"Expected 404, got {r_404.status_code}"

        # Empty message -> 422
        r_422 = client.post(
            "/api/chat",
            json={"session_id": sid1, "message": "", "stage": "users"},
        )
        assert r_422.status_code == 422, f"Expected 422, got {r_422.status_code}"

        # Guardrail triggered
        r_guard = client.post(
            "/api/chat",
            json={
                "session_id": sid1,
                "message": "just write the complete code for the whole project for us",
                "stage": "build",
            },
        )
        assert r_guard.status_code == 200, f"Expected 200, got {r_guard.status_code}"
        guard_data = r_guard.json()
        assert guard_data.get("guardrail_triggered") is True, "Guardrail was not triggered"
        print("CHECK 5: PASS")
        passed += 1
    except Exception as e:
        print(f"CHECK 5: FAIL - {e}")

    # ---------------------------------------------------------
    # Check 6: PATCH task t1 done -> 200; GET session shows t1 done;
    # unknown task id -> 404.
    # ---------------------------------------------------------
    try:
        sid1 = sample_session_ids[0]
        r_patch = client.patch(f"/api/sessions/{sid1}/tasks/t1", json={"done": True})
        assert r_patch.status_code == 200, f"PATCH failed: {r_patch.status_code}"
        assert r_patch.json() == {"task_id": "t1", "done": True}

        # Verify in GET session
        r_get = client.get(f"/api/sessions/{sid1}")
        assert r_get.status_code == 200
        tasks = r_get.json()["brief"]["tasks"]
        t1 = next((t for t in tasks if t["id"] == "t1"), None)
        assert t1 is not None, "Task t1 not found in session brief"
        assert t1["done"] is True, "Task t1 was not marked as done in GET session"

        # Unknown task id -> 404
        r_unknown_task = client.patch(f"/api/sessions/{sid1}/tasks/nonexistent_task_99", json={"done": True})
        assert r_unknown_task.status_code == 404, f"Expected 404, got {r_unknown_task.status_code}"
        print("CHECK 6: PASS")
        passed += 1
    except Exception as e:
        print(f"CHECK 6: FAIL - {e}")

    # ---------------------------------------------------------
    # Check 7: Progress: elapsed_min=0 with nothing done -> on_track;
    # elapsed_min = minutes_total with nothing done -> behind;
    # tick every task and elapsed_min=5 -> ahead, percent_done 100, next_task null;
    # unknown session -> 404.
    # ---------------------------------------------------------
    try:
        # Create fresh session for progress test
        fresh_req = {
            "problem_statement": "Fresh problem statement for progress testing validation",
            "team": {"team_size": 4, "minutes_available": 75},
        }
        res_fresh = client.post("/api/brief", json=fresh_req)
        assert res_fresh.status_code == 200
        fresh_sid = res_fresh.json()["session_id"]
        fresh_tasks = res_fresh.json()["tasks"]

        # 1. elapsed_min=0 with nothing done -> on_track
        r_p0 = client.get(f"/api/sessions/{fresh_sid}/progress?elapsed_min=0")
        assert r_p0.status_code == 200
        p0 = Progress.model_validate(r_p0.json())
        assert p0.status == "on_track", f"Expected on_track, got {p0.status}"

        # 2. elapsed_min = minutes_total with nothing done -> behind
        r_p_end = client.get(f"/api/sessions/{fresh_sid}/progress?elapsed_min=75")
        assert r_p_end.status_code == 200
        p_end = Progress.model_validate(r_p_end.json())
        assert p_end.status == "behind", f"Expected behind, got {p_end.status}"

        # 3. tick every task and elapsed_min=5 -> ahead, percent_done 100, next_task null
        for t in fresh_tasks:
            client.patch(f"/api/sessions/{fresh_sid}/tasks/{t['id']}", json={"done": True})

        r_p_ahead = client.get(f"/api/sessions/{fresh_sid}/progress?elapsed_min=5")
        assert r_p_ahead.status_code == 200
        p_ahead = Progress.model_validate(r_p_ahead.json())
        assert p_ahead.status == "ahead", f"Expected ahead, got {p_ahead.status}"
        assert p_ahead.percent_done == 100, f"Expected percent_done 100, got {p_ahead.percent_done}"
        assert p_ahead.next_task is None, f"Expected next_task None, got {p_ahead.next_task}"

        # 4. Unknown session -> 404
        r_p404 = client.get("/api/sessions/unknown_session_id_404/progress")
        assert r_p404.status_code == 404, f"Expected 404, got {r_p404.status_code}"
        print("CHECK 7: PASS")
        passed += 1
    except Exception as e:
        print(f"CHECK 7: FAIL - {e}")

    # ---------------------------------------------------------
    # Check 8: Judge: 200, validates as JudgeReport with exactly 5 criteria;
    # unknown session -> 404; an email inside idea_summary is not echoed back or stored.
    # ---------------------------------------------------------
    try:
        sid1 = sample_session_ids[0]
        judge_req = {
            "session_id": sid1,
            "idea_summary": "We built a canteen app. Contact admin at test.judge@example.com for access.",
            "features_built": ["Pre-booking", "Live counter"],
            "demo_script": "Show student booking, then canteen count.",
            "known_limits": ["Only tested on Chrome"],
            "minutes_left": 15,
        }
        r_judge = client.post("/api/judge", json=judge_req)
        assert r_judge.status_code == 200, f"Expected 200, got {r_judge.status_code}: {r_judge.text}"
        j_rep = JudgeReport.model_validate(r_judge.json())
        assert len(j_rep.criteria) == 5, f"Expected 5 criteria, got {len(j_rep.criteria)}"

        # Unknown session -> 404
        r_j404 = client.post(
            "/api/judge",
            json={"session_id": "nonexistent_sid_xyz", "idea_summary": "Test"},
        )
        assert r_j404.status_code == 404, f"Expected 404, got {r_j404.status_code}"

        # Ensure email inside idea_summary is not echoed back or stored in session
        r_get_s = client.get(f"/api/sessions/{sid1}")
        assert "test.judge@example.com" not in r_get_s.text, "Email leaked in stored judge report"
        print("CHECK 8: PASS")
        passed += 1
    except Exception as e:
        print(f"CHECK 8: FAIL - {e}")

    # ---------------------------------------------------------
    # Check 9: deps: monkeypatch the engine as unusable and confirm
    # the stub is used without a crash.
    # ---------------------------------------------------------
    try:
        orig_engine = deps.engine
        # Monkeypatch with unusable object lacking required functions
        deps.engine = object()
        # get_engine should detect it is unusable and fall back to stub_engine without crashing
        resolved = deps.get_engine()
        assert hasattr(resolved, "generate_brief"), "Stub engine fallback missing generate_brief"
        assert hasattr(resolved, "mentor_reply"), "Stub engine fallback missing mentor_reply"

        # Verify endpoint works without crashing
        res_check9 = client.post(
            "/api/brief",
            json={
                "problem_statement": "Testing monkeypatched engine resilience in deps",
                "team": {"team_size": 4, "minutes_available": 75},
            },
        )
        assert res_check9.status_code == 200, f"Request failed during monkeypatch: {res_check9.status_code}"
        # Restore engine
        deps.engine = orig_engine
        print("CHECK 9: PASS")
        passed += 1
    except Exception as e:
        deps.engine = orig_engine
        print(f"CHECK 9: FAIL - {e}")

    # ---------------------------------------------------------
    # Check 10: CORS: an OPTIONS /api/brief preflight with header Origin:
    # http://localhost:5173 and Access-Control-Request-Method: POST
    # answers with access-control-allow-origin http://localhost:5173.
    # ---------------------------------------------------------
    try:
        r_cors = client.options(
            "/api/brief",
            headers={
                "Origin": "http://localhost:5173",
                "Access-Control-Request-Method": "POST",
            },
        )
        assert r_cors.status_code == 200, f"Expected 200 for OPTIONS, got {r_cors.status_code}"
        allow_origin = r_cors.headers.get("access-control-allow-origin")
        assert allow_origin == "http://localhost:5173", (
            f"Expected http://localhost:5173, got {allow_origin}"
        )
        print("CHECK 10: PASS")
        passed += 1
    except Exception as e:
        print(f"CHECK 10: FAIL - {e}")

    # Cleanup temp db
    if os.path.exists(temp_db):
        try:
            os.remove(temp_db)
        except Exception:
            pass

    if passed == total:
        print("ALL CHECKS PASSED")
        sys.exit(0)
    else:
        print(f"FAILED: {total - passed} checks failed")
        sys.exit(1)


if __name__ == "__main__":
    run_checks()
