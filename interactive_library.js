const M = '/books/manifest.json'
const $ = s => document.querySelector(s)
const el = {
  grid: $('#grid'),
  count: $('#count'),
  empty: $('#empty'),
  search: $('#search'),
  crumbs: $('#breadcrumbs'),
  tFolder: $('#tile-folder'),
  tBook: $('#tile-book')
}
let ROOT = { type: 'dir', name: 'books', path: '', children: [] },
  CURRENT = ROOT

const pathFromURL = () => new URLSearchParams(location.search).get('path') || ''
window.addEventListener('keydown', e => {
  if (e.key === '/' && document.activeElement !== el.search) {
    e.preventDefault()
    el.search.focus()
  }
})

init()
async function init () {
  const r = await fetch(M, { cache: 'no-store' })
  ROOT = normalize(await r.json())
  navigate(pathFromURL())
  el.search.addEventListener('input', () => render())
  window.addEventListener('popstate', () => navigate(pathFromURL()))
}

function normalize (n) {
  if (!n) return { type: 'dir', name: 'books', path: '', children: [] }
  if (n.type === 'dir')
    return {
      type: 'dir',
      name: n.name,
      path: n.path || '',
      cover: n.cover || null,
      children: (n.children || []).map(normalize)
    }
  if (n.type === 'book')
    return {
      type: 'book',
      name: n.name,
      path: n.path || '',
      entry: n.entry || 'index.html',
      cover: n.cover || null,
      meta: n.meta || {}
    }
  return n
}

function navigate (p) {
  CURRENT = dive(ROOT, p)
  render()
}
function dive (n, p) {
  return !p
    ? n
    : p
        .split('/')
        .filter(Boolean)
        .reduce((c, k) => (c.children || []).find(x => x.name === k) || c, n)
}

function render () {
  renderCrumbs()
  el.grid.innerHTML = ''
  const items = CURRENT.children || []
  const q = (el.search.value || '').toLowerCase().trim()
  let shown = 0

  for (const n of items) {
    if (n.type === 'dir') {
      if (q && !n.name.toLowerCase().includes(q) && !descMatch(n, q)) continue
      const a = el.tFolder.content.firstElementChild.cloneNode(true)
      a.querySelector('.folder-name').textContent = pretty(n.name)
      const img = a.querySelector('.folder-cover')
      if (n.cover) {
        img.src = `/books/${n.path}/${n.cover}`
        img.alt = `${n.name} cover`
      } else {
        img.remove()
      }
      a.href = '?path=' + encodeURIComponent(n.path ? `${n.path}` : n.name)
      el.grid.appendChild(a)
      shown++
    } else {
      if (q && !bookMatch(n, q)) continue
      const a = el.tBook.content.firstElementChild.cloneNode(true)
      const title = n.meta.title || pretty(n.name)
      a.querySelector('.book-title').textContent = title
      a.querySelector('.book-sub').textContent = [
        n.meta.author,
        n.meta.lang && String(n.meta.lang).toUpperCase()
      ]
        .filter(Boolean)
        .join(' · ')
      a.querySelector('.book-tags').textContent = (n.meta.tags || [])
        .slice(0, 6)
        .map(t => `#${t}`)
        .join(' ')
      const img = a.querySelector('.book-cover')
      if (n.cover) {
        img.src = `/books/${n.path}/${n.cover}`
        img.alt = `${title} cover`
      } else {
        img.alt = 'Cover'
      }
      a.href = `/books/${n.path}/${n.entry}`
      el.grid.appendChild(a)
      shown++
    }
  }
  el.count.textContent = shown
  el.empty.classList.toggle('hidden', shown !== 0)
}

function renderCrumbs () {
  const path = pathFromURL()
  html = `<a href="?">/books</a> <span class="sep">/</span> <a href="?path=${encodeURIComponent(
    path
  )}">${path}</a>`
  el.crumbs.innerHTML = html
}

function descMatch (node, q) {
  let ok = false
  ;(function walk (n) {
    if (ok) return
    if (n.type === 'book' && bookMatch(n, q)) {
      ok = true
      return
    }
    ;(n.children || []).forEach(walk)
  })(node)
  return ok
}
function bookMatch (n, q) {
  const t = (n.meta.title || n.name).toLowerCase(),
    a = (n.meta.author || '').toLowerCase(),
    tags = (n.meta.tags || []).map(s => String(s).toLowerCase()),
    b = (n.meta.blurb || '').toLowerCase()
  return (
    t.includes(q) ||
    a.includes(q) ||
    tags.some(x => x.includes(q)) ||
    b.includes(q)
  )
}
const pretty = s =>
  s.replace(/[_-]+/g, ' ').replace(/\b\w/g, m => m.toUpperCase())
const esc = s =>
  String(s).replace(
    /[&<>"']/g,
    c =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[
        c
      ])
  )
