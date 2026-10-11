/* AMAD Level-4 Learning Hub: vanilla JS, no build step. */
(() => {
'use strict';

const $ = (s, r = document) => r.querySelector(s);
const view = $('#view');
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const enc = p => p.split('/').map(encodeURIComponent).join('/');
const fileUrl = p => 'files/' + enc(p);
const projUrl = (slug, rel) => fileUrl(`projects/${slug}/${rel}`);
const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage blocked */ } }
};

let DATA = null, TREE = {};

/* ---------- theme ---------- */
function applyTheme(t) {
  document.documentElement.dataset.theme = t;
  $('#hljs-theme').href = t === 'dark' ? 'vendor/hljs-dark.css' : 'vendor/hljs-light.css';
}
applyTheme(store.get('amad-theme', matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
$('#theme').addEventListener('click', () => {
  const t = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  applyTheme(t); store.set('amad-theme', t);
});

/* ---------- helpers ---------- */
const progress = () => store.get('amad-progress', {});
function setDone(id, v) { const p = progress(); if (v) p[id] = true; else delete p[id]; store.set('amad-progress', p); }
const moduleById = id => DATA.modules.find(m => m.id === id);
const langFor = path => {
  const ext = (path.split('.').pop() || '').toLowerCase();
  return ({kt:'kotlin', kts:'kotlin', xml:'xml', json:'json', example:'json', properties:'properties',
           toml:'ini', md:'markdown', pro:'plaintext', keep:'plaintext'})[ext] || 'plaintext';
};
const fmtSize = n => n < 1024 ? n + ' B' : (n / 1024).toFixed(1) + ' KB';

async function copyText(text, btn) {
  try { await navigator.clipboard.writeText(text); }
  catch {
    const ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta);
    ta.select(); try { document.execCommand('copy'); } catch {} ta.remove();
  }
  if (btn) { const old = btn.textContent; btn.textContent = 'Copied ✓'; setTimeout(() => btn.textContent = old, 1400); }
}

/* ---------- document modal ---------- */
function openDoc(title, url) {
  $('#modal-title').textContent = title;
  $('#modal-frame').src = url;
  $('#modal-open').href = url;
  const dl = $('#modal-dl'); dl.href = url; dl.setAttribute('download', url.split('/').pop());
  $('#modal').hidden = false; document.body.style.overflow = 'hidden';
}
function closeDoc() { $('#modal').hidden = true; $('#modal-frame').src = 'about:blank'; document.body.style.overflow = ''; }
$('#modal-close').addEventListener('click', closeDoc);
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !$('#modal').hidden) closeDoc(); });
document.addEventListener('click', e => {
  const b = e.target.closest('[data-doc]');
  if (b) { e.preventDefault(); openDoc(b.dataset.title, b.dataset.doc); }
});

/* ---------- views ---------- */
function moduleCard(m) {
  const done = !!progress()[m.id];
  const jobs = DATA.projects.filter(p => p.related.includes(m.id));
  return `<article class="card" data-search="${esc((m.title + ' ' + m.code + ' ' + m.outcomes.join(' ') + ' ' + m.keywords.join(' ')).toLowerCase())}">
    <h3><span class="num">${m.id}</span>${esc(m.title)}</h3>
    <div><span class="badge mono">${esc(m.code)}</span><span class="badge">${m.pages} pages</span></div>
    <ul class="tight">${m.outcomes.map(o => `<li>${esc(o)}</li>`).join('')}</ul>
    ${jobs.length ? `<p>Used in: ${jobs.map(j => `<a href="#/projects/${j.slug}">Job ${j.job}</a>`).join(', ')}</p>` : ''}
    <label class="check"><input type="checkbox" data-done="${m.id}" ${done ? 'checked' : ''}> Mark as completed</label>
    <div class="actions">
      <button class="btn small" data-doc="${fileUrl(m.file)}" data-title="Module ${m.id}: ${esc(m.short)}">📖 Read</button>
      <a class="btn small ghost" href="${fileUrl(m.file)}" download>⬇ PDF</a>
    </div>
  </article>`;
}

function projectCard(p) {
  return `<article class="card">
    <h3><span class="num">${p.job}</span>${esc(p.title)}</h3>
    <div>${p.stack.map(s => `<span class="badge k">${esc(s)}</span>`).join('')}<span class="badge">⏱ ${esc(p.time)}</span></div>
    <p>${esc(p.summary)}</p>
    <div class="actions">
      <a class="btn small" href="#/projects/${p.slug}">Explore</a>
      <a class="btn small ghost" href="#/projects/${p.slug}/code">Browse code</a>
      <a class="btn small ghost" href="downloads/${p.slug}.zip">⬇ ZIP</a>
    </div>
  </article>`;
}

function renderHome() {
  const c = DATA.course, mods = DATA.modules;
  const pages = mods.reduce((a, m) => a + m.pages, 0);
  const done = mods.filter(m => progress()[m.id]).length;
  const pct = Math.round(done / mods.length * 100);
  view.innerHTML = `
  <section class="hero">
    <h1>${esc(c.title)} <span style="color:var(--brand)">${esc(c.level)}</span></h1>
    <p>${esc(c.tagline)}</p>
    <div class="cta">
      <a class="btn" href="#/modules">Start with the modules</a>
      <a class="btn ghost" href="#/projects">Browse projects</a>
      <a class="btn ghost" href="#/assessment">Assessment prep</a>
      <a class="btn ghost" href="${esc(c.courseUrl)}" target="_blank" rel="noopener">Official course page ↗</a>
    </div>
  </section>
  <div class="stats">
    <div class="stat"><b>${mods.length}</b><span>Course modules (CBLM)</span></div>
    <div class="stat"><b>${pages}</b><span>Pages of learning material</span></div>
    <div class="stat"><b>${DATA.projects.length}</b><span>Complete Kotlin projects</span></div>
    <div class="stat"><b>37</b><span>Solved MCQs in the bank</span></div>
    <div class="stat"><b>${DATA.assessment.length}</b><span>Assessment documents</span></div>
  </div>

  <div class="section-title"><h2>Suggested learning path</h2><span>Click a step to open the module</span></div>
  <div class="path">${DATA.learningPath.map((s, i) =>
    `${i ? '<span class="arrow">→</span>' : ''}<a href="#/modules/${s.module}"><span class="num" style="margin:0">${s.module}</span>${esc(s.step)}</a>`).join('')}
  </div>

  <div class="section-title"><h2>Your progress</h2><span id="pg-text">${done} of ${mods.length} modules completed</span></div>
  <div class="progress" aria-label="Progress"><i style="width:${pct}%"></i></div>
  <p style="color:var(--muted);font-size:13.5px">Progress is saved in your own browser only. It is never uploaded.</p>

  <div class="section-title"><h2>Projects</h2><span>Real apps you can read, download and run</span></div>
  <div class="grid">${DATA.projects.map(projectCard).join('')}</div>

  <div class="section-title"><h2>How to use this hub</h2></div>
  <div class="grid">
    <div class="card"><h3>📚 Learn</h3><p>Read the seven modules in order, tick them off, then test yourself with the oral preparation and solved MCQs.</p></div>
    <div class="card"><h3>🛠 Build</h3><p>Open a project, read the specification and the AI-agent prompt, then compare your own solution with the working code.</p></div>
    <div class="card"><h3>⬇ Reuse</h3><p>Copy any file or prompt with one click, or download a whole project as a ZIP and open it in Android Studio.</p></div>
  </div>`;
}

function renderModules(focusId) {
  view.innerHTML = `
  <div class="section-title"><h2>Course modules</h2><span>${DATA.modules.length} CBLM units, ${DATA.modules.reduce((a, m) => a + m.pages, 0)} pages</span></div>
  <div class="toolbar"><input id="mf" type="search" placeholder="Filter modules by topic, e.g. sqlite, retrofit, inheritance…"></div>
  <div class="grid" id="mgrid">${DATA.modules.map(moduleCard).join('')}</div>
  <p class="empty" id="mempty" hidden>No module matches your filter.</p>`;
  const f = $('#mf');
  f.addEventListener('input', () => {
    const q = f.value.trim().toLowerCase(); let n = 0;
    view.querySelectorAll('#mgrid .card').forEach(c => { const ok = !q || c.dataset.search.includes(q); c.hidden = !ok; if (ok) n++; });
    $('#mempty').hidden = n > 0;
  });
  view.querySelectorAll('[data-done]').forEach(cb => cb.addEventListener('change', () => setDone(cb.dataset.done, cb.checked)));
  if (focusId) {
    const card = view.querySelectorAll('#mgrid .card')[focusId - 1];
    if (card) { card.scrollIntoView({block: 'center'}); card.style.outline = '2px solid var(--brand)'; }
  }
}

function renderProjects() {
  view.innerHTML = `
  <div class="section-title"><h2>Projects</h2><span>Three practical jobs, each with spec, prompt and full source</span></div>
  <div class="grid">${DATA.projects.map(projectCard).join('')}</div>`;
}

function renderAssessment() {
  view.innerHTML = `
  <div class="section-title"><h2>Assessment preparation</h2><span>Practical, written and oral</span></div>
  <div class="grid">${DATA.assessment.map(a => `
    <article class="card">
      <h3>${esc(a.title)}</h3>
      <div>${a.tags.map(t => `<span class="badge k">${esc(t)}</span>`).join('')}<span class="badge">${a.pages} page${a.pages > 1 ? 's' : ''}</span></div>
      <p>${esc(a.summary)}</p>
      <div class="actions">
        <button class="btn small" data-doc="${fileUrl(a.file)}" data-title="${esc(a.title)}">📖 Read</button>
        <a class="btn small ghost" href="${fileUrl(a.file)}" download>⬇ PDF</a>
      </div>
    </article>`).join('')}
  </div>
  <div class="notice">Tip: do the three jobs yourself with a timer (1 h, 1 h, 2 h) before you open the solved projects. Then use the oral preparation sheet the day before the assessment.</div>`;
}

/* ---------- project detail ---------- */
function buildTree(entries) {
  const root = {dirs: {}, files: []};
  for (const e of entries) {
    const parts = e.path.split('/'); let node = root;
    for (const d of parts.slice(0, -1)) node = node.dirs[d] ??= {dirs: {}, files: []};
    node.files.push({name: parts[parts.length - 1], ...e});
  }
  return root;
}
function treeHtml(node, slug, current, prefix = '') {
  const dirs = Object.keys(node.dirs).sort().map(d => {
    const p = prefix + d + '/';
    const open = current && current.startsWith(p) ? ' open' : (prefix === '' && d === 'app') ? ' open' : '';
    return `<details${open}><summary>${esc(d)}</summary>${treeHtml(node.dirs[d], slug, current, p)}</details>`;
  }).join('');
  const files = node.files.sort((a, b) => a.name.localeCompare(b.name)).map(f => f.text
    ? `<a class="file${f.path === current ? ' on' : ''}" href="#/projects/${slug}/code/${enc(f.path)}">${esc(f.name)}</a>`
    : `<a class="file bin" href="${projUrl(slug, f.path)}" download title="Binary file (${fmtSize(f.size)})">${esc(f.name)} ⬇</a>`).join('');
  return dirs + files;
}
function defaultFile(entries) {
  const prefer = entries.find(e => /(Product|Welcome|Auth)Activity\.kt$/.test(e.path));
  return (prefer || entries.find(e => e.text)).path;
}

async function showFile(slug, path) {
  const box = $('#viewer'); if (!box) return;
  const url = projUrl(slug, path);
  box.innerHTML = `<div class="viewer-bar"><span class="path-label">${esc(path)}</span></div><p class="empty">Loading…</p>`;
  let text;
  try {
    const r = await fetch(url); if (!r.ok) throw new Error(r.status);
    text = await r.text();
  } catch {
    box.innerHTML = `<div class="empty">Could not load this file. If you opened index.html directly from disk, start a local server instead:<br><code>python3 scripts/build_site.py &amp;&amp; python3 -m http.server -d _site</code></div>`;
    return;
  }
  const isMd = path.endsWith('.md');
  const bar = `<div class="viewer-bar"><span class="path-label">${esc(path)}</span><span class="spacer"></span>
    <button class="btn small" id="cp">Copy</button><a class="btn small ghost" href="${url}" download="${esc(path.split('/').pop())}">Download</a></div>`;
  if (isMd) box.innerHTML = bar + `<div class="md">${marked.parse(text)}</div>`;
  else {
    const lang = langFor(path); let html;
    try { html = hljs.getLanguage(lang) ? hljs.highlight(text, {language: lang}).value : esc(text); } catch { html = esc(text); }
    box.innerHTML = bar + `<pre class="code"><code class="hljs">${html}</code></pre>`;
  }
  $('#cp').addEventListener('click', e => copyText(text, e.currentTarget));
}

async function renderProject(slug, tab, filePath) {
  const p = DATA.projects.find(x => x.slug === slug);
  if (!p) { view.innerHTML = '<p class="empty">Project not found.</p>'; return; }
  tab = tab || 'overview';
  const tabs = [['overview', 'Overview'], ['code', 'Source code'], ['prompt', 'AI prompt'], ['spec', 'Specification']];
  view.innerHTML = `
  <div class="crumbs"><a href="#/projects">Projects</a> › Job ${p.job}</div>
  <h1>${esc(p.title)}</h1>
  <div>${p.stack.map(s => `<span class="badge k">${esc(s)}</span>`).join('')}<span class="badge">⏱ ${esc(p.time)}</span></div>
  <div class="tabs">${tabs.map(([k, l]) => `<button class="${k === tab ? 'on' : ''}" data-tab="${k}">${l}</button>`).join('')}</div>
  <div id="tabbody"></div>`;
  view.querySelectorAll('[data-tab]').forEach(b => b.addEventListener('click', () => {
    location.hash = `#/projects/${slug}` + (b.dataset.tab === 'overview' ? '' : '/' + b.dataset.tab);
  }));
  const body = $('#tabbody');

  if (tab === 'overview') {
    body.innerHTML = `
    <p style="font-size:17px;max-width:820px">${esc(p.summary)}</p>
    ${p.setup ? `<div class="notice"><b>Before you run it:</b> ${esc(p.setup)}</div>` : ''}
    <div class="cta" style="margin:14px 0 6px">
      <a class="btn" href="downloads/${p.slug}.zip">⬇ Download project ZIP</a>
      <a class="btn ghost" href="#/projects/${p.slug}/code">Browse source</a>
      <a class="btn ghost" href="#/projects/${p.slug}/prompt">Read the prompt</a>
    </div>
    <div class="two" style="margin-top:18px">
      <div class="card"><h3>What it does</h3><ul class="tight">${p.features.map(f => `<li>${esc(f)}</li>`).join('')}</ul></div>
      <div class="card"><h3>How to run it</h3><ol class="steps">${p.run.map(s => `<li>${esc(s)}</li>`).join('')}</ol></div>
      <div class="card"><h3>Related modules</h3><ul class="tight">${p.related.map(id => { const m = moduleById(id); return `<li><a href="#/modules/${id}">Module ${id}: ${esc(m.short)}</a></li>`; }).join('')}</ul></div>
    </div>`;
  } else if (tab === 'code') {
    const entries = TREE[slug] || [];
    const current = filePath || defaultFile(entries);
    body.innerHTML = `<div class="code-layout"><nav class="tree" id="tree" aria-label="Project files">${treeHtml(buildTree(entries), slug, current)}</nav><section class="viewer" id="viewer"></section></div>`;
    showFile(slug, current);
  } else if (tab === 'prompt') {
    body.innerHTML = `<div class="notice">This is the prompt used with an Android Studio AI agent to scaffold the job. Replace the placeholders (like &lt;YourRegNo&gt;) with your own details before using it.</div><section class="viewer" id="viewer"></section>`;
    try {
      const raw = await (await fetch(projUrl(slug, 'docs/ai-agent-prompt.md'))).text();
      $('#viewer').innerHTML = `<div class="viewer-bar"><span class="path-label">docs/ai-agent-prompt.md</span><span class="spacer"></span><button class="btn small" id="cp">Copy whole prompt</button></div><div class="md">${marked.parse(raw)}</div>`;
      $('#cp').addEventListener('click', e => copyText(raw, e.currentTarget));
    } catch { $('#viewer').innerHTML = '<p class="empty">Could not load the prompt file.</p>'; }
  } else if (tab === 'spec') {
    const u = projUrl(slug, 'docs/specification.pdf');
    body.innerHTML = `<div class="cta" style="margin-bottom:12px"><a class="btn small" href="${u}" target="_blank" rel="noopener">Open in new tab</a><a class="btn small ghost" href="${u}" download>Download PDF</a></div><iframe class="embed" src="${u}" title="Job ${p.job} specification"></iframe>`;
  }
}

/* ---------- search ---------- */
function buildIndex() {
  const idx = [];
  DATA.modules.forEach(m => idx.push({g: 'Modules', t: `Module ${m.id}: ${m.title}`, s: m.outcomes.join(' · '), h: `#/modules/${m.id}`, k: [m.title, m.code, ...m.outcomes, ...m.keywords].join(' ').toLowerCase()}));
  DATA.projects.forEach(p => idx.push({g: 'Projects', t: `Job ${p.job}: ${p.title}`, s: p.stack.join(' · '), h: `#/projects/${p.slug}`, k: [p.title, p.summary, ...p.stack, ...p.features].join(' ').toLowerCase()}));
  DATA.assessment.forEach(a => idx.push({g: 'Assessment', t: a.title, s: a.summary, h: '#/assessment', k: (a.title + ' ' + a.summary + ' ' + a.tags.join(' ')).toLowerCase()}));
  for (const [slug, entries] of Object.entries(TREE)) {
    const p = DATA.projects.find(x => x.slug === slug);
    entries.filter(e => e.text).forEach(e => idx.push({g: 'Files', t: e.path.split('/').pop(), s: `Job ${p ? p.job : ''} · ${e.path}`, h: `#/projects/${slug}/code/${enc(e.path)}`, k: (slug + ' ' + e.path).toLowerCase()}));
  }
  return idx;
}
let INDEX = [];
const qEl = $('#q'), resEl = $('#results');
qEl.addEventListener('input', () => {
  const q = qEl.value.trim().toLowerCase();
  if (q.length < 2) { resEl.hidden = true; return; }
  const terms = q.split(/\s+/);
  const hits = INDEX.filter(i => terms.every(t => i.k.includes(t))).slice(0, 30);
  if (!hits.length) { resEl.innerHTML = '<p class="empty" style="padding:14px">No results</p>'; resEl.hidden = false; return; }
  let html = '', last = '';
  for (const h of hits) { if (h.g !== last) { html += `<div class="grp">${h.g}</div>`; last = h.g; } html += `<a href="${h.h}">${esc(h.t)}<small>${esc(h.s.length > 90 ? h.s.slice(0, 90) + '…' : h.s)}</small></a>`; }
  resEl.innerHTML = html; resEl.hidden = false;
});
document.addEventListener('click', e => { if (!e.target.closest('.search')) resEl.hidden = true; else if (e.target.closest('.results a')) { resEl.hidden = true; qEl.value = ''; } });
document.addEventListener('keydown', e => { if (e.key === '/' && document.activeElement.tagName !== 'INPUT') { e.preventDefault(); qEl.focus(); } });

/* ---------- router ---------- */
function route() {
  closeDoc();
  const parts = (location.hash.replace(/^#\/?/, '') || 'home').split('/');
  const r = parts[0];
  document.querySelectorAll('#nav a').forEach(a => a.classList.toggle('active', a.dataset.route === r));
  window.scrollTo(0, 0);
  if (r === 'modules') renderModules(parts[1] ? parseInt(parts[1], 10) : 0);
  else if (r === 'projects' && parts[1]) {
    const file = parts.slice(3).map(decodeURIComponent).join('/');
    renderProject(parts[1], parts[2], file || null);
  }
  else if (r === 'projects') renderProjects();
  else if (r === 'assessment') renderAssessment();
  else renderHome();
}

(async function init() {
  try {
    const [c, t] = await Promise.all([fetch('data/content.json'), fetch('data/tree.json')]);
    if (!c.ok || !t.ok) throw new Error('data');
    DATA = await c.json(); TREE = await t.json();
  } catch {
    view.innerHTML = `<div class="notice"><b>Could not load the site data.</b> Browsers block local files opened directly from disk. Build and serve the site instead:<br><code>python3 scripts/build_site.py &amp;&amp; python3 -m http.server -d _site 8000</code><br>then open <code>http://localhost:8000</code>.</div>`;
    return;
  }
  INDEX = buildIndex();
  addEventListener('hashchange', route);
  route();
})();
})();
