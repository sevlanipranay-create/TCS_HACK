// src/state/SessionContext.jsx
// React Context and Reducer managing Hackathon Mentor session state

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { getClient } from '../api/client.js';

const SessionContext = createContext(null);

const STORAGE_KEY = 'p8_session_id';

const initialTeam = {
  team_size: 4,
  minutes_available: 75,
  skills: ['Python', 'React'],
  preferred_stack: ''
};

const initialState = {
  team: initialTeam,
  problem: '',
  sessionId: null,
  brief: null,
  progress: null,
  messages: [],
  lastJudge: null,
  page: 'brief', // 'brief' | 'tracker' | 'chat' | 'judge'
  backendStatus: 'checking', // 'ok' | 'offline' | 'checking'
  loading: false,
  error: null
};

function sessionReducer(state, action) {
  switch (action.type) {
    case 'SET_PAGE':
      return { ...state, page: action.payload, error: null };
    case 'SET_TEAM':
      return { ...state, team: { ...state.team, ...action.payload } };
    case 'SET_PROBLEM':
      return { ...state, problem: action.payload };
    case 'SET_BRIEF':
      return {
        ...state,
        brief: action.payload,
        sessionId: action.payload?.session_id || state.sessionId,
        error: null
      };
    case 'SET_PROGRESS':
      return { ...state, progress: action.payload };
    case 'SET_MESSAGES':
      return { ...state, messages: action.payload };
    case 'ADD_MESSAGE':
      return { ...state, messages: [...state.messages, action.payload] };
    case 'SET_JUDGE':
      return { ...state, lastJudge: action.payload };
    case 'SET_BACKEND_STATUS':
      return { ...state, backendStatus: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    case 'RESET_SESSION':
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (_) {}
      return {
        ...initialState,
        team: { ...state.team },
        backendStatus: state.backendStatus,
        page: 'brief'
      };
    case 'RESTORE_SESSION':
      return {
        ...state,
        sessionId: action.payload.session_id,
        problem: action.payload.problem_statement || state.problem,
        team: action.payload.team || state.team,
        brief: action.payload.brief,
        messages: action.payload.messages || [],
        lastJudge: action.payload.last_judge || null,
        error: null
      };
    default:
      return state;
  }
}

export function SessionProvider({ children }) {
  const [state, dispatch] = useReducer(sessionReducer, initialState);
  const client = getClient();

  const checkHealth = useCallback(async () => {
    try {
      const res = await client.health();
      dispatch({ type: 'SET_BACKEND_STATUS', payload: res?.status === 'ok' ? 'ok' : 'offline' });
    } catch (_) {
      dispatch({ type: 'SET_BACKEND_STATUS', payload: 'offline' });
    }
  }, [client]);

  // Initial load: check health and restore localStorage session id
  useEffect(() => {
    checkHealth();

    let storedId = null;
    try {
      storedId = localStorage.getItem(STORAGE_KEY);
    } catch (_) {}

    if (storedId) {
      client.getSession(storedId)
        .then((sessionView) => {
          if (sessionView) {
            dispatch({ type: 'RESTORE_SESSION', payload: sessionView });
            // Also fetch progress
            client.getProgress(storedId)
              .then((p) => dispatch({ type: 'SET_PROGRESS', payload: p }))
              .catch(() => {});
          }
        })
        .catch((err) => {
          if (err?.status === 404) {
            try { localStorage.removeItem(STORAGE_KEY); } catch (_) {}
          }
        });
    }
  }, [client, checkHealth]);

  // Sync session id to localStorage
  useEffect(() => {
    if (state.sessionId) {
      try {
        localStorage.setItem(STORAGE_KEY, state.sessionId);
      } catch (_) {}
    }
  }, [state.sessionId]);

  const setPage = (page) => dispatch({ type: 'SET_PAGE', payload: page });
  const setTeam = (teamUpdates) => dispatch({ type: 'SET_TEAM', payload: teamUpdates });
  const setProblem = (problem) => dispatch({ type: 'SET_PROBLEM', payload: problem });
  const resetSession = () => dispatch({ type: 'RESET_SESSION' });
  const clearError = () => dispatch({ type: 'CLEAR_ERROR' });

  const loadSample = (sample) => {
    if (!sample) return;
    dispatch({ type: 'SET_PROBLEM', payload: sample.problem_statement || '' });
    if (sample.team) {
      dispatch({ type: 'SET_TEAM', payload: sample.team });
    }
    dispatch({ type: 'SET_PAGE', payload: 'brief' });
  };

  const createBrief = async (problemStatement, teamContext) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'CLEAR_ERROR' });
    try {
      const brief = await client.createBrief({
        problem_statement: problemStatement,
        team: teamContext
      });
      dispatch({ type: 'SET_BRIEF', payload: brief });

      // Load initial progress
      if (brief?.session_id) {
        const prog = await client.getProgress(brief.session_id);
        dispatch({ type: 'SET_PROGRESS', payload: prog });
      }
      return brief;
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.message || 'Failed to generate brief' });
      throw err;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const setTask = async (taskId, done) => {
    if (!state.sessionId) return;
    try {
      await client.setTask(state.sessionId, taskId, done);
      // Refetch progress
      const prog = await client.getProgress(state.sessionId);
      dispatch({ type: 'SET_PROGRESS', payload: prog });

      // Update local brief tasks
      if (state.brief?.tasks) {
        const updatedTasks = state.brief.tasks.map((t) =>
          t.id === taskId ? { ...t, done } : t
        );
        dispatch({
          type: 'SET_BRIEF',
          payload: { ...state.brief, tasks: updatedTasks }
        });
      }
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.message || 'Failed to update task state' });
      throw err;
    }
  };

  const refreshProgress = async (elapsedMin = null) => {
    if (!state.sessionId) return;
    try {
      const prog = await client.getProgress(state.sessionId, elapsedMin);
      dispatch({ type: 'SET_PROGRESS', payload: prog });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.message || 'Failed to refresh progress' });
    }
  };

  const sendMessage = async (message, stage) => {
    if (!state.sessionId) return;
    dispatch({ type: 'SET_LOADING', payload: true });
    const userMsg = {
      role: 'user',
      content: message,
      stage,
      created_at: new Date().toISOString()
    };
    dispatch({ type: 'ADD_MESSAGE', payload: userMsg });

    try {
      const res = await client.chat({
        session_id: state.sessionId,
        message,
        stage
      });
      const mentorMsg = {
        role: 'mentor',
        content: res.reply,
        stage: res.stage,
        follow_up_questions: res.follow_up_questions,
        guardrail_triggered: res.guardrail_triggered,
        source: res.source,
        created_at: new Date().toISOString()
      };
      dispatch({ type: 'ADD_MESSAGE', payload: mentorMsg });
      return res;
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.message || 'Chat error' });
      throw err;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const submitJudge = async (judgeData) => {
    if (!state.sessionId) return;
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'CLEAR_ERROR' });
    try {
      const report = await client.judge({
        session_id: state.sessionId,
        ...judgeData
      });
      dispatch({ type: 'SET_JUDGE', payload: report });
      return report;
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.message || 'Judge evaluation error' });
      throw err;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  return (
    <SessionContext.Provider
      value={{
        ...state,
        setPage,
        setTeam,
        setProblem,
        loadSample,
        resetSession,
        createBrief,
        setTask,
        refreshProgress,
        sendMessage,
        submitJudge,
        checkHealth,
        clearError
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error('useSession must be used within SessionProvider');
  }
  return ctx;
}
