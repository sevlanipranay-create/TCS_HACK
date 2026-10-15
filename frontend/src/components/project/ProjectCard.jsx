import React from 'react';
import Card from '../common/Card.jsx';
import Badge from '../common/Badge.jsx';
import ProgressBar from '../common/ProgressBar.jsx';
import { Clock, Users } from '../common/Icons.jsx';

export const ProjectCard = ({
  project,
  className = ''
}) => {
  if (!project) return null;

  return (
    <Card
      variant="white"
      radius="hero"
      padding="lg"
      className={`border border-[#8EB69B]/30 shadow-sm ${className}`}
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left: Project Identity */}
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center gap-2">
            <Badge variant="mint" size="sm">
              {project.hackathonName || 'TCS Tech Day @ VESIT'}
            </Badge>
            <Badge variant="neutral" size="sm">
              Team {project.teamName || 'NeuroCoders'}
            </Badge>
          </div>

          <h2 className="text-xl md:text-2xl font-black text-[#051F20] tracking-tight">
            {project.title}
          </h2>

          <p className="text-xs md:text-sm text-[#49645C] leading-relaxed">
            {project.tagline}
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-[#71877E]">
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-[#49645C]" />
              <span>{project.teamMembers?.length || 4} Team Members</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#49645C]" />
              <span>{project.timeRemaining || '75m'} sprint allocation</span>
            </div>
          </div>
        </div>

        {/* Right: Progress & Status */}
        <div className="lg:w-72 bg-[#EAF6EA]/60 p-4 rounded-[16px] border border-[#DAF1DE] space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-[#051F20]">Overall Sprint Progress</span>
            <span className="font-extrabold text-[#051F20] text-sm">{project.overallProgress || 0}%</span>
          </div>

          <ProgressBar
            value={project.overallProgress || 0}
            variant="mint"
            size="md"
          />

          <div className="flex items-center justify-between pt-1 text-xs">
            <span className="text-[#71877E]">Status Pace:</span>
            <span className="font-bold text-[#051F20]">{project.currentStage || 'Active'}</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ProjectCard;
