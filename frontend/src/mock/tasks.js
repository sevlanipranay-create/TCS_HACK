export const mockMvpFeatures = [
  { id: 'f-1', name: 'Batch Parcel Geocoding & CSV Upload', priority: 'must', completed: true, estHours: 1.0, role: 'Backend' },
  { id: 'f-2', name: 'K-Means Stop Clustering Algorithm', priority: 'must', completed: true, estHours: 1.5, role: 'AI / Data' },
  { id: 'f-3', name: 'Interactive Route Map with Waypoint Sequence', priority: 'must', completed: true, estHours: 2.0, role: 'Frontend' },
  { id: 'f-4', name: 'Carbon Emission Delta Calculator & Dashboard Card', priority: 'must', completed: true, estHours: 1.0, role: 'Full Stack' },
  { id: 'f-5', name: 'Driver Turn-by-Turn Manifest Export', priority: 'must', completed: false, estHours: 1.0, role: 'Frontend' },
  { id: 'f-6', name: 'Live GPS Fleet Simulation Replay', priority: 'should', completed: false, estHours: 2.0, role: 'Frontend' },
  { id: 'f-7', name: 'Traffic Congestion API Live Polling', priority: 'should', completed: false, estHours: 2.5, role: 'Backend' },
  { id: 'f-8', name: 'Multi-Depot Dynamic Fleet Rebalancing', priority: 'nice', completed: false, estHours: 4.0, role: 'AI / Data' },
  { id: 'f-9', name: 'Custom Driver Mobile App with Push Notifications', priority: 'nice', completed: false, estHours: 5.0, role: 'Mobile' }
];

export const mockTechStack = {
  recommendations: [
    {
      category: 'Frontend',
      tech: 'React + Vite + Tailwind CSS',
      why: 'Enables rapid creation of responsive interactive dashboards, component reusability, and instant hot-reload debugging.',
      readiness: 'Configured & Ready'
    },
    {
      category: 'Backend',
      tech: 'Python FastAPI',
      why: 'High-performance async request handling with native support for NumPy/SciPy geo-spatial distance computation.',
      readiness: 'Recommended'
    },
    {
      category: 'Database / Storage',
      tech: 'PostgreSQL + PostGIS (or lightweight SQLite)',
      why: 'Robust spatial indexing for latitude/longitude polygons with minimal deployment overhead.',
      readiness: 'Recommended'
    },
    {
      category: 'AI / Optimization',
      tech: 'Python Scipy Heuristics & Gemini API',
      why: 'Scipy guarantees instant deterministic route clustering while Gemini API formats natural-language driver briefings.',
      readiness: 'Recommended'
    }
  ],
  avoidComplexity: [
    { item: 'Custom Deep Reinforcement Learning Agent', reason: 'High training variance; prone to failing during live judge evaluation.' },
    { item: 'Microservices Architecture with Kafka', reason: 'Over-engineering for a hackathon demo; creates latency and orchestration bugs.' },
    { item: 'Full Native Android / iOS Build', reason: 'Consumes too much setup time; a responsive mobile web preview is 10x faster and sufficient.' },
    { item: 'Enterprise OAuth2 Multi-Tenant Auth', reason: 'Zero value added for 3-minute hackathon judge evaluation.' }
  ]
};

export const mockWorkflow = [
  { time: '00:00 – 00:20', phase: 'Understand Problem & Users', status: 'Completed', owner: 'All Team' },
  { time: '00:20 – 00:40', phase: 'Solution Comparison & Selection', status: 'Completed', owner: 'All Team' },
  { time: '00:40 – 01:00', phase: 'MVP Scoping & Architecture Sign-off', status: 'Completed', owner: 'Aarav (Lead)' },
  { time: '01:00 – 02:15', phase: 'Core Development Sprint', status: 'In Progress', owner: 'Diya, Rohan, Ananya' },
  { time: '02:15 – 02:40', phase: 'Integration, Live Mocking & Polish', status: 'Upcoming', owner: 'All Team' },
  { time: '02:40 – 03:00', phase: 'Pitch Deck & Judge Q&A Simulation', status: 'Upcoming', owner: 'Aarav & Rohan' }
];

export const mockKanbanTasks = [
  { id: 't-1', title: 'Problem statement & target user synthesis', column: 'done', assignee: 'Aarav Patel', tag: 'Problem' },
  { id: 't-2', title: 'Select Solution A algorithm (K-Means + TSP)', column: 'done', assignee: 'Diya Sharma', tag: 'Algorithm' },
  { id: 't-3', title: 'Design system tokens & sidebar shell', column: 'done', assignee: 'Rohan Verma', tag: 'UI / UX' },
  { id: 't-4', title: 'FastAPI route endpoints for waypoint clustering', column: 'in_progress', assignee: 'Ananya Roy', tag: 'Backend' },
  { id: 't-5', title: 'Interactive map waypoint connector', column: 'in_progress', assignee: 'Rohan Verma', tag: 'Frontend' },
  { id: 't-6', title: 'Prepare 5 target user assumption tests', column: 'todo', assignee: 'Diya Sharma', tag: 'Validation' },
  { id: 't-7', title: 'Rehearse Judge Mode responses for 3-minute pitch', column: 'todo', assignee: 'Aarav Patel', tag: 'Judge Pitch' }
];

export const mockTeamProgress = [
  { role: 'Frontend & UI', percentage: 80, member: 'Rohan Verma' },
  { role: 'AI & Algorithm', percentage: 70, member: 'Diya Sharma' },
  { role: 'Backend & APIs', percentage: 65, member: 'Ananya Roy' },
  { role: 'System Architecture', percentage: 85, member: 'Aarav Patel' }
];

export const mockValidationItems = [
  {
    id: 'val-1',
    question: 'Who will use it?',
    answer: 'Fleet dispatchers coordinating 20-50 daily last-mile parcel couriers in metro hubs.',
    assumption: 'Dispatchers spend >35 minutes every morning manually rearranging manifest stops in Excel.',
    howToTest: 'Interview 2 logistics supervisors and simulate batch re-ordering with a 50-stop test file.',
    successMetric: 'Drop planning time from 35 mins to < 3 mins (90% reduction).',
    status: 'Verified'
  },
  {
    id: 'val-2',
    question: 'What assumption are we testing?',
    answer: 'Drivers will follow cluster routes if fuel efficiency and ETA windows are visibly shown.',
    assumption: 'Drivers reject automated routes unless turn-by-turn logic matches known street restrictions.',
    howToTest: 'Run route simulation against known one-way and peak school-zone traffic corridors.',
    successMetric: 'Zero route violations across 3 benchmark urban test datasets.',
    status: 'In Progress'
  }
];

export const mockEdgeCases = [
  {
    id: 'ec-1',
    problem: 'Vague or Empty Problem Statement',
    systemBehavior: 'Detects lack of specific user or metric; blocks premature solution synthesis; prompts 4 targeted clarification questions.',
    risk: 'High (Team builds a generic app that fails judging).',
    status: 'Protected'
  },
  {
    id: 'ec-2',
    problem: 'API Rate Limits / Map Quota Exhaustion During Demo',
    systemBehavior: 'Local deterministic fallback dataset and cached geo-polygons kick in seamlessly with zero user-facing error.',
    risk: 'Critical (Blank map during pitch kills score).',
    status: 'Protected'
  },
  {
    id: 'ec-3',
    problem: 'Feature Creep: Too Many MVP Items for Time Remaining',
    systemBehavior: 'AI mentor issues an immediate yellow alert when items exceed 5 core features with < 3 hours remaining.',
    risk: 'High (Unfinished frontend code at submission deadline).',
    status: 'Protected'
  },
  {
    id: 'ec-4',
    problem: 'Unrealistic ML Training Constraints',
    systemBehavior: 'Flags deep neural networks as unfeasible for 6-hour timeline; recommends heuristic algorithms.',
    risk: 'High (GPU training fails to converge in time).',
    status: 'Protected'
  }
];

export const mockSolutionImprovement = {
  overallScore: 84,
  whatIsGood: [
    'Clear, quantifiable value proposition (28% fuel reduction and 35 min -> 3 min dispatch).',
    'Heuristic algorithm choice provides instant calculation with no demo latency.',
    'Clear alignment between team skillsets and chosen tech stack.'
  ],
  whatIsWeak: [
    'Presentation currently lacks a crisp comparison chart against legacy commercial tools (e.g. Route4Me).',
    'Need a clearer fallback story if external map tiles load slowly on hackathon Wi-Fi.'
  ],
  whatShouldChange: [
    'Prune the 2 "Nice-to-Have" mobile features from the live demo slide.',
    'Add an explicit 10-second live slider showing carbon savings accumulating in real-time.'
  ],
  why: 'TCS Hackathon judges evaluate business impact and demo reliability above theoretical complexity.',
  recommendedAction: 'Focus remaining development sprint on making the carbon delta chart interactive and practice the 3-minute pitch.'
};
