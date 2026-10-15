// src/api/mockClient.js
// In-memory mock client implementing the full Contract Block v2.1 API

import { mockSamples, buildMockBrief } from './mockData.js';
import { computeProgress } from '../lib/progress.js';
import { CRITERIA, DISCLAIMER, STAGES } from '../lib/contract.js';
import { ApiError } from './httpClient.js';

class MockClient {
  constructor() {
    this.sessions = new Map();
  }

  async health() {
    return { status: "ok" };
  }

  async samples() {
    return { samples: [...mockSamples] };
  }

  async createBrief({ problem_statement, team }) {
    const brief = buildMockBrief(problem_statement, team);
    const sessionId = "s_" + Math.random().toString(16).slice(2, 14);
    brief.session_id = sessionId;

    this.sessions.set(sessionId, {
      session_id: sessionId,
      created_at: new Date().toISOString(),
      problem_statement,
      team: { ...team },
      brief: JSON.parse(JSON.stringify(brief)),
      messages: [],
      last_judge: null,
      task_states: {}
    });

    return JSON.parse(JSON.stringify(brief));
  }

  async chat({ session_id, message, stage = "understand" }) {
    const session = this.sessions.get(session_id);
    if (!session) {
      throw new ApiError(`Unknown session_id: ${session_id}`, 404);
    }

    const lower = (message || '').toLowerCase();
    const guardrailTriggers = [
      'complete code',
      'full code',
      'whole project',
      'complete solution',
      'write the code',
      'do it for us',
      'entire project',
      'complete app'
    ];
    const isGuardrail = guardrailTriggers.some((phrase) => lower.includes(phrase));

    let reply = '';
    let follow_up_questions = [];
    let guardrail_triggered = false;

    if (isGuardrail) {
      guardrail_triggered = true;
      reply = "I am here to coach and guide your team's thinking, but I cannot write the full solution code for you. Let's break down the next milestone step together: what specific component or logic are you working on right now?";
      follow_up_questions = [
        "Which single acceptance criterion from your MVP can you implement first?",
        "What is the simplest input-output test that validates this step?"
      ];
    } else {
      const stageReplies = {
        understand: "Focus on articulating the exact friction before writing code. Who experiences this pain daily, and what measurable metric will prove your tool worked?",
        users: "Make sure you test assumptions directly against your primary persona's routine. How will you simulate their feedback during your live demo?",
        ideate: "Compare your approaches by feasibility: in a short sprint, a deterministic heuristic that works 100% of the time beats a half-trained model that fails in front of judges.",
        build: "Keep your MVP lean. Deliver the core must-haves and verify the end-to-end happy path before attempting optional polish.",
        validate: "Test edge cases now: what happens if external inputs are missing, slow, or malformed? Have fallback mock data primed.",
        pitch: "Structure your 3-minute pitch around the quantifiable delta. Give judges the problem hook in 20 seconds, demo the working software, and conclude with the measurable impact."
      };

      reply = stageReplies[stage] || stageReplies.understand;
      follow_up_questions = [
        "What is the biggest risk to your demo working end-to-end?",
        "How will you demonstrate measurable impact in your pitch?"
      ];
    }

    const chatResponse = {
      reply,
      stage: STAGES.includes(stage) ? stage : "understand",
      follow_up_questions,
      guardrail_triggered,
      source: "rules"
    };

    session.messages.push({
      role: 'user',
      content: message,
      stage,
      created_at: new Date().toISOString()
    });
    session.messages.push({
      role: 'mentor',
      content: reply,
      stage,
      created_at: new Date().toISOString()
    });

    return chatResponse;
  }

  async getSession(sessionId) {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new ApiError(`Unknown session_id: ${sessionId}`, 404);
    }

    // Merge task ticks into brief.tasks[].done
    const briefCopy = JSON.parse(JSON.stringify(session.brief));
    (briefCopy.tasks || []).forEach((t) => {
      if (session.task_states[t.id] !== undefined) {
        t.done = session.task_states[t.id];
      }
    });

    return {
      session_id: session.session_id,
      created_at: session.created_at,
      problem_statement: session.problem_statement,
      team: { ...session.team },
      brief: briefCopy,
      messages: [...session.messages],
      last_judge: session.last_judge ? { ...session.last_judge } : null
    };
  }

  async setTask(sessionId, taskId, done) {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new ApiError(`Unknown session_id: ${sessionId}`, 404);
    }
    const taskExists = (session.brief.tasks || []).some((t) => t.id === taskId);
    if (!taskExists) {
      throw new ApiError(`Unknown task_id: ${taskId}`, 404);
    }

    session.task_states[taskId] = Boolean(done);
    return {
      task_id: taskId,
      done: Boolean(done)
    };
  }

  async getProgress(sessionId, elapsedMin = null) {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new ApiError(`Unknown session_id: ${sessionId}`, 404);
    }

    const progress = computeProgress({
      tasks: session.brief.tasks || [],
      doneMap: session.task_states,
      checkpoints: session.brief.checkpoints || [],
      minutesTotal: session.team?.minutes_available || 75,
      elapsedMin,
      createdAt: session.created_at
    });

    return progress;
  }

  async judge({ session_id, idea_summary = '', features_built = [], demo_script = '', known_limits = [], minutes_left = null }) {
    const session = this.sessions.get(session_id);
    if (!session) {
      throw new ApiError(`Unknown session_id: ${session_id}`, 404);
    }

    // Deterministic mock scoring that grows with completeness
    const summaryLen = (idea_summary || '').trim().length;
    const featCount = Array.isArray(features_built) ? features_built.filter(Boolean).length : 0;
    const scriptLen = (demo_script || '').trim().length;
    const limitsCount = Array.isArray(known_limits) ? known_limits.filter(Boolean).length : 0;

    // Score criteria 1..5
    // 1. Problem clarity
    let s1 = 2;
    if (summaryLen > 120) s1 = 5;
    else if (summaryLen > 40) s1 = 4;
    else if (summaryLen > 15) s1 = 3;

    // 2. Works end to end
    let s2 = 2;
    if (scriptLen > 120 && featCount >= 3) s2 = 5;
    else if (scriptLen > 40 && featCount >= 2) s2 = 4;
    else if (scriptLen > 10 || featCount >= 1) s2 = 3;

    // 3. Scope realism
    let s3 = 3;
    if (featCount >= 2 && featCount <= 5 && limitsCount >= 1) s3 = 5;
    else if (featCount > 0) s3 = 4;

    // 4. Innovation and practicality
    let s4 = 2;
    if (limitsCount >= 2 && summaryLen > 50) s4 = 5;
    else if (limitsCount >= 1 || featCount >= 2) s4 = 4;
    else if (summaryLen > 20) s4 = 3;

    // 5. Can you explain it
    let s5 = 2;
    if (scriptLen > 60 && summaryLen > 60) s5 = 5;
    else if (scriptLen > 20 || summaryLen > 30) s5 = 4;
    else if (summaryLen > 10) s5 = 3;

    const scores = [s1, s2, s3, s4, s5];
    const sumScores = scores.reduce((a, b) => a + b, 0);
    const overall = Math.round((100 * sumScores) / 25);

    let readiness = "needs_work";
    if (overall >= 80) readiness = "ready";
    else if (overall >= 60) readiness = "almost_ready";

    const criteria = CRITERIA.map((name, idx) => {
      const score = scores[idx];
      return {
        name,
        score,
        evidence: score >= 4
          ? `Sufficient evidence provided in ${name.toLowerCase()} section.`
          : `Minimal details submitted for ${name.toLowerCase()}.`,
        improve: score >= 4
          ? "Solid defense. Rehearse timing during live demo."
          : `Add concrete metrics and clear user feedback for ${name.toLowerCase()}.`
      };
    });

    const likely_questions = [
      {
        question: "Why is your solution better than existing manual or commercial alternatives?",
        why_asked: "Tests whether you understand your unique competitive differentiator.",
        answer_hint: "Focus on your zero-dependency architecture, quantifiable time savings, and direct user workflow integration."
      },
      {
        question: "How does the system handle unexpected API latency or connectivity drops during peak hours?",
        why_asked: "Tests edge-case resilience and architectural depth.",
        answer_hint: "Mention your local cached datasets and graceful degraded UI states."
      },
      {
        question: "What specific features did you cut to ensure the MVP works reliably today?",
        why_asked: "Evaluates prioritization and engineering maturity under time constraints.",
        answer_hint: "Confidently explain that you trimmed secondary auth and notification bells to guarantee a 100% stable demo loop."
      },
      {
        question: "How will you validate driver or operator adoption in the real world?",
        why_asked: "Probes real-world empathy beyond code.",
        answer_hint: "Describe your lightweight validation checkpoint and how staff can understand the screen within 10 seconds."
      },
      {
        question: "What is your primary metric of success after 30 days of campus deployment?",
        why_asked: "Ensures the team is outcome-focused rather than output-focused.",
        answer_hint: "Anchor on the 25% waste reduction and measurable dollar savings for the dining department."
      }
    ];

    const top_improvements = [
      { action: "Add 1 concrete quantitative benchmark comparison to your demo flow", minutes: 10 },
      { action: "Rehearse the 3-minute pitch once with a strict stopwatch", minutes: 8 },
      { action: "Double-check fallback mock response if live inputs fail", minutes: 5 }
    ];

    const report = {
      overall,
      readiness,
      criteria,
      likely_questions,
      top_improvements,
      disclaimer: DISCLAIMER,
      source: "rules"
    };

    session.last_judge = report;
    return report;
  }
}

export const mockClient = new MockClient();
