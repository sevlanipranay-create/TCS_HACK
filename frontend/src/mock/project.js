export const mockProject = {
  id: 'proj-01',
  title: 'EcoRoute: AI Dynamic Green Logistics',
  tagline: 'Hyper-local route optimization cutting last-mile delivery carbon emissions by 28%.',
  hackathonName: 'TCS Hackathon 2026',
  teamName: 'NeuroCoders',
  teamSize: 4,
  availableTimeHours: 6,
  timeRemaining: '02h 15m',
  overallProgress: 72,
  currentStage: 'MVP Definition',
  nextAction: 'Reduce your MVP from 9 features to 5 core features to ensure high demo reliability.',
  projectHealth: 'At Risk', // 'Good' | 'At Risk' | 'Critical'
  healthReason: 'MVP scope currently has 9 features scheduled for the remaining 2 hours. Pruning is urgent.',
  readinessScore: 82,
  teamMembers: [
    { id: '1', name: 'Aarav Patel', role: 'Team Lead & Full Stack', avatar: 'AP', skills: ['React', 'Node.js', 'System Architecture'] },
    { id: '2', name: 'Diya Sharma', role: 'AI & Data Scientist', avatar: 'DS', skills: ['Python', 'FastAPI', 'LLMs', 'Optimization'] },
    { id: '3', name: 'Rohan Verma', role: 'Frontend & UI/UX', avatar: 'RV', skills: ['React', 'Tailwind CSS', 'Figma'] },
    { id: '4', name: 'Ananya Roy', role: 'Backend & Cloud', avatar: 'AR', skills: ['PostgreSQL', 'Docker', 'REST APIs'] }
  ],
  stageStatuses: {
    problem: { label: 'Problem Analysis', status: 'Completed', percentage: 100 },
    solutions: { label: 'Solution Lab', status: 'Completed', percentage: 100 },
    mvp: { label: 'MVP & Tech', status: 'In Progress', percentage: 70 },
    workflow: { label: 'Workflow & Time', status: 'In Progress', percentage: 65 },
    progress: { label: 'Project Progress', status: 'In Progress', percentage: 72 },
    validation: { label: 'Validation & Tests', status: 'Needs Action', percentage: 40 },
    judgeReady: { label: 'Judge Simulation', status: 'Not Started', percentage: 20 }
  },
  criticalIssues: [
    { id: 'iss-1', severity: 'high', title: 'Scope creep in MVP', description: 'Real-time multi-depot dynamic rerouting is too heavy for demo.' },
    { id: 'iss-2', severity: 'medium', title: 'Validation unverified', description: 'Assumptions about delivery driver app adoption have not been checked.' }
  ]
};
