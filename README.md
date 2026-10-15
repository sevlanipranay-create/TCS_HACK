# Hackathon Mentor AI (Problem P8 - TCS Tech Day @ VESIT)

Hackathon Mentor AI is an intelligent coaching companion for student teams participating in hackathons. Teams paste their problem statement along with team context (size, skills, minutes available, preferred stack) and receive:

1. **Problem Explanation & Solution Shape**: Plain language breakdown, stakeholders, assumptions, and 2-3 architectural approaches (never code implementation).
2. **Technology Options**: Curated stack options matched to team skills with explicit trade-offs.
3. **MVP Definition**: 3 to 5 must-haves with acceptance criteria and an end-to-end demo path.
4. **Workflow & Time Plan**: 6 structured phases across hackathon stages, task breakdown with role owners, and 4 timed checkpoints.
5. **Progress Tracker**: Real-time task ticking and time-based status calculations (ahead, on track, behind).
6. **Stage-Aware Mentor Chat**: Socratic coaching tailored to current phase with guardrails against writing full code.
7. **Judge Mode**: Transparent practice project review against a 5-criterion jury rubric with jury questions and top improvements.

---

## Stack & Team Map

| Folder | Owner | Responsibilities |
| --- | --- | --- |
| `frontend/` | Owner A | React 18 + Vite, JavaScript UI, Mock mode, Tracker, Chat, Judge views |
| `backend/` | Owner B | Python FastAPI HTTP service, routing, session views, error handling |
| `ai/` | Owner C | Python Mentor Brain: Rules engine baseline, optional Gemini enhancement, PII redaction |
| `database/` | Owner D | Python SQLite repository, WAL mode, persistence, tasks & messages storage |
| `contract/` | Shared (Owned by D) | Pydantic v2 data models defining the exact API schema |
| `tests/` | Owner D | Contract referee (`contract_check.py`), sample suites, end-to-end demo runner |
| `docs/` | Owner D | Pitch outline, demo script, jury Q&A |

---

## Run Commands

### 1. Backend Service
From the repository root:
```bash
python -m uvicorn backend.main:app --port 8000
```
API runs on `http://127.0.0.1:8000` with Swagger docs at `http://127.0.0.1:8000/docs`.

### 2. Frontend Application
From the `frontend` folder:
```bash
cd frontend
npm install
npm run dev
```
Opens `http://localhost:5173`. The Vite dev server proxies `/api` calls directly to `http://127.0.0.1:8000`.

To run frontend without a running backend:
```bash
npm run dev:mock
```

### 3. All-in-One Launcher
From the repository root:
```bash
python run_all.py
```

---

## Self-Check Commands (Per Folder)

Every team member must run and pass their self-check before pushing:

- **Database (Owner D)**:
  ```bash
  python -m database.selfcheck
  ```
- **AI Brain (Owner C)**:
  ```bash
  python -m ai.selfcheck
  ```
- **Backend (Owner B)**:
  ```bash
  python -m backend.selfcheck
  ```
- **Frontend (Owner A)**:
  ```bash
  cd frontend && npm run selfcheck && npm run build
  ```
- **Integration Referee (Owner D)**:
  ```bash
  python tests/contract_check.py
  python tests/e2e_demo.py
  ```

---

## Team Rules
- **No API key needed**: Everything works on the rules baseline.
- **Redaction**: Emails and phone numbers are redacted before storage or LLM interaction.
- **Coach, Don't Code**: The mentor guides teams through decisions; it never outputs entire projects.
- **One folder per owner**: Commit only your own folder (`git add <folder>`), rebase pull, and push.
