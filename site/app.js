/* Android Workbook: vanilla JS, no build step, no external requests. */
(() => {
'use strict';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const enc = p => p.split('/').map(encodeURIComponent).join('/');
const fileUrl = p => 'files/' + enc(p);
const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage unavailable */ } }
};
const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

const SVG = (inner, extra = '') => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${extra}>${inner}</svg>`;
const ICONS = {
  search: SVG('<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>'),
  theme: SVG('<circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor"/>'),
  download: SVG('<path d="M12 4v11"/><path d="m7 11 5 5 5-5"/><path d="M5 20h14"/>'),
  external: SVG('<path d="M14 4h6v6"/><path d="M20 4 10 14"/><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>'),
  copy: SVG('<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h9"/>'),
  read: SVG('<path d="M4 5a2 2 0 0 1 2-2h12v16H6a2 2 0 0 0-2 2z"/><path d="M4 19V5"/>'),
  arrow: SVG('<path d="M5 12h14"/><path d="m13 6 6 6-6 6"/>')
};
const ic = n => `<span class="ic">${ICONS[n] || ''}</span>`;
const fillIcons = (root = document) => $$('.ic[data-ic]', root).forEach(el => { el.innerHTML = ICONS[el.dataset.ic] || ''; el.removeAttribute('data-ic'); });

let DATA = null, TREE = { variants: {}, docs: {} };
const view = $('#view');

/* ---------------- theme ---------------- */
function applyTheme(t) {
  document.documentElement.dataset.theme = t;
  $('#hljs-theme').href = t === 'dark' ? 'vendor/hljs-dark.css' : 'vendor/hljs-light.css';
}
applyTheme(store.get('workbook-theme', matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'));
$('#theme').addEventListener('click', () => {
  const t = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  applyTheme(t); store.set('workbook-theme', t);
});

/* ---------------- data helpers ---------------- */
const progress = () => store.get('workbook-progress', store.get('amad-progress', {}));
function setDone(id, v) { const p = progress(); if (v) p[id] = true; else delete p[id]; store.set('workbook-progress', p); }
const moduleById = id => DATA.modules.find(m => m.id === id);
const jobBySlug = s => DATA.jobs.find(j => j.slug === s);
const statsOf = (slug, vid) => (TREE.variants[`${slug}/${vid}`] || {}).stats || {};
const entriesOf = (slug, vid) => (TREE.variants[`${slug}/${vid}`] || {}).entries || [];
const zipUrl = (slug, vid) => `downloads/${slug}__${vid || 'all-variants'}.zip`;
const projFile = (slug, vid, rel) => fileUrl(`projects/${slug}/${vid}/${rel}`);
const docFile = (slug, rel) => fileUrl(`projects/${slug}/${rel}`);
const hrefJob = (slug, vid, tab, path) => `#/build/${slug}` + (vid ? `/${vid}` : '') + (tab ? `/${tab}` : '') + (path ? `/${enc(path)}` : '');
const totals = () => {
  const stats = Object.values(TREE.variants).map(v => v.stats);
  return {
    modules: DATA.modules.length,
    pages: DATA.modules.reduce((a, m) => a + m.pages, 0),
    jobs: DATA.jobs.length,
    builds: DATA.jobs.reduce((a, j) => a + j.variants.length, 0),
    lines: stats.reduce((a, s) => a + (s.kotlinLines || 0), 0)
  };
};
const langFor = path => {
  const ext = (path.split('.').pop() || '').toLowerCase();
  return ({kt:'kotlin', kts:'kotlin', gradle:'groovy', xml:'xml', json:'json', example:'json', properties:'properties', toml:'ini', md:'markdown', rules:'plaintext'})[ext] || 'plaintext';
};
const fmtSize = n => n < 1024 ? `${n} B` : `${(n / 1024).toFixed(1)} KB`;

async function copyText(text, btn) {
  try { await navigator.clipboard.writeText(text); }
  catch { const ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); } catch { /* ignore */ } ta.remove(); }
  if (btn) { const old = btn.textContent; btn.textContent = 'Copied'; setTimeout(() => { btn.textContent = old; }, 1400); }
}

/* ---------------- document modal ---------------- */
function openDoc(title, url) {
  $('#modal-title').textContent = title;
  $('#modal-frame').src = url;
  $('#modal-open').href = url;
  const dl = $('#modal-dl'); dl.href = url; dl.setAttribute('download', url.split('/').pop());
  $('#modal').hidden = false; document.body.style.overflow = 'hidden';
  $('#modal-close').focus();
}
function closeDoc() { if ($('#modal').hidden) return; $('#modal').hidden = true; $('#modal-frame').src = 'about:blank'; document.body.style.overflow = ''; }
$('#modal-close').addEventListener('click', closeDoc);
$('#modal').addEventListener('click', e => { if (e.target.id === 'modal') closeDoc(); });
document.addEventListener('click', e => {
  const b = e.target.closest('[data-doc]');
  if (b) { e.preventDefault(); openDoc(b.dataset.title, b.dataset.doc); }
});

/* ---------------- pointer effects (tilt, specular light) ---------------- */
let tiltEl = null, raf = 0;
function resetTilt(el) { if (!el) return; el.classList.remove('active'); el.style.removeProperty('--rx'); el.style.removeProperty('--ry'); el.classList.remove('lit'); }
document.addEventListener('pointermove', e => {
  if (!fine || e.pointerType === 'touch') return;
  if (raf) return;
  raf = requestAnimationFrame(() => {
    raf = 0;
    const glass = e.target.closest && e.target.closest('.glass');
    if (glass) {
      const r = glass.getBoundingClientRect();
      glass.style.setProperty('--mx', `${e.clientX - r.left}px`);
      glass.style.setProperty('--my', `${e.clientY - r.top}px`);
    }
    const tilt = !reduce && e.target.closest ? e.target.closest('.tilt') : null;
    if (tiltEl && tiltEl !== tilt) resetTilt(tiltEl);
    tiltEl = tilt;
    if (tilt) {
      const r = tilt.getBoundingClientRect();
      const max = parseFloat(tilt.dataset.tilt || '5');
      const dx = (e.clientX - r.left) / r.width - .5, dy = (e.clientY - r.top) / r.height - .5;
      tilt.classList.add('active', 'lit');
      tilt.style.setProperty('--ry', `${(dx * max * 2).toFixed(2)}deg`);
      tilt.style.setProperty('--rx', `${(-dy * max * 2).toFixed(2)}deg`);
    }
    const st = !reduce && e.target.closest ? e.target.closest('.stack3d') : null;
    $$('.stack3d').forEach(s => {
      if (s === st) {
        const r = s.getBoundingClientRect();
        const dx = (e.clientX - r.left) / r.width - .5, dy = (e.clientY - r.top) / r.height - .5;
        s.classList.add('active');
        s.style.setProperty('--sry', `${(-22 + dx * 30).toFixed(1)}deg`);
        s.style.setProperty('--srx', `${(14 - dy * 22).toFixed(1)}deg`);
      } else if (s.classList.contains('active')) {
        s.classList.remove('active'); s.style.removeProperty('--sry'); s.style.removeProperty('--srx');
      }
    });
  });
}, { passive: true });
document.addEventListener('pointerleave', () => { resetTilt(tiltEl); tiltEl = null; $$('.stack3d.active').forEach(s => s.classList.remove('active')); });

/* ---------------- reveal, count-up, pills ---------------- */
let io = null;
function setupReveal() {
  const items = $$('.reveal:not(.in)', view);
  if (reduce || !('IntersectionObserver' in window)) { items.forEach(i => i.classList.add('in')); return; }
  io && io.disconnect();
  io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } }), { rootMargin: '0px 0px -4% 0px', threshold: 0 });
  items.forEach((el, i) => { el.style.setProperty('--d', `${Math.min(i % 12, 8) * 55}ms`); io.observe(el); });
  // safety net: anything already on screen is revealed on the next frame
  requestAnimationFrame(() => items.forEach(el => { if (el.getBoundingClientRect().top < innerHeight) el.classList.add('in'); }));
}
function countUp() {
  $$('[data-count]', view).forEach(el => {
    const target = parseInt(el.dataset.count, 10);
    if (reduce) { el.textContent = target.toLocaleString(); return; }
    const t0 = performance.now(), dur = 1000;
    const tick = t => { const k = Math.min(1, (t - t0) / dur); el.textContent = Math.round(target * (1 - Math.pow(1 - k, 3))).toLocaleString(); if (k < 1) requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  });
}
function placePill(container, pill, active) {
  if (!container || !pill) return;
  if (!active) { pill.style.width = '0px'; return; }
  pill.style.width = `${active.offsetWidth}px`;
  pill.style.transform = `translateX(${active.offsetLeft}px)`;
}
function placeAllPills() {
  placePill($('#nav'), $('#nav-pill'), $('#nav a.active'));
  $$('.seg', view).forEach(s => placePill(s, $('.thumb', s), $('button.on', s)));
}
addEventListener('resize', () => requestAnimationFrame(placeAllPills));
if (document.fonts && document.fonts.ready) document.fonts.ready.then(placeAllPills);

function afterRender() {
  fillIcons(view);
  setupReveal();
  countUp();
  placeAllPills();
}

/* ---------------- shared fragments ---------------- */
const chips = (arr, on) => arr.map(a => `<span class="chip${on ? ' on' : ''}">${esc(a)}</span>`).join('');
function pageHead(title, desc, crumbs) {
  return `<div class="reveal">${crumbs ? `<div class="crumbs">${crumbs}</div>` : ''}<h1 class="page-title">${esc(title)}</h1><p class="muted" style="max-width:68ch">${esc(desc)}</p></div>`;
}
function ringSvg(done, total) {
  const p = total ? done / total : 0;
  return `<svg class="ring" viewBox="0 0 100 100" style="--p:${p.toFixed(3)}" role="img" aria-label="${done} of ${total} modules completed">
    <defs><linearGradient id="rg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="var(--accent)"/><stop offset="1" stop-color="var(--accent-2)"/></linearGradient></defs>
    <circle class="tr" cx="50" cy="50" r="42"/><circle class="fg" cx="50" cy="50" r="42"/><text x="50" y="50">${done}/${total}</text></svg>`;
}
function progressCard() {
  const mods = DATA.modules, done = mods.filter(m => progress()[m.id]).length;
  const next = mods.find(m => !progress()[m.id]);
  return `<div class="glass progress-card reveal">${ringSvg(done, mods.length)}
    <div><h3>${done === mods.length ? 'All modules completed' : 'Your progress'}</h3>
    <p class="muted" style="margin:0 0 .7rem">${done} of ${mods.length} modules marked complete. Saved only in this browser.</p>
    ${next ? `<a class="btn sm" href="#/study/${next.id}">Continue with module ${next.id}</a>` : `<a class="btn sm ghost" href="#/build">Explore the builds</a>`}</div></div>`;
}
function moduleCard(m) {
  const jobs = DATA.jobs.filter(j => j.related.includes(m.id));
  return `<article class="card glass tilt reveal" data-tilt="4" id="mod-${m.id}" data-search="${esc((m.title + ' ' + m.code + ' ' + m.outcomes.join(' ') + ' ' + m.keywords.join(' ')).toLowerCase())}">
    <h3><span class="num">${m.id}</span>${esc(m.title)}</h3>
    <div><span class="chip mono">${esc(m.code)}</span><span class="chip">${m.pages} pages</span></div>
    <ul class="tight">${m.outcomes.map(o => `<li>${esc(o)}</li>`).join('')}</ul>
    ${jobs.length ? `<p>Practised in ${jobs.map(j => `<a href="${hrefJob(j.slug)}">Job ${j.job}</a>`).join(', ')}</p>` : ''}
    <label class="switch"><input type="checkbox" data-done="${m.id}" ${progress()[m.id] ? 'checked' : ''}><i></i><span>Mark as completed</span></label>
    <div class="actions">
      <button class="btn sm" type="button" data-doc="${fileUrl(m.file)}" data-title="Module ${m.id}: ${esc(m.short)}">${ic('read')} Read</button>
      <a class="btn sm ghost" href="${fileUrl(m.file)}" download>${ic('download')} PDF</a>
    </div></article>`;
}
function jobCard(j) {
  return `<a class="card glass tilt link reveal" data-tilt="5" href="${hrefJob(j.slug)}">
    <span class="eyebrow" style="margin:0">Job ${j.job} &middot; ${esc(j.time)}</span>
    <h3 style="font-size:1.3rem">${esc(j.title)}</h3>
    <p class="muted" style="margin-top:-.3rem">${esc(j.subtitle)}</p>
    <p>${esc(j.summary)}</p>
    <div>${chips(j.stack.slice(0, 5))}</div>
    <div class="actions"><span class="chip on">${j.variants.length} implementations</span>${j.variants.map(v => `<span class="chip">${esc(v.label)}</span>`).join('')}</div>
  </a>`;
}

/* ---------------- views ---------------- */
function viewHome() {
  const t = totals(), s = DATA.site;
  const mods = DATA.modules;
  view.innerHTML = `
  <section class="hero glass tilt reveal" data-tilt="1.6">
    <div>
      <span class="eyebrow">${esc(DATA.course.title)} &middot; ${esc(DATA.course.level)}</span>
      <h1>Android <span>Workbook</span></h1>
      <p class="tag">${esc(s.tagline)}</p>
      <p class="lede">${esc(s.intro)}</p>
      <div class="row"><a class="btn" href="#/study">Start studying ${ic('arrow')}</a><a class="btn ghost" href="#/build">Browse the builds</a></div>
    </div>
    <div class="stack3d" aria-hidden="true"><div class="stack3d-in">
      <div class="layer glass l1"><b>${t.modules}</b><span>Course modules</span></div>
      <div class="layer glass l2"><b>${t.jobs}</b><span>Practical jobs</span></div>
      <div class="layer glass l3"><b>${t.builds}</b><span>Working implementations</span></div>
    </div></div>
  </section>

  <div class="stats">
    <div class="stat glass reveal"><b data-count="${t.pages}">0</b><span>Pages of learning material</span></div>
    <div class="stat glass reveal"><b data-count="${t.lines}">0</b><span>Lines of Kotlin to read</span></div>
    <div class="stat glass reveal"><b data-count="${DATA.assessment.length}">0</b><span>Assessment documents</span></div>
    <div class="stat glass reveal"><b data-count="${t.builds}">0</b><span>Builds you can download</span></div>
  </div>

  <section class="sec">
    <div class="sec-head reveal"><h2>Two ways to use this</h2><p>Pick the path that matches what you need today.</p></div>
    <div class="grid two">
      <a class="card glass tilt link reveal" data-tilt="4" href="#/study"><span class="eyebrow" style="margin:0">For learners</span><h3 style="font-size:1.3rem">Study the course</h3>
        <p>Seven modules with their learning outcomes, a suggested order, and a progress tracker. Then practise with the solved assessment bank and the bilingual oral preparation.</p>
        <div class="actions"><span class="chip on">${t.modules} modules</span><span class="chip">${DATA.assessment.length} practice documents</span></div></a>
      <a class="card glass tilt link reveal" data-tilt="4" href="#/course"><span class="eyebrow" style="margin:0">The course record</span><h3 style="font-size:1.3rem">See what was built</h3>
        <p>The three practical jobs, each implemented several ways, with the specification, the prompt and the complete source. Every skill links to the code that proves it.</p>
        <div class="actions"><span class="chip on">${t.builds} implementations</span><span class="chip">${t.lines.toLocaleString()} lines of Kotlin</span></div></a>
    </div>
  </section>

  <section class="sec">
    <div class="sec-head reveal"><h2>Suggested path</h2><p>Follow the modules in order, or jump to any step.</p></div>
    <div class="path reveal">${DATA.learningPath.map(p => `<a href="#/study/${p.module}" class="${progress()[p.module] ? 'done' : ''}"><span class="num">${p.module}</span>${esc(p.step)}</a>`).join('')}</div>
    <div style="margin-top:1.2rem">${progressCard()}</div>
  </section>

  <section class="sec">
    <div class="sec-head reveal"><h2>The practical jobs</h2><p>One specification, several ways to solve it.</p><span class="spacer"></span><a href="#/build">All builds</a></div>
    <div class="grid">${DATA.jobs.map(jobCard).join('')}</div>
  </section>`;
  afterRender();
}

function viewStudy(focusId) {
  view.innerHTML = `
  ${pageHead('Study', `${DATA.modules.length} competency based modules, ${totals().pages} pages. Read in order, tick each one off as you finish, and use the filter to find a topic.`)}
  <div class="bar reveal">${''}<input id="mf" class="field" type="search" placeholder="Filter by topic, for example sqlite, retrofit or inheritance" aria-label="Filter modules"></div>
  <div style="margin-bottom:1.1rem">${progressCard()}</div>
  <div class="grid" id="mgrid">${DATA.modules.map(moduleCard).join('')}</div>
  <p class="empty" id="mempty" hidden>No module matches that filter.</p>`;
  const f = $('#mf');
  f.addEventListener('input', () => {
    const q = f.value.trim().toLowerCase(); let n = 0;
    $$('#mgrid .card').forEach(c => { const ok = !q || c.dataset.search.includes(q); c.hidden = !ok; if (ok) n++; });
    $('#mempty').hidden = n > 0;
  });
  $$('[data-done]').forEach(cb => cb.addEventListener('change', () => {
    setDone(cb.dataset.done, cb.checked);
    const pc = $('.progress-card', view); if (pc) pc.parentElement.innerHTML = progressCard().replace('reveal', 'reveal in');
  }));
  afterRender();
  if (focusId) { const c = $(`#mod-${focusId}`); if (c) { c.scrollIntoView({ block: 'center', behavior: reduce ? 'auto' : 'smooth' }); c.classList.add('lit'); setTimeout(() => c.classList.remove('lit'), 1800); } }
}

function viewPractice() {
  view.innerHTML = `
  ${pageHead('Practice', 'Written, oral and practical preparation. Use these after each module and again before the assessment.')}
  <div class="grid" style="margin-top:1.4rem">${DATA.assessment.map(a => `
    <article class="card glass tilt reveal" data-tilt="4">
      <h3>${esc(a.title)}</h3>
      <div>${chips(a.tags, true)}<span class="chip">${a.pages} page${a.pages > 1 ? 's' : ''}</span></div>
      <p>${esc(a.summary)}</p>
      <div class="actions">
        <button class="btn sm" type="button" data-doc="${fileUrl(a.file)}" data-title="${esc(a.title)}">${ic('read')} Read</button>
        <a class="btn sm ghost" href="${fileUrl(a.file)}" download>${ic('download')} PDF</a>
      </div></article>`).join('')}</div>
  <section class="sec">
    <div class="sec-head reveal"><h2>A routine that works</h2></div>
    <div class="glass panel reveal"><ol class="steps">
      <li>Read one module and tick it off on the Study page.</li>
      <li>Attempt the matching practical job yourself against the clock: 1 hour, 1 hour and 2 hours.</li>
      <li>Compare your result with the implementations on the <a href="#/build">Build</a> page and note what you would change.</li>
      <li>Revise with the solved bank, then say the oral answers aloud in your own words.</li>
    </ol></div>
  </section>`;
  afterRender();
}

function variantRows(job) {
  return job.variants.map(v => {
    const st = statsOf(job.slug, v.id);
    return `<tr><td>Job ${job.job}</td><td><a href="${hrefJob(job.slug, v.id)}"><strong>${esc(v.label)}</strong></a></td>
      <td class="wrap">${chips(v.approach.slice(0, 3))}</td><td>${st.kotlinFiles ?? '-'}</td><td>${st.kotlinLines ?? '-'}</td><td>${esc(st.gradle || '-')}</td>
      <td><a href="${zipUrl(job.slug, v.id)}" download>ZIP</a></td></tr>`;
  }).join('');
}
function compareTable(jobs) {
  return `<div class="glass table-wrap reveal"><table class="t"><thead><tr><th>Job</th><th>Build</th><th>Approach</th><th>Kotlin files</th><th>Lines</th><th>Gradle</th><th>Download</th></tr></thead><tbody>${jobs.map(variantRows).join('')}</tbody></table></div>`;
}

function viewBuild() {
  const t = totals();
  view.innerHTML = `
  ${pageHead('Build', `${t.jobs} practical jobs, ${t.builds} complete implementations. Each build is a full Android Studio project you can open, run and compare.`)}
  <div class="grid" style="margin-top:1.4rem">${DATA.jobs.map(jobCard).join('')}</div>
  <section class="sec"><div class="sec-head reveal"><h2>Every build at a glance</h2><p>File and line counts are measured from the code.</p></div>${compareTable(DATA.jobs)}</section>`;
  afterRender();
}

/* ----- job detail ----- */
function buildTree(entries) {
  const root = { dirs: {}, files: [] };
  for (const e of entries) {
    const parts = e.path.split('/'); let node = root;
    for (const d of parts.slice(0, -1)) node = node.dirs[d] ??= { dirs: {}, files: [] };
    node.files.push({ name: parts[parts.length - 1], ...e });
  }
  return root;
}
function treeHtml(node, slug, vid, current, prefix = '') {
  const dirs = Object.keys(node.dirs).sort().map(d => {
    let name = d, n = node.dirs[d], p = prefix + d + '/';
    // merge single-child folder chains (com/example/app) like an IDE does
    while (!n.files.length && Object.keys(n.dirs).length === 1) { const k = Object.keys(n.dirs)[0]; name += '/' + k; n = n.dirs[k]; p += k + '/'; }
    const open = current && current.startsWith(p) ? ' open' : (prefix === '' && d === 'app') ? ' open' : '';
    return `<details${open}><summary>${esc(name)}</summary>${treeHtml(n, slug, vid, current, p)}</details>`;
  }).join('');
  const files = node.files.sort((a, b) => a.name.localeCompare(b.name)).map(f => f.text
    ? `<a class="file${f.path === current ? ' on' : ''}" href="${hrefJob(slug, vid, 'code', f.path)}">${esc(f.name)}</a>`
    : `<a class="file bin" href="${projFile(slug, vid, f.path)}" download title="Binary file, ${fmtSize(f.size)}">${esc(f.name)}</a>`).join('');
  return dirs + files;
}
function defaultFile(entries) {
  const pref = entries.find(e => /(Product|Welcome|Auth|Main)Activity\.kt$/.test(e.path)) || entries.find(e => e.text && e.path.endsWith('.kt')) || entries.find(e => e.text);
  return pref ? pref.path : '';
}
async function showFile(slug, vid, path) {
  const box = $('#viewer'); if (!box) return;
  const url = projFile(slug, vid, path);
  box.innerHTML = `<div class="viewer-bar"><span class="path-label">${esc(path)}</span></div><p class="empty">Loading</p>`;
  let text;
  try { const r = await fetch(url); if (!r.ok) throw new Error(r.status); text = await r.text(); }
  catch { box.innerHTML = `<div class="empty">Could not load this file. If you opened index.html straight from disk, serve the built site instead:<br><code>python3 scripts/build_site.py &amp;&amp; python3 -m http.server -d _site</code></div>`; return; }
  const bar = `<div class="viewer-bar"><span class="path-label">${esc(path)}</span><span class="spacer"></span><button class="btn sm" id="cp" type="button">${ic('copy')} Copy</button><a class="btn sm ghost" href="${url}" download="${esc(path.split('/').pop())}">${ic('download')} Download</a></div>`;
  if (path.endsWith('.md')) box.innerHTML = bar + `<div class="md">${marked.parse(text)}</div>`;
  else {
    const lang = langFor(path); let html;
    try { html = hljs.getLanguage(lang) ? hljs.highlight(text, { language: lang }).value : esc(text); } catch { html = esc(text); }
    box.innerHTML = bar + `<pre class="code"><code class="hljs">${html}</code></pre>`;
  }
  fillIcons(box);
  $('#cp').addEventListener('click', e => copyText(text, e.currentTarget));
}

async function viewJob(slug, vid, tab, filePath) {
  const job = jobBySlug(slug);
  if (!job) { view.innerHTML = '<p class="empty">That job was not found.</p>'; return; }
  const variant = job.variants.find(v => v.id === vid) || job.variants[0];
  vid = variant.id; tab = tab || 'overview';
  const tabs = [['overview', 'Overview'], ['code', 'Source code'], ['prompt', 'AI prompt'], ['spec', 'Specification']];
  view.innerHTML = `
  <div class="reveal in"><div class="crumbs"><a href="#/build">Build</a> / Job ${job.job}</div>
  <h1 class="page-title">${esc(job.title)}</h1>
  <p class="muted" style="margin-bottom:.8rem">${esc(job.subtitle)} &middot; ${esc(job.time)}</p>
  <div>${chips(job.stack, true)}</div></div>
  <div class="bar"><span class="muted" style="font-size:.85rem">Implementation</span>
    <div class="seg" role="tablist" aria-label="Implementations"><span class="thumb"></span>${job.variants.map(v => `<button type="button" role="tab" class="${v.id === vid ? 'on' : ''}" data-v="${v.id}">${esc(v.label)}</button>`).join('')}</div></div>
  <div class="tabs" role="tablist">${tabs.map(([k, l]) => `<button type="button" role="tab" class="${k === tab ? 'on' : ''}" data-tab="${k}">${l}</button>`).join('')}</div>
  <div id="tabbody"></div>`;
  $$('[data-v]').forEach(b => b.addEventListener('click', () => { location.hash = hrefJob(slug, b.dataset.v, tab === 'overview' ? '' : tab, tab === 'code' ? '' : ''); }));
  $$('[data-tab]').forEach(b => b.addEventListener('click', () => { location.hash = hrefJob(slug, vid, b.dataset.tab === 'overview' ? '' : b.dataset.tab); }));
  const body = $('#tabbody');
  const st = statsOf(slug, vid);

  if (tab === 'overview') {
    body.innerHTML = `
    <p style="font-size:1.08rem;max-width:72ch">${esc(job.summary)}</p>
    ${job.setup ? `<div class="notice"><strong>Before you run it.</strong> ${esc(job.setup)}</div>` : ''}
    <div class="split">
      <div class="glass panel reveal">
        <span class="eyebrow" style="margin-bottom:.4rem">Selected implementation</span>
        <h3 style="font-size:1.35rem">${esc(variant.title)}</h3>
        <p class="muted">${esc(variant.summary)}</p>
        <div>${chips(variant.approach, true)}</div>
        <ul class="tight">${variant.highlights.map(h => `<li>${esc(h)}</li>`).join('')}</ul>
        <p class="muted" style="margin-top:.6rem">Read this if ${esc(variant.readIf)}</p>
        <div class="kv"><div><b>${st.kotlinFiles ?? '-'}</b><span>Kotlin files</span></div><div><b>${st.kotlinLines ?? '-'}</b><span>Lines of Kotlin</span></div><div><b style="font-size:1rem;padding-top:.2rem">${esc(st.gradle || '-')}</b><span>Gradle</span></div></div>
        <div class="row" style="margin-top:1rem"><a class="btn" href="${zipUrl(slug, vid)}" download>${ic('download')} Download this build</a><a class="btn ghost" href="${hrefJob(slug, vid, 'code')}">Browse source</a></div>
      </div>
      <div class="glass panel reveal">
        <h3>What the job asks for</h3>
        <ul class="tight">${job.requirements.map(r => `<li>${esc(r)}</li>`).join('')}</ul>
        ${job.api ? `<p style="margin-top:.6rem"><span class="muted">API:</span> <code>${esc(job.api)}</code></p>` : ''}
        <h3 style="margin-top:1.1rem">How to run it</h3>
        <ol class="steps">${job.run.map(s => `<li>${esc(s)}</li>`).join('')}</ol>
        <h3 style="margin-top:1.1rem">Related modules</h3>
        <div>${job.related.map(id => `<a class="chip on" href="#/study/${id}">Module ${id}: ${esc(moduleById(id).short)}</a>`).join('')}</div>
      </div>
    </div>
    <section class="sec"><div class="sec-head reveal"><h2>Compare the ${job.variants.length} implementations</h2><span class="spacer"></span><a href="${zipUrl(slug)}" download>Download all as one ZIP</a></div>${compareTable([job])}</section>`;
  } else if (tab === 'code') {
    const entries = entriesOf(slug, vid);
    const current = filePath || defaultFile(entries);
    body.innerHTML = `<div class="code-layout"><nav class="tree glass" aria-label="Project files">${treeHtml(buildTree(entries), slug, vid, current)}</nav><section class="viewer glass" id="viewer"></section></div>`;
    showFile(slug, vid, current);
  } else if (tab === 'prompt') {
    body.innerHTML = `<div class="notice">This is the prompt used with an Android Studio AI agent to scaffold the job. Replace any placeholders with your own details before using it.</div><section class="viewer glass" id="viewer"></section>`;
    try {
      const raw = await (await fetch(docFile(slug, 'docs/ai-agent-prompt.md'))).text();
      $('#viewer').innerHTML = `<div class="viewer-bar"><span class="path-label">docs/ai-agent-prompt.md</span><span class="spacer"></span><button class="btn sm" id="cp" type="button">${ic('copy')} Copy whole prompt</button></div><div class="md">${marked.parse(raw)}</div>`;
      fillIcons($('#viewer'));
      $('#cp').addEventListener('click', e => copyText(raw, e.currentTarget));
    } catch { $('#viewer').innerHTML = '<p class="empty">Could not load the prompt file.</p>'; }
  } else if (tab === 'spec') {
    const pdf = docFile(slug, 'docs/specification.pdf');
    const pages = (TREE.docs[slug] || []).filter(e => e.path.startsWith('docs/spec-pages/')).sort((a, b) => a.path.localeCompare(b.path));
    body.innerHTML = `<div class="row" style="margin-bottom:1rem"><button class="btn sm" type="button" data-doc="${pdf}" data-title="Job ${job.job} specification">${ic('read')} Open PDF</button><a class="btn sm ghost" href="${pdf}" download>${ic('download')} Download PDF</a></div>
      ${pages.length ? `<div class="spec-pages">${pages.map((p, i) => `<img loading="lazy" src="${docFile(slug, p.path)}" alt="Job ${job.job} specification, page ${i + 1}">`).join('')}</div>` : `<p class="empty">Open the PDF to read the specification.</p>`}`;
  }
  afterRender();
}

function viewCourse() {
  const c = DATA.course, a = DATA.author, t = totals();
  const skillRows = DATA.skills.map(s => `<tr><td><strong>${esc(s.skill)}</strong></td><td class="wrap">${esc(s.detail)}</td><td class="wrap">${s.refs.map(r => {
    const [js, vs] = r.split('/'); const j = jobBySlug(js); const v = j && j.variants.find(x => x.id === vs);
    return j && v ? `<a class="chip on" href="${hrefJob(js, vs)}">Job ${j.job}: ${esc(v.label)}</a>` : '';
  }).join('')}</td></tr>`).join('');
  view.innerHTML = `
  ${pageHead('The course', `${c.title}, ${c.level}. What it covers, how it is assessed, and the work completed during it.`)}
  <div class="split" style="margin-top:1.4rem">
    <div class="glass panel reveal">
      <span class="eyebrow">About the course</span>
      <div class="kv" style="grid-template-columns:1fr"><div><b style="font-size:1.05rem">${esc(c.title)}</b><span>${esc(c.level)}</span></div><div><b style="font-size:1.05rem">${esc(c.provider)}</b><span>Provider</span></div><div><b style="font-size:1.05rem">${esc(c.framework)}</b><span>Learning material</span></div></div>
      <h3 style="margin-top:1rem">How it is assessed</h3>
      <ul class="tight">${c.assessedBy.map(x => `<li>${esc(x)}</li>`).join('')}</ul>
      <div class="row" style="margin-top:1rem"><a class="btn ghost" href="${esc(c.courseUrl)}" target="_blank" rel="noopener">Official course page ${ic('external')}</a></div>
    </div>
    <div class="glass panel reveal">
      <span class="eyebrow">Course record</span>
      <h3 style="font-size:1.35rem">Completed by ${esc(a.name)}</h3>
      <p class="muted">This workbook is the record of that work: the material studied, the assessment preparation, and every practical job built and rebuilt in different ways.</p>
      <div class="kv"><div><b>${t.modules}</b><span>Modules studied</span></div><div><b>${t.jobs}</b><span>Practical jobs</span></div><div><b>${t.builds}</b><span>Implementations</span></div><div><b>${t.lines.toLocaleString()}</b><span>Lines of Kotlin</span></div></div>
      <div class="row" style="margin-top:1rem"><a class="btn" href="${esc(a.github)}" target="_blank" rel="noopener">GitHub profile ${ic('external')}</a><a class="btn ghost" href="${esc(a.repo)}" target="_blank" rel="noopener">Repository ${ic('external')}</a></div>
    </div>
  </div>
  <section class="sec"><div class="sec-head reveal"><h2>Skills, with the code to prove them</h2><p>Each skill links to a build where you can read it in practice.</p></div>
    <div class="glass table-wrap reveal"><table class="t"><thead><tr><th>Skill</th><th>What it covers</th><th>See it in</th></tr></thead><tbody>${skillRows}</tbody></table></div></section>
  <section class="sec"><div class="sec-head reveal"><h2>Learning outcomes by module</h2></div>
    <div class="grid two">${DATA.modules.map(m => `<details class="glass panel reveal" style="padding:1rem 1.3rem"><summary style="cursor:pointer;font-weight:600">Module ${m.id}: ${esc(m.short)}</summary><ul class="tight" style="margin-top:.7rem">${m.outcomes.map(o => `<li>${esc(o)}</li>`).join('')}</ul><a href="#/study/${m.id}">Open module</a></details>`).join('')}</div></section>`;
  afterRender();
}

/* ---------------- search palette ---------------- */
let INDEX = [];
function buildIndex() {
  const idx = [];
  DATA.modules.forEach(m => idx.push({ g: 'Modules', t: `Module ${m.id}: ${m.title}`, s: m.outcomes.join(', '), h: `#/study/${m.id}`, k: [m.title, m.code, ...m.outcomes, ...m.keywords].join(' ').toLowerCase() }));
  DATA.assessment.forEach(x => idx.push({ g: 'Practice', t: x.title, s: x.summary, h: '#/practice', k: (x.title + ' ' + x.summary + ' ' + x.tags.join(' ')).toLowerCase() }));
  DATA.jobs.forEach(j => {
    idx.push({ g: 'Builds', t: `Job ${j.job}: ${j.title}`, s: j.summary, h: hrefJob(j.slug), k: [j.title, j.subtitle, j.summary, ...j.stack, ...j.requirements].join(' ').toLowerCase() });
    j.variants.forEach(v => idx.push({ g: 'Builds', t: `Job ${j.job}, ${v.label}: ${v.title}`, s: v.summary, h: hrefJob(j.slug, v.id), k: [j.title, v.label, v.title, v.summary, ...v.approach, ...v.highlights].join(' ').toLowerCase() }));
  });
  DATA.skills.forEach(s => idx.push({ g: 'Skills', t: s.skill, s: s.detail, h: '#/course', k: (s.skill + ' ' + s.detail).toLowerCase() }));
  for (const [key, val] of Object.entries(TREE.variants)) {
    const [slug, vid] = key.split('/'); const j = jobBySlug(slug); const v = j && j.variants.find(x => x.id === vid);
    val.entries.filter(e => e.text).forEach(e => idx.push({ g: 'Files', t: e.path.split('/').pop(), s: `Job ${j ? j.job : ''}, ${v ? v.label : vid}: ${e.path}`, h: hrefJob(slug, vid, 'code', e.path), k: `${slug} ${vid} ${v ? v.label : ''} ${e.path}`.toLowerCase() }));
  }
  return idx;
}
const pal = $('#palette'), qEl = $('#q'), resEl = $('#results');
let sel = 0, hits = [];
function openPalette() { pal.hidden = false; qEl.value = ''; renderResults(); qEl.focus(); document.body.style.overflow = 'hidden'; }
function closePalette() { if (pal.hidden) return; pal.hidden = true; document.body.style.overflow = ''; }
function renderResults() {
  const q = qEl.value.trim().toLowerCase();
  if (q.length < 2) { hits = []; resEl.innerHTML = `<p class="empty" style="padding:1.2rem">Type at least two letters. Try retrofit, firestore, oral or MainActivity.</p>`; return; }
  const terms = q.split(/\s+/);
  hits = INDEX.filter(i => terms.every(t => i.k.includes(t))).slice(0, 40);
  sel = 0;
  if (!hits.length) { resEl.innerHTML = '<p class="empty" style="padding:1.2rem">No results</p>'; return; }
  let html = '', last = '';
  hits.forEach((h, i) => { if (h.g !== last) { html += `<div class="grp">${h.g}</div>`; last = h.g; } html += `<a href="${h.h}" role="option" data-i="${i}" class="${i === 0 ? 'sel' : ''}">${esc(h.t)}<small>${esc(h.s)}</small></a>`; });
  resEl.innerHTML = html;
}
function moveSel(d) {
  if (!hits.length) return;
  sel = (sel + d + hits.length) % hits.length;
  $$('#results a').forEach(a => a.classList.toggle('sel', +a.dataset.i === sel));
  const el = $(`#results a[data-i="${sel}"]`); if (el) el.scrollIntoView({ block: 'nearest' });
}
$('#open-search').addEventListener('click', openPalette);
qEl.addEventListener('input', renderResults);
qEl.addEventListener('keydown', e => {
  if (e.key === 'ArrowDown') { e.preventDefault(); moveSel(1); }
  else if (e.key === 'ArrowUp') { e.preventDefault(); moveSel(-1); }
  else if (e.key === 'Enter' && hits[sel]) { e.preventDefault(); location.hash = hits[sel].h; closePalette(); }
});
pal.addEventListener('click', e => { if (e.target === pal || e.target.closest('#results a')) closePalette(); });
document.addEventListener('keydown', e => {
  const typing = /^(INPUT|TEXTAREA)$/.test(document.activeElement.tagName);
  if (e.key === 'Escape') { closePalette(); closeDoc(); }
  else if ((e.key === '/' && !typing) || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k')) { e.preventDefault(); openPalette(); }
});

/* ---------------- router ---------------- */
function route() {
  closeDoc(); closePalette();
  const parts = (location.hash.replace(/^#\/?/, '') || 'home').split('/');
  const r = parts[0];
  $$('#nav a').forEach(a => { const on = a.dataset.route === r || (r === 'build' && a.dataset.route === 'build'); a.classList.toggle('active', on); if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
  window.scrollTo(0, 0);
  if (r === 'study') viewStudy(parts[1] ? parseInt(parts[1], 10) : 0);
  else if (r === 'practice') viewPractice();
  else if (r === 'course') viewCourse();
  else if (r === 'build' && parts[1]) viewJob(parts[1], parts[2], parts[3], parts.slice(4).map(decodeURIComponent).join('/') || null);
  else if (r === 'build') viewBuild();
  else viewHome();
  view.focus({ preventScroll: true });
}

(async function init() {
  fillIcons(document);
  try {
    const [c, t] = await Promise.all([fetch('data/content.json'), fetch('data/tree.json')]);
    if (!c.ok || !t.ok) throw new Error('data');
    DATA = await c.json(); TREE = await t.json();
  } catch {
    view.innerHTML = `<div class="notice"><strong>Could not load the site data.</strong> Browsers block files opened straight from disk. Build and serve the site instead:<br><code>python3 scripts/build_site.py &amp;&amp; python3 -m http.server -d _site 8000</code><br>then open <code>http://localhost:8000</code>.</div>`;
    return;
  }
  INDEX = buildIndex();
  addEventListener('hashchange', route);
  route();
})();
})();
