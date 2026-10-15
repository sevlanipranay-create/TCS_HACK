#!/usr/bin/env python3
"""
tests/contract_check.py - The Integration Referee for Hackathon Mentor AI.
Validates all backend endpoints against the Contract Block v2.1 specification.

Usage:
    python tests/contract_check.py [--base http://127.0.0.1:8000] [--session <id>]
"""

import argparse
import json
import os
import sys
import time
from collections import defaultdict
from typing import Any, Dict, List, Optional, Tuple

import httpx

# Ensure repo root is on sys.path to import contract.models
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from contract.models import (
    Brief,
    BriefRequest,
    ChatMessage,
    ChatRequest,
    ChatResponse,
    JudgeReport,
    JudgeRequest,
    Progress,
    SessionView,
    TaskState,
    TaskUpdate,
    TeamContext,
)

# Results tracking
results: List[Tuple[str, str, str]] = []  # (status, owner, message)
forward_list = defaultdict(list)


def record(status: str, owner: str, message: str, fix: str = ""):
    results.append((status, owner, message))
    status_symbol = {
        "PASS": "[PASS]",
        "FAIL": "[FAIL]",
        "WARN": "[WARN]",
    }.get(status, f"[{status}]")
    print(f"{status_symbol} [{owner}] {message}")
    if status == "FAIL" and fix:
        forward_list[owner].append(fix)


def make_weak_judge_request(session_id: str, brief: Brief) -> dict:
    feature_name = brief.mvp.must_have[0].name if brief.mvp.must_have else "Core Dashboard"
    return {
        "session_id": session_id,
        "idea_summary": "A simple tool for campus canteen orders.",
        "features_built": [feature_name],
        "demo_script": "",
        "known_limits": [],
        "minutes_left": 30,
    }


def make_strong_judge_request(session_id: str, brief: Brief) -> dict:
    persona_name = brief.personas[0].name if brief.personas else "student"
    summary = (
        f"Today we interviewed 15 students like {persona_name} who confirmed an urgent need "
        f"for an offline queue reservation system that prevents meal delays."
    )
    features = [m.name for m in brief.mvp.must_have]
    innovative_feats = [f.name for f in brief.features if f.innovative]
    if innovative_feats:
        features.append(innovative_feats[0])
    demo_script = (
        "1. Open student view and observe live wait time.\n"
        "2. Submit offline order request token.\n"
        "3. Kitchen coordinator receives ticket.\n"
        "4. Coordinator marks food ready for collection.\n"
        "5. Order fulfilled with token match."
    )
    known_limits = [
        "Does not integrate off-campus banking APIs",
        "Limited to single cafeteria service counter",
    ]
    return {
        "session_id": session_id,
        "idea_summary": summary,
        "features_built": features,
        "demo_script": demo_script,
        "known_limits": known_limits,
        "minutes_left": 15,
    }


def main():
    parser = argparse.ArgumentParser(description="Hackathon Mentor AI Contract Referee")
    parser.add_argument("--base", default=os.getenv("BASE_URL", "http://127.0.0.1:8000"), help="Base URL of backend API")
    parser.add_argument("--session", default=None, help="Existing session ID to test persistence across restarts")
    args = parser.parse_args()

    base_url = args.base.rstrip("/")
    client = httpx.Client(base_url=base_url, timeout=10.0)

    print(f"=== Hackathon Mentor AI Contract Check ===")
    print(f"Target Base URL: {base_url}")
    if args.session:
        print(f"Testing persistence for existing session: {args.session}")
    print("-" * 50)

    # If --session was supplied, run persistence verification directly
    if args.session:
        try:
            r = client.get(f"/api/sessions/{args.session}")
            if r.status_code == 200:
                view = SessionView.model_validate(r.json())
                record("PASS", "B or D", f"Session '{args.session}' successfully retrieved with brief, {len(view.messages)} messages, and ticked tasks.")
            else:
                record("FAIL", "B or D", f"Session '{args.session}' not found: HTTP {r.status_code}", "Verify SQLite database file persistence across restarts.")
        except Exception as e:
            record("FAIL", "B or D", f"Persistence check failed with exception: {e}", "Ensure database file path MENTOR_DB is persistent.")
        return print_summary()

    # 1. [B] Health check
    try:
        r = client.get("/api/health")
        if r.status_code == 200 and r.json() == {"status": "ok"}:
            record("PASS", "B", "GET /api/health returned 200 and {'status': 'ok'}")
        else:
            record("FAIL", "B", f"GET /api/health failed: HTTP {r.status_code} {r.text}", "Ensure GET /api/health returns HTTP 200 with {'status': 'ok'}.")
    except Exception as e:
        record("FAIL", "B", f"GET /api/health connection error: {e}", "Ensure backend server is running on the specified port.")
        return print_summary()

    # 2. [B] Samples endpoint
    samples_data = []
    try:
        r = client.get("/api/samples")
        if r.status_code == 200:
            data = r.json()
            samples_list = data.get("samples", [])
            if len(samples_list) == 3:
                # Validate sample structure
                valid = True
                for s in samples_list:
                    if not all(k in s for k in ("id", "title", "problem_statement", "team")):
                        valid = False
                    TeamContext.model_validate(s["team"])
                if valid:
                    record("PASS", "B", "GET /api/samples returned exactly 3 well-formed samples.")
                    samples_data = samples_list
                else:
                    record("FAIL", "B", "GET /api/samples items missing required fields", "Ensure each sample contains id, title, problem_statement, and team.")
            else:
                record("FAIL", "B", f"GET /api/samples returned {len(samples_list)} items, expected exactly 3", "Ensure GET /api/samples returns exactly 3 samples.")
        else:
            record("FAIL", "B", f"GET /api/samples returned HTTP {r.status_code}", "Implement GET /api/samples returning 3 curated samples.")
    except Exception as e:
        record("FAIL", "B", f"GET /api/samples exception: {e}", "Implement GET /api/samples.")

    # Load 5 samples from tests/samples.json for comprehensive testing
    samples_file_path = os.path.join(os.path.dirname(__file__), "samples.json")
    all_samples = []
    if os.path.exists(samples_file_path):
        with open(samples_file_path, "r", encoding="utf-8") as f:
            all_samples = json.load(f)
    else:
        all_samples = samples_data

    # 3. [B] 422 on short statement
    try:
        r = client.post("/api/brief", json={"problem_statement": "short", "team": {}})
        if r.status_code == 422:
            record("PASS", "B", "POST /api/brief returned 422 for statement < 10 characters.")
        else:
            record("FAIL", "B", f"POST /api/brief on short statement returned HTTP {r.status_code}, expected 422", "Ensure Pydantic validation rejects problem statements shorter than 10 characters with 422.")
    except Exception as e:
        record("FAIL", "B", f"POST /api/brief short statement check error: {e}", "Validate min_length=10 on problem_statement.")

    # 4. [B] 404 on unknown session for chat, sessions, tasks, progress, judge
    unknown_sid = "000000000000"
    endpoints_to_test = [
        ("POST", "/api/chat", {"session_id": unknown_sid, "message": "hello", "stage": "understand"}),
        ("GET", f"/api/sessions/{unknown_sid}", None),
        ("PATCH", f"/api/sessions/{unknown_sid}/tasks/t1", {"done": True}),
        ("GET", f"/api/sessions/{unknown_sid}/progress", None),
        ("POST", "/api/judge", {"session_id": unknown_sid, "idea_summary": "test"}),
    ]
    for method, path, payload in endpoints_to_test:
        try:
            if method == "POST":
                r = client.post(path, json=payload)
            elif method == "PATCH":
                r = client.patch(path, json=payload)
            else:
                r = client.get(path)
            if r.status_code == 404:
                record("PASS", "B", f"{method} {path} returned 404 on unknown session.")
            else:
                record("FAIL", "B", f"{method} {path} returned HTTP {r.status_code}, expected 404", f"Return 404 when session '{unknown_sid}' does not exist.")
        except Exception as e:
            record("FAIL", "B", f"{method} {path} error: {e}", "Handle nonexistent session IDs with 404.")

    # 5. [C or B] POST /api/brief for samples: schema, formulas, consistency
    brief_map: Dict[str, Tuple[Brief, float]] = {}
    for sample in all_samples:
        sid = sample.get("id", "sample")
        t0 = time.time()
        try:
            r = client.post("/api/brief", json={"problem_statement": sample["problem_statement"], "team": sample["team"]})
            elapsed = time.time() - t0
            if r.status_code == 200:
                brief = Brief.model_validate(r.json())
                brief_map[sid] = (brief, elapsed)
                record("PASS", "C or B", f"POST /api/brief for {sid} succeeded and validated as Brief (took {elapsed:.2f}s).")
            else:
                record("FAIL", "C or B", f"POST /api/brief for {sid} returned HTTP {r.status_code}: {r.text}", f"Ensure brief generation succeeds for sample {sid}.")
        except Exception as e:
            record("FAIL", "C or B", f"POST /api/brief for {sid} failed validation: {e}", f"Fix schema or data generation for {sid}.")

    # Latency check on sample 1
    if "t1_canteen" in brief_map:
        t1_brief, t1_lat = brief_map["t1_canteen"]
        if t1_lat < 1.5:
            record("PASS", "C", f"Brief generation latency for t1_canteen was {t1_lat:.2f}s (< 1.5s).")
        else:
            record("WARN", "C", f"Brief generation latency for t1_canteen was {t1_lat:.2f}s (>= 1.5s).")

    # Workflow, tasks, checkpoints, feasibility checks on generated briefs
    for sid, (b, _) in brief_map.items():
        sample_conf = next((s for s in all_samples if s.get("id") == sid), None)
        team_ctx = sample_conf["team"] if sample_conf else {"team_size": 4, "minutes_available": 75}
        min_avail = team_ctx.get("minutes_available", 75)
        team_sz = team_ctx.get("team_size", 4)

        # 6 phases in Stage order
        expected_stages = ["understand", "users", "ideate", "build", "validate", "pitch"]
        actual_stages = [p.phase for p in b.workflow]
        phases_sum = sum(p.minutes for p in b.workflow)
        if actual_stages == expected_stages and phases_sum == min_avail:
            record("PASS", "C or B", f"Workflow for {sid} has 6 phases in Stage order and sum of minutes ({phases_sum}) == minutes_available ({min_avail}).")
        else:
            record("FAIL", "C or B", f"Workflow for {sid} invalid: phases={actual_stages}, sum={phases_sum}, expected={min_avail}", "Workflow must have 6 phases in exact Stage order with minutes summing to minutes_available.")

        # Tasks 8 to 14, ids t1..tn, total minutes <= 85% of minutes_available
        task_count = len(b.tasks)
        task_ids = [t.id for t in b.tasks]
        expected_ids = [f"t{i+1}" for i in range(task_count)]
        task_minutes = sum(t.minutes for t in b.tasks)
        max_allowed_task_min = min_avail * 0.85
        if 8 <= task_count <= 14 and task_ids == expected_ids and task_minutes <= max_allowed_task_min:
            record("PASS", "C or B", f"Tasks for {sid} valid: count={task_count}, ids=t1..t{task_count}, total_min={task_minutes} <= {max_allowed_task_min:.1f}.")
        else:
            record("FAIL", "C or B", f"Tasks for {sid} invalid: count={task_count}, ids={task_ids[:3]}.., total_min={task_minutes}, max_allowed={max_allowed_task_min:.1f}", "Tasks must be 8-14, sequential IDs t1..tn, total minutes <= 85% of minutes_available.")

        # Checkpoints: 4 ascending
        cp_count = len(b.checkpoints)
        cp_minutes = [c.at_minute for c in b.checkpoints]
        is_ascending = all(cp_minutes[i] < cp_minutes[i+1] for i in range(cp_count - 1)) if cp_count > 1 else False
        if cp_count == 4 and is_ascending:
            record("PASS", "C or B", f"Checkpoints for {sid} valid: exactly 4 ascending ({cp_minutes}).")
        else:
            record("FAIL", "C or B", f"Checkpoints for {sid} invalid: count={cp_count}, minutes={cp_minutes}", "Checkpoints must be exactly 4 with strictly ascending at_minute.")

        # Must-haves 3 to 5, demo_path 4 to 6
        mh_count = len(b.mvp.must_have)
        dp_count = len(b.mvp.demo_path)
        if 3 <= mh_count <= 5 and 4 <= dp_count <= 6:
            record("PASS", "C or B", f"MVP for {sid} valid: {mh_count} must-haves, {dp_count} demo steps.")
        else:
            record("FAIL", "C or B", f"MVP for {sid} invalid: {mh_count} must-haves (expected 3-5), {dp_count} demo steps (expected 4-6)", "MVP must have 3-5 must-haves and 4-6 demo path steps.")

        # 6 jury slides, 2 your_call, at least 3 assumptions
        if len(b.jury_outline) == 6 and len(b.your_call) == 2 and len(b.problem.assumptions) >= 3:
            record("PASS", "C or B", f"Structure for {sid} valid: 6 slides, 2 your_call, {len(b.problem.assumptions)} assumptions.")
        else:
            record("FAIL", "C or B", f"Structure for {sid} invalid: slides={len(b.jury_outline)}, your_call={len(b.your_call)}, assumptions={len(b.problem.assumptions)}", "Ensure exactly 6 jury slides, 2 your_call decision points, and at least 3 assumptions.")

        # Feasibility formula recomputation
        effort_map = {"S": 1.0, "M": 2.0, "L": 4.0}
        exp_budget = round(team_sz * min_avail * 0.5 / 20.0, 1)
        exp_used = round(sum(effort_map[f.effort] for f in b.features if f.priority in ["must", "should"]), 1)
        if exp_used <= exp_budget:
            exp_verdict = "realistic"
        elif exp_used <= 1.3 * exp_budget:
            exp_verdict = "tight"
        else:
            exp_verdict = "overscoped"
        exp_score = 100 if exp_used == 0 else round(100 * min(1.0, exp_budget / exp_used))

        f = b.feasibility
        budget_ok = abs(f.budget_points - exp_budget) <= 0.05
        used_ok = abs(f.used_points - exp_used) <= 0.05
        verdict_ok = f.verdict == exp_verdict
        score_ok = abs(f.score - exp_score) <= 1
        if budget_ok and used_ok and verdict_ok and score_ok:
            record("PASS", "C or B", f"Feasibility for {sid} matches exact formula (budget={f.budget_points}, used={f.used_points}, verdict={f.verdict}, score={f.score}).")
        else:
            record("FAIL", "C or B", f"Feasibility mismatch for {sid}: got (budget={f.budget_points}, used={f.used_points}, verdict={f.verdict}, score={f.score}), expected ({exp_budget}, {exp_used}, {exp_verdict}, {exp_score})", "Compute feasibility strictly with formula: budget=team_size*min*0.5/20, used=sum(must/should effort pts).")

        # Source not stub
        if b.source == "stub":
            record("WARN", "C or B", f"Brief source for {sid} is 'stub'")
        else:
            record("PASS", "C or B", f"Brief source for {sid} is '{b.source}'.")

    # 6. [C] Specific domain & PII & stack reaction checks
    if "t4_overscoped" in brief_map:
        t4_brief, _ = brief_map["t4_overscoped"]
        if t4_brief.feasibility.verdict != "realistic":
            record("PASS", "C", f"t4_overscoped verdict is '{t4_brief.feasibility.verdict}' (not 'realistic').")
        else:
            record("FAIL", "C", "t4_overscoped was rated 'realistic' despite massive scope and tiny budget", "Ensure t4_overscoped is classified as 'tight' or 'overscoped'.")

    if "t1_canteen" in brief_map and "t2_study" in brief_map:
        d1 = brief_map["t1_canteen"][0].problem.domain
        d2 = brief_map["t2_study"][0].problem.domain
        if d1 != d2:
            record("PASS", "C", f"t1 and t2 produced different domains: '{d1}' vs '{d2}'.")
        else:
            record("FAIL", "C", f"t1 and t2 received identical domain '{d1}'", "Ensure domain classification distinguishes different problem domains.")

    if "t3_vague_pii" in brief_map:
        t3_brief, _ = brief_map["t3_vague_pii"]
        t3_json = t3_brief.model_dump_json()
        raw_t3 = next((s for s in all_samples if s.get("id") == "t3_vague_pii"), {})
        emails_to_check = ["john.doe@vesit.edu", "campus-security@vesit.ac.in"]
        phone_to_check = "9876543210"

        leaked_email = any(email in t3_json for email in emails_to_check)
        leaked_phone = phone_to_check in t3_json

        # Check GET /api/sessions/{session_id}
        sess_leaked = False
        if t3_brief.session_id:
            try:
                r_sess = client.get(f"/api/sessions/{t3_brief.session_id}")
                if r_sess.status_code == 200:
                    sess_text = r_sess.text
                    if any(email in sess_text for email in emails_to_check) or phone_to_check in sess_text:
                        sess_leaked = True
            except Exception:
                pass

        if not leaked_email and not leaked_phone and not sess_leaked:
            record("PASS", "C", "t3 PII (emails and phone) was properly redacted across brief and session store.")
        else:
            record("FAIL", "C", f"PII leak detected in t3: leaked_email={leaked_email}, leaked_phone={leaked_phone}, sess_leaked={sess_leaked}", "Redact emails and phone numbers before storing problem_statement or creating brief.")

    if "t1_canteen" in brief_map:
        t1_brief, _ = brief_map["t1_canteen"]
        fe_tech = next((t for t in t1_brief.tech if "front" in t.layer.lower()), None)
        if fe_tech and "react" in fe_tech.recommended.lower():
            record("PASS", "C", f"Frontend tech option reacted to React in skills: recommended '{fe_tech.recommended}'.")
        else:
            record("FAIL", "C", f"Frontend tech option did not recommend React despite skill presence: got '{fe_tech.recommended if fe_tech else None}'", "Frontend tech option should adapt to React present in team skills.")

    # Select active session for interactive tests
    active_session_id = None
    active_brief = None
    if "t1_canteen" in brief_map and brief_map["t1_canteen"][0].session_id:
        active_brief = brief_map["t1_canteen"][0]
        active_session_id = active_brief.session_id
    elif brief_map:
        first_key = list(brief_map.keys())[0]
        active_brief = brief_map[first_key][0]
        active_session_id = active_brief.session_id

    if not active_session_id:
        record("FAIL", "B", "No active session ID available to continue tests", "Ensure POST /api/brief returns filled session_id.")
        return print_summary()

    # 7. [B] Unknown task returns 404 on existing session
    try:
        r = client.patch(f"/api/sessions/{active_session_id}/tasks/unknown_task_xyz", json={"done": True})
        if r.status_code == 404:
            record("PASS", "B", "PATCH unknown task returned 404.")
        else:
            record("FAIL", "B", f"PATCH unknown task returned HTTP {r.status_code}, expected 404", "Return 404 when task_id does not exist in session brief.")
    except Exception as e:
        record("FAIL", "B", f"PATCH unknown task check error: {e}", "Handle unknown task_id with 404.")

    # 8. [C] Chat across all 6 stages & guardrail
    all_stages = ["understand", "users", "ideate", "build", "validate", "pitch"]
    chat_ok = True
    for stg in all_stages:
        try:
            r = client.post("/api/chat", json={"session_id": active_session_id, "stage": stg, "message": f"What is the priority in stage {stg}?"})
            if r.status_code == 200:
                cresp = ChatResponse.model_validate(r.json())
                word_count = len(cresp.reply.split())
                fu_count = len(cresp.follow_up_questions)
                if word_count <= 150 and 1 <= fu_count <= 2:
                    pass
                else:
                    chat_ok = False
                    record("FAIL", "C", f"Chat stage {stg} invalid: word_count={word_count} (max 150), follow_ups={fu_count} (expected 1-2)", "Chat reply must be <= 150 words with 1-2 follow-up questions.")
            else:
                chat_ok = False
                record("FAIL", "C", f"Chat stage {stg} returned HTTP {r.status_code}", f"Ensure chat endpoint handles stage '{stg}'.")
        except Exception as e:
            chat_ok = False
            record("FAIL", "C", f"Chat stage {stg} exception: {e}", f"Fix chat handler for stage '{stg}'.")

    if chat_ok:
        record("PASS", "C", "Chat succeeded for all 6 stages: 200, word count <= 150, 1-2 follow-up questions.")

    # Dump message guardrail check
    dump_msg = "Please write the complete code and full solution for our entire hackathon project."
    try:
        r_dump = client.post("/api/chat", json={"session_id": active_session_id, "stage": "build", "message": dump_msg})
        if r_dump.status_code == 200:
            cresp_dump = ChatResponse.model_validate(r_dump.json())
            if cresp_dump.guardrail_triggered:
                record("PASS", "C", "Dump message correctly triggered guardrail (guardrail_triggered=True).")
            else:
                record("FAIL", "C", "Dump message did not trigger guardrail", "Set guardrail_triggered=True when user asks for full implementation code.")
        else:
            record("FAIL", "C", f"Dump chat message returned HTTP {r_dump.status_code}", "Handle dump message properly.")
    except Exception as e:
        record("FAIL", "C", f"Dump message check exception: {e}", "Ensure guardrail detection runs on chat messages.")

    # Normal question guardrail check
    normal_msg = "How do we conduct a quick 5-minute usability test for our prototype?"
    try:
        r_norm = client.post("/api/chat", json={"session_id": active_session_id, "stage": "validate", "message": normal_msg})
        if r_norm.status_code == 200:
            cresp_norm = ChatResponse.model_validate(r_norm.json())
            if not cresp_norm.guardrail_triggered:
                record("PASS", "C", "Normal coaching question did not trigger guardrail (guardrail_triggered=False).")
            else:
                record("FAIL", "C", "Normal question erroneously triggered guardrail", "Ensure guardrail is only triggered on code generation requests.")
    except Exception as e:
        record("FAIL", "C", f"Normal chat check exception: {e}", "Fix chat guardrail logic.")

    # 9. [B] Task ticking & Progress formula verification
    try:
        # Patch task t1 to done
        r_patch = client.patch(f"/api/sessions/{active_session_id}/tasks/t1", json={"done": True})
        if r_patch.status_code == 200:
            t_state = TaskState.model_validate(r_patch.json())
            record("PASS", "B", f"PATCH task t1 set done={t_state.done}.")
        else:
            record("FAIL", "B", f"PATCH task t1 returned HTTP {r_patch.status_code}", "Implement PATCH /api/sessions/{id}/tasks/{task_id}.")

        # GET session confirms t1 is done in brief.tasks
        r_sess = client.get(f"/api/sessions/{active_session_id}")
        if r_sess.status_code == 200:
            sess_view = SessionView.model_validate(r_sess.json())
            t1_task = next((t for t in sess_view.brief.tasks if t.id == "t1"), None)
            if t1_task and t1_task.done:
                record("PASS", "B", "GET session confirms task t1 is done=True in brief.tasks.")
            else:
                record("FAIL", "B", "Task t1 not reflected as done in GET session view", "Merge task states into brief.tasks when returning SessionView.")
        else:
            record("FAIL", "B", f"GET session returned HTTP {r_sess.status_code}", "Ensure GET /api/sessions/{id} returns SessionView.")

        # Progress checks:
        # 1. elapsed_min=0 and only t1 done -> on_track
        # Untick t1 temporarily for clean 0 done check
        client.patch(f"/api/sessions/{active_session_id}/tasks/t1", json={"done": False})
        r_prog0 = client.get(f"/api/sessions/{active_session_id}/progress?elapsed_min=0")
        if r_prog0.status_code == 200:
            p0 = Progress.model_validate(r_prog0.json())
            if p0.status == "on_track":
                record("PASS", "B", "Progress at elapsed_min=0 with 0 done is 'on_track'.")
            else:
                record("FAIL", "B", f"Progress status at elapsed_min=0 was '{p0.status}', expected 'on_track'", "Compute status='on_track' when percent_done is within 15% of expected.")
        else:
            record("FAIL", "B", f"GET progress elapsed_min=0 returned HTTP {r_prog0.status_code}", "Implement GET /api/sessions/{id}/progress.")

        # 2. elapsed_min=minutes_total with 0 done -> behind
        r_prog_end = client.get(f"/api/sessions/{active_session_id}/progress?elapsed_min={active_brief.feasibility.budget_points and 75}")
        if r_prog_end.status_code == 200:
            p_end = Progress.model_validate(r_prog_end.json())
            if p_end.status == "behind":
                record("PASS", "B", "Progress at elapsed_min=minutes_total with 0 done is 'behind'.")
            else:
                record("FAIL", "B", f"Progress status at end with 0 done was '{p_end.status}', expected 'behind'", "Progress status must be 'behind' when percent_done < expected_percent - 15.")

        # 3. All tasks ticked and elapsed_min=5 -> ahead and 100 percent
        for t in active_brief.tasks:
            client.patch(f"/api/sessions/{active_session_id}/tasks/{t.id}", json={"done": True})

        r_prog_all = client.get(f"/api/sessions/{active_session_id}/progress?elapsed_min=5")
        if r_prog_all.status_code == 200:
            p_all = Progress.model_validate(r_prog_all.json())
            if p_all.status == "ahead" and p_all.percent_done == 100:
                record("PASS", "B", "Progress with all tasks ticked at elapsed_min=5 is 'ahead' and 100%.")
            else:
                record("FAIL", "B", f"Progress with all tasks ticked got status={p_all.status}, percent={p_all.percent_done}", "Progress status must be 'ahead' when percent_done > expected_percent + 15.")

        # Reset tasks t4..tn to False, keep t1, t2, t3 done for checkpoint and by_phase checks
        for t in active_brief.tasks[3:]:
            client.patch(f"/api/sessions/{active_session_id}/tasks/{t.id}", json={"done": False})

        # Check by_phase and checkpoint states at simulated elapsed_min=40
        r_prog40 = client.get(f"/api/sessions/{active_session_id}/progress?elapsed_min=40")
        if r_prog40.status_code == 200:
            p40 = Progress.model_validate(r_prog40.json())
            # Recompute expected percent_done
            total_task_min = sum(t.minutes for t in active_brief.tasks)
            done_task_min = sum(t.minutes for t in active_brief.tasks[:3])
            expected_pct = round(100 * done_task_min / total_task_min) if total_task_min > 0 else 0
            if abs(p40.percent_done - expected_pct) <= 1:
                record("PASS", "B", f"Progress percent_done ({p40.percent_done}%) matches recomputation from task minutes ({expected_pct}%).")
            else:
                record("FAIL", "B", f"Progress percent_done mismatch: got {p40.percent_done}%, expected {expected_pct}%", "Compute percent_done = round(100 * sum(done_task_minutes) / sum(all_task_minutes)).")

            # Check checkpoint states
            cp_valid = True
            for cp in p40.checkpoints:
                if cp.at_minute < 40 and cp.state != "passed":
                    cp_valid = False
                elif 40 <= cp.at_minute <= 45 and cp.state != "due_now":
                    cp_valid = False
                elif cp.at_minute > 45 and cp.state != "upcoming":
                    cp_valid = False
            if cp_valid:
                record("PASS", "B", "Checkpoint states follow PROGRESS formula: passed (< 40), due_now (40-45), upcoming (> 45).")
            else:
                record("FAIL", "B", "Checkpoint states do not match PROGRESS formula", "Mark checkpoints: 'passed' if at_minute < elapsed; 'due_now' if elapsed <= at_minute <= elapsed + 5; else 'upcoming'.")
        else:
            record("FAIL", "B", f"GET progress elapsed_min=40 returned HTTP {r_prog40.status_code}", "Fix progress calculation.")
    except Exception as e:
        record("FAIL", "B", f"Progress checks failed with exception: {e}", "Implement progress calculation following PROGRESS formula.")

    # 10. [C] Judge Mode: weak vs strong submissions
    fixed_criteria_names = [
        "Problem clarity",
        "Works end to end",
        "Scope realism",
        "Innovation and practicality",
        "Can you explain it",
    ]
    exact_disclaimer = "Practice check against a transparent rubric. It does not predict real jury scores."

    # Weak submission
    weak_req = make_weak_judge_request(active_session_id, active_brief)
    try:
        r_weak = client.post("/api/judge", json=weak_req)
        if r_weak.status_code == 200:
            j_weak = JudgeReport.model_validate(r_weak.json())
            weak_crit_names = [c.name for c in j_weak.criteria]
            if j_weak.overall < 60 and j_weak.readiness == "needs_work":
                record("PASS", "C", f"Weak judge submission scored {j_weak.overall} and readiness='needs_work'.")
            else:
                record("FAIL", "C", f"Weak judge submission scored {j_weak.overall}, readiness='{j_weak.readiness}' (expected < 60 and 'needs_work')", "Weak submission must score < 60 and have readiness='needs_work'.")

            if weak_crit_names == fixed_criteria_names and len(j_weak.likely_questions) == 5 and len(j_weak.top_improvements) == 3 and j_weak.disclaimer == exact_disclaimer:
                record("PASS", "C", "Weak judge report conforms to schema: 5 criteria in order, 5 questions, 3 improvements, exact disclaimer.")
            else:
                record("FAIL", "C", "Weak judge report structure mismatch", "Ensure judge report has exactly 5 fixed criteria names, 5 questions, 3 improvements, and exact disclaimer.")
        else:
            record("FAIL", "C", f"Weak judge submission returned HTTP {r_weak.status_code}: {r_weak.text}", "Implement POST /api/judge.")
    except Exception as e:
        record("FAIL", "C", f"Weak judge submission exception: {e}", "Fix judge endpoint for weak submission.")

    # Strong submission
    strong_req = make_strong_judge_request(active_session_id, active_brief)
    try:
        r_strong1 = client.post("/api/judge", json=strong_req)
        r_strong2 = client.post("/api/judge", json=strong_req)
        if r_strong1.status_code == 200 and r_strong2.status_code == 200:
            j_strong1 = JudgeReport.model_validate(r_strong1.json())
            j_strong2 = JudgeReport.model_validate(r_strong2.json())
            if j_strong1.overall >= 80 and j_strong1.readiness == "ready":
                record("PASS", "C", f"Strong judge submission scored {j_strong1.overall} and readiness='ready'.")
            else:
                record("FAIL", "C", f"Strong judge submission scored {j_strong1.overall}, readiness='{j_strong1.readiness}' (expected >= 80 and 'ready')", "Strong submission must score >= 80 and have readiness='ready'.")

            # Determinism
            if j_strong1.model_dump() == j_strong2.model_dump():
                record("PASS", "C", "Judge mode is strictly deterministic (same input produces equal output).")
            else:
                record("FAIL", "C", "Judge mode is non-deterministic", "Scores must come from deterministic rules, never random generation or unconstrained LLM calls.")
        else:
            record("FAIL", "C", f"Strong judge submission returned HTTP {r_strong1.status_code}", "Implement POST /api/judge.")
    except Exception as e:
        record("FAIL", "C", f"Strong judge submission exception: {e}", "Fix judge endpoint for strong submission.")

    # Judge PII check
    pii_judge_req = dict(strong_req)
    pii_judge_req["idea_summary"] += " Contact advisor at advisor@vesit.ac.in."
    try:
        r_pii_judge = client.post("/api/judge", json=pii_judge_req)
        if r_pii_judge.status_code == 200:
            if "advisor@vesit.ac.in" not in r_pii_judge.text:
                record("PASS", "C", "Email address in judge input text is not echoed in judge response.")
            else:
                record("FAIL", "C", "Email address leaked in judge response", "Redact PII in judge input text before processing or returning.")
    except Exception as e:
        record("FAIL", "C", f"Judge PII check exception: {e}", "Redact PII in judge requests.")

    # 11. [B or D] Persistence verification on current session
    try:
        r_pers = client.get(f"/api/sessions/{active_session_id}")
        if r_pers.status_code == 200:
            sess_view = SessionView.model_validate(r_pers.json())
            if sess_view.last_judge is not None and len(sess_view.messages) > 0:
                record("PASS", "B or D", f"GET session {active_session_id} returns brief, messages, and persisted last_judge.")
            else:
                record("FAIL", "B or D", "GET session does not return persisted messages or last_judge", "Ensure messages and last_judge are persisted in SQLite.")
    except Exception as e:
        record("FAIL", "B or D", f"Persistence verification exception: {e}", "Persist session data in SQLite database.")

    # 12. [A] Frontend Vite dev proxy check
    try:
        fe_client = httpx.Client(base_url="http://localhost:5173", timeout=1.5)
        r_fe = fe_client.get("/api/health")
        if r_fe.status_code == 200 and r_fe.json() == {"status": "ok"}:
            record("PASS", "A", "Frontend Vite proxy (http://localhost:5173/api/health) returned {'status': 'ok'}.")
        else:
            record("FAIL", "A", f"Frontend Vite proxy returned HTTP {r_fe.status_code}", "Configure vite.config.js proxy to forward /api requests to http://127.0.0.1:8000.")
    except Exception:
        record("WARN", "A", "Frontend Vite dev server is not running on http://localhost:5173 (run 'cd frontend && npm run dev').")

    return print_summary()


def print_summary() -> int:
    print("\n" + "=" * 50)
    print("=== CONTRACT REFEREE SUMMARY ===")
    pass_count = sum(1 for s, _, _ in results if s == "PASS")
    fail_count = sum(1 for s, _, _ in results if s == "FAIL")
    warn_count = sum(1 for s, _, _ in results if s == "WARN")
    print(f"Total Checks: {len(results)} | PASS: {pass_count} | FAIL: {fail_count} | WARN: {warn_count}")

    if fail_count > 0:
        print("\n=== FORWARD LIST (GROUPED BY OWNER) ===")
        for owner in sorted(forward_list.keys()):
            print(f"\n[Owner {owner}]:")
            for fix in set(forward_list[owner]):
                print(f"  - {fix}")
        print("\nREFEREE VERDICT: FAIL (Fix listed items before merging/tagging)")
        return 1
    else:
        print("\nREFEREE VERDICT: PASS (All mandatory contract checks satisfied)")
        return 0


if __name__ == "__main__":
    sys.exit(main())
