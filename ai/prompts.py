"""System prompts and prompt builders for LLM interactions."""
from typing import Dict, Any, List

MENTOR_SYSTEM_PROMPT = (
    "You are a hackathon mentor for third-year engineering student teams. You COACH; you do not solve. "
    "Be concrete and brief, in plain language. Lead with questions that help the team think. "
    "Offer 2 to 3 options with trade-offs and mark decisions as 'your call'. "
    "Never write the complete solution or the full project code; small illustrative snippets or pseudocode are allowed. "
    "Label every guess as an assumption. Do not invent facts, statistics or API details; if unsure, say 'verify this'. "
    "Fit advice to team_size, skills and minutes_available and prefer the smallest working demo. "
    "If the time budget is short, advise narrowing scope, never pivoting. "
    "Be encouraging and specific. Use only synthetic or public-style examples; "
    "never ask for personal data, confidential competition information or other teams' solutions. "
    "Return ONLY JSON that matches the schema you are given."
)


def build_brief_enrichment_prompt(problem_statement: str, team: Dict[str, Any], baseline_brief: Dict[str, Any]) -> str:
    """Constructs prompt for enriching whitelisted text fields of a project brief."""
    summary = baseline_brief.get("problem", {}).get("summary", "")
    domain = baseline_brief.get("problem", {}).get("domain", "")

    return f"""Task: Enrich the text phrasing of this hackathon mentor project brief.
Return JSON with only the following whitelisted text fields to polish:
{{
  "problem": {{
    "summary": "Plain language summary, strictly under 60 words.",
    "key_questions": ["5 to 7 specific guiding questions"],
    "assumptions": ["At least 3 assumptions labeled explicitly"]
  }},
  "expected_solution": {{
    "goal": "Clear working demo goal",
    "success_criteria": ["3 to 5 measurable criteria"]
  }},
  "personas": [
    {{
      "name": "Persona name",
      "role": "Role",
      "goal": "Goal",
      "pain_point": "Pain point",
      "how_to_validate": "Validation method"
    }}
  ],
  "features_why": [
    "One sentence per feature explaining why it matters (do NOT rename features)"
  ],
  "innovation_prompts": [
    "What if question 1",
    "What if question 2",
    "What if question 3"
  ],
  "demo_tips": [
    "Demo tip 1",
    "Demo tip 2",
    "Demo tip 3",
    "Demo tip 4"
  ],
  "jury_outline_talking_points": [
    "Talking point for slide 1",
    "Talking point for slide 2",
    "Talking point for slide 3",
    "Talking point for slide 4",
    "Talking point for slide 5",
    "Talking point for slide 6"
  ]
}}

Context:
- Problem statement: {problem_statement}
- Inferred domain: {domain}
- Current summary: {summary}
- Team size: {team.get('team_size', 4)}
- Skills: {', '.join(team.get('skills', []))}
- Minutes available: {team.get('minutes_available', 75)}
- Preferred stack: {team.get('preferred_stack', '')}

Rules:
- Never change numbers, minutes, IDs, scores, or feature names.
- Keep tone coaching, concise, and plain language.
- Output strictly valid JSON with no markdown wrapping.
"""


def build_chat_prompt(
    brief: Dict[str, Any],
    history: List[Dict[str, Any]],
    message: str,
    stage: str,
    team: Dict[str, Any]
) -> str:
    """Constructs prompt for stage-aware mentor reply."""
    problem = brief.get("problem", {})
    summary = problem.get("summary", "")
    domain = problem.get("domain", "")
    mvp = brief.get("mvp", {})
    must_haves = [m.get("name", "") for m in mvp.get("must_have", [])]
    feasibility = brief.get("feasibility", {})
    verdict = feasibility.get("verdict", "realistic")

    history_slice = history[-6:] if history else []
    history_formatted = "\n".join(
        f"{m.get('role', 'user')}: {m.get('content', '')}" for m in history_slice
    )

    return f"""Context:
- Domain: {domain}
- Problem Summary: {summary}
- Must-Have Features: {', '.join(must_haves)}
- Feasibility Verdict: {verdict}
- Current Stage: {stage}
- Team Context: size={team.get('team_size', 4)}, skills={team.get('skills', [])}, minutes={team.get('minutes_available', 75)}

Recent Conversation History:
{history_formatted if history_formatted else 'No previous messages'}

Student Team Message:
"{message}"

Instructions:
Reply as the hackathon mentor for stage '{stage}'.
1. Keep the reply strictly under 150 words.
2. Mark decisions as "your call".
3. Propose 2 to 3 small actionable options with trade-offs.
4. Do NOT write full code or complete solutions.
5. Provide 1 to 2 follow-up questions.

Return JSON in this format:
{{
  "reply": "Your mentor response text under 150 words",
  "follow_up_questions": ["Question 1?", "Question 2?"]
}}
"""
