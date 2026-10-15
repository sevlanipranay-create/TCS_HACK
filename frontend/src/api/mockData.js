// src/api/mockData.js
// Contract Block v2.1 mock data generators and samples

import { STAGES, CRITERIA, DISCLAIMER } from '../lib/contract.js';

export const mockSamples = [
  {
    id: "t1_canteen",
    title: "Canteen Food Wastage",
    problem_statement: "Campus canteens prepare surplus food daily based on guesswork, leading to massive nutritional waste and high disposal costs, while students face long lunch queues and stockouts of popular meals.",
    team: {
      team_size: 4,
      skills: ["React", "Python"],
      minutes_available: 75,
      preferred_stack: "FastAPI + React"
    }
  },
  {
    id: "t2_study",
    title: "Peer Study Groups",
    problem_statement: "Students struggle to find compatible peer study partners for engineering courses with complementary skillsets, matching study schedules, and aligned exam deadlines.",
    team: {
      team_size: 4,
      skills: ["Python", "React"],
      minutes_available: 75,
      preferred_stack: "React + SQLite"
    }
  },
  {
    id: "t3_vague_pii",
    title: "Vague Campus Improvement",
    problem_statement: "Make the campus better. Contact asha.demo@example.com or 98765 43210 for details.",
    team: {
      team_size: 3,
      skills: ["UI design"],
      minutes_available: 60,
      preferred_stack: ""
    }
  }
];

export function buildMockBrief(problemStatement, team) {
  const teamSize = Number(team?.team_size) || 4;
  const minutesAvailable = Math.max(20, Math.min(600, Number(team?.minutes_available) || 75));

  // 1. Workflow: 6 phases whose minutes sum EXACTLY to minutesAvailable
  // Distribute percentages: understand 15%, users 15%, ideate 15%, build 35%, validate 10%, pitch 10%
  const phaseWeights = [0.15, 0.15, 0.15, 0.35, 0.10, 0.10];
  let allocated = 0;
  const workflow = STAGES.map((stg, idx) => {
    let m = Math.floor(minutesAvailable * phaseWeights[idx]);
    if (m < 1) m = 1;
    if (idx === STAGES.length - 1) {
      m = Math.max(1, minutesAvailable - allocated);
    } else {
      allocated += m;
    }
    const titles = {
      understand: "Deconstruct Problem & Boundaries",
      users: "Map User Personas & Validation",
      ideate: "Select Solution Architecture",
      build: "Core MVP Build Sprint",
      validate: "End-to-End Edge Case Testing",
      pitch: "Final Pitch & Jury Rehearsal"
    };
    return {
      phase: stg,
      title: titles[stg],
      minutes: m,
      activities: [`Activity 1 for ${stg}`, `Activity 2 for ${stg}`],
      outcome: `Validated outcome for ${stg}`
    };
  });

  // Ensure exact sum
  const sumWorkflow = workflow.reduce((acc, p) => acc + p.minutes, 0);
  if (sumWorkflow !== minutesAvailable) {
    workflow[3].minutes += (minutesAvailable - sumWorkflow);
  }

  // 2. Tasks: 10 tasks t1..t10 with total minutes <= 85% of minutesAvailable
  const maxTaskMinutes = Math.floor(minutesAvailable * 0.82);
  const taskMinutesUnit = Math.max(1, Math.floor(maxTaskMinutes / 10));

  const tasks = [
    { id: "t1", phase: "understand", title: "Frame problem boundary & extract assumptions", owner_role: "AI", minutes: taskMinutesUnit, done: false },
    { id: "t2", phase: "understand", title: "Clarify stakeholder pain points & metrics", owner_role: "Frontend", minutes: taskMinutesUnit, done: false },
    { id: "t3", phase: "users", title: "Synthesize target student & admin personas", owner_role: "Frontend", minutes: taskMinutesUnit, done: false },
    { id: "t4", phase: "ideate", title: "Weigh heuristic vs ML architectural options", owner_role: "Backend", minutes: taskMinutesUnit, done: false },
    { id: "t5", phase: "build", title: "Set up project scaffold & mock data schemas", owner_role: "Integrator", minutes: taskMinutesUnit, done: false },
    { id: "t6", phase: "build", title: "Implement core algorithm & API route", owner_role: "Backend", minutes: taskMinutesUnit, done: false },
    { id: "t7", phase: "build", title: "Build interactive operator dashboard UI", owner_role: "Frontend", minutes: taskMinutesUnit, done: false },
    { id: "t8", phase: "validate", title: "Run 3 benchmark test datasets & mock fallbacks", owner_role: "Integrator", minutes: taskMinutesUnit, done: false },
    { id: "t9", phase: "validate", title: "Test edge case scenarios (API timeout, broad inputs)", owner_role: "Backend", minutes: taskMinutesUnit, done: false },
    { id: "t10", phase: "pitch", title: "Structure 6-slide jury outline & demo flow", owner_role: "Frontend", minutes: taskMinutesUnit, done: false }
  ];

  // 3. Checkpoints: exactly 4, ascending at_minute
  const cp1 = Math.max(1, Math.floor(minutesAvailable * 0.20));
  const cp2 = Math.max(cp1 + 1, Math.floor(minutesAvailable * 0.40));
  const cp3 = Math.max(cp2 + 1, Math.floor(minutesAvailable * 0.70));
  const cp4 = Math.max(cp3 + 1, Math.floor(minutesAvailable * 0.90));

  const checkpoints = [
    { at_minute: cp1, check: "Problem & persona sign-off", how: "Review assumption list with all team members" },
    { at_minute: cp2, check: "Architecture & MVP scope lock", how: "Confirm no more than 3 to 5 must-haves in build queue" },
    { at_minute: cp3, check: "Core demo loop working end-to-end", how: "Execute primary user action in UI with mock responses" },
    { at_minute: cp4, check: "Hard code freeze & pitch practice", how: "Run through the 6-slide deck with a strict 3-minute timer" }
  ];

  // 4. Features & Feasibility Formula
  // S=1, M=2, L=4
  const features = [
    { name: "Daily demand forecasting heuristic", why: "Prevents overcooking staple meals", effort: "M", impact: 5, priority: "must", innovative: true },
    { name: "Live inventory stockout counter", why: "Informs students of meal availability in advance", effort: "S", impact: 4, priority: "must", innovative: false },
    { name: "Surplus redistribution alert trigger", why: "Connects excess portions to community kitchens", effort: "M", impact: 5, priority: "must", innovative: true },
    { name: "Nutritional balance dashboard", why: "Displays macros for campus health metrics", effort: "S", impact: 3, priority: "should", innovative: false },
    { name: "Automated supplier reorder integration", why: "Restocks bulk staples based on week trends", effort: "L", impact: 3, priority: "could", innovative: false }
  ];

  // SHARED FORMULA:
  // budget_points = team_size * minutes_available * 0.5 / 20
  // used_points = sum of effort points of features with priority "must" or "should"
  const effortMap = { S: 1, M: 2, L: 4 };
  const rawBudget = (teamSize * minutesAvailable * 0.5) / 20;
  const budget_points = Math.round(rawBudget * 10) / 10;

  const usedRaw = features
    .filter((f) => f.priority === 'must' || f.priority === 'should')
    .reduce((acc, f) => acc + effortMap[f.effort], 0);
  const used_points = Math.round(usedRaw * 10) / 10;

  let verdict = "overscoped";
  if (used_points <= budget_points) {
    verdict = "realistic";
  } else if (used_points <= 1.3 * budget_points) {
    verdict = "tight";
  }

  const score = used_points === 0 ? 100 : Math.round(100 * Math.min(1, budget_points / used_points));

  const feasibility = {
    score,
    verdict,
    budget_points,
    used_points,
    message: verdict === "realistic"
      ? "Scope fits comfortably within team capacity and sprint duration."
      : verdict === "tight"
      ? "Scope is tight. Prune should-haves if backend integration encounters hiccups."
      : "Scope is overscoped for available minutes. Cut at least 2 features immediately."
  };

  return {
    session_id: null,
    source: "stub",
    problem: {
      summary: "Campus canteens face persistent food wastage and long student queues due to static batch meal planning without real-time demand signaling.",
      domain: "Campus Operations & Resource Sustainability",
      who_is_affected: [
        "Canteen management & culinary staff",
        "Students encountering meal stockouts",
        "Campus sustainability officers tracking ESG metrics"
      ],
      why_it_matters: "Food waste accounts for up to 30% of operating losses in institutional dining, while unpredictable shortages lead to widespread student dissatisfaction.",
      stakeholders: [
        { name: "Canteen Head Chef", interest: "Minimizing ingredient prep spoilage", influence: "high" },
        { name: "Student Council Rep", interest: "Affordable and predictable meal access", influence: "medium" },
        { name: "Campus Facilities Director", interest: "Lowering municipal waste disposal fees", influence: "high" }
      ],
      key_questions: [
        "How can we predict meal demand 3 hours before peak lunch service?",
        "What simple metric tells kitchen staff when to pause cooking batches?",
        "How do we handle sudden dietary preferences or campus schedule changes?",
        "Can students view meal availability on their phones without downloading an app?",
        "How will the team prove waste reduction during a 3-minute jury pitch?"
      ],
      assumptions: [
        "We assume historical daily attendance patterns correlate with meal demand.",
        "We assume canteen staff have a basic web browser or tablet in the kitchen.",
        "We assume students will check live meal status if accessible instantly via web."
      ]
    },
    expected_solution: {
      goal: "A lightweight demand forecasting and live inventory signaling web app that cuts meal over-preparation by 25%.",
      success_criteria: [
        "Demonstrates real-time portion decrement as simulated orders are logged.",
        "Computes estimated food waste reduction percentage dynamically.",
        "Zero-fail in-browser demo running completely without external API quotas."
      ],
      approach_options: [
        {
          name: "Heuristic Portion Estimator",
          how_it_works: "Uses calendar schedules, past day baselines, and rainfall data to calculate portion batches.",
          tradeoff: "Simpler to build and 100% reliable for hackathons, but ignores sudden real-time social events."
        },
        {
          name: "Live Student Pre-Ordering Poll",
          how_it_works: "Aggregates student 1-click lunch intentions 2 hours prior to service.",
          tradeoff: "Highly accurate demand signal, but requires high student adoption before it becomes useful."
        }
      ],
      out_of_scope: [
        "Full payment gateway processing or bank reconciliations.",
        "Native Android/iOS app store packages.",
        "Multi-campus enterprise supply chain integrations."
      ]
    },
    personas: [
      {
        name: "Chef Ramesh",
        role: "Canteen Head Cook",
        goal: "Prepare just enough rice and dal batches to meet lunch rush without discarding bins at 4 PM.",
        pain_point: "Has no visibility into student turnout until queues form at 12:30 PM.",
        how_to_validate: "Show Ramesh a 3-button kitchen tablet interface and see if portion guidance is clear within 10 seconds."
      },
      {
        name: "Pooja Sharma",
        role: "Third-Year Engineering Student",
        goal: "Grab lunch between classes within 20 minutes without waiting in long uncertain lines.",
        pain_point: "Discovers special thali is sold out only after standing in line for 15 minutes.",
        how_to_validate: "Simulate a live mobile web menu status and measure if Pooja can decide her order before walking to the canteen."
      }
    ],
    tech: [
      {
        layer: "Frontend",
        options: ["React", "Vue", "Plain HTML/CSS"],
        recommended: "React 18 + Vite",
        why: "Enables rapid declarative UI updates, quick component isolation, and instant hot module replacement.",
        tradeoff: "Requires client-side JavaScript execution."
      },
      {
        layer: "Backend / API",
        options: ["FastAPI", "Node/Express", "Flask"],
        recommended: "Python FastAPI",
        why: "High-performance async routing with built-in Pydantic validation matching contract models.",
        tradeoff: "Requires Python 3.10+ runtime."
      },
      {
        layer: "Database / Persistence",
        options: ["SQLite", "PostgreSQL", "In-Memory Dict"],
        recommended: "SQLite (mentor.db)",
        why: "Zero configuration, file-based persistence that runs reliably across all demo environments.",
        tradeoff: "Single-writer concurrency limit (sufficient for hackathon demo)."
      }
    ],
    mvp: {
      goal: "A stable end-to-end prototype showing real-time canteen portion counts decrementing and calculating waste saved.",
      must_have: [
        {
          id: "m1",
          name: "Batch Meal Demand Estimator",
          acceptance_criteria: [
            "Accepts expected campus attendance number",
            "Outputs recommended portion counts for 3 core dishes"
          ]
        },
        {
          id: "m2",
          name: "Live Kitchen Portion Tracker",
          acceptance_criteria: [
            "Kitchen staff can click -1 or -5 portions as meals are served",
            "Triggers 'Low Stock' visual banner when remaining portions drop below 15%"
          ]
        },
        {
          id: "m3",
          name: "Waste Savings Metric Card",
          acceptance_criteria: [
            "Compares baseline waste with optimized portion volume",
            "Displays estimated kg of food saved and cost delta"
          ]
        }
      ],
      nice_to_have: [
        "Push notifications for surplus meal clearance discounts",
        "Bar-code scanning for meal tokens",
        "Weekly nutritional trend graph"
      ],
      demo_path: [
        "1. Open Chef Dashboard showing 75 portions prepared for lunch.",
        "2. Simulate student meal orders reducing available thalis to 10.",
        "3. System highlights Low Stock Alert and suggests preparing a mini batch of 20.",
        "4. Canteen closes with only 2 portions leftover instead of 25.",
        "5. View Waste Savings Card confirming 23 kg saved."
      ]
    },
    workflow,
    tasks,
    checkpoints,
    features,
    feasibility,
    innovation_prompts: [
      "Could unused food portions automatically broadcast a flash discount to campus hostel students at 3:30 PM?",
      "Can we gamify clean plate returns with campus loyalty points?"
    ],
    demo_tips: [
      "Never refresh during live simulation; keep browser tab open and primed.",
      "Show the live portion decrement visually on screen—judges love interactive feedback.",
      "Anchor your pitch on the 25% waste reduction metric in the first 20 seconds."
    ],
    jury_outline: [
      { slide: 1, title: "The Problem", talking_point: "Campus canteens waste 30% of cooked food due to guesswork demand forecasting.", proof: "30 kg daily disposal volume costing 45k monthly." },
      { slide: 2, title: "Target Users", talking_point: "Chef Ramesh needs early prep guidance; students need stock visibility.", proof: "Direct interview insights and queue observation data." },
      { slide: 3, title: "Our Solution: PortionPulse", talking_point: "A lightweight dynamic portion forecast and live stock alert system.", proof: "Working live in-browser prototype running right now." },
      { slide: 4, title: "System Architecture", talking_point: "Modular React frontend backed by deterministic SQLite persistence.", proof: "Zero cloud dependencies; instant 50ms response time." },
      { slide: 5, title: "MVP Demo", talking_point: "Watch portions decrement live as orders simulate, keeping leftovers near zero.", proof: "Interactive 60-second walkthrough." },
      { slide: 6, title: "Impact & Scale", talking_point: "Easily deployable across 15 campus dining halls with zero hardware cost.", proof: "Estimated annual campus savings of 8 tonnes of food." }
    ],
    your_call: [
      {
        question: "Will you allow students to place pre-orders, or only display live stock status?",
        options: [
          "Display live stock status only (safer for 75-minute build)",
          "Allow 1-click token pre-orders (higher impact, needs order queue state)"
        ]
      },
      {
        question: "How should surplus food at 3:30 PM be handled in your demo?",
        options: [
          "Automatic flash sale alert at 50% discount",
          "One-click donation dispatch notification to campus shelter"
        ]
      }
    ]
  };
}
