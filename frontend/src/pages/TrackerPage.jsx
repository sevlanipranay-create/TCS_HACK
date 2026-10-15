import React, { useState, useEffect, useRef } from 'react';
import { useSession } from '../state/SessionContext.jsx';
import PageContainer from '../components/layout/PageContainer.jsx';
import Card from '../components/common/Card.jsx';
import Button from '../components/common/Button.jsx';
import Badge from '../components/common/Badge.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import { KanbanSquare, Clock, Target, TrendingUp, CheckCircle2, RotateCcw } from '../components/common/Icons.jsx';

export function TrackerPage() {
  const {
    brief,
    progress,
    setTask,
    refreshProgress,
    setPage,
    loading
  } = useSession();

  const [isSimulating, setIsSimulating] = useState(false);
  const [simMinutes, setSimMinutes] = useState(0);
  const [optimisticTasks, setOptimisticTasks] = useState(null);
  const [updatingTaskId, setUpdatingTaskId] = useState(null);
  const [localError, setLocalError] = useState(null);

  const debounceTimerRef = useRef(null);

  const minutesTotal = brief?.workflow?.reduce((acc, p) => acc + p.minutes, 0) || progress?.minutes_total || 75;

  useEffect(() => {
    if (brief?.tasks) {
      setOptimisticTasks(brief.tasks);
    }
  }, [brief?.tasks]);

  useEffect(() => {
    if (progress?.minutes_elapsed !== undefined && !isSimulating) {
      setSimMinutes(progress.minutes_elapsed);
    }
  }, [progress?.minutes_elapsed, isSimulating]);

  // 30s auto-polling
  useEffect(() => {
    if (!brief || isSimulating) return;
    const interval = setInterval(() => {
      refreshProgress();
    }, 30000);
    return () => clearInterval(interval);
  }, [brief, isSimulating, refreshProgress]);

  const handleSliderChange = (e) => {
    const val = Number(e.target.value);
    setSimMinutes(val);
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      refreshProgress(val);
    }, 300);
  };

  const handleToggleSimulate = (e) => {
    const checked = e.target.checked;
    setIsSimulating(checked);
    if (!checked) {
      refreshProgress(null);
    } else {
      refreshProgress(simMinutes);
    }
  };

  const handleToggleTask = async (task) => {
    if (!task?.id || updatingTaskId) return;

    const currentDone = task.done;
    const nextDone = !currentDone;

    setOptimisticTasks((prev) =>
      prev ? prev.map((t) => (t.id === task.id ? { ...t, done: nextDone } : t)) : prev
    );
    setUpdatingTaskId(task.id);
    setLocalError(null);

    try {
      await setTask(task.id, nextDone);
    } catch (err) {
      setOptimisticTasks((prev) =>
        prev ? prev.map((t) => (t.id === task.id ? { ...t, done: currentDone } : t)) : prev
      );
      setLocalError(`Failed to update task: ${err.message || 'Network error'}`);
    } finally {
      setUpdatingTaskId(null);
    }
  };

  if (!brief) {
    return (
      <PageContainer title="02 Sprint Tracker & Velocity">
        <EmptyState
          icon="⏱️"
          title="Create a brief first"
          description="Your sprint progress tracker and task checkpoints require an active mentor brief."
          actionText="Go to Mentor Brief"
          onAction={() => setPage('brief')}
        />
      </PageContainer>
    );
  }

  const tasksToRender = optimisticTasks || brief.tasks || [];
  const phases = brief.workflow || [];
  const groupedTasks = phases.map((phase) => {
    const phaseTasks = tasksToRender.filter((t) => t.phase === phase.phase);
    const doneCount = phaseTasks.filter((t) => t.done).length;
    return {
      phase: phase.phase,
      title: phase.title,
      minutes: phase.minutes,
      tasks: phaseTasks,
      doneCount,
      totalCount: phaseTasks.length
    };
  });

  const statusVariant = {
    ahead: 'success',
    on_track: 'mint',
    behind: 'error'
  }[progress?.status || 'on_track'] || 'mint';

  const statusLabel = {
    ahead: 'Ahead of Pace',
    on_track: 'On Track',
    behind: 'Behind Pace'
  }[progress?.status || 'on_track'] || 'On Track';

  return (
    <PageContainer
      title="02 Sprint Tracker & Velocity"
      subtitle="Execution pacing against your team's total available minutes."
      badge={<Badge variant={statusVariant}>{statusLabel}</Badge>}
      actions={
        <Button
          variant="outline"
          size="sm"
          onClick={() => refreshProgress(isSimulating ? simMinutes : null)}
          icon={RotateCcw}
          id="btn-refresh-progress"
        >
          Refresh Pace
        </Button>
      }
    >
      {localError && (
        <div className="p-3 rounded-[12px] bg-[#C75C5C]/10 border border-[#C75C5C]/30 text-xs text-[#C75C5C] font-semibold">
          {localError}
        </div>
      )}

      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Completion % */}
        <Card variant="white" radius="md" padding="md" className="border border-[#8EB69B]/30 shadow-xs">
          <div className="flex items-center justify-between text-[#71877E] mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Completion</span>
            <KanbanSquare className="w-4 h-4 text-[#8EB69B]" />
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-black text-[#051F20]">
              {progress?.percent_done ?? 0}%
            </span>
            <span className="text-xs text-[#71877E]">
              ({progress?.tasks_done ?? 0}/{progress?.tasks_total ?? tasksToRender.length})
            </span>
          </div>
        </Card>

        {/* Pace Status */}
        <Card variant="white" radius="md" padding="md" className="border border-[#8EB69B]/30 shadow-xs">
          <div className="flex items-center justify-between text-[#71877E] mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Pacing Health</span>
            <TrendingUp className="w-4 h-4 text-[#8EB69B]" />
          </div>
          <div className="mt-2">
            <Badge variant={statusVariant} size="sm">
              {statusLabel}
            </Badge>
          </div>
        </Card>

        {/* Time Elapsed */}
        <Card variant="white" radius="md" padding="md" className="border border-[#8EB69B]/30 shadow-xs">
          <div className="flex items-center justify-between text-[#71877E] mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Elapsed Time</span>
            <Clock className="w-4 h-4 text-[#8EB69B]" />
          </div>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-3xl font-black text-[#051F20]">
              {progress?.minutes_elapsed ?? 0}m
            </span>
            <span className="text-xs text-[#71877E]">
              / {progress?.minutes_total ?? minutesTotal}m
            </span>
          </div>
        </Card>

        {/* Next Priority Task */}
        <Card variant="white" radius="md" padding="md" className="border border-[#8EB69B]/30 shadow-xs">
          <div className="flex items-center justify-between text-[#71877E] mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Next Priority</span>
            <Target className="w-4 h-4 text-[#8EB69B]" />
          </div>
          <div className="mt-1">
            {progress?.next_task ? (
              <div>
                <strong className="text-xs font-bold text-[#051F20] block leading-tight truncate">
                  {progress.next_task.title}
                </strong>
                <span className="text-[11px] text-[#71877E]">
                  Role: <strong className="text-[#051F20]">{progress.next_task.owner_role}</strong>
                </span>
              </div>
            ) : (
              <span className="text-xs font-bold text-[#4F8A6A]">
                🎉 All tasks completed!
              </span>
            )}
          </div>
        </Card>
      </div>

      {/* Done vs Expected Comparison Card */}
      <Card variant="white" radius="hero" className="border border-[#8EB69B]/30 shadow-sm space-y-4">
        <div>
          <h3 className="text-base font-extrabold text-[#051F20]">
            Sprint Velocity: Done vs Expected
          </h3>
          <p className="text-xs text-[#49645C]">
            Compares percentage of completed tasks with the passage of elapsed time.
          </p>
        </div>

        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between text-xs font-bold mb-1">
              <span className="text-[#051F20]">Actual Tasks Completed:</span>
              <span className="text-[#051F20]">{progress?.percent_done ?? 0}%</span>
            </div>
            <div className="progress-track" style={{ height: '10px' }}>
              <div
                className="progress-fill"
                style={{
                  width: `${Math.min(100, Math.max(0, progress?.percent_done ?? 0))}%`,
                  backgroundColor: progress?.status === 'behind' ? 'var(--color-status-error)' : 'var(--color-brand-mint)'
                }}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs font-semibold mb-1 text-[#71877E]">
              <span>Expected Progress by Time Elapsed:</span>
              <span>{progress?.expected_percent ?? 0}%</span>
            </div>
            <div className="progress-track" style={{ height: '8px', background: 'rgba(142,182,155,0.18)' }}>
              <div
                className="progress-fill"
                style={{
                  width: `${Math.min(100, Math.max(0, progress?.expected_percent ?? 0))}%`,
                  backgroundColor: 'var(--color-brand-text-muted)'
                }}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Demo Helper: Simulate Elapsed Time */}
      <Card variant="mintLight" radius="lg" className="border border-[#8EB69B] shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <label className="checkbox-label text-sm font-bold text-[#051F20]">
            <input
              type="checkbox"
              id="simulate-time-checkbox"
              checked={isSimulating}
              onChange={handleToggleSimulate}
            />
            <span>Demo helper: simulate elapsed time</span>
          </label>

          {isSimulating && (
            <span className="text-xs font-bold text-[#163832]">
              Simulating {simMinutes} mins of {minutesTotal}m total
            </span>
          )}
        </div>

        {isSimulating && (
          <div className="mt-3 pt-2 border-t border-[#8EB69B]/30 space-y-1.5">
            <input
              type="range"
              id="simulate-time-slider"
              min="0"
              max={minutesTotal}
              value={simMinutes}
              onChange={handleSliderChange}
              style={{ width: '100%', accentColor: 'var(--color-brand-forest)', cursor: 'pointer' }}
            />
            <div className="flex justify-between text-[11px] text-[#49645C] font-semibold">
              <span>0m (Start)</span>
              <span>{Math.round(minutesTotal / 2)}m (Mid-sprint)</span>
              <span>{minutesTotal}m (Pitch Cutoff)</span>
            </div>
          </div>
        )}
      </Card>

      {/* Tasks & Checkpoints Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tasks Grouped by Phase */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-base font-extrabold text-[#051F20]">
            Tasks by Sprint Phase
          </h3>

          <div className="space-y-4">
            {groupedTasks.map((phaseGroup) => (
              <Card key={phaseGroup.phase} variant="white" radius="md" padding="md" className="border border-[#8EB69B]/30 shadow-xs">
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#DAF1DE]">
                  <div>
                    <h4 className="text-sm font-bold text-[#051F20]">
                      {phaseGroup.title}
                    </h4>
                    <span className="text-xs text-[#71877E]">
                      Timebox: {phaseGroup.minutes} minutes
                    </span>
                  </div>
                  <span className="text-xs font-bold text-[#051F20]">
                    {phaseGroup.doneCount} / {phaseGroup.totalCount} completed
                  </span>
                </div>

                <div className="space-y-2">
                  {phaseGroup.tasks.map((task) => (
                    <label
                      key={task.id}
                      className={`flex items-center justify-between p-3 rounded-[10px] border transition-all cursor-pointer select-none ${
                        task.done
                          ? 'bg-[#EAF6EA]/80 border-[#8EB69B]/40'
                          : 'bg-[#FAFCFA] border-[#DAF1DE] hover:border-[#8EB69B]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={Boolean(task.done)}
                          disabled={updatingTaskId === task.id}
                          onChange={() => handleToggleTask(task)}
                          style={{ accentColor: 'var(--color-brand-mint)', width: '16px', height: '16px', cursor: 'pointer' }}
                        />
                        <span
                          className={`text-xs ${
                            task.done
                              ? 'line-through text-[#71877E]'
                              : 'font-semibold text-[#051F20]'
                          }`}
                        >
                          {task.title}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#051F20] text-[#8EB69B]">
                          {task.owner_role}
                        </span>
                        <span className="text-xs text-[#71877E] min-w-[32px] text-right font-medium">
                          {task.minutes}m
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Sprint Checkpoints Timeline */}
        <div className="space-y-4">
          <h3 className="text-base font-extrabold text-[#051F20]">
            Sprint Checkpoints
          </h3>

          <div className="space-y-3">
            {(progress?.checkpoints || brief.checkpoints || []).map((cp, idx) => {
              const state = cp.state || (
                (progress?.minutes_elapsed ?? 0) > cp.at_minute
                  ? 'passed'
                  : (progress?.minutes_elapsed ?? 0) >= cp.at_minute - 5
                  ? 'due_now'
                  : 'upcoming'
              );

              const stateBadge = {
                passed: <Badge variant="success" size="sm">Passed</Badge>,
                due_now: <Badge variant="warning" size="sm">Due Now</Badge>,
                upcoming: <Badge variant="mint" size="sm">Upcoming</Badge>
              }[state] || <Badge variant="mint" size="sm">{state}</Badge>;

              return (
                <Card key={idx} variant="white" radius="md" padding="md" className="border border-[#8EB69B]/30 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-[#051F20]">
                      Minute {cp.at_minute}m
                    </span>
                    {stateBadge}
                  </div>
                  <h5 className="text-xs font-bold text-[#051F20] leading-snug">
                    {cp.check}
                  </h5>
                  {cp.how && (
                    <p className="text-[11px] text-[#49645C] leading-normal pt-1 border-t border-[#DAF1DE]">
                      <strong>Validation:</strong> {cp.how}
                    </p>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}

export default TrackerPage;
