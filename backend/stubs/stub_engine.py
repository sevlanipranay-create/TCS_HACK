import re
from typing import Any, Dict, List

def redact(text: str) -> str:
    """Mask emails as [email] and 10-digit phone numbers as [phone]."""
    if not text:
        return ""
    # Redact email addresses
    redacted = re.sub(r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+", "[email]", text)
    # Redact 10-digit phone numbers with optional +91, spaces or dashes
    phone_pattern = r"(?:\+91[\s-]?(?:\d[\s-]?){9}\d\b)|(?<!\w)(?:\d[\s-]?){9}\d\b"
    redacted = re.sub(phone_pattern, "[phone]", redacted)
    return redacted


def _calc_workflow_minutes(total_min: int) -> List[int]:
    """Calculate 6 phase minutes summing exactly to total_min, each >= 1."""
    # Ratios for understand, users, ideate, build, validate, pitch
    weights = [0.15, 0.15, 0.15, 0.35, 0.10, 0.10]
    mins = [max(1, int(round(total_min * w))) for w in weights]
    diff = total_min - sum(mins)
    mins[3] += diff  # adjust on build phase
    if mins[3] < 1:
        mins[3] = 1
        rem = total_min - sum(mins)
        mins[0] += rem
    return mins


def _calc_task_minutes(total_min: int) -> List[int]:
    """Calculate minutes for 10 tasks whose total <= 85% of total_min."""
    # Target 75% of total_min so total is strictly <= 85%
    budget = max(10, int(total_min * 0.75))
    base = budget // 10
    rem = budget % 10
    minutes = [base + (1 if i < rem else 0) for i in range(10)]
    return [max(1, m) for m in minutes]


def _calc_checkpoints(total_min: int) -> List[int]:
    """Calculate 4 strictly ascending checkpoints at ~20%, 40%, 70%, 90%."""
    cp1 = max(1, round(total_min * 0.20))
    cp2 = max(cp1 + 1, round(total_min * 0.40))
    cp3 = max(cp2 + 1, round(total_min * 0.70))
    cp4 = max(cp3 + 1, min(total_min, round(total_min * 0.90)))
    return [cp1, cp2, cp3, cp4]


def generate_brief(problem_statement: str, team: dict) -> dict:
    """Generate a canned but fully valid Brief dict with session_id=None."""
    clean_statement = redact(problem_statement)
    team_size = int(team.get("team_size", 4))
    minutes_available = int(team.get("minutes_available", 75))

    phase_mins = _calc_workflow_minutes(minutes_available)
    task_mins = _calc_task_minutes(minutes_available)
    cp_mins = _calc_checkpoints(minutes_available)

    # Feasibility formula:
    # budget_points = team_size * minutes_available * 0.5 / 20
    # used_points = sum of effort points of features with priority "must" or "should" (S=1, M=2, L=4)
    # verdict: "realistic" if used <= budget; "tight" if used <= 1.3 * budget; else "overscoped"
    # score = 100 if used == 0 else round(100 * min(1, budget / used))
    features = [
        {
            "name": "Meal Slot Pre-booking",
            "why": "Allows students to reserve food slots and lets kitchen estimate batch sizes.",
            "effort": "M",  # 2 points
            "impact": 5,
            "priority": "must",
            "innovative": False,
        },
        {
            "name": "Kitchen Live Headcount Counter",
            "why": "Provides cooks with an accurate real-time meal count per time slot.",
            "effort": "S",  # 1 point
            "impact": 4,
            "priority": "must",
            "innovative": False,
        },
        {
            "name": "Surplus Redistribution Broadcast",
            "why": "Notifies students of leftover meals 30 mins before closing at reduced rates.",
            "effort": "S",  # 1 point
            "impact": 4,
            "priority": "should",
            "innovative": True,
        },
        {
            "name": "Predictive Attendance Recommender",
            "why": "Estimates demand from past academic calendar data and timetable spikes.",
            "effort": "L",  # 4 points
            "impact": 3,
            "priority": "could",
            "innovative": True,
        },
    ]

    budget_points = round(team_size * minutes_available * 0.5 / 20.0, 1)
    effort_map = {"S": 1.0, "M": 2.0, "L": 4.0}
    used_points = sum(
        effort_map[f["effort"]]
        for f in features
        if f["priority"] in ("must", "should")
    )
    used_points = round(used_points, 1)

    if used_points <= budget_points:
        verdict = "realistic"
    elif used_points <= 1.3 * budget_points:
        verdict = "tight"
    else:
        verdict = "overscoped"

    score = 100 if used_points == 0 else round(100 * min(1.0, budget_points / used_points))

    feasibility = {
        "score": score,
        "verdict": verdict,
        "budget_points": budget_points,
        "used_points": used_points,
        "message": f"Project scope is {verdict} for a team of {team_size} with {minutes_available} minutes available.",
    }

    phases = [
        {
            "phase": "understand",
            "title": "Problem Alignment & Scope",
            "minutes": phase_mins[0],
            "activities": ["Deconstruct canteen food waste drivers", "List assumptions and constraints"],
            "outcome": "Clear shared problem framing and non-negotiables.",
        },
        {
            "phase": "users",
            "title": "User Personas & Workflows",
            "minutes": phase_mins[1],
            "activities": ["Map student booking journey", "Map kitchen staff prep timeline"],
            "outcome": "Validated user pain points and pick-up scenarios.",
        },
        {
            "phase": "ideate",
            "title": "Architecture & Trade-offs",
            "minutes": phase_mins[2],
            "activities": ["Evaluate pre-booking vs flash alerts", "Finalize data schemas"],
            "outcome": "Agreed technical design and API contracts.",
        },
        {
            "phase": "build",
            "title": "MVP Implementation",
            "minutes": phase_mins[3],
            "activities": ["Implement booking form", "Build kitchen summary view", "Integrate endpoints"],
            "outcome": "Working end-to-end prototype on local server.",
        },
        {
            "phase": "validate",
            "title": "Testing & Edge Cases",
            "minutes": phase_mins[4],
            "activities": ["Simulate simultaneous bookings", "Test surplus alert push flow"],
            "outcome": "Verified happy path and bug-free demo readiness.",
        },
        {
            "phase": "pitch",
            "title": "Pitch & Demo Rehearsal",
            "minutes": phase_mins[5],
            "activities": ["Prepare 6 jury slides", "Run end-to-end demo dry run"],
            "outcome": "Polished presentation and confident delivery.",
        },
    ]

    tasks = [
        {"id": "t1", "phase": "understand", "title": "Map daily food prep lifecycle", "owner_role": "Integrator", "minutes": task_mins[0], "done": False},
        {"id": "t2", "phase": "users", "title": "Create student and kitchen personas", "owner_role": "Frontend", "minutes": task_mins[1], "done": False},
        {"id": "t3", "phase": "ideate", "title": "Define meal slot booking schema", "owner_role": "AI", "minutes": task_mins[2], "done": False},
        {"id": "t4", "phase": "build", "title": "Build meal reservation API", "owner_role": "Backend", "minutes": task_mins[3], "done": False},
        {"id": "t5", "phase": "build", "title": "Create student slot booking UI", "owner_role": "Frontend", "minutes": task_mins[4], "done": False},
        {"id": "t6", "phase": "build", "title": "Build live kitchen headcount dashboard", "owner_role": "Backend", "minutes": task_mins[5], "done": False},
        {"id": "t7", "phase": "build", "title": "Implement surplus food broadcast banner", "owner_role": "Frontend", "minutes": task_mins[6], "done": False},
        {"id": "t8", "phase": "validate", "title": "End-to-end order flow and quota validation", "owner_role": "Integrator", "minutes": task_mins[7], "done": False},
        {"id": "t9", "phase": "pitch", "title": "Draft 6-slide jury presentation", "owner_role": "AI", "minutes": task_mins[8], "done": False},
        {"id": "t10", "phase": "pitch", "title": "Dry run demo and prepare jury answers", "owner_role": "Integrator", "minutes": task_mins[9], "done": False},
    ]

    checkpoints = [
        {"at_minute": cp_mins[0], "check": "Problem scope and assumptions documented", "how": "Review problem statement summary and out-of-scope boundaries."},
        {"at_minute": cp_mins[1], "check": "API contract and DB schema defined", "how": "Verify request/response structures between frontend and backend."},
        {"at_minute": cp_mins[2], "check": "End-to-end booking happy path functional", "how": "Reserve a meal token and verify live kitchen dashboard update."},
        {"at_minute": cp_mins[3], "check": "Pitch slides and live demo verified", "how": "Complete dry run presentation within 3-minute time limit."},
    ]

    return {
        "session_id": None,
        "source": "stub",
        "problem": {
            "summary": "Campus dining halls face massive food wastage daily due to unpredictable student turnout. A smart demand-forecasting and surplus-redistribution system can optimize prep volumes, minimize kitchen waste, and route leftover food to hungry students safely before expiry.",
            "domain": "Food Sustainability & Campus Operations",
            "who_is_affected": [
                "Hostel and day-scholar students seeking affordable meals",
                "Kitchen managers and cooks balancing cooking quotas",
                "Campus sustainability officers tracking food waste metrics",
            ],
            "why_it_matters": "Over 35% of daily prepared canteen meals are discarded while hundreds of students miss out on affordable nutrition. Reducing waste saves kitchen costs and promotes sustainability.",
            "stakeholders": [
                {"name": "Canteen Head Cook", "interest": "Accurate meal counts prior to food preparation", "influence": "high"},
                {"name": "College Students", "interest": "Guaranteed hot meals without long queues", "influence": "high"},
                {"name": "Campus Administration", "interest": "Reduced waste disposal overhead and operational costs", "influence": "medium"},
            ],
            "key_questions": [
                "How can students pre-order meal slots at least 2 hours in advance?",
                "How does the kitchen receive and visualize aggregate orders in real time?",
                "What safety and hygiene checks ensure surplus meals are redistributed safely?",
                "How do we handle late cancellations without adding to waste?",
                "Can dietary preferences and portion sizes be factored into batch cooking?",
                "What incentive ensures high student adoption of pre-booking?",
            ],
            "assumptions": [
                "Assumption: Students have reliable smartphone access to reserve meal slots.",
                "Assumption: Kitchen staff can operate a simplified digital counter in the prep area.",
                "Assumption: College dining halls operate on fixed lunch and dinner time windows.",
            ],
        },
        "expected_solution": {
            "goal": "Build a lightweight web platform enabling slot-based meal reservations and real-time surplus redistribution to reduce canteen waste by 40%.",
            "success_criteria": [
                "Pre-booking flow completed in under 30 seconds by students",
                "Kitchen counter updates live headcount with zero manual calculation",
                "Surplus notification dispatched at least 30 minutes before kitchen closure",
            ],
            "approach_options": [
                {
                    "name": "Slot-Based Pre-Ordering Window",
                    "how_it_works": "Students reserve meal tokens 2 hours ahead; kitchen cooks precisely to quota.",
                    "tradeoff": "Guarantees zero over-prep but requires behavioral discipline from students.",
                },
                {
                    "name": "Dynamic Surplus Flash Alert",
                    "how_it_works": "Kitchen posts remaining portions 30 minutes prior to closing at 50% discount.",
                    "tradeoff": "Rapidly clears excess cooked food but does not prevent initial over-cooking.",
                },
                {
                    "name": "Predictive Batching using Historic Logs",
                    "how_it_works": "Estimates expected turnout using weekday patterns and exam schedules.",
                    "tradeoff": "Zero user friction but relies heavily on historical data availability.",
                },
            ],
            "out_of_scope": [
                "Payment gateway integration and monetary refunds",
                "Ingredient supplier procurement and warehouse inventory",
                "Third-party doorstep delivery logistics",
            ],
        },
        "personas": [
            {
                "name": "Rohan",
                "role": "Third-Year Engineering Student",
                "goal": "Get fresh lunch quickly between back-to-back lab classes",
                "pain_point": "Arrives at the canteen to find long lines or his preferred meal sold out",
                "how_to_validate": "Survey 10 classmates about daily lunch waiting times and queue frustrations",
            },
            {
                "name": "Mrs. Shinde",
                "role": "Canteen Head Cook",
                "goal": "Prepare sufficient food without dumping trays of uneaten meals at night",
                "pain_point": "Has no visibility into daily attendance fluctuations before lighting stoves",
                "how_to_validate": "Shadow kitchen morning prep and measure daily leftover food weights",
            },
        ],
        "tech": [
            {
                "layer": "Frontend",
                "options": ["React 18 + Vite", "Vanilla HTML/CSS/JS"],
                "recommended": "React 18 + Vite",
                "why": "Component reusability for live dashboard and responsive student UI",
                "tradeoff": "Requires client build step and node environment",
            },
            {
                "layer": "Backend",
                "options": ["FastAPI (Python)", "Flask", "Express"],
                "recommended": "FastAPI (Python)",
                "why": "High performance, async support, and native Pydantic schema validation",
                "tradeoff": "Requires Python 3.10+ async knowledge",
            },
            {
                "layer": "Database",
                "options": ["SQLite", "PostgreSQL"],
                "recommended": "SQLite",
                "why": "Zero configuration, file-based persistence ideal for local hackathon demos",
                "tradeoff": "Single-file concurrency limits high write throughput",
            },
        ],
        "mvp": {
            "goal": "A working web app where students pre-order meal tokens and the kitchen dashboard updates instant batch totals.",
            "must_have": [
                {
                    "id": "m1",
                    "name": "Student Meal Slot Booking",
                    "acceptance_criteria": [
                        "Select lunch time slot (e.g. 12:30-1:00 PM)",
                        "Choose meal type (Regular / Special)",
                        "Receive instant confirmation with a unique token ID",
                    ],
                },
                {
                    "id": "m2",
                    "name": "Kitchen Live Headcount Dashboard",
                    "acceptance_criteria": [
                        "Display aggregate meal counts grouped by time slot",
                        "Update counters in real time upon new bookings",
                    ],
                },
                {
                    "id": "m3",
                    "name": "Surplus Redistribution Broadcast",
                    "acceptance_criteria": [
                        "Kitchen staff enters surplus quantity and triggers broadcast",
                        "Active surplus banner appears immediately on student interface",
                    ],
                },
            ],
            "nice_to_have": [
                "QR code scanner for token collection",
                "Dietary and allergen preference tags",
                "Weekly analytics charts for kitchen waste trends",
            ],
            "demo_path": [
                "Open student view and reserve 12:30 PM lunch token",
                "Receive token confirmation code",
                "Switch to kitchen dashboard to observe incremented meal count",
                "Trigger surplus broadcast with 15 remaining meals",
                "Observe instant surplus banner alert on student UI",
            ],
        },
        "workflow": phases,
        "tasks": tasks,
        "checkpoints": checkpoints,
        "features": features,
        "feasibility": feasibility,
        "innovation_prompts": [
            "Could unreserved meals automatically trigger a push alert to hostel group chats 30 minutes before closing?",
            "Can student attendance in biometric logs nudge the canteen demand forecast?",
        ],
        "demo_tips": [
            "Start with the student pre-booking screen on mobile viewport",
            "Have kitchen dashboard open side-by-side to show real-time count change",
            "Highlight the surplus notification banner as the impactful finale",
        ],
        "jury_outline": [
            {
                "slide": 1,
                "title": "Problem & Impact",
                "talking_point": "35% of canteen food is wasted daily due to blind preparation estimates.",
                "proof": "Daily waste logs and student queue surveys showing peak mismatch.",
            },
            {
                "slide": 2,
                "title": "Target Users & Pain Points",
                "talking_point": "Students want quick food; cooks want predictable cooking quotas.",
                "proof": "Two distinct personas: Rohan (busy student) and Mrs. Shinde (head cook).",
            },
            {
                "slide": 3,
                "title": "Proposed Solution",
                "talking_point": "Two-pronged system: pre-order slot booking and dynamic surplus alerts.",
                "proof": "Architecture diagram illustrating student and kitchen synchronization.",
            },
            {
                "slide": 4,
                "title": "Live MVP Demo",
                "talking_point": "End-to-end reservation flow updating kitchen quotas in real-time.",
                "proof": "Live demonstration of booking a meal and triggering surplus alerts.",
            },
            {
                "slide": 5,
                "title": "Technical Feasibility & Scope",
                "talking_point": "Built with lightweight FastAPI and SQLite for fast, robust delivery.",
                "proof": "Feasibility metrics showing completed must-have features within time budget.",
            },
            {
                "slide": 6,
                "title": "Scalability & Roadmap",
                "talking_point": "Expansion to multiple campus dining halls and automated NGO handoffs.",
                "proof": "Clear post-hackathon milestones for payment integration and analytics.",
            },
        ],
        "your_call": [
            {
                "question": "Should pre-ordering be mandatory or optional with an express queue incentive?",
                "options": [
                    "Express pickup line incentive for pre-orders while keeping counter open",
                    "Strict mandatory pre-ordering with 1-hour cutoff before meal service",
                ],
            },
            {
                "question": "How should surplus food be redistributed: free giveaway or discounted flash sale?",
                "options": [
                    "Free redistribution to student volunteers and support staff",
                    "50% discounted flash sale to recover kitchen raw material costs",
                ],
            },
        ],
    }


def mentor_reply(brief: dict, history: list, message: str, stage: str, team: dict) -> dict:
    """Provide coaching reply with guardrail against writing complete code."""
    clean_msg = redact(message)
    # Check guardrail: asks for full/complete code, solution, app, project, or "do it for us"
    guardrail_pattern = r"(full|complete)\s+(code|solution|app|project)|do it for us"
    if re.search(guardrail_pattern, clean_msg, re.IGNORECASE):
        return {
            "reply": "I am your hackathon mentor and coach. My role is to help your team think through problem structure, evaluate architectural trade-offs, and prioritize scope. I do not write full code or implement entire projects for you. What specific architectural decision or blocker would you like to explore together?",
            "stage": stage,
            "follow_up_questions": [
                "Which specific component or interface is currently blocking your progress?",
                "Would you like to examine 2-3 design options for this feature?",
            ],
            "guardrail_triggered": True,
            "source": "stub",
        }

    # Stage-aware coaching response (max 150 words)
    replies = {
        "understand": "Focus on clearly framing the core problem statement. Have you confirmed the primary pain points with your target stakeholders and identified what is strictly out of scope?",
        "users": "Strong solutions start with realistic personas. Ensure you have identified at least one primary user and one operational stakeholder, along with how you can validate their pain points quickly.",
        "ideate": "When considering approach options, weigh the trade-offs between implementation complexity and user adoption. Which constraint is your team prioritizing for this hackathon?",
        "build": "Keep your MVP lean! Prioritize the 3 core must-have features needed for a compelling end-to-end demo before touching nice-to-haves. What is your happy path demo flow?",
        "validate": "Testing during a hackathon means verifying edge cases and ensuring your demo never breaks on stage. Have you tested unexpected inputs or network delays?",
        "pitch": "For the jury pitch, lead with the problem and evidence, show your live demo working end-to-end, and highlight key technical trade-offs you navigated. Keep slides concise!",
    }

    reply_text = replies.get(
        stage,
        "Keep moving forward systematically. Break the challenge into smaller steps and focus on high-impact MVP deliverables."
    )

    return {
        "reply": reply_text,
        "stage": stage,
        "follow_up_questions": [
            "What assumption is your team testing right now?",
            "How does this step support your end-to-end demo flow?",
        ],
        "guardrail_triggered": False,
        "source": "stub",
    }


def judge(brief: dict, submission: dict, team: dict) -> dict:
    """Evaluate submission against 5 fixed criteria and return JudgeReport dict."""
    criteria_names = [
        "Problem clarity",
        "Works end to end",
        "Scope realism",
        "Innovation and practicality",
        "Can you explain it",
    ]

    scores = [4, 4, 3, 4, 4]
    overall = round(100 * sum(scores) / 25)

    if overall >= 80:
        readiness = "ready"
    elif overall >= 60:
        readiness = "almost_ready"
    else:
        readiness = "needs_work"

    criteria = [
        {
            "name": criteria_names[0],
            "score": scores[0],
            "evidence": "Clear problem statement and stakeholder mapping defined in the submission.",
            "improve": "Quantify the daily cost and environmental impact of food waste in the opening slide.",
        },
        {
            "name": criteria_names[1],
            "score": scores[1],
            "evidence": "Working end-to-end reservation flow shown from student booking to kitchen update.",
            "improve": "Add clear visual feedback when a meal slot reaches capacity.",
        },
        {
            "name": criteria_names[2],
            "score": scores[2],
            "evidence": "Three focused must-haves prioritized for the demo without extraneous features.",
            "improve": "Clearly state that payment processing and external delivery are deferred post-hackathon.",
        },
        {
            "name": criteria_names[3],
            "score": scores[3],
            "evidence": "Surplus redistribution broadcast addresses food waste practically with high feasibility.",
            "improve": "Consider adding simple batch demand forecasting based on weekday schedules.",
        },
        {
            "name": criteria_names[4],
            "score": scores[4],
            "evidence": "Team articulates trade-offs between mandatory booking and student adoption well.",
            "improve": "Rehearse the live demo transitions so every team member speaks within the time limit.",
        },
    ]

    likely_questions = [
        {
            "question": "How will you handle students who pre-order but fail to show up?",
            "why_asked": "Jury wants to see if you have planned for user behavior edge cases.",
            "answer_hint": "Explain the release window policy: unclaimed meals are released for surplus broadcast 15 minutes before closing.",
        },
        {
            "question": "Why did you choose SQLite over a distributed database for this solution?",
            "why_asked": "Jury evaluates architectural pragmatism and hackathon constraints.",
            "answer_hint": "Highlight SQLite's zero-config local reliability for hackathon validation, with clean migration path to PostgreSQL.",
        },
        {
            "question": "How does the kitchen staff interact with the dashboard during busy prep hours?",
            "why_asked": "Assesses operational feasibility and real-world kitchen environment.",
            "answer_hint": "Mention high-contrast large-font UI designed for low-friction touch interaction in the kitchen.",
        },
        {
            "question": "What happens if campus Wi-Fi drops during lunch hour?",
            "why_asked": "Checks resilience to real-world infrastructure failures.",
            "answer_hint": "Tokens can be cached locally or verified via offline token codes generated upon booking.",
        },
        {
            "question": "How would you scale this platform to multiple campus cafeterias?",
            "why_asked": "Probes long-term architecture and multi-tenant capabilities.",
            "answer_hint": "Demonstrate the multi-venue schema design and centralized admin analytics aggregation.",
        },
    ]

    top_improvements = [
        {
            "action": "Add prominent visual confirmation message when meal slot reservation completes",
            "minutes": 15,
        },
        {
            "action": "Include explicit disclaimer in pitch slide regarding out-of-scope payment gateway",
            "minutes": 10,
        },
        {
            "action": "Rehearse demo timing to ensure presentation finishes in under 3 minutes",
            "minutes": 15,
        },
    ]

    return {
        "overall": overall,
        "readiness": readiness,
        "criteria": criteria,
        "likely_questions": likely_questions,
        "top_improvements": top_improvements,
        "disclaimer": "Practice check against a transparent rubric. It does not predict real jury scores.",
        "source": "stub",
    }
