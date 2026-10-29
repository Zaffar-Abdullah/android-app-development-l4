import React, { useState, useEffect, useMemo, useRef } from 'react';
import { HUB_DATA } from './data/content';
import { TREE_DATA } from './data/tree';
import { PROJECT_FILES } from './data/files';
import { SearchHit, TreeEntry, TreeNode } from './types';
import hljs from 'highlight.js';
import { marked } from 'marked';
import { LiquidChromeToggle } from './components/LiquidChromeToggle';

// Helper for local storage
const getStorage = <T,>(key: string, def: T): T => {
  try {
    const v = localStorage.getItem(key);
    return v === null ? def : JSON.parse(v);
  } catch {
    return def;
  }
};

const setStorage = <T,>(key: string, val: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch {
    // ignore
  }
};

// URL and file helpers
const enc = (p: string) => p.split('/').map(encodeURIComponent).join('/');
const fileUrl = (p: string) => '/files/' + enc(p);
const projUrl = (slug: string, rel: string) => fileUrl(`projects/${slug}/${rel}`);

const langFor = (path: string): string => {
  const ext = (path.split('.').pop() || '').toLowerCase();
  const map: Record<string, string> = {
    kt: 'kotlin',
    kts: 'kotlin',
    xml: 'xml',
    json: 'json',
    example: 'json',
    properties: 'properties',
    toml: 'ini',
    md: 'markdown',
    pro: 'plaintext',
    keep: 'plaintext',
    txt: 'plaintext',
  };
  return map[ext] || 'plaintext';
};

const fmtSize = (n: number) => (n < 1024 ? n + ' B' : (n / 1024).toFixed(1) + ' KB');

function buildTree(entries: TreeEntry[]): TreeNode {
  const root: TreeNode = { dirs: {}, files: [] };
  for (const e of entries) {
    const parts = e.path.split('/');
    let node = root;
    for (const d of parts.slice(0, -1)) {
      if (!node.dirs[d]) {
        node.dirs[d] = { dirs: {}, files: [] };
      }
      node = node.dirs[d];
    }
    node.files.push({ name: parts[parts.length - 1], ...e });
  }
  return root;
}

export function App() {
  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return getStorage<'light' | 'dark'>(
      'amad-theme',
      window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    );
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    setStorage('amad-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Progress state
  const [progress, setProgress] = useState<Record<number, boolean>>(() => {
    return getStorage<Record<number, boolean>>('amad-progress', {});
  });

  const toggleModuleDone = (id: number) => {
    setProgress(prev => {
      const next = { ...prev };
      if (next[id]) delete next[id];
      else next[id] = true;
      setStorage('amad-progress', next);
      return next;
    });
  };

  // Routing state based on window.location.hash
  const [route, setRoute] = useState<{
    page: string;
    arg1?: string;
    arg2?: string;
    arg3?: string;
  }>({ page: 'home' });

  useEffect(() => {
    const handleHash = () => {
      const parts = (window.location.hash.replace(/^#\/?/, '') || 'home').split('/');
      setRoute({
        page: parts[0] || 'home',
        arg1: parts[1],
        arg2: parts[2],
        arg3: parts.slice(3).map(decodeURIComponent).join('/') || undefined,
      });
      window.scrollTo(0, 0);
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const navigate = (hash: string) => {
    window.location.hash = hash;
  };

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Modal document state
  const [modalDoc, setModalDoc] = useState<{ title: string; url: string } | null>(null);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (modalDoc) setModalDoc(null);
        if (searchOpen) setSearchOpen(false);
      }
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [modalDoc, searchOpen]);

  // Build search index
  const searchIndex = useMemo<SearchHit[]>(() => {
    const idx: SearchHit[] = [];
    HUB_DATA.modules.forEach(m => {
      idx.push({
        g: 'Modules',
        t: `Module ${m.id}: ${m.title}`,
        s: m.outcomes.join(' · '),
        h: `#/modules/${m.id}`,
        k: [m.title, m.code, ...m.outcomes, ...m.keywords].join(' ').toLowerCase(),
      });
    });
    HUB_DATA.projects.forEach(p => {
      idx.push({
        g: 'Projects',
        t: `Job ${p.job}: ${p.title}`,
        s: p.stack.join(' · '),
        h: `#/projects/${p.slug}`,
        k: [p.title, p.summary, ...p.stack, ...p.features].join(' ').toLowerCase(),
      });
    });
    HUB_DATA.assessment.forEach(a => {
      idx.push({
        g: 'Assessment',
        t: a.title,
        s: a.summary,
        h: '#/assessment',
        k: (a.title + ' ' + a.summary + ' ' + a.tags.join(' ')).toLowerCase(),
      });
    });
    for (const [slug, entries] of Object.entries(TREE_DATA)) {
      const p = HUB_DATA.projects.find(x => x.slug === slug);
      entries
        .filter(e => e.text)
        .forEach(e => {
          idx.push({
            g: 'Files',
            t: e.path.split('/').pop() || e.path,
            s: `Job ${p ? p.job : ''} · ${e.path}`,
            h: `#/projects/${slug}/code/${enc(e.path)}`,
            k: (slug + ' ' + e.path).toLowerCase(),
          });
        });
    }
    return idx;
  }, []);

  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (q.length < 2) return [];
    const terms = q.split(/\s+/);
    return searchIndex.filter(item => terms.every(t => item.k.includes(t))).slice(0, 30);
  }, [searchQuery, searchIndex]);

  // Module filter
  const [moduleFilter, setModuleFilter] = useState('');

  // Active Project Code File State
  const [activeFileContent, setActiveFileContent] = useState<string | null>(null);
  const [activeFileLoading, setActiveFileLoading] = useState(false);
  const [activeFileError, setActiveFileError] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  // Project prompt state
  const [promptContent, setPromptContent] = useState<string | null>(null);
  const [promptLoading, setPromptLoading] = useState(false);
  const [promptCopySuccess, setPromptCopySuccess] = useState(false);

  // Copy helper
  const copyToClipboard = async (text: string, isPrompt = false) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand('copy');
      } catch {
        // ignore
      }
      ta.remove();
    }
    if (isPrompt) {
      setPromptCopySuccess(true);
      setTimeout(() => setPromptCopySuccess(false), 1400);
    } else {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 1400);
    }
  };

  // When project or file changes, fetch content
  const activeSlug = route.page === 'projects' && route.arg1 ? route.arg1 : null;
  const activeTab = route.arg2 || 'overview';
  const activeFilePath = route.arg3;

  useEffect(() => {
    if (!activeSlug) return;

    if (activeTab === 'prompt') {
      const bundledPrompt = PROJECT_FILES[activeSlug]?.['docs/ai-agent-prompt.md'];
      if (bundledPrompt !== undefined) {
        setPromptContent(bundledPrompt);
        setPromptLoading(false);
        return;
      }
      setPromptLoading(true);
      fetch(projUrl(activeSlug, 'docs/ai-agent-prompt.md'))
        .then(res => {
          if (!res.ok) throw new Error('Failed to load prompt');
          return res.text();
        })
        .then(text => {
          setPromptContent(text);
          setPromptLoading(false);
        })
        .catch(() => {
          setPromptContent('# Error\nCould not load the prompt file.');
          setPromptLoading(false);
        });
    }
  }, [activeSlug, activeTab]);

  useEffect(() => {
    if (!activeSlug || activeTab !== 'code') return;

    const entries = TREE_DATA[activeSlug] || [];
    let target = activeFilePath;
    if (!target) {
      const prefer = entries.find(e => /(Product|Welcome|Auth)Activity\.kt$/.test(e.path));
      target = (prefer || entries.find(e => e.text))?.path;
    }

    if (!target) return;

    const bundledContent = PROJECT_FILES[activeSlug]?.[target];
    if (bundledContent !== undefined) {
      setActiveFileContent(bundledContent);
      setActiveFileError(false);
      setActiveFileLoading(false);
      return;
    }

    setActiveFileLoading(true);
    setActiveFileError(false);

    fetch(projUrl(activeSlug, target))
      .then(res => {
        if (!res.ok) throw new Error('File not found');
        return res.text();
      })
      .then(text => {
        setActiveFileContent(text);
        setActiveFileLoading(false);
      })
      .catch(() => {
        setActiveFileError(true);
        setActiveFileLoading(false);
      });
  }, [activeSlug, activeTab, activeFilePath]);

  const totalPages = HUB_DATA.modules.reduce((a, m) => a + m.pages, 0);
  const doneCount = HUB_DATA.modules.filter(m => progress[m.id]).length;
  const progressPct = Math.round((doneCount / HUB_DATA.modules.length) * 100);

  // Render tree node recursive component
  const renderTreeNode = (node: TreeNode, slug: string, currentFile: string, prefix = ''): React.ReactNode => {
    const sortedDirNames = Object.keys(node.dirs).sort();
    const sortedFiles = [...node.files].sort((a, b) => a.name.localeCompare(b.name));

    return (
      <>
        {sortedDirNames.map(dirName => {
          const dirPrefix = prefix + dirName + '/';
          const isOpen = currentFile.startsWith(dirPrefix) || (prefix === '' && dirName === 'app');
          return (
            <details key={dirPrefix} open={isOpen}>
              <summary>{dirName}</summary>
              {renderTreeNode(node.dirs[dirName], slug, currentFile, dirPrefix)}
            </details>
          );
        })}
        {sortedFiles.map(file => {
          const isSelected = file.path === currentFile;
          if (file.text) {
            return (
              <a
                key={file.path}
                className={`file ${isSelected ? 'on' : ''}`}
                href={`#/projects/${slug}/code/${enc(file.path)}`}
                onClick={e => {
                  e.preventDefault();
                  navigate(`#/projects/${slug}/code/${enc(file.path)}`);
                }}
              >
                {file.name}
              </a>
            );
          } else {
            return (
              <a
                key={file.path}
                className="file bin"
                href={projUrl(slug, file.path)}
                download
                title={`Binary file (${fmtSize(file.size)})`}
              >
                {file.name} ⬇
              </a>
            );
          }
        })}
      </>
    );
  };

  return (
    <>
      {/* Header */}
      <header className="top">
        <a
          className="brand"
          href="#/home"
          onClick={e => {
            e.preventDefault();
            navigate('#/home');
          }}
        >
          <span>
            Android Mobile Application Development <b>Level-4</b>
          </span>
        </a>

        <nav id="nav">
          <button
            className={route.page === 'home' ? 'active' : ''}
            onClick={() => navigate('#/home')}
          >
            Home
          </button>
          <button
            className={route.page === 'modules' ? 'active' : ''}
            onClick={() => navigate('#/modules')}
          >
            Modules
          </button>
          <button
            className={route.page === 'projects' ? 'active' : ''}
            onClick={() => navigate('#/projects')}
          >
            Projects
          </button>
          <button
            className={route.page === 'assessment' ? 'active' : ''}
            onClick={() => navigate('#/assessment')}
          >
            Assessment
          </button>
        </nav>

        <div className="tools">
          <div className="search">
            <input
              ref={searchInputRef}
              type="search"
              placeholder="Search modules, files, topics… (Press /)"
              autoComplete="off"
              aria-label="Search"
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                setSearchOpen(true);
              }}
              onFocus={() => {
                if (searchQuery.trim().length >= 2) setSearchOpen(true);
              }}
            />
            {searchOpen && searchQuery.trim().length >= 2 && (
              <div className="results">
                {searchResults.length === 0 ? (
                  <p className="empty" style={{ padding: '14px' }}>
                    No results found
                  </p>
                ) : (
                  (() => {
                    let lastGroup = '';
                    return searchResults.map((h, i) => {
                      const showHeader = h.g !== lastGroup;
                      lastGroup = h.g;
                      return (
                        <React.Fragment key={i}>
                          {showHeader && <div className="grp">{h.g}</div>}
                          <a
                            className="result-item"
                            href={h.h}
                            onClick={e => {
                              e.preventDefault();
                              setSearchOpen(false);
                              setSearchQuery('');
                              navigate(h.h);
                            }}
                          >
                            <strong>{h.t}</strong>
                            <small>{h.s.length > 90 ? h.s.slice(0, 90) + '…' : h.s}</small>
                          </a>
                        </React.Fragment>
                      );
                    });
                  })()
                )}
              </div>
            )}
          </div>
          <LiquidChromeToggle theme={theme} onToggle={toggleTheme} />
        </div>
      </header>

      {/* Main View */}
      <main id="view" tabIndex={-1} onClick={() => searchOpen && setSearchOpen(false)}>
        {/* HOME VIEW */}
        {route.page === 'home' && (
          <>
            <section className="hero">
              <h1>
                {HUB_DATA.course.title} <span style={{ color: 'var(--brand)' }}>{HUB_DATA.course.level}</span>
              </h1>
              <p>{HUB_DATA.course.tagline}</p>
              <div className="cta">
                <button className="btn" onClick={() => navigate('#/modules')}>
                  Start with the modules
                </button>
                <button className="btn ghost" onClick={() => navigate('#/projects')}>
                  Browse projects
                </button>
                <button className="btn ghost" onClick={() => navigate('#/assessment')}>
                  Assessment prep
                </button>
                <a
                  className="btn ghost"
                  href={HUB_DATA.course.courseUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Official course page ↗
                </a>
              </div>
            </section>

            <div className="stats">
              <div className="stat">
                <b>{HUB_DATA.modules.length}</b>
                <span>Course modules (CBLM)</span>
              </div>
              <div className="stat">
                <b>{totalPages}</b>
                <span>Pages of learning material</span>
              </div>
              <div className="stat">
                <b>{HUB_DATA.projects.length}</b>
                <span>Complete Kotlin projects</span>
              </div>
              <div className="stat">
                <b>37</b>
                <span>Solved MCQs in the bank</span>
              </div>
              <div className="stat">
                <b>{HUB_DATA.assessment.length}</b>
                <span>Assessment documents</span>
              </div>
            </div>

            <div className="section-title">
              <h2>Suggested learning path</h2>
              <span>Click a step to open the module</span>
            </div>
            <div className="path">
              {HUB_DATA.learningPath.map((s, i) => (
                <React.Fragment key={s.module}>
                  {i > 0 && <span className="arrow">→</span>}
                  <button onClick={() => navigate(`#/modules/${s.module}`)}>
                    <span className="num" style={{ margin: 0 }}>
                      {s.module}
                    </span>
                    {s.step}
                  </button>
                </React.Fragment>
              ))}
            </div>

            <div className="section-title">
              <h2>Your progress</h2>
              <span>
                {doneCount} of {HUB_DATA.modules.length} modules completed
              </span>
            </div>
            <div className="progress" aria-label="Progress">
              <i style={{ width: `${progressPct}%` }}></i>
            </div>
            <p style={{ color: 'var(--muted)', fontSize: '13.5px', marginTop: '6px' }}>
              Progress is saved in your own browser only. It is never uploaded.
            </p>

            <div className="section-title">
              <h2>Projects</h2>
              <span>Real apps you can read, download and run</span>
            </div>
            <div className="grid">
              {HUB_DATA.projects.map(p => (
                <article key={p.slug} className="card">
                  <h3>
                    <span className="num">{p.job}</span>
                    {p.title}
                  </h3>
                  <div>
                    {p.stack.map(s => (
                      <span key={s} className="badge k">
                        {s}
                      </span>
                    ))}
                    <span className="badge">⏱ {p.time}</span>
                  </div>
                  <p>{p.summary}</p>
                  <div className="actions">
                    <button className="btn small" onClick={() => navigate(`#/projects/${p.slug}`)}>
                      Explore
                    </button>
                    <button
                      className="btn small ghost"
                      onClick={() => navigate(`#/projects/${p.slug}/code`)}
                    >
                      Browse code
                    </button>
                    <a className="btn small ghost" href={`/downloads/${p.slug}.zip`} download>
                      ⬇ ZIP
                    </a>
                  </div>
                </article>
              ))}
            </div>

            <div className="section-title">
              <h2>How to use this course</h2>
            </div>
            <div className="grid">
              <div className="card">
                <h3>📚 Learn</h3>
                <p>
                  Read the seven modules in order, tick them off, then test yourself with the oral
                  preparation and solved MCQs.
                </p>
              </div>
              <div className="card">
                <h3>🛠 Build</h3>
                <p>
                  Open a project, read the specification and the AI-agent prompt, then compare your
                  own solution with the working code.
                </p>
              </div>
              <div className="card">
                <h3>⬇ Reuse</h3>
                <p>
                  Copy any file or prompt with one click, or download a whole project as a ZIP and
                  open it in Android Studio.
                </p>
              </div>
            </div>
          </>
        )}

        {/* MODULES VIEW */}
        {route.page === 'modules' && (
          <>
            <div className="section-title">
              <h2>Course modules</h2>
              <span>
                {HUB_DATA.modules.length} CBLM units, {totalPages} pages
              </span>
            </div>
            <div className="toolbar">
              <input
                type="search"
                placeholder="Filter modules by topic, e.g. sqlite, retrofit, inheritance…"
                value={moduleFilter}
                onChange={e => setModuleFilter(e.target.value)}
              />
            </div>
            <div className="grid">
              {HUB_DATA.modules
                .filter(m => {
                  if (!moduleFilter.trim()) return true;
                  const q = moduleFilter.toLowerCase();
                  const hay = (
                    m.title +
                    ' ' +
                    m.code +
                    ' ' +
                    m.outcomes.join(' ') +
                    ' ' +
                    m.keywords.join(' ')
                  ).toLowerCase();
                  return hay.includes(q);
                })
                .map(m => {
                  const isDone = !!progress[m.id];
                  const jobs = HUB_DATA.projects.filter(p => p.related.includes(m.id));
                  const isFocused = route.arg1 && parseInt(route.arg1, 10) === m.id;
                  return (
                    <article
                      key={m.id}
                      className="card"
                      style={isFocused ? { outline: '2px solid var(--brand)' } : {}}
                    >
                      <h3>
                        <span className="num">{m.id}</span>
                        {m.title}
                      </h3>
                      <div>
                        <span className="badge mono">{m.code}</span>
                        <span className="badge">{m.pages} pages</span>
                      </div>
                      <ul className="tight">
                        {m.outcomes.map((o, idx) => (
                          <li key={idx}>{o}</li>
                        ))}
                      </ul>
                      {jobs.length > 0 && (
                        <p style={{ fontSize: '13.5px', color: 'var(--muted)' }}>
                          Used in:{' '}
                          {jobs.map((j, idx) => (
                            <React.Fragment key={j.slug}>
                              {idx > 0 && ', '}
                              <a
                                href={`#/projects/${j.slug}`}
                                onClick={e => {
                                  e.preventDefault();
                                  navigate(`#/projects/${j.slug}`);
                                }}
                              >
                                Job {j.job}
                              </a>
                            </React.Fragment>
                          ))}
                        </p>
                      )}
                      <label className="check">
                        <input
                          type="checkbox"
                          checked={isDone}
                          onChange={() => toggleModuleDone(m.id)}
                        />
                        Mark as completed
                      </label>
                      <div className="actions">
                        <button
                          className="btn small"
                          onClick={() =>
                            setModalDoc({
                              title: `Module ${m.id}: ${m.short}`,
                              url: fileUrl(m.file),
                            })
                          }
                        >
                          📖 Read
                        </button>
                        <a className="btn small ghost" href={fileUrl(m.file)} download>
                          ⬇ PDF
                        </a>
                      </div>
                    </article>
                  );
                })}
            </div>
          </>
        )}

        {/* PROJECTS LIST VIEW */}
        {route.page === 'projects' && !route.arg1 && (
          <>
            <div className="section-title">
              <h2>Projects</h2>
              <span>Three practical jobs, each with spec, prompt and full source</span>
            </div>
            <div className="grid">
              {HUB_DATA.projects.map(p => (
                <article key={p.slug} className="card">
                  <h3>
                    <span className="num">{p.job}</span>
                    {p.title}
                  </h3>
                  <div>
                    {p.stack.map(s => (
                      <span key={s} className="badge k">
                        {s}
                      </span>
                    ))}
                    <span className="badge">⏱ {p.time}</span>
                  </div>
                  <p>{p.summary}</p>
                  <div className="actions">
                    <button className="btn small" onClick={() => navigate(`#/projects/${p.slug}`)}>
                      Explore
                    </button>
                    <button
                      className="btn small ghost"
                      onClick={() => navigate(`#/projects/${p.slug}/code`)}
                    >
                      Browse code
                    </button>
                    <a className="btn small ghost" href={`/downloads/${p.slug}.zip`} download>
                      ⬇ ZIP
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}

        {/* PROJECT DETAIL VIEW */}
        {route.page === 'projects' && route.arg1 && (
          (() => {
            const p = HUB_DATA.projects.find(x => x.slug === route.arg1);
            if (!p) {
              return <p className="empty">Project not found.</p>;
            }
            const currentTab = route.arg2 || 'overview';
            const entries = TREE_DATA[p.slug] || [];
            let currentPath = route.arg3;
            if (!currentPath && currentTab === 'code') {
              const prefer = entries.find(e => /(Product|Welcome|Auth)Activity\.kt$/.test(e.path));
              currentPath = (prefer || entries.find(e => e.text))?.path || '';
            }

            return (
              <>
                <div className="crumbs">
                  <a
                    href="#/projects"
                    onClick={e => {
                      e.preventDefault();
                      navigate('#/projects');
                    }}
                  >
                    Projects
                  </a>{' '}
                  › Job {p.job}
                </div>
                <h1>{p.title}</h1>
                <div>
                  {p.stack.map(s => (
                    <span key={s} className="badge k">
                      {s}
                    </span>
                  ))}
                  <span className="badge">⏱ {p.time}</span>
                </div>

                <div className="tabs">
                  <button
                    className={currentTab === 'overview' ? 'on' : ''}
                    onClick={() => navigate(`#/projects/${p.slug}`)}
                  >
                    Overview
                  </button>
                  <button
                    className={currentTab === 'code' ? 'on' : ''}
                    onClick={() => navigate(`#/projects/${p.slug}/code`)}
                  >
                    Source code
                  </button>
                  <button
                    className={currentTab === 'prompt' ? 'on' : ''}
                    onClick={() => navigate(`#/projects/${p.slug}/prompt`)}
                  >
                    AI prompt
                  </button>
                  <button
                    className={currentTab === 'spec' ? 'on' : ''}
                    onClick={() => navigate(`#/projects/${p.slug}/spec`)}
                  >
                    Specification
                  </button>
                </div>

                {/* Overview Tab */}
                {currentTab === 'overview' && (
                  <div>
                    <p style={{ fontSize: '17px', maxWidth: '820px' }}>{p.summary}</p>
                    {p.setup && (
                      <div className="notice">
                        <b>Before you run it:</b> {p.setup}
                      </div>
                    )}
                    <div className="cta" style={{ margin: '14px 0 6px' }}>
                      <a className="btn" href={`/downloads/${p.slug}.zip`} download>
                        ⬇ Download project ZIP
                      </a>
                      <button
                        className="btn ghost"
                        onClick={() => navigate(`#/projects/${p.slug}/code`)}
                      >
                        Browse source
                      </button>
                      <button
                        className="btn ghost"
                        onClick={() => navigate(`#/projects/${p.slug}/prompt`)}
                      >
                        Read the prompt
                      </button>
                    </div>
                    <div className="two" style={{ marginTop: '18px' }}>
                      <div className="card">
                        <h3>What it does</h3>
                        <ul className="tight">
                          {p.features.map((f, i) => (
                            <li key={i}>{f}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="card">
                        <h3>How to run it</h3>
                        <ol className="steps">
                          {p.run.map((s, i) => (
                            <li key={i}>{s}</li>
                          ))}
                        </ol>
                      </div>
                      <div className="card">
                        <h3>Related modules</h3>
                        <ul className="tight">
                          {p.related.map(id => {
                            const mod = HUB_DATA.modules.find(m => m.id === id);
                            return (
                              <li key={id}>
                                <a
                                  href={`#/modules/${id}`}
                                  onClick={e => {
                                    e.preventDefault();
                                    navigate(`#/modules/${id}`);
                                  }}
                                >
                                  Module {id}: {mod?.short}
                                </a>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* Source Code Tab */}
                {currentTab === 'code' && (
                  <div className="code-layout">
                    <nav className="tree" aria-label="Project files">
                      {renderTreeNode(buildTree(entries), p.slug, currentPath || '')}
                    </nav>
                    <section className="viewer">
                      <div className="viewer-bar">
                        <span className="path-label">{currentPath}</span>
                        <span className="spacer"></span>
                        {activeFileContent && !activeFileLoading && (
                          <>
                            <button
                              className="btn small"
                              onClick={() => copyToClipboard(activeFileContent)}
                            >
                              {copySuccess ? 'Copied ✓' : 'Copy'}
                            </button>
                            <a
                              className="btn small ghost"
                              href={projUrl(p.slug, currentPath || '')}
                              download={(currentPath || '').split('/').pop()}
                            >
                              Download
                            </a>
                          </>
                        )}
                      </div>
                      {activeFileLoading ? (
                        <p className="empty">Loading file…</p>
                      ) : activeFileError ? (
                        <div className="empty">
                          Could not load this file. Please verify path or open directly.
                        </div>
                      ) : activeFileContent ? (
                        currentPath?.endsWith('.md') ? (
                          <div
                            className="md"
                            dangerouslySetInnerHTML={{ __html: marked.parse(activeFileContent) as string }}
                          />
                        ) : (
                          <pre className="code">
                            <code
                              className="hljs"
                              dangerouslySetInnerHTML={{
                                __html: (() => {
                                  const lang = langFor(currentPath || '');
                                  try {
                                    return hljs.getLanguage(lang)
                                      ? hljs.highlight(activeFileContent, { language: lang }).value
                                      : activeFileContent
                                          .replace(/&/g, '&amp;')
                                          .replace(/</g, '&lt;')
                                          .replace(/>/g, '&gt;');
                                  } catch {
                                    return activeFileContent
                                      .replace(/&/g, '&amp;')
                                      .replace(/</g, '&lt;')
                                      .replace(/>/g, '&gt;');
                                  }
                                })(),
                              }}
                            />
                          </pre>
                        )
                      ) : (
                        <p className="empty">Select a file from the tree to view its content.</p>
                      )}
                    </section>
                  </div>
                )}

                {/* AI Prompt Tab */}
                {currentTab === 'prompt' && (
                  <div>
                    <div className="notice">
                      This is the prompt used with an Android Studio AI agent to scaffold the job.
                      Replace the placeholders (like &lt;YourRegNo&gt;) with your own details before
                      using it.
                    </div>
                    <section className="viewer">
                      <div className="viewer-bar">
                        <span className="path-label">docs/ai-agent-prompt.md</span>
                        <span className="spacer"></span>
                        {promptContent && (
                          <button
                            className="btn small"
                            onClick={() => copyToClipboard(promptContent, true)}
                          >
                            {promptCopySuccess ? 'Copied ✓' : 'Copy whole prompt'}
                          </button>
                        )}
                      </div>
                      {promptLoading ? (
                        <p className="empty">Loading prompt…</p>
                      ) : promptContent ? (
                        <div
                          className="md"
                          dangerouslySetInnerHTML={{ __html: marked.parse(promptContent) as string }}
                        />
                      ) : (
                        <p className="empty">Could not load the prompt file.</p>
                      )}
                    </section>
                  </div>
                )}

                {/* Specification Tab */}
                {currentTab === 'spec' && (
                  <div>
                    <div className="cta" style={{ marginBottom: '12px' }}>
                      <a
                        className="btn small"
                        href={projUrl(p.slug, 'docs/specification.pdf')}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Open in new tab
                      </a>
                      <a
                        className="btn small ghost"
                        href={projUrl(p.slug, 'docs/specification.pdf')}
                        download
                      >
                        Download PDF
                      </a>
                    </div>
                    <iframe
                      className="embed"
                      src={projUrl(p.slug, 'docs/specification.pdf')}
                      title={`Job ${p.job} specification`}
                    />
                  </div>
                )}
              </>
            );
          })()
        )}

        {/* ASSESSMENT VIEW */}
        {route.page === 'assessment' && (
          <>
            <div className="section-title">
              <h2>Assessment preparation</h2>
              <span>Practical, written and oral</span>
            </div>
            <div className="grid">
              {HUB_DATA.assessment.map(a => (
                <article key={a.id} className="card">
                  <h3>{a.title}</h3>
                  <div>
                    {a.tags.map(t => (
                      <span key={t} className="badge k">
                        {t}
                      </span>
                    ))}
                    <span className="badge">
                      {a.pages} page{a.pages > 1 ? 's' : ''}
                    </span>
                  </div>
                  <p>{a.summary}</p>
                  <div className="actions">
                    <button
                      className="btn small"
                      onClick={() =>
                        setModalDoc({
                          title: a.title,
                          url: fileUrl(a.file),
                        })
                      }
                    >
                      📖 Read
                    </button>
                    <a className="btn small ghost" href={fileUrl(a.file)} download>
                      ⬇ PDF
                    </a>
                  </div>
                </article>
              ))}
            </div>
            <div className="notice" style={{ marginTop: '24px' }}>
              Tip: do the three jobs yourself with a timer (1 h, 1 h, 2 h) before you open the
              solved projects. Then use the oral preparation sheet the day before the assessment.
            </div>
          </>
        )}
      </main>

      {/* Modal PDF Viewer */}
      {modalDoc && (
        <div className="modal">
          <div className="modal-bar">
            <strong>{modalDoc.title}</strong>
            <span className="spacer"></span>
            <a
              className="btn small"
              href={modalDoc.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              Open in new tab
            </a>
            <a
              className="btn small"
              href={modalDoc.url}
              download={modalDoc.url.split('/').pop()}
            >
              Download
            </a>
            <button className="btn small ghost" onClick={() => setModalDoc(null)}>
              Close ✕
            </button>
          </div>
          <iframe src={modalDoc.url} title="Document viewer" />
          <p className="modal-hint">
            If the PDF does not appear in your browser (some devices can’t embed PDFs), use “Open
            in new tab” or “Download”.
          </p>
        </div>
      )}

      {/* Footer */}
      <footer>
        <p>
          Built from the repository, so every file here is also in the GitHub repo. Course materials
          © NSDA, Bangladesh. Shared for learning. Source code is MIT licensed.
        </p>
      </footer>
    </>
  );
}

export default App;
