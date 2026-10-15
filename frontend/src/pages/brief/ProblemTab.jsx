import React from 'react';
import Card from '../../components/Card.jsx';
import Badge from '../../components/Badge.jsx';

export function ProblemTab({ problem }) {
  if (!problem) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Summary & Domain */}
      <Card variant="white">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            Domain: {problem.domain}
          </span>
          <Badge variant="mint">Problem Explained</Badge>
        </div>
        <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
          {problem.summary}
        </h3>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          <strong>Why It Matters:</strong> {problem.why_it_matters}
        </p>
      </Card>

      {/* Who is Affected */}
      <Card variant="white">
        <h4 style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '10px', color: 'var(--text-primary)' }}>
          Who Is Affected
        </h4>
        <ul style={{ paddingLeft: '18px', fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {(problem.who_is_affected || []).map((who, i) => (
            <li key={i}>{who}</li>
          ))}
        </ul>
      </Card>

      {/* Stakeholders Table */}
      <Card variant="white">
        <h4 style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '10px', color: 'var(--text-primary)' }}>
          Stakeholder Mapping
        </h4>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Stakeholder</th>
                <th>Core Interest</th>
                <th>Influence</th>
              </tr>
            </thead>
            <tbody>
              {(problem.stakeholders || []).map((sh, idx) => (
                <tr key={idx}>
                  <td><strong>{sh.name}</strong></td>
                  <td>{sh.interest}</td>
                  <td>
                    <Badge variant={sh.influence === 'high' ? 'error' : sh.influence === 'medium' ? 'warning' : 'mint'}>
                      {sh.influence}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Key Questions & Assumptions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
        <Card variant="white">
          <h4 style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '10px', color: 'var(--text-primary)' }}>
            Key Questions to Probe
          </h4>
          <ol style={{ paddingLeft: '18px', fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {(problem.key_questions || []).map((q, i) => (
              <li key={i}>{q}</li>
            ))}
          </ol>
        </Card>

        <Card variant="mint">
          <h4 style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '10px', color: 'var(--primary-deep)' }}>
            Guiding Assumptions
          </h4>
          <ul style={{ paddingLeft: '18px', fontSize: '13px', color: 'var(--text-primary)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {(problem.assumptions || []).map((a, i) => (
              <li key={i}>{a}</li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}

export default ProblemTab;
