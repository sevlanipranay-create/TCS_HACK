# tests/fake_server.py
"""
Throwaway test server implementing the Contract Block v2.1 HTTP API.
Used to validate contract_check.py and e2e_demo.py before backend/main.py is ready.
"""
import json
import math
import re
from datetime import datetime, timezone
from typing import Dict, List, Optional

from fastapi import FastAPI, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import ValidationError

from contract.models import (
    Approach,
    Brief,
    BriefRequest,
    ChatMessage,
    ChatRequest,
    ChatResponse,
    Checkpoint,
    CheckpointState,
    CriterionScore,
    DecisionPoint,
    ExpectedSolution,
    Feature,
    Feasibility,
    Improvement,
    JudgeReport,
    JudgeRequest,
    JuryQuestion,
    JurySlide,
    MustHave,
    MVP,
    NextTask,
    Persona,
    Phase,
    PhaseProgress,
    ProblemExplained,
    Progress,
    SessionView,
    Stakeholder,
    Task,
    TaskState,
    TaskUpdate,
    TeamContext,
    TechOption,
)
from database import repository

app = FastAPI(title="Hackathon Mentor AI - Fake Test Server")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def redact(text: str) -> str:
    text = re.sub(r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+", "[REDACTED_EMAIL]", text)
    text = re.sub(r"(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}", "[REDACTED_PHONE]", text)
    return text


@app.on_event("startup")
def startup():
    repository.init()


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.get("/api/samples")
def get_samples():
    with open("tests/samples.json", "r", encoding="utf-8") as f:
        samples = json.load(f)
    return {"samples": samples[:3]}


@app.post("/api/brief", response_model=Brief)
def post_brief(req: BriefRequest):
    raw_statement = req.problem_statement
    redacted_statement = redact(raw_statement)
    team = req.team

    is_overscoped = "metaverse" in raw_statement.lower() or "blockchain" in raw_statement.lower() or team.minutes_available <= 30
    is_study = "study" in raw_statement.lower() or "t2_study" in raw_statement.lower()

    domain = "Peer Learning & Academic Communities" if is_study else ("Campus Infrastructure & Smart Canteen" if not is_overscoped else "Metaverse & Web3 Systems")

    has_react = any("react" in s.lower() for s in team.skills)
    fe_rec = "React + Vite" if has_react else "Vanilla JavaScript / HTML5"

    features: List[Feature] = [
        Feature(
            name="Core Dashboard & Status Board",
            why="Displays live operational data to users",
            effort="S",
            impact=5,
            priority="must",
            innovative=False,
        ),
        Feature(
            name="Interactive Token / Order Flow",
            why="Coordinates real-time transactions without queues",
            effort="M",
            impact=4,
            priority="must",
            innovative=False,
        ),
        Feature(
            name="Offline-Resilient Sync Buffer",
            why="Maintains order continuity when connectivity dips",
            effort="M",
            impact=4,
            priority="should",
            innovative=True,
        ),
        Feature(
            name="Predictive Queue Demand Estimator",
            why="Projects crowd spikes ahead of time",
            effort="L" if is_overscoped else "S",
            impact=3,
            priority="must" if is_overscoped else "could",
            innovative=True,
        ),
    ]

    if is_overscoped:
        features.append(Feature(name="Biometric 3D Avatar Auth", why="Simulates campus avatar identity", effort="L", impact=2, priority="must", innovative=True))
        features.append(Feature(name="CCTV Computer Vision Drone Sync", why="Automates crowd telemetry", effort="L", impact=2, priority="must", innovative=True))

    effort_map = {"S": 1.0, "M": 2.0, "L": 4.0}
    budget_points = round(team.team_size * team.minutes_available * 0.5 / 20.0, 1)
    used_points = round(sum(effort_map[f.effort] for f in features if f.priority in ["must", "should"]), 1)

    if used_points <= budget_points:
        verdict = "realistic"
    elif used_points <= 1.3 * budget_points:
        verdict = "tight"
    else:
        verdict = "overscoped"

    score = 100 if used_points == 0 else round(100 * min(1.0, budget_points / used_points))
    feasibility = Feasibility(
        score=score,
        verdict=verdict,
        budget_points=budget_points,
        used_points=used_points,
        message=f"Team budget is {budget_points} pts. Selected must/should features consume {used_points} pts.",
    )

    # Workflow 6 phases
    total_min = team.minutes_available
    p1 = max(1, round(total_min * 0.15))
    p2 = max(1, round(total_min * 0.15))
    p3 = max(1, round(total_min * 0.15))
    p4 = max(1, round(total_min * 0.35))
    p5 = max(1, round(total_min * 0.10))
    p6 = total_min - (p1 + p2 + p3 + p4 + p5)
    if p6 < 1:
        p4 -= (1 - p6)
        p6 = 1

    workflow = [
        Phase(phase="understand", title="Problem Discovery & Scope Clarification", minutes=p1, activities=["Restate challenge in plain language", "Identify user pain points"], outcome="Clear problem frame"),
        Phase(phase="users", title="Persona Definition & Validation", minutes=p2, activities=["Interview key stakeholders", "Validate assumption list"], outcome="Confirmed user priorities"),
        Phase(phase="ideate", title="Architecture & Trade-off Selection", minutes=p3, activities=["Compare technical approaches", "Select MVP scope boundary"], outcome="Locked approach"),
        Phase(phase="build", title="Core Implementation Sprint", minutes=p4, activities=["Construct core user journey", "Wire up data layer"], outcome="Working end-to-end prototype"),
        Phase(phase="validate", title="Edge Case Verification & Testing", minutes=p5, activities=["Run manual integration test", "Check failure boundaries"], outcome="Test evidence"),
        Phase(phase="pitch", title="Demo Rehearsal & Jury Pitch", minutes=p6, activities=["Dry run 5-minute live demo", "Prepare answers for likely jury questions"], outcome="Rehearsed pitch"),
    ]

    # Tasks 8 to 14, total <= 85% of minutes_available
    max_task_min = int(total_min * 0.80)
    per_task_min = max(2, max_task_min // 10)
    stages_cycle = ["understand", "users", "ideate", "build", "build", "build", "build", "validate", "pitch", "pitch"]
    roles_cycle = ["Integrator", "AI", "Frontend", "Frontend", "Backend", "Backend", "Integrator", "Integrator", "Frontend", "Backend"]

    tasks: List[Task] = []
    for idx in range(10):
        t_id = f"t{idx+1}"
        phase_name = stages_cycle[idx]
        role_name = roles_cycle[idx]
        tasks.append(
            Task(
                id=t_id,
                phase=phase_name,
                title=f"Sprint Task {idx+1}: Execute {phase_name} milestone",
                owner_role=role_name,
                minutes=per_task_min,
                done=False,
            )
        )

    # Checkpoints: 4 ascending
    c1 = round(total_min * 0.20)
    c2 = round(total_min * 0.40)
    c3 = round(total_min * 0.70)
    c4 = round(total_min * 0.90)
    checkpoints = [
        Checkpoint(at_minute=c1, check="Scope & Problem Validation Checkpoint", how="Confirm problem statement and persona pain points are validated."),
        Checkpoint(at_minute=c2, check="Architecture & Contract Freeze", how="Verify backend contracts and frontend route skeletons match."),
        Checkpoint(at_minute=c3, check="First End-to-End Walkthrough", how="Run through primary happy path on real data."),
        Checkpoint(at_minute=c4, check="Demo Polish & Practice Pitch", how="Time 5-minute demo run and confirm backup screenshots exist."),
    ]

    must_haves = [
        MustHave(id="m1", name="Quick Order / Request Submission", acceptance_criteria=["User can submit an order in < 15 seconds", "Valid token ID returned immediately"]),
        MustHave(id="m2", name="Live Queue & Status Dashboard", acceptance_criteria=["Displays live counter status with color-coded delay bands", "Refreshes automatically"]),
        MustHave(id="m3", name="Kitchen / Coordinator Fulfillment View", acceptance_criteria=["Operator can mark item as preparing or ready", "Updates status board in real time"]),
        MustHave(id="m4", name="Resilient Local Storage Fallback", acceptance_criteria=["Unsynced requests saved in browser session storage", "Retries when back online"]),
    ]

    demo_path = [
        "Step 1: Student opens dashboard and observes current queue wait time.",
        "Step 2: Student inputs custom request and receives active pickup token.",
        "Step 3: Coordinator interface displays incoming order ticket.",
        "Step 4: Coordinator advances ticket status to ready.",
        "Step 5: Student confirms pickup with matching token number.",
    ]

    brief_data = Brief(
        session_id=None,
        source="rules",
        problem=ProblemExplained(
            summary="A streamlined solution to resolve campus dining bottlenecks through live queue metrics and instant pre-ordering.",
            domain=domain,
            who_is_affected=["Undergraduate students", "Faculty members", "Canteen kitchen staff", "Campus facilities coordinators"],
            why_it_matters="Long lunch queues waste productive hours and create chaotic surges for kitchen workers.",
            stakeholders=[
                Stakeholder(name="Students", interest="Quick lunch pickup between lectures", influence="high"),
                Stakeholder(name="Canteen Staff", interest="Predictable kitchen preparation batches", influence="high"),
                Stakeholder(name="Campus Admin", interest="Orderly facilities without congestion", influence="medium"),
            ],
            key_questions=[
                "How do students know kitchen capacity before ordering?",
                "What prevents duplicate or fraudulent token pickups?",
                "How do kitchen workers handle sudden ingredient shortages?",
                "Can the solution operate with weak campus Wi-Fi?",
                "How will team demo this within 5 minutes?",
            ],
            assumptions=[
                "Assumption: Students possess personal smartphones with modern browsers.",
                "Assumption: Canteen operators can view a simple browser screen on a tablet or phone.",
                "Assumption: Lunch peaks occur in predictable 45-minute windows.",
            ],
        ),
        expected_solution=ExpectedSolution(
            goal="Provide frictionless pre-ordering and visible crowd signals to eliminate physical queues.",
            success_criteria=[
                "Reduce average physical wait time from 35 mins to under 8 mins",
                "Ensure order processing latency stays under 500 ms",
                "Maintain 100% data continuity during brief network drops",
            ],
            approach_options=[
                Approach(name="Progressive Web App with Local Token Store", how_it_works="Web app stores token locally and pings server status", tradeoff="Requires browser storage access but needs zero app store installs"),
                Approach(name="SMS / WhatsApp Bot Notification", how_it_works="Interacts via webhook messages", tradeoff="Zero client footprint but incurs per-message latency"),
            ],
            out_of_scope=[
                "Multi-campus franchise payment routing",
                "Hardware POS cash register integration",
                "Autonomous delivery drone dispatch",
            ],
        ),
        personas=[
            Persona(name="Aarav Sharma", role="Second Year Engineering Student", goal="Grab lunch within a 20-minute gap between lab sessions", pain_point="Spends entire lunch break standing in slow-moving line", how_to_validate="Interview 5 classmates during tomorrow's noon break"),
            Persona(name="Sunita Rao", role="Senior Canteen Kitchen Manager", goal="Pace cooking orders in predictable 10-minute batches", pain_point="Sudden chaotic rushes lead to burnt food and angry customers", how_to_validate="Shadow counter staff for 15 minutes during peak service"),
        ],
        tech=[
            TechOption(layer="Frontend", options=["React + Vite", "Vanilla JavaScript", "Svelte"], recommended=fe_rec, why="Fits team's declared skill set and enables fast reactive state updates", tradeoff="Slight build setup vs instant vanilla scripts"),
            TechOption(layer="Backend API", options=["FastAPI (Python)", "Flask", "Node.js Express"], recommended="FastAPI (Python)", why="Auto-generates OpenAPI docs and provides robust typed contracts", tradeoff="Requires Python runtime"),
            TechOption(layer="Persistence", options=["SQLite (WAL mode)", "JSON Flat File", "PostgreSQL"], recommended="SQLite (WAL mode)", why="Zero configuration, ACID-compliant local database", tradeoff="Single-node file storage"),
        ],
        mvp=MVP(
            goal="Demonstrate full cycle from order placement to counter fulfillment with live queue indicators.",
            must_have=must_haves,
            nice_to_have=["SMS notification trigger", "Analytics heatmap of peak crowd times"],
            demo_path=demo_path,
        ),
        workflow=workflow,
        tasks=tasks,
        checkpoints=checkpoints,
        features=features,
        feasibility=feasibility,
        innovation_prompts=[
            "Consider an offline QR code token that kitchen staff can scan even if campus Wi-Fi drops.",
            "Display an estimated preparation time countdown instead of a static queue position number.",
        ],
        demo_tips=[
            "Prepare two browser windows side-by-side: student order view on the left, kitchen coordinator view on the right.",
            "Highlight the offline resilience by disabling network in DevTools during an order submission.",
        ],
        jury_outline=[
            JurySlide(slide=1, title="Problem & Field Evidence", talking_point="35-minute cafeteria bottlenecks waste student time daily.", proof="Photos of peak lunch queues and survey of 45 campus respondents."),
            JurySlide(slide=2, title="User Personas & Key Pain Point", talking_point="Aarav has 20 minutes between classes; Sunita is overwhelmed in the kitchen.", proof="Validated persona profiles with direct quotes."),
            JurySlide(slide=3, title="Core Architecture & Tech Stack", talking_point="Lightweight PWA + FastAPI with typed contract validation.", proof="Real-time synchronized data flow across student and counter views."),
            JurySlide(slide=4, title="Live Working Demonstration", talking_point="Watch an order move from placement to kitchen fulfillment in 10 seconds.", proof="Interactive live demo on stage."),
            JurySlide(slide=5, title="Feasibility & Edge Cases", talking_point="Engineered for offline campus network drops with zero-config SQLite.", proof="Graceful fallback test passed."),
            JurySlide(slide=6, title="Impact & Future Horizon", talking_point="Scalable across campus canteens, stationery shops, and library desks.", proof="Clear next-step roadmap."),
        ],
        your_call=[
            DecisionPoint(question="Order Payment Model", options=["Pay online during token generation", "Pay cash/UPI at dedicated collection counter"]),
            DecisionPoint(question="Queue Display Granularity", options=["Exact queue number position (e.g., #14)", "Estimated waiting band (e.g., 5-10 mins)"]),
        ],
    )

    # Persist session
    session_id = repository.create_session(redacted_statement, team.model_dump(), brief_data.model_dump())
    brief_data.session_id = session_id
    return brief_data


@app.post("/api/chat", response_model=ChatResponse)
def post_chat(req: ChatRequest):
    sess = repository.get_session(req.session_id)
    if not sess:
        raise HTTPException(status_code=404, detail=f"Session '{req.session_id}' not found")

    msg = req.message.strip()
    redacted_msg = redact(msg)
    repository.add_message(req.session_id, "user", redacted_msg, req.stage)

    # Guardrail check
    msg_lower = redacted_msg.lower()
    dump_patterns = [
        "write the complete code",
        "full solution",
        "entire project",
        "give me the code",
        "write all code",
        "dump code",
        "full implementation",
        "complete python",
        "complete react",
    ]
    is_dump = any(p in msg_lower for p in dump_patterns) or ("complete" in msg_lower and "code" in msg_lower) or ("write" in msg_lower and "code" in msg_lower and "entire" in msg_lower)

    if is_dump:
        reply = (
            "As your hackathon mentor, I am here to coach your team through architecture, trade-offs, and debugging—not to write your project code. "
            "Writing the complete solution is your team's responsibility. Let us break down your next task: what specific component or interface boundary are you currently tackling?"
        )
        guardrail = True
        follow_ups = [
            "Which layer (frontend, backend, or database) needs your focus right now?",
            "What is the single most uncertain interface between your modules?",
        ]
    else:
        guardrail = False
        reply = (
            f"Focusing on the {req.stage} phase: prioritize crisp user boundaries and testable milestones. "
            "Consider what 2 to 3 practical options you can compare before committing to implementation. Remember that simplicity wins in a hackathon demo."
        )
        follow_ups = [
            "How will you validate this assumption with a real user today?",
            "What is the simplest edge case that could break your current design?",
        ]

    repository.add_message(req.session_id, "mentor", reply, req.stage)

    return ChatResponse(
        reply=reply,
        stage=req.stage,
        follow_up_questions=follow_ups,
        guardrail_triggered=guardrail,
        source="rules",
    )


@app.get("/api/sessions/{session_id}", response_model=SessionView)
def get_session_view(session_id: str):
    sess = repository.get_session(session_id)
    if not sess:
        raise HTTPException(status_code=404, detail=f"Session '{session_id}' not found")

    task_states = repository.get_task_states(session_id)
    raw_brief = sess["brief"]
    # Merge task ticks into brief.tasks
    if "tasks" in raw_brief:
        for t in raw_brief["tasks"]:
            t["done"] = task_states.get(t["id"], False)

    messages = [
        ChatMessage(
            role=m["role"],
            content=m["content"],
            stage=m["stage"],
            created_at=m["created_at"],
        )
        for m in repository.list_messages(session_id)
    ]

    last_judge = None
    if sess["last_judge"]:
        try:
            last_judge = JudgeReport.model_validate(sess["last_judge"])
        except Exception:
            last_judge = None

    return SessionView(
        session_id=sess["id"],
        created_at=sess["created_at"],
        problem_statement=sess["problem"],
        team=TeamContext.model_validate(sess["team"]),
        brief=Brief.model_validate(raw_brief),
        messages=messages,
        last_judge=last_judge,
    )


@app.patch("/api/sessions/{session_id}/tasks/{task_id}", response_model=TaskState)
def patch_task(session_id: str, task_id: str, update: TaskUpdate):
    sess = repository.get_session(session_id)
    if not sess:
        raise HTTPException(status_code=404, detail=f"Session '{session_id}' not found")

    tasks = sess["brief"].get("tasks", [])
    valid_task_ids = {t["id"] for t in tasks}
    if task_id not in valid_task_ids:
        raise HTTPException(status_code=404, detail=f"Task '{task_id}' not found in session brief")

    repository.set_task_done(session_id, task_id, update.done)
    return TaskState(task_id=task_id, done=update.done)


@app.get("/api/sessions/{session_id}/progress", response_model=Progress)
def get_progress(session_id: str, elapsed_min: Optional[int] = Query(None, ge=0)):
    sess = repository.get_session(session_id)
    if not sess:
        raise HTTPException(status_code=404, detail=f"Session '{session_id}' not found")

    team = sess["team"]
    minutes_total = team.get("minutes_available", 75)

    if elapsed_min is not None:
        minutes_elapsed = elapsed_min
    else:
        created_dt = datetime.fromisoformat(sess["created_at"].replace("Z", "+00:00"))
        now_dt = datetime.now(timezone.utc)
        minutes_elapsed = math.floor((now_dt - created_dt).total_seconds() / 60)

    minutes_elapsed = max(0, min(minutes_total, minutes_elapsed))

    task_states = repository.get_task_states(session_id)
    tasks = sess["brief"].get("tasks", [])

    total_task_minutes = sum(t["minutes"] for t in tasks)
    done_task_minutes = sum(t["minutes"] for t in tasks if task_states.get(t["id"], False))
    tasks_done_count = sum(1 for t in tasks if task_states.get(t["id"], False))

    percent_done = round(100 * done_task_minutes / total_task_minutes) if total_task_minutes > 0 else 0
    expected_percent = round(100 * minutes_elapsed / minutes_total) if minutes_total > 0 else 0

    if percent_done < expected_percent - 15:
        progress_status = "behind"
    elif percent_done > expected_percent + 15:
        progress_status = "ahead"
    else:
        progress_status = "on_track"

    # next_task = first not-done task in brief order
    next_task = None
    for t in tasks:
        if not task_states.get(t["id"], False):
            next_task = NextTask(id=t["id"], title=t["title"], owner_role=t["owner_role"])
            break

    # by_phase lists phases in Stage order and skips phases that have no tasks
    stage_order = ["understand", "users", "ideate", "build", "validate", "pitch"]
    by_phase: List[PhaseProgress] = []
    for stage in stage_order:
        stage_tasks = [t for t in tasks if t["phase"] == stage]
        if stage_tasks:
            stage_done = sum(1 for t in stage_tasks if task_states.get(t["id"], False))
            by_phase.append(PhaseProgress(phase=stage, done=stage_done, total=len(stage_tasks)))

    # checkpoints: "passed" if at_minute < minutes_elapsed; "due_now" if minutes_elapsed <= at_minute <= minutes_elapsed + 5; else "upcoming"
    checkpoints_data = sess["brief"].get("checkpoints", [])
    checkpoints_state: List[CheckpointState] = []
    for c in checkpoints_data:
        at_min = c["at_minute"]
        if at_min < minutes_elapsed:
            c_state = "passed"
        elif minutes_elapsed <= at_min <= minutes_elapsed + 5:
            c_state = "due_now"
        else:
            c_state = "upcoming"
        checkpoints_state.append(CheckpointState(at_minute=at_min, check=c["check"], state=c_state))

    return Progress(
        percent_done=percent_done,
        tasks_done=tasks_done_count,
        tasks_total=len(tasks),
        minutes_elapsed=minutes_elapsed,
        minutes_total=minutes_total,
        expected_percent=expected_percent,
        status=progress_status,
        next_task=next_task,
        by_phase=by_phase,
        checkpoints=checkpoints_state,
    )


@app.post("/api/judge", response_model=JudgeReport)
def post_judge(req: JudgeRequest):
    sess = repository.get_session(req.session_id)
    if not sess:
        raise HTTPException(status_code=404, detail=f"Session '{req.session_id}' not found")

    redacted_summary = redact(req.idea_summary)
    redacted_script = redact(req.demo_script)

    # Deterministic scoring based on rule checklist
    # Criterion 1: Problem clarity
    # score high if summary has number, interviewed, today, constraint
    s_lower = redacted_summary.lower()
    has_interviewed = "interviewed" in s_lower
    has_today = "today" in s_lower
    has_number = any(c.isdigit() for c in redacted_summary)
    has_persona = any(p["name"].lower() in s_lower for p in sess["brief"].get("personas", []))

    if has_interviewed and has_today and has_number and has_persona and len(redacted_summary.split()) >= 15:
        c1 = 5
        e1 = "Problem statement strongly backed by same-day customer discovery and user quotes."
        i1 = "Link customer pain directly to product metrics."
    elif len(redacted_summary.split()) >= 5:
        c1 = 2
        e1 = "Problem summary is vague and lacks validation evidence."
        i1 = "Interview 3 actual target users today to gather quantitative pain points."
    else:
        c1 = 1
        e1 = "Problem summary missing or too short."
        i1 = "Write a clear 25-word summary citing target persona pain."

    # Criterion 2: Works end to end
    must_have_count = len(sess["brief"].get("mvp", {}).get("must_have", []))
    built_count = len(req.features_built)
    has_script_steps = len(redacted_script.splitlines()) >= 4

    if built_count >= must_have_count and has_script_steps:
        c2 = 4
        e2 = "All core MVP must-haves built and supported by a multi-step scripted demo path."
        i2 = "Test offline reconnect behavior during the demo flow."
    elif built_count >= 1:
        c2 = 2
        e2 = f"Only {built_count} feature listed; demo script incomplete or missing."
        i2 = "Script a 4-step happy path walkthrough covering order to fulfillment."
    else:
        c2 = 1
        e2 = "No built features demonstrated."
        i2 = "Implement at least the primary user interaction before presenting."

    # Criterion 3: Scope realism
    limits_count = len(req.known_limits)
    if limits_count >= 2:
        c3 = 4
        e3 = "Team honestly identified architectural boundaries and out-of-scope items."
        i3 = "Clarify fallback behaviors for known operational bottlenecks."
    else:
        c3 = 2
        e3 = "Limits not documented; risk of overscoping or unexpected edge-case failure."
        i3 = "Explicitly list 2 clear limitations you are not attempting in this hackathon."

    # Criterion 4: Innovation and practicality
    has_innovative = any("offline" in f.lower() or "predictive" in f.lower() or "qr" in f.lower() for f in req.features_built)
    if has_innovative:
        c4 = 4
        e4 = "Practical innovation integrated directly into the core workflow."
        i4 = "Quantify performance benefits of your innovative mechanism."
    else:
        c4 = 2
        e4 = "Standard implementation without notable edge-case or efficiency innovation."
        i4 = "Add a resilient fallback or lightweight queue intelligence feature."

    # Criterion 5: Can you explain it
    if len(redacted_summary.split()) >= 15 and has_script_steps:
        c5 = 4
        e5 = "Clear articulation of user benefit and cohesive demonstration plan."
        i5 = "Practice crisp 30-second opening hook."
    else:
        c5 = 2
        e5 = "Explanation lacks punch or clear demonstration structure."
        i5 = "Align presentation strictly to the 6-slide jury outline."

    criteria_scores = [c1, c2, c3, c4, c5]
    total_score = sum(criteria_scores)
    overall = round(100 * total_score / 25)

    if overall >= 80:
        readiness = "ready"
    elif overall >= 60:
        readiness = "almost_ready"
    else:
        readiness = "needs_work"

    criteria = [
        CriterionScore(name="Problem clarity", score=c1, evidence=e1, improve=i1),
        CriterionScore(name="Works end to end", score=c2, evidence=e2, improve=i2),
        CriterionScore(name="Scope realism", score=c3, evidence=e3, improve=i3),
        CriterionScore(name="Innovation and practicality", score=c4, evidence=e4, improve=i4),
        CriterionScore(name="Can you explain it", score=c5, evidence=e5, improve=i5),
    ]

    questions = [
        JuryQuestion(question="How did you validate that students actually want this instead of WhatsApp?", why_asked="Tests customer discovery rigor", answer_hint="Cite user interview quotes and specific queue wait time numbers."),
        JuryQuestion(question="What happens if campus Wi-Fi disconnects midway through an order?", why_asked="Tests edge-case resilience", answer_hint="Demonstrate local storage token queuing and automatic reconnect sync."),
        JuryQuestion(question="How will you onboard non-tech-savvy canteen workers without training?", why_asked="Tests operational adoption feasibility", answer_hint="Show the large single-tap status toggle on the coordinator screen."),
        JuryQuestion(question="Why did you choose your specific tech stack over alternatives?", why_asked="Tests architectural trade-off awareness", answer_hint="Explain how typed contracts and lightweight SQLite prevented integration bugs."),
        JuryQuestion(question="If you had 24 more hours, what is the single next feature you would ship?", why_asked="Tests product roadmap vision", answer_hint="Reference the out-of-scope priorities from your brief."),
    ]

    improvements = [
        Improvement(action="Interview 3 students today to tighten the problem statement hook", minutes=15),
        Improvement(action="Rehearse the 5-step live demo script with a stopwatch twice", minutes=10),
        Improvement(action="Document 2 known boundary limitations explicitly on your final slide", minutes=5),
    ]

    report = JudgeReport(
        overall=overall,
        readiness=readiness,
        criteria=criteria,
        likely_questions=questions,
        top_improvements=improvements,
        disclaimer="Practice check against a transparent rubric. It does not predict real jury scores.",
        source="rules",
    )

    repository.save_judge(req.session_id, report.model_dump())
    return report


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("tests.fake_server:app", host="127.0.0.1", port=8000, reload=False)
