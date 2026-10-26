/*
  INFINT site logic. A small hash router: each page is a function in V
  that returns HTML, and wireView() attaches the page's event handlers.
  Routes: #/  #/work  #/rates  #/book  #/contact  #/about
  Content (photos, rates, copy) lives in js/content.js, not here.
*/

const S = { filter:"all", lb:{list:[],i:0,label:""}, booking:{} };

/* Helpers */
const $  = (s,r=document)=>r.querySelector(s);
const $$ = (s,r=document)=>[...r.querySelectorAll(s)];
const esc = s => String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const photo = id => PHOTOS.find(p=>p.id===id);
const money = n => CONFIG.rates.currency + Number(n).toLocaleString("en-ZA");
const pad3 = n => String(n).padStart(3,"0");
const thumbPath = id => "assets/thumbs/"+id+".jpg";
const fullPath  = id => "assets/photos/"+id+".jpg";
function toast(msg,bad){const t=$("#toast");t.textContent=msg;t.classList.toggle("bad",!!bad);
  t.classList.add("show");clearTimeout(t._t);t._t=setTimeout(()=>t.classList.remove("show"),3600);}
function waLink(text){return "https://wa.me/"+CONFIG.contact.whatsapp+(text?"?text="+encodeURIComponent(text):"");}
function mailtoLink(subject,body){return "mailto:"+CONFIG.contact.email+"?subject="+encodeURIComponent(subject)+"&body="+encodeURIComponent(body);}

const ICON = {
  instagram:'<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none"/></svg>',
  tiktok:'<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M14.5 2h2.8c.2 1.7 1.3 3.2 3.2 3.7v2.9c-1.4 0-2.7-.4-3.8-1.2v6.9c0 3.2-2.6 5.7-5.8 5.7A5.7 5.7 0 0 1 5.2 14.3a5.7 5.7 0 0 1 7.6-5.4v3.1a2.6 2.6 0 1 0 1.7 2.5V2Z"/></svg>',
  youtube:'<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2.5" y="5.5" width="19" height="13" rx="4"/><path d="M10.5 9.3v5.4l4.6-2.7-4.6-2.7Z" fill="currentColor" stroke="none"/></svg>',
  link:'<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9.5 14.5 14.5 9.5"/><path d="M11 6.5 12.6 4.9a3.6 3.6 0 0 1 5.1 5.1L16.1 11.6"/><path d="M13 17.5 11.4 19.1a3.6 3.6 0 0 1-5.1-5.1l1.6-1.6"/></svg>',
  whatsapp:'<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.4A10 10 0 1 0 12 2Zm0 18.2a8.1 8.1 0 0 1-4.2-1.2l-.3-.2-3.1.8.8-3-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.6-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1s-.7.8-.9 1c-.2.2-.3.2-.6.1a6.7 6.7 0 0 1-2-1.2 7.4 7.4 0 0 1-1.4-1.7c-.1-.2 0-.4.1-.5l.4-.4.2-.4v-.4c-.1-.1-.6-1.5-.8-2-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2c0 1.3.9 2.6 1.1 2.8.1.2 2 3 4.8 4.2.7.3 1.2.5 1.6.6.7.2 1.3.2 1.8.1.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3Z"/></svg>',
  mail:'<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="m4 7 8 6 8-6"/></svg>',
  phone:'<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6.5 3.5h3l1.5 4-2 1.5a11 11 0 0 0 5.5 5.5l1.5-2 4 1.5v3c0 1-1 1.5-1.8 1.4A16.5 16.5 0 0 1 5.1 5.3c-.1-.8.4-1.8 1.4-1.8Z"/></svg>'
};
function iconLink(key,url,label,newTab){
  return `<a href="${esc(url)}" ${newTab?'target="_blank" rel="noopener"':""} style="display:inline-flex;align-items:center;gap:9px">
    <span aria-hidden="true" style="display:inline-flex;flex:none">${ICON[key]||""}</span><span>${esc(label)}</span></a>`;
}

/* Shared building blocks */
function heading(word,sub){
  return `<div class="crossrule"><span class="sectiontitle">${esc(word)}</span>
    ${sub?`<p class="lede" style="margin-top:12px;max-width:46ch">${esc(sub)}</p>`:""}</div>`;
}
function tileGrid(ids,label){
  return `<div class="masonry">${ids.filter(photo).map((id,i)=>{
    const p=photo(id);
    return `<figure class="tile" data-id="${id}" data-i="${i}">
      <img src="${thumbPath(id)}" width="720" height="${Math.round(720/p.r)}" loading="lazy" decoding="async" alt="${esc(p.alt||"INFINT photograph")}">
      <figcaption class="cap">${esc(label)} · ${pad3(i+1)}</figcaption></figure>`;}).join("")}</div>`;
}
function ctaStrip(){
  return `<section class="section tight dark"><div class="wrap split" style="align-items:center">
    <div><h2>Let's put your date<br>in the diary.</h2></div>
    <div><p class="lede">Tell me what you are shooting and when. You will get a written quote and a hold on the date within 24 hours.</p>
    <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:18px">
      <a class="btn accent" href="#/book">Start a booking</a>
      <a class="btn ghost" href="${waLink("Hi Tshedza, I'd like to book a shoot.")}" target="_blank" rel="noopener">WhatsApp</a>
    </div></div></div></section>`;
}

/* "Everything" view: take one photo from each category in turn so the wall reads as a mix. */
function mixed(){
  const lists=CATEGORIES.map(c=>PHOTOS.filter(p=>p.cat===c.key).map(p=>p.id));
  const out=[]; for(let i=0;out.length<PHOTOS.length&&i<PHOTOS.length;i++) lists.forEach(l=>{if(l[i])out.push(l[i]);});
  PHOTOS.forEach(p=>{if(!out.includes(p.id))out.push(p.id);});
  return out;
}

/* Pages */
const V = {};

V.home = () => `
  <section class="hero"><div class="inner">
    <div class="copy">
      <span class="eyebrow">${esc(CONFIG.brand.city)} <span class="dot">.</span> est. 2024</span>
      <h1 style="margin-top:10px">Your day, shot properly<em>.</em></h1>
      <p class="lede">${esc(CONFIG.brand.intro)}</p>
      <div class="actions">
        <a class="btn accent" href="#/book">Book a shoot</a>
        <a class="btn ghost" href="#/work">See the work</a>
      </div>
    </div>
    <div class="art"><img src="${fullPath(HOME.hero)}" alt="INFINT photography" fetchpriority="high"><span class="stamp">${esc(HOME.heroStamp)}</span></div>
  </div></section>

  <section class="section"><div class="wrap">
    ${heading("what i've shot","Seven kinds of work, done the same way every time: a shot list ahead of time, a fast-moving shoot, and delivery on the day I said I would.")}
    <div style="margin-top:34px">
      ${CATEGORIES.map((c,i)=>`<a class="svc reveal" href="#/work?f=${c.key}">
        <span class="idx">0${i+1}</span>
        <span><h3>${esc(c.name)}</h3><p>${esc(c.blurb)}</p></span>
        <span class="go">${PHOTOS.filter(p=>p.cat===c.key).length} photos &rarr;</span></a>`).join("")}
      <div class="hairline"></div>
    </div>
  </div></section>

  <section class="section bone"><div class="wrap">
    <div style="display:flex;justify-content:space-between;align-items:flex-end;gap:20px;flex-wrap:wrap;margin-bottom:26px">
      <span class="sectiontitle">recent frames</span>
      <a class="link" href="#/work">Full portfolio</a>
    </div>
    ${tileGrid(HOME.featured,"Selected")}
  </div></section>

  <section class="section"><div class="wrap split">
    <div>${heading("how it works")}</div>
    <div><ol style="list-style:none;padding:0;margin:0">
      ${CONFIG.howItWorks.map(([t,d],i)=>`<li class="reveal" style="border-top:1px solid var(--line);padding:18px 0;display:grid;grid-template-columns:34px 1fr;gap:16px">
        <span style="font-family:var(--display);font-weight:800;color:var(--accent)">0${i+1}</span>
        <span><h3 style="margin-bottom:5px">${esc(t)}</h3><p style="color:var(--mute);margin:0;font-size:.95rem">${esc(d)}</p></span></li>`).join("")}
    </ol></div>
  </div></section>
  ${ctaStrip()}`;

V.work = (q) => {
  const f = CATEGORIES.some(c=>c.key===q.f) ? q.f : "all";
  S.filter = f;
  const ids = f==="all" ? mixed() : PHOTOS.filter(p=>p.cat===f).map(p=>p.id);
  const label = f==="all" ? "Portfolio" : CATEGORIES.find(c=>c.key===f).name;
  return `
  <section class="section tight"><div class="wrap">
    ${heading("portfolio","Events, portraits, matric dances, match days, fashion and the small details in between. "+PHOTOS.length+" frames from real shoots.")}
    <div class="filters">
      <button class="chip ${f==="all"?"on":""}" data-filter="all">Everything <span class="n">${PHOTOS.length}</span></button>
      ${CATEGORIES.map(c=>`<button class="chip ${f===c.key?"on":""}" data-filter="${c.key}">${esc(c.name)} <span class="n">${PHOTOS.filter(p=>p.cat===c.key).length}</span></button>`).join("")}
    </div>
  </div></section>
  <section style="padding-bottom:clamp(50px,8vw,110px)"><div class="wrap">${tileGrid(ids,label)}</div></section>
  ${ctaStrip()}`;
};

V.rates = () => {
  const r=CONFIG.rates;
  const travel=r.addons.find(a=>/travel/i.test(a.name));
  return `
  <section class="section tight"><div class="wrap">
    ${heading("rates","Everything below includes editing and delivery by download link. Prices hold for the "+r.updated+" season.")}
  </div></section>

  <section style="padding-bottom:clamp(40px,6vw,70px)"><div class="wrap">
    <h2 style="margin-bottom:6px">${esc(r.grads.title)}</h2>
    <p class="lede" style="margin-bottom:26px">${esc(r.grads.note)}</p>
    <div class="grid g3 stack-sm">
      ${r.grads.items.map(p=>`<div class="pkg ${p.feature?"feature":""} reveal">
        ${p.feature?'<span class="tag">Most booked</span>':""}
        <span class="eyebrow">${esc(p.dur)}</span>
        <div class="price">${money(p.price)}</div>
        <div style="font-size:.9rem;color:${p.feature?"#9AA1AA":"var(--mute)"}">${esc(p.images)}</div>
        <ul>${p.includes.map(i=>`<li><span>${esc(i)}</span></li>`).join("")}</ul>
        <a class="btn ${p.feature?"accent":"ghost"}" href="#/book?service=graduation&pkg=${encodeURIComponent(p.name)}">Book ${esc(p.name)}</a>
      </div>`).join("")}
    </div>
  </div></section>

  <section class="section bone"><div class="wrap split" style="align-items:start">
    <div>
      <h2 style="margin-bottom:6px">${esc(r.short.title)}</h2>
      <p class="lede" style="margin-bottom:22px">${esc(r.short.note)}</p>
      <div class="tablewrap"><table class="ratetable"><thead><tr><th>Session</th><th>Delivered</th><th>Price</th></tr></thead><tbody>
      ${r.short.items.map(i=>`<tr><td>${esc(i.dur)}</td><td style="color:var(--mute)">${esc(i.images)}</td><td><strong>${money(i.price)}</strong></td></tr>`).join("")}
      </tbody></table></div>
    </div>
    <div>
      <h2 style="margin-bottom:6px">${esc(r.day.title)}</h2>
      <p class="lede" style="margin-bottom:22px">${esc(r.day.note)}</p>
      <table class="ratetable"><thead><tr><th>Coverage</th><th>Price</th></tr></thead><tbody>
      ${r.day.items.map(i=>`<tr><td>${esc(i.hours)}</td><td><strong>${money(i.price)}</strong></td></tr>`).join("")}
      <tr><td>Each additional hour</td><td><strong>${money(r.day.overtime)}</strong></td></tr>
      </tbody></table>
      <p class="hint" style="margin-top:12px">Maximum ${r.day.overtimeMax} hours on any single day.</p>
    </div>
  </div></section>

  <section class="section"><div class="wrap">
    <h2 style="margin-bottom:22px">Add-ons</h2>
    <div class="grid g2 stack-sm">
      ${r.addons.map(a=>`<div class="reveal" style="border-top:1px solid var(--line);padding:16px 0;display:flex;gap:18px;justify-content:space-between">
        <span><strong style="font-family:var(--display)">${esc(a.name)}</strong>
          <p style="margin:4px 0 0;font-size:.9rem;color:var(--mute)">${esc(a.note)}</p></span>
        <span style="text-align:right;white-space:nowrap"><strong>${money(a.price)}</strong>
          <p style="margin:2px 0 0;font-size:.78rem;color:var(--mute)">${esc(a.unit)}</p></span>
      </div>`).join("")}
    </div>
  </div></section>

  <section class="section bone"><div class="wrap" style="max-width:820px">
    <h2 style="margin-bottom:8px">Estimate a day rate</h2>
    <p class="lede" style="margin-bottom:22px">Rough working figure for events, weddings and corporate days. The written quote is what counts.</p>
    <div class="grid g3 stack-sm" style="align-items:end">
      <div class="field" style="margin:0"><label for="q-hours">Hours of coverage</label>
        <select class="input" id="q-hours">${r.day.items.map(i=>`<option value="${i.price}">${esc(i.hours)}</option>`).join("")}</select></div>
      <div class="field" style="margin:0"><label for="q-km">Travel (km, one way)</label>
        <input class="input" id="q-km" type="number" min="0" value="0"></div>
      <div class="field" style="margin:0"><label for="q-2nd">Second shooter</label>
        <select class="input" id="q-2nd"><option value="0">No</option><option value="${r.addons[0].price}">Yes</option></select></div>
    </div>
    <div style="display:flex;justify-content:space-between;align-items:baseline;border-top:1px solid var(--line);margin-top:20px;padding-top:18px">
      <span class="eyebrow">Working estimate</span>
      <span id="q-out" style="font-family:var(--display);font-weight:900;font-size:clamp(1.8rem,4vw,2.6rem);letter-spacing:-.04em"></span>
    </div>
    <p class="hint">Travel is free within 15 km of Braamfontein, then ${money(travel?travel.price:0)} per kilometre.</p>
  </div></section>
  ${ctaStrip()}`;
};

V.book = (q) => {
  const b=S.booking;
  if(q.service&&!b.service)b.service=q.service;
  if(q.pkg&&!b.pkg)b.pkg=q.pkg;
  const step=b.step||1;
  const opts=(list,cur)=>list.map(h=>`<option ${cur===h?"selected":""}>${h}</option>`).join("");
  return `
  <section class="section tight"><div class="wrap" style="max-width:780px">
    ${heading("booking enquiry","No payment here. Send the details, get a quote, then confirm the date.")}
    <div class="steps" style="margin-top:34px">
      <div class="${step===1?"on":"done"}">1. The shoot</div>
      <div class="${step===2?"on":step>2?"done":""}">2. Your details</div>
      <div class="${step===3?"on":""}">3. Review &amp; send</div>
    </div>
    <form id="bookform" novalidate>
    <div data-step="1" style="${step===1?"":"display:none"}">
      <div class="field"><label>What are we shooting <span class="req">*</span></label>
        <div class="optrow">${CONFIG.services.map(s=>`<button type="button" class="opt ${b.service===s.slug?"on":""}" data-set="service" data-val="${s.slug}">
          <strong>${esc(s.name)}</strong><span>${esc(s.blurb)}</span></button>`).join("")}</div>
        <div class="err" id="e-service">Choose the type of shoot.</div></div>
      <div class="grid g2 stack-sm">
        <div class="field"><label>Date <span class="req">*</span></label>
          <input class="input" type="date" name="date" value="${esc(b.date||"")}"><div class="err" id="e-date">Pick a date.</div></div>
        <div class="field"><label>Start time</label>
          <input class="input" type="time" name="time" value="${esc(b.time||"")}"></div>
      </div>
      <div class="grid g2 stack-sm">
        <div class="field"><label>Hours of coverage</label>
          <select class="input" name="hours">${opts(["Under 1 hour","1 to 2 hours","3 hours","4 hours","5 hours","6 hours","7 hours","8 hours","More than 8 hours","Not sure yet"],b.hours)}</select></div>
        <div class="field"><label>Package (if you know it)</label>
          <input class="input" name="pkg" placeholder="e.g. The Signature" value="${esc(b.pkg||"")}"></div>
      </div>
      <div class="field"><label>Location or venue <span class="req">*</span></label>
        <input class="input" name="location" placeholder="Campus, venue name, suburb" value="${esc(b.location||"")}">
        <div class="err" id="e-location">Where are we shooting?</div></div>
      <div class="field"><label>Anything I should know</label>
        <textarea class="input" name="notes" placeholder="Shot list, family members joining, timings, references, budget">${esc(b.notes||"")}</textarea></div>
      <button type="button" class="btn accent" data-go="2">Continue</button>
    </div>

    <div data-step="2" style="${step===2?"":"display:none"}">
      <div class="grid g2 stack-sm">
        <div class="field"><label>Full name <span class="req">*</span></label>
          <input class="input" name="name" autocomplete="name" value="${esc(b.name||"")}"><div class="err" id="e-name">I need a name for the agreement.</div></div>
        <div class="field"><label>Mobile number <span class="req">*</span></label>
          <input class="input" name="phone" type="tel" autocomplete="tel" placeholder="+27" value="${esc(b.phone||"")}"><div class="err" id="e-phone">A reachable number, please.</div></div>
      </div>
      <div class="grid g2 stack-sm">
        <div class="field"><label>Email <span class="req">*</span></label>
          <input class="input" name="email" type="email" autocomplete="email" value="${esc(b.email||"")}"><div class="err" id="e-email">Check the email address.</div></div>
        <div class="field"><label>Instagram or TikTok handle</label>
          <input class="input" name="handle" placeholder="@" value="${esc(b.handle||"")}"></div>
      </div>
      <div class="grid g2 stack-sm">
        <div class="field"><label>Billing name for the invoice</label>
          <input class="input" name="billing" placeholder="Person or company" value="${esc(b.billing||"")}">
          <p class="hint">Only needed if the invoice goes to someone other than you.</p></div>
        <div class="field"><label>How did you hear about INFINT</label>
          <select class="input" name="source">${opts(["Instagram","TikTok","A friend","Saw you at a shoot","Google","Other"],b.source)}</select></div>
      </div>
      <div class="hp" aria-hidden="true"><label>Company<input name="company" tabindex="-1" autocomplete="off"></label></div>
      <div class="notice">Your details are used to prepare a quote and, if you go ahead, a booking agreement. They are not shared with anyone else.</div>
      <div style="display:flex;gap:10px;margin-top:22px"><button type="button" class="btn ghost" data-go="1">Back</button>
        <button type="button" class="btn accent" data-go="3">Review</button></div>
    </div>

    <div data-step="3" style="${step===3?"":"display:none"}">
      <div id="review"></div>
      <div class="notice" style="margin:20px 0">${esc(CONFIG.booking.terms)}</div>
      <div style="display:flex;gap:10px;flex-wrap:wrap"><button type="button" class="btn ghost" data-go="2">Back</button>
        <button type="submit" class="btn accent" id="sendbtn">Send enquiry</button>
        <a class="btn ghost" id="wabtn" target="_blank" rel="noopener">Send on WhatsApp instead</a>
        <a class="btn ghost" id="mailbtn">Send by email instead</a></div>
    </div>
    </form>
    <div id="booked" style="display:none"></div>
  </div></section>`;
};

V.contact = () => `
  <section class="section tight"><div class="wrap">${heading("contact")}</div></section>
  <section style="padding-bottom:clamp(50px,8vw,100px)"><div class="wrap split" style="align-items:start">
    <div>
      <table class="ratetable contact-table"><tbody>
        <tr><td>WhatsApp</td><td>${iconLink("whatsapp",waLink("Hi Tshedza,"),CONFIG.contact.phone,1)}</td></tr>
        <tr><td>Phone</td><td>${iconLink("phone","tel:"+CONFIG.contact.phone2.replace(/\s/g,""),CONFIG.contact.phone2)}</td></tr>
        <tr><td>Email</td><td>${iconLink("mail","mailto:"+CONFIG.contact.email,CONFIG.contact.email)}</td></tr>
        <tr><td>Instagram</td><td>${iconLink("instagram",CONFIG.social.instagram,"@infint_co",1)}</td></tr>
        <tr><td>TikTok</td><td>${iconLink("tiktok",CONFIG.social.tiktok,"@infint_co",1)}</td></tr>
        <tr><td>YouTube</td><td>${iconLink("youtube",CONFIG.social.youtube,"@tshedza_tt",1)}</td></tr>
        <tr><td>Everything else</td><td>${iconLink("link",CONFIG.social.linktree,"linktr.ee/tshedzatt",1)}</td></tr>
        <tr><td>Based in</td><td>${esc(CONFIG.brand.city)}, shooting Gauteng and beyond</td></tr>
      </tbody></table>
      <div style="display:flex;gap:10px;margin-top:24px;flex-wrap:wrap">
        <a class="btn accent" href="#/book">Booking enquiry</a>
        <a class="btn ghost" href="${waLink("Hi Tshedza,")}" target="_blank" rel="noopener">WhatsApp</a>
      </div>
    </div>
    <div>
      <h3 style="margin-bottom:16px">Send a message</h3>
      <form id="contactform">
        <div class="field"><label for="cf-name">Name <span class="req">*</span></label><input class="input" id="cf-name" name="name" autocomplete="name" required></div>
        <div class="field"><label for="cf-contact">Email or number <span class="req">*</span></label><input class="input" id="cf-contact" name="contact" required></div>
        <div class="field"><label for="cf-message">Message <span class="req">*</span></label><textarea class="input" id="cf-message" name="message" required></textarea></div>
        <div class="hp" aria-hidden="true"><label>Company<input name="company" tabindex="-1" autocomplete="off"></label></div>
        <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center">
          <button class="btn accent" type="submit">Send message</button>
          <a class="btn ghost" id="cf-mailto">Open in email instead</a>
        </div>
      </form>
      <p class="hint" id="cf-note" style="margin-top:14px"></p>
    </div>
  </div></section>`;

V.about = () => `
  <section class="section tight"><div class="wrap">
    ${heading("about")}
    <span class="wordmark" style="font-size:1.7rem;display:inline-block;margin:22px 0 6px">INFINT</span>
    <div class="split" style="margin-top:20px">
      <div class="about-copy"><p class="lede">${esc(CONFIG.brand.intro)}</p>
        <p class="lede">INFINT is run by ${esc(CONFIG.brand.owner)} out of ${esc(CONFIG.brand.city)}. What started with graduation shoots grew into events, sport, fashion and brand work, same approach every time: show up prepared, move at a good pace, and get the photos back before the day is old news.</p>
        <div class="tagcloud" style="margin-top:18px">${CONFIG.aboutTags.map(t=>`<span class="tag">${esc(t)}</span>`).join("")}</div>
      </div>
      <div class="rounded about-photo"><img src="assets/photos/about-tshedza.jpg" alt="Tshedza Tshiololi, INFINT"></div>
    </div>
  </div></section>

  <section class="section bone"><div class="wrap">
    <h2 style="margin-bottom:26px">Before your shoot</h2>
    <div class="grid g2 stack-sm">
      ${CONFIG.prep.map(p=>`<div class="reveal" style="border-top:1px solid var(--line);padding-top:16px">
        <h3 style="margin-bottom:6px">${esc(p.t)}</h3><p style="color:var(--mute);font-size:.94rem;margin:0">${esc(p.d)}</p></div>`).join("")}
    </div>
  </div></section>

  <section class="section"><div class="wrap" style="max-width:840px">
    <h2 style="margin-bottom:20px">Questions</h2>
    <div id="faq">
      ${CONFIG.faq.map(f=>`<div class="acc"><button type="button">${esc(f.q)}<span class="pm">+</span></button>
        <div class="body"><p>${esc(f.a)}</p></div></div>`).join("")}
      <div class="hairline"></div>
    </div>
  </div></section>
  ${ctaStrip()}`;

/* Router */
function parseHash(){
  const h=(location.hash||"#/").slice(1);
  const [path,qs]=h.split("?");
  const parts=path.split("/").filter(Boolean);
  const q={}; new URLSearchParams(qs||"").forEach((v,k)=>q[k]=v);
  return {route:parts[0]||"home",q};
}
function render(){
  const {route,q}=parseHash();
  const page = V[route] ? route : "home";
  const app=$("#app");
  app.innerHTML=V[page](q);
  app.classList.remove("page-in"); void app.offsetWidth; app.classList.add("page-in");
  $$("nav.main a").forEach(a=>a.classList.toggle("active",a.getAttribute("href")==="#/"+page));
  $("#nav").classList.remove("open"); $("#burger").setAttribute("aria-expanded","false");
  window.scrollTo(0,0);
  wireView(page,q);
  observeReveal();
}
window.addEventListener("hashchange",render);

function observeReveal(){
  const els=$$(".reveal"); if(!els.length)return;
  if(!("IntersectionObserver" in window)){els.forEach(e=>e.classList.add("in"));return;}
  const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add("in");io.unobserve(e.target);}}),{threshold:.12});
  els.forEach(e=>io.observe(e));
}

function wireView(page,q){
  const tiles=$$(".tile");
  const list=tiles.map(t=>t.dataset.id);
  tiles.forEach(t=>t.addEventListener("click",()=>openLB(list,Number(t.dataset.i),page==="work"?"Portfolio":"Selected")));
  if(page==="work") $$(".chip").forEach(c=>c.addEventListener("click",()=>{location.hash="#/work?f="+c.dataset.filter;}));
  if(page==="rates") wireEstimator();
  if(page==="book") wireBooking();
  if(page==="contact") wireContactForm();
  if(page==="about") wireFaq();
}

/* Lightbox */
function openLB(list,i,label){S.lb={list,i,label};$("#lb").classList.add("open");document.body.style.overflow="hidden";paintLB();}
function paintLB(){
  const {list,i,label}=S.lb, id=list[i]; if(!id)return;
  const img=$("#lb-img"); img.src=fullPath(id); img.alt=(photo(id)||{}).alt||"INFINT photograph";
  $("#lb-title").textContent=label+" · "+pad3(i+1)+" / "+pad3(list.length);
}
function closeLB(){$("#lb").classList.remove("open");document.body.style.overflow="";}
function stepLB(d){const n=S.lb.list.length;if(!n)return;S.lb.i=(S.lb.i+d+n)%n;paintLB();}

/* Rates estimator */
function wireEstimator(){
  const out=$("#q-out"), hrs=$("#q-hours"), km=$("#q-km"), sh=$("#q-2nd");
  const travel=CONFIG.rates.addons.find(a=>/travel/i.test(a.name));
  const calc=()=>{
    const extraKm=Math.max(0,(Number(km.value)||0)-15);
    out.textContent=money((Number(hrs.value)||0)+extraKm*(travel?travel.price:0)+(Number(sh.value)||0));
  };
  [hrs,km,sh].forEach(el=>el.addEventListener("input",calc)); calc();
}

/* FAQ accordion */
function wireFaq(){
  $$(".acc button").forEach(b=>b.addEventListener("click",()=>{
    const body=b.nextElementSibling, open=body.style.maxHeight&&body.style.maxHeight!=="0px";
    $$(".acc .body").forEach(x=>x.style.maxHeight="0px");
    $$(".acc button .pm").forEach(p=>p.textContent="+");
    if(!open){body.style.maxHeight=body.scrollHeight+"px";b.querySelector(".pm").textContent="−";}
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
  $$("#bookform .opt[data-set]").forEach(o=>o.addEventListener("click",()=>{saveStep();b.service=o.dataset.val;render();}));
  $$("#bookform [data-go]").forEach(btn=>btn.addEventListener("click",()=>{
    const step=b.step||1; saveStep();
    const target=Number(btn.dataset.go);
    if(target>step && !validateStep(step)) return;
    b.step=target; render();
  }));
  $("#bookform").addEventListener("submit",e=>{e.preventDefault();sendBooking();});
  const wa=$("#wabtn"); if(wa) wa.href=waLink("Hi Tshedza, I'd like to book a shoot.\n\n"+bookingText());
  const ma=$("#mailbtn"); if(ma) ma.href=mailtoLink(bookingSubject(),"Hi Tshedza,\n\nI'd like to book a shoot. Details below.\n\n"+bookingText());
  if((b.step||1)===3) $("#review").innerHTML=`<table class="ratetable contact-table"><tbody>${bookingLines().map(([k,v])=>`<tr><td>${esc(k)}</td><td>${esc(v)}</td></tr>`).join("")}</tbody></table>`;
}
function saveStep(){ for(const [k,v] of new FormData($("#bookform")).entries()) S.booking[k]=v; }
function validateStep(step){
  let ok=true;
  const need = step===1 ? ["date","location"] : step===2 ? ["name","phone","email"] : [];
  need.forEach(k=>{
    const bad = !S.booking[k] || (k==="email" && !/^\S+@\S+\.\S+$/.test(S.booking[k]));
    $("#e-"+k)?.classList.toggle("show",bad);
    if(bad)ok=false;
  });
  if(step===1 && !S.booking.service){$("#e-service").classList.add("show");ok=false;}
  return ok;
}
async function sendBooking(){
  const btn=$("#sendbtn"); btn.disabled=true; btn.textContent="Sending…";
  const b=S.booking;
  const sent=await postEnquiry({kind:"booking",subject:bookingSubject(),name:b.name,email:b.email,phone:b.phone,message:bookingText(),company:b.company||""});
  if(sent){
    $("#bookform").style.display="none";
    const done=$("#booked"); done.style.display="block";
    done.innerHTML=`<div class="notice ok"><strong>Enquiry sent.</strong> You'll hear back within 24 hours with a quote and a hold on the date. Banking details come with the written quote.</div>
      <a class="btn ghost" style="margin-top:22px" href="#/">Back to home</a>`;
    S.booking={};
  }else{
    toast("That didn't go through. Use WhatsApp or email next to it, your details are already filled in.",1);
    btn.disabled=false; btn.textContent="Try again";
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
    const f=Object.fromEntries(new FormData(form).entries()), btn=form.querySelector("button");
    btn.disabled=true; btn.textContent="Sending…";
    const sent=await postEnquiry({kind:"contact",subject:"New message: INFINT site",name:f.name,email:/@/.test(f.contact)?f.contact:"",phone:/@/.test(f.contact)?"":f.contact,message:body(f),company:f.company||""});
    if(sent){
      form.reset(); form.style.display="none";
      $("#cf-note").textContent="Message sent. I'll get back to you shortly.";
    }else{
      $("#cf-note").innerHTML=`That didn't go through. Use <a class="link" href="${waLink(body(f))}" target="_blank" rel="noopener">WhatsApp</a> or the email button above instead, your message is already filled in.`;
      btn.disabled=false; btn.textContent="Try again";
    }
  });
}

/* Global wiring */
$("#burger").addEventListener("click",()=>{
  const open=$("#nav").classList.toggle("open");
  $("#burger").setAttribute("aria-expanded",String(open));
});
$("#lb-close").addEventListener("click",closeLB);
$("#lb").addEventListener("click",e=>{ if(e.target.id==="lb")closeLB(); });
$("#lb-prev").addEventListener("click",()=>stepLB(-1));
$("#lb-next").addEventListener("click",()=>stepLB(1));
document.addEventListener("keydown",e=>{
  if(!$("#lb").classList.contains("open"))return;
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
    <li>${iconLink("mail","mailto:"+CONFIG.contact.email,CONFIG.contact.email)}</li>`;
}

paintFooter();
render();
