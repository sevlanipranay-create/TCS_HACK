"""Orchestration engine for mentor AI logic (Owner C).

Public interface:
- redact(text: str) -> str
- generate_brief(problem_statement: str, team: dict) -> dict
- mentor_reply(brief: dict, history: list, message: str, stage: str, team: dict) -> dict
- judge(brief: dict, submission: dict, team: dict) -> dict

Rules:
- All four functions NEVER raise and return JSON-serialisable dicts.
- Defensive try/except wraps every function with unbreakable constant fallbacks.
"""
from typing import Dict, Any, List

from ai.guardrails import redact_pii, is_solution_dump, coaching_redirect
from ai.rules import build_rules_brief
from ai.chat import build_rules_reply
from ai.judge import evaluate_submission
from ai.llm import enrich_brief_with_llm, mentor_reply_with_llm


def _get_minimal_valid_brief(minutes_available: int = 75) -> Dict[str, Any]:
    """Returns an unbreakable minimal valid Brief dictionary."""
    mins = max(20, min(600, minutes_available))
    # 6 phases summing exactly to mins
    p1 = max(1, mins // 10)
    p2 = max(1, mins // 10)
    p3 = max(1, mins // 10)
    p5 = max(1, mins // 7)
    p6 = max(1, mins // 10)
    p4 = mins - (p1 + p2 + p3 + p5 + p6)

    # 10 tasks totaling <= 85%
    t_min = max(1, int(mins * 0.05))

    return {
        "session_id": None,
        "source": "rules",
        "problem": {
            "summary": "Core workflow challenges require a clear, focused MVP demo.",
            "domain": "generic",
            "who_is_affected": ["End users", "Team members", "Evaluators"],
            "why_it_matters": "Clear workflows prevent team confusion and operational bottlenecks.",
            "stakeholders": [
                {"name": "Team Lead", "interest": "Deliver working demo", "influence": "high"},
                {"name": "End User", "interest": "Easy problem solving", "influence": "high"},
                {"name": "Judge", "interest": "Inspect architecture and sanity", "influence": "medium"}
            ],
            "key_questions": [
                "What is the single core user action?",
                "What input data is required?",
                "How do we know the demo succeeded?",
                "What does success look like in one number?",
                f"What can you realistically show in {mins} minutes?"
            ],
            "assumptions": [
                "We assume standard hackathon time constraints.",
                "We assume synthetic data is acceptable for testing.",
                "We assume focusing on one primary persona is sufficient."
            ]
        },
        "expected_solution": {
            "goal": "Show the primary user a working end-to-end flow in the demo.",
            "success_criteria": [
                "Complete flow runs within 60 seconds",
                "Inputs validated before processing",
                "MVP features demonstrated live"
            ],
            "approach_options": [
                {"name": "Direct Form Flow", "how_it_works": "Sequential inputs with instant output.", "tradeoff": "Fast to build but less customizable."},
                {"name": "Dashboard Board", "how_it_works": "Card view with status updates.", "tradeoff": "Better visibility but more UI work."}
            ],
            "out_of_scope": ["Cloud enterprise sync", "Biometric authentication"]
        },
        "personas": [
            {
                "name": "Alex",
                "role": "Primary Operator",
                "goal": "Complete main task quickly",
                "pain_point": "Manual spreadsheet tracking",
                "how_to_validate": "5-minute user walkthrough"
            },
            {
                "name": "Sam",
                "role": "Project Reviewer",
                "goal": "Verify output correctness",
                "pain_point": "Unclear system boundaries",
                "how_to_validate": "Review system audit log"
            }
        ],
        "tech": [
            {"layer": "Frontend", "options": ["Streamlit", "React + Vite"], "recommended": "Streamlit", "why": "Fast UI delivery.", "tradeoff": "Less styling flexibility."},
            {"layer": "Backend", "options": ["FastAPI", "Flask"], "recommended": "FastAPI", "why": "High performance API.", "tradeoff": "Requires async knowledge."},
            {"layer": "Data", "options": ["SQLite", "JSON File"], "recommended": "SQLite", "why": "Zero setup SQL.", "tradeoff": "Single machine only."}
        ],
        "mvp": {
            "goal": "Show the primary user a working end-to-end flow in the demo.",
            "must_have": [
                {
                    "id": "m1",
                    "name": "Core Submission Form",
                    "acceptance_criteria": [
                        "Given a typical input, the app shows a result for 'Core Submission Form'.",
                        "The result appears within 3 seconds and a non-technical user can understand it."
                    ]
                },
                {
                    "id": "m2",
                    "name": "Status Overview Dashboard",
                    "acceptance_criteria": [
                        "Given a typical input, the app shows a result for 'Status Overview Dashboard'.",
                        "The result appears within 3 seconds and a non-technical user can understand it."
                    ]
                },
                {
                    "id": "m3",
                    "name": "Smart Rule Assistant",
                    "acceptance_criteria": [
                        "Given a typical input, the app shows a result for 'Smart Rule Assistant'.",
                        "The result appears within 3 seconds and a non-technical user can understand it."
                    ]
                }
            ],
            "nice_to_have": ["Activity Audit Log", "Export and Sharing Tool"],
            "demo_path": [
                "Open the application interface on localhost.",
                "Enter typical sample input.",
                "Show Core Submission Form result.",
                "Show Status Overview Dashboard outcome.",
                "State known limits honestly and answer jury questions."
            ]
        },
        "workflow": [
            {"phase": "understand", "title": "Understand Problem", "minutes": p1, "activities": ["Read problem", "Identify users", "List assumptions"], "outcome": "Agreed problem statement"},
            {"phase": "users", "title": "Define Personas", "minutes": p2, "activities": ["Choose persona", "Draft inputs", "Confirm criteria"], "outcome": "Target persona locked"},
            {"phase": "ideate", "title": "Scope MVP", "minutes": p3, "activities": ["Weigh approaches", "Pick 3 must-haves", "Draft demo path"], "outcome": "MVP scope locked"},
            {"phase": "build", "title": "Build Core Flow", "minutes": p4, "activities": ["Build backend API", "Implement logic", "Build screens"], "outcome": "Working demo flow"},
            {"phase": "validate", "title": "Test Inputs", "minutes": p5, "activities": ["Run 5 inputs", "Fix bugs", "Check limits"], "outcome": "Verified flow"},
            {"phase": "pitch", "title": "Rehearse Pitch", "minutes": p6, "activities": ["Complete slides", "Rehearse demo", "Prep questions"], "outcome": "Rehearsed pitch"}
        ],
        "tasks": [
            {"id": "t1", "phase": "understand", "title": "Read the problem aloud and write the one-sentence problem", "owner_role": "Integrator", "minutes": t_min, "done": False},
            {"id": "t2", "phase": "users", "title": "Pick one persona and ask 2 real people how they handle this today", "owner_role": "Integrator", "minutes": t_min, "done": False},
            {"id": "t3", "phase": "users", "title": "Write 5 test inputs including 1 edge case", "owner_role": "Integrator", "minutes": t_min, "done": False},
            {"id": "t4", "phase": "ideate", "title": "Choose 2 to 3 must-have features from the brief", "owner_role": "Integrator", "minutes": t_min, "done": False},
            {"id": "t5", "phase": "build", "title": "Build the data storage and API for the must-haves", "owner_role": "Backend", "minutes": t_min, "done": False},
            {"id": "t6", "phase": "build", "title": "Build the core logic or AI for the must-haves", "owner_role": "AI", "minutes": t_min, "done": False},
            {"id": "t7", "phase": "build", "title": "Build the screens for the demo path", "owner_role": "Frontend", "minutes": t_min, "done": False},
            {"id": "t8", "phase": "build", "title": "Connect all parts and run one full path", "owner_role": "Integrator", "minutes": t_min, "done": False},
            {"id": "t9", "phase": "validate", "title": "Run the test inputs and fix critical issues only", "owner_role": "Integrator", "minutes": t_min, "done": False},
            {"id": "t10", "phase": "pitch", "title": "Write the 6-slide outline and rehearse the demo twice", "owner_role": "Integrator", "minutes": t_min, "done": False}
        ],
        "checkpoints": [
            {"at_minute": max(1, int(mins * 0.2)), "check": "Problem and persona validated", "how": "Confirm one-sentence clarity."},
            {"at_minute": max(2, int(mins * 0.4)), "check": "Architecture and MVP locked", "how": "Verify 3 must-haves."},
            {"at_minute": max(3, int(mins * 0.7)), "check": "First integration pass runs", "how": "Round trip without crash."},
            {"at_minute": max(4, int(mins * 0.9)), "check": "Live demo rehearsed", "how": "Time 3-minute run-through."}
        ],
        "features": [
            {"name": "Core Submission Form", "why": "Immediate input capture", "effort": "S", "impact": 5, "priority": "must", "innovative": False},
            {"name": "Status Overview Dashboard", "why": "Live progress display", "effort": "M", "impact": 4, "priority": "must", "innovative": False},
            {"name": "Smart Rule Assistant", "why": "Automates next steps", "effort": "M", "impact": 4, "priority": "should", "innovative": True}
        ],
        "feasibility": {
            "score": 100,
            "verdict": "realistic",
            "budget_points": round(4 * mins * 0.5 / 20.0, 1),
            "used_points": 5.0,
            "message": "Scope fits your time. Keep it this small."
        },
        "innovation_prompts": [
            "What if the primary workflow required zero clicks on return visits?",
            "What if the system surfaced the single most critical exception automatically?",
            "What if manual validation was replaced by automated consistency checks?"
        ],
        "demo_tips": [
            "Open all required browser tabs and terminals before the judges arrive.",
            "Show the working product live within the first 60 seconds.",
            "Use realistic prepared demo inputs rather than typing slowly.",
            "If an error occurs, explain the limit calmly and continue."
        ],
        "jury_outline": [
            {"slide": 1, "title": "Problem", "talking_point": "Core problem statement", "proof": "User quotes"},
            {"slide": 2, "title": "Who it hurts", "talking_point": "Focus on primary persona", "proof": "Persona metrics"},
            {"slide": 3, "title": "Our approach", "talking_point": "Fast robust rule engine", "proof": "Architecture diagram"},
            {"slide": 4, "title": "Live demo", "talking_point": "Live 90-second demo", "proof": "Working code"},
            {"slide": 5, "title": "Does it work", "talking_point": "Validated with test inputs", "proof": "Execution logs"},
            {"slide": 6, "title": "Limits and next steps", "talking_point": "Honest prototype limits", "proof": "Roadmap"}
        ],
        "your_call": [
            {"question": "Which persona do you build the demo around?", "options": ["Alex", "Sam"]},
            {"question": "Which approach do you take?", "options": ["Direct Form Flow", "Dashboard Board"]}
        ]
    }


def _get_minimal_valid_judge() -> Dict[str, Any]:
    """Returns an unbreakable minimal valid JudgeReport dictionary."""
    return {
        "overall": 20,
        "readiness": "needs_work",
        "criteria": [
            {"name": "Problem clarity", "score": 1, "evidence": "Summary is empty; names a persona: no; has a number: no; mentions validation: no.", "improve": "Expand idea summary to at least 20 words describing the core problem."},
            {"name": "Works end to end", "score": 1, "evidence": "Matched 0 must-haves; demo script has 0 lines.", "improve": "Connect at least one must-have feature into your live running flow."},
            {"name": "Scope realism", "score": 1, "evidence": "Built features: 0; MVP must-haves: 3; minutes left: not set.", "improve": "List the core features built so the jury can assess scope."},
            {"name": "Innovation and practicality", "score": 1, "evidence": "Innovative matched: no; mentions constraint: no; known limits: 0; contrasts baseline: no.", "improve": "Highlight your innovative feature and explain the advantage."},
            {"name": "Can you explain it", "score": 1, "evidence": "Demo script lines: 0; documented limits: 0; idea summary length: 0 words.", "improve": "Document your live demo walk-through steps."}
        ],
        "likely_questions": [
            {"question": "Who is your primary user and how exactly did you validate this pain point?", "why_asked": "Checks real user need.", "answer_hint": "Name your specific persona and describe their daily friction."},
            {"question": "Can we see the end-to-end flow run from raw input to final output live?", "why_asked": "Distinguishes working prototype from mocks.", "answer_hint": "Walk through your live demo path in order."},
            {"question": "Why did you prioritize these specific must-have features over the rest?", "why_asked": "Evaluates scoping judgment.", "answer_hint": "Explain how must-haves deliver core value."},
            {"question": "Who is your user and how do you know they have this problem?", "why_asked": "Checks real user evidence.", "answer_hint": "Cite user interviews and specific daily pain point."},
            {"question": "What is real in your demo and what is mocked?", "why_asked": "Values engineering honesty.", "answer_hint": "Clearly distinguish live APIs from static mocks."}
        ],
        "top_improvements": [
            {"action": "Expand idea summary to at least 20 words describing the core problem.", "minutes": 10},
            {"action": "Connect at least one must-have feature into your live running flow.", "minutes": 15},
            {"action": "List the core features built so the jury can assess scope.", "minutes": 10}
        ],
        "disclaimer": "Practice check against a transparent rubric. It does not predict real jury scores.",
        "source": "rules"
    }


def redact(text: str) -> str:
    """Redacts PII (emails and phone numbers) from text while leaving dates intact. Never raises."""
    try:
        if not isinstance(text, str):
            return str(text) if text is not None else ""
        return redact_pii(text)
    except Exception:
        # Failsafe fallback
        if not isinstance(text, str):
            return ""
        return text.replace("@", "[at]")


def generate_brief(problem_statement: str, team: dict) -> dict:
    """Generates a complete, validated project Brief dictionary with session_id=None. Never raises."""
    try:
        clean_statement = redact_pii(str(problem_statement or ""))
        team_dict = team if isinstance(team, dict) else {}

        # 1. Deterministic rules baseline
        baseline = build_rules_brief(clean_statement, team_dict)

        # 2. Optional LLM enrichment (merges only whitelisted fields if valid)
        enriched = enrich_brief_with_llm(baseline, clean_statement, team_dict)
        return enriched
    except Exception:
        mins = 75
        if isinstance(team, dict):
            mins = team.get("minutes_available", 75)
        return _get_minimal_valid_brief(mins)


def mentor_reply(brief: dict, history: list, message: str, stage: str, team: dict) -> dict:
    """Generates a stage-aware mentor reply dictionary. Never raises."""
    try:
        clean_message = redact_pii(str(message or ""))
        safe_stage = stage if stage in ["understand", "users", "ideate", "build", "validate", "pitch"] else "understand"
        safe_brief = brief if isinstance(brief, dict) else _get_minimal_valid_brief()
        safe_history = history if isinstance(history, list) else []
        safe_team = team if isinstance(team, dict) else {}

        # 1. Guardrail check first
        if is_solution_dump(clean_message):
            return coaching_redirect(safe_stage)

        # 2. Rules-based stage-aware reply
        rules_reply = build_rules_reply(safe_brief, safe_history, clean_message, safe_stage, safe_team)

        # 3. Optional LLM path (if GEMINI_API_KEY is available)
        final_reply = mentor_reply_with_llm(
            safe_brief, safe_history, clean_message, safe_stage, safe_team, rules_reply
        )
        return final_reply
    except Exception:
        safe_stage = stage if stage in ["understand", "users", "ideate", "build", "validate", "pitch"] else "understand"
        return {
            "reply": "Let's focus on the primary user pain point and build a 15-minute proof of concept. Your call on where to start.",
            "stage": safe_stage,
            "follow_up_questions": [
                "What is the single biggest technical obstacle your team faces right now?"
            ],
            "guardrail_triggered": False,
            "source": "rules"
        }


def judge(brief: dict, submission: dict, team: dict) -> dict:
    """Evaluates project submission against jury rubric (RULES ONLY; never uses an LLM). Never raises."""
    try:
        safe_brief = brief if isinstance(brief, dict) else _get_minimal_valid_brief()
        safe_sub = submission if isinstance(submission, dict) else {}
        safe_team = team if isinstance(team, dict) else {}

        # Evaluate strictly with deterministic rules
        report = evaluate_submission(safe_brief, safe_sub, safe_team)
        return report
    except Exception:
        return _get_minimal_valid_judge()
