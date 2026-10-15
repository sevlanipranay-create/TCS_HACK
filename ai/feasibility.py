"""Feasibility calculation based on the shared contract formula."""
from typing import List, Dict, Any

EFFORT_POINTS = {
    "S": 1.0,
    "M": 2.0,
    "L": 4.0
}


def calculate_feasibility(team_size: int, minutes_available: int, features: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Calculates project feasibility metrics.

    budget_points = team_size * minutes_available * 0.5 / 20
    used_points = sum of effort points of features with priority 'must' or 'should'
    verdict: 'realistic' if used <= budget; 'tight' if used <= 1.3 * budget; else 'overscoped'
    score = 100 if used == 0 else round(100 * min(1, budget / used))
    Round both point values to 1 decimal.
    message: realistic -> "Scope fits your time. Keep it this small."
             tight or overscoped -> "Cut these first: <could-have names>" (if none, the should-have names)
    """
    raw_budget = team_size * minutes_available * 0.5 / 20.0
    budget_points = round(raw_budget, 1)

    used = 0.0
    could_haves: List[str] = []
    should_haves: List[str] = []

    for f in features:
        prio = f.get("priority", "could")
        effort_key = f.get("effort", "S")
        pts = EFFORT_POINTS.get(effort_key, 1.0)
        name = f.get("name", "Unknown Feature")

        if prio in ("must", "should"):
            used += pts

        if prio == "could":
            could_haves.append(name)
        elif prio == "should":
            should_haves.append(name)

    used_points = round(used, 1)

    if used_points <= budget_points:
        verdict = "realistic"
    elif used_points <= round(1.3 * budget_points, 5):
        verdict = "tight"
    else:
        verdict = "overscoped"

    if used_points == 0:
        score = 100
    else:
        score = round(100.0 * min(1.0, budget_points / used_points))

    if verdict == "realistic":
        message = "Scope fits your time. Keep it this small."
    else:
        cut_list = could_haves if could_haves else should_haves
        if cut_list:
            cut_names = ", ".join(cut_list)
            message = f"Cut these first: {cut_names}"
        else:
            message = "Cut nice-to-have features first to protect your demo path."

    return {
        "score": score,
        "verdict": verdict,
        "budget_points": budget_points,
        "used_points": used_points,
        "message": message
    }
