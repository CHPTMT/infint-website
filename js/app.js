/*
  INFINT site logic. A small hash router: each page is a function in V
  that returns HTML, and wireView() attaches the page's event handlers.
  Routes: #/  #/work  #/rates  #/book  #/contact  #/about  #/socials
  Content (photos, rates, copy) lives in js/content.js, not here.
  Motion rules are in DESIGN.md.
*/

const S = { filter:"all", lb:{list:[],i:0,label:""}, booking:{}, timers:[], booted:false };
document.documentElement.classList.add("js");
if("scrollRestoration" in history) history.scrollRestoration="manual";

/* Helpers */
const $  = (s,r=document)=>r.querySelector(s);
const $$ = (s,r=document)=>[...r.querySelectorAll(s)];
const esc = s => String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const photo = id => PHOTOS.find(p=>p.id===id);
const money = n => CONFIG.rates.currency + Number(n).toLocaleString("en-ZA");
const num = n => Number(n).toLocaleString("en-ZA");
/* A starting price: "From R1 200" (en-ZA groups thousands with a space) */
const fromPrice = n => `<span class="from">From </span>${money(n)}`;
const minOf = list => Math.min(...list.map(i=>i.price));
const pad2 = n => String(n).padStart(2,"0");
const pad3 = n => String(n).padStart(3,"0");
const thumbPath = id => "assets/thumbs/"+id+".jpg";
const fullPath  = id => "assets/photos/"+id+".jpg";
const RM = matchMedia("(prefers-reduced-motion: reduce)");
const FINE = matchMedia("(hover: hover) and (pointer: fine)");
function toast(msg,bad){const t=$("#toast");t.textContent=msg;t.classList.toggle("bad",!!bad);
  t.classList.add("show");clearTimeout(t._t);t._t=setTimeout(()=>t.classList.remove("show"),3600);}
function waLink(text){return "https://wa.me/"+CONFIG.contact.whatsapp+(text?"?text="+encodeURIComponent(text):"");}
function mailtoLink(subject,body,to){return "mailto:"+(to||CONFIG.contact.email)+"?subject="+encodeURIComponent(subject)+"&body="+encodeURIComponent(body);}
const catName = key => (CATEGORIES.find(c=>c.key===key)||{}).name||"";

/* One photo as an <img>. Thumbs are 720 px wide; full photos are 2000 px on the long side. */
function pic(id,{sizes="(max-width:700px) 50vw, 25vw",eager=false,cls="",alt,thumb=false}={}){
  const p=photo(id)||{r:.667,alt:""};
  const fw=p.r>=1?2000:Math.round(2000*p.r);
  const set=thumb?"":`srcset="${thumbPath(id)} 720w, ${fullPath(id)} ${fw}w" sizes="${sizes}"`; /* thumb: the 720 px file only, for small cards */
  return `<img ${cls?`class="${cls}"`:""} src="${thumbPath(id)}" ${set}
    width="720" height="${Math.round(720/p.r)}" ${eager?'fetchpriority="high"':'loading="lazy"'} decoding="async" alt="${esc(alt??(p.alt||"INFINT photograph"))}">`;
}

const ICON = {
  instagram:'<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none"/></svg>',
  tiktok:'<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M14.5 2h2.8c.2 1.7 1.3 3.2 3.2 3.7v2.9c-1.4 0-2.7-.4-3.8-1.2v6.9c0 3.2-2.6 5.7-5.8 5.7A5.7 5.7 0 0 1 5.2 14.3a5.7 5.7 0 0 1 7.6-5.4v3.1a2.6 2.6 0 1 0 1.7 2.5V2Z"/></svg>',
  youtube:'<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2.5" y="5.5" width="19" height="13" rx="4"/><path d="M10.5 9.3v5.4l4.6-2.7-4.6-2.7Z" fill="currentColor" stroke="none"/></svg>',
  link:'<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9.5 14.5 14.5 9.5"/><path d="M11 6.5 12.6 4.9a3.6 3.6 0 0 1 5.1 5.1L16.1 11.6"/><path d="M13 17.5 11.4 19.1a3.6 3.6 0 0 1-5.1-5.1l1.6-1.6"/></svg>',
  whatsapp:'<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.4A10 10 0 1 0 12 2Zm0 18.2a8.1 8.1 0 0 1-4.2-1.2l-.3-.2-3.1.8.8-3-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.6-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1s-.7.8-.9 1c-.2.2-.3.2-.6.1a6.7 6.7 0 0 1-2-1.2 7.4 7.4 0 0 1-1.4-1.7c-.1-.2 0-.4.1-.5l.4-.4.2-.4v-.4c-.1-.1-.6-1.5-.8-2-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2c0 1.3.9 2.6 1.1 2.8.1.2 2 3 4.8 4.2.7.3 1.2.5 1.6.6.7.2 1.3.2 1.8.1.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3Z"/></svg>',
  mail:'<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="m4 7 8 6 8-6"/></svg>',
  phone:'<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6.5 3.5h3l1.5 4-2 1.5a11 11 0 0 0 5.5 5.5l1.5-2 4 1.5v3c0 1-1 1.5-1.8 1.4A16.5 16.5 0 0 1 5.1 5.3c-.1-.8.4-1.8 1.4-1.8Z"/></svg>',
  pin:'<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21Z"/><circle cx="12" cy="9.5" r="2.5"/></svg>',
  out:'<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7M9 7h8v8"/></svg>',
  go:'<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>'
};
const ARR = '<span class="arr" aria-hidden="true"></span>';
function iconLink(key,url,label,newTab){
  return `<a href="${esc(url)}" ${newTab?'target="_blank" rel="noopener"':""}><span aria-hidden="true" style="display:inline-flex;flex:none">${ICON[key]||""}</span><span>${esc(label)}</span></a>`;
}

/* Shared building blocks */
function pageHead(title,sub,extra=""){
  return `<section class="page-head glow" style="--gx:78%;--gy:10%"><div class="gridlines" aria-hidden="true"></div><div class="wrap">
    <h1 class="display rv">${title}</h1>
    ${sub?`<p class="lede rv" style="--d:.08s">${esc(sub)}</p>`:""}${extra}
  </div></section>`;
}
/* Photo grid. The tiles are sorted into real columns by layoutMasonry() (CSS multi-column made
   the first photo of a column vanish on iPhones). The lift moves .tile-in, never the observed .tile. */
function tileGrid(ids){
  return `<div class="masonry">${ids.filter(photo).map((id,i)=>{
    const p=photo(id);
    return `<figure class="tile rv" data-id="${id}" data-i="${i}" data-r="${p.r}" tabindex="0" role="button" aria-label="Open photo: ${esc(p.alt||"INFINT photograph")}">
      <div class="tile-in">${pic(id,{sizes:"(max-width:700px) 50vw, (max-width:1100px) 33vw, (max-width:1440px) 25vw, 20vw"})}
      <figcaption class="cap">${esc(catName(p.cat))}</figcaption></div></figure>`;}).join("")}</div>`;
}
const MASONRY_COLS = w => w>=1800?6:w>=1280?5:w>1100?4:w>700?3:2;
function layoutMasonry(){
  $$(".masonry").forEach(m=>{
    const n=MASONRY_COLS(innerWidth);
    if(Number(m.dataset.cols)===n) return;
    const tiles=$$(".tile",m).sort((a,b)=>a.dataset.i-b.dataset.i);
    const cols=Array.from({length:n},()=>{const c=document.createElement("div");c.className="mcol";return c;});
    const h=new Array(n).fill(0);
    /* Each photo goes to the shortest column, so the order reads left to right */
    tiles.forEach(t=>{const k=h.indexOf(Math.min(...h)); cols[k].appendChild(t); h[k]+=1/(Number(t.dataset.r)||.667)+.06;});
    m.replaceChildren(...cols); m.dataset.cols=n;
  });
}
let masonryT;
addEventListener("resize",()=>{clearTimeout(masonryT);masonryT=setTimeout(layoutMasonry,120);});
function ctaBlock(){
  return `<section class="section pt0"><div class="wrap"><div class="cta rv">
    <h2>Let's put your date in the diary.</h2>
    <div><p>Tell me what you are shooting and when. You will get a written quote and a hold on the date within 24 hours.</p>
    <div class="actions">
      <a class="btn inky magnetic" href="#/book">Start a booking ${ARR}</a>
      <a class="btn ghost" href="${waLink("Hi Tshedza, I'd like to book a shoot.")}" target="_blank" rel="noopener">WhatsApp</a>
    </div></div></div></div></section>`;
}
const SOCIALS = [
  {key:"instagram",plat:"Instagram",handle:"@infint_co",url:()=>CONFIG.social.instagram,note:"INFINT on Instagram. Photos from shoots."},
  {key:"tiktok",plat:"TikTok",handle:"@infint_co",url:()=>CONFIG.social.tiktok,note:"INFINT on TikTok. Short videos from shoots."},
  {key:"youtube",plat:"YouTube",handle:"@tshedza_tt",url:()=>CONFIG.social.youtube,note:"Tshedza on YouTube. Longer videos."}
];
function socialCards(){
  return `<div class="socials">${SOCIALS.map((s,i)=>`<a class="soc rv" style="--d:${i*.08}s" href="${esc(s.url())}" target="_blank" rel="noopener" aria-label="${s.plat} ${s.handle} (opens in a new tab)">
      ${pic(PAGE_PHOTOS.socials[s.key],{thumb:true,alt:""})}
      <span class="ico" aria-hidden="true">${ICON[s.key]}</span>
      <span class="plat">${s.plat}</span>
      <span class="handle">${s.handle}</span>
      <p>${esc(s.note)}</p>
      <span class="btn light sm">Open ${s.plat} ${ARR}</span>
    </a>`).join("")}</div>`;
}

/* "Everything" view: take one photo from each category in turn so the wall reads as a mix. */
function mixed(){
  const lists=CATEGORIES.map(c=>PHOTOS.filter(p=>p.cat===c.key).map(p=>p.id));
  const out=[]; for(let i=0;out.length<PHOTOS.length&&i<PHOTOS.length;i++) lists.forEach(l=>{if(l[i])out.push(l[i]);});
  PHOTOS.forEach(p=>{if(!out.includes(p.id))out.push(p.id);});
  return out;
}

/* Hero and strip photos: chosen once per page load, so they change between visits but not while browsing */
const shuffle = list => { const a=[...list]; for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];} return a; };
const PICK = (()=>{
  const slides=HOME.slides.map(s=>({word:s.word,id:shuffle(s.pool.filter(photo))[0]})).filter(s=>s.id);
  const used=new Set(slides.map(s=>s.id));
  /* Round robin over the categories in one shuffled order: neighbours always differ. 12 per row is not a multiple of 7,
     so the join where each strip loops back to its start differs too. */
  const cats=shuffle(Object.keys(HOME.strips));
  const pools=Object.fromEntries(cats.map(k=>[k,shuffle(HOME.strips[k].filter(id=>photo(id)&&!used.has(id)))]));
  const seq=[];
  for(let round=0;seq.length<24&&round<30;round++) cats.forEach(k=>{const id=pools[k][round]; if(id&&seq.length<24) seq.push(id);});
  return {slides, strips:[seq.slice(0,12),seq.slice(12)]};
})();

/* Pages */
const V = {};

V.home = () => {
  const r=CONFIG.rates, sl=PICK.slides;
  return `
  <section class="hero" style="--slide:6.5s">
    <div class="hero-photo" id="hero-photo">
      ${sl.map((s,i)=>{const p=photo(s.id), fw=Math.round(2000*Math.min(p.r,1));
        return `<div class="slide ${i===0?"on":""}" data-word="${esc(s.word)}">
          <img ${i===0?`src="${thumbPath(s.id)}" srcset="${thumbPath(s.id)} 720w, ${fullPath(s.id)} ${fw}w" fetchpriority="high"`:`data-src="${thumbPath(s.id)}" data-srcset="${thumbPath(s.id)} 720w, ${fullPath(s.id)} ${fw}w"`}
            sizes="(max-width:960px) 100vw, 56vw" width="720" height="${Math.round(720/p.r)}" decoding="async" alt="${esc(p.alt||"INFINT photograph")}"></div>`;}).join("")}
      <div class="hero-dots" role="group" aria-label="Choose a photo">${sl.map((s,i)=>`<button type="button" class="${i===0?"on":""}" data-go="${i}" aria-label="Show ${esc(s.word)} photo"></button>`).join("")}</div>
      <div class="hero-word" aria-hidden="true">
        <span class="mega" id="hero-word"><span>${esc(sl[0].word)}</span></span>
        <span class="hero-count" id="hero-count"><b>01</b> / ${pad2(sl.length)}</span>
      </div>
    </div>
    <div class="hero-panel">
      <div class="mesh" aria-hidden="true"><i></i><i></i><i></i></div>
      <div class="gridlines" aria-hidden="true"></div>
      <div class="hero-meta label"><span>Photography</span><span>${esc(CONFIG.brand.city)}, ZA</span></div>
      <div>
        <h1>Your day, shot properly.</h1>
        <p class="lede">${esc(CONFIG.brand.intro)}</p>
        <div class="actions">
          <a class="btn magnetic" href="#/book">Book a shoot ${ARR}</a>
          <a class="btn ghost" href="#/work">See the work</a>
        </div>
      </div>
      <div class="specs">
        <div><span class="mega">JHB</span><span class="label">Home base</span></div>
        <div><span class="mega">${CATEGORIES.length}</span><span class="label">Kinds of work</span></div>
        <div><span class="mega">24<sup>H</sup></span><span class="label">To a written quote</span></div>
      </div>
    </div>
  </section>

  <section class="marquee" aria-label="A moving strip of recent photos">
    ${PICK.strips.map((row,ri)=>{const ok=row;
      const cell=(id,dup)=>`<a href="#/work?f=${photo(id).cat}" ${dup?'tabindex="-1" aria-hidden="true"':""}>${pic(id,{thumb:true,alt:dup?"":undefined})}</a>`;
      return `<div class="mq-track ${ri%2?"rev":""}">${ok.map(id=>cell(id,0)).join("")}${ok.map(id=>cell(id,1)).join("")}</div>`;}).join("")}
  </section>

  <section class="section"><div class="wrap wide">
    <div class="head-row">
      <h2 class="h2 rv">Seven kinds of work.</h2>
      <p class="lede rv" style="--d:.08s">Done the same way every time: a shot list ahead of time, a fast-moving shoot, and delivery on the day I said I would.</p>
    </div>
    <div class="cats">
      ${CATEGORIES.map((c,i)=>`<a class="cat rv" style="--d:${(i%5)*.06}s" href="#/work?f=${c.key}">
        ${pic(c.cover,i===0?{sizes:"(max-width:1200px) 360px, 40vw",alt:""}:{thumb:true,alt:""})}
        <span class="meta"><span><h3>${esc(c.name)}</h3><p>${esc(c.blurb)}</p></span></span>
      </a>`).join("")}
    </div>
  </div></section>

  <section class="section pt0"><div class="wrap wide">
    <div class="head-row">
      <h2 class="h2 rv">Recent frames.</h2>
      <a class="link rv" href="#/work">Full portfolio ${ICON.go}</a>
    </div>
    ${tileGrid(HOME.featured)}
  </div></section>

  <section class="feature">
    <div class="feature-photo">
      ${pic(HOME.ratesPhoto,{sizes:"(max-width:900px) 100vw, 50vw",cls:"px",alt:""})}
      <div class="over"><span class="label">Graduation shoots</span><span class="mega">${fromPrice(minOf(r.grads.items))}</span></div>
    </div>
    <div class="feature-body glow">
      <div class="gridlines" aria-hidden="true"></div>
      <h2 class="h2 rv">Clear prices, before you book.</h2>
      <p class="lede rv">Every price includes editing and delivery by download link. Prices hold for the ${esc(r.updated)} season.</p>
      <div class="pricelist rv">
        <a href="#/rates?s=grads"><span><strong>Graduation packages</strong><small>${r.grads.items.length} packages, ${esc(r.grads.items[0].dur)} to ${esc(r.grads.items[r.grads.items.length-1].dur)}</small></span><span class="mega">${fromPrice(minOf(r.grads.items))}</span><span class="go">${ICON.go}</span></a>
        <a href="#/rates?s=short"><span><strong>Short shoots</strong><small>Portraits, headshots, prom</small></span><span class="mega">${fromPrice(minOf(r.short.items))}</span><span class="go">${ICON.go}</span></a>
        <a href="#/rates?s=day"><span><strong>Events and day rates</strong><small>${parseInt(r.day.items[0].hours)} to ${esc(r.day.items[r.day.items.length-1].hours)} of coverage</small></span><span class="mega">${fromPrice(minOf(r.day.items))}</span><span class="go">${ICON.go}</span></a>
      </div>
      <div class="rv"><a class="btn ghost" href="#/rates">See all rates ${ARR}</a></div>
    </div>
  </section>

  <section class="section"><div class="wrap">
    <div class="head-row"><h2 class="h2 rv">How a booking works.</h2></div>
    <ol class="steps-row" style="list-style:none;margin:0;padding:0">
      ${CONFIG.howItWorks.map(([t,d],i)=>`<li class="step rv" style="--d:${i*.08}s">
        <span class="mega" aria-hidden="true">${pad2(i+1)}</span><h3 class="h3">${esc(t)}</h3><p>${esc(d)}</p></li>`).join("")}
    </ol>
  </div></section>

  <section class="section pt0"><div class="wrap">
    <div class="head-row">
      <h2 class="h2 rv">Follow along.</h2>
      <a class="link rv" href="#/socials">All socials ${ICON.go}</a>
    </div>
    ${socialCards()}
  </div></section>
  ${ctaBlock()}`;
};

V.work = (q) => {
  const cat = CATEGORIES.find(c=>c.key===q.f);
  S.filter = cat ? cat.key : "all";
  /* Categories are chosen from the menu; this button opens it */
  const pick = `<p class="rv" style="--d:.14s;margin:22px 0 0"><button type="button" class="link" data-open-menu>${cat?"Other categories":"Choose a category"} ${ICON.go}</button></p>`;
  return `
  ${cat ? pageHead(esc(cat.name)+".",cat.blurb,pick)
        : pageHead("The work.","Events, portraits, proms, match days, fashion and the small details in between. All from real shoots.",pick)}
  <section class="work-grid pt0"><div class="wrap wide" id="work-grid">${workGrid(S.filter)}</div></section>
  ${ctaBlock()}`;
};
function workGrid(f){
  return tileGrid(f==="all" ? mixed() : PHOTOS.filter(p=>p.cat===f).map(p=>p.id));
}

V.rates = () => {
  const r=CONFIG.rates;
  const travel=r.addons.find(a=>/travel/i.test(a.name));
  const price = n => `<span class="cur">${esc(r.currency)}</span>${num(n)}`;
  return `
  ${pageHead(`Rates for ${esc(r.updated)}.`,"Everything below includes editing and delivery by download link. Prices hold for the "+r.updated+" season.")}

  <section class="section pt0" id="grads"><div class="wrap">
    <div class="head-row">
      <div class="rv"><h2 class="h2">${esc(r.grads.title)}</h2><p class="mega startp">${fromPrice(minOf(r.grads.items))}</p></div>
      <p class="lede rv" style="--d:.08s">${esc(r.grads.note)}</p>
    </div>
    <div class="pkgs">
      ${r.grads.items.map((p,i)=>`<div class="pkg rv ${p.feature?"featured":""}" style="--d:${i*.08}s">
        <div class="top"><span class="name">${esc(p.name)}</span>${p.feature?'<span class="badge">Most booked</span>':`<span class="label">${esc(p.dur)}</span>`}</div>
        <div class="mega">${price(p.price)}</div>
        <div class="sub">${p.feature?esc(p.dur)+", ":""}${esc(p.images)}</div>
        <ul>${p.includes.map(i=>`<li><span>${esc(i)}</span></li>`).join("")}</ul>
        <a class="btn ${p.feature?"magnetic":"ghost"}" href="#/book?service=graduation&pkg=${encodeURIComponent(p.name)}">Book ${esc(p.name)} ${ARR}</a>
      </div>`).join("")}
    </div>
  </div></section>

  <section class="section pt0"><div class="wrap grid g2" style="align-items:start">
    <div class="panel rv" id="short">
      <h2>${esc(r.short.title)}</h2>
      <p class="mega startp">${fromPrice(minOf(r.short.items))}</p>
      <p class="lede">${esc(r.short.note)}</p>
      <div class="ratelist">${r.short.items.map(i=>`<div class="row"><span class="k">${esc(i.dur)}</span><span class="d">${esc(i.images)}</span><span class="mega">${money(i.price)}</span></div>`).join("")}</div>
      <div class="form-actions"><a class="btn ghost" href="#/book?service=portrait">Book a short shoot ${ARR}</a></div>
    </div>
    <div class="panel rv" id="day" style="--d:.08s">
      <h2>${esc(r.day.title)}</h2>
      <p class="mega startp">${fromPrice(minOf(r.day.items))}</p>
      <p class="lede">${esc(r.day.note)}</p>
      <div class="ratelist">${r.day.items.map(i=>`<div class="row one"><span class="k">${esc(i.hours)}</span><span class="mega">${money(i.price)}</span></div>`).join("")}
        <div class="row"><span class="k">Each additional hour</span><span class="d">Maximum ${r.day.overtimeMax} hours on any single day</span><span class="mega">${money(r.day.overtime)}</span></div></div>
      <div class="form-actions"><a class="btn ghost" href="#/book?service=event">Book a day ${ARR}</a></div>
    </div>
  </div></section>

  <section class="section pt0" id="addons"><div class="wrap">
    <div class="head-row"><h2 class="h2 rv">Add-ons.</h2></div>
    <div class="addons">
      ${r.addons.map((a,i)=>`<div class="addon rv" style="--d:${(i%3)*.06}s">
        <span><strong>${esc(a.name)}</strong><p>${esc(a.note)}</p></span>
        <span class="pr"><span class="mega">${money(a.price)}</span><small>${esc(a.unit)}</small></span>
      </div>`).join("")}
    </div>
  </div></section>

  <section class="section pt0" id="estimate"><div class="wrap">
    <div class="estimator glow rv">
      <div class="gridlines" aria-hidden="true"></div>
      <div>
        <h2>Estimate a day rate.</h2>
        <p class="lede" style="margin-top:14px;font-size:1rem">Rough working figure for events, weddings and corporate days. The written quote is what counts.</p>
        <div class="fields">
          <div class="field" style="margin:0"><label for="q-hours">Hours of coverage</label>
            <select class="input" id="q-hours">${r.day.items.map(i=>`<option value="${i.price}">${esc(i.hours)}</option>`).join("")}</select></div>
          <div class="grid g2">
            <div class="field" style="margin:0"><label for="q-km">Travel (km, one way)</label>
              <input class="input" id="q-km" type="number" min="0" inputmode="numeric" value="0"></div>
            <div class="field" style="margin:0"><label for="q-2nd">Second shooter</label>
              <select class="input" id="q-2nd"><option value="0">No</option><option value="${r.addons[0].price}">Yes</option></select></div>
          </div>
        </div>
      </div>
      <div class="out" aria-live="polite">
        <span class="label">Working estimate</span>
        <span class="mega" id="q-out"></span>
        <p class="hint">Travel is free within 15 km of Braamfontein, then ${money(travel?travel.price:0)} per kilometre.</p>
        <a class="btn magnetic" style="margin-top:20px" href="#/book?service=event">Book this day ${ARR}</a>
      </div>
    </div>
  </div></section>
  ${ctaBlock()}`;
};

const BOOK_STEPS = ["The shoot","Your details","Review and send"];
V.book = (q,o={}) => {
  const b=S.booking;
  /* A link like #/book?service=event picks the shoot type on arrival; later step changes keep what the visitor chose. */
  if(!o.keepScroll && q.service){ if(b.service!==q.service){b.service=q.service;b.step=1;} if(q.pkg)b.pkg=q.pkg; }
  const step=b.step||1;
  const opts=(list,cur)=>list.map(h=>`<option ${cur===h?"selected":""}>${h}</option>`).join("");
  return `
  <section class="split-page">
    <div class="split-photo">
      ${pic(PAGE_PHOTOS.book[step-1]||PAGE_PHOTOS.book[0],{sizes:"(max-width:960px) 100vw, 45vw",eager:true,alt:""})}
      <div class="over" aria-hidden="true">
        <span class="mega">${pad2(step)}<small>/03</small></span>
        <div class="h3">${esc(BOOK_STEPS[step-1])}</div>
      </div>
    </div>
    <div class="split-body glow"><div class="gridlines" aria-hidden="true"></div><div class="inner">
      <h1>Book a shoot.</h1>
      <p class="lede">No payment here. Send the details, get a quote, then confirm the date.</p>
      <div class="stepper" id="stepper">
        ${BOOK_STEPS.map((t,i)=>`<div class="${step===i+1?"on":step>i+1?"done":""}"><b>${pad2(i+1)}</b>${esc(t)}</div>`).join("")}
      </div>
      <form id="bookform" novalidate>
      <div data-step="1" style="${step===1?"":"display:none"}">
        <div class="field"><span class="lbl" id="l-service">What are we shooting <span class="req">*</span></span>
          <div class="optrow" role="group" aria-labelledby="l-service">${CONFIG.services.map(s=>`<button type="button" class="opt ${b.service===s.slug?"on":""}" data-set="service" data-val="${s.slug}" aria-pressed="${b.service===s.slug}">
            <strong>${esc(s.name)}</strong><span>${esc(s.blurb)}</span></button>`).join("")}</div>
          <div class="err" id="e-service">Choose the type of shoot.</div></div>
        <div class="grid g2">
          <div class="field"><label for="b-date">Date <span class="req">*</span></label>
            <input class="input" id="b-date" type="date" name="date" value="${esc(b.date||"")}"><div class="err" id="e-date">Pick a date.</div></div>
          <div class="field"><label for="b-time">Start time</label>
            <input class="input" id="b-time" type="time" name="time" value="${esc(b.time||"")}"></div>
        </div>
        <div class="grid g2">
          <div class="field"><label for="b-hours">Hours of coverage</label>
            <select class="input" id="b-hours" name="hours">${opts(["Under 1 hour","1 to 2 hours","3 hours","4 hours","5 hours","6 hours","7 hours","8 hours","More than 8 hours","Not sure yet"],b.hours)}</select></div>
          <div class="field"><label for="b-pkg">Package (if you know it)</label>
            <input class="input" id="b-pkg" name="pkg" placeholder="e.g. The Signature" value="${esc(b.pkg||"")}"></div>
        </div>
        <div class="field"><label for="b-location">Location or venue <span class="req">*</span></label>
          <input class="input" id="b-location" name="location" placeholder="Campus, venue name, suburb" value="${esc(b.location||"")}">
          <div class="err" id="e-location">Where are we shooting?</div></div>
        <div class="field"><label for="b-notes">Anything I should know</label>
          <textarea class="input" id="b-notes" name="notes" placeholder="Shot list, family members joining, timings, references, budget">${esc(b.notes||"")}</textarea></div>
        <div class="form-actions"><button type="button" class="btn magnetic" data-go="2">Continue ${ARR}</button></div>
      </div>

      <div data-step="2" style="${step===2?"":"display:none"}">
        <div class="grid g2">
          <div class="field"><label for="b-name">Full name <span class="req">*</span></label>
            <input class="input" id="b-name" name="name" autocomplete="name" value="${esc(b.name||"")}"><div class="err" id="e-name">I need a name for the agreement.</div></div>
          <div class="field"><label for="b-phone">Mobile number <span class="req">*</span></label>
            <input class="input" id="b-phone" name="phone" type="tel" autocomplete="tel" placeholder="+27" value="${esc(b.phone||"")}"><div class="err" id="e-phone">A reachable number, please.</div></div>
        </div>
        <div class="grid g2">
          <div class="field"><label for="b-email">Email <span class="req">*</span></label>
            <input class="input" id="b-email" name="email" type="email" autocomplete="email" value="${esc(b.email||"")}"><div class="err" id="e-email">Check the email address.</div></div>
          <div class="field"><label for="b-handle">Instagram or TikTok handle</label>
            <input class="input" id="b-handle" name="handle" placeholder="@" value="${esc(b.handle||"")}"></div>
        </div>
        <div class="grid g2">
          <div class="field"><label for="b-billing">Billing name for the invoice</label>
            <input class="input" id="b-billing" name="billing" placeholder="Person or company" value="${esc(b.billing||"")}">
            <p class="hint">Only needed if the invoice goes to someone other than you.</p></div>
          <div class="field"><label for="b-source">How did you hear about INFINT</label>
            <select class="input" id="b-source" name="source">${opts(["Instagram","TikTok","A friend","Saw you at a shoot","Google","Other"],b.source)}</select></div>
        </div>
        <div class="hp" aria-hidden="true"><label>Company<input name="company" tabindex="-1" autocomplete="off"></label></div>
        <div class="notice">Your details are used to prepare a quote and, if you go ahead, a booking agreement. They are not shared with anyone else.</div>
        <div class="form-actions"><button type="button" class="btn ghost" data-go="1">Back</button>
          <button type="button" class="btn magnetic" data-go="3">Review ${ARR}</button></div>
      </div>

      <div data-step="3" style="${step===3?"":"display:none"}">
        <div id="review"></div>
        <div class="notice" style="margin:24px 0 0">${esc(CONFIG.booking.terms)}</div>
        <div class="form-actions"><button type="button" class="btn ghost" data-go="2">Back</button>
          <button type="submit" class="btn magnetic" id="sendbtn">Send enquiry ${ARR}</button>
          <a class="btn ghost" id="wabtn" target="_blank" rel="noopener" href="${waLink("Hi Tshedza, I'd like to book a shoot.")}">Send on WhatsApp instead</a>
          <a class="btn ghost" id="mailbtn" href="mailto:${esc(CONFIG.contact.bookings)}">Send by email instead</a></div>
      </div>
      </form>
      <div id="booked" style="display:none"></div>
    </div></div>
  </section>`;
};

V.contact = () => {
  const c=CONFIG.contact, so=CONFIG.social;
  const row=(icon,k,v,href,newTab)=>`<a href="${esc(href)}" ${newTab?'target="_blank" rel="noopener"':""}><span class="k">${ICON[icon]}${esc(k)}</span><span class="v">${esc(v)}</span><span class="go" aria-hidden="true">${ICON.out}</span></a>`;
  return `
  <section class="split-page">
    <div class="split-photo">
      ${pic(PAGE_PHOTOS.contact,{sizes:"(max-width:960px) 100vw, 45vw",eager:true,alt:""})}
      <div class="over" aria-hidden="true"><span class="mega">Say hi.</span></div>
    </div>
    <div class="split-body glow"><div class="gridlines" aria-hidden="true"></div><div class="inner">
      <h1>Get in touch.</h1>
      <p class="lede">Message, call or email. For a booking, the booking form gets you a quote fastest because it has everything I need.</p>
      <div class="contact-list">
        ${row("whatsapp","WhatsApp",c.phone,waLink("Hi Tshedza,"),1)}
        ${row("phone","Phone",c.phone,"tel:"+c.phone.replace(/\s/g,""))}
        ${row("mail","Email",c.email,"mailto:"+c.email)}
        ${row("mail","Direct email",c.direct,"mailto:"+c.direct)}
        ${row("instagram","Instagram","@infint_co",so.instagram,1)}
        ${row("tiktok","TikTok","@infint_co",so.tiktok,1)}
        ${row("youtube","YouTube","@tshedza_tt",so.youtube,1)}
        ${row("link","Everything else","linktr.ee/tshedzatt",so.linktree,1)}
        <div class="static"><span class="k">${ICON.pin}Based in</span><span class="v">${esc(CONFIG.brand.city)}, shooting Gauteng and beyond</span><span></span></div>
      </div>
      <div class="form-actions">
        <a class="btn magnetic" href="#/book">Booking enquiry ${ARR}</a>
        <a class="btn ghost" href="${waLink("Hi Tshedza,")}" target="_blank" rel="noopener">WhatsApp</a>
      </div>
      <div class="form-card">
        <h2>Send a message.</h2>
        <form id="contactform">
          <div class="grid g2">
            <div class="field"><label for="cf-name">Name <span class="req">*</span></label><input class="input" id="cf-name" name="name" autocomplete="name" required></div>
            <div class="field"><label for="cf-contact">Email or number <span class="req">*</span></label><input class="input" id="cf-contact" name="contact" required></div>
          </div>
          <div class="field"><label for="cf-message">Message <span class="req">*</span></label><textarea class="input" id="cf-message" name="message" required></textarea></div>
          <div class="hp" aria-hidden="true"><label>Company<input name="company" tabindex="-1" autocomplete="off"></label></div>
          <div class="form-actions">
            <button class="btn magnetic" type="submit">Send message ${ARR}</button>
            <a class="btn ghost" id="cf-mailto" href="mailto:${esc(c.email)}">Open in email instead</a>
          </div>
        </form>
        <p class="hint" id="cf-note" style="margin-top:14px"></p>
      </div>
    </div></div>
  </section>`;
};

V.about = () => `
  ${pageHead(`Behind the camera.`,"")}
  <section class="section pt0"><div class="wrap">
    <div class="about-block rv">
      <div class="about-copy">
        <div class="who"><img src="assets/brand/infint-wordmark-ink-transparent.png" width="867" height="165" alt="INFINT"></div>
        <p>${esc(CONFIG.brand.intro)}</p>
        <p>INFINT is run by ${esc(CONFIG.brand.owner)} out of ${esc(CONFIG.brand.city)}. What started with graduation shoots grew into events, sport, fashion and brand work, same approach every time: show up prepared, move at a good pace, and get the photos back before the day is old news.</p>
        <div class="tagcloud">${CONFIG.aboutTags.map(t=>`<span class="tag">${esc(t)}</span>`).join("")}</div>
      </div>
      <div class="about-photo"><img src="assets/photos/about-tshedza.jpg" width="1333" height="2000" alt="Tshedza Tshiololi, INFINT" loading="lazy"></div>
    </div>
  </div></section>

  <section class="section pt0"><div class="wrap">
    <div class="head-row"><h2 class="h2 rv">Before your shoot.</h2></div>
    <div class="prep">
      ${CONFIG.prep.map((p,i)=>`<div class="rv" style="--d:${i*.07}s"><h3 class="h3">${esc(p.t)}</h3><p>${esc(p.d)}</p></div>`).join("")}
    </div>
  </div></section>

  <section class="section pt0"><div class="wrap">
    <div class="faq-wrap">
      <div class="side"><h2 class="h2 rv">Questions<span class="amber">.</span></h2>
        <p class="lede rv">Anything not covered here, ask on <a class="link" href="${waLink("Hi Tshedza, I have a question.")}" target="_blank" rel="noopener">WhatsApp</a> or by <a class="link" href="mailto:${esc(CONFIG.contact.email)}">email</a>.</p></div>
      <div id="faq">
        ${CONFIG.faq.map((f,i)=>`<div class="acc"><button type="button" aria-expanded="false" aria-controls="faq-${i}" id="faq-b-${i}">${esc(f.q)}<span class="pm" aria-hidden="true"></span></button>
          <div class="body" id="faq-${i}" role="region" aria-labelledby="faq-b-${i}"><div><p>${esc(f.a)}</p></div></div></div>`).join("")}
      </div>
    </div>
  </div></section>
  ${ctaBlock()}`;

V.socials = () => `
  ${pageHead(`Follow the work.`,"Find INFINT on Instagram and TikTok, and Tshedza on YouTube.")}
  <section class="section pt0"><div class="wrap">
    ${socialCards()}
    <div class="linkrow rv"><p><strong>Everything in one place.</strong> All of the links above, plus anything new, on Linktree.</p>
      <a class="btn ghost" href="${esc(CONFIG.social.linktree)}" target="_blank" rel="noopener">linktr.ee/tshedzatt ${ARR}</a></div>
  </div></section>
  ${ctaBlock()}`;

/* Router */
const TITLES = {work:"Work",rates:"Rates",book:"Book a shoot",contact:"Contact",about:"About",socials:"Socials"};
function parseHash(){
  const h=(location.hash||"#/").slice(1);
  const [path,qs]=h.split("?");
  const parts=path.split("/").filter(Boolean);
  const q={}; new URLSearchParams(qs||"").forEach((v,k)=>q[k]=v);
  return {route:parts[0]||"home",q};
}
function paint(opts={}){
  const {route,q}=parseHash();
  const page = V[route] ? route : "home";
  S.timers.forEach(t=>clearInterval(t)); S.timers=[];
  const app=$("#app");
  app.innerHTML=V[page](q,opts);
  const token=S.paintId=(S.paintId||0)+1;
  document.title = TITLES[page] ? TITLES[page]+" · Infint" : "Infint";
  markNav(page);
  setMenu(false);
  if(opts.keepScroll){ const st=$("#stepper"); if(st) window.scrollTo(0,Math.max(0,st.getBoundingClientRect().top+scrollY-120)); }
  else if(q.s && document.getElementById(q.s)){
    /* Jump to a section (#/rates?s=day). Checked again shortly after, in case the page transition moved the scroll. */
    const go=()=>{ if(token!==S.paintId) return; const el=document.getElementById(q.s); if(!el) return;
      const y=Math.max(0,Math.round(el.getBoundingClientRect().top+scrollY-90)); if(Math.abs(scrollY-y)>4) window.scrollTo(0,y); };
    go(); requestAnimationFrame(go); setTimeout(go,400);
  }
  else window.scrollTo(0,0);
  wireView(page,q);
  observeReveal();
  onScroll();
}
/* A skipped transition (a second click before the first finishes) is harmless, so its promise rejections are ignored. */
function viewTransition(fn){ const vt=document.startViewTransition(fn); [vt.ready,vt.finished,vt.updateCallbackDone].forEach(p=>p&&p.catch(()=>{})); }
function render(opts={}){
  /* Route changes cross-fade with the View Transitions API where the browser has it. */
  if(S.booted && document.startViewTransition && !RM.matches){ viewTransition(()=>paint(opts)); }
  else { paint(opts); if(S.booted && !RM.matches){const app=$("#app");app.classList.remove("page-in");void app.offsetWidth;app.classList.add("page-in");} }
  S.booted=true;
}
window.addEventListener("hashchange",()=>render());

/* Reveal on scroll. Items that enter together are staggered; classes are removed afterwards so hover transitions stay quick. */
let revealIO;
function observeReveal(){
  const els=$$(".rv,.step");
  if(!("IntersectionObserver" in window)){els.forEach(e=>e.classList.add("in"));return;}
  if(revealIO) revealIO.disconnect();
  revealIO=new IntersectionObserver(es=>{
    let n=0;
    es.filter(e=>e.isIntersecting).forEach(e=>{
      const el=e.target; revealIO.unobserve(el);
      if(el.classList.contains("tile")){ el.style.setProperty("--d",Math.min(n++,10)*.05+"s"); }
      el.classList.add("in");
      if(el.classList.contains("rv")) setTimeout(()=>{el.classList.remove("rv","in");el.style.removeProperty("--d");},1300+(parseFloat(getComputedStyle(el).getPropertyValue("--d"))||0)*1000);
    });
  },{threshold:.08,rootMargin:"0px 0px -6% 0px"});
  els.forEach(e=>revealIO.observe(e));
}

/* Touch screens have no hover: lift the photo that sits in the middle of the screen. */
let liftIO;
function observeLift(){
  if(FINE.matches || !("IntersectionObserver" in window)) return;
  if(liftIO) liftIO.disconnect();
  liftIO=new IntersectionObserver(es=>es.forEach(e=>e.target.classList.toggle("lift",e.isIntersecting)),{rootMargin:"-46% 0px -46% 0px"});
  $$(".tile").forEach(t=>liftIO.observe(t));
}

/* Header turns solid once you scroll; large photos drift slightly against the scroll on desktop. */
let ticking=false;
function onScroll(){
  $("#hdr").classList.toggle("solid",scrollY>30);
  if(RM.matches||!FINE.matches||innerWidth<900) return;
  const vh=innerHeight;
  $$(".px").forEach(img=>{
    const box=img.parentElement.getBoundingClientRect();
    if(box.bottom<0||box.top>vh) return;
    const p=((box.top+box.height/2)-vh/2)/(vh/2+box.height/2);
    img.style.transform=`translate3d(0,${(p*box.height*.06).toFixed(1)}px,0)`;
  });
}
addEventListener("scroll",()=>{ if(!ticking){ticking=true;requestAnimationFrame(()=>{onScroll();ticking=false;});} },{passive:true});

/* Magnetic buttons: the button leans toward the pointer by a few pixels. */
let magEl=null;
document.addEventListener("pointermove",e=>{
  if(!FINE.matches||RM.matches) return;
  const el=e.target.closest&&e.target.closest(".magnetic");
  if(magEl&&magEl!==el){magEl.style.setProperty("--mx","0px");magEl.style.setProperty("--my","0px");}
  magEl=el; if(!el) return;
  const r=el.getBoundingClientRect();
  const dx=(e.clientX-(r.left+r.width/2))/(r.width/2), dy=(e.clientY-(r.top+r.height/2))/(r.height/2);
  el.style.setProperty("--mx",(dx*6).toFixed(1)+"px"); el.style.setProperty("--my",(dy*4).toFixed(1)+"px");
},{passive:true});

function wireTiles(){
  layoutMasonry();
  const tiles=$$(".tile").sort((a,b)=>a.dataset.i-b.dataset.i);
  const list=tiles.map(t=>t.dataset.id);
  tiles.forEach(t=>{
    const open=()=>openLB(list,Number(t.dataset.i));
    t.addEventListener("click",open);
    t.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();open();}});
  });
  observeLift();
}
function wireView(page,q){
  wireTiles(page);
  if(page==="home") wireHero();
  $$("[data-open-menu]").forEach(b=>b.addEventListener("click",()=>setMenu(true)));
  if(page==="rates") wireEstimator();
  if(page==="book") wireBooking();
  if(page==="contact") wireContactForm();
  if(page==="about") wireFaq();
}

/* Home hero slideshow */
function wireHero(){
  const slides=$$("#hero-photo .slide"), dots=$$(".hero-dots button");
  if(slides.length<2) return;
  let i=0;
  const load=s=>{const img=s.querySelector("img"); if(img.dataset.src){img.srcset=img.dataset.srcset;img.src=img.dataset.src;delete img.dataset.src;delete img.dataset.srcset;}};
  const show=n=>{
    i=(n+slides.length)%slides.length;
    load(slides[i]); load(slides[(i+1)%slides.length]);
    slides.forEach((s,k)=>s.classList.toggle("on",k===i));
    dots.forEach((d,k)=>{d.classList.remove("on");if(k===i){void d.offsetWidth;d.classList.add("on");}});
    $("#hero-word").innerHTML=`<span>${esc(slides[i].dataset.word)}</span>`;
    $("#hero-count").innerHTML=`<b>${pad2(i+1)}</b> / ${pad2(slides.length)}`;
  };
  const start=()=>{S.timers.forEach(t=>clearInterval(t));S.timers=[setInterval(()=>{if(!document.hidden)show(i+1);},6500)];};
  dots.forEach((d,k)=>d.addEventListener("click",()=>{show(k);start();}));
  /* The next photo downloads after the page has finished loading, so it does not slow the first one */
  const later=()=>setTimeout(()=>load(slides[1]),1500);
  document.readyState==="complete"?later():addEventListener("load",later,{once:true});
  if(!RM.matches) start();
}

/* Lightbox */
function openLB(list,i){
  S.lb={list,i,from:document.activeElement};
  const lb=$("#lb"); lb.hidden=false; document.body.style.overflow="hidden";
  requestAnimationFrame(()=>lb.classList.add("open"));
  paintLB(); $("#lb-close").focus();
}
function paintLB(){
  const {list,i}=S.lb, id=list[i]; if(!id)return;
  const img=$("#lb-img"); img.classList.remove("ready");
  img.onload=()=>img.classList.add("ready");
  img.src=fullPath(id); img.alt=(photo(id)||{}).alt||"INFINT photograph";
  if(img.complete) img.classList.add("ready");
  $("#lb-title").textContent=catName((photo(id)||{}).cat);
  [list[(i+1)%list.length],list[(i-1+list.length)%list.length]].forEach(n=>{const p=new Image();p.src=fullPath(n);});
}
function closeLB(){
  const lb=$("#lb"); lb.classList.remove("open"); document.body.style.overflow="";
  setTimeout(()=>{if(!lb.classList.contains("open"))lb.hidden=true;},300);
  if(S.lb.from&&S.lb.from.focus) S.lb.from.focus({preventScroll:true});
}
function stepLB(d){const n=S.lb.list.length;if(!n)return;S.lb.i=(S.lb.i+d+n)%n;paintLB();}

/* Rates estimator */
function wireEstimator(){
  const out=$("#q-out"), hrs=$("#q-hours"), km=$("#q-km"), sh=$("#q-2nd");
  const travel=CONFIG.rates.addons.find(a=>/travel/i.test(a.name));
  const calc=()=>{
    const extraKm=Math.max(0,(Number(km.value)||0)-15);
    const total=(Number(hrs.value)||0)+extraKm*(travel?travel.price:0)+(Number(sh.value)||0);
    out.innerHTML=`<span class="cur">${esc(CONFIG.rates.currency)}</span>${num(total)}`;
    out.classList.remove("bump"); void out.offsetWidth; out.classList.add("bump");
  };
  [hrs,km,sh].forEach(el=>el.addEventListener("input",calc)); calc();
}

/* FAQ accordion */
function wireFaq(){
  $$(".acc button").forEach(b=>b.addEventListener("click",()=>{
    const acc=b.parentElement, open=acc.classList.contains("open");
    $$(".acc").forEach(a=>{a.classList.remove("open");a.querySelector("button").setAttribute("aria-expanded","false");});
    if(!open){acc.classList.add("open");b.setAttribute("aria-expanded","true");}
  }));
}

/* Sending forms. Returns true only when the server confirms the email went out. */
async function postEnquiry(payload){
  try{
    const res=await fetch(CONFIG.forms.endpoint,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
    if(!res.ok) return false;
    const data=await res.json().catch(()=>({}));
    return data.ok===true;
  }catch(e){ return false; }
}

/* Booking form */
function bookingLines(){
  const b=S.booking, svc=CONFIG.services.find(s=>s.slug===b.service);
  return [
    ["Shoot",svc?svc.name:(b.service||"-")],["Package",b.pkg],["Date",(b.date||"-")+(b.time?" at "+b.time:"")],
    ["Coverage",b.hours],["Location",b.location],["Notes",b.notes],
    ["Name",b.name],["Phone",b.phone],["Email",b.email],["Handle",b.handle],["Billing name",b.billing],["Heard about INFINT",b.source]
  ].map(([k,v])=>[k,v||"-"]);
}
const bookingText = () => bookingLines().map(([k,v])=>k+": "+v).join("\n");
function bookingSubject(){
  const svc=CONFIG.services.find(s=>s.slug===S.booking.service);
  return "Booking enquiry: "+(svc?svc.name:"INFINT")+(S.booking.date?", "+S.booking.date:"");
}
function wireBooking(){
  const b=S.booking;
  $$("#bookform .opt[data-set]").forEach(o=>o.addEventListener("click",()=>{
    b.service=o.dataset.val;
    $$("#bookform .opt[data-set]").forEach(x=>{const on=x===o;x.classList.toggle("on",on);x.setAttribute("aria-pressed",on);});
    $("#e-service").classList.remove("show");
  }));
  $$("#bookform [data-go]").forEach(btn=>btn.addEventListener("click",()=>{
    const step=b.step||1; saveStep();
    const target=Number(btn.dataset.go);
    if(target>step && !validateStep(step)) return;
    b.step=target; render({keepScroll:true});
  }));
  $("#bookform").addEventListener("submit",e=>{e.preventDefault();sendBooking();});
  const wa=$("#wabtn"); if(wa) wa.href=waLink("Hi Tshedza, I'd like to book a shoot.\n\n"+bookingText());
  const ma=$("#mailbtn"); if(ma) ma.href=mailtoLink(bookingSubject(),"Hi Tshedza,\n\nI'd like to book a shoot. Details below.\n\n"+bookingText(),CONFIG.contact.bookings);
  if((b.step||1)===3) $("#review").innerHTML=`<div class="review">${bookingLines().map(([k,v])=>`<div class="r"><span>${esc(k)}</span><span>${esc(v)}</span></div>`).join("")}</div>`;
}
function saveStep(){ for(const [k,v] of new FormData($("#bookform")).entries()) S.booking[k]=v; }
function validateStep(step){
  let ok=true, first=null;
  const need = step===1 ? ["date","location"] : step===2 ? ["name","phone","email"] : [];
  need.forEach(k=>{
    const bad = !S.booking[k] || (k==="email" && !/^\S+@\S+\.\S+$/.test(S.booking[k]));
    $("#e-"+k)?.classList.toggle("show",bad);
    if(bad){ok=false; first=first||$(`#bookform [name="${k}"]`);}
  });
  if(step===1 && !S.booking.service){$("#e-service").classList.add("show");ok=false;first=$("#bookform .opt");}
  if(first) first.focus();
  return ok;
}
async function sendBooking(){
  const btn=$("#sendbtn"); btn.disabled=true; btn.textContent="Sending…";
  const b=S.booking;
  const sent=await postEnquiry({kind:"booking",subject:bookingSubject(),name:b.name,email:b.email,phone:b.phone,message:bookingText(),company:b.company||""});
  if(sent){
    $("#bookform").style.display="none"; $("#stepper").style.display="none";
    const done=$("#booked"); done.style.display="block";
    done.innerHTML=`<div class="notice ok"><strong>Enquiry sent.</strong> You'll hear back within 24 hours with a quote and a hold on the date. Banking details come with the written quote.</div>
      <div class="form-actions"><a class="btn ghost" href="#/">Back to home</a><a class="btn ghost" href="#/work">See the work</a></div>`;
    S.booking={};
  }else{
    toast("That didn't go through. Use WhatsApp or email next to it, your details are already filled in.",1);
    btn.disabled=false; btn.innerHTML="Try again "+ARR;
  }
}

/* Contact form */
function wireContactForm(){
  const form=$("#contactform"), mailBtn=$("#cf-mailto");
  const body=f=>["Hi Tshedza,","","Name: "+(f.name||""),"Contact: "+(f.contact||""),"",(f.message||"")].join("\n");
  const sync=()=>{mailBtn.href=mailtoLink("General enquiry: INFINT",body(Object.fromEntries(new FormData(form).entries())));};
  sync(); form.addEventListener("input",sync);
  form.addEventListener("submit",async e=>{
    e.preventDefault();
    const f=Object.fromEntries(new FormData(form).entries()), btn=form.querySelector("button[type=submit]");
    btn.disabled=true; btn.textContent="Sending…";
    const sent=await postEnquiry({kind:"contact",subject:"New message: INFINT site",name:f.name,email:/@/.test(f.contact)?f.contact:"",phone:/@/.test(f.contact)?"":f.contact,message:body(f),company:f.company||""});
    if(sent){
      form.reset(); form.style.display="none";
      $("#cf-note").textContent="Message sent. I'll get back to you shortly.";
    }else{
      $("#cf-note").innerHTML=`That didn't go through. Use <a class="link" href="${waLink(body(f))}" target="_blank" rel="noopener">WhatsApp</a> or the email button above instead, your message is already filled in.`;
      btn.disabled=false; btn.innerHTML="Try again "+ARR;
    }
  });
}

/* Global wiring */
/* Menu: Work, then every category, then the other pages */
function paintNav(){
  const link=(href,name)=>`<li><a href="${href}">${esc(name)}</a></li>`;
  $("#nav-cats").innerHTML=`<li class="nav-h label" aria-hidden="true">Work</li>`+link("#/work","Everything")+CATEGORIES.map(c=>link("#/work?f="+c.key,c.name)).join("");
}
function markNav(page){
  const set=(a,on)=>{a.classList.toggle("active",on); on?a.setAttribute("aria-current","page"):a.removeAttribute("aria-current");};
  $$(".nav-l").forEach(a=>set(a,a.getAttribute("href")==="#/"+page));
  $$("#nav-cats a").forEach(a=>set(a,page==="work"&&a.getAttribute("href")===(S.filter==="all"?"#/work":"#/work?f="+S.filter)));
}
function setMenu(open){
  $("#nav").classList.toggle("open",open);
  $("#burger").setAttribute("aria-expanded",String(open));
  document.body.classList.toggle("menu-open",open);
}
$("#burger").addEventListener("click",()=>setMenu(!$("#nav").classList.contains("open")));
/* Picking the page you are already on just closes the menu */
$("#nav").addEventListener("click",e=>{ const a=e.target.closest("a"); if(a&&a.getAttribute("href")===(location.hash||"#/")) setMenu(false); });
/* "Skip to content" moves focus to the page without the router treating #app as a page */
$(".skip").addEventListener("click",e=>{e.preventDefault();$("#app").focus();});
$("#totop").addEventListener("click",()=>window.scrollTo({top:0,behavior:RM.matches?"auto":"smooth"}));
$("#lb-close").addEventListener("click",closeLB);
$("#lb").addEventListener("click",e=>{ if(e.target.id==="lb")closeLB(); });
$("#lb-prev").addEventListener("click",()=>stepLB(-1));
$("#lb-next").addEventListener("click",()=>stepLB(1));
let swipeX=null;
$("#lb").addEventListener("pointerdown",e=>{swipeX=e.clientX;});
$("#lb").addEventListener("pointerup",e=>{ if(swipeX===null)return; const dx=e.clientX-swipeX; swipeX=null; if(Math.abs(dx)>50) stepLB(dx<0?1:-1); });
document.addEventListener("keydown",e=>{
  if(e.key==="Escape"&&$("#nav").classList.contains("open")) setMenu(false);
  if($("#lb").hidden)return;
  if(e.key==="Escape")closeLB();
  if(e.key==="ArrowLeft")stepLB(-1);
  if(e.key==="ArrowRight")stepLB(1);
});

function paintFooter(){
  $("#yr").textContent=new Date().getFullYear();
  $("#footer-social").innerHTML=`
    <li>${iconLink("instagram",CONFIG.social.instagram,"Instagram (@infint_co)",1)}</li>
    <li>${iconLink("tiktok",CONFIG.social.tiktok,"TikTok (@infint_co)",1)}</li>
    <li>${iconLink("youtube",CONFIG.social.youtube,"YouTube (@tshedza_tt)",1)}</li>
    <li>${iconLink("link",CONFIG.social.linktree,"Linktree",1)}</li>`;
  $("#footer-contact").innerHTML=`
    <li>${iconLink("whatsapp",waLink("Hi Tshedza,"),CONFIG.contact.phone,1)}</li>
    <li>${iconLink("phone","tel:"+CONFIG.contact.phone.replace(/\s/g,""),"Call "+CONFIG.contact.phone)}</li>
    <li>${iconLink("mail","mailto:"+CONFIG.contact.email,CONFIG.contact.email)}</li>
    <li>${iconLink("mail","mailto:"+CONFIG.contact.direct,CONFIG.contact.direct)}</li>`;
}

paintNav();
paintFooter();
render();
