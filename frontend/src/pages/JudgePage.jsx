import React, { useState } from 'react';
import { useSession } from '../state/SessionContext.jsx';
import PageContainer from '../components/layout/PageContainer.jsx';
import Card from '../components/common/Card.jsx';
import Button from '../components/common/Button.jsx';
import Badge from '../components/common/Badge.jsx';
import ScoreBar from '../components/ScoreBar.jsx';
import SourceTag from '../components/SourceTag.jsx';
import Spinner from '../components/Spinner.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { Scale, Sparkles, CheckCircle2, ChevronRight, AlertTriangle, Lightbulb } from '../components/common/Icons.jsx';
import { DISCLAIMER } from '../lib/contract.js';

export function JudgePage() {
  const {
    brief,
    lastJudge,
    submitJudge,
    setPage,
    loading
  } = useSession();

  const [ideaSummary, setIdeaSummary] = useState('');
  const [featuresBuiltText, setFeaturesBuiltText] = useState('');
  const [demoScript, setDemoScript] = useState('');
  const [knownLimitsText, setKnownLimitsText] = useState('');
  const [minutesLeft, setMinutesLeft] = useState('');

  const [expandedQuestionIdx, setExpandedQuestionIdx] = useState(0);
  const [tickedImprovements, setTickedImprovements] = useState({});

  const handlePrefillFromMvp = () => {
    if (!brief) return;
    if (brief.expected_solution?.goal && !ideaSummary) {
      setIdeaSummary(brief.expected_solution.goal);
    }
    if (brief.mvp?.must_have?.length) {
      const featureNames = brief.mvp.must_have.map((mh) => mh.name).join('\n');
      setFeaturesBuiltText(featureNames);
    }
    if (brief.mvp?.demo_path?.length && !demoScript) {
      setDemoScript(brief.mvp.demo_path.join('\n'));
    }
  };

  const handleRunJudge = async (e) => {
    e.preventDefault();
    if (loading) return;

    const features_built = featuresBuiltText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const known_limits = knownLimitsText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const minLeftNum = minutesLeft === '' ? null : Number(minutesLeft);

    try {
      await submitJudge({
        idea_summary: ideaSummary.trim(),
        features_built,
        demo_script: demoScript.trim(),
        known_limits,
        minutes_left: minLeftNum !== null && !isNaN(minLeftNum) ? minLeftNum : null
      });
    } catch (_) {}
  };

  const toggleImprovementTick = (idx) => {
    setTickedImprovements((prev) => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  if (!brief) {
    return (
      <PageContainer title="04 Practice Judge Review">
        <EmptyState
          icon="⚖️"
          title="Create a brief first"
          description="Judge mode scores your project against transparent jury rubrics, surfaces anticipated questions, and ranks rapid improvements."
          actionLabel="Go to Mentor Brief"
          onAction={() => setPage('brief')}
        />
      </PageContainer>
    );
  }

  const report = lastJudge;

  const readinessBadge = report?.readiness ? {
    ready: <Badge variant="success" size="sm">Ready for Jury</Badge>,
    almost_ready: <Badge variant="warning" size="sm">Almost Ready</Badge>,
    needs_work: <Badge variant="error" size="sm">Needs Work</Badge>
  }[report.readiness] || <Badge variant="mint" size="sm">{report.readiness}</Badge> : null;

  return (
    <PageContainer
      title="04 Practice Judge Review"
      subtitle="Deterministic practice review against a transparent jury rubric. Evaluates scope realism, demo flow, and presentation readiness."
      badge={readinessBadge || <Badge variant="warning" size="sm">Rubric Ready</Badge>}
      actions={
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrefillFromMvp}
          icon={Sparkles}
          id="btn-prefill-mvp"
        >
          Prefill from MVP
        </Button>
      }
    >
      {/* Submission Form Section */}
      <Card variant="white" radius="hero" className="border border-[#8EB69B]/30 shadow-sm space-y-4">
        <div>
          <h3 className="text-base font-extrabold text-[#051F20]">
            Review Submission Inputs
          </h3>
          <p className="text-xs text-[#49645C]">
            Fill in your current build state to receive simulated scoring, anticipated questions, and high-impact improvements.
          </p>
        </div>

        <form onSubmit={handleRunJudge} className="space-y-4">
          <div>
            <label htmlFor="judge-idea-summary" className="text-xs font-bold text-[#051F20] block mb-1">
              Idea & Project Summary:
            </label>
            <textarea
              id="judge-idea-summary"
              rows={2}
              value={ideaSummary}
              onChange={(e) => setIdeaSummary(e.target.value)}
              placeholder="e.g. Automated canteen surplus prediction and real-time food reservation portal."
              className="w-full p-3 rounded-[12px] border border-[#DAF1DE] bg-[#FAFCFA] text-xs text-[#051F20] focus:border-[#8EB69B] outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="judge-features-built" className="text-xs font-bold text-[#051F20] block mb-1">
                Features Actually Built (One per line):
              </label>
              <textarea
                id="judge-features-built"
                rows={4}
                value={featuresBuiltText}
                onChange={(e) => setFeaturesBuiltText(e.target.value)}
                placeholder="Real-time meal log API&#10;Student reservation UI&#10;Surplus alert notification"
                className="w-full p-3 rounded-[12px] border border-[#DAF1DE] bg-[#FAFCFA] text-xs text-[#051F20] focus:border-[#8EB69B] outline-none"
              />
            </div>

            <div>
              <label htmlFor="judge-demo-script" className="text-xs font-bold text-[#051F20] block mb-1">
                Demo Script & Walkthrough (One step per line):
              </label>
              <textarea
                id="judge-demo-script"
                rows={4}
                value={demoScript}
                onChange={(e) => setDemoScript(e.target.value)}
                placeholder="1. Open dashboard to view real-time surplus&#10;2. Student reserves 2 meal boxes&#10;3. Kitchen inventory decrements live"
                className="w-full p-3 rounded-[12px] border border-[#DAF1DE] bg-[#FAFCFA] text-xs text-[#051F20] focus:border-[#8EB69B] outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="judge-known-limits" className="text-xs font-bold text-[#051F20] block mb-1">
                Known Limits / Trade-offs (One per line):
              </label>
              <textarea
                id="judge-known-limits"
                rows={2}
                value={knownLimitsText}
                onChange={(e) => setKnownLimitsText(e.target.value)}
                placeholder="SMS alerts use sandbox gateway&#10;Data resets on server reboot"
                className="w-full p-3 rounded-[12px] border border-[#DAF1DE] bg-[#FAFCFA] text-xs text-[#051F20] focus:border-[#8EB69B] outline-none"
              />
            </div>

            <div>
              <label htmlFor="judge-minutes-left" className="text-xs font-bold text-[#051F20] block mb-1">
                Minutes Left Before Presentation (Optional):
              </label>
              <input
                id="judge-minutes-left"
                type="number"
                min="0"
                max="600"
                value={minutesLeft}
                onChange={(e) => setMinutesLeft(e.target.value)}
                placeholder="e.g. 20 (leave blank if not applicable)"
                className="w-full p-3 rounded-[12px] border border-[#DAF1DE] bg-[#FAFCFA] text-xs text-[#051F20] focus:border-[#8EB69B] outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={loading}
              loading={loading}
              icon={Scale}
              id="btn-run-judge"
              className="px-6"
            >
              {loading ? 'Evaluating Rubrics...' : '⚖️ Run Judge Mode'}
            </Button>
          </div>
        </form>
      </Card>

      {/* Evaluation Results Section */}
      {report && (
        <div className="space-y-6 animate-fadeIn">
          {/* Overall Score Card */}
          <Card variant="white" radius="hero" className="border border-[#8EB69B]/30 shadow-sm p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#71877E]">
                  Jury Evaluation Overall Score
                </span>
                <div className="flex items-baseline gap-3 mt-1">
                  <span className="text-4xl font-black text-[#051F20]">
                    {report.overall}
                    <span className="text-lg font-normal text-[#71877E]"> / 100</span>
                  </span>
                  {readinessBadge}
                </div>
              </div>
              <SourceTag source={report.source} />
            </div>

            <div className="progress-track" style={{ height: '12px' }}>
              <div
                className="progress-fill"
                style={{
                  width: `${report.overall}%`,
                  backgroundColor:
                    report.overall >= 80
                      ? 'var(--color-brand-mint)'
                      : report.overall >= 60
                      ? 'var(--color-status-warning)'
                      : 'var(--color-status-error)'
                }}
              />
            </div>
          </Card>

          {/* 5 Fixed Criteria Table */}
          <Card variant="white" radius="hero" className="border border-[#8EB69B]/30 shadow-sm p-6 space-y-4">
            <h4 className="text-sm font-extrabold text-[#051F20] uppercase tracking-wider">
              5 Fixed Criteria Scores
            </h4>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: '220px' }}>Criterion</th>
                    <th style={{ width: '150px' }}>Score</th>
                    <th>Evidence</th>
                    <th>How to Improve</th>
                  </tr>
                </thead>
                <tbody>
                  {(report.criteria || []).map((crit) => (
                    <tr key={crit.name}>
                      <td><strong>{crit.name}</strong></td>
                      <td>
                        <ScoreBar score={crit.score} max={5} />
                      </td>
                      <td className="text-xs text-[#051F20]">{crit.evidence}</td>
                      <td className="text-xs text-[#49645C]">{crit.improve}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Likely Jury Questions & Top Improvements Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 5 Likely Jury Questions */}
            <Card variant="white" radius="hero" className="border border-[#8EB69B]/30 shadow-sm p-6 space-y-3">
              <h4 className="text-sm font-extrabold text-[#051F20] uppercase tracking-wider">
                5 Likely Jury Questions
              </h4>
              <div className="space-y-2.5">
                {(report.likely_questions || []).map((q, idx) => {
                  const isExpanded = expandedQuestionIdx === idx;
                  return (
                    <div
                      key={idx}
                      className="p-3.5 rounded-[12px] border border-[#DAF1DE] bg-[#FAFCFA] transition-all"
                    >
                      <div
                        onClick={() => setExpandedQuestionIdx(isExpanded ? -1 : idx)}
                        className="flex items-center justify-between cursor-pointer"
                      >
                        <strong className="text-xs font-bold text-[#051F20]">
                          Q{idx + 1}: {q.question}
                        </strong>
                        <span className="text-xs text-[#71877E] ml-2">
                          {isExpanded ? '▲' : '▼'}
                        </span>
                      </div>

                      {isExpanded && (
                        <div className="mt-2.5 pt-2.5 border-t border-[#DAF1DE] text-xs space-y-1.5">
                          <p className="text-[#49645C]">
                            <strong>Why jury asks:</strong> {q.why_asked}
                          </p>
                          <p className="text-[#163832] font-semibold">
                            <strong>Answer strategy:</strong> {q.answer_hint}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Top 3 Rapid Improvements Checklist */}
            <Card variant="mintLight" radius="hero" className="border border-[#8EB69B] shadow-sm p-6 space-y-3">
              <h4 className="text-sm font-extrabold text-[#051F20] uppercase tracking-wider">
                Top 3 Rapid Improvements
              </h4>
              <p className="text-xs text-[#49645C]">
                High-yield modifications to tick off before the final presentation.
              </p>
              <div className="space-y-2.5">
                {(report.top_improvements || []).map((imp, idx) => {
                  const isChecked = Boolean(tickedImprovements[idx]);
                  return (
                    <label
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-[12px] bg-white border border-[#8EB69B]/40 cursor-pointer shadow-2xs select-none"
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleImprovementTick(idx)}
                          style={{ accentColor: 'var(--color-brand-deepest)', width: '16px', height: '16px', cursor: 'pointer' }}
                        />
                        <span className={`text-xs ${isChecked ? 'line-through text-[#71877E]' : 'font-semibold text-[#051F20]'}`}>
                          {imp.action}
                        </span>
                      </div>
                      <Badge variant="mint" size="sm">
                        {imp.minutes}m
                      </Badge>
                    </label>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* Exact Disclaimer Text */}
          <div className="text-center py-2 text-xs text-[#71877E]">
            <em>{report.disclaimer || DISCLAIMER}</em>
          </div>
        </div>
      )}
    </PageContainer>
  );
}

export default JudgePage;
