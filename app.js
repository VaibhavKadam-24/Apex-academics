/* ═══════════════════════════════════════════════════════════
   APEX ACADEMICS — app.js
   Instant search + filter — no backend, no reload
   ═══════════════════════════════════════════════════════════ */

'use strict';

// ── STATE ────────────────────────────────────────────────────
const state = {
  resources: [],
  query: '',
  category: 'all',
  level: 'all',
  language: 'all',
};

// ── DOM REFS ─────────────────────────────────────────────────
const cardsGrid    = document.getElementById('cardsGrid');
const emptyState   = document.getElementById('emptyState');
const searchInput  = document.getElementById('searchInput');
const searchClear  = document.getElementById('searchClear');
const resultCount  = document.getElementById('resultCount');
const themeToggle  = document.getElementById('themeToggle');
const themeIcon    = document.getElementById('themeIcon');
const languageFilter = document.getElementById('languageFilter');

// Stat counters
const totalCount  = document.getElementById('totalCount');
const ebookCount  = document.getElementById('ebookCount');
const courseCount = document.getElementById('courseCount');
const certCount   = document.getElementById('certCount');

// ── THEME ─────────────────────────────────────────────────────
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
  localStorage.setItem('apex-theme', theme);
}

function initTheme() {
  const saved = localStorage.getItem('apex-theme') ||
    (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
  applyTheme(saved);
}

themeToggle.addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme');
  applyTheme(current === 'dark' ? 'light' : 'dark');
});

    // ── LOAD DATA ─────────────────────────────────────────────────
    async function loadResources() {
      const basePath = window.location.pathname.endsWith('/')
        ? window.location.pathname
        : window.location.pathname + '/';

      const possiblePaths = [
        './resources.json',
        'resources.json',
        './data/resources.json',
        'data/resources.json',
        basePath + 'resources.json',
        basePath + 'data/resources.json'
      ];

      let loadedData = null;

      for (const path of possiblePaths) {
        try {
          const res = await fetch(path);
          if (res.ok) {
            loadedData = await res.json();
            break;
          }
        } catch (e) {}
      }

      if (loadedData && Array.isArray(loadedData) && loadedData.length > 0) {
        state.resources = loadedData;
        updateStats();
        renderCards();
      } else {
        cardsGrid.innerHTML = `
          <div style="grid-column:1/-1;text-align:center;padding:60px;color:var(--text-muted)">
            <div style="font-size:2.5rem;margin-bottom:12px">⚠️</div>
            <p>Could not load resources. Make sure <strong>resources.json</strong> exists.</p>
          </div>`;
      }
    }

// ── STATS ─────────────────────────────────────────────────────
function updateStats() {
  const total = state.resources.length;
  const ebooks  = state.resources.filter(r => r.category === 'ebook').length;
  const courses  = state.resources.filter(r => r.category === 'course').length;
  const certs    = state.resources.filter(r => r.category === 'certification').length;

  animateCount(totalCount,  0, total,  600);
  animateCount(ebookCount,  0, ebooks, 700);
  animateCount(courseCount, 0, courses,800);
  animateCount(certCount,   0, certs,  900);
}

function animateCount(el, from, to, duration) {
  const start = performance.now();
  function update(now) {
    const progress = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(from + (to - from) * ease);
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

// ── FILTER & SEARCH ───────────────────────────────────────────
function getFiltered() {
  const q = state.query.toLowerCase().trim();

  return state.resources.filter(r => {
    const matchCategory = state.category === 'all' || r.category === state.category;
    const matchLevel    = state.level    === 'all' || r.level    === state.level;
    const matchLanguage = state.language === 'all' || r.language === state.language;
    const matchQuery    = !q ||
      r.title.toLowerCase().includes(q)   ||
      r.subject.toLowerCase().includes(q) ||
      r.author.toLowerCase().includes(q)  ||
      (r.tags || []).some(t => t.toLowerCase().includes(q));

    return matchCategory && matchLevel && matchLanguage && matchQuery;
  });
}

// ── RENDER ────────────────────────────────────────────────────
function renderCards() {
  const filtered = getFiltered();
  cardsGrid.innerHTML = '';

  // Update result count
  if (filtered.length === state.resources.length) {
    resultCount.textContent = `Showing all ${filtered.length}`;
  } else {
    resultCount.textContent = `${filtered.length} of ${state.resources.length}`;
  }

  if (filtered.length === 0) {
    emptyState.style.display = 'block';
    return;
  }
  emptyState.style.display = 'none';

  filtered.forEach((r, i) => {
    const card = buildCard(r, i);
    cardsGrid.appendChild(card);
  });
}

function buildCard(r, index) {
  const article = document.createElement('article');
  article.className = 'card';
  article.setAttribute('role', 'listitem');
  article.style.animationDelay = `${Math.min(index * 40, 400)}ms`;

  const categoryLabel = {
    ebook: '📖 eBook',
    course: '🎥 Course',
    certification: '🎓 Certification',
  }[r.category] || r.category;

  const tags = (r.tags || []).slice(0, 4).map(t =>
    `<span class="tag" title="Filter by ${t}" data-tag="${t}">${t}</span>`
  ).join('');

  article.innerHTML = `
    <div class="card-badges">
      <span class="badge badge-${r.category}">${categoryLabel}</span>
      <span class="badge badge-${r.level}">${r.level}</span>
      ${r.language !== 'English' ? `<span class="badge badge-lang">🌐 ${r.language}</span>` : ''}
    </div>

    <h3 class="card-title">${escapeHTML(r.title)}</h3>

    <div class="card-meta">
      <span>${escapeHTML(r.author)}</span>
      <span class="dot">·</span>
      <span>${escapeHTML(r.source)}</span>
    </div>

    ${tags ? `<div class="card-tags">${tags}</div>` : ''}

    <div class="card-footer">
      <a
        href="${escapeHTML(r.link)}"
        target="_blank"
        rel="noopener noreferrer"
        class="card-link"
        id="resource-${r.id}"
        aria-label="Open ${escapeHTML(r.title)} (opens in new tab)"
      >
        <span>Open Resource</span>
        <span class="card-link-icon">↗</span>
      </a>
    </div>
  `;

  // Tag click → search by tag
  article.querySelectorAll('.tag').forEach(tagEl => {
    tagEl.addEventListener('click', () => {
      searchInput.value = tagEl.dataset.tag;
      state.query = tagEl.dataset.tag;
      searchClear.style.display = 'block';
      renderCards();
      document.getElementById('resources').scrollIntoView({ behavior: 'smooth' });
    });
  });

  return article;
}

function escapeHTML(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ── SEARCH INPUT ──────────────────────────────────────────────
let searchDebounce;
searchInput.addEventListener('input', () => {
  state.query = searchInput.value;
  searchClear.style.display = state.query ? 'block' : 'none';
  clearTimeout(searchDebounce);
  searchDebounce = setTimeout(renderCards, 180);
});

searchClear.addEventListener('click', () => {
  searchInput.value = '';
  state.query = '';
  searchClear.style.display = 'none';
  searchInput.focus();
  renderCards();
});

// ── FILTER PILLS ──────────────────────────────────────────────
document.querySelectorAll('.pill[data-filter="category"]').forEach(pill => {
  pill.addEventListener('click', () => {
    document.querySelectorAll('.pill[data-filter="category"]').forEach(p => p.classList.remove('active'));
    pill.classList.add('active');
    state.category = pill.dataset.value;
    renderCards();
  });
});

document.querySelectorAll('.pill[data-filter="level"]').forEach(pill => {
  pill.addEventListener('click', () => {
    document.querySelectorAll('.pill[data-filter="level"]').forEach(p => p.classList.remove('active'));
    pill.classList.add('active');
    state.level = pill.dataset.value;
    renderCards();
  });
});

languageFilter.addEventListener('change', () => {
  state.language = languageFilter.value;
  renderCards();
});

// ── RESET ─────────────────────────────────────────────────────
function resetAll() {
  state.query    = '';
  state.category = 'all';
  state.level    = 'all';
  state.language = 'all';

  searchInput.value = '';
  searchClear.style.display = 'none';
  languageFilter.value = 'all';

  document.querySelectorAll('.pill[data-filter="category"]').forEach((p, i) => {
    p.classList.toggle('active', i === 0);
  });
  document.querySelectorAll('.pill[data-filter="level"]').forEach((p, i) => {
    p.classList.toggle('active', i === 0);
  });

  renderCards();
}

document.getElementById('resetFilters').addEventListener('click', resetAll);
document.getElementById('resetFromEmpty').addEventListener('click', resetAll);

// ── NAVBAR SCROLL SHADOW ──────────────────────────────────────
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.style.boxShadow = window.scrollY > 10
    ? '0 4px 24px rgba(0,0,0,0.2)'
    : 'none';
}, { passive: true });

// ── KEYBOARD SHORTCUT: / to focus search ─────────────────────
document.addEventListener('keydown', (e) => {
  if (e.key === '/' && document.activeElement !== searchInput) {
    e.preventDefault();
    searchInput.focus();
    searchInput.select();
  }
  if (e.key === 'Escape' && document.activeElement === searchInput) {
    searchInput.blur();
  }
});

// ── INIT ──────────────────────────────────────────────────────
initTheme();
loadResources();
