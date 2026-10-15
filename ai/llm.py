"""Optional LLM client using google-genai for enriching whitelisted text fields."""
import concurrent.futures
import json
import os
import re
from typing import Dict, Any, List, Optional

from contract.models import Brief, ChatResponse
from ai.prompts import (
    MENTOR_SYSTEM_PROMPT,
    build_brief_enrichment_prompt,
    build_chat_prompt,
)

TIMEOUT_SECONDS = 8.0
DEFAULT_MODEL = "gemini-2.5-flash"


def _clean_json_text(text: str) -> str:
    """Strips markdown code fences and cleans JSON string."""
    cleaned = text.strip()
    if cleaned.startswith("```"):
        cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned)
        cleaned = re.sub(r"\s*```$", "", cleaned)
    return cleaned.strip()


def _call_gemini_raw(prompt: str, system_prompt: str, model_name: str, api_key: str) -> str:
    from google import genai
    from google.genai import types

    client = genai.Client(api_key=api_key)
    config = types.GenerateContentConfig(
        system_instruction=system_prompt,
        response_mime_type="application/json"
    )
    response = client.models.generate_content(
        model=model_name,
        contents=prompt,
        config=config
    )
    return response.text or ""


def _call_with_timeout(prompt: str, system_prompt: str, model_name: str, api_key: str) -> Optional[str]:
    with concurrent.futures.ThreadPoolExecutor(max_workers=1) as executor:
        future = executor.submit(_call_gemini_raw, prompt, system_prompt, model_name, api_key)
        try:
            return future.result(timeout=TIMEOUT_SECONDS)
        except Exception:
            return None


def enrich_brief_with_llm(
    baseline_brief: Dict[str, Any],
    problem_statement: str,
    team: Dict[str, Any]
) -> Dict[str, Any]:
    """Enriches only whitelisted text fields of a project brief if GEMINI_API_KEY is available."""
    api_key = os.getenv("GEMINI_API_KEY", "").strip()
    if not api_key:
        return baseline_brief

    model_name = os.getenv("GEMINI_MODEL", DEFAULT_MODEL).strip()
    prompt = build_brief_enrichment_prompt(problem_statement, team, baseline_brief)

    raw_text = _call_with_timeout(prompt, MENTOR_SYSTEM_PROMPT, model_name, api_key)
    if not raw_text:
        return baseline_brief

    try:
        data = json.loads(_clean_json_text(raw_text))
    except Exception:
        return baseline_brief

    if not isinstance(data, dict):
        return baseline_brief

    # Create a deep copy of baseline brief to merge into
    enriched = json.loads(json.dumps(baseline_brief))
    replaced_any = False

    # 1. problem.summary (max 60 words)
    prob_enrich = data.get("problem", {})
    if isinstance(prob_enrich, dict):
        new_summary = prob_enrich.get("summary")
        if isinstance(new_summary, str) and new_summary.strip():
            w = new_summary.strip().split()
            if 1 <= len(w) <= 60:
                enriched["problem"]["summary"] = new_summary.strip()
                replaced_any = True

        # problem.key_questions (5 to 7)
        new_kq = prob_enrich.get("key_questions")
        if isinstance(new_kq, list) and 5 <= len(new_kq) <= 7 and all(isinstance(q, str) and q.strip() for q in new_kq):
            enriched["problem"]["key_questions"] = [q.strip() for q in new_kq]
            replaced_any = True

        # problem.assumptions (at least 3)
        new_assump = prob_enrich.get("assumptions")
        if isinstance(new_assump, list) and len(new_assump) >= 3 and all(isinstance(a, str) and a.strip() for a in new_assump):
            enriched["problem"]["assumptions"] = [a.strip() for a in new_assump]
            replaced_any = True

    # 2. expected_solution.goal & success_criteria (3 to 5)
    exp_enrich = data.get("expected_solution", {})
    if isinstance(exp_enrich, dict):
        new_goal = exp_enrich.get("goal")
        if isinstance(new_goal, str) and new_goal.strip():
            enriched["expected_solution"]["goal"] = new_goal.strip()
            enriched["mvp"]["goal"] = new_goal.strip()
            replaced_any = True

        new_sc = exp_enrich.get("success_criteria")
        if isinstance(new_sc, list) and 3 <= len(new_sc) <= 5 and all(isinstance(s, str) and s.strip() for s in new_sc):
            enriched["expected_solution"]["success_criteria"] = [s.strip() for s in new_sc]
            replaced_any = True

    # 3. personas text fields
    new_personas = data.get("personas")
    if isinstance(new_personas, list) and len(new_personas) == len(enriched["personas"]):
        all_valid = True
        merged_p = []
        for orig, cand in zip(enriched["personas"], new_personas):
            if isinstance(cand, dict):
                merged_p.append({
                    "name": str(cand.get("name", orig["name"])).strip() or orig["name"],
                    "role": str(cand.get("role", orig["role"])).strip() or orig["role"],
                    "goal": str(cand.get("goal", orig["goal"])).strip() or orig["goal"],
                    "pain_point": str(cand.get("pain_point", orig["pain_point"])).strip() or orig["pain_point"],
                    "how_to_validate": str(cand.get("how_to_validate", orig["how_to_validate"])).strip() or orig["how_to_validate"],
                })
            else:
                all_valid = False
                break
        if all_valid:
            enriched["personas"] = merged_p
            replaced_any = True

    # 4. features[].why (never name, effort, impact, priority, innovative)
    features_why = data.get("features_why")
    if isinstance(features_why, list) and len(features_why) == len(enriched["features"]):
        if all(isinstance(w, str) and w.strip() for w in features_why):
            for idx, why_text in enumerate(features_why):
                enriched["features"][idx]["why"] = why_text.strip()
            replaced_any = True

    # 5. innovation_prompts (3 strings)
    new_prompts = data.get("innovation_prompts")
    if isinstance(new_prompts, list) and len(new_prompts) == 3 and all(isinstance(p, str) and p.strip() for p in new_prompts):
        enriched["innovation_prompts"] = [p.strip() for p in new_prompts]
        replaced_any = True

    # 6. demo_tips (4 strings)
    new_tips = data.get("demo_tips")
    if isinstance(new_tips, list) and len(new_tips) == 4 and all(isinstance(t, str) and t.strip() for t in new_tips):
        enriched["demo_tips"] = [t.strip() for t in new_tips]
        replaced_any = True

    # 7. jury_outline[].talking_point
    talking_points = data.get("jury_outline_talking_points")
    if isinstance(talking_points, list) and len(talking_points) == len(enriched["jury_outline"]):
        if all(isinstance(tp, str) and tp.strip() for tp in talking_points):
            for idx, tp in enumerate(talking_points):
                enriched["jury_outline"][idx]["talking_point"] = tp.strip()
            replaced_any = True

    if replaced_any:
        enriched["source"] = "llm"

    # Validate against Brief model
    try:
        return Brief(**enriched).model_dump()
    except Exception:
        return baseline_brief


def mentor_reply_with_llm(
    brief: Dict[str, Any],
    history: List[Dict[str, Any]],
    message: str,
    stage: str,
    team: Dict[str, Any],
    fallback_reply: Dict[str, Any]
) -> Dict[str, Any]:
    """Generates an LLM-enriched mentor reply if GEMINI_API_KEY is configured."""
    api_key = os.getenv("GEMINI_API_KEY", "").strip()
    if not api_key:
        return fallback_reply

    model_name = os.getenv("GEMINI_MODEL", DEFAULT_MODEL).strip()
    prompt = build_chat_prompt(brief, history, message, stage, team)

    raw_text = _call_with_timeout(prompt, MENTOR_SYSTEM_PROMPT, model_name, api_key)
    if not raw_text:
        return fallback_reply

    try:
        data = json.loads(_clean_json_text(raw_text))
    except Exception:
        return fallback_reply

    if not isinstance(data, dict):
        return fallback_reply

    reply = data.get("reply", "")
    follow_up_questions = data.get("follow_up_questions", [])

    # Validation criteria:
    # 1. No code fences
    if "```" in reply:
        return fallback_reply

    # 2. Maximum 150 words
    words = reply.strip().split()
    if len(words) == 0 or len(words) > 150:
        return fallback_reply

    # 3. Must contain at least one question (in follow_ups or in reply body)
    has_questions = (
        (isinstance(follow_up_questions, list) and len(follow_up_questions) > 0) or
        ("?" in reply)
    )
    if not has_questions:
        return fallback_reply

    cleaned_questions = [
        str(q).strip() for q in follow_up_questions if isinstance(q, str) and q.strip()
    ][:2]

    response_dict = {
        "reply": reply.strip(),
        "stage": stage if stage in ["understand", "users", "ideate", "build", "validate", "pitch"] else "understand",
        "follow_up_questions": cleaned_questions,
        "guardrail_triggered": False,
        "source": "llm"
    }

    try:
        return ChatResponse(**response_dict).model_dump()
    except Exception:
        return fallback_reply
