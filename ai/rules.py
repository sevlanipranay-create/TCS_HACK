"""Deterministic brief builder based on rules and curated knowledge base."""
import json
import math
import re
from pathlib import Path
from typing import Dict, Any, List

from contract.models import Brief, TeamContext
from ai.guardrails import redact_pii
from ai.feasibility import calculate_feasibility

KB_DIR = Path(__file__).resolve().parent / "kb"


def _load_kb() -> tuple[Dict[str, Any], Dict[str, Any], Dict[str, Any]]:
    with open(KB_DIR / "domains.json", "r", encoding="utf-8") as f:
        domains_data = json.load(f)
    with open(KB_DIR / "tech.json", "r", encoding="utf-8") as f:
        tech_data = json.load(f)
    with open(KB_DIR / "templates.json", "r", encoding="utf-8") as f:
        templates_data = json.load(f)
    return domains_data, tech_data, templates_data


def detect_domain(statement: str, domains: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Matches the statement to a domain based on keyword counts.
    Highest count wins, ties go to file order, zero hits returns 'generic'.
    """
    lower = statement.lower()
    best_domain = None
    best_count = 0

    for dom in domains:
        keywords = dom.get("keywords", [])
        if not keywords:
            continue
        count = sum(len(re.findall(rf"\b{re.escape(kw)}\b", lower)) for kw in keywords)
        if count > best_count:
            best_count = count
            best_domain = dom

    if best_domain is None or best_count == 0:
        for dom in domains:
            if dom.get("id") == "generic":
                return dom
        return domains[-1]

    return best_domain


def build_rules_brief(problem_statement: str, team_input: Dict[str, Any]) -> Dict[str, Any]:
    """Builds a complete, deterministic, schema-valid Brief dictionary from rules."""
    domains_data, tech_data, templates_data = _load_kb()
    domains = domains_data.get("domains", [])

    # Validate team context
    team_ctx = TeamContext(**team_input)
    team_size = team_ctx.team_size
    minutes_available = team_ctx.minutes_available
    skills = team_ctx.skills
    preferred_stack = team_ctx.preferred_stack

    # Step 1: Redact input defensively and count words
    redacted = redact_pii(problem_statement)
    words = redacted.strip().split()
    word_count = len(words)
    is_vague = word_count < 12

    # Step 2: Inferred domain
    domain = detect_domain(redacted, domains)

    # Step 3: problem.summary
    if is_vague:
        summary = (
            f"The statement is very short. Until you clarify it, treat it as a {domain['label']} problem. "
            f"Your first job is to find out who exactly is affected and what hurts them."
        )
    else:
        # First two sentences
        sentences = [s.strip() for s in re.split(r"(?<=[.!?])\s+", redacted.strip()) if s.strip()]
        if len(sentences) >= 2:
            first_two = f"{sentences[0]} {sentences[1]}"
        elif len(sentences) == 1:
            first_two = sentences[0]
        else:
            first_two = redacted

        # Cap at 60 words
        w = first_two.split()
        if len(w) > 60:
            summary = " ".join(w[:60])
        else:
            summary = first_two

    # Step 4: who_is_affected, why_it_matters, stakeholders, key_questions, assumptions
    who_is_affected = list(domain.get("who_is_affected", []))
    why_it_matters = domain.get("why_it_matters", "")
    stakeholders = list(domain.get("stakeholders", []))

    domain_key_questions = list(domain.get("key_questions", []))
    generic_questions = [
        "What does success look like in one number?",
        f"What can you realistically show in {minutes_available} minutes?"
    ]
    if is_vague:
        key_questions = ["What exact problem are you solving, and for whom?"] + domain_key_questions + generic_questions
    else:
        key_questions = domain_key_questions + generic_questions
    key_questions = key_questions[:7]

    assumptions = [
        f"We assume this project addresses challenges in the {domain['label']} domain.",
        "We assume synthetic or simulated data is acceptable for the hackathon demo.",
        f"We assume your team has {team_size} people and {minutes_available} minutes available.",
        "We assume focusing on one primary user persona is sufficient for the MVP demo."
    ]

    # Step 5: expected_solution
    personas = list(domain.get("personas", []))
    primary_persona_name = personas[0]["name"] if personas else "the primary user"
    expected_solution = {
        "goal": f"Show {primary_persona_name} a working end-to-end flow for the problem above in the demo.",
        "success_criteria": list(domain.get("success_criteria", [])),
        "approach_options": list(domain.get("approach_options", [])),
        "out_of_scope": list(domain.get("out_of_scope", []))
    }

    # Step 6: personas, features, tech
    features = list(domain.get("features", []))

    # Tech stack selection
    has_react = any("react" in s.lower() for s in skills) or "react" in preferred_stack.lower()
    tech_options: List[Dict[str, Any]] = []
    for layer_cfg in tech_data.get("tech_layers", []):
        layer_copy = dict(layer_cfg)
        if layer_copy.get("layer") == "Frontend":
            if has_react:
                layer_copy["recommended"] = "React + Vite"
                layer_copy["why"] = "Rich interactive UI requested by team skills and stack preferences."
            else:
                layer_copy["recommended"] = "Streamlit"
                layer_copy["why"] = "Rapid interactive UI with minimal boilerplate for fast hackathon demo delivery."
        tech_options.append(layer_copy)

    # Step 7: Feasibility
    feasibility = calculate_feasibility(team_size, minutes_available, features)

    # Step 8: MVP definition
    must_features = [f for f in features if f.get("priority") == "must"]
    should_features = [f for f in features if f.get("priority") == "should"]
    could_features = [f for f in features if f.get("priority") == "could"]

    mvp_must_features = list(must_features[:5])
    if len(mvp_must_features) < 3:
        for sf in should_features:
            mvp_must_features.append(sf)
            if len(mvp_must_features) >= 3:
                break

    must_have_objs: List[Dict[str, Any]] = []
    for idx, mf in enumerate(mvp_must_features, 1):
        fname = mf.get("name", f"Feature {idx}")
        must_have_objs.append({
            "id": f"m{idx}",
            "name": fname,
            "acceptance_criteria": [
                f"Given a typical input, the app shows a result for '{fname}'.",
                "The result appears within 3 seconds and a non-technical user can understand it."
            ]
        })

    must_have_names = {mf["name"] for mf in must_have_objs}
    nice_to_have = [f["name"] for f in features if f.get("name") not in must_have_names]

    example_in = domain.get("example_input", "Submit sample input data into the core screen")
    first_must_name = must_have_objs[0]["name"] if must_have_objs else "core feature"
    second_must_name = must_have_objs[1]["name"] if len(must_have_objs) > 1 else "the progress tracker"

    demo_path = [
        "Open the application interface on localhost.",
        f"Enter the domain sample input: '{example_in}'.",
        f"Show {first_must_name} processing and verify the output card.",
        f"Show {second_must_name} outcome to confirm end-to-end integration.",
        "State the known system limits honestly and answer jury questions."
    ]

    mvp = {
        "goal": expected_solution["goal"],
        "must_have": must_have_objs,
        "nice_to_have": nice_to_have,
        "demo_path": demo_path
    }

    # Step 9: Workflow phases
    # 6 phases in Stage order: understand, users, ideate, build, validate, pitch
    workflow_phases: List[Dict[str, Any]] = []
    total_phase_minutes = 0
    build_phase_idx = 3

    for idx, p_tmpl in enumerate(templates_data.get("workflow_phases", [])):
        weight = p_tmpl.get("weight", 10)
        p_mins = max(1, math.floor(weight * minutes_available / 100.0))
        total_phase_minutes += p_mins
        workflow_phases.append({
            "phase": p_tmpl.get("phase"),
            "title": p_tmpl.get("title"),
            "minutes": p_mins,
            "activities": list(p_tmpl.get("activities", [])),
            "outcome": p_tmpl.get("outcome", "")
        })

    # Add remainder to build phase so sum == minutes_available exactly
    remainder = minutes_available - total_phase_minutes
    workflow_phases[build_phase_idx]["minutes"] += remainder

    # Step 10: Tasks
    tasks: List[Dict[str, Any]] = []
    for idx, t_tmpl in enumerate(templates_data.get("task_templates", []), 1):
        weight = t_tmpl.get("weight", 10)
        t_mins = max(1, math.floor(weight * 0.85 * minutes_available / 100.0))
        tasks.append({
            "id": f"t{idx}",
            "phase": t_tmpl.get("phase"),
            "title": t_tmpl.get("title"),
            "owner_role": t_tmpl.get("owner_role"),
            "minutes": t_mins,
            "done": False
        })

    # Step 11: Checkpoints (4, ascending)
    raw_cps = [
        round(0.2 * minutes_available),
        round(0.4 * minutes_available),
        round(0.7 * minutes_available),
        round(0.9 * minutes_available)
    ]
    # Ensure strictly ascending
    ascending_cps: List[int] = []
    curr = 0
    for val in raw_cps:
        val = max(curr + 1, val)
        ascending_cps.append(val)
        curr = val

    checkpoints: List[Dict[str, Any]] = []
    for cp_min, cp_tmpl in zip(ascending_cps, templates_data.get("checkpoints", [])):
        checkpoints.append({
            "at_minute": cp_min,
            "check": cp_tmpl.get("check"),
            "how": cp_tmpl.get("how")
        })

    # Step 12: innovation_prompts, demo_tips, jury_outline
    innovation_prompts = list(domain.get("innovation_prompts", []))[:3]
    demo_tips = list(templates_data.get("demo_tips", []))[:4]

    approach_options = expected_solution["approach_options"]
    first_approach_how = approach_options[0]["how_it_works"] if approach_options else "Core rule engine workflow"
    second_persona_pain = personas[0]["pain_point"] if personas else "operational friction"

    talking_points = [
        summary,
        f"Focuses on {primary_persona_name} who struggles with {second_persona_pain}.",
        first_approach_how,
        f"Live demo executing: {' -> '.join(demo_path[:3])}.",
        "Validated with target acceptance criteria and 5 realistic inputs.",
        f"Recognizes current prototype boundaries: {', '.join(expected_solution['out_of_scope'])}."
    ]

    jury_outline: List[Dict[str, Any]] = []
    for slide_cfg, tp in zip(templates_data.get("jury_slides", []), talking_points):
        jury_outline.append({
            "slide": slide_cfg.get("slide"),
            "title": slide_cfg.get("title"),
            "talking_point": tp,
            "proof": slide_cfg.get("proof")
        })

    # Step 13: your_call
    persona_options = [p["name"] for p in personas] if personas else ["Primary User", "Secondary User"]
    approach_name_options = [a["name"] for a in approach_options] if approach_options else ["Option A", "Option B"]

    your_call = [
        {
            "question": "Which persona do you build the demo around?",
            "options": persona_options
        },
        {
            "question": "Which approach do you take?",
            "options": approach_name_options
        }
    ]

    # Step 14: Return validated Brief dict
    brief_data = {
        "session_id": None,
        "source": "rules",
        "problem": {
            "summary": summary,
            "domain": domain["id"],
            "who_is_affected": who_is_affected,
            "why_it_matters": why_it_matters,
            "stakeholders": stakeholders,
            "key_questions": key_questions,
            "assumptions": assumptions
        },
        "expected_solution": expected_solution,
        "personas": personas,
        "tech": tech_options,
        "mvp": mvp,
        "workflow": workflow_phases,
        "tasks": tasks,
        "checkpoints": checkpoints,
        "features": features,
        "feasibility": feasibility,
        "innovation_prompts": innovation_prompts,
        "demo_tips": demo_tips,
        "jury_outline": jury_outline,
        "your_call": your_call
    }

    # Verify schema with contract.models.Brief
    validated_model = Brief(**brief_data)
    return validated_model.model_dump()
