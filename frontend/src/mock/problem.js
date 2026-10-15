export const mockProblem = {
  statement: "Urban courier delivery fleets face high fuel costs, erratic delivery windows, and steep carbon footprints due to static routing algorithms that ignore micro-traffic bottlenecks and real-time package urgency.",
  teamSize: 4,
  teamSkills: ["React", "FastAPI", "Python Optimization", "PostgreSQL", "Tailwind CSS"],
  experienceLevel: "Intermediate",
  availableTimeHours: 6,
  
  // Structured Output Cards
  analysis: {
    problemSummary: "Inefficient last-mile route dispatch causes 25-35% excess transit emissions and delays in dense urban delivery hubs.",
    targetUsers: [
      { role: "Fleet Logistics Dispatchers", context: "Manage daily batch parcel manifests and vehicle assignments." },
      { role: "Last-Mile Delivery Drivers", context: "Execute multi-stop itineraries needing realistic turnaround times." },
      { role: "City Fleet Sustainability Officers", context: "Track scope-1 vehicular carbon emissions for ESG compliance." }
    ],
    painPoints: [
      "Static GPS routing models fail during monsoon flash-floods and local congestion spikes.",
      "Dispatchers lack automated parcel prioritization based on delivery SLA deadlines.",
      "High driver attrition caused by unrealistic route schedules and excessive idling."
    ],
    expectedOutcome: "A functional AI dispatch dashboard that groups parcel drops into emission-optimized clusters and generates dynamic turn-by-turn routes with 20%+ fuel reduction.",
    keyRequirements: [
      "Import delivery coordinates via CSV / JSON input.",
      "AI cluster allocation based on proximity, cargo capacity, and delivery SLA.",
      "Interactive map visualizer displaying optimized route waypoints.",
      "Instant carbon footprint delta calculation (baseline vs optimized route)."
    ],
    constraints: [
      "6-hour total build duration — must not train deep learning models from scratch.",
      "Limited free-tier external map routing API credits.",
      "Must work reliably offline/cached for live presentation."
    ],
    assumptions: [
      "Fleet vehicles are standard 1.5-ton commercial diesel and EV vans.",
      "Driver devices have modern mobile web browsers with geolocation enabled."
    ],
    keyQuestions: [
      "How will the routing engine handle sudden customer address cancellations mid-trip?",
      "Can we prove the 20% carbon reduction algorithmically to judges during the 3-minute pitch?"
    ]
  },

  // Clarification template for vague problem statements
  vagueExamples: [
    "Use AI to improve education.",
    "Make healthcare better using blockchain and AI.",
    "Solve climate change with smart technology."
  ],
  clarificationGuide: {
    warningTitle: "Problem Statement Needs Clarification",
    warningDescription: "This problem statement is too broad for a time-constrained hackathon. Broad statements lead to feature creep and vague judging pitches.",
    questions: [
      "Who is the primary specific user experiencing the pain point daily?",
      "What exact bottleneck or friction are they encountering right now?",
      "What quantifiable metric or outcome will your hackathon solution improve?",
      "Which specific niche or domain segment are you targeting for this prototype?"
    ]
  }
};
