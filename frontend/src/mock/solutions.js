export const mockSolutions = [
  {
    id: 'sol-A',
    name: 'EcoCluster & Heuristic Waypoint Optimizer',
    shortDescription: 'Pre-computed geospatial K-Means clustering paired with greedy nearest-neighbor TSP routing and carbon factor weighting.',
    impact: 5,
    innovation: 4,
    feasibility: 5,
    complexity: 'Low',
    developmentTimeHours: 3.5,
    score: 4.6,
    advantages: [
      'Extremely fast execution with zero risk of API rate-limiting during judge demo.',
      'Can be built completely using Python scipy/scikit-learn or JS turf.js.',
      'High visual impact on interactive map with before/after route comparisons.'
    ],
    risks: [
      'Heuristic may not always reach mathematical global optimum in complex multi-constraint topologies.'
    ]
  },
  {
    id: 'sol-B',
    name: 'Reinforcement Learning Multi-Agent Dispatcher',
    shortDescription: 'Deep Q-Network simulation simulating fleet congestion, dynamic pickup requests, and battery recharge stations.',
    impact: 5,
    innovation: 5,
    feasibility: 2,
    complexity: 'High',
    developmentTimeHours: 10,
    score: 3.7,
    advantages: [
      'Cutting-edge algorithmic innovation that sounds impressive in pitch slides.',
      'Handles multi-agent fleet collaboration in theoretical simulation.'
    ],
    risks: [
      'High failure rate: Training RL convergence takes hours and often produces erratic unstable policies.',
      'Too complex to integrate with frontend within 6 hours.'
    ]
  },
  {
    id: 'sol-C',
    name: 'LLM Prompt-Engineered Route Recommender',
    shortDescription: 'Sends full parcel addresses to an LLM API asking it to sort the sequence and generate human driver instructions.',
    impact: 3,
    innovation: 3,
    feasibility: 3,
    complexity: 'High',
    developmentTimeHours: 2.5,
    score: 3.2,
    advantages: [
      'Very quick to write an initial prompt and connect to an API.',
      'Generates natural language delivery notes for drivers.'
    ],
    risks: [
      'LLMs are notoriously bad at spatial geometry and distance calculation; hallucinated routes.',
      'High API latency and cost per delivery batch.'
    ]
  }
];

export const mockSolutionRecommendation = {
  selectedSolutionId: 'sol-A',
  title: 'AI Mentor Recommendation: Select Solution A',
  recommendationText: 'Solution A is strongly recommended because it provides the best balance of Impact, Feasibility, Innovation, and Development Time.',
  breakdown: [
    { factor: 'Feasibility for Hackathon', status: 'High', comment: 'Ready in under 4 hours with zero training bottlenecks.' },
    { factor: 'Demo Resilience', status: 'Optimal', comment: 'Instant deterministic calculations guarantee a zero-fail demo in front of TCS judges.' },
    { factor: 'Engineering Depth', status: 'Strong', comment: 'Combines algorithmic geometry with tangible ESG environmental metrics.' }
  ]
};
