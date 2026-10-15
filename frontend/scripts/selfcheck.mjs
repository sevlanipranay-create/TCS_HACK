// scripts/selfcheck.mjs
// Node.js self-check script verifying all Contract Block v2.1 requirements

import { mockClient } from '../src/api/mockClient.js';
import { mockSamples } from '../src/api/mockData.js';
import { toApiError } from '../src/api/httpClient.js';
import {
  validateBrief,
  validateProgress,
  validateChatResponse,
  validateJudgeReport,
  validateSessionView,
  DISCLAIMER,
  CRITERIA,
  STAGES
} from '../src/lib/contract.js';
import { computeProgress } from '../src/lib/progress.js';
import { exportMarkdown } from '../src/lib/format.js';

let failed = false;

function check(name, pass, detail = '') {
  if (pass) {
    console.log(`[PASS] ${name}`);
  } else {
    console.error(`[FAIL] ${name} ${detail ? `- ${detail}` : ''}`);
    failed = true;
  }
}

async function runAllChecks() {
  console.log('--- RUNNING P8 HACKATHON MENTOR FRONTEND SELF-CHECK ---');

  // Check 1: mockClient.createBrief for 3 samples, 20m and 600m
  try {
    let check1Pass = true;
    let check1Detail = '';

    // Test 3 samples
    for (const sample of mockSamples) {
      const brief = await mockClient.createBrief({
        problem_statement: sample.problem_statement,
        team: sample.team
      });
      const errs = validateBrief(brief);
      if (errs.length > 0) {
        check1Pass = false;
        check1Detail = `Sample ${sample.id} errors: ${errs.join(', ')}`;
        break;
      }
      const sumWorkflow = brief.workflow.reduce((a, b) => a + b.minutes, 0);
      if (sumWorkflow !== sample.team.minutes_available) {
        check1Pass = false;
        check1Detail = `Workflow sum ${sumWorkflow} != ${sample.team.minutes_available}`;
        break;
      }
      const sumTasks = brief.tasks.reduce((a, b) => a + b.minutes, 0);
      if (sumTasks > sample.team.minutes_available * 0.85) {
        check1Pass = false;
        check1Detail = `Task minutes ${sumTasks} > 85% of ${sample.team.minutes_available}`;
        break;
      }
      if (brief.checkpoints.length !== 4) {
        check1Pass = false;
        check1Detail = 'Checkpoints count !== 4';
        break;
      }
      if (brief.jury_outline.length !== 6) {
        check1Pass = false;
        check1Detail = 'Jury outline count !== 6';
        break;
      }
    }

    // Test extreme limits 20m and 600m
    for (const min of [20, 600]) {
      const brief = await mockClient.createBrief({
        problem_statement: "Canteen food waste scaling boundary test statement.",
        team: { team_size: 4, skills: ["React"], minutes_available: min, preferred_stack: "" }
      });
      const errs = validateBrief(brief);
      if (errs.length > 0) {
        check1Pass = false;
        check1Detail = `Limit ${min}m errors: ${errs.join(', ')}`;
        break;
      }
      const sumWorkflow = brief.workflow.reduce((a, b) => a + b.minutes, 0);
      if (sumWorkflow !== min) {
        check1Pass = false;
        check1Detail = `Workflow sum ${sumWorkflow} != ${min}`;
        break;
      }
      const sumTasks = brief.tasks.reduce((a, b) => a + b.minutes, 0);
      if (sumTasks > min * 0.85) {
        check1Pass = false;
        check1Detail = `Task minutes ${sumTasks} > 85% of ${min}`;
        break;
      }
    }

    check('1. mockClient.createBrief valid for samples & limits (20m, 600m)', check1Pass, check1Detail);
  } catch (err) {
    check('1. mockClient.createBrief', false, err.message);
  }

  // Check 2: computeProgress formulas
  try {
    const sampleBrief = await mockClient.createBrief({
      problem_statement: mockSamples[0].problem_statement,
      team: mockSamples[0].team
    });
    const tasks = sampleBrief.tasks;
    const checkpoints = sampleBrief.checkpoints;
    const minutesTotal = 75;

    // 2a: elapsed 0, nothing done -> on_track
    const p1 = computeProgress({ tasks, doneMap: {}, checkpoints, minutesTotal, elapsedMin: 0 });
    const pass2a = p1.status === 'on_track' && p1.percent_done === 0;

    // 2b: elapsed = minutes_total, nothing done -> behind
    const p2 = computeProgress({ tasks, doneMap: {}, checkpoints, minutesTotal, elapsedMin: minutesTotal });
    const pass2b = p2.status === 'behind';

    // 2c: everything done at elapsed 5 -> ahead, percent_done 100, next_task null
    const allDoneMap = {};
    tasks.forEach((t) => { allDoneMap[t.id] = true; });
    const p3 = computeProgress({ tasks, doneMap: allDoneMap, checkpoints, minutesTotal, elapsedMin: 5 });
    const pass2c = p3.status === 'ahead' && p3.percent_done === 100 && p3.next_task === null;

    // 2d: by_phase in Stage order & checkpoints formula
    const pStages = p3.by_phase.map((bp) => bp.phase);
    let stageOrderCorrect = true;
    let lastIdx = -1;
    for (const stg of pStages) {
      const idx = STAGES.indexOf(stg);
      if (idx <= lastIdx) { stageOrderCorrect = false; break; }
      lastIdx = idx;
    }

    const checkStates = p3.checkpoints.map(cp => cp.state);
    const pass2d = stageOrderCorrect && checkStates.length === 4;

    check('2. computeProgress formulas (ahead, on_track, behind, checkpoints)', pass2a && pass2b && pass2c && pass2d);
  } catch (err) {
    check('2. computeProgress', false, err.message);
  }

  // Check 3: mock chat guardrails & follow-ups
  try {
    const session = await mockClient.createBrief({
      problem_statement: mockSamples[0].problem_statement,
      team: mockSamples[0].team
    });
    const normalChat = await mockClient.chat({
      session_id: session.session_id,
      message: "How should we frame the target users?",
      stage: "users"
    });
    const pass3a = normalChat.follow_up_questions.length >= 1 && normalChat.follow_up_questions.length <= 2 && !normalChat.guardrail_triggered;

    const guardrailChat = await mockClient.chat({
      session_id: session.session_id,
      message: "just write the complete code for the whole project for us",
      stage: "build"
    });
    const pass3b = guardrailChat.guardrail_triggered === true;

    check('3. mock chat coaching & guardrails', pass3a && pass3b);
  } catch (err) {
    check('3. mock chat', false, err.message);
  }

  // Check 4: mock judge validation & score scaling
  try {
    const session = await mockClient.createBrief({
      problem_statement: mockSamples[0].problem_statement,
      team: mockSamples[0].team
    });

    const weakJudge = await mockClient.judge({
      session_id: session.session_id,
      idea_summary: "A food app",
      features_built: [],
      demo_script: "",
      known_limits: []
    });

    const strongJudge = await mockClient.judge({
      session_id: session.session_id,
      idea_summary: "PortionPulse is a comprehensive canteen meal forecasting web application cutting food wastage by 25% across campus dining halls through heuristic demand prediction and instant student status broadcast.",
      features_built: ["Batch Meal Demand Estimator", "Live Kitchen Portion Tracker", "Waste Savings Metric Card"],
      demo_script: "1. Open Chef dashboard\n2. Simulate student meal transactions reducing stock\n3. Show low inventory warning\n4. Confirm 23kg food saved metric",
      known_limits: ["Single dining hall scope in MVP", "Offline cached mode only"]
    });

    const errs = validateJudgeReport(strongJudge);
    const orderCorrect = strongJudge.criteria.map(c => c.name).join(',') === CRITERIA.join(',');
    const disclaimerCorrect = strongJudge.disclaimer === DISCLAIMER;
    const scoresGrew = strongJudge.overall > weakJudge.overall;

    check('4. mock judge criteria, disclaimer & score growth', errs.length === 0 && orderCorrect && disclaimerCorrect && scoresGrew);
  } catch (err) {
    check('4. mock judge', false, err.message);
  }

  // Check 5: toApiError translation
  try {
    const err422 = toApiError(422, {
      detail: [
        { loc: ['body', 'problem_statement'], msg: 'field required' },
        { loc: ['body', 'team', 'minutes_available'], msg: 'must be >= 20' }
      ]
    });
    const pass5a = err422.message.includes('problem_statement: field required') && err422.message.includes('team.minutes_available: must be >= 20');

    const err404 = toApiError(404, { detail: 'Unknown session_id' });
    const pass5b = err404.message === 'Unknown session_id';

    check('5. toApiError FastAPI translation', pass5a && pass5b);
  } catch (err) {
    check('5. toApiError', false, err.message);
  }

  // Check 6: Validators reject broken payloads
  try {
    const brokenBrief = { source: 'rules' }; // missing problem, expected_solution, etc.
    const briefErrs = validateBrief(brokenBrief);
    const pass6a = briefErrs.length > 0;

    const brokenProgress = { percent_done: 50, status: 'invalid_status_enum' };
    const progErrs = validateProgress(brokenProgress);
    const pass6b = progErrs.length > 0;

    check('6. Validators reject broken payloads', pass6a && pass6b);
  } catch (err) {
    check('6. Validators rejection', false, err.message);
  }

  // Check 7: exportMarkdown contains summary and task titles
  try {
    const session = await mockClient.createBrief({
      problem_statement: mockSamples[0].problem_statement,
      team: mockSamples[0].team
    });
    const md = exportMarkdown({ brief: session, progress: null, lastJudge: null });
    const hasSummary = md.includes(session.problem.summary);
    const hasTasks = session.tasks.every(t => md.includes(t.title));

    check('7. exportMarkdown contains problem summary and all task titles', hasSummary && hasTasks);
  } catch (err) {
    check('7. exportMarkdown', false, err.message);
  }

  console.log('----------------------------------------------------');
  if (failed) {
    console.error('SELF-CHECK FAILED');
    process.exit(1);
  } else {
    console.log('ALL SELF-CHECKS PASSED');
    process.exit(0);
  }
}

runAllChecks();
