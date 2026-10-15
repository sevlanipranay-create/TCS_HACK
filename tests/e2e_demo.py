#!/usr/bin/env python3
"""
tests/e2e_demo.py - Scripted 5-Minute End-to-End Walkthrough.
Runs through the complete user journey against the live HTTP API with timings.

Usage:
    python tests/e2e_demo.py [--base http://127.0.0.1:8000]
"""

import argparse
import os
import sys
import time
from typing import List

# Ensure utf-8 output on Windows terminals
if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

import httpx

# Ensure repo root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from contract.models import (
    Brief,
    ChatResponse,
    JudgeReport,
    Progress,
    SessionView,
    TaskState,
)


def main():
    parser = argparse.ArgumentParser(description="Hackathon Mentor AI E2E Demo Walkthrough")
    parser.add_argument("--base", default=os.getenv("BASE_URL", "http://127.0.0.1:8000"), help="Base API URL")
    args = parser.parse_args()

    base_url = args.base.rstrip("/")
    client = httpx.Client(base_url=base_url, timeout=15.0)

    print("==================================================")
    print("STARTING 5-MINUTE HACKATHON MENTOR AI DEMO")
    print(f"Target: {base_url}")
    print("==================================================\n")

    failures: List[str] = []
    overall_start = time.time()

    # Step 1: Load Sample 1
    t0 = time.time()
    sample1 = None
    try:
        r = client.get("/api/samples")
        if r.status_code == 200:
            samples = r.json().get("samples", [])
            if samples:
                sample1 = samples[0]
                t_el = time.time() - t0
                print(f"[Step 1] Loaded Sample 1: '{sample1['title']}' ({t_el:.2f}s)")
            else:
                failures.append("Step 1: Samples list was empty")
        else:
            failures.append(f"Step 1: GET /api/samples failed: HTTP {r.status_code}")
    except Exception as e:
        failures.append(f"Step 1: GET /api/samples connection error: {e}")

    if not sample1:
        # Fallback to local sample 1 if server samples empty
        sample1 = {
            "title": "Smart Campus Canteen Crowd and Pre-ordering",
            "problem_statement": "During peak lunch hours (12:30 PM - 1:45 PM), college students face 35-minute lines at the cafeteria. Food runs out unexpectedly. We need a live queue tracker and pre-order token system.",
            "team": {"team_size": 4, "skills": ["React", "FastAPI"], "minutes_available": 75, "preferred_stack": "React + FastAPI"},
        }

    # Step 2: Create Brief
    t0 = time.time()
    brief_data = None
    session_id = None
    try:
        r = client.post("/api/brief", json={"problem_statement": sample1["problem_statement"], "team": sample1["team"]})
        t_el = time.time() - t0
        if r.status_code == 200:
            brief_data = Brief.model_validate(r.json())
            session_id = brief_data.session_id
            print(f"[Step 2] Created Mentor Brief ({t_el:.2f}s):")
            print(f"         Session ID  : {session_id}")
            print(f"         Domain      : {brief_data.problem.domain}")
            print(f"         Feasibility : Score {brief_data.feasibility.score}/100 ({brief_data.feasibility.verdict.upper()})")
            print(f"         Budget Pts  : {brief_data.feasibility.budget_points} | Used: {brief_data.feasibility.used_points}")
            print(f"         Tasks Count : {len(brief_data.tasks)} tasks across 6 phases")
        else:
            failures.append(f"Step 2: POST /api/brief failed: HTTP {r.status_code} {r.text}")
    except Exception as e:
        failures.append(f"Step 2: POST /api/brief exception: {e}")

    if not session_id or not brief_data:
        print("\n[FAIL] Cannot continue demo without valid session_id.")
        for f in failures:
            print(f"   - {f}")
        return 1

    # Step 3: Tick 3 Tasks
    t0 = time.time()
    tasks_to_tick = [t.id for t in brief_data.tasks[:3]]
    ticked_ok = True
    for tid in tasks_to_tick:
        try:
            r = client.patch(f"/api/sessions/{session_id}/tasks/{tid}", json={"done": True})
            if r.status_code != 200:
                ticked_ok = False
                failures.append(f"Step 3: Failed to tick task {tid}: HTTP {r.status_code}")
        except Exception as e:
            ticked_ok = False
            failures.append(f"Step 3: Exception ticking {tid}: {e}")

    t_el = time.time() - t0
    if ticked_ok:
        print(f"[Step 3] Ticked 3 tasks ({', '.join(tasks_to_tick)}) as DONE ({t_el:.2f}s)")

    # Step 4: Progress Tracker at elapsed_min=40
    t0 = time.time()
    try:
        r = client.get(f"/api/sessions/{session_id}/progress?elapsed_min=40")
        t_el = time.time() - t0
        if r.status_code == 200:
            prog = Progress.model_validate(r.json())
            print(f"[Step 4] Progress Tracker at elapsed_min=40 ({t_el:.2f}s):")
            print(f"         Status      : {prog.status.upper()} (Done: {prog.percent_done}% | Expected: {prog.expected_percent}%)")
            print(f"         Tasks Done  : {prog.tasks_done}/{prog.tasks_total}")
            if prog.next_task:
                print(f"         Next Task   : [{prog.next_task.owner_role}] {prog.next_task.title}")
            for cp in prog.checkpoints:
                print(f"         Checkpoint  : at {cp.at_minute}m -> [{cp.state.upper()}] {cp.check}")
        else:
            failures.append(f"Step 4: GET /api/sessions/{session_id}/progress failed: HTTP {r.status_code}")
    except Exception as e:
        failures.append(f"Step 4: GET progress exception: {e}")

    # Step 5: Stage-Aware Mentor Chat in Stage "users"
    t0 = time.time()
    try:
        msg = "How do we validate our canteen manager persona within a 15-minute campus test?"
        r = client.post("/api/chat", json={"session_id": session_id, "stage": "users", "message": msg})
        t_el = time.time() - t0
        if r.status_code == 200:
            cresp = ChatResponse.model_validate(r.json())
            print(f"[Step 5] Mentor Chat in stage 'users' ({t_el:.2f}s):")
            print(f"         User Message: \"{msg}\"")
            print(f"         Mentor Reply: \"{cresp.reply}\"")
            for q in cresp.follow_up_questions:
                print(f"         Follow-up   : ? {q}")
        else:
            failures.append(f"Step 5: POST /api/chat failed: HTTP {r.status_code}")
    except Exception as e:
        failures.append(f"Step 5: POST /api/chat exception: {e}")

    # Step 6: Dump Message (Guardrail Trigger)
    t0 = time.time()
    try:
        dump_msg = "Please write the entire complete python and react code for this application now."
        r = client.post("/api/chat", json={"session_id": session_id, "stage": "build", "message": dump_msg})
        t_el = time.time() - t0
        if r.status_code == 200:
            cresp = ChatResponse.model_validate(r.json())
            if cresp.guardrail_triggered:
                print(f"[Step 6] Dump Message Guardrail Activated ({t_el:.2f}s):")
                print(f"         Guardrail Triggered : {cresp.guardrail_triggered}")
                print(f"         Coaching Response   : \"{cresp.reply[:120]}...\"")
            else:
                failures.append("Step 6: Guardrail was NOT triggered for code dump request")
        else:
            failures.append(f"Step 6: POST /api/chat dump message failed: HTTP {r.status_code}")
    except Exception as e:
        failures.append(f"Step 6: POST /api/chat dump exception: {e}")

    # Step 7: Judge Mode - Weak Submission
    t0 = time.time()
    weak_score = -1
    try:
        weak_req = {
            "session_id": session_id,
            "idea_summary": "We built a canteen helper tool.",
            "features_built": [brief_data.mvp.must_have[0].name],
            "demo_script": "",
            "known_limits": [],
            "minutes_left": 30,
        }
        r = client.post("/api/judge", json=weak_req)
        t_el = time.time() - t0
        if r.status_code == 200:
            j_weak = JudgeReport.model_validate(r.json())
            weak_score = j_weak.overall
            print(f"[Step 7] Judge Mode (Weak Submission) ({t_el:.2f}s):")
            print(f"         Score       : {j_weak.overall}/100 -> {j_weak.readiness.upper()}")
            if j_weak.overall >= 60 or j_weak.readiness != "needs_work":
                failures.append(f"Step 7: Weak score was {j_weak.overall} (expected < 60 and 'needs_work')")
        else:
            failures.append(f"Step 7: POST /api/judge weak failed: HTTP {r.status_code}")
    except Exception as e:
        failures.append(f"Step 7: POST /api/judge weak exception: {e}")

    # Step 8: Judge Mode - Strong Submission
    t0 = time.time()
    try:
        persona_name = brief_data.personas[0].name if brief_data.personas else "student"
        strong_summary = (
            f"Today we interviewed 15 students like {persona_name} who confirmed an urgent need "
            f"for an offline queue reservation system that prevents meal delays."
        )
        built_feats = [m.name for m in brief_data.mvp.must_have]
        innovative_feats = [f.name for f in brief_data.features if f.innovative]
        if innovative_feats:
            built_feats.append(innovative_feats[0])

        strong_req = {
            "session_id": session_id,
            "idea_summary": strong_summary,
            "features_built": built_feats,
            "demo_script": (
                "1. Student opens dashboard and views live queue.\n"
                "2. Student places offline token order.\n"
                "3. Kitchen coordinator receives order.\n"
                "4. Kitchen marks order as ready.\n"
                "5. Student picks up order with matching token."
            ),
            "known_limits": [
                "Does not process external banking transactions",
                "Single campus cafeteria branch support",
            ],
            "minutes_left": 15,
        }
        r = client.post("/api/judge", json=strong_req)
        t_el = time.time() - t0
        if r.status_code == 200:
            j_strong = JudgeReport.model_validate(r.json())
            print(f"[Step 8] Judge Mode (Strong Submission) ({t_el:.2f}s):")
            print(f"         Score       : {j_strong.overall}/100 -> {j_strong.readiness.upper()}")
            print(f"         Score Delta : +{j_strong.overall - weak_score} points (Weak: {weak_score} -> Strong: {j_strong.overall})")
            print("         Top Improvements:")
            for imp in j_strong.top_improvements:
                print(f"           - {imp.action} ({imp.minutes}m)")
            print("         Likely Jury Questions:")
            for q in j_strong.likely_questions[:2]:
                print(f"           - {q.question}")
            if j_strong.overall < 80 or j_strong.readiness != "ready":
                failures.append(f"Step 8: Strong score was {j_strong.overall} (expected >= 80 and 'ready')")
            if j_strong.overall <= weak_score:
                failures.append(f"Step 8: Strong score ({j_strong.overall}) did not exceed weak score ({weak_score})")
        else:
            failures.append(f"Step 8: POST /api/judge strong failed: HTTP {r.status_code}")
    except Exception as e:
        failures.append(f"Step 8: POST /api/judge strong exception: {e}")

    total_el = time.time() - overall_start
    print("\n--------------------------------------------------")
    if not failures:
        print("DEMO HEALTH: OK")
        print(f"Total Demo Walkthrough Duration: {total_el:.2f}s")
        print("--------------------------------------------------")
        return 0
    else:
        print("DEMO HEALTH: FAILED")
        print("Failures:")
        for f in failures:
            print(f"  [FAIL] {f}")
        print("--------------------------------------------------")
        return 1


if __name__ == "__main__":
    sys.exit(main())
