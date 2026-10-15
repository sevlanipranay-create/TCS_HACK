"""Stage-aware mentor conversation handler."""
import re
from typing import Dict, Any, List

from ai.guardrails import is_solution_dump, coaching_redirect
from contract.models import ChatResponse


def build_rules_reply(
    brief: Dict[str, Any],
    history: List[Dict[str, Any]],
    message: str,
    stage: str,
    team: Dict[str, Any]
) -> Dict[str, Any]:
    """Generates a deterministic stage-aware mentor response from rules and brief data."""
    valid_stage = stage if stage in ["understand", "users", "ideate", "build", "validate", "pitch"] else "understand"

    problem = brief.get("problem", {})
    summary = problem.get("summary", "the core problem")
    assumptions = problem.get("assumptions", ["We assume synthetic data is acceptable."])
    first_assumption = assumptions[0] if assumptions else "We assume standard hackathon conditions."

    personas = brief.get("personas", [])
    expected_sol = brief.get("expected_solution", {})
    approaches = expected_sol.get("approach_options", [])
    mvp = brief.get("mvp", {})
    must_haves = mvp.get("must_have", [])
    demo_path = mvp.get("demo_path", [])
    feasibility = brief.get("feasibility", {})
    used_pts = feasibility.get("used_points", 0.0)
    budget_pts = feasibility.get("budget_points", 0.0)
    verdict = feasibility.get("verdict", "realistic")

    tasks = brief.get("tasks", [])
    not_done_tasks = [t for t in tasks if not t.get("done", False)]
    first_not_done = not_done_tasks[0].get("title", "the first build task") if not_done_tasks else "polishing the demo flow"

    minutes_available = team.get("minutes_available", 75)
    innovation_prompts = brief.get("innovation_prompts", ["What if you automated the primary step?"])
    first_prompt = innovation_prompts[0] if innovation_prompts else "What if you kept the flow strictly under 60 seconds?"

    jury_outline = brief.get("jury_outline", [])
    slide_titles = [s.get("title", f"Slide {i}") for i, s in enumerate(jury_outline, 1)]

    follow_up_questions: List[str] = []
    reply_body = ""

    if valid_stage == "understand":
        reply_body = (
            f"Let's ground our focus. The core problem is: {summary}. "
            f"Our starting baseline is: {first_assumption}. "
            f"Your call: which part of this problem or assumption is least clear to your team right now?"
        )
        follow_up_questions = [
            "Which specific user pain point feels most urgent to solve?",
            "What assumption would break your solution if it proved false?"
        ]

    elif valid_stage == "users":
        p_summaries = []
        for p in personas[:2]:
            p_summaries.append(f"{p.get('name', 'User')} ({p.get('pain_point', 'friction')})")
        p_text = "; ".join(p_summaries) if p_summaries else "our primary user"
        how_val = personas[0].get("how_to_validate", "ask 2 target users") if personas else "interview 2 target users"

        reply_body = (
            f"We have mapped our personas: {p_text}. "
            f"To validate quickly: {how_val}. "
            f"Your call: which one do you build the demo around?"
        )
        follow_up_questions = [
            f"Which persona best illustrates the before-and-after contrast in a 90-second demo?",
            "What is one quick question you can ask someone right now to validate their workflow?"
        ]

    elif valid_stage == "ideate":
        app_texts = []
        for a in approaches[:3]:
            app_texts.append(f"{a.get('name', 'Option')} ({a.get('tradeoff', 'trade-off')})")
        apps_summary = "; ".join(app_texts) if app_texts else "Option A vs Option B"

        reply_body = (
            f"Here are your approach options: {apps_summary}. "
            f"Consider this spark: {first_prompt}. "
            f"Your call: which approach do you take?"
        )
        follow_up_questions = [
            "Which approach allows your team to get a working prototype running the fastest?",
            "What is the single biggest architectural risk of your preferred approach?"
        ]

    elif valid_stage == "build":
        mh_names = ", ".join(m.get("name", "") for m in must_haves[:3])
        time_warning = " Narrow the scope, do not pivot." if minutes_available < 30 else ""

        reply_body = (
            f"Lock your must-haves: {mh_names}. "
            f"Feasibility verdict is {verdict} ({used_pts} used vs {budget_pts} budget points).{time_warning} "
            f"Your next step is: {first_not_done}. "
            f"Your call on how to split owners across frontend, backend, and data."
        )
        follow_up_questions = [
            "Is the first API contract agreed between frontend and backend teammates?",
            "Can you wire a minimal end-to-end pass with hardcoded sample data first?"
        ]

    elif valid_stage == "validate":
        dp_summary = " -> ".join(demo_path[:3]) if demo_path else "input to output"
        reply_body = (
            f"Time to verify your flow: {dp_summary}. "
            f"We need 3 test inputs: normal case, alternate case, and an edge case like empty or vague input. "
            f"Your call: which edge case is most critical to protect against?"
        )
        follow_up_questions = [
            "What happens right now if a user submits an empty or invalid form?",
            "Are there any blocking errors when running the full flow sequentially?"
        ]

    elif valid_stage == "pitch":
        slides_text = ", ".join(slide_titles[:6])
        reply_body = (
            f"Your 6 jury slides are: {slides_text}. "
            f"Focus 70% of your energy on the live working demo rather than static slides. "
            f"Your call: which slide proves it works beyond doubt?"
        )
        follow_up_questions = [
            "Who on the team is narrating the demo while another teammate drives the screen?",
            "What are your 2 honest known limits to share transparently when judges ask?"
        ]

    # Stuck / help coaching trigger
    msg_lower = message.lower()
    if "stuck" in msg_lower or "help" in msg_lower:
        reply_body += " Name the one thing blocking you and we will turn it into a 10-minute step."

    # Enforce word limit (strictly <= 150 words)
    words = reply_body.split()
    if len(words) > 150:
        reply_body = " ".join(words[:148]) + "..."

    response_dict = {
        "reply": reply_body,
        "stage": valid_stage,
        "follow_up_questions": follow_up_questions[:2],
        "guardrail_triggered": False,
        "source": "rules"
    }

    # Validate with ChatResponse model
    return ChatResponse(**response_dict).model_dump()
