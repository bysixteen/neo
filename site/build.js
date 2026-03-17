'use strict';

const { marked } = require('marked');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const RESEARCH = path.join(ROOT, 'research');
const DIST = path.join(__dirname, 'dist');
const ASSETS_SRC = path.join(__dirname, 'assets');

// ── UTILITIES ──

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function read(filePath) {
  return fs.readFileSync(filePath, 'utf-8');
}

function write(filePath, content) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, content, 'utf-8');
  console.log('  ' + path.relative(DIST, filePath));
}

function stripFrontmatter(content) {
  if (!content.startsWith('---')) return content;
  const end = content.indexOf('\n---', 3);
  if (end === -1) return content;
  return content.slice(end + 4).trimStart();
}

function md(content) {
  return marked(content, { gfm: true });
}

function statusBadge(status) {
  const map = {
    complete:   { label: 'Complete',    bg: 'var(--green-bg)',  color: 'var(--green)',  border: 'var(--green-border)' },
    blocked:    { label: 'Blocked',     bg: 'var(--amber-bg)', color: 'var(--amber)',  border: 'var(--amber-border)' },
    candidate:  { label: 'Candidate',   bg: 'var(--surface-2)', color: 'var(--text-2)', border: 'var(--border)' },
    'in-progress': { label: 'In Progress', bg: 'var(--blue-bg)', color: 'var(--blue)', border: 'var(--blue-border)' },
  };
  const s = map[status] || map.candidate;
  return `<span style="background:${s.bg};color:${s.color};border:1px solid ${s.border};padding:2px 8px;border-radius:4px;font-size:12px;font-weight:600;white-space:nowrap">${s.label}</span>`;
}

// Populated after scanning sprints — injected inline into each page
let sprintsInlineData = '[]';

function page({ title, navId, root, content }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title} — Alexa Expression System</title>
  <link rel="stylesheet" href="${root}/assets/styles.css">
  <script>window.__sprints__ = ${sprintsInlineData};</script>
  <style>
    .main h1 { font-size: 28px; font-weight: 700; letter-spacing: -0.02em; margin-bottom: 32px; }
    .main h2 { font-size: 20px; font-weight: 700; margin: 32px 0 12px; padding-bottom: 10px; border-bottom: 1px solid var(--border); }
    .main h3 { font-size: 16px; font-weight: 600; margin: 24px 0 8px; }
    .main p { font-size: 14px; color: var(--text-2); line-height: 1.7; margin-bottom: 12px; }
    .main ul, .main ol { font-size: 14px; color: var(--text-2); line-height: 1.7; padding-left: 24px; margin-bottom: 12px; }
    .main li { margin-bottom: 6px; }
    .main li strong { color: var(--text); }
    .main table { width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 24px; }
    .main th { text-align: left; padding: 8px 12px; background: var(--surface-2); border-bottom: 2px solid var(--border); font-weight: 600; color: var(--text); }
    .main td { padding: 8px 12px; border-bottom: 1px solid var(--border); color: var(--text-2); vertical-align: top; }
    .main tr:last-child td { border-bottom: none; }
    .main blockquote { border-left: 3px solid var(--border-strong); padding: 8px 16px; color: var(--text-2); font-style: italic; margin: 16px 0; }
    .main hr { border: none; border-top: 1px solid var(--border); margin: 32px 0; }
    .main a { color: var(--blue); }
    .main a:hover { text-decoration: underline; }
    .main pre { background: var(--surface-2); border: 1px solid var(--border); border-radius: 8px; padding: 16px; overflow-x: auto; margin-bottom: 16px; }
    .main pre code { background: none; border: none; padding: 0; font-size: 13px; }
  </style>
</head>
<body data-layout="docs" data-active-nav="${navId}" data-root="${root}">
  <div class="page-wrapper">
    <main class="main">
      ${content}
    </main>
  </div>
  <script src="${root}/assets/layout.js"></script>
</body>
</html>`;
}

// ── COPY ASSETS ──

console.log('\nBuilding Alexa Expression System docs...\n');
ensureDir(path.join(DIST, 'assets'));
fs.copyFileSync(path.join(ASSETS_SRC, 'layout.js'), path.join(DIST, 'assets', 'layout.js'));
fs.copyFileSync(path.join(ASSETS_SRC, 'styles.css'), path.join(DIST, 'assets', 'styles.css'));

// ── SCAN SPRINTS ──

const sprintsDir = path.join(RESEARCH, 'sprints');
const sprintFolders = fs.readdirSync(sprintsDir)
  .filter(f => fs.statSync(path.join(sprintsDir, f)).isDirectory())
  .sort();

const sprints = sprintFolders.map(folder => {
  const summaryPath = path.join(sprintsDir, folder, 'summary.json');
  const summary = JSON.parse(read(summaryPath));
  return { folder, summary };
});

// ── GENERATE sprints.json ──

const sprintsJson = sprints.map(({ folder, summary }) => ({
  type: 'sprint',
  topic: `Sprint ${summary.sprint_id.replace('sprint-', '')} — ${summary.topic}`,
  href: `sprints/${folder}/index.html`,
}));

write(path.join(DIST, 'sprints.json'), JSON.stringify(sprintsJson, null, 2));
sprintsInlineData = JSON.stringify(sprintsJson);

// ── SPRINT DETAIL PAGES ──

for (const { folder, summary } of sprints) {
  const sprintDir = path.join(sprintsDir, folder);
  const sprintNumber = summary.sprint_id.replace('sprint-', '');

  const briefRaw     = fs.existsSync(path.join(sprintDir, 'brief.md'))     ? read(path.join(sprintDir, 'brief.md'))     : '';
  const synthesisRaw = fs.existsSync(path.join(sprintDir, 'synthesis.md')) ? read(path.join(sprintDir, 'synthesis.md')) : '';
  const decisionRaw  = fs.existsSync(path.join(sprintDir, 'decision.md'))  ? read(path.join(sprintDir, 'decision.md'))  : '';

  const openQuestionsRows = (summary.open_questions || [])
    .map(q => `<tr><td>${q}</td></tr>`)
    .join('\n');

  const openQuestionsTable = openQuestionsRows ? `
    <h2>Open Questions</h2>
    <table>
      <thead><tr><th>Question</th></tr></thead>
      <tbody>${openQuestionsRows}</tbody>
    </table>` : '';

  const content = `
<div class="sprint-hero">
  <div class="sprint-number">Sprint ${sprintNumber}</div>
  <div class="sprint-topic">${summary.topic}</div>
  <div class="sprint-date">${summary.date_completed} &nbsp;·&nbsp; ${statusBadge('complete')}</div>
</div>

<div class="sprint-decision-block">
  <div class="sprint-decision-label">Key Decision</div>
  <div class="sprint-decision-text">${summary.key_decision}</div>
</div>

${summary.elias_dissent ? `<div class="dissent-block">
  <div class="dissent-label">&#9651;&nbsp; Elias Vance — Dissent</div>
  <div class="dissent-text">${summary.elias_dissent}</div>
</div>` : ''}

<div class="next-action">
  <div class="next-action-label">Next Action</div>
  <div class="next-action-text">${summary.next_action}</div>
</div>

${openQuestionsTable}

${synthesisRaw ? `<div class="sprint-section" id="synthesis">
  <h2>Synthesis</h2>
  ${md(stripFrontmatter(synthesisRaw))}
</div>` : ''}

${decisionRaw ? `<div class="sprint-section" id="decision">
  <h2>Decision</h2>
  ${md(stripFrontmatter(decisionRaw))}
</div>` : ''}

${briefRaw ? `<div class="sprint-section" id="brief">
  <h2>Brief</h2>
  ${md(stripFrontmatter(briefRaw))}
</div>` : ''}`;

  write(
    path.join(DIST, 'sprints', folder, 'index.html'),
    page({
      title: `Sprint ${sprintNumber} — ${summary.topic}`,
      navId: `sprint-${sprintNumber}`,
      root: '../..',
      content,
    })
  );
}

// ── SPRINT LIST PAGE ──

const sprintCards = sprints.map(({ folder, summary }) => {
  const sprintNumber = summary.sprint_id.replace('sprint-', '');
  return `<a class="gallery-card" href="${folder}/index.html">
  <div class="gallery-card-header">
    <span class="gallery-card-number sprint">Sprint ${sprintNumber}</span>
    <span class="gallery-card-topic">${summary.topic}</span>
    <span class="gallery-card-date">${summary.date_completed}</span>
  </div>
  <div class="gallery-card-decision">${summary.key_decision}</div>
</a>`;
}).join('\n');

write(
  path.join(DIST, 'sprints', 'index.html'),
  page({
    title: 'Sprints',
    navId: 'sprints',
    root: '..',
    content: `<h1>Sprints</h1><div class="gallery-grid">${sprintCards}</div>`,
  })
);

// ── LIVING DOCUMENT PAGES ──

const docs = [
  { file: 'PRINCIPLES.md',       id: 'principles', title: 'Principles',       out: 'principles.html' },
  { file: 'DECISIONS.md',        id: 'decisions',  title: 'Decisions',        out: 'decisions.html' },
  { file: 'PERSONAS.md',         id: 'personas',   title: 'Personas',         out: 'personas.html' },
  { file: 'sprint-backlog.md',   id: 'backlog',    title: 'Sprint Backlog',   out: 'backlog.html' },
  { file: 'dissent-register.md', id: 'dissent',    title: 'Dissent Register', out: 'dissent.html' },
];

for (const doc of docs) {
  const raw = read(path.join(RESEARCH, doc.file));
  write(
    path.join(DIST, doc.out),
    page({ title: doc.title, navId: doc.id, root: '.', content: md(stripFrontmatter(raw)) })
  );
}

// ── HOME PAGE ──

const recentSprints = sprints.slice(0, 5).map(({ folder, summary }) => {
  const sprintNumber = summary.sprint_id.replace('sprint-', '');
  return `<a class="gallery-card" href="sprints/${folder}/index.html">
  <div class="gallery-card-header">
    <span class="gallery-card-number sprint">Sprint ${sprintNumber}</span>
    <span class="gallery-card-topic">${summary.topic}</span>
    <span class="gallery-card-date">${summary.date_completed}</span>
  </div>
  <div class="gallery-card-decision">${summary.key_decision}</div>
</a>`;
}).join('\n');

const homeContent = `
<div class="hero">
  <div class="hero-eyebrow">Amazon DxD — Design Engagement</div>
  <h1>Alexa Expression System</h1>
  <p class="hero-desc">Sprint documentation, living principles, design decisions, and personas for the Alexa multi-surface expression system engagement.</p>
</div>

<div class="section" id="sprints">
  <div class="section-header">
    <div class="section-badge badge-sprint">S</div>
    <div class="section-title-group">
      <h2>Sprints</h2>
      <div class="section-sub">Design sprint outcomes and decisions</div>
    </div>
  </div>
  <div class="gallery-grid">${recentSprints}</div>
  ${sprints.length > 5 ? `<a href="sprints/index.html" style="font-size:13px;color:var(--text-3)">View all sprints &rarr;</a>` : ''}
</div>

<div class="section" id="living-documents">
  <div class="section-header">
    <div class="section-badge badge-guide">L</div>
    <div class="section-title-group">
      <h2>Living Documents</h2>
      <div class="section-sub">Updated each sprint</div>
    </div>
  </div>
  <div class="gallery-grid">
    <a class="gallery-card" href="principles.html">
      <div class="gallery-card-header"><span class="gallery-card-topic">Principles</span></div>
      <div class="gallery-card-decision">Design and technical principles guiding the engagement</div>
    </a>
    <a class="gallery-card" href="decisions.html">
      <div class="gallery-card-header"><span class="gallery-card-topic">Decisions</span></div>
      <div class="gallery-card-decision">Significant decisions made across all sprints</div>
    </a>
    <a class="gallery-card" href="personas.html">
      <div class="gallery-card-header"><span class="gallery-card-topic">Personas</span></div>
      <div class="gallery-card-decision">DxD Designer, Engineer, VP+ and end-user personas</div>
    </a>
    <a class="gallery-card" href="backlog.html">
      <div class="gallery-card-header"><span class="gallery-card-topic">Sprint Backlog</span></div>
      <div class="gallery-card-decision">Upcoming sprint and spike candidates with priorities</div>
    </a>
    <a class="gallery-card" href="dissent.html">
      <div class="gallery-card-header"><span class="gallery-card-topic">Dissent Register</span></div>
      <div class="gallery-card-decision">Overruled concerns preserved for future review</div>
    </a>
  </div>
</div>
`;

write(
  path.join(DIST, 'index.html'),
  page({ title: 'Home', navId: 'home', root: '.', content: homeContent })
);

console.log(`\nDone. ${sprints.length} sprint(s) + ${docs.length + 2} pages → dist/\n`);
console.log('Preview:  cd site && npm run preview');
