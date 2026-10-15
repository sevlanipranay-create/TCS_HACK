import React, { useState } from 'react';
import Card from '../../components/Card.jsx';
import Badge from '../../components/Badge.jsx';

export function SolutionTab({ expectedSolution, yourCall = [] }) {
  const [expandedIndex, setExpandedIndex] = useState(0);

  if (!expectedSolution) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Solution Goal & Success Criteria */}
      <Card variant="white">
        <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
          Solution Shape
        </span>
        <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', margin: '6px 0 12px' }}>
          Goal: {expectedSolution.goal}
        </h3>

        <h4 style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '8px' }}>
          Measurable Success Criteria
        </h4>
        <ul style={{ paddingLeft: '18px', fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {(expectedSolution.success_criteria || []).map((sc, i) => (
            <li key={i}>{sc}</li>
          ))}
        </ul>
      </Card>

      {/* Approach Options */}
      <div>
        <h4 style={{ fontSize: '14px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-primary)', marginBottom: '10px' }}>
          Approach Options (Coaching Options with Trade-offs)
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {(expectedSolution.approach_options || []).map((opt, idx) => {
            const isExpanded = expandedIndex === idx;
            return (
              <Card key={idx} variant="white" style={{ borderColor: isExpanded ? 'var(--border-strong)' : 'var(--border)' }}>
                <div
                  onClick={() => setExpandedIndex(isExpanded ? -1 : idx)}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '6px',
                        background: 'var(--primary-deep)',
                        color: 'var(--mint)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        fontWeight: 700
                      }}
                    >
                      {idx + 1}
                    </span>
                    <strong style={{ fontSize: '14px', color: 'var(--text-primary)' }}>{opt.name}</strong>
                  </div>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {isExpanded ? '▲ Collapse' : '▼ Expand'}
                  </span>
                </div>

                {isExpanded && (
                  <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                    <p style={{ color: 'var(--text-primary)' }}>
                      <strong>How it works:</strong> {opt.how_it_works}
                    </p>
                    <div style={{ padding: '8px 12px', borderRadius: '8px', background: 'rgba(201, 154, 61, 0.1)', color: '#8C651A', fontSize: '12px' }}>
                      <strong>Trade-off:</strong> {opt.tradeoff}
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>

      {/* Out of Scope */}
      <Card variant="white">
        <h4 style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--error)', marginBottom: '8px' }}>
          Explicitly Out of Scope
        </h4>
        <ul style={{ paddingLeft: '18px', fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {(expectedSolution.out_of_scope || []).map((oos, i) => (
            <li key={i}>{oos}</li>
          ))}
        </ul>
      </Card>

      {/* Your Call Decisions */}
      {yourCall && yourCall.length > 0 && (
        <Card variant="mint">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <h4 style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--primary-deep)' }}>
              Your Call (Team Decisions)
            </h4>
            <Badge variant="mint">These decisions are yours</Badge>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
            The AI mentor outlines options, but your team makes the final call.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {yourCall.map((dp, idx) => (
              <div key={idx} style={{ background: '#FFFFFF', padding: '12px', borderRadius: '8px', border: '1px solid rgba(142,182,155,0.4)' }}>
                <strong style={{ fontSize: '13px', color: 'var(--primary-deep)', display: 'block', marginBottom: '6px' }}>
                  Decision {idx + 1}: {dp.question}
                </strong>
                <ul style={{ paddingLeft: '18px', fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {(dp.options || []).map((opt, i) => (
                    <li key={i}>{opt}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

export default SolutionTab;
