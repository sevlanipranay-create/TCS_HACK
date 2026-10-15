import React, { useState } from 'react';
import { useSession } from '../state/SessionContext.jsx';
import PageContainer from '../components/layout/PageContainer.jsx';
import Card from '../components/common/Card.jsx';
import Button from '../components/common/Button.jsx';
import Badge from '../components/common/Badge.jsx';
import ProjectCard from '../components/project/ProjectCard.jsx';
import AIRecommendation from '../components/ai/AIRecommendation.jsx';
import FeasibilityBanner from '../components/FeasibilityBanner.jsx';
import SourceTag from '../components/SourceTag.jsx';
import Spinner from '../components/Spinner.jsx';
import Tabs from '../components/Tabs.jsx';
import { Sparkles, Download, ArrowRight, Lightbulb, Target } from '../components/common/Icons.jsx';
import { exportMarkdown, downloadFile } from '../lib/format.js';

import ProblemTab from './brief/ProblemTab.jsx';
import SolutionTab from './brief/SolutionTab.jsx';
import UsersTab from './brief/UsersTab.jsx';
import TechTab from './brief/TechTab.jsx';
import MvpTab from './brief/MvpTab.jsx';
import WorkflowTab from './brief/WorkflowTab.jsx';
import PitchTab from './brief/PitchTab.jsx';

const BRIEF_TABS = [
  { id: 'problem', label: '1. Problem Analysis' },
  { id: 'solution', label: '2. Expected Solution' },
  { id: 'users', label: '3. Personas & Users' },
  { id: 'tech', label: '4. Tech Architecture' },
  { id: 'mvp', label: '5. MVP Scoping' },
  { id: 'workflow', label: '6. Sprint Workflow' },
  { id: 'pitch', label: '7. Pitch & Jury Outline' }
];

export function BriefPage() {
  const {
    problem,
    setProblem,
    team,
    brief,
    progress,
    lastJudge,
    createBrief,
    setPage,
    loading
  } = useSession();

  const [activeTab, setActiveTab] = useState('problem');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!problem || problem.trim().length < 10 || loading) return;
    try {
      await createBrief(problem.trim(), team);
      setActiveTab('problem');
    } catch (_) {}
  };

  const handleDownload = () => {
    if (!brief) return;
    const md = exportMarkdown({ brief, progress, lastJudge });
    const filename = `mentor-brief-${(brief.problem?.domain || 'hackathon').toLowerCase().replace(/\s+/g, '-')}.md`;
    downloadFile(filename, md, 'text/markdown');
  };

  const isSubmittable = problem && problem.trim().length >= 10 && !loading;

  return (
    <PageContainer
      title="01 Problem Brief & Command Center"
      subtitle="AI-guided problem deconstruction, persona discovery, MVP scoping, and feasibility assessment."
      badge={
        brief ? (
          <Badge variant="mint" size="sm">
            {brief.source === 'llm' ? '✨ AI Synthesized' : '📋 Rules Baseline'}
          </Badge>
        ) : null
      }
      actions={
        brief ? (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              icon={Download}
            >
              Export Markdown
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setPage('tracker')}
              icon={ArrowRight}
            >
              Sprint Tracker
            </Button>
          </div>
        ) : null
      }
    >
      {/* Problem Input Section */}
      <Card variant="white" radius="hero" className="border border-[#8EB69B]/30 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex items-center justify-between">
            <label htmlFor="problem-input" className="text-sm font-bold text-[#051F20]">
              Hackathon Problem Statement
            </label>
            <span className={`text-xs ${problem.length < 10 ? 'text-[#C75C5C] font-semibold' : 'text-[#71877E]'}`}>
              {problem.length} / 4000 chars {problem.length < 10 ? '(min 10 characters required)' : ''}
            </span>
          </div>

          <textarea
            id="problem-input"
            rows={3}
            value={problem}
            onChange={(e) => setProblem(e.target.value)}
            placeholder="Paste your hackathon problem statement here... (e.g. Canteen food wastage monitoring system for college campuses)"
            disabled={loading}
            className="w-full p-3 rounded-[12px] border border-[#DAF1DE] bg-[#FAFCFA] text-sm text-[#051F20] focus:border-[#8EB69B] outline-none transition-all leading-relaxed"
          />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <div className="text-xs text-[#49645C] flex flex-wrap items-center gap-2">
              <span className="font-semibold text-[#051F20]">Team: {team.team_size} members</span>
              <span>•</span>
              <span className="font-semibold text-[#051F20]">{team.minutes_available} minutes</span>
              {team.skills?.length > 0 && (
                <>
                  <span>•</span>
                  <span>Skills: {team.skills.join(', ')}</span>
                </>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={!isSubmittable}
              loading={loading}
              icon={Sparkles}
              id="btn-get-brief"
            >
              {loading ? 'Analyzing Problem...' : '⚡ Get Mentor Brief'}
            </Button>
          </div>
        </form>
      </Card>

      {/* Brief Content Section */}
      {brief ? (
        <div className="space-y-6">
          {/* Hero Project Card */}
          <ProjectCard
            project={{
              title: brief.problem?.domain ? `${brief.problem.domain} Solution Plan` : 'Hackathon Sprint',
              tagline: brief.problem?.summary || 'Coaching blueprint generated by Hackathon Mentor AI.',
              hackathonName: 'TCS Tech Day @ VESIT',
              teamName: team.preferred_stack || 'Student Team',
              teamMembers: Array.from({ length: team.team_size }).map((_, i) => ({
                id: `tm-${i}`,
                name: `Member ${i + 1}`,
                role: ['Frontend', 'Backend', 'AI', 'Integrator'][i % 4],
                skills: team.skills
              })),
              timeRemaining: `${team.minutes_available}m`,
              availableTimeHours: (team.minutes_available / 60).toFixed(1),
              overallProgress: progress?.percent_done ?? 0,
              currentStage: progress?.status ? progress.status.replace('_', ' ') : 'Active'
            }}
          />

          {/* AI Recommendation Banner */}
          {brief.feasibility && (
            <AIRecommendation
              title={`Mentor Verdict: Scope is ${brief.feasibility.verdict.toUpperCase()}`}
              description={brief.feasibility.message}
              actionText="Inspect MVP Must-Haves"
              onAction={() => setActiveTab('mvp')}
              factors={[
                { factor: 'Feasibility Score', comment: `${brief.feasibility.score} / 100 on rubric` },
                { factor: 'Capacity Budget', comment: `${brief.feasibility.used_points} used of ${brief.feasibility.budget_points} budget points` },
                { factor: 'Team Capacity', comment: `${team.team_size} members for ${team.minutes_available} minutes` }
              ]}
            />
          )}

          {/* Feasibility Banner */}
          {brief.feasibility && <FeasibilityBanner feasibility={brief.feasibility} />}

          {/* Sub-Tabs Switcher */}
          <Tabs tabs={BRIEF_TABS} activeTab={activeTab} onChange={setActiveTab} />

          {/* Tab Views */}
          <div className="min-h-[300px]">
            {activeTab === 'problem' && <ProblemTab problem={brief.problem} />}
            {activeTab === 'solution' && (
              <SolutionTab expectedSolution={brief.expected_solution} yourCall={brief.your_call} />
            )}
            {activeTab === 'users' && <UsersTab personas={brief.personas} />}
            {activeTab === 'tech' && <TechTab tech={brief.tech} />}
            {activeTab === 'mvp' && <MvpTab mvp={brief.mvp} features={brief.features} />}
            {activeTab === 'workflow' && (
              <WorkflowTab workflow={brief.workflow} checkpoints={brief.checkpoints} tasks={brief.tasks} />
            )}
            {activeTab === 'pitch' && (
              <PitchTab brief={brief} progress={progress} lastJudge={lastJudge} />
            )}
          </div>
        </div>
      ) : (
        /* Empty State */
        <Card variant="white" radius="hero" className="text-center p-12 border border-[#8EB69B]/20 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-[#EAF6EA] border border-[#8EB69B]/40 flex items-center justify-center text-2xl mx-auto mb-4">
            🧭
          </div>
          <h3 className="text-lg font-bold text-[#051F20] mb-2">
            No Mentor Brief Active Yet
          </h3>
          <p className="text-sm text-[#49645C] max-w-md mx-auto mb-5 leading-relaxed">
            Paste your problem statement above or select one of the pre-configured TCS problem samples from the sidebar to generate a 7-stage architecture and sprint schedule.
          </p>
        </Card>
      )}
    </PageContainer>
  );
}

export default BriefPage;
