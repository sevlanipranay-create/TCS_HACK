import React, { useState, useEffect, useCallback } from 'react';
import PageContainer from '../components/layout/PageContainer.jsx';
import Card from '../components/common/Card.jsx';
import Badge from '../components/common/Badge.jsx';
import Button from '../components/common/Button.jsx';
import Input from '../components/common/Input.jsx';
import Textarea from '../components/common/Textarea.jsx';
import Select from '../components/common/Select.jsx';
import AIInsight from '../components/ai/AIInsight.jsx';
import AIQuestion from '../components/ai/AIQuestion.jsx';
import LoadingState from '../components/common/LoadingState.jsx';
import { api } from '../services/api.js';
import { mockProblem } from '../mock/problem.js';
import {
  Search,
  Sparkles,
  AlertTriangle,
  Users,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldAlert,
  HelpCircle,
  RotateCcw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ProblemAnalysis = () => {
  const navigate = useNavigate();

  // Form State
  const [statement, setStatement] = useState(mockProblem.statement);
  const [teamSize, setTeamSize] = useState('4');
  const [teamSkills, setTeamSkills] = useState('React, Python, FastAPI, PostgreSQL, Tailwind');
  const [experience, setExperience] = useState('Intermediate');
  const [availableTime, setAvailableTime] = useState('6');

  // Analysis State
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  const handleAnalyze = useCallback(async (customStatement) => {
    setLoading(true);
    const targetStatement = customStatement !== undefined ? customStatement : statement;
    try {
      const res = await api.analyzeProblem({
        statement: targetStatement,
        teamSize,
        teamSkills: teamSkills.split(',').map((s) => s.trim()),
        experience,
        availableTime
      });
      setAnalysisResult(res);
    } catch (err) {
      console.error('Failed to analyze problem:', err);
    } finally {
      setLoading(false);
    }
  }, [statement, teamSize, teamSkills, experience, availableTime]);

  // Auto-run initial analysis on mount
  useEffect(() => {
    handleAnalyze();
  }, [handleAnalyze]);


  const handleLoadVagueExample = () => {
    const vague = "Use AI to improve education.";
    setStatement(vague);
    handleAnalyze(vague);
  };

  const handleLoadStrongExample = () => {
    setStatement(mockProblem.statement);
    handleAnalyze(mockProblem.statement);
  };

  return (
    <PageContainer
      title="01 Problem Statement Analyzer"
      subtitle="Analyze, deconstruct, and rigorously stress-test your hackathon problem statement before writing a line of code."
      badge={<Badge variant="mint" size="sm">Core Mentor Engine</Badge>}
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleLoadVagueExample}
            className="text-xs"
          >
            Load Vague Example (Test Edge Case)
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLoadStrongExample}
            className="text-xs"
          >
            Reset to Logistics
          </Button>
        </div>
      }
    >
      {/* Input Section Card */}
      <Card variant="white" radius="hero" className="border border-[#8EB69B]/30 shadow-sm">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAnalyze();
          }}
          className="space-y-4"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#DAF1DE] pb-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#051F20] flex items-center gap-2">
              <Search className="w-4 h-4 text-[#8EB69B]" />
              Input Hackathon Problem & Constraints
            </h3>
            <span className="text-xs text-[#71877E]">AI evaluates specificity, users, and scope</span>
          </div>

          <Textarea
            label="Problem Statement"
            required
            rows={3}
            placeholder="Describe the real-world friction, current broken workflow, and impact..."
            value={statement}
            onChange={(e) => setStatement(e.target.value)}
            helperText="Be as specific as possible. Vague or broad statements will trigger mentor clarification."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Select
              label="Team Size"
              value={teamSize}
              onChange={(e) => setTeamSize(e.target.value)}
              options={[
                { value: '1', label: '1 Solo Developer' },
                { value: '2', label: '2 Developers' },
                { value: '3', label: '3 Developers' },
                { value: '4', label: '4 Developers (Full Team)' },
                { value: '5', label: '5+ Developers' }
              ]}
            />

            <Select
              label="Experience Level"
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              options={[
                { value: 'Beginner', label: 'Beginner / First Hackathon' },
                { value: 'Intermediate', label: 'Intermediate' },
                { value: 'Advanced', label: 'Advanced / Veteran' }
              ]}
            />

            <Select
              label="Available Time"
              value={availableTime}
              onChange={(e) => setAvailableTime(e.target.value)}
              options={[
                { value: '3', label: '3 Hours (Sprint)' },
                { value: '6', label: '6 Hours (Half Day)' },
                { value: '12', label: '12 Hours (Standard)' },
                { value: '24', label: '24 Hours (Full Overnight)' }
              ]}
            />

            <Input
              label="Team Skills"
              value={teamSkills}
              onChange={(e) => setTeamSkills(e.target.value)}
              placeholder="e.g. React, Python, Docker"
              helperText="Comma separated"
            />
          </div>

          <div className="flex items-center justify-end pt-2">
            <Button
              type="submit"
              variant="mint"
              size="md"
              loading={loading}
              icon={Sparkles}
            >
              Analyze Problem
            </Button>
          </div>
        </form>
      </Card>

      {/* Loading State */}
      {loading && (
        <Card variant="white" radius="lg">
          <LoadingState
            message="Deconstructing problem statement..."
            subtext="Evaluating user personas, extracting pain points, and testing for vague scope assumptions."
          />
        </Card>
      )}

      {/* Structured Output Section */}
      {!loading && analysisResult && (
        <>
          {/* EDGE CASE: VAGUE PROBLEM STATEMENT DETECTED */}
          {analysisResult.isVague ? (
            <div className="space-y-6 animate-fadeIn">
              <AIInsight
                type="warning"
                title={analysisResult.clarification.warningTitle}
              >
                <p className="font-semibold text-sm text-[#051F20] mb-1">
                  "{analysisResult.statement}"
                </p>
                <p className="text-xs text-[#49645C]">
                  {analysisResult.clarification.warningDescription}
                </p>
              </AIInsight>

              <Card variant="white" radius="hero" className="border-2 border-[#C99A3D]/40 p-6 space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#C99A3D]/15 text-[#C99A3D] flex items-center justify-center font-bold">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#051F20]">
                      The AI Mentor needs clarification before generating solutions:
                    </h3>
                    <p className="text-xs text-[#71877E]">
                      Answer these 4 fundamental questions to turn this into a winning hackathon pitch:
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-2">
                  {analysisResult.clarification.questions.map((q, idx) => (
                    <AIQuestion
                      key={idx}
                      number={idx + 1}
                      question={q}
                      hint="Judges instantly disqualify projects where target users and measurable outcomes are ambiguous."
                    />
                  ))}
                </div>

                <div className="pt-3 border-t border-[#DAF1DE] flex flex-col sm:flex-row items-center justify-between gap-3">
                  <span className="text-xs text-[#71877E]">
                    Refine your problem statement above with the answers to these questions.
                  </span>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleLoadStrongExample}
                    icon={RotateCcw}
                  >
                    Switch to High-Clarity Logistics Problem
                  </Button>
                </div>
              </Card>
            </div>
          ) : (
            /* SUCCESSFUL STRUCTURED DECONSTRUCTION */
            <div className="space-y-6 animate-fadeIn">
              {/* Problem Summary & Expected Outcome */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card variant="white" radius="lg" className="border-l-4 border-l-[#051F20]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#71877E]">
                    Problem Summary
                  </span>
                  <h4 className="text-base font-bold text-[#051F20] mt-1 leading-snug">
                    {analysisResult.problemSummary}
                  </h4>
                  <p className="text-xs text-[#49645C] mt-2 italic">
                    Focus: Eliminates arbitrary routing dispatch and optimizes vehicular fuel curves.
                  </p>
                </Card>

                <Card variant="mintLight" radius="lg" className="border-l-4 border-l-[#8EB69B]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#163832]">
                    Expected Hackathon Outcome
                  </span>
                  <h4 className="text-base font-bold text-[#051F20] mt-1 leading-snug">
                    {analysisResult.expectedOutcome}
                  </h4>
                  <p className="text-xs text-[#163832] mt-2 font-medium">
                    Deliverable: Interactive dashboard with tangible 20%+ emission delta proof.
                  </p>
                </Card>
              </div>

              {/* Target Users & Pain Points */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Target Users */}
                <Card variant="white" radius="lg" className="space-y-3">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-[#051F20] flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#8EB69B]" />
                    Target Users
                  </h4>
                  <div className="space-y-2.5">
                    {analysisResult.targetUsers?.map((u, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-[11px] bg-[#EAF6EA]/40 border border-[#DAF1DE] text-xs"
                      >
                        <span className="font-bold text-[#051F20] block mb-0.5">
                          {u.role}
                        </span>
                        <span className="text-[#49645C]">{u.context}</span>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Pain Points */}
                <Card variant="white" radius="lg" className="space-y-3">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-[#051F20] flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-[#C99A3D]" />
                    Validated Pain Points
                  </h4>
                  <div className="space-y-2.5">
                    {analysisResult.painPoints?.map((p, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-[11px] bg-white border border-[#DAF1DE] text-xs flex items-start gap-2.5"
                      >
                        <span className="w-5 h-5 rounded-full bg-[#C75C5C]/10 text-[#C75C5C] font-bold flex items-center justify-center shrink-0 text-[11px]">
                          {i + 1}
                        </span>
                        <span className="text-[#051F20] font-medium leading-relaxed">{p}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              {/* Requirements & Constraints & Assumptions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Key Requirements */}
                <Card variant="white" radius="md" className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#051F20] flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#4F8A6A]" />
                    Key Requirements
                  </h4>
                  <ul className="space-y-2 text-xs text-[#49645C]">
                    {analysisResult.keyRequirements?.map((req, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-[#8EB69B]">•</span>
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </Card>

                {/* Constraints */}
                <Card variant="white" radius="md" className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#051F20] flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#C99A3D]" />
                    Sprint Constraints
                  </h4>
                  <ul className="space-y-2 text-xs text-[#49645C]">
                    {analysisResult.constraints?.map((c, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-[#C99A3D]">•</span>
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </Card>

                {/* Assumptions */}
                <Card variant="white" radius="md" className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#051F20] flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-[#5C8AC7]" />
                    Core Assumptions
                  </h4>
                  <ul className="space-y-2 text-xs text-[#49645C]">
                    {analysisResult.assumptions?.map((a, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-[#5C8AC7]">•</span>
                        <span>{a}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              </div>

              {/* Key Mentor Probing Questions for Pitch */}
              <Card variant="dark" radius="lg" className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-[#8EB69B] flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Key Questions Judges Will Ask You
                  </h4>
                  <Badge variant="forest" size="sm">
                    Judge Prep
                  </Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-[#DAF1DE]">
                  {analysisResult.keyQuestions?.map((kq, i) => (
                    <div key={i} className="p-3 rounded-lg bg-[#051F20] border border-[#163832]">
                      <span className="text-[#8EB69B] font-bold block mb-1">
                        Question #{i + 1}
                      </span>
                      {kq}
                    </div>
                  ))}
                </div>
              </Card>

              {/* Next Step Action Button */}
              <div className="flex justify-end pt-2">
                <Button
                  variant="mint"
                  size="md"
                  onClick={() => navigate('/solutions')}
                  icon={ArrowRight}
                >
                  Proceed to 02 Solution Lab
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </PageContainer>
  );
};

export default ProblemAnalysis;
