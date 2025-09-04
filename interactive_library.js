const M='/books/manifest.json';
const el={
  grid:document.getElementById('grid'),
  count:document.getElementById('count'),
  empty:document.getElementById('empty'),
  crumbs:document.getElementById('breadcrumbs'),
  search:document.getElementById('search'),
  tFolder:document.getElementById('tile-folder'),
  tBook:document.getElementById('tile-book')
};
let ROOT={type:'dir',name:'books',path:'',children:[]},CURRENT=ROOT;

const pathFromURL=()=>new URLSearchParams(location.search).get('path')||'';
window.addEventListener('keydown',e=>{if(e.key==='/'&&document.activeElement!==el.search){e.preventDefault();el.search.focus();}});

init();
async function init(){
  const res=await fetch(M,{cache:'no-store'});
  ROOT=normalize(await res.json());
  navigate(pathFromURL());
  el.search.addEventListener('input',()=>render(pathFromURL()));
  window.addEventListener('popstate',()=>navigate(pathFromURL()));
}

function normalize(n){
  if(!n) return {type:'dir',name:'books',path:'',children:[]};
  if(n.type==='dir') return {type:'dir',name:n.name,path:n.path||'',children:(n.children||[]).map(normalize)};
  if(n.type==='book') return {type:'book',name:n.name,path:n.path||'',entry:n.entry||'index.html',cover:n.cover||null,meta:n.meta||{}};
  return n;
}

function navigate(p){CURRENT=dive(ROOT,p);render(p)}
function dive(n,p){
  if(!p) return n;
  return p.split('/').filter(Boolean).reduce((c,part)=>(c.children||[]).find(x=>x.name===part)||c,n);
}

function render(path){
  renderCrumbs(path);
  el.grid.innerHTML='';
  const items=(CURRENT&&CURRENT.children)||[];
  const q=(el.search.value||'').trim().toLowerCase();
  let shown=0;

  for(const n of items){
    if(n.type==='dir'){
      if(q && !n.name.toLowerCase().includes(q) && !hasMatch(n,q)) continue;
      const a=el.tFolder.content.firstElementChild.cloneNode(true);
      a.querySelector('.folder-name').textContent=pretty(n.name);
      a.href=`?path=${encodeURIComponent(n.path?`${n.path}/${n.name}`:n.name)}`;
      el.grid.appendChild(a); shown++;
    }else{
      if(q && !bookMatches(n,q)) continue;
      const a=el.tBook.content.firstElementChild.cloneNode(true);
      const title=n.meta.title||pretty(n.name);
      a.querySelector('.book-title').textContent=title;
      a.querySelector('.book-sub').textContent=[n.meta.author, n.meta.lang&&String(n.meta.lang).toUpperCase()].filter(Boolean).join(' · ');
      a.querySelector('.book-tags').textContent=(n.meta.tags||[]).slice(0,6).map(t=>`#${t}`).join(' ');
      const img=a.querySelector('.book-cover');
      if(n.cover){img.src=`/books/${n.path}/${n.cover}`; img.alt=`${title} cover`;} else {img.alt='Cover';}
      a.href=`/books/${n.path}/${n.entry}`;
      el.grid.appendChild(a); shown++;
    }
  }
  el.count.textContent=shown;
  el.empty.classList.toggle('hidden',shown!==0);
}

function renderCrumbs(path){
  const parts=path.split('/').filter(Boolean);
  let acc=[], html=`<a href="?">/books</a>`;
  for(const p of parts){acc.push(p); html+=` <span class="sep">/</span> <a href="?path=${encodeURIComponent(acc.join('/'))}">${esc(pretty(p))}</a>`;}
  el.crumbs.innerHTML=html;
}

function hasMatch(node,q){
  let ok=false;
  (function walk(n){
    if(ok) return;
    if(n.type==='book'&&bookMatches(n,q)) {ok=true;return;}
    (n.children||[]).forEach(walk);
  })(node);
  return ok;
}

function bookMatches(n,q){
  const t=(n.meta.title||n.name).toLowerCase();
  const a=(n.meta.author||'').toLowerCase();
  const tags=(n.meta.tags||[]).map(x=>String(x).toLowerCase());
  const b=(n.meta.blurb||'').toLowerCase();
  return t.includes(q)||a.includes(q)||tags.some(x=>x.includes(q))||b.includes(q);
}

const pretty=s=>s.replace(/[_-]+/g,' ').replace(/\b\w/g,m=>m.toUpperCase());
const esc=s=>String(s).replace(/[&<>"']/g,c=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
