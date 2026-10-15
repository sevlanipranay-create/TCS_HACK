// src/api/httpClient.js
// HTTP client talking to backend at /api with timeout, readable error translation and contract audit

import {
  validateBrief,
  validateProgress,
  validateChatResponse,
  validateJudgeReport,
  validateSessionView
} from '../lib/contract.js';

export class ApiError extends Error {
  constructor(message, status = 500) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export function toApiError(status, body) {
  if (!body) {
    return new ApiError(`Request failed with status ${status}`, status);
  }
  if (typeof body === 'string') {
    return new ApiError(body, status);
  }
  if (typeof body.detail === 'string') {
    return new ApiError(body.detail, status);
  }
  if (Array.isArray(body.detail)) {
    // FastAPI 422 validation error
    const msgs = body.detail.map((err) => {
      const loc = Array.isArray(err.loc) ? err.loc.filter((x) => x !== 'body').join('.') : 'field';
      return `${loc}: ${err.msg || 'invalid value'}`;
    });
    return new ApiError(msgs.join('; '), status);
  }
  return new ApiError(`Request failed with status ${status}`, status);
}

export class HttpClient {
  constructor() {
    this.baseUrl = import.meta.env?.VITE_API_URL || '';
  }

  async _request(path, options = {}, validator = null) {
    const url = `${this.baseUrl}${path}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000);

    try {
      const res = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers || {})
        }
      });
      clearTimeout(timeout);

      const isJson = res.headers.get('content-type')?.includes('application/json');
      const data = isJson ? await res.json() : await res.text();

      if (!res.ok) {
        throw toApiError(res.status, data);
      }

      // Dev-mode contract auditing
      if (import.meta.env?.DEV && validator && typeof validator === 'function') {
        const issues = validator(data);
        if (issues && issues.length > 0) {
          console.warn(`[contract] ${path}: ${issues.join(', ')}`);
        }
      }

      return data;
    } catch (err) {
      clearTimeout(timeout);
      if (err instanceof ApiError) {
        throw err;
      }
      if (err.name === 'AbortError') {
        throw new ApiError('Request timed out after 60 seconds.', 504);
      }
      // Network failure
      throw new ApiError('Backend not reachable. Start it with: uvicorn backend.main:app --port 8000', 503);
    }
  }

  async health() {
    return this._request('/api/health', { method: 'GET' });
  }

  async samples() {
    return this._request('/api/samples', { method: 'GET' });
  }

  async createBrief(payload) {
    return this._request('/api/brief', {
      method: 'POST',
      body: JSON.stringify(payload)
    }, validateBrief);
  }

  async chat(payload) {
    return this._request('/api/chat', {
      method: 'POST',
      body: JSON.stringify(payload)
    }, validateChatResponse);
  }

  async getSession(sessionId) {
    return this._request(`/api/sessions/${sessionId}`, {
      method: 'GET'
    }, validateSessionView);
  }

  async setTask(sessionId, taskId, done) {
    return this._request(`/api/sessions/${sessionId}/tasks/${taskId}`, {
      method: 'PATCH',
      body: JSON.stringify({ done })
    });
  }

  async getProgress(sessionId, elapsedMin = null) {
    const q = elapsedMin !== null && elapsedMin !== undefined ? `?elapsed_min=${elapsedMin}` : '';
    return this._request(`/api/sessions/${sessionId}/progress${q}`, {
      method: 'GET'
    }, validateProgress);
  }

  async judge(payload) {
    return this._request('/api/judge', {
      method: 'POST',
      body: JSON.stringify(payload)
    }, validateJudgeReport);
  }
}

export const httpClient = new HttpClient();
