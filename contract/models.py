# contract/models.py
from typing import List, Literal, Optional

from pydantic import BaseModel, Field

Stage = Literal["understand", "users", "ideate", "build", "validate", "pitch"]
Effort = Literal["S", "M", "L"]  # 1, 2, 4 effort points
Priority = Literal["must", "should", "could"]
Source = Literal["llm", "rules", "stub"]
Role = Literal["Frontend", "Backend", "AI", "Integrator"]


class TeamContext(BaseModel):
    team_size: int = Field(4, ge=1, le=8)
    skills: List[str] = []
    minutes_available: int = Field(75, ge=20, le=600)
    preferred_stack: str = ""


class BriefRequest(BaseModel):
    problem_statement: str = Field(min_length=10, max_length=4000)
    team: TeamContext = TeamContext()


class Stakeholder(BaseModel):
    name: str
    interest: str
    influence: Literal["high", "medium", "low"]


class ProblemExplained(BaseModel):
    summary: str  # plain language, max 60 words
    domain: str
    who_is_affected: List[str]
    why_it_matters: str
    stakeholders: List[Stakeholder]
    key_questions: List[str]  # 5 to 7
    assumptions: List[str]  # at least 3, each phrased as an assumption


class Approach(BaseModel):
    name: str
    how_it_works: str
    tradeoff: str


class ExpectedSolution(BaseModel):  # the SHAPE of a good solution, never an implementation
    goal: str
    success_criteria: List[str]  # 3 to 5, measurable
    approach_options: List[Approach]  # 2 to 3
    out_of_scope: List[str]


class Persona(BaseModel):
    name: str
    role: str
    goal: str
    pain_point: str
    how_to_validate: str


class TechOption(BaseModel):
    layer: str
    options: List[str]
    recommended: str
    why: str
    tradeoff: str


class MustHave(BaseModel):
    id: str  # "m1", "m2", ...
    name: str
    acceptance_criteria: List[str]


class MVP(BaseModel):
    goal: str
    must_have: List[MustHave]  # 3 to 5
    nice_to_have: List[str]
    demo_path: List[str]  # 4 to 6 steps


class Phase(BaseModel):
    phase: Stage
    title: str
    minutes: int = Field(ge=1)
    activities: List[str]
    outcome: str


class Task(BaseModel):
    id: str  # "t1", "t2", ...
    phase: Stage
    title: str
    owner_role: Role
    minutes: int = Field(ge=1)
    done: bool = False


class Checkpoint(BaseModel):
    at_minute: int = Field(ge=0)
    check: str
    how: str


class Feature(BaseModel):
    name: str
    why: str
    effort: Effort
    impact: int = Field(ge=1, le=5)
    priority: Priority
    innovative: bool = False


class Feasibility(BaseModel):
    score: int = Field(ge=0, le=100)
    verdict: Literal["realistic", "tight", "overscoped"]
    budget_points: float
    used_points: float
    message: str


class JurySlide(BaseModel):
    slide: int = Field(ge=1)
    title: str
    talking_point: str
    proof: str


class DecisionPoint(BaseModel):
    question: str
    options: List[str]


class Brief(BaseModel):
    session_id: Optional[str] = None  # set by the backend only
    source: Source = "rules"
    problem: ProblemExplained
    expected_solution: ExpectedSolution
    personas: List[Persona]  # 2 to 3
    tech: List[TechOption]  # 3 to 5
    mvp: MVP
    workflow: List[Phase]  # 6 phases, one per Stage in order, minutes sum == minutes_available
    tasks: List[Task]  # 8 to 14, ids "t1".."tn", total minutes <= 85% of minutes_available
    checkpoints: List[Checkpoint]  # 4, ascending at_minute
    features: List[Feature]  # 3 to 6
    feasibility: Feasibility
    innovation_prompts: List[str]
    demo_tips: List[str]
    jury_outline: List[JurySlide]  # 6 slides
    your_call: List[DecisionPoint]  # 2 decisions the TEAM must make


class ChatRequest(BaseModel):
    session_id: str
    message: str = Field(min_length=1, max_length=2000)
    stage: Stage = "understand"


class ChatResponse(BaseModel):
    reply: str  # max 150 words
    stage: Stage
    follow_up_questions: List[str] = []  # 1 to 2
    guardrail_triggered: bool = False
    source: Source = "rules"


class ChatMessage(BaseModel):
    role: Literal["user", "mentor"]
    content: str
    stage: Stage
    created_at: str


class TaskUpdate(BaseModel):
    done: bool


class TaskState(BaseModel):
    task_id: str
    done: bool


class PhaseProgress(BaseModel):
    phase: Stage
    done: int
    total: int


class CheckpointState(BaseModel):
    at_minute: int
    check: str
    state: Literal["passed", "due_now", "upcoming"]


class NextTask(BaseModel):
    id: str
    title: str
    owner_role: Role


class Progress(BaseModel):
    percent_done: int = Field(ge=0, le=100)
    tasks_done: int
    tasks_total: int
    minutes_elapsed: int
    minutes_total: int
    expected_percent: int = Field(ge=0, le=100)
    status: Literal["ahead", "on_track", "behind"]
    next_task: Optional[NextTask] = None
    by_phase: List[PhaseProgress]
    checkpoints: List[CheckpointState]


class JudgeRequest(BaseModel):
    session_id: str
    idea_summary: str = Field("", max_length=1500)
    features_built: List[str] = []
    demo_script: str = Field("", max_length=2000)
    known_limits: List[str] = []
    minutes_left: Optional[int] = Field(None, ge=0, le=600)


class CriterionScore(BaseModel):
    name: str  # one of the 5 fixed names, see JUDGE below
    score: int = Field(ge=1, le=5)
    evidence: str
    improve: str


class JuryQuestion(BaseModel):
    question: str
    why_asked: str
    answer_hint: str


class Improvement(BaseModel):
    action: str
    minutes: int = Field(ge=1)


class JudgeReport(BaseModel):
    overall: int = Field(ge=0, le=100)
    readiness: Literal["needs_work", "almost_ready", "ready"]
    criteria: List[CriterionScore]  # exactly 5, fixed names and order
    likely_questions: List[JuryQuestion]  # exactly 5
    top_improvements: List[Improvement]  # exactly 3
    disclaimer: str
    source: Source = "rules"


class SessionView(BaseModel):
    session_id: str
    created_at: str
    problem_statement: str
    team: TeamContext
    brief: Brief
    messages: List[ChatMessage]
    last_judge: Optional[JudgeReport] = None
