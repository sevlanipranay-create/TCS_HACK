import React from 'react';
import Card from '../../components/Card.jsx';
import Badge from '../../components/Badge.jsx';

export function UsersTab({ personas = [] }) {
  if (!personas || personas.length === 0) return null;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
      {personas.map((p, idx) => (
        <Card key={idx} variant="white">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Persona {idx + 1}
            </span>
            <Badge variant="mint">{p.role}</Badge>
          </div>

          <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '12px' }}>
            {p.name}
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
            <div>
              <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block' }}>
                Primary Goal
              </span>
              <p style={{ color: 'var(--text-primary)' }}>{p.goal}</p>
            </div>

            <div style={{ padding: '8px 12px', background: 'rgba(199, 92, 92, 0.08)', borderRadius: '8px', borderLeft: '3px solid var(--error)' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--error)', display: 'block' }}>
                Pain Point
              </span>
              <p style={{ color: 'var(--text-primary)' }}>{p.pain_point}</p>
            </div>

            <div style={{ padding: '8px 12px', background: 'rgba(79, 138, 106, 0.08)', borderRadius: '8px', borderLeft: '3px solid var(--success)' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--success)', display: 'block' }}>
                How to Validate Fast
              </span>
              <p style={{ color: 'var(--text-primary)' }}>{p.how_to_validate}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

export default UsersTab;
