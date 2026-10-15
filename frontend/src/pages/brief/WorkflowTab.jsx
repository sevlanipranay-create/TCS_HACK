import React from 'react';
import Card from '../../components/Card.jsx';
import Badge from '../../components/Badge.jsx';

export function WorkflowTab({ workflow = [], checkpoints = [], minutesAvailable = 75 }) {
  if (!workflow || workflow.length === 0) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Visual Phase Time Distribution */}
      <Card variant="white">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)' }}>
              Sprint Phase Time Allocation
            </h3>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Total: {minutesAvailable} minutes across 6 sequential stages
            </span>
          </div>
          <Badge variant="mint">6 Stages</Badge>
        </div>

        {/* Phase Bar Segments */}
        <div style={{ display: 'flex', height: '24px', borderRadius: '8px', overflow: 'hidden', gap: '2px', background: 'var(--border)' }}>
          {workflow.map((p, idx) => {
            const pct = Math.max(5, (p.minutes / minutesAvailable) * 100);
            const colors = ['#051F20', '#0B2B26', '#163832', '#4F8A6A', '#8EB69B', '#C99A3D'];
            return (
              <div
                key={idx}
                style={{
                  width: `${pct}%`,
                  background: colors[idx % colors.length],
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  fontSize: '10px',
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  padding: '0 4px'
                }}
                title={`${p.phase}: ${p.minutes}m (${p.title})`}
              >
                {p.phase} ({p.minutes}m)
              </div>
            );
          })}
        </div>
      </Card>

      {/* Phase Details Table */}
      <Card variant="white">
        <h4 style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '10px', color: 'var(--text-primary)' }}>
          Phase Activities & Expected Outcomes
        </h4>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Stage</th>
                <th>Phase Title</th>
                <th>Minutes</th>
                <th>Key Activities</th>
                <th>Phase Outcome</th>
              </tr>
            </thead>
            <tbody>
              {workflow.map((p, idx) => (
                <tr key={idx}>
                  <td>
                    <Badge variant="mint">{p.phase}</Badge>
                  </td>
                  <td><strong>{p.title}</strong></td>
                  <td><strong>{p.minutes}m</strong></td>
                  <td style={{ maxWidth: '240px', color: 'var(--text-secondary)' }}>
                    {(p.activities || []).join('; ')}
                  </td>
                  <td style={{ maxWidth: '240px', color: 'var(--text-primary)' }}>
                    {p.outcome}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* 4 Ascending Checkpoints */}
      {checkpoints && checkpoints.length > 0 && (
        <Card variant="mint">
          <h4 style={{ fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--primary-deep)', marginBottom: '12px' }}>
            Sprint Milestones & Quality Checkpoints
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
            {checkpoints.map((cp, idx) => (
              <div
                key={idx}
                style={{
                  background: '#FFFFFF',
                  padding: '12px',
                  borderRadius: '10px',
                  border: '1px solid rgba(142, 182, 155, 0.4)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--primary-deep)' }}>
                    Checkpoint #{idx + 1}
                  </span>
                  <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 6px', background: 'var(--mint-light)', borderRadius: '4px', color: 'var(--primary-dark)' }}>
                    @ Minute {cp.at_minute}
                  </span>
                </div>
                <strong style={{ fontSize: '12px', color: 'var(--text-primary)', marginTop: '2px' }}>
                  {cp.check}
                </strong>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                  {cp.how}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

export default WorkflowTab;
