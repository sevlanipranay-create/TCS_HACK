export const mockJudgeQuestions = [
  {
    id: 1,
    category: 'Differentiation & Competitive Advantage',
    question: 'Why is your solution better than existing commercial routing and dispatch tools like Google Maps or Route4Me?',
    hint: 'Focus on how your algorithm factors in carbon emissions and micro-clustering rather than just simple shortest distance.',
    sampleWeakAnswer: 'Our tool is better because it uses AI and has a nicer dashboard.',
    sampleStrongAnswer: 'Existing tools optimize solely for driver travel time or distance, ignoring carbon emissions and vehicle payload curves. EcoRoute uses heuristic clustering specifically weighted by vehicle emission factors, reducing carbon output by 28% while keeping transit times within 5% of conventional algorithms. Moreover, our solution runs entirely in-browser with zero per-query API costs.',
    defaultScore: {
      problemUnderstanding: 9,
      innovation: 8,
      impact: 9,
      technicalFeasibility: 9,
      presentation: 8
    },
    defaultFeedback: 'Strong defense of differentiation. You clearly identified the exact dimension legacy systems overlook (carbon emission weighting) and backed it with a concrete metric.'
  },
  {
    id: 2,
    category: 'Technical Feasibility & Scalability',
    question: 'How does your routing algorithm scale when an urban fleet has 5,000 package deliveries across an entire metropolitan area?',
    hint: 'Explain how you break down the problem (e.g. hierarchical geospatial partitioning before applying TSP).',
    sampleWeakAnswer: 'We will just buy a bigger server or use cloud functions.',
    sampleStrongAnswer: 'A single TSP on 5,000 points is NP-hard and computationally infeasible. EcoRoute handles this by hierarchical quad-tree geospatial partitioning: we first segment the city into 20 micro-neighborhood zones using K-Means, then run parallel heuristic solvers on clusters of ~250 packages each. This caps worst-case latency to under 1.2 seconds.',
    defaultScore: {
      problemUnderstanding: 9,
      innovation: 8,
      impact: 8,
      technicalFeasibility: 10,
      presentation: 9
    },
    defaultFeedback: 'Excellent algorithmic grasp. Acknowledging NP-hard constraints and showing hierarchical partitioning proves to judges that this is an engineering solution, not just a surface mockup.'
  },
  {
    id: 3,
    category: 'Target User & Adoption Barriers',
    question: 'What is the biggest barrier preventing actual delivery drivers from adopting your route recommendations, and how do you solve it?',
    hint: 'Address driver distrust of automated navigation and realistic traffic constraints.',
    sampleWeakAnswer: 'Drivers have no choice because the company will make them use it.',
    sampleStrongAnswer: 'Drivers reject algorithmic routes when navigation ignores local reality—such as narrow alleyways, construction zones, or difficult left turns across multi-lane avenues. We include a driver feedback checkpoint where drivers can flag difficult corridors, and our route weightings adaptively avoid those segments in future batches.',
    defaultScore: {
      problemUnderstanding: 9,
      innovation: 7,
      impact: 8,
      technicalFeasibility: 8,
      presentation: 8
    },
    defaultFeedback: 'Addresses operational human-factors well. Shows empathy for the ground-level user.'
  },
  {
    id: 4,
    category: 'Business & ESG Impact',
    question: 'How do you prove the 28% carbon emission reduction to an enterprise fleet executive?',
    hint: 'Explain the calculation formula and verified emission factor benchmarks used.',
    sampleWeakAnswer: 'We estimate it based on how many kilometers are saved.',
    sampleStrongAnswer: 'We calculate emissions using the DEFRA and EPA GHG vehicle emission factors (0.24 kg CO2e per diesel van km). By comparing the baseline legacy delivery route against EcoRoute’s clustered waypoints, the dashboard outputs an audited carbon savings certificate exportable directly for corporate ESG compliance reporting.',
    defaultScore: {
      problemUnderstanding: 9,
      innovation: 8,
      impact: 9,
      technicalFeasibility: 9,
      presentation: 9
    },
    defaultFeedback: 'Citing recognized standards like DEFRA/EPA gives your business case credibility with corporate judges.'
  },
  {
    id: 5,
    category: 'MVP Focus & Next Steps',
    question: 'What is in your 6-hour hackathon MVP, and what was intentionally cut?',
    hint: 'Judges appreciate teams that consciously trimmed features to build a rock-solid prototype.',
    sampleWeakAnswer: 'We built everything: driver app, admin panel, AI model, and payment system.',
    sampleStrongAnswer: 'We focused on the core value loop: batch CSV manifest upload, K-Means stop clustering, interactive route visualization, and live carbon delta computation. We intentionally deferred the native mobile driver app and dynamic traffic API polling to keep our prototype zero-dependency and 100% stable during this live demo.',
    defaultScore: {
      problemUnderstanding: 10,
      innovation: 8,
      impact: 8,
      technicalFeasibility: 10,
      presentation: 10
    },
    defaultFeedback: 'Outstanding prioritization. Knowing what NOT to build is the hallmark of a winning hackathon team.'
  }
];

export const mockReadinessScore = {
  overallScore: 82,
  dimensions: [
    { label: 'Problem Understanding', score: 95, status: 'Exceptional' },
    { label: 'User Definition', score: 90, status: 'Strong' },
    { label: 'MVP Scoping', score: 88, status: 'Optimal' },
    { label: 'Technology Alignment', score: 92, status: 'Exceptional' },
    { label: 'Testing & Stability', score: 75, status: 'Good' },
    { label: 'Innovation & Differentiation', score: 72, status: 'Adequate' },
    { label: 'Presentation & Pitch', score: 70, status: 'Needs Practice' },
    { label: 'Validation with Target Users', score: 60, status: 'At Risk' }
  ],
  strongAreas: [
    'Deep clarity on last-mile fleet logistics and urban delivery bottlenecks.',
    'Technology choices (React, Vite, Python heuristics) perfectly matched to 6-hour constraints.',
    'Clear, quantifiable ROI (28% fuel savings and instant ESG reporting).'
  ],
  weakAreas: [
    'User validation score (60%) is currently low. Team needs at least 2 external validation data points.',
    'Live pitch deck timing is not yet practiced with a hard 3-minute stopwatch.'
  ],
  criticalIssues: [
    'Validation gap: Prepare a slide explaining your dispatcher interview findings before entering the judging room.'
  ],
  nextAction: 'Spend the next 15 minutes rehearsing the 3-minute pitch with a timer, addressing the validation checkpoint.'
};
