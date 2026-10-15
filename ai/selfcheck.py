"""Self-check suite for AI layer (Owner C).

Run with:
    python -m ai.selfcheck

Exits with code 0 on success, code 1 on failure.
"""
import os
import sys
from typing import Dict, Any

from contract.models import Brief, ChatResponse, JudgeReport
import ai.engine as engine
import ai.rules as rules
import ai.judge as judge_mod
import ai.guardrails as guardrails


def run_checks() -> None:
    print("=" * 60)
    print("Running AI Layer Self-Check (python -m ai.selfcheck)")
    print("=" * 60)

    # Ensure GEMINI_API_KEY is unset for rules baseline verification
    orig_api_key = os.environ.pop("GEMINI_API_KEY", None)

    try:
        # ---------------------------------------------------------
        # CHECK 1: generate_brief on 5 distinct inputs
        # ---------------------------------------------------------
        print("\n[Check 1] Validating generate_brief on 5 distinct inputs...")
        inputs = [
            # 1. Canteen surplus
            (
                "We need to eliminate canteen surplus food waste by connecting campus kitchens to charities.",
                {"team_size": 4, "skills": ["Python"], "minutes_available": 75, "preferred_stack": ""}
            ),
            # 2. Study groups with Python and React
            (
                "Students struggle to find study groups and peer tutors for exam preparation in classrooms.",
                {"team_size": 4, "skills": ["Python", "React"], "minutes_available": 90, "preferred_stack": "React"}
            ),
            # 3. Vague text with fake email and phone
            (
                "Help us now contact student@college.edu or call +91-9876543210 for quick assistance.",
                {"team_size": 3, "skills": ["JavaScript"], "minutes_available": 60, "preferred_stack": ""}
            ),
            # 4. Overscoped request for 8 features with team_size 2 and 30 minutes
            (
                "We want to build an ambitious campus transit fleet tracking platform with 8 modules and live routing.",
                {"team_size": 2, "skills": ["Python"], "minutes_available": 30, "preferred_stack": ""}
            ),
            # 5. One generic sentence
            (
                "We need a clean workflow tracking system to manage operational items and approvals.",
                {"team_size": 4, "skills": ["Python"], "minutes_available": 75, "preferred_stack": ""}
            )
        ]

        briefs = []
        for idx, (stmt, team_info) in enumerate(inputs, 1):
            raw_brief = engine.generate_brief(stmt, team_info)
            # Validate with contract.models.Brief
            validated = Brief(**raw_brief)
            briefs.append((validated, stmt, team_info))
            print(f"  Input {idx} ({validated.problem.domain}): Brief validated successfully.")
        print("PASS: Check 1")

        # ---------------------------------------------------------
        # CHECK 2: Structural invariants on all briefs
        # ---------------------------------------------------------
        print("\n[Check 2] Verifying structural invariants on every brief...")
        expected_stages = ["understand", "users", "ideate", "build", "validate", "pitch"]

        for idx, (b, stmt, team_info) in enumerate(briefs, 1):
            mins_avail = team_info["minutes_available"]

            # Workflow minutes sum == minutes_available
            phase_mins_sum = sum(p.minutes for p in b.workflow)
            assert phase_mins_sum == mins_avail, f"Brief {idx} phase minutes {phase_mins_sum} != {mins_avail}"

            # 6 phases in Stage order
            assert len(b.workflow) == 6, f"Brief {idx} has {len(b.workflow)} phases instead of 6"
            actual_phases = [p.phase for p in b.workflow]
            assert actual_phases == expected_stages, f"Brief {idx} phases {actual_phases} != {expected_stages}"

            # Tasks 8 to 14, ids t1..tn, total <= 85% of minutes_available
            num_tasks = len(b.tasks)
            assert 8 <= num_tasks <= 14, f"Brief {idx} task count {num_tasks} not between 8 and 14"
            expected_ids = [f"t{i+1}" for i in range(num_tasks)]
            actual_ids = [t.id for t in b.tasks]
            assert actual_ids == expected_ids, f"Brief {idx} task ids {actual_ids} != {expected_ids}"
            tasks_total_mins = sum(t.minutes for t in b.tasks)
            max_task_mins = 0.85 * mins_avail
            assert tasks_total_mins <= max_task_mins, f"Brief {idx} tasks total {tasks_total_mins} > 85% of {mins_avail} ({max_task_mins})"

            # 4 ascending checkpoints
            assert len(b.checkpoints) == 4, f"Brief {idx} has {len(b.checkpoints)} checkpoints instead of 4"
            cp_mins = [c.at_minute for c in b.checkpoints]
            for i in range(len(cp_mins) - 1):
                assert cp_mins[i] < cp_mins[i+1], f"Brief {idx} checkpoints not strictly ascending: {cp_mins}"

            # 3 to 5 must-haves
            num_mh = len(b.mvp.must_have)
            assert 3 <= num_mh <= 5, f"Brief {idx} must-have count {num_mh} not between 3 and 5"

            # 6 jury slides
            assert len(b.jury_outline) == 6, f"Brief {idx} has {len(b.jury_outline)} slides instead of 6"

            # At least 3 assumptions
            assert len(b.problem.assumptions) >= 3, f"Brief {idx} assumptions count {len(b.problem.assumptions)} < 3"

        print("PASS: Check 2")

        # ---------------------------------------------------------
        # CHECK 3: Determinism
        # ---------------------------------------------------------
        print("\n[Check 3] Verifying determinism (same input twice gives equal output)...")
        b1 = engine.generate_brief(inputs[0][0], inputs[0][1])
        b2 = engine.generate_brief(inputs[0][0], inputs[0][1])
        assert b1 == b2, "generate_brief produced non-deterministic output!"
        print("PASS: Check 3")

        # ---------------------------------------------------------
        # CHECK 4: Privacy, feasibility, domain differentiation, stack matching
        # ---------------------------------------------------------
        print("\n[Check 4] Verifying PII redaction, overscoped feasibility, domain matching, and React stack...")
        b3_str = str(briefs[2][0].model_dump())
        assert "student@college.edu" not in b3_str, "PII leak: email found in brief output!"
        assert "9876543210" not in b3_str, "PII leak: phone number found in brief output!"

        # Overscoped check (Input 4: team_size=2, minutes=30)
        b4 = briefs[3][0]
        assert b4.feasibility.verdict in ("tight", "overscoped"), f"Overscoped input got verdict '{b4.feasibility.verdict}' instead of tight/overscoped"
        assert b4.feasibility.verdict != "realistic", "Overscoped input was incorrectly marked realistic!"

        # Canteen and study inputs get different domains
        b1_dom = briefs[0][0].problem.domain
        b2_dom = briefs[1][0].problem.domain
        assert b1_dom == "food_waste", f"Canteen input expected domain food_waste, got {b1_dom}"
        assert b2_dom == "education", f"Study input expected domain education, got {b2_dom}"
        assert b1_dom != b2_dom, "Canteen and study inputs produced the same domain!"

        # Frontend recommendation is React when React is in skills
        b2_tech = briefs[1][0].tech
        fe_opt = next((t for t in b2_tech if t.layer == "Frontend"), None)
        assert fe_opt is not None, "Frontend tech layer missing in brief 2"
        assert "React" in fe_opt.recommended, f"Expected React recommended when React is in skills, got '{fe_opt.recommended}'"

        # Frontend recommendation is Streamlit when React is NOT in skills
        b1_tech = briefs[0][0].tech
        fe_opt_1 = next((t for t in b1_tech if t.layer == "Frontend"), None)
        assert fe_opt_1 is not None and "Streamlit" in fe_opt_1.recommended, f"Expected Streamlit when React not in skills, got '{fe_opt_1.recommended}'"
        print("PASS: Check 4")

        # ---------------------------------------------------------
        # CHECK 5: mentor_reply across all 6 stages and guardrail triggers
        # ---------------------------------------------------------
        print("\n[Check 5] Verifying mentor_reply for all 6 stages and guardrails...")
        sample_brief = briefs[0][0].model_dump()
        sample_team = inputs[0][1]

        for st in expected_stages:
            resp_dict = engine.mentor_reply(
                brief=sample_brief,
                history=[],
                message=f"What should our team focus on in the {st} stage?",
                stage=st,
                team=sample_team
            )
            chat_resp = ChatResponse(**resp_dict)
            word_cnt = len(chat_resp.reply.split())
            assert word_cnt <= 150, f"Stage {st} reply has {word_cnt} words (> 150 words)"
            assert 1 <= len(chat_resp.follow_up_questions) <= 2, f"Stage {st} has {len(chat_resp.follow_up_questions)} questions"
            assert not chat_resp.guardrail_triggered, f"Normal message triggered guardrail in stage {st}"

        # Guardrail trigger test
        dump_msg = "just write the complete code for the whole project for us"
        guard_resp = engine.mentor_reply(sample_brief, [], dump_msg, "build", sample_team)
        assert guard_resp["guardrail_triggered"] is True, "Solution dump failed to trigger guardrail!"
        assert len(guard_resp["follow_up_questions"]) == 2, "Coaching redirect must provide 2 follow-up questions"

        # Safe normal question should NOT trigger guardrail
        normal_msg = "how should we structure the API?"
        normal_resp = engine.mentor_reply(sample_brief, [], normal_msg, "build", sample_team)
        assert normal_resp["guardrail_triggered"] is False, "Normal architectural question incorrectly triggered guardrail!"
        print("PASS: Check 5")

        # ---------------------------------------------------------
        # CHECK 6: judge rubric (empty vs rich submission, exact invariants)
        # ---------------------------------------------------------
        print("\n[Check 6] Verifying judge rubric evaluation...")
        # Empty submission
        empty_sub: Dict[str, Any] = {
            "idea_summary": "",
            "features_built": [],
            "demo_script": "",
            "known_limits": [],
            "minutes_left": None
        }
        empty_rep = engine.judge(sample_brief, empty_sub, sample_team)
        validated_empty = JudgeReport(**empty_rep)
        assert validated_empty.overall == 20, f"Empty submission overall {validated_empty.overall} != 20"
        assert validated_empty.readiness == "needs_work", f"Empty submission readiness {validated_empty.readiness} != needs_work"
        for c in validated_empty.criteria:
            assert c.score == 1, f"Empty submission criterion {c.name} scored {c.score} != 1"

        # Rich submission
        rich_sub: Dict[str, Any] = {
            "idea_summary": "We spoke to Chef Ramesh who currently manages the cafeteria. Today, excess food is wasted manually instead of being tracked, causing 35 percent of daily lunch portions to be thrown away before dinner. We address cost, time, and safety constraints.",
            "features_built": ["Surplus Logging", "Claim and Pickup Dispatch", "Portion Demand Forecaster"],
            "demo_script": "Step 1: Open cafeteria dashboard\nStep 2: Log 15 surplus lunch trays\nStep 3: Dispatch notification to volunteer\nStep 4: Confirm reservation pickup\nStep 5: Verify zero food safety alerts",
            "known_limits": ["No offline sync for remote areas", "Requires manual volunteer confirmation"],
            "minutes_left": 45
        }
        rich_rep = engine.judge(sample_brief, rich_sub, sample_team)
        validated_rich = JudgeReport(**rich_rep)
        assert validated_rich.overall >= 80, f"Rich submission overall {validated_rich.overall} < 80"
        assert validated_rich.readiness == "ready", f"Rich submission readiness {validated_rich.readiness} != ready"

        # Check exact criteria order and names
        expected_criteria_names = [
            "Problem clarity",
            "Works end to end",
            "Scope realism",
            "Innovation and practicality",
            "Can you explain it"
        ]
        actual_criteria_names = [c.name for c in validated_rich.criteria]
        assert actual_criteria_names == expected_criteria_names, f"Criteria names {actual_criteria_names} != {expected_criteria_names}"

        # Exactly 5 likely questions
        assert len(validated_rich.likely_questions) == 5, f"Likely questions count {len(validated_rich.likely_questions)} != 5"

        # Exactly 3 top improvements
        assert len(validated_rich.top_improvements) == 3, f"Top improvements count {len(validated_rich.top_improvements)} != 3"

        # Exact disclaimer text
        expected_disclaimer = "Practice check against a transparent rubric. It does not predict real jury scores."
        assert validated_rich.disclaimer == expected_disclaimer, f"Disclaimer '{validated_rich.disclaimer}' != '{expected_disclaimer}'"

        # Determinism check for judge
        rich_rep_2 = engine.judge(sample_brief, rich_sub, sample_team)
        assert rich_rep == rich_rep_2, "judge evaluation is non-deterministic!"
        print("PASS: Check 6")

        # ---------------------------------------------------------
        # CHECK 7: Resilience with monkeypatched internal errors
        # ---------------------------------------------------------
        print("\n[Check 7] Verifying failsafe resilience with monkeypatched errors...")

        # Monkeypatch build_rules_brief to raise
        orig_build = rules.build_rules_brief
        try:
            def broken_build(*args, **kwargs):
                raise RuntimeError("Simulated catastrophic crash in brief builder")
            rules.build_rules_brief = broken_build

            fallback_b = engine.generate_brief("crash test", {"team_size": 4, "minutes_available": 75})
            validated_fallback_b = Brief(**fallback_b)
            assert validated_fallback_b.session_id is None, "Fallback brief must have session_id None"
            print("  generate_brief recovered gracefully from internal crash.")
        finally:
            rules.build_rules_brief = orig_build

        # Monkeypatch evaluate_submission to raise
        orig_eval = judge_mod.evaluate_submission
        try:
            def broken_eval(*args, **kwargs):
                raise ValueError("Simulated crash in judge rubric")
            judge_mod.evaluate_submission = broken_eval

            fallback_j = engine.judge(sample_brief, {}, {})
            validated_fallback_j = JudgeReport(**fallback_j)
            assert validated_fallback_j.overall == 20
            print("  judge recovered gracefully from internal crash.")
        finally:
            judge_mod.evaluate_submission = orig_eval

        # Test redact with invalid type
        assert engine.redact(None) == ""
        assert engine.redact("test@domain.com") == "[email]"
        print("  redact handled boundary inputs gracefully.")

        # Test mentor_reply with invalid inputs
        broken_reply = engine.mentor_reply(None, None, None, "invalid_stage", None)
        validated_broken_reply = ChatResponse(**broken_reply)
        assert validated_broken_reply.guardrail_triggered is False
        print("  mentor_reply handled corrupted inputs gracefully.")

        print("PASS: Check 7")

        print("\n" + "=" * 60)
        print("ALL 7 CHECKS PASSED SUCCESSFULLY!")
        print("=" * 60)

    finally:
        if orig_api_key is not None:
            os.environ["GEMINI_API_KEY"] = orig_api_key


if __name__ == "__main__":
    try:
        run_checks()
        sys.exit(0)
    except AssertionError as e:
        print(f"\nFAIL: Self-check assertion failed: {e}", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"\nFAIL: Unexpected exception during self-check: {e}", file=sys.stderr)
        sys.exit(1)
