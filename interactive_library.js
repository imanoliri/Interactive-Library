const MANIFEST_URL = '/books/manifest.json';
const $ = s => document.querySelector(s);
// Standardize elements
const els = {
    grid: $('#grid'),
    breadcrumbs: $('#breadcrumbs'),
    tFolder: $('#tile-folder'),
    tBook: $('#tile-book')
};

let ROOT_DATA = null;

async function init() {
    try {
        const res = await fetch(MANIFEST_URL, { cache: 'no-store' });
        ROOT_DATA = await res.json();
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
            if (img) img.remove(); // Simplified: remove folder cover for now
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

const prettyName = s => s.replace(/_/g, ' '); // Simple prettifier

init();
