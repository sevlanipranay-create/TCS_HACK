import React, { useState, useEffect } from 'react';
import PageContainer from '../components/layout/PageContainer.jsx';
import Card from '../components/common/Card.jsx';
import Badge from '../components/common/Badge.jsx';
import Button from '../components/common/Button.jsx';
import Tabs from '../components/common/Tabs.jsx';
import ProgressBar from '../components/common/ProgressBar.jsx';
import ScoreCard from '../components/project/ScoreCard.jsx';
import AIRecommendation from '../components/ai/AIRecommendation.jsx';
import AIInsight from '../components/ai/AIInsight.jsx';
import LoadingState from '../components/common/LoadingState.jsx';
import { api } from '../services/api.js';
import {
  Award,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  Sliders,
  CheckSquare,
  HelpCircle,
  TrendingUp,
  Cpu
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Readiness = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('readiness');
  const [readiness, setReadiness] = useState(null);
  const [validationData, setValidationData] = useState(null);
  const [improvementData, setImprovementData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getReadinessScore(),
      api.getValidationAndEdgeCases(),
      api.getSolutionImprovement()
    ]).then(([rData, vData, iData]) => {
      setReadiness(rData);
      setValidationData(vData);
      setImprovementData(iData);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <PageContainer>
        <LoadingState message="Auditing Hackathon Readiness & Compliance..." />
      </PageContainer>
    );
  }

  const tabOptions = [
    { id: 'readiness', label: '🏆 Readiness Score (82/100)' },
    { id: 'validation', label: '🧪 User Validation & Edge Cases' },
    { id: 'improvement', label: '🚀 Improve My Solution' }
  ];

  return (
    <PageContainer
      title="Hackathon Readiness & Quality Audit"
      subtitle="Holistic 8-dimension pre-submission evaluation, assumption validation checkpoints, and edge case defense."
      badge={<Badge variant="mint" size="sm">Overall Score: {readiness.overallScore}/100</Badge>}
      actions={
        <Button
          variant="primary"
          size="sm"
          onClick={() => navigate('/judge')}
          icon={Sparkles}
        >
          Rehearse with Judges
        </Button>
      }
    >
      {/* Navigation Tabs */}
      <Tabs
        tabs={tabOptions}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* TAB 1: READINESS DASHBOARD (Section 24) */}
      {activeTab === 'readiness' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Hero Overall Score Banner */}
          <Card variant="white" radius="hero" className="border border-[#8EB69B]/40 shadow-sm p-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-2 max-w-xl">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#71877E]">
                  Composite Hackathon Evaluation
                </span>
                <div className="flex items-baseline gap-3">
                  <h2 className="text-4xl font-black text-[#051F20]">
                    {readiness.overallScore}
                  </h2>
                  <span className="text-sm font-bold text-[#49645C]">
                    / 100 Overall Readiness Index
                  </span>
                  <Badge variant="mint" size="md">
                    Top 10% Contender
                  </Badge>
                </div>
                <p className="text-xs text-[#71877E] leading-relaxed">
                  Based on TCS Hackathon evaluation criteria: Problem Understanding, Architecture, MVP Viability, User Empathy, and Presentation Preparedness.
                </p>
              </div>

              {/* Next Action Callout in Hero */}
              <div className="lg:w-96 bg-[#DAF1DE]/60 p-4 rounded-[16px] border border-[#8EB69B]/40 space-y-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#163832]">
                  Mentor Directive
                </span>
                <p className="text-xs font-bold text-[#051F20] leading-snug">
                  "{readiness.nextAction}"
                </p>
              </div>
            </div>
          </Card>

          {/* 8-Dimension Breakdown Grid */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#051F20] px-1">
              8-Dimension Readiness Breakdown
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {readiness.dimensions?.map((dim, idx) => (
                <ScoreCard
                  key={idx}
                  title={dim.label}
                  score={dim.score}
                  maxScore={100}
                  status={dim.status}
                />
              ))}
            </div>
          </div>

          {/* Strong Areas, Weak Areas & Critical Issues */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Strong Areas */}
            <Card variant="white" radius="lg" className="border-t-4 border-t-[#4F8A6A] space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#4F8A6A] flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Strong Areas
              </span>
              <ul className="space-y-2 text-xs text-[#051F20]">
                {readiness.strongAreas?.map((item, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-[#4F8A6A] font-bold">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Card>

            {/* Weak Areas */}
            <Card variant="white" radius="lg" className="border-t-4 border-t-[#C99A3D] space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#C99A3D] flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" /> Weak Areas
              </span>
              <ul className="space-y-2 text-xs text-[#051F20]">
                {readiness.weakAreas?.map((item, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-[#C99A3D] font-bold">⚠</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Card>

            {/* Critical Issues */}
            <Card variant="white" radius="lg" className="border-t-4 border-t-[#C75C5C] space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#C75C5C] flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4" /> Critical Submission Blockers
              </span>
              <ul className="space-y-2 text-xs text-[#051F20]">
                {readiness.criticalIssues?.map((item, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-[#C75C5C] font-bold">!</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 2: VALIDATION & EDGE CASES (Sections 19 & 20) */}
      {activeTab === 'validation' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Section 19: User Assumption Testing */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#051F20] flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-[#8EB69B]" />
                User Validation Checkpoints (Section 19)
              </h3>
              <Badge variant="mint" size="sm">
                4-Question Framework
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {validationData?.validationItems?.map((val) => (
                <Card key={val.id} variant="white" radius="lg" className="border border-[#DAF1DE] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#051F20]">{val.question}</span>
                    <Badge variant={val.status === 'Verified' ? 'success' : 'warning'} size="sm">
                      {val.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-[#49645C] bg-[#EAF6EA]/50 p-2.5 rounded-lg border border-[#DAF1DE]">
                    {val.answer}
                  </p>
                  <div className="text-xs space-y-1.5 pt-1 text-[#71877E]">
                    <div>
                      <strong className="text-[#051F20]">Assumption Tested:</strong> {val.assumption}
                    </div>
                    <div>
                      <strong className="text-[#051F20]">Test Methodology:</strong> {val.howToTest}
                    </div>
                    <div>
                      <strong className="text-[#4F8A6A]">Success Indicator:</strong> {val.successMetric}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Section 20: Edge Case Generator */}
          <div className="space-y-4 pt-4 border-t border-[#DAF1DE]">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#051F20] flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-[#C99A3D]" />
                  Edge Case Defense Matrix (Section 20)
                </h3>
                <p className="text-xs text-[#71877E]">
                  Pre-empting system failures and difficult judge edge-case questions.
                </p>
              </div>
              <Badge variant="success" size="sm">
                All 4 Cases Protected
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {validationData?.edgeCases?.map((ec) => (
                <Card key={ec.id} variant="white" radius="lg" className="border border-[#DAF1DE] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#051F20]">Problem: {ec.problem}</span>
                    <Badge variant="success" size="sm">{ec.status}</Badge>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#EAF6EA]/40 text-xs text-[#051F20]">
                    <strong className="text-[#163832] block mb-0.5">Expected System Behavior:</strong>
                    {ec.systemBehavior}
                  </div>
                  <div className="text-xs text-[#C75C5C] font-medium">
                    Risk Addressed: {ec.risk}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: IMPROVE MY SOLUTION (Section 21) */}
      {activeTab === 'improvement' && (
        <div className="space-y-6 animate-fadeIn">
          <AIRecommendation
            title="Solution Improvement Audit: 84/100 Solution Quality"
            description="The AI Mentor evaluated your Problem, Users, Solution, MVP, Technology, and Pitch Story."
            factors={[
              { factor: 'Value Proposition', comment: 'Quantifiable carbon & transit savings' },
              { factor: 'Demo Resilience', comment: '100% in-browser deterministic calculations' },
              { factor: 'Presentation Gap', comment: 'Needs visual competitor benchmark chart' }
            ]}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* What is Good */}
            <Card variant="white" radius="lg" className="border border-[#DAF1DE] space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#4F8A6A] flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> What Is Good
              </span>
              <ul className="space-y-2 text-xs text-[#051F20]">
                {improvementData?.whatIsGood?.map((g, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-[#4F8A6A] font-bold">•</span>
                    <span>{g}</span>
                  </li>
                ))}
              </ul>
            </Card>

            {/* What is Weak */}
            <Card variant="white" radius="lg" className="border border-[#DAF1DE] space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#C75C5C] flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" /> What Is Weak
              </span>
              <ul className="space-y-2 text-xs text-[#051F20]">
                {improvementData?.whatIsWeak?.map((w, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-[#C75C5C] font-bold">•</span>
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            </Card>

            {/* What Should Change & Why */}
            <Card variant="white" radius="lg" className="border border-[#DAF1DE] space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#C99A3D] flex items-center gap-1.5">
                <Sliders className="w-4 h-4" /> What Should Change
              </span>
              <ul className="space-y-2 text-xs text-[#051F20]">
                {improvementData?.whatShouldChange?.map((ch, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-[#C99A3D] font-bold">•</span>
                    <span>{ch}</span>
                  </li>
                ))}
              </ul>
            </Card>

            {/* Why & Recommended Action */}
            <Card variant="mintLight" radius="lg" className="border border-[#8EB69B]/40 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#163832] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" /> Why & Recommended Action
              </span>
              <div className="space-y-2 text-xs text-[#051F20]">
                <p>
                  <strong>Why:</strong> {improvementData?.why}
                </p>
                <div className="p-3 rounded-lg bg-white/90 border border-[#8EB69B]/30 font-semibold text-[#163832]">
                  {improvementData?.recommendedAction}
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}
    </PageContainer>
  );
};

export default Readiness;
