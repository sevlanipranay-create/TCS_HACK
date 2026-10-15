import React, { useState, useEffect } from 'react';
import { useSession } from '../../state/SessionContext.jsx';
import { getClient } from '../../api/client.js';
import { mockSamples } from '../../api/mockData.js';
import {
  LayoutDashboard,
  SearchCode,
  Lightbulb,
  Cpu,
  Clock,
  KanbanSquare,
  Scale,
  MessageSquareCode,
  Sparkles,
  ChevronRight,
  RotateCcw
} from '../common/Icons.jsx';

const AVAILABLE_SKILLS = [
  'Python',
  'React',
  'ML/AI',
  'Databases',
  'UI design',
  'Pitching',
  'DevOps'
];

export const Sidebar = ({ isOpen, onClose }) => {
  const {
    team,
    setTeam,
    page,
    setPage,
    brief,
    progress,
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
        if (Array.isArray(res?.samples) && res.samples.length > 0) {
          setSamples(res.samples);
        } else {
          setSamples(mockSamples);
        }
      })
      .catch(() => {
        setSamples(mockSamples);
      });
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

  const navItems = [
    { id: 'brief', label: '1. Mentor Brief', icon: SearchCode },
    { id: 'tracker', label: '2. Sprint Tracker', icon: KanbanSquare },
    { id: 'chat', label: '3. Mentor Chat', icon: MessageSquareCode },
    { id: 'judge', label: '4. Practice Judge', icon: Scale, highlight: true }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 35,
            background: 'rgba(5, 31, 32, 0.7)',
            backdropFilter: 'blur(4px)'
          }}
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        {/* Top Header */}
        <div>
          <div className="sidebar-header">
            <div className="brand-badge">
              <div className="brand-icon">🧠</div>
              <div>
                <h1 className="brand-title">HackMentor</h1>
                <p className="brand-sub">TCS AI Advisor</p>
              </div>
            </div>
            {isMock ? (
              <span
                style={{
                  fontSize: '9px',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  background: 'rgba(142, 182, 155, 0.25)',
                  color: 'var(--color-brand-mint)'
                }}
              >
                Mock
              </span>
            ) : (
              <span
                style={{
                  fontSize: '9px',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  background: backendStatus === 'ok' ? 'rgba(79, 138, 106, 0.3)' : 'rgba(201, 154, 61, 0.3)',
                  color: backendStatus === 'ok' ? 'var(--color-brand-mint)' : '#E6B750'
                }}
              >
                {backendStatus === 'ok' ? 'Live API' : 'Dev Proxy'}
              </span>
            )}
          </div>

          {/* Navigation Links */}
          <div className="sidebar-body">
            <div>
              <p className="sidebar-section-title">Sprint Navigation</p>
              <nav className="sidebar-nav">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = page === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => { setPage(item.id); onClose(); }}
                      className={`nav-link ${isActive ? 'active' : ''}`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4" style={{ color: isActive ? 'var(--color-brand-mint)' : 'inherit' }} />
                        <span>{item.label}</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Sample Problem Loader */}
            {samples.length > 0 && (
              <div>
                <label htmlFor="sample-dropdown" className="form-label">
                  <span>Load Sample Problem:</span>
                </label>
                <select
                  id="sample-dropdown"
                  className="sidebar-select"
                  onChange={handleSampleSelect}
                  defaultValue=""
                >
                  <option value="" disabled>-- Choose a problem sample --</option>
                  {samples.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.title} ({s.team?.minutes_available}m, {s.team?.team_size}p)
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Team Context Form */}
            <div className="sidebar-card">
              <div style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-brand-mint)', marginBottom: '12px', letterSpacing: '0.04em' }}>
                Your Team Context
              </div>

              {/* Team Size */}
              <div style={{ marginBottom: '12px' }}>
                <label htmlFor="input-team-size" className="form-label">
                  <span>Team Size:</span>
                  <strong style={{ color: 'var(--color-brand-mint)' }}>{team.team_size} members</strong>
                </label>
                <input
                  id="input-team-size"
                  type="range"
                  min="1"
                  max="8"
                  value={team.team_size}
                  onChange={(e) => setTeam({ team_size: Number(e.target.value) })}
                  style={{ width: '100%', accentColor: 'var(--color-brand-mint)', cursor: 'pointer' }}
                />
              </div>

              {/* Minutes Available */}
              <div style={{ marginBottom: '12px' }}>
                <label htmlFor="input-minutes" className="form-label">
                  <span>Minutes Available:</span>
                  <strong style={{ color: 'var(--color-brand-mint)' }}>{team.minutes_available}m</strong>
                </label>
                <input
                  id="input-minutes"
                  type="number"
                  min="20"
                  max="600"
                  value={team.minutes_available}
                  onChange={(e) => setTeam({ minutes_available: Math.max(20, Math.min(600, Number(e.target.value) || 20)) })}
                  className="sidebar-input"
                />
              </div>

              {/* Skills */}
              <div style={{ marginBottom: '12px' }}>
                <span className="form-label">Skills:</span>
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

              {/* Preferred Stack */}
              <div>
                <label htmlFor="input-stack" className="form-label">
                  <span>Preferred Stack:</span>
                </label>
                <input
                  id="input-stack"
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

        {/* Sidebar Footer */}
        <div className="sidebar-footer">
          {/* Sprint Milestone Status Pill */}
          <div style={{ background: 'var(--color-brand-dark)', borderRadius: '10px', padding: '10px', border: '1px solid var(--color-brand-forest)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-brand-mint)' }}>
                Sprint Status
              </span>
              <span
                style={{
                  fontSize: '9px',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  padding: '1px 5px',
                  borderRadius: '4px',
                  background: progress?.status === 'behind' ? 'rgba(199,92,92,0.2)' : 'rgba(79,138,106,0.2)',
                  color: progress?.status === 'behind' ? 'var(--color-status-error)' : 'var(--color-status-success)'
                }}
              >
                {progress?.status ? progress.status.replace('_', ' ') : 'Ready'}
              </span>
            </div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#FFFFFF' }}>
              {brief ? `${brief.tasks?.filter(t => t.done).length || 0}/${brief.tasks?.length || 0} Tasks Done` : 'Brief Needed'}
            </div>
          </div>

          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={resetSession}
            style={{ width: '100%', borderColor: 'var(--color-brand-forest)', color: 'var(--color-brand-mint-light)' }}
            id="btn-sidebar-reset"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Sprint Session</span>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', color: 'var(--color-brand-text-muted)', paddingTop: '4px' }}>
            <span>Backend:</span>
            <button
              type="button"
              onClick={checkHealth}
              title="Click to check backend status"
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: backendStatus === 'ok' ? 'var(--color-brand-mint)' : '#E6B750',
                fontWeight: 700,
                fontSize: '11px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <span style={{ fontSize: '7px' }}>●</span>
              {backendStatus === 'ok' ? 'Online' : 'Offline / Mock'}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
