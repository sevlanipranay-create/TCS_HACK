# Jury Q&A: 8 Likely Questions & Honest Answers (P8)

Prepared for the TCS Tech Day @ VESIT evaluation jury.

---

### Q1: What parts of Hackathon Mentor AI are rule-based, and what does the optional LLM actually do?
**Honest Answer**:
The entire core intelligence—problem parsing, domain classification, feasibility calculation, workflow generation, task minute allocation, checkpoint staging, progress status determination, PII redaction, and Judge Mode scoring—is **100% deterministic and rule-based**.  
When configured with a Google Gemini API key (`GEMINI_API_KEY`), the LLM acts purely as an editorial polisher: it refines conversational phrasing and tailors explanatory prose. If no API key is provided, the application runs identically on the rule baseline (`source: "rules"`) with zero degradation in logic, accuracy, or contract compliance.

---

### Q2: Why does the mentor refuse to write code for the student team? Isn't code generation the main appeal of generative AI?
**Honest Answer**:
In a hackathon setting, AI code generation creates an illusion of progress. Teams paste boilerplate code they don't understand; when an edge case fails or a judge asks how their backend coordinates state, the team collapses.  
Our philosophy is **Coach, Don't Code**. The mentor leads with Socratic inquiry, presents 2 to 3 architectural options with explicit trade-offs, and highlights boundaries. When a student attempts to dump a code generation prompt, our guardrail triggers (`guardrail_triggered: true`), coaching the team on how to structure the interface themselves.

---

### Q3: How do the Feasibility and Progress calculations work mathematically?
**Honest Answer**:
Both engines use exact, transparent formulas defined in our Contract Block:
- **Feasibility Budget Points**:
  $$\text{budget\_points} = \text{team\_size} \times \text{minutes\_available} \times 0.5 / 20$$
- **Used Effort Points**:
  $$\text{used\_points} = \sum \text{Effort Points of Must and Should Features} \quad (S=1, M=2, L=4)$$
- **Verdict**:
  - `realistic` if $\text{used} \le \text{budget}$
  - `tight` if $\text{used} \le 1.3 \times \text{budget}$
  - `overscoped` if $\text{used} > 1.3 \times \text{budget}$
- **Progress Drift**:
  - $\text{expected\_percent} = \text{round}(100 \times \text{minutes\_elapsed} / \text{minutes\_total})$
  - $\text{percent\_done} = \text{round}(100 \times \text{done\_task\_minutes} / \text{all\_task\_minutes})$
  - Status is flagged `behind` if $\text{percent\_done} < \text{expected\_percent} - 15\%$, and `ahead` if $> \text{expected\_percent} + 15\%$.

---

### Q4: How is student privacy and PII protected when pasting real campus problem statements?
**Honest Answer**:
We apply an automated zero-trust regex redaction engine (`redact()`) before text is written to SQLite or processed by any AI layer. All email addresses are substituted with `[REDACTED_EMAIL]`, and telephone / mobile numbers are substituted with `[REDACTED_PHONE]`.  
This is verified in test sample `t3_vague_pii`: personal contacts (`john.doe@vesit.edu`, `+91-9876543210`) are stripped completely from session views, database records, and exported judge reviews.

---

### Q5: How does Judge Mode score a project, and how can teams trust the score?
**Honest Answer**:
Judge Mode is built on a transparent 5-criterion rubric scored 1 to 5:
1. *Problem clarity* (requires validated persona pain, quantitative data, and same-day discovery evidence)
2. *Works end to end* (checks completion of declared MVP must-haves and a sequential demo script)
3. *Scope realism* (verifies documented edge-case boundaries and honest limits)
4. *Innovation and practicality* (checks for resilient mechanisms such as offline token buffers)
5. *Can you explain it* (evaluates presentation coherence against the 6-slide outline)

Scores are computed deterministically ($\text{overall} = \text{round}(100 \times \sum \text{scores} / 25)$). Identical submissions receive identical scores. Every report carries our mandatory disclaimer: *"Practice check against a transparent rubric. It does not predict real jury scores."*

---

### Q6: What happens if the network drops or backend fails during a live hackathon demo?
**Honest Answer**:
We engineered resilience at every layer:
1. **Frontend Mock Mode**: Running `npm run dev:mock` allows the React UI to run completely offline in the browser using static contract fixtures.
2. **ACID SQLite Storage**: Uses Write-Ahead Logging (`WAL` mode) and a 5000ms busy timeout to prevent database locks even under concurrent writes.
3. **Structured Error Handling**: Every error response returns a standardized JSON schema `{"detail": "<readable message>"}` instead of bare 500 crashes.

---

### Q7: What parts of the application are currently simulated or mocked?
**Honest Answer**:
To facilitate realistic rehearsals in a 5-minute presentation:
- **Elapsed Time Slider**: Teams can query `/api/sessions/{id}/progress?elapsed_min=N` to simulate the passage of 40 or 60 minutes and observe drift detection without waiting in real time.
- **Pre-loaded Test Samples**: Samples `t1` through `t5` provide realistic campus scenarios to benchmark and stress-test the engine.
Everything else—database persistence, state transitions, contract validation, and chat history—is live and functional.

---

### Q8: What are the current limitations of Hackathon Mentor AI, and what are the next milestones?
**Honest Answer**:
- **Current Limitations**:
  1. The practice rubric is an educational self-assessment tool, not an official predictor of human jury sentiment.
  2. The system has been validated on synthetic and simulated hackathon scenarios; widespread user testing across live collegiate events is scheduled for the next semester.
- **Roadmap Milestones**:
  1. Multi-team organization dashboard for hackathon mentors and faculty evaluators.
  2. Git repository integration to auto-verify that declared MVP must-haves match actual commit logs.
  3. Support for custom jury rubrics uploaded by hackathon organizers.
