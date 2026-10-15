// src/lib/format.js
// Export Markdown and formatting utilities for Hackathon Mentor AI

export function exportMarkdown({ brief, progress, lastJudge }) {
  if (!brief) return '';

  const lines = [];
  lines.push(`# Hackathon Mentor Brief: ${brief.problem?.domain || 'Problem Overview'}`);
  lines.push('');
  lines.push(`**Source:** ${brief.source || 'rules'}`);
  lines.push('');

  // 1. Problem
  lines.push('## 1. Problem Explained');
  lines.push('');
  lines.push(`**Summary:** ${brief.problem?.summary || ''}`);
  lines.push('');
  lines.push(`**Domain:** ${brief.problem?.domain || ''}`);
  lines.push('');
  lines.push(`**Why It Matters:** ${brief.problem?.why_it_matters || ''}`);
  lines.push('');
  lines.push('### Who Is Affected');
  (brief.problem?.who_is_affected || []).forEach((item) => {
    lines.push(`- ${item}`);
  });
  lines.push('');
  lines.push('### Key Questions');
  (brief.problem?.key_questions || []).forEach((q) => {
    lines.push(`- ${q}`);
  });
  lines.push('');
  lines.push('### Assumptions');
  (brief.problem?.assumptions || []).forEach((a) => {
    lines.push(`- [Assumption] ${a}`);
  });
  lines.push('');

  // 2. Expected Solution
  lines.push('## 2. Expected Solution (Shape, Not Implementation)');
  lines.push(`**Goal:** ${brief.expected_solution?.goal || ''}`);
  lines.push('');
  lines.push('### Success Criteria');
  (brief.expected_solution?.success_criteria || []).forEach((sc) => {
    lines.push(`- ${sc}`);
  });
  lines.push('');
  lines.push('### Approach Options');
  (brief.expected_solution?.approach_options || []).forEach((opt, idx) => {
    lines.push(`#### Option ${idx + 1}: ${opt.name}`);
    lines.push(`- **How it works:** ${opt.how_it_works}`);
    lines.push(`- **Trade-off:** ${opt.tradeoff}`);
  });
  lines.push('');

  // 3. Personas
  lines.push('## 3. Personas');
  (brief.personas || []).forEach((p) => {
    lines.push(`### ${p.name} (${p.role})`);
    lines.push(`- **Goal:** ${p.goal}`);
    lines.push(`- **Pain Point:** ${p.pain_point}`);
    lines.push(`- **How to Validate:** ${p.how_to_validate}`);
    lines.push('');
  });

  // 4. Technology Options
  lines.push('## 4. Technology Recommendations');
  lines.push('| Layer | Recommended | Why | Trade-off | Other Options |');
  lines.push('| --- | --- | --- | --- | --- |');
  (brief.tech || []).forEach((t) => {
    lines.push(`| ${t.layer} | **${t.recommended}** | ${t.why} | ${t.tradeoff} | ${(t.options || []).join(', ')} |`);
  });
  lines.push('');

  // 5. MVP
  lines.push('## 5. MVP Definition');
  lines.push(`**Goal:** ${brief.mvp?.goal || ''}`);
  lines.push('');
  lines.push('### Must Haves');
  (brief.mvp?.must_have || []).forEach((mh) => {
    lines.push(`- **${mh.name}**`);
    (mh.acceptance_criteria || []).forEach((ac) => {
      lines.push(`  - Acceptance: ${ac}`);
    });
  });
  lines.push('');
  lines.push('### Demo Path');
  (brief.mvp?.demo_path || []).forEach((step, idx) => {
    lines.push(`${idx + 1}. ${step}`);
  });
  lines.push('');

  // 6. Workflow & Tasks
  lines.push('## 6. Workflow & Tasks');
  (brief.tasks || []).forEach((t) => {
    lines.push(`- [${t.done ? 'x' : ' '}] **${t.title}** (${t.owner_role}, ${t.minutes}m) [Phase: ${t.phase}]`);
  });
  lines.push('');

  // 7. Feasibility
  if (brief.feasibility) {
    lines.push('## Feasibility Assessment');
    lines.push(`- **Verdict:** ${brief.feasibility.verdict}`);
    lines.push(`- **Score:** ${brief.feasibility.score} / 100`);
    lines.push(`- **Message:** ${brief.feasibility.message}`);
    lines.push('');
  }

  // 8. Progress (if present)
  if (progress) {
    lines.push('## Sprint Progress');
    lines.push(`- **Status:** ${progress.status}`);
    lines.push(`- **Done:** ${progress.percent_done}% (${progress.tasks_done}/${progress.tasks_total} tasks)`);
    lines.push(`- **Elapsed:** ${progress.minutes_elapsed} / ${progress.minutes_total} mins`);
    lines.push('');
  }

  // 9. Judge Report (if present)
  if (lastJudge) {
    lines.push('## Practice Judge Report');
    lines.push(`- **Overall Score:** ${lastJudge.overall}/100`);
    lines.push(`- **Readiness:** ${lastJudge.readiness}`);
    lines.push('');
    lines.push('### Criteria Scores');
    (lastJudge.criteria || []).forEach((c) => {
      lines.push(`- **${c.name}:** ${c.score}/5 (${c.evidence})`);
    });
    lines.push('');
    lines.push(`> *${lastJudge.disclaimer}*`);
    lines.push('');
  }

  return lines.join('\n');
}

export function downloadFile(filename, content, type = 'text/markdown') {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
