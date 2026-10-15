import React from 'react';
import Card from '../../components/Card.jsx';
import Badge from '../../components/Badge.jsx';
import { exportMarkdown, downloadFile } from '../../lib/format.js';

export function PitchTab({ brief, progress, lastJudge }) {
  if (!brief) return null;

  const { jury_outline = [], demo_tips = [], innovation_prompts = [] } = brief;

  const handleDownload = () => {
    const md = exportMarkdown({ brief, progress, lastJudge });
    const filename = `mentor-brief-${(brief.problem?.domain || 'hackathon').toLowerCase().replace(/\s+/g, '-')}.md`;
    downloadFile(filename, md, 'text/markdown');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Top Banner with Download Action */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
            Pitch & Presentation Coaching
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Structuring your story for the judges with concrete evidence and high-impact slides.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleDownload}
          id="btn-download-brief"
        >
          ⬇ Download Brief (Markdown)
        </button>
      </div>

      {/* Jury Slide Outline Table */}
      <Card variant="white">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h4 style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-primary)' }}>
            6-Slide Jury Outline
          </h4>
          <Badge variant="mint">Jury Deck</Badge>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '60px' }}>Slide</th>
                <th style={{ width: '160px' }}>Title</th>
                <th>Talking Point</th>
                <th>Proof / Demo Element</th>
              </tr>
            </thead>
            <tbody>
              {jury_outline.map((slide) => (
                <tr key={slide.slide}>
                  <td>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '26px',
                        height: '26px',
                        borderRadius: '6px',
                        background: 'var(--primary-deep)',
                        color: 'var(--mint)',
                        fontWeight: 700,
                        fontSize: '12px'
                      }}
                    >
                      {slide.slide}
                    </span>
                  </td>
                  <td><strong>{slide.title}</strong></td>
                  <td style={{ color: 'var(--text-primary)' }}>{slide.talking_point}</td>
                  <td style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                    {slide.proof}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Innovation Prompts & Demo Tips */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
        {/* Innovation Prompts */}
        <Card variant="mint">
          <h4 style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '10px', color: 'var(--primary-deep)' }}>
            💡 Innovation Prompts (Stand Out)
          </h4>
          <ul style={{ paddingLeft: '18px', fontSize: '13px', color: 'var(--text-primary)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {innovation_prompts.map((prompt, i) => (
              <li key={i}>{prompt}</li>
            ))}
          </ul>
        </Card>

        {/* Demo Tips */}
        <Card variant="white">
          <h4 style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '10px', color: 'var(--text-primary)' }}>
            🎯 Demo Execution Tips
          </h4>
          <ul style={{ paddingLeft: '18px', fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {demo_tips.map((tip, i) => (
              <li key={i}>{tip}</li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}

export default PitchTab;
