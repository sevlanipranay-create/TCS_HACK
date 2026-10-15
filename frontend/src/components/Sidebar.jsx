import React, { useState, useEffect } from 'react';
import { useSession } from '../state/SessionContext.jsx';
import { getClient } from '../api/client.js';

const AVAILABLE_SKILLS = [
  'Python',
  'React',
  'ML/AI',
  'Databases',
  'UI design',
  'Pitching',
  'DevOps'
];

export function Sidebar({ isOpen, onClose }) {
  const {
    team,
    setTeam,
    page,
    setPage,
    resetSession,
    loadSample,
    backendStatus,
    checkHealth
  } = useSession();

  const [samples, setSamples] = useState([]);
  const isMock = import.meta.env?.VITE_USE_MOCK === 'true';

  useEffect(() => {
    getClient().samples()
      .then((res) => {
        if (Array.isArray(res?.samples)) {
          setSamples(res.samples);
        }
      })
      .catch(() => {});
  }, []);

  const handleSkillToggle = (skill) => {
    const current = team.skills || [];
    const updated = current.includes(skill)
      ? current.filter((s) => s !== skill)
      : [...current, skill];
    setTeam({ skills: updated });
  };

  const handleSampleSelect = (e) => {
    const sId = e.target.value;
    if (!sId) return;
    const target = samples.find((s) => s.id === sId);
    if (target) {
      loadSample(target);
    }
  };

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div>
        {/* Header */}
        <div className="sidebar-header">
          <div className="brand-badge">
            <div className="brand-icon">🧠</div>
            <div>
              <div className="brand-title">HackMentor AI</div>
              <div className="brand-sub">TCS Tech Day @ VESIT</div>
            </div>
          </div>
          {isMock && (
            <span
              style={{
                fontSize: '10px',
                padding: '2px 6px',
                borderRadius: '4px',
                background: 'rgba(142, 182, 155, 0.25)',
                color: 'var(--mint)',
                fontWeight: 700,
                textTransform: 'uppercase'
              }}
            >
              Mock
            </span>
          )}
        </div>

        {/* Body */}
        <div className="sidebar-body">
          {/* Navigation Links */}
          <nav className="sidebar-nav" aria-label="Main Navigation">
            <button
              type="button"
              className={`nav-link ${page === 'brief' ? 'active' : ''}`}
              onClick={() => { setPage('brief'); onClose(); }}
            >
              <span>1. Mentor Brief</span>
              <span>→</span>
            </button>
            <button
              type="button"
              className={`nav-link ${page === 'tracker' ? 'active' : ''}`}
              onClick={() => { setPage('tracker'); onClose(); }}
            >
              <span>2. Sprint Tracker</span>
              <span>→</span>
            </button>
            <button
              type="button"
              className={`nav-link ${page === 'chat' ? 'active' : ''}`}
              onClick={() => { setPage('chat'); onClose(); }}
            >
              <span>3. Mentor Chat</span>
              <span>→</span>
            </button>
            <button
              type="button"
              className={`nav-link ${page === 'judge' ? 'active' : ''}`}
              onClick={() => { setPage('judge'); onClose(); }}
            >
              <span>4. Judge Mode</span>
              <span>→</span>
            </button>
          </nav>

          {/* Sample Problem Loader */}
          {samples.length > 0 && (
            <div>
              <label htmlFor="sample-select" className="form-label">
                Load Sample Problem:
              </label>
              <select
                id="sample-select"
                className="sidebar-select"
                onChange={handleSampleSelect}
                defaultValue=""
              >
                <option value="" disabled>-- Select a sample --</option>
                {samples.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title} ({s.team?.minutes_available}m, {s.team?.team_size}p)
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Your Team Form */}
          <div className="sidebar-form">
            <div className="sidebar-form-title">Your Team Context</div>

            <div>
              <label htmlFor="team-size" className="form-label">
                <span>Team Size:</span>
                <strong style={{ color: 'var(--mint)' }}>{team.team_size}</strong>
              </label>
              <input
                id="team-size"
                type="range"
                min="1"
                max="8"
                value={team.team_size}
                onChange={(e) => setTeam({ team_size: Number(e.target.value) })}
                className="sidebar-input"
                style={{ padding: '4px' }}
              />
            </div>

            <div>
              <label htmlFor="minutes-available" className="form-label">
                <span>Minutes Available:</span>
                <strong style={{ color: 'var(--mint)' }}>{team.minutes_available}m</strong>
              </label>
              <input
                id="minutes-available"
                type="number"
                min="20"
                max="600"
                value={team.minutes_available}
                onChange={(e) => setTeam({ minutes_available: Math.max(20, Math.min(600, Number(e.target.value) || 20)) })}
                className="sidebar-input"
              />
            </div>

            <div>
              <label className="form-label">Team Skills:</label>
              <div className="skills-grid">
                {AVAILABLE_SKILLS.map((skill) => (
                  <label key={skill} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={(team.skills || []).includes(skill)}
                      onChange={() => handleSkillToggle(skill)}
                    />
                    <span>{skill}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="preferred-stack" className="form-label">
                Preferred Stack:
              </label>
              <input
                id="preferred-stack"
                type="text"
                placeholder="e.g. FastAPI + React"
                value={team.preferred_stack || ''}
                onChange={(e) => setTeam({ preferred_stack: e.target.value })}
                className="sidebar-input"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Footer Actions & Backend Status */}
      <div className="sidebar-footer">
        <button
          type="button"
          className="btn btn-outline btn-sm"
          onClick={resetSession}
          style={{ width: '100%', borderColor: 'var(--primary-forest)', color: 'var(--mint-light)' }}
        >
          ↻ New Session
        </button>

        <div className="status-line">
          <span>Backend API:</span>
          <button
            type="button"
            onClick={checkHealth}
            title="Click to re-check backend connection"
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: backendStatus === 'ok' ? 'var(--mint)' : 'var(--error)',
              fontWeight: 700,
              fontSize: '11px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <span style={{ fontSize: '8px' }}>●</span>
            {backendStatus === 'ok' ? 'Connected (ok)' : 'Offline / Mock'}
          </button>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
