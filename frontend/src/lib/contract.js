// src/lib/contract.js
// Contract Block v2.1 constants and validators

export const STAGES = ["understand", "users", "ideate", "build", "validate", "pitch"];
export const CRITERIA = [
  "Problem clarity",
  "Works end to end",
  "Scope realism",
  "Innovation and practicality",
  "Can you explain it"
];
export const DISCLAIMER = "Practice check against a transparent rubric. It does not predict real jury scores.";

export function validateBrief(b) {
  const errors = [];
  if (!b || typeof b !== 'object') {
    return ['brief must be an object'];
  }
  if (!['llm', 'rules', 'stub'].includes(b.source)) {
    errors.push(`invalid source: ${b.source}`);
  }

  // Problem
  if (!b.problem || typeof b.problem !== 'object') {
    errors.push('missing problem object');
  } else {
    if (!b.problem.summary) errors.push('problem.summary missing');
    if (!b.problem.domain) errors.push('problem.domain missing');
    if (!Array.isArray(b.problem.who_is_affected)) errors.push('problem.who_is_affected must be array');
    if (!b.problem.why_it_matters) errors.push('problem.why_it_matters missing');
    if (!Array.isArray(b.problem.stakeholders)) errors.push('problem.stakeholders must be array');
    if (!Array.isArray(b.problem.key_questions) || b.problem.key_questions.length < 5 || b.problem.key_questions.length > 7) {
      errors.push('problem.key_questions must have 5 to 7 items');
    }
    if (!Array.isArray(b.problem.assumptions) || b.problem.assumptions.length < 3) {
      errors.push('problem.assumptions must have at least 3 items');
    }
  }

  // Expected solution
  if (!b.expected_solution || typeof b.expected_solution !== 'object') {
    errors.push('missing expected_solution');
  } else {
    if (!b.expected_solution.goal) errors.push('expected_solution.goal missing');
    if (!Array.isArray(b.expected_solution.success_criteria) || b.expected_solution.success_criteria.length < 3 || b.expected_solution.success_criteria.length > 5) {
      errors.push('expected_solution.success_criteria must have 3 to 5 items');
    }
    if (!Array.isArray(b.expected_solution.approach_options) || b.expected_solution.approach_options.length < 2 || b.expected_solution.approach_options.length > 3) {
      errors.push('expected_solution.approach_options must have 2 to 3 items');
    }
    if (!Array.isArray(b.expected_solution.out_of_scope)) errors.push('expected_solution.out_of_scope must be array');
  }

  // Personas
  if (!Array.isArray(b.personas) || b.personas.length < 2 || b.personas.length > 3) {
    errors.push('personas must have 2 to 3 items');
  }

  // Tech
  if (!Array.isArray(b.tech) || b.tech.length < 3 || b.tech.length > 5) {
    errors.push('tech must have 3 to 5 items');
  }

  // MVP
  if (!b.mvp || typeof b.mvp !== 'object') {
    errors.push('missing mvp');
  } else {
    if (!b.mvp.goal) errors.push('mvp.goal missing');
    if (!Array.isArray(b.mvp.must_have) || b.mvp.must_have.length < 3 || b.mvp.must_have.length > 5) {
      errors.push('mvp.must_have must have 3 to 5 items');
    }
    if (!Array.isArray(b.mvp.nice_to_have)) errors.push('mvp.nice_to_have must be array');
    if (!Array.isArray(b.mvp.demo_path) || b.mvp.demo_path.length < 4 || b.mvp.demo_path.length > 6) {
      errors.push('mvp.demo_path must have 4 to 6 items');
    }
  }

  // Workflow (6 phases, one per Stage in order)
  if (!Array.isArray(b.workflow) || b.workflow.length !== 6) {
    errors.push('workflow must have exactly 6 phases');
  } else {
    b.workflow.forEach((p, idx) => {
      if (p.phase !== STAGES[idx]) {
        errors.push(`workflow phase ${idx} must be '${STAGES[idx]}', got '${p.phase}'`);
      }
      if (!p.minutes || p.minutes < 1) {
        errors.push(`workflow phase ${p.phase} minutes must be >= 1`);
      }
    });
  }

  // Tasks (8 to 14, ids t1..tn)
  if (!Array.isArray(b.tasks) || b.tasks.length < 8 || b.tasks.length > 14) {
    errors.push('tasks must have 8 to 14 items');
  } else {
    b.tasks.forEach((t, idx) => {
      if (t.id !== `t${idx + 1}`) {
        errors.push(`task index ${idx} expected id 't${idx + 1}', got '${t.id}'`);
      }
      if (!STAGES.includes(t.phase)) {
        errors.push(`task ${t.id} invalid phase: ${t.phase}`);
      }
      if (!['Frontend', 'Backend', 'AI', 'Integrator'].includes(t.owner_role)) {
        errors.push(`task ${t.id} invalid owner_role: ${t.owner_role}`);
      }
    });
  }

  // Checkpoints (4, ascending at_minute)
  if (!Array.isArray(b.checkpoints) || b.checkpoints.length !== 4) {
    errors.push('checkpoints must have exactly 4 items');
  } else {
    let lastM = -1;
    b.checkpoints.forEach((cp, idx) => {
      if (typeof cp.at_minute !== 'number' || cp.at_minute < 0 || cp.at_minute <= lastM) {
        errors.push(`checkpoint ${idx} at_minute must be strictly ascending and >= 0`);
      }
      lastM = cp.at_minute;
    });
  }

  // Features (3 to 6)
  if (!Array.isArray(b.features) || b.features.length < 3 || b.features.length > 6) {
    errors.push('features must have 3 to 6 items');
  }

  // Feasibility
  if (!b.feasibility || typeof b.feasibility !== 'object') {
    errors.push('missing feasibility');
  } else {
    if (!['realistic', 'tight', 'overscoped'].includes(b.feasibility.verdict)) {
      errors.push(`invalid feasibility verdict: ${b.feasibility.verdict}`);
    }
  }

  // Jury outline (6 slides)
  if (!Array.isArray(b.jury_outline) || b.jury_outline.length !== 6) {
    errors.push('jury_outline must have exactly 6 slides');
  }

  // Your call (2 decisions)
  if (!Array.isArray(b.your_call) || b.your_call.length !== 2) {
    errors.push('your_call must have exactly 2 decisions');
  }

  return errors;
}

export function validateProgress(p) {
  const errors = [];
  if (!p || typeof p !== 'object') return ['progress must be object'];
  if (typeof p.percent_done !== 'number' || p.percent_done < 0 || p.percent_done > 100) {
    errors.push('invalid percent_done');
  }
  if (!['ahead', 'on_track', 'behind'].includes(p.status)) {
    errors.push(`invalid status: ${p.status}`);
  }
  if (!Array.isArray(p.by_phase)) {
    errors.push('by_phase must be array');
  }
  if (!Array.isArray(p.checkpoints)) {
    errors.push('checkpoints must be array');
  } else {
    p.checkpoints.forEach((cp, idx) => {
      if (!['passed', 'due_now', 'upcoming'].includes(cp.state)) {
        errors.push(`checkpoint ${idx} invalid state: ${cp.state}`);
      }
    });
  }
  return errors;
}

export function validateChatResponse(r) {
  const errors = [];
  if (!r || typeof r !== 'object') return ['chat response must be object'];
  if (typeof r.reply !== 'string' || !r.reply) errors.push('reply missing');
  if (!STAGES.includes(r.stage)) errors.push(`invalid stage: ${r.stage}`);
  if (!Array.isArray(r.follow_up_questions)) errors.push('follow_up_questions must be array');
  if (typeof r.guardrail_triggered !== 'boolean') errors.push('guardrail_triggered must be boolean');
  if (!['llm', 'rules', 'stub'].includes(r.source)) errors.push(`invalid source: ${r.source}`);
  return errors;
}

export function validateJudgeReport(j) {
  const errors = [];
  if (!j || typeof j !== 'object') return ['judge report must be object'];
  if (typeof j.overall !== 'number' || j.overall < 0 || j.overall > 100) errors.push('invalid overall score');
  if (!['needs_work', 'almost_ready', 'ready'].includes(j.readiness)) errors.push(`invalid readiness: ${j.readiness}`);
  if (!Array.isArray(j.criteria) || j.criteria.length !== 5) {
    errors.push('criteria must have exactly 5 items');
  } else {
    j.criteria.forEach((c, idx) => {
      if (c.name !== CRITERIA[idx]) {
        errors.push(`criteria ${idx} must be '${CRITERIA[idx]}', got '${c.name}'`);
      }
      if (typeof c.score !== 'number' || c.score < 1 || c.score > 5) {
        errors.push(`criteria ${c.name} score must be 1 to 5`);
      }
    });
  }
  if (!Array.isArray(j.likely_questions) || j.likely_questions.length !== 5) {
    errors.push('likely_questions must have exactly 5 items');
  }
  if (!Array.isArray(j.top_improvements) || j.top_improvements.length !== 3) {
    errors.push('top_improvements must have exactly 3 items');
  }
  if (j.disclaimer !== DISCLAIMER) {
    errors.push('disclaimer does not match exact required text');
  }
  return errors;
}

export function validateSessionView(s) {
  const errors = [];
  if (!s || typeof s !== 'object') return ['session view must be object'];
  if (!s.session_id) errors.push('missing session_id');
  if (!s.created_at) errors.push('missing created_at');
  if (!s.problem_statement) errors.push('missing problem_statement');
  if (!s.team) errors.push('missing team');
  if (!s.brief) errors.push('missing brief');
  if (!Array.isArray(s.messages)) errors.push('messages must be array');
  return errors;
}
