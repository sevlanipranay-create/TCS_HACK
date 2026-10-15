import { mockProject } from '../mock/project.js';
import { mockProblem } from '../mock/problem.js';
import { mockSolutions, mockSolutionRecommendation } from '../mock/solutions.js';
import {
  mockMvpFeatures,
  mockTechStack,
  mockWorkflow,
  mockKanbanTasks,
  mockTeamProgress,
  mockValidationItems,
  mockEdgeCases,
  mockSolutionImprovement
} from '../mock/tasks.js';
import { mockJudgeQuestions, mockReadinessScore } from '../mock/judge.js';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

/**
 * Centralized API Service for HackMentor.
 * If VITE_API_URL is configured, fetches from real backend endpoints;
 * otherwise uses structured local mock datasets with realistic simulation latency.
 */
class ApiService {
  constructor() {
    this.baseUrl = API_BASE_URL;
    this.isMock = !this.baseUrl;
  }

  async _simulateDelay(ms = 350) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Project Info
  async getProject() {
    if (!this.isMock) {
      try {
        const res = await fetch(`${this.baseUrl}/api/project`);
        if (res.ok) return await res.json();
      } catch (err) {
        console.warn('Backend unavailable, falling back to mock project data:', err);
      }
    }
    await this._simulateDelay(200);
    return { ...mockProject };
  }

  // Problem Analysis
  async analyzeProblem(payload) {
    if (!this.isMock) {
      try {
        const res = await fetch(`${this.baseUrl}/api/problem/analyze`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) return await res.json();
      } catch (err) {
        console.warn('Backend unavailable, falling back to mock problem analysis:', err);
      }
    }
    await this._simulateDelay(600);
    
    // Check for vague problem statement edge case
    const text = (payload?.statement || '').trim().toLowerCase();
    const isVague = text.length < 35 || 
      text.includes('improve education') || 
      text.includes('solve climate') || 
      text.includes('make healthcare better') ||
      (!text.includes('fleet') && !text.includes('delivery') && !text.includes('logistics') && text.split(' ').length < 8);

    if (isVague) {
      return {
        isVague: true,
        statement: payload.statement,
        clarification: mockProblem.clarificationGuide
      };
    }

    return {
      isVague: false,
      statement: payload.statement,
      ...mockProblem.analysis
    };
  }

  // Solutions
  async getSolutions() {
    if (!this.isMock) {
      try {
        const res = await fetch(`${this.baseUrl}/api/solutions`);
        if (res.ok) return await res.json();
      } catch (err) {
        console.warn('Backend unavailable, falling back to mock solutions:', err);
      }
    }
    await this._simulateDelay(300);
    return {
      solutions: [...mockSolutions],
      recommendation: mockSolutionRecommendation
    };
  }

  // MVP & Technology
  async getMvpAndTech() {
    if (!this.isMock) {
      try {
        const res = await fetch(`${this.baseUrl}/api/mvp-tech`);
        if (res.ok) return await res.json();
      } catch (err) {
        console.warn('Backend unavailable, falling back to mock mvp & tech:', err);
      }
    }
    await this._simulateDelay(300);
    return {
      features: [...mockMvpFeatures],
      techStack: mockTechStack
    };
  }

  // Workflow & Timeline
  async getWorkflow() {
    if (!this.isMock) {
      try {
        const res = await fetch(`${this.baseUrl}/api/workflow`);
        if (res.ok) return await res.json();
      } catch (err) {
        console.warn('Backend unavailable, falling back to mock workflow:', err);
      }
    }
    await this._simulateDelay(250);
    return {
      schedule: [...mockWorkflow],
      teamTasks: [...mockTeamProgress]
    };
  }

  // Progress & Kanban
  async getProgress() {
    if (!this.isMock) {
      try {
        const res = await fetch(`${this.baseUrl}/api/progress`);
        if (res.ok) return await res.json();
      } catch (err) {
        console.warn('Backend unavailable, falling back to mock progress:', err);
      }
    }
    await this._simulateDelay(250);
    return {
      overallProgress: mockProject.overallProgress,
      projectHealth: mockProject.projectHealth,
      healthReason: mockProject.healthReason,
      tasks: [...mockKanbanTasks]
    };
  }

  // Validation & Edge Cases
  async getValidationAndEdgeCases() {
    if (!this.isMock) {
      try {
        const res = await fetch(`${this.baseUrl}/api/validation`);
        if (res.ok) return await res.json();
      } catch (err) {
        console.warn('Backend unavailable, falling back to mock validation:', err);
      }
    }
    await this._simulateDelay(300);
    return {
      validationItems: [...mockValidationItems],
      edgeCases: [...mockEdgeCases]
    };
  }

  // Solution Improvement
  async getSolutionImprovement() {
    if (!this.isMock) {
      try {
        const res = await fetch(`${this.baseUrl}/api/improvement`);
        if (res.ok) return await res.json();
      } catch (err) {
        console.warn('Backend unavailable, falling back to mock improvement:', err);
      }
    }
    await this._simulateDelay(350);
    return { ...mockSolutionImprovement };
  }

  // Judge Mode
  async getJudgeQuestions() {
    if (!this.isMock) {
      try {
        const res = await fetch(`${this.baseUrl}/api/judge/questions`);
        if (res.ok) return await res.json();
      } catch (err) {
        console.warn('Backend unavailable, falling back to mock judge questions:', err);
      }
    }
    await this._simulateDelay(300);
    return [...mockJudgeQuestions];
  }

  async submitJudgeAnswer(questionId, answer) {
    if (!this.isMock) {
      try {
        const res = await fetch(`${this.baseUrl}/api/judge/evaluate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ questionId, answer })
        });
        if (res.ok) return await res.json();
      } catch (err) {
        console.warn('Backend unavailable, falling back to mock evaluation:', err);
      }
    }
    await this._simulateDelay(800);
    const targetQ = mockJudgeQuestions.find(q => q.id === questionId) || mockJudgeQuestions[0];
    const isShort = (answer || '').trim().split(' ').length < 15;

    if (isShort) {
      return {
        score: {
          problemUnderstanding: 6,
          innovation: 5,
          impact: 5,
          technicalFeasibility: 6,
          presentation: 5
        },
        feedback: "Your answer gives a general idea, but lacks quantifiable specifics. Judges want to know exact metrics (e.g. % improvement, algorithm name, concrete user persona) rather than vague claims."
      };
    }

    return {
      score: targetQ.defaultScore,
      feedback: targetQ.defaultFeedback
    };
  }

  // Hackathon Readiness
  async getReadinessScore() {
    if (!this.isMock) {
      try {
        const res = await fetch(`${this.baseUrl}/api/readiness`);
        if (res.ok) return await res.json();
      } catch (err) {
        console.warn('Backend unavailable, falling back to mock readiness:', err);
      }
    }
    await this._simulateDelay(300);
    return { ...mockReadinessScore };
  }

  // AI Mentor Chat
  async askMentor(query, actionType = 'general') {
    await this._simulateDelay(600);
    const queryLower = (query || '').toLowerCase();

    if (actionType === 'challenge' || queryLower.includes('challenge')) {
      return {
        type: 'challenge',
        title: 'Mentor Challenge: How do you handle sudden order cancellations?',
        content: 'If 3 packages in a 20-package route are cancelled mid-transit, re-running a full optimization from scratch on a driver’s phone causes unnecessary route confusion. In your pitch, explain how your route dynamically absorbs drop-outs without rerouting previous stops.'
      };
    }
    if (actionType === 'prioritize' || queryLower.includes('prioritize')) {
      return {
        type: 'prioritize',
        title: 'Mentor Priority Check: Cut the Driver Native Mobile App',
        content: 'You have only 2 hours left. Building authentication and native mobile GPS tracking is a trap. Build a clean, responsive mobile web itinerary preview in React. Judges only need to see that it works on a phone screen.'
      };
    }
    if (actionType === 'weaknesses' || queryLower.includes('weakness')) {
      return {
        type: 'weakness',
        title: 'Mentor Risk Flag: Validation Gap',
        content: 'You have zero external quotes or user validation metrics. If a judge asks: "Did you talk to any logistics manager or courier driver?", having even a 1-page survey from 3 delivery partners will put you in the top 5% of teams.'
      };
    }
    return {
      type: 'advice',
      title: 'Mentor Recommendation for Current Sprint',
      content: 'Your project architecture is in great shape. Keep your focus on finishing the MVP Route Waypoint Sequence display and ensure the carbon savings number is animated. Demo visual clarity wins hackathons.'
    };
  }
}

export const api = new ApiService();
export default api;
