import React from 'react';
import { useSession } from '../../state/SessionContext.jsx';
import { Menu, Clock, Sparkles, CheckCircle2, AlertTriangle, ShieldAlert } from '../common/Icons.jsx';
import Badge from '../Badge.jsx';

export const Navbar = ({ onOpenSidebar }) => {
  const { brief, progress, team, page, setPage, backendStatus, checkHealth } = useSession();

  const status = progress?.status || 'on_track';
  const percentDone = progress?.percent_done ?? 0;
  const elapsed = progress?.minutes_elapsed ?? 0;
  const total = progress?.minutes_total ?? team.minutes_available;

  const statusVariant = {
    ahead: 'success',
    on_track: 'mint',
    behind: 'error'
  }[status] || 'mint';

  const statusLabel = {
    ahead: 'Ahead of Pace',
    on_track: 'On Track',
    behind: 'Behind Pace'
  }[status] || 'On Track';

  return (
    <header className="top-navbar">
      {/* Left: Mobile Toggle & Project Context */}
      <div className="navbar-left">
        <button
          type="button"
          onClick={onOpenSidebar}
          aria-label="Open sidebar"
          className="btn btn-outline btn-sm"
          style={{ padding: '6px 10px', display: 'none' }}
          id="btn-mobile-sidebar"
        >
          <Menu className="w-4 h-4" />
        </button>

        <div>
          <div className="flex items-center gap-2">
            <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-brand-forest)' }}>
              TCS Tech Day @ VESIT
            </span>
            <span style={{ color: 'var(--color-brand-mint)' }}>•</span>
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-brand-text-muted)' }}>
              Team ({team.team_size} members, {team.minutes_available}m)
            </span>
          </div>
          <h2 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--color-brand-text-primary)' }} className="truncate">
            {brief?.problem?.domain ? `${brief.problem.domain} Mentor Plan` : 'Hackathon Sprint Command Center'}
          </h2>
        </div>
      </div>

      {/* Right: Quick Stats & Actions */}
      <div className="navbar-right">
        {/* Time Remaining / Elapsed Pill */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '5px 10px',
            borderRadius: '10px',
            background: 'var(--color-brand-bg)',
            border: '1px solid rgba(142, 182, 155, 0.4)',
            fontSize: '12px',
            fontWeight: 700,
            color: 'var(--color-brand-deepest)'
          }}
          title="Elapsed sprint minutes of total allocated"
        >
          <Clock className="w-3.5 h-3.5" style={{ color: 'var(--color-brand-forest)' }} />
          <span>{elapsed}m</span>
          <span style={{ fontSize: '11px', fontWeight: 500, color: 'var(--color-brand-text-muted)' }}>
            / {total}m
          </span>
        </div>

        {/* Pace Badge */}
        <Badge variant={statusVariant}>
          {statusLabel}
        </Badge>

        {/* Overall Progress Mini Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '4px 10px',
            background: '#FFFFFF',
            border: '1px solid var(--color-brand-mint-light)',
            borderRadius: '10px'
          }}
        >
          <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-brand-text-secondary)' }}>
            Progress
          </span>
          <div style={{ width: '64px', height: '7px', background: 'var(--color-brand-mint-light)', borderRadius: '9999px', overflow: 'hidden' }}>
            <div
              style={{
                width: `${percentDone}%`,
                height: '100%',
                background: 'var(--color-brand-mint)',
                borderRadius: '9999px',
                transition: 'width 0.3s ease'
              }}
            />
          </div>
          <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--color-brand-text-primary)' }}>
            {percentDone}%
          </span>
        </div>

        {/* Quick Judge Simulation Button */}
        <button
          type="button"
          onClick={() => setPage('judge')}
          className={`btn ${page === 'judge' ? 'btn-mint' : 'btn-primary'} btn-sm`}
          id="btn-navbar-judge"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Practice Judge</span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;
