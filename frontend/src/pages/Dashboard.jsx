import React, { useEffect, useState } from 'react';
import PageContainer from '../components/layout/PageContainer.jsx';
import ProjectCard from '../components/project/ProjectCard.jsx';
import TeamMemberCard from '../components/project/TeamMemberCard.jsx';
import Card from '../components/common/Card.jsx';
import Badge from '../components/common/Badge.jsx';
import Button from '../components/common/Button.jsx';
import ProgressBar from '../components/common/ProgressBar.jsx';
import AIRecommendation from '../components/ai/AIRecommendation.jsx';
import AIInsight from '../components/ai/AIInsight.jsx';
import LoadingState from '../components/common/LoadingState.jsx';
import { api } from '../services/api.js';
import {
  ArrowRight,
  Sparkles,
  AlertTriangle,
  Clock,
  Layers,
  Cpu,
  Target,
  CheckCircle2,
  Users,
  AlertOctagon,
  TrendingUp,
  FileText
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Dashboard = () => {
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getProject().then((data) => {
      setProject(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <PageContainer>
        <LoadingState message="Loading Hackathon Dashboard..." />
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="Hackathon Command Center"
      subtitle="Real-time AI mentorship and sprint velocity tracking for TCS Hackathon 2026."
      badge={
        <Badge variant={project.projectHealth === 'Good' ? 'success' : 'warning'} size="sm">
          Health: {project.projectHealth}
        </Badge>
      }
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/mentor')}
            icon={Sparkles}
          >
            Ask Mentor
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/judge')}
            icon={Target}
          >
            Judge Simulation
          </Button>
        </div>
      }
    >
      {/* Hero Project Status Banner */}
      <ProjectCard project={project} />

      {/* Immediate Next Action Banner */}
      <AIRecommendation
        title="Immediate Recommended Action: Prune MVP Scope"
        description={project.nextAction}
        actionText="Review MVP & Scope"
        onAction={() => navigate('/mvp-tech')}
        factors={[
          { factor: 'Sprint Time Remaining', comment: `${project.timeRemaining} before submission cutoff` },
          { factor: 'Scope Status', comment: '9 total features planned (safe limit: 5)' },
          { factor: 'Demo Resilience', comment: '5 polished features beat 9 half-working features' }
        ]}
      />

      {/* Health & Urgent Blockers Alert */}
      {project.criticalIssues && project.criticalIssues.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {project.criticalIssues.map((issue) => (
            <AIInsight
              key={issue.id}
              type={issue.severity === 'high' ? 'risk' : 'warning'}
              title={`Flag: ${issue.title}`}
            >
              {issue.description}
            </AIInsight>
          ))}
        </div>
      )}

      {/* 2-Column Section: Sprint Milestone Stages & Team Skills */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Sprint Milestones Matrix */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-[#051F20] flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#8EB69B]" />
              Hackathon Pipeline Stages
            </h3>
            <span className="text-xs text-[#71877E]">Click any stage to continue</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {Object.entries(project.stageStatuses || {}).map(([key, val]) => {
              const pathMap = {
                problem: '/problem',
                solutions: '/solutions',
                mvp: '/mvp-tech',
                workflow: '/workflow',
                progress: '/progress',
                validation: '/workflow',
                judgeReady: '/judge'
              };

              return (
                <Card
                  key={key}
                  variant="white"
                  radius="md"
                  onClick={() => navigate(pathMap[key] || '/')}
                  className="flex flex-col justify-between hover:border-[#8EB69B] hover:shadow-sm transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-[#051F20]">{val.label}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          val.status === 'Completed'
                            ? 'bg-[#4F8A6A]/15 text-[#4F8A6A]'
                            : val.status === 'In Progress'
                            ? 'bg-[#5C8AC7]/15 text-[#5C8AC7]'
                            : 'bg-[#C99A3D]/15 text-[#C99A3D]'
                        }`}
                      >
                        {val.status}
                      </span>
                    </div>
                    <ProgressBar value={val.percentage} size="sm" variant="mint" />
                  </div>
                  <div className="mt-3 pt-2 border-t border-[#DAF1DE] flex items-center justify-between text-[11px] text-[#71877E]">
                    <span>{val.percentage}% Complete</span>
                    <span className="font-bold text-[#051F20] hover:text-[#8EB69B] flex items-center gap-1">
                      Open <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Right Col: Team Members & Hackathon Readiness Preview */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-[#051F20] flex items-center gap-2">
              <Users className="w-4 h-4 text-[#8EB69B]" />
              Team Roster ({project.teamMembers?.length})
            </h3>
            <span className="text-xs font-semibold text-[#8EB69B]">NeuroCoders</span>
          </div>

          <div className="space-y-2.5">
            {project.teamMembers?.map((member) => (
              <TeamMemberCard key={member.id} member={member} />
            ))}
          </div>

          {/* Quick Readiness Card */}
          <Card
            variant="dark"
            radius="lg"
            className="p-4 cursor-pointer hover:border-[#8EB69B] transition-colors"
            onClick={() => navigate('/readiness')}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#DAF1DE]">Hackathon Readiness</span>
              <span className="text-base font-extrabold text-[#8EB69B]">
                {project.readinessScore} / 100
              </span>
            </div>
            <ProgressBar value={project.readinessScore} size="sm" variant="mint" />
            <p className="text-[11px] text-[#DAF1DE]/80 mt-2.5 flex items-center justify-between">
              <span>Weakest Area: User Validation</span>
              <span className="text-[#8EB69B] font-bold flex items-center gap-1">
                View Audit <ArrowRight className="w-3 h-3" />
              </span>
            </p>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
};

export default Dashboard;
