// src/lib/progress.js
// Pure PROGRESS formula computation according to Contract Block v2.1
import { STAGES } from './contract.js';

export function computeProgress({
  tasks = [],
  doneMap = {},
  checkpoints = [],
  minutesTotal = 75,
  elapsedMin = null,
  createdAt = null
}) {
  const totalMin = Math.max(1, minutesTotal);

  let minutesElapsed = 0;
  if (elapsedMin !== null && elapsedMin !== undefined) {
    minutesElapsed = Number(elapsedMin);
  } else if (createdAt) {
    const createdTime = new Date(createdAt).getTime();
    const nowTime = Date.now();
    minutesElapsed = Math.floor(Math.max(0, nowTime - createdTime) / 60000);
  }
  // clamp to 0..minutes_total
  minutesElapsed = Math.max(0, Math.min(totalMin, minutesElapsed));

  const totalTasks = tasks.length;
  let doneCount = 0;
  let doneMinutes = 0;
  let allTaskMinutes = 0;
  let firstNotDone = null;

  for (const t of tasks) {
    const isDone = Boolean(doneMap[t.id] !== undefined ? doneMap[t.id] : t.done);
    allTaskMinutes += t.minutes;
    if (isDone) {
      doneCount++;
      doneMinutes += t.minutes;
    } else if (!firstNotDone) {
      firstNotDone = {
        id: t.id,
        title: t.title,
        owner_role: t.owner_role
      };
    }
  }

  const percent_done = allTaskMinutes > 0 ? Math.round((100 * doneMinutes) / allTaskMinutes) : 0;
  const expected_percent = Math.round((100 * minutesElapsed) / totalMin);

  let status = "on_track";
  if (percent_done < expected_percent - 15) {
    status = "behind";
  } else if (percent_done > expected_percent + 15) {
    status = "ahead";
  }

  // by_phase lists phases in Stage order and skips phases that have no tasks
  const by_phase = [];
  for (const stg of STAGES) {
    const phaseTasks = tasks.filter((t) => t.phase === stg);
    if (phaseTasks.length > 0) {
      const pDone = phaseTasks.filter((t) => (doneMap[t.id] !== undefined ? doneMap[t.id] : t.done)).length;
      by_phase.push({
        phase: stg,
        done: pDone,
        total: phaseTasks.length
      });
    }
  }

  // checkpoints: "passed" if at_minute < minutes_elapsed; "due_now" if minutes_elapsed <= at_minute <= minutes_elapsed + 5; else "upcoming"
  const computedCheckpoints = (checkpoints || []).map((cp) => {
    let state = "upcoming";
    if (cp.at_minute < minutesElapsed) {
      state = "passed";
    } else if (minutesElapsed <= cp.at_minute && cp.at_minute <= minutesElapsed + 5) {
      state = "due_now";
    }
    return {
      at_minute: cp.at_minute,
      check: cp.check,
      state
    };
  });

  return {
    percent_done,
    tasks_done: doneCount,
    tasks_total: totalTasks,
    minutes_elapsed: minutesElapsed,
    minutes_total: totalMin,
    expected_percent,
    status,
    next_task: firstNotDone,
    by_phase,
    checkpoints: computedCheckpoints
  };
}
