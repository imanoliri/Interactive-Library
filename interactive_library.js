const MANIFEST_URL = '/books/manifest.json';
const $ = s => document.querySelector(s);
// Standardize elements
const els = {
  grid: $('#grid'),
  breadcrumbs: $('#breadcrumbs'),
  tFolder: $('#tile-folder'),
  tBook: $('#tile-book'),
  continueReading: $('#continue-reading')
};

let ROOT_DATA = null;

async function init() {
  try {
    const res = await fetch(MANIFEST_URL, { cache: 'no-store' });
    ROOT_DATA = await res.json();
    renderProgress(); 
    render(); // Initial Render
    window.addEventListener('popstate', render); // Handle back button
  } catch (e) {
    els.grid.innerHTML = '<div class="error">Failed to load library manifest.</div>';
    console.error(e);
  }
}

// Get path from URL query param ?path=foo/bar
const getPath = () => new URLSearchParams(location.search).get('path') || '';

// Traverse the tree to find the current node
function resolvePath(root, pathStr) {
  if (!pathStr) return root;
  const parts = pathStr.split('/').filter(Boolean);
  let current = root;

  for (const part of parts) {
    if (!current.children) return null;
    const found = current.children.find(c => c.name === part);
    if (found) current = found;
    else return null;
  }
  return current;
}

function render() {
  const currentPath = getPath();
  const currentNode = resolvePath(ROOT_DATA, currentPath);

  // Render Breadcrumbs
  renderBreadcrumbs(currentPath);

  els.grid.innerHTML = '';

  if (!currentNode || !currentNode.children || currentNode.children.length === 0) {
    els.grid.innerHTML = '<div id="empty">Nothing here.</div>';
    return;
  }

  // Render Children
  for (const node of currentNode.children) {
    const isDir = node.type === 'dir';
    const template = isDir ? els.tFolder : els.tBook;
    const clone = template.content.firstElementChild.cloneNode(true);

    // Common Data
    const encodedPath = encodeURIComponent(node.path);

    if (isDir) {
      clone.href = `?path=${encodedPath}`;
      clone.querySelector('.folder-name').textContent = prettyName(node.name);
      const img = clone.querySelector('.folder-cover');
      if (node.cover) {
        // If path is root (empty), don't add extra slash
        const basePath = node.path ? `/books/${node.path}` : '/books';
        img.src = `${basePath}/${node.cover}`;
        img.alt = node.name;
      } else {
        if (img) img.remove();
      }
    } else {
      // Book
      clone.href = `/books/${node.path}/index.html`;
      clone.querySelector('.book-title').textContent = node.meta.title || prettyName(node.name);

      const metaStr = [node.meta.author, node.meta.lang].filter(Boolean).join(' · ');
      clone.querySelector('.book-sub').textContent = metaStr;

      // Tags
      if (node.meta.tags) {
        clone.querySelector('.book-tags').textContent = node.meta.tags.map(t => `#${t}`).join(' ');
      }

      // Cover
      const img = clone.querySelector('.book-cover');
      if (node.cover) {
        // If path is root (empty), don't add extra slash
        const basePath = node.path ? `/books/${node.path}` : '/books';
        img.src = `${basePath}/${node.cover}`;
        img.alt = node.name;
      } else {
        img.alt = 'Cover';
      }
    }
    els.grid.appendChild(clone);
  }
}

function renderBreadcrumbs(pathStr) {
  const parts = pathStr.split('/').filter(Boolean);
  let html = `<a href="?">Home</a>`;
  let accum = '';

  parts.forEach((part, index) => {
    accum += (index > 0 ? '/' : '') + part;
    html += ` <span class="sep">/</span> <a href="?path=${encodeURIComponent(accum)}">${prettyName(part)}</a>`;
  });

  els.breadcrumbs.innerHTML = html;
}

function findBookByPath(root, path) {
    if (root.path === path && root.type === 'book') return root;
    if (root.children) {
        for (const child of root.children) {
            const found = findBookByPath(child, path);
            if (found) return found;
        }
    }
    return null;
}

function renderProgress() {
    const savedProgress = localStorage.getItem('reading_progress');
    if (!savedProgress) return;
    
    const progressObj = JSON.parse(savedProgress);
    const paths = Object.keys(progressObj);
    if (paths.length === 0) return;
    
    // Sort paths by timestamp (descending) to find the most recent one
    paths.sort((a, b) => {
        const tsA = progressObj[a].ts || 0;
        const tsB = progressObj[b].ts || 0;
        return tsB - tsA;
    });
    
    const lastPath = paths[0];
    const savedVal = progressObj[lastPath];
    
    // Exact chapter title (e.g. "Intro" or "Chapter 5")
    let chapterDisplay = (typeof savedVal === 'object') ? savedVal.title : `Chapter ${savedVal + 1}`;
    
    // Standardize path to find the book in manifest
    // lastPath looks like "/books/Path/To/index.html"
    // Manifest paths look like "Path/To"
    const manifestPath = lastPath.replace('/books/', '').replace('/index.html', '').replace(/\/$/, '');
    const bookNode = findBookByPath(ROOT_DATA, manifestPath);
    
    // Derived Title
    let bookTitle = 'Unknown Book';
    if (bookNode) {
        bookTitle = bookNode.meta.title || prettyName(bookNode.name);
    } else {
        // Fallback to path extraction if manifest not yet loaded or doesn't match
        const segments = lastPath.split('/').filter(s => s && s !== 'index.html');
        if (segments.length > 0) {
            bookTitle = prettyName(segments[segments.length - 1]);
        }
    }
    
    els.continueReading.innerHTML = `
        <div class="progress-card">
            <div class="progress-info">
                <h3>Continue Reading</h3>
                <p>You were at <strong>${bookTitle}</strong>, ${chapterDisplay}</p>
            </div>
            <div class="progress-actions">
                <a href="${lastPath}" class="resume-btn">Resume Adventure →</a>
                <button onclick="clearProgress()" class="clear-btn" title="Clear all bookmarks">Clear All</button>
            </div>
        </div>
    `;
    els.continueReading.classList.remove('hidden');
}

function clearProgress() {
    localStorage.removeItem('reading_progress');
    els.continueReading.classList.add('hidden');
    els.continueReading.innerHTML = '';
}

const prettyName = s => s.replace(/_/g, ' '); // Simple prettifier

init();
