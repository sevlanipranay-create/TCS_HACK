import React from 'react';
import Card from '../../components/Card.jsx';
import Badge from '../../components/Badge.jsx';

export function MvpTab({ mvp }) {
  if (!mvp) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* MVP Goal */}
      <Card variant="white">
        <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
          MVP Boundary
        </span>
        <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
          Core Goal: {mvp.goal}
        </h3>
      </Card>

      {/* Must Haves with Acceptance Criteria */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <h4 style={{ fontSize: '14px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-primary)' }}>
            Must-Have Capabilities ({mvp.must_have?.length || 0})
          </h4>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Deliver these before touching any nice-to-haves
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '14px' }}>
          {(mvp.must_have || []).map((mh, idx) => (
            <Card key={mh.id || idx} variant="white" style={{ borderLeft: '4px solid var(--primary-deep)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <strong style={{ fontSize: '14px', color: 'var(--text-primary)' }}>
                  {mh.name}
                </strong>
                <Badge variant="mint">Must Have</Badge>
              </div>

              <div style={{ marginTop: '10px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  Acceptance Criteria
                </span>
                <ul style={{ paddingLeft: '18px', fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {(mh.acceptance_criteria || []).map((ac, i) => (
                    <li key={i}>{ac}</li>
                  ))}
                </ul>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Nice To Have */}
      {mvp.nice_to_have && mvp.nice_to_have.length > 0 && (
        <Card variant="white">
          <h4 style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>
            Nice to Have (Deferred Past Demo)
          </h4>
          <ul style={{ paddingLeft: '18px', fontSize: '12px', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {mvp.nice_to_have.map((nth, i) => (
              <li key={i}>{nth}</li>
            ))}
          </ul>
        </Card>
      )}

      {/* Numbered Demo Path */}
      <Card variant="mint">
        <h4 style={{ fontSize: '14px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--primary-deep)', marginBottom: '12px' }}>
          Numbered Demo Path ({mvp.demo_path?.length || 0} Steps)
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {(mvp.demo_path || []).map((step, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                background: '#FFFFFF',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid rgba(142, 182, 155, 0.4)'
              }}
            >
              <span
                style={{
                  width: '22px',
                  height: '22px',
                  borderRadius: '50%',
                  background: 'var(--primary-deep)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '11px',
                  fontWeight: 700,
                  flexShrink: 0,
                  marginTop: '1px'
                }}
              >
                {idx + 1}
              </span>
              <span style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: 500 }}>
                {step.replace(/^\d+\.\s*/, '')}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

export default MvpTab;
