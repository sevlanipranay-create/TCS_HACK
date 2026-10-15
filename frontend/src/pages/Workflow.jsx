import React, { useState, useEffect } from 'react';
import PageContainer from '../components/layout/PageContainer.jsx';
import Card from '../components/common/Card.jsx';
import Badge from '../components/common/Badge.jsx';
import Button from '../components/common/Button.jsx';
import ProgressBar from '../components/common/ProgressBar.jsx';
import AIInsight from '../components/ai/AIInsight.jsx';
import LoadingState from '../components/common/LoadingState.jsx';
import { api } from '../services/api.js';
import {
  Clock,
  CheckCircle2,
  Calendar,
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Workflow = () => {
  const navigate = useNavigate();
  const [schedule, setSchedule] = useState([]);
  const [teamTasks, setTeamTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getWorkflow().then((data) => {
      setSchedule(data.schedule || []);
      setTeamTasks(data.teamTasks || []);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <PageContainer>
        <LoadingState message="Loading Hackathon Sprint Schedule & Velocity..." />
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="04 Workflow & Time Management"
      subtitle="Visual hour-by-hour sprint schedule, team workload distribution, and milestone tracking."
      badge={<Badge variant="mint" size="sm">Sprint Clock Active</Badge>}
      actions={
        <div className="flex items-center gap-2">
          <Badge variant="warning" size="sm" icon={Clock}>
            Current: Sprint Phase 4 (Development)
          </Badge>
        </div>
      }
    >
      {/* Visual Timeline Section */}
      <Card variant="white" radius="hero" className="border border-[#8EB69B]/30 shadow-sm p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#DAF1DE] pb-4">
          <div>
            <h3 className="text-base font-bold text-[#051F20] flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#8EB69B]" />
              Visual Hackathon Sprint Timeline
            </h3>
            <p className="text-xs text-[#71877E] mt-0.5">
              Disciplined timeboxing prevents last-minute submission panic.
            </p>
          </div>
          <span className="text-xs font-bold text-[#051F20] bg-[#DAF1DE] px-3 py-1.5 rounded-[10px]">
            Target Cutoff: 03:00 Hard Stop
          </span>
        </div>

        {/* Timeline Sequence */}
        <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#8EB69B]/40">
          {schedule.map((slot, idx) => {
            const isCompleted = slot.status === 'Completed';
            const isCurrent = slot.status === 'In Progress';

            return (
              <div key={idx} className="relative group">
                {/* Timeline Dot Indicator */}
                <div
                  className={`absolute -left-6 sm:-left-8 top-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    isCompleted
                      ? 'bg-[#4F8A6A] text-white ring-4 ring-[#4F8A6A]/20'
                      : isCurrent
                      ? 'bg-[#051F20] text-[#8EB69B] ring-4 ring-[#8EB69B]/30 animate-pulse'
                      : 'bg-white border-2 border-gray-300 text-gray-400'
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5" /> : idx + 1}
                </div>

                <div
                  className={`p-4 rounded-[14px] border transition-all ${
                    isCurrent
                      ? 'bg-[#DAF1DE]/40 border-[#8EB69B] shadow-xs'
                      : isCompleted
                      ? 'bg-white border-[#DAF1DE]'
                      : 'bg-gray-50/50 border-gray-200 opacity-75'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-[#051F20] text-[#DAF1DE]">
                        {slot.time}
                      </span>
                      <h4 className="text-sm font-bold text-[#051F20]">
                        {slot.phase}
                      </h4>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[#71877E]">Owner: <strong>{slot.owner}</strong></span>
                      <Badge
                        variant={isCompleted ? 'success' : isCurrent ? 'info' : 'neutral'}
                        size="sm"
                      >
                        {slot.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Team Tasks & Velocity Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Team Tasks Completion Bars */}
        <Card variant="white" radius="lg" className="space-y-4">
          <div className="flex items-center justify-between border-b border-[#DAF1DE] pb-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-[#051F20] flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#8EB69B]" />
              Team Component Velocity
            </h4>
            <span className="text-xs text-[#71877E]">Target: 100% by 02:40</span>
          </div>

          <div className="space-y-4">
            {teamTasks.map((item, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#051F20]">{item.role}</span>
                    <span className="text-[#71877E]">({item.member})</span>
                  </div>
                  <span className="font-extrabold text-[#051F20]">{item.percentage}%</span>
                </div>
                <ProgressBar
                  value={item.percentage}
                  variant={item.percentage >= 80 ? 'success' : 'mint'}
                  size="md"
                />
              </div>
            ))}
          </div>
        </Card>

        {/* Mentor Time Advice & Safety Protocol */}
        <div className="space-y-4">
          <AIInsight
            type="tip"
            title="Mentor Golden Rule: 30 Minutes Hard Demo Freeze"
          >
            At <strong>02:40</strong>, all feature coding must halt completely. No new npm packages, no git rebases, and no schema migrations. Spend the remaining 20 minutes rehearsing the live judge pitch and ensuring mock fallbacks are primed.
          </AIInsight>

          <Card variant="dark" radius="lg" className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#8EB69B] uppercase tracking-wider">
                Pitch Rehearsal Checkpoint
              </span>
              <Badge variant="forest" size="sm">02:40 Hard Stop</Badge>
            </div>
            <h4 className="text-sm font-bold text-white leading-snug">
              Every team member must know their exact 45-second pitch cue:
            </h4>
            <ul className="space-y-1.5 text-xs text-[#DAF1DE]/90">
              <li>1. <strong>Aarav</strong>: Problem hook & quantifiable carbon friction (45s)</li>
              <li>2. <strong>Rohan</strong>: Live UI walkthrough & stop clustering demo (60s)</li>
              <li>3. <strong>Diya</strong>: K-Means algorithm depth & DEFRA carbon factor (45s)</li>
              <li>4. <strong>Ananya</strong>: In-browser scalability & API zero-dependency defense (30s)</li>
            </ul>
          </Card>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="flex justify-end pt-4 border-t border-[#DAF1DE]">
        <Button
          variant="mint"
          size="md"
          onClick={() => navigate('/progress')}
          icon={ArrowRight}
        >
          Proceed to 05 Project Progress & Kanban
        </Button>
      </div>
    </PageContainer>
  );
};

export default Workflow;
