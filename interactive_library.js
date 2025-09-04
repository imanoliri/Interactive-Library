// ----------- CONFIG -----------
const CONFIG = {
    // If you commit /books/manifest.json, it will be used first.
    manifestPath: '/books/manifest.json',

    // Fallback: public GitHub repo info (only used if manifest missing).
    github: {
        owner: 'YOUR_GITHUB_USERNAME_OR_ORG',
        repo:  'YOUR_REPO_NAME',
        branch:'main' // or 'gh-pages' if that’s where /books lives
    },

    // Recognize these as potential cover filenames.
    coverCandidates: ['cover.webp','cover.jpg','cover.png','Cover.jpg','Cover.png'],

    // Recognize these as the entry HTML inside a book folder.
    entryCandidates: ['index.html','book.html','play.html']
};

// URL state: ?path=trilogy/valley_of_dragons_1
const params = new URLSearchParams(location.search);
const startPath = params.get('path') || '';

const el = {
    grid: document.getElementById('grid'),
    count: document.getElementById('count'),
    empty: document.getElementById('empty'),
    crumbs: document.getElementById('breadcrumbs'),
    search: document.getElementById('search'),
    tFolder: document.getElementById('tile-folder'),
    tBook: document.getElementById('tile-book')
};

// Keyboard focus: press "/" to focus search
window.addEventListener('keydown', (e) => {
    if (e.key === '/' && document.activeElement !== el.search) {
    e.preventDefault(); el.search.focus();
    }
});

// Data model nodes: {type:'dir'|'book', name, path, children?, meta?}
let ROOT = { type:'dir', name:'books', path:'', children:[] };
let CURRENT = ROOT;
let ALL_BOOKS = []; // for global search

init().catch(err => showError(err));

async function init() {
    const data = await loadData();
    ROOT = normalizeToTree(data);
    navigateTo(startPath);
    setupSearch();
    window.addEventListener('popstate', () => navigateTo(new URLSearchParams(location.search).get('path') || ''));
}

function showError(err) {
    console.error(err);
    el.grid.innerHTML = `<div class="text-red-300">Error: ${escapeHtml(err.message || err)}</div>`;
}

// ---------- DATA LOADING ----------
async function loadData() {
    // 1) Try manifest.json
    try {
    const res = await fetch(CONFIG.manifestPath, { cache: 'no-store' });
    if (res.ok) {
        const json = await res.json();
        return json;
    }
    } catch(_) {}
    // 2) Fallback: GitHub Contents API
    const { owner, repo, branch } = CONFIG.github;
    if (!owner || !repo || !branch) throw new Error('Missing GitHub fallback config. Provide owner/repo/branch or commit /books/manifest.json.');

    async function walk(path='') {
    const api = `https://api.github.com/repos/${owner}/${repo}/contents/books/${path}?ref=${branch}`;
    const res = await fetch(api, { headers: { 'Accept': 'application/vnd.github+json' }});
    if (!res.ok) {
        const msg = await res.text();
        throw new Error(`GitHub API error for ${api}: ${res.status} ${msg}`);
    }
    const list = await res.json(); // array
    const nodes = [];
    for (const item of list) {
        if (item.type === 'dir') {
        const children = await walk(path ? `${path}/${item.name}` : item.name);
        nodes.push({ type:'dir', name:item.name, path:path, children });
        } else if (item.type === 'file') {
        // We’ll decide "book" at folder level by seeing entryCandidates
        }
    }
    // After we have children, decide leaf "book" folders
    // A folder is a "book" if it contains an entryCandidate.
    // But the GitHub API walker doesn’t return file lists here, so we’ll do a second call for each folder to detect files:
    const enriched = [];
    for (const n of nodes) {
        if (n.type === 'dir') {
        const api2 = `https://api.github.com/repos/${owner}/${repo}/contents/books/${path ? `${path}/` : ''}${n.name}?ref=${branch}`;
        const r2 = await fetch(api2);
        const files = r2.ok ? await r2.json() : [];
        const names = files.filter(f => f.type === 'file').map(f => f.name);
        const entry = CONFIG.entryCandidates.find(x => names.includes(x));
        if (entry) {
            const cover = CONFIG.coverCandidates.find(x => names.includes(x));
            // Try optional metadata.json
            let meta = {};
            const m = files.find(f => f.name.toLowerCase() === 'metadata.json');
            if (m) {
            try {
                const mRes = await fetch(m.download_url);
                meta = await mRes.json();
            } catch(_) {}
            }
            enriched.push({
            type:'book',
            name:n.name,
            path: path ? `${path}/${n.name}` : n.name,
            entry,
            cover: cover ? cover : null,
            meta
            });
        } else {
            enriched.push({
            ...n,
            path: path ? `${path}/${n.name}` : n.name
            });
        }
        } else {
        enriched.push(n);
        }
    }
    return enriched;
    }
    const children = await walk('');
    return { type:'dir', name:'books', path:'', children };
}

// ---------- NORMALIZE ----------
function normalizeToTree(data) {
    // Accepts either already-normalized nodes or a simpler manifest format.
    // Ensure paths are folder-like (no leading slash) and children arrays exist.
    const fix = (node) => {
    if (!node) return null;
    if (node.type === 'dir') {
        const kids = (node.children || []).map(fix).filter(Boolean);
        return { type:'dir', name:node.name, path:node.path || pathParent(node), children: kids };
    } else if (node.type === 'book') {
        return {
        type:'book',
        name: node.name,
        path: node.path || '',
        entry: node.entry || 'index.html',
        cover: node.cover || null,
        meta: node.meta || {}
        };
    }
    return null;
    };
    const root = fix(data);
    // Collect all books for search
    ALL_BOOKS = [];
    function collect(n) {
    if (n.type === 'book') ALL_BOOKS.push(n);
    if (n.children) n.children.forEach(collect);
    }
    collect(root);
    return root;
}

function pathParent(node) {
    const p = node.path || '';
    const parts = p.split('/').filter(Boolean);
    parts.pop();
    return parts.join('/');
}

// ---------- NAVIGATION / RENDER ----------
function navigateTo(path) {
    CURRENT = dive(ROOT, path);
    render(path);
}

function dive(node, path) {
    if (!path) return node;
    const parts = path.split('/').filter(Boolean);
    let cur = node;
    for (const part of parts) {
    if (!cur.children) break;
    const next = cur.children.find(c => c.name === part);
    if (!next) break;
    cur = next;
    }
    return cur;
}

function render(path) {
    // breadcrumbs
    renderCrumbs(path);
    // grid
    const items = (CURRENT && CURRENT.children) ? CURRENT.children : [];
    el.grid.innerHTML = '';
    el.empty.classList.toggle('hidden', items.length !== 0);

    const q = (el.search.value || '').trim().toLowerCase();
    let shown = 0;

    for (const n of items) {
    if (n.type === 'dir') {
        const tile = el.tFolder.content.firstElementChild.cloneNode(true);
        tile.querySelector('.folder-name').textContent = n.name.replace(/_/g,' ');
        const count = countDescendants(n);
        tile.querySelector('.folder-meta').textContent = `${count.books} book${count.books===1?'':'s'} • ${count.folders} folder${count.folders===1?'':'s'}`;
        tile.href = `?path=${encodeURIComponent(n.path ? `${n.path}/${n.name}` : n.name)}`;
        // search filter: folder passes if its name matches
        if (q && !n.name.toLowerCase().includes(q)) {
        // but keep if any descendant book matches query
        if (!descendantMatches(n, q)) continue;
        }
        el.grid.appendChild(tile);
        shown++;
    } else if (n.type === 'book') {
        if (q && !bookMatches(n, q)) continue;
        const tile = el.tBook.content.firstElementChild.cloneNode(true);
        const title = n.meta.title || prettify(n.name);
        tile.querySelector('.book-title').textContent = title;
        const sub = [];
        if (n.meta.author) sub.push(n.meta.author);
        if (n.meta.lang) sub.push(n.meta.lang.toUpperCase());
        tile.querySelector('.book-sub').textContent = sub.join(' · ');
        const tags = (n.meta.tags || []).slice(0,4).map(t => `#${t}`).join(' ');
        tile.querySelector('.book-tags').textContent = tags;
        const img = tile.querySelector('.book-cover');
        if (n.cover) {
        img.src = `/books/${n.path}/${n.cover}`;
        img.alt = `${title} cover`;
        } else {
        img.alt = 'Cover placeholder';
        }
        tile.href = `/books/${n.path}/${n.entry}`;
        el.grid.appendChild(tile);
        shown++;
    }
    }
    el.count.textContent = shown;
}

function renderCrumbs(path) {
    const parts = path.split('/').filter(Boolean);
    let acc = [];
    let html = `<a class="text-sky-400 hover:underline" href="?">/books</a>`;
    parts.forEach((p,i) => {
    acc.push(p);
    const href = `?path=${encodeURIComponent(acc.join('/'))}`;
    html += ` <span class="text-slate-600">/</span> <a class="text-sky-400 hover:underline" href="${href}">${escapeHtml(p.replace(/_/g,' '))}</a>`;
    });
    el.crumbs.innerHTML = html;
}

function countDescendants(node) {
    let folders = 0, books = 0;
    (function walk(n){
    if (n.type === 'dir') {
        folders += (n !== CURRENT ? 1 : 0);
        (n.children||[]).forEach(walk);
    } else if (n.type === 'book') books++;
    })(node);
    return {folders, books};
}
function descendantMatches(node, q) {
    let ok = false;
    (function walk(n){
    if (ok) return;
    if (n.type === 'book' && bookMatches(n, q)) { ok = true; return; }
    (n.children||[]).forEach(walk);
    })(node);
    return ok;
}
function bookMatches(n, q) {
    const title = (n.meta.title || n.name).toLowerCase();
    const author = (n.meta.author || '').toLowerCase();
    const tags = (n.meta.tags || []).map(t=>String(t).toLowerCase());
    const blurb = (n.meta.blurb || '').toLowerCase();
    return title.includes(q) || author.includes(q) || tags.some(t=>t.includes(q)) || blurb.includes(q);
}
function prettify(name) { return name.replace(/[_-]+/g,' ').replace(/\b\w/g, m=>m.toUpperCase()); }
function escapeHtml(s){ return String(s).replace(/[&<>"']/g, c=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c])); }

function setupSearch() {
    el.search.addEventListener('input', () => render(new URLSearchParams(location.search).get('path') || ''));
}