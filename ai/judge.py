"""Deterministic rules-based judge mode implementing the jury rubric."""
import json
import re
from pathlib import Path
from typing import Dict, Any, List, Optional, Set

from contract.models import JudgeReport, CriterionScore, JuryQuestion, Improvement

STOPLIST = {"with", "that", "this", "from", "into", "show", "user", "users", "page", "screen", "data"}
KB_DIR = Path(__file__).resolve().parent / "kb"


def _load_templates() -> Dict[str, Any]:
    with open(KB_DIR / "templates.json", "r", encoding="utf-8") as f:
        return json.load(f)


def _words(text: str) -> int:
    if not text:
        return 0
    return len(text.strip().split())


def _contains_any(text: str, keywords: List[str]) -> bool:
    if not text:
        return False
    lower = text.lower()
    return any(kw.lower() in lower for kw in keywords)


def _get_sig_words(text: str) -> Set[str]:
    words = re.findall(r"[a-zA-Z]{4,}", text.lower())
    return {w for w in words if w not in STOPLIST}


def _features_match(name1: str, name2: str) -> bool:
    s1 = _get_sig_words(name1)
    s2 = _get_sig_words(name2)
    return bool(s1 & s2)


def evaluate_submission(brief: Dict[str, Any], submission: Dict[str, Any], team: Dict[str, Any]) -> Dict[str, Any]:
    """Evaluates project submission against transparent rubric using deterministic rules."""
    templates = _load_templates()
    q_bank = templates.get("judge_question_bank", {})
    imp_templates = templates.get("improvement_templates", {})

    idea_summary = submission.get("idea_summary", "")
    features_built = [f for f in submission.get("features_built", []) if isinstance(f, str) and f.strip()]
    demo_script = submission.get("demo_script", "")
    known_limits = [k for k in submission.get("known_limits", []) if isinstance(k, str) and k.strip()]
    minutes_left: Optional[int] = submission.get("minutes_left")

    non_empty_script_lines = [line.strip() for line in demo_script.splitlines() if line.strip()]
    script_line_count = len(non_empty_script_lines)

    mvp = brief.get("mvp", {})
    must_haves = mvp.get("must_have", [])
    m = len(must_haves)
    n = len(features_built)

    personas = brief.get("personas", [])
    problem = brief.get("problem", {})
    stakeholders = problem.get("stakeholders", [])
    brief_features = brief.get("features", [])

    persona_stakeholder_names = [p.get("name", "") for p in personas] + [s.get("name", "") for s in stakeholders]
    persona_stakeholder_names = [name for name in persona_stakeholder_names if name]

    # --- Criterion 1: Problem clarity ---
    # base 1;
    # +1 if idea_summary has >= 20 words;
    # +1 if it mentions a persona name or stakeholder name from the brief;
    # +1 if it contains a digit or one of: percent, %, minutes, hours, per day, less, more, faster, reduce;
    # +1 if it contains one of: interview, asked, survey, observed, tested with, spoke to, talked to.
    c1_w = _words(idea_summary)
    c1_check1 = c1_w >= 20
    c1_check2 = _contains_any(idea_summary, persona_stakeholder_names)
    has_digit = bool(re.search(r"\d", idea_summary))
    metric_kws = ["percent", "%", "minutes", "hours", "per day", "less", "more", "faster", "reduce"]
    c1_check3 = has_digit or _contains_any(idea_summary, metric_kws)
    val_kws = ["interview", "asked", "survey", "observed", "tested with", "spoke to", "talked to"]
    c1_check4 = _contains_any(idea_summary, val_kws)

    score_1 = 1 + int(c1_check1) + int(c1_check2) + int(c1_check3) + int(c1_check4)
    evidence_1 = (
        f"Summary has {c1_w} words; names a persona: {'yes' if c1_check2 else 'no'}; "
        f"has a number or measurable outcome: {'yes' if c1_check3 else 'no'}; "
        f"mentions validation: {'yes' if c1_check4 else 'no'}."
    )
    c1_improves = imp_templates.get("Problem clarity", {})
    if not c1_check1:
        improve_1 = c1_improves.get("summary_short", {}).get("action", "Expand summary to at least 20 words.")
        improve_1_min = c1_improves.get("summary_short", {}).get("minutes", 10)
    elif not c1_check2:
        improve_1 = c1_improves.get("missing_persona", {}).get("action", "Name a persona explicitly.")
        improve_1_min = c1_improves.get("missing_persona", {}).get("minutes", 5)
    elif not c1_check3:
        improve_1 = c1_improves.get("missing_metric", {}).get("action", "Add a measurable outcome or metric.")
        improve_1_min = c1_improves.get("missing_metric", {}).get("minutes", 5)
    elif not c1_check4:
        improve_1 = c1_improves.get("missing_validation", {}).get("action", "Mention speaking with real users.")
        improve_1_min = c1_improves.get("missing_validation", {}).get("minutes", 10)
    else:
        improve_1 = "Keep this as is."
        improve_1_min = 5

    # --- Criterion 2: Works end to end ---
    # base 1;
    # + min(3, number of must-have names matched by any features_built entry);
    # +1 if demo_script has >= 4 non-empty lines.
    matched_must_haves = 0
    for mh in must_haves:
        mh_name = mh.get("name", "")
        if any(_features_match(mh_name, fb) for fb in features_built):
            matched_must_haves += 1

    c2_check1 = matched_must_haves >= min(3, m) if m > 0 else True
    c2_check2 = script_line_count >= 4

    score_2 = 1 + min(3, matched_must_haves) + int(c2_check2)
    score_2 = min(5, score_2)
    evidence_2 = f"Matched {matched_must_haves} of {m} must-haves; demo script has {script_line_count} non-empty lines."
    c2_improves = imp_templates.get("Works end to end", {})
    if not c2_check1 or matched_must_haves == 0:
        improve_2 = c2_improves.get("missing_must_haves", {}).get("action", "Connect must-have features into live flow.")
        improve_2_min = c2_improves.get("missing_must_haves", {}).get("minutes", 15)
    elif not c2_check2:
        improve_2 = c2_improves.get("missing_demo_script", {}).get("action", "Write out a step-by-step 4-line demo script.")
        improve_2_min = c2_improves.get("missing_demo_script", {}).get("minutes", 10)
    else:
        improve_2 = "Keep this as is."
        improve_2_min = 5

    # --- Criterion 3: Scope realism ---
    # if n == 0 then 1;
    # else 5 if n <= m+1, 4 if n <= m+2, 3 if n <= m+3, 2 if n <= m+5, else 1;
    # then, if minutes_left is given and < 15 and n > m, subtract 1 (minimum 1).
    if n == 0:
        score_3 = 1
    elif n <= m + 1:
        score_3 = 5
    elif n <= m + 2:
        score_3 = 4
    elif n <= m + 3:
        score_3 = 3
    elif n <= m + 5:
        score_3 = 2
    else:
        score_3 = 1

    time_crunch = (minutes_left is not None and minutes_left < 15 and n > m)
    if time_crunch:
        score_3 = max(1, score_3 - 1)

    c3_improves = imp_templates.get("Scope realism", {})
    if n == 0:
        improve_3 = c3_improves.get("no_features", {}).get("action", "List the core features built.")
        improve_3_min = c3_improves.get("no_features", {}).get("minutes", 10)
    elif score_3 < 4 and not time_crunch:
        improve_3 = c3_improves.get("overscoped", {}).get("action", "Trim non-essential feature promises.")
        improve_3_min = c3_improves.get("overscoped", {}).get("minutes", 15)
    elif time_crunch:
        improve_3 = c3_improves.get("time_crunch", {}).get("action", "Freeze new code and polish only the working path.")
        improve_3_min = c3_improves.get("time_crunch", {}).get("minutes", 10)
    else:
        improve_3 = "Keep this as is."
        improve_3_min = 5

    mins_left_str = str(minutes_left) if minutes_left is not None else "not set"
    evidence_3 = f"Built features: {n}; MVP must-haves: {m}; minutes left: {mins_left_str}."

    # --- Criterion 4: Innovation and practicality ---
    # base 1;
    # +1 if any features_built entry matches a feature with innovative true;
    # +1 if idea_summary contains one of: cost, budget, time, privacy, offline, safety, data, accessibility, language, battery;
    # +1 if len(known_limits) >= 2;
    # +1 if idea_summary contains one of: today, currently, at present, instead of, unlike, manually, whatsapp, excel, paper.
    innovative_features = [f.get("name", "") for f in brief_features if f.get("innovative", False)]
    c4_check1 = any(
        any(_features_match(inn_f, fb) for inn_f in innovative_features)
        for fb in features_built
    )
    constraint_kws = ["cost", "budget", "time", "privacy", "offline", "safety", "data", "accessibility", "language", "battery"]
    c4_check2 = _contains_any(idea_summary, constraint_kws)
    c4_check3 = len(known_limits) >= 2
    today_kws = ["today", "currently", "at present", "instead of", "unlike", "manually", "whatsapp", "excel", "paper"]
    c4_check4 = _contains_any(idea_summary, today_kws)

    score_4 = 1 + int(c4_check1) + int(c4_check2) + int(c4_check3) + int(c4_check4)
    evidence_4 = (
        f"Innovative feature matched: {'yes' if c4_check1 else 'no'}; "
        f"mentions real-world constraint: {'yes' if c4_check2 else 'no'}; "
        f"known limits: {len(known_limits)}; "
        f"contrasts with current baseline: {'yes' if c4_check4 else 'no'}."
    )
    c4_improves = imp_templates.get("Innovation and practicality", {})
    if not c4_check1:
        improve_4 = c4_improves.get("missing_innovative", {}).get("action", "Highlight your innovative feature.")
        improve_4_min = c4_improves.get("missing_innovative", {}).get("minutes", 10)
    elif not c4_check2:
        improve_4 = c4_improves.get("missing_constraints", {}).get("action", "Explain how solution respects constraints.")
        improve_4_min = c4_improves.get("missing_constraints", {}).get("minutes", 10)
    elif not c4_check3:
        improve_4 = c4_improves.get("missing_limits", {}).get("action", "List at least two honest technical limits.")
        improve_4_min = c4_improves.get("missing_limits", {}).get("minutes", 5)
    elif not c4_check4:
        improve_4 = c4_improves.get("missing_baseline", {}).get("action", "Contrast your tool against today's workarounds.")
        improve_4_min = c4_improves.get("missing_baseline", {}).get("minutes", 5)
    else:
        improve_4 = "Keep this as is."
        improve_4_min = 5

    # --- Criterion 5: Can you explain it ---
    # base 1;
    # +1 if demo_script is non-empty;
    # +1 if demo_script has >= 4 non-empty lines;
    # +1 if len(known_limits) >= 1;
    # +1 if idea_summary has 20 to 120 words.
    c5_check1 = bool(demo_script.strip())
    c5_check2 = script_line_count >= 4
    c5_check3 = len(known_limits) >= 1
    c5_check4 = 20 <= c1_w <= 120

    score_5 = 1 + int(c5_check1) + int(c5_check2) + int(c5_check3) + int(c5_check4)
    evidence_5 = (
        f"Demo script lines: {script_line_count}; "
        f"documented limits: {len(known_limits)}; "
        f"idea summary length: {c1_w} words."
    )
    c5_improves = imp_templates.get("Can you explain it", {})
    if not c5_check1:
        improve_5 = c5_improves.get("empty_demo_script", {}).get("action", "Document your live demo walk-through steps.")
        improve_5_min = c5_improves.get("empty_demo_script", {}).get("minutes", 10)
    elif not c5_check2:
        improve_5 = c5_improves.get("short_demo_script", {}).get("action", "Expand your demo script into 4 clear steps.")
        improve_5_min = c5_improves.get("short_demo_script", {}).get("minutes", 10)
    elif not c5_check3:
        improve_5 = c5_improves.get("missing_limits", {}).get("action", "Identify at least one clear operational boundary.")
        improve_5_min = c5_improves.get("missing_limits", {}).get("minutes", 5)
    elif not c5_check4:
        improve_5 = c5_improves.get("summary_length", {}).get("action", "Refine the idea summary to be between 20 and 120 words.")
        improve_5_min = c5_improves.get("summary_length", {}).get("minutes", 5)
    else:
        improve_5 = "Keep this as is."
        improve_5_min = 5

    # Exactly 5 criteria in fixed names and order
    criteria_list = [
        CriterionScore(name="Problem clarity", score=score_1, evidence=evidence_1, improve=improve_1),
        CriterionScore(name="Works end to end", score=score_2, evidence=evidence_2, improve=improve_2),
        CriterionScore(name="Scope realism", score=score_3, evidence=evidence_3, improve=improve_3),
        CriterionScore(name="Innovation and practicality", score=score_4, evidence=evidence_4, improve=improve_4),
        CriterionScore(name="Can you explain it", score=score_5, evidence=evidence_5, improve=improve_5),
    ]

    total_score = score_1 + score_2 + score_3 + score_4 + score_5
    overall = round(100.0 * total_score / 25.0)

    if overall >= 80:
        readiness = "ready"
    elif overall >= 60:
        readiness = "almost_ready"
    else:
        readiness = "needs_work"

    disclaimer = "Practice check against a transparent rubric. It does not predict real jury scores."

    # Identify 3 lowest-scoring criteria (stable sort maintains criteria order for ties)
    criterion_meta = [
        {"idx": 0, "name": "Problem clarity", "score": score_1, "improve": improve_1, "minutes": improve_1_min},
        {"idx": 1, "name": "Works end to end", "score": score_2, "improve": improve_2, "minutes": improve_2_min},
        {"idx": 2, "name": "Scope realism", "score": score_3, "improve": improve_3, "minutes": improve_3_min},
        {"idx": 3, "name": "Innovation and practicality", "score": score_4, "improve": improve_4, "minutes": improve_4_min},
        {"idx": 4, "name": "Can you explain it", "score": score_5, "improve": improve_5, "minutes": improve_5_min},
    ]
    sorted_meta = sorted(criterion_meta, key=lambda x: x["score"])
    lowest_3 = sorted_meta[:3]

    # Build top_improvements (exactly 3)
    # the improve actions of the 3 lowest-scoring criteria with template minutes;
    # if minutes_left is given, keep only actions with minutes <= minutes_left but always keep at least the cheapest one;
    # pad to exactly 3 from templates if needed.
    candidate_improvements: List[Dict[str, Any]] = []
    for item in lowest_3:
        act = item["improve"] if item["improve"] != "Keep this as is." else f"Rehearse and polish {item['name']} presentation."
        candidate_improvements.append({"action": act, "minutes": item["minutes"]})

    if minutes_left is not None:
        filtered = [imp for imp in candidate_improvements if imp["minutes"] <= minutes_left]
        if not filtered and candidate_improvements:
            cheapest = min(candidate_improvements, key=lambda x: x["minutes"])
            filtered = [cheapest]
        candidate_improvements = filtered

    # Pad from all templates if fewer than 3
    fallback_pool = [
        {"action": "Refine demo script to highlight clear before-and-after value.", "minutes": 5},
        {"action": "Verify form error messages handle missing inputs gracefully.", "minutes": 5},
        {"action": "Check that the two primary known limits are clearly stated on slide 6.", "minutes": 5},
        {"action": "Rehearse 90-second live demo walk-through once more.", "minutes": 5}
    ]
    for fb in fallback_pool:
        if len(candidate_improvements) >= 3:
            break
        if not any(imp["action"] == fb["action"] for imp in candidate_improvements):
            candidate_improvements.append(fb)

    top_improvements = [
        Improvement(action=imp["action"], minutes=imp["minutes"])
        for imp in candidate_improvements[:3]
    ]

    # Likely questions: exactly 5
    # the first bank question of each of the 3 lowest-scoring criteria, plus:
    # "Who is your user and how do you know they have this problem?"
    # "What is real in your demo and what is mocked?"
    # remove duplicates and refill from the bank.
    selected_questions: List[Dict[str, str]] = []

    for item in lowest_3:
        c_name = item["name"]
        bank = q_bank.get(c_name, [])
        if bank:
            selected_questions.append(bank[0])

    fixed_q1 = {
        "question": "Who is your user and how do you know they have this problem?",
        "why_asked": "Judges want evidence of real user need rather than assumptions.",
        "answer_hint": "Name your specific persona, describe their daily pain point, and mention who you interviewed."
    }
    fixed_q2 = {
        "question": "What is real in your demo and what is mocked?",
        "why_asked": "Judges value engineering honesty about prototype boundaries.",
        "answer_hint": "Clearly distinguish what is live code and database state from static mockup data."
    }
    selected_questions.append(fixed_q1)
    selected_questions.append(fixed_q2)

    # Deduplicate by question text
    seen_q: Set[str] = set()
    deduped_questions: List[Dict[str, str]] = []
    for q in selected_questions:
        q_text = q.get("question", "")
        if q_text not in seen_q:
            seen_q.add(q_text)
            deduped_questions.append(q)

    # Refill from bank if needed
    for c_name, bank in q_bank.items():
        if len(deduped_questions) >= 5:
            break
        for bq in bank:
            if bq.get("question", "") not in seen_q:
                seen_q.add(bq.get("question", ""))
                deduped_questions.append(bq)
                if len(deduped_questions) >= 5:
                    break

    likely_questions = [
        JuryQuestion(question=q["question"], why_asked=q["why_asked"], answer_hint=q["answer_hint"])
        for q in deduped_questions[:5]
    ]

    report = JudgeReport(
        overall=overall,
        readiness=readiness,
        criteria=criteria_list,
        likely_questions=likely_questions,
        top_improvements=top_improvements,
        disclaimer=disclaimer,
        source="rules"
    )

    return report.model_dump()
