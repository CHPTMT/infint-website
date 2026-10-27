// Reorders PHOTOS in js/content.js so frames from the same shoot sit far apart within each category.
// Shoots are worked out from the original file names in tools/photos.csv (camera frame numbers close together = same shoot).
// Usage (from the repo folder): node tools/order-photos.js           reports how close same-shoot photos sit
//                                node tools/order-photos.js --write   rewrites the PHOTOS order in js/content.js
// Run it after adding photos. Same input always gives the same order.
const fs=require("fs");
const WRITE=process.argv.includes("--write");
const W=8; // "close" = within 8 places: side by side or above/below at up to 6 columns

// 1. shoot and setup for every photo, from its original file name
const src=Object.fromEntries(fs.readFileSync("tools/photos.csv","utf8").trim().split(/\r?\n/).slice(1).map(l=>{const i=l.indexOf(",");return [l.slice(0,i),l.slice(i+1)];}));
function key(id){
  const f=src[id].split("\\").pop().replace(/\.jpg$/i,"");
  let m=f.match(/^portfolio-2026-(\d{3})-(\d{3})/);
  // three levels: shoot (same day), setup (same scene or look), twin (near-identical frames)
  if(m) return {series:"pdf",n:+m[1],shootGap:1,setupGap:0,twinGap:0};      // PDF page: same page = same scene, next page may be the same shoot
  m=f.match(/^(\d{3})-Silk&Cotton/);
  if(m) return {series:"silk",n:+m[1],shootGap:1e9,setupGap:3,twinGap:1};   // one fashion shoot; frames within 3 = same look
  m=f.match(/^(.*?)(\d{3,})/);
  if(m) return {series:m[1],n:+m[2],shootGap:150,setupGap:30,twinGap:6};     // camera frame numbers
  m=f.match(/^(.*?)-(\d+)$/);
  return {series:m?m[1]:f,n:m?+m[2]:0,shootGap:1e9,setupGap:1e9,twinGap:1e9}; // e.g. Homba-2, SaiHle-1: same name = same shoot
}
function groups(ids){
  // chain photos of one series into shoots, setups and twins by frame-number gaps
  const shoot={}, setup={}, twin={};
  const bySeries={};
  ids.forEach(id=>{const k=key(id);(bySeries[k.series]=bySeries[k.series]||[]).push({id,...k});});
  for(const [s,list] of Object.entries(bySeries)){
    list.sort((a,b)=>a.n-b.n);
    let sh=0, st=0, tw=0;
    list.forEach((p,i)=>{ if(i){const gap=p.n-list[i-1].n; if(gap>p.shootGap) sh++; if(gap>p.setupGap) st++; if(gap>p.twinGap) tw++;}
      shoot[p.id]=s+"#"+sh; setup[p.id]=s+"#"+sh+"."+st; twin[p.id]=s+"#"+sh+"."+st+"."+tw; });
  }
  return {shoot,setup,twin};
}
const weight=(a,b,g)=> g.twin[a]===g.twin[b]?100 : g.setup[a]===g.setup[b]?8 : g.shoot[a]===g.shoot[b]?2 : 0;
// The grid (layoutMasonry in app.js) puts each photo in the shortest column. Simulate it at 2 to 6 columns and
// list the pairs of photos that actually touch: one above the other, or side by side in neighbouring columns.
const RATIO={};
const GAP=.06;
function touching(order,n){
  const h=new Array(n).fill(0), cols=Array.from({length:n},()=>[]), pairs=[];
  for(const id of order){
    const k=h.indexOf(Math.min(...h)), top=h[k], bot=top+1/RATIO[id];
    const prev=cols[k][cols[k].length-1]; if(prev) pairs.push([prev.id,id]);
    for(const kk of [k-1,k+1]) if(kk>=0&&kk<n) for(const t of cols[kk]) if(t.top<bot+GAP&&t.bot+GAP>top) pairs.push([t.id,id]);
    cols[k].push({id,top,bot}); h[k]=bot+GAP;
  }
  return pairs;
}
function penalty(order,g){
  let p=0;
  const LAYOUT_WEIGHT={2:4,3:1,4:1,5:2,6:1}; // phones (2 columns) matter most, then a 1440 px laptop (5 columns)
  for(const n of [2,3,4,5,6]) for(const [a,b] of touching(order,n)) p+=weight(a,b,g)*LAYOUT_WEIGHT[n];
  for(let i=0;i+1<order.length;i++) p+=weight(order[i],order[i+1],g); // and never straight after each other in the list
  return p;
}
function stats(order,g){
  const out={};
  for(const n of [2,3,4,5,6]){
    const pairs=touching(order,n);
    out[n+" cols"]={twins:pairs.filter(([a,b])=>g.twin[a]===g.twin[b]).length, setup:pairs.filter(([a,b])=>g.twin[a]!==g.twin[b]&&g.setup[a]===g.setup[b]).length, shoot:pairs.filter(([a,b])=>g.setup[a]!==g.setup[b]&&g.shoot[a]===g.shoot[b]).length};
  }
  return out;
}
// seeded random so the result is the same every run
let seed=20261027; const rnd=()=>((seed=(seed*1103515245+12345)%2147483648)/2147483648);
function optimise(ids,g){
  let best=[...ids], bestP=penalty(best,g);
  // simulated annealing: early on it accepts some worse swaps so it can climb out of dead ends
  const iters=ids.length<=25?60000:25000, restarts=ids.length<=25?10:4;
  for(let restart=0;restart<restarts;restart++){
    let cur=[...ids].sort(()=>rnd()-.5), p=penalty(cur,g);
    for(let it=0;it<iters;it++){
      const T=8*Math.pow(.02/8,it/iters);
      const i=Math.floor(rnd()*cur.length), j=Math.floor(rnd()*cur.length); if(i===j) continue;
      [cur[i],cur[j]]=[cur[j],cur[i]];
      const q=penalty(cur,g);
      if(q<=p||rnd()<Math.exp((p-q)/T)) p=q; else [cur[i],cur[j]]=[cur[j],cur[i]];
      if(p<bestP){best=[...cur];bestP=p;}
    }
  }
  return best;
}

// 2. read PHOTOS, reorder each category, write back
const c=fs.readFileSync("js/content.js","utf8");
const start=c.indexOf("const PHOTOS = ["), end=c.indexOf("\n];",start);
const lines=c.slice(start,end).split("\n").slice(1);
const entry=l=>{const m=l.match(/"id": "([\w-]+)", "cat": "(\w+)"/);return m?{id:m[1],cat:m[2],line:l.replace(/,\s*$/,"")}:null;};
const items=lines.map(entry).filter(Boolean);
lines.forEach(l=>{const m=l.match(/"id": "([\w-]+)".*?"r": ([\d.]+)/); if(m) RATIO[m[1]]=+m[2];});
const cats=[...new Set(items.map(i=>i.cat))];
const report={}, newOrder=[];
for(const cat of cats){
  const ids=items.filter(i=>i.cat===cat).map(i=>i.id);
  const g=groups(ids);
  const before=stats(ids,g);
  const after=optimise(ids,g);
  report[cat]={photos:ids.length, shoots:new Set(Object.values(g.shoot)).size, before, after:stats(after,g)};
  newOrder.push(...after);
}
console.log(JSON.stringify(report,null,1));
if(WRITE){
  const byId=Object.fromEntries(items.map(i=>[i.id,i.line]));
  const body=newOrder.map(id=>byId[id]).join(",\n");
  const header=c.slice(start,c.indexOf("\n",start)+1);
  fs.writeFileSync("js/content.js",c.slice(0,start)+header+body+c.slice(end));
  console.log("written", newOrder.length);
}
