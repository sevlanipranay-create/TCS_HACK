import React from 'react';
import Card from '../../components/Card.jsx';
import Badge from '../../components/Badge.jsx';

export function TechTab({ tech = [] }) {
  if (!tech || tech.length === 0) return null;

  return (
    <Card variant="white">
      <div style={{ marginBottom: '14px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>
          Technology Recommendations
        </h3>
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
          Matched against team skills with explicit rationale and architectural trade-offs.
        </p>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Layer</th>
              <th>Recommended Stack</th>
              <th>Why (Decision Rationale)</th>
              <th>Trade-off</th>
              <th>Other Feasible Options</th>
            </tr>
          </thead>
          <tbody>
            {tech.map((t, idx) => (
              <tr key={idx}>
                <td>
                  <Badge variant="mint">{t.layer}</Badge>
                </td>
                <td>
                  <strong style={{ color: 'var(--primary-deep)', fontSize: '13px' }}>
                    {t.recommended}
                  </strong>
                </td>
                <td style={{ maxWidth: '260px', color: 'var(--text-secondary)' }}>
                  {t.why}
                </td>
                <td style={{ maxWidth: '240px', color: '#8C651A', background: 'rgba(201, 154, 61, 0.05)' }}>
                  {t.tradeoff}
                </td>
                <td style={{ color: 'var(--text-muted)' }}>
                  {(t.options || []).join(', ')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

export default TechTab;
