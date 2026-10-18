/** Ground remains registered; each raised part is placed by one uniform scale and a ground origin. */
const path=p=>'M'+p.map(v=>v.join(',')).join(' L')+'Z';
const box=p=>{const xs=p.map(v=>v[0]),ys=p.map(v=>v[1]);return[Math.min(...xs),Math.min(...ys),Math.max(...xs),Math.max(...ys)];};
const inside=(p,poly)=>{let on=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[i],b=poly[j];if((a[1]>p[1])!==(b[1]>p[1])&&p[0]<(b[0]-a[0])*(p[1]-a[1])/(b[1]-a[1])+a[0])on=!on;}return on;};
const nearRoad=(p,roads)=>roads.some(r=>r.art.slice(1).some((b,i)=>{const a=r.art[i],dx=b[0]-a[0],dy=b[1]-a[1],t=Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/(dx*dx+dy*dy||1)));return Math.hypot(p[0]-a[0]-t*dx,p[1]-a[1]-t*dy)<(r.class==='ring'?10:7);}));
export function compileCompoundTrials(registration,transform,assets,options={}) {
 return (registration.trialCompounds||[]).map(c=>{
  const mask=c.contextMaskGeo.map(transform.toImage),bounds=box(mask),anchor=transform.toImage(c.geo);
  const parts=(c.parts||[]).map(p=>{const ground=p.groundGeo.map(transform.toImage),origin=transform.toImage(p.anchorGeo);for(const r of Object.values(p.representations))if(r.assetRef&&(!assets[r.assetRef]||!(r.modelUnitsPerPixel>0)))throw new Error('Invalid map part '+p.id);return{...p,ground,origin,depth:Math.max(...ground.map(v=>v[1]))};});
  const[x0,y0,x1,y1]=bounds,trees=[];
  // Small young trees inside compounds; never a roadside avenue of large trees.
  for(let i=0;i<12&&trees.length<4;i++){const x=x0+5+(x1-x0-10)*((i*.618+.21)%1),y=y0+5+(y1-y0-10)*((i*.437+.34)%1),p=[x,y];if(!inside(p,mask)||parts.some(b=>inside(p,b.ground))||nearRoad(p,options.roads||[]))continue;trees.push({x,y,size:1.6+(i%3)*.35});}
  return {...c,mask,bounds,anchor,parts,trees};
 });
}
export const visibleCompoundTrials=(assembly,state,available)=>assembly.compounds.filter(c=>c.periodIds.includes(state.periodId)&&c.parts.some(p=>Object.values(p.representations).some(r=>r.assetRef&&available.includes(r.assetRef))));
export function compoundGroundMarkup(compounds,level){
 return `<g data-layer="compound-ground" mask="url(#compound-road-clear)">${compounds.map(c=>{
  const[x0,y0,x1,y1]=c.bounds,w=x1-x0,h=y1-y0,id='yard-'+c.id;let grass='',wear='',clutter='';
  let seed=[...c.id].reduce((n,ch)=>n*31+ch.charCodeAt(0),29)>>>0;const rand=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
  for(let n=0;n<36;n++){
   const x=x0+rand()*w,y=y0+rand()*h,cw=w*(.09+rand()*.15),ch=h*(.065+rand()*.12);
   grass+=`<path d="M${x},${y}q${cw*.3},-${ch*.3} ${cw*.7},-${ch*.1}q${cw*.45},${ch*.25} ${cw*.18},${ch*.76}q-${cw*.28},${ch*.4} -${cw*.9},${ch*.12}q-${cw*.22},-${ch*.3} ${cw*.02},-${ch*.78}Z" fill="${n%3?'#aeb58c':'#b5b697'}" opacity=".45"/>`;
   if(n%3===0)wear+=`<ellipse cx="${x+cw*.48}" cy="${y+ch*.35}" rx="${cw*.27}" ry="${ch*.25}" fill="#cebea3" opacity=".62"/>`;
   if(level>0&&n%9===0)clutter+=`<path d="M${x+1},${y+2}l1.8,-.2l.2,1.1l-2,.3Z m2.4,.1l1.5,.2l-.1,.8l-1.4,-.1Z" fill="#958b79" opacity=".55"/>`;
  }
  return `<defs><clipPath id="${id}"><path d="${path(c.mask)}"/></clipPath><mask id="${id}-open" maskUnits="userSpaceOnUse" x="${x0}" y="${y0}" width="${w}" height="${h}"><rect x="${x0}" y="${y0}" width="${w}" height="${h}" fill="white"/>${c.parts.map(p=>`<path d="${path(p.ground)}" fill="black"/>`).join('')}</mask></defs><g clip-path="url(#${id})" mask="url(#${id}-open)" filter="url(#loose-edge)"><path d="${path(c.mask)}" fill="#d8d0bb" opacity=".36"/>${grass}${wear}${clutter}</g>`;
 }).join('')}</g>`;
}
export function footprintSketch(p,level,brick=false){
 const ground=p.ground,roof=ground.map(([x,y])=>[x,y-p.height]);let sides='',dots='';
 for(let i=0;i<ground.length;i++){
  const j=(i+1)%ground.length,a=ground[i],b=ground[j],front=a[0]>b[0],fill=brick?(front?'#bb8068':'#997260'):(front?'#e3d3b4':'#bcc5b7');
  sides+=`<path d="${path([a,b,roof[j],roof[i]])}" fill="${fill}" stroke="#888773" stroke-width=".65"/>`;
  if(front&&a[0]-b[0]>3){const cols=level===0?2:Math.min(5,Math.max(2,Math.round((a[0]-b[0])/5))),rows=level===0?1:2;for(let col=0;col<cols;col++)for(let row=0;row<rows;row++){const t=(col+.5)/cols,x=a[0]+(b[0]-a[0])*t,y=a[1]+(b[1]-a[1])*t-p.height*(row+.6)/(rows+.25);dots+=`<path d="M${x-.35},${y}l.7,-.08" stroke="${brick?'#786e5c':'#6f8d8a'}" stroke-width=".9" stroke-linecap="round"/>`;}}
 }
 return `<g filter="url(#loose-edge)">${sides}<path d="${path(roof)}" fill="#a6afa2" stroke="#888773" stroke-width=".65"/>${dots}</g>`;
}
export function compoundStandingEntries(compounds,assets,level,available,screenScale=1){
 const entries=[];
 for(const c of compounds){for(const p of c.parts){const r=p.representations[level],candidate=r?.assetRef&&available.includes(r.assetRef)?assets[r.assetRef]:null,ratio=r?.modelUnitsPerPixel?1/(r.modelUnitsPerPixel*screenScale):0,a=candidate&&ratio>=.8&&ratio<=1.5?candidate:null;let html;
  if(a){const u=r.modelUnitsPerPixel,x=p.origin[0]-r.sourceAnchor[0]*u,y=p.origin[1]-r.sourceAnchor[1]*u;html=`<image data-part="${p.id}" data-uniform-scale="${u}" x="${x}" y="${y}" width="${a.width*u}" height="${a.height*u}" preserveAspectRatio="xMidYMid meet" href="${a.url}"/>`;}
  else html=`<g data-part="${p.id}" data-part-fallback="footprint-sketch">${footprintSketch(p,level,c.id==='liuli')}</g>`;
  entries.push({id:p.id,depth:p.depth,html:`<g data-compound="${c.id}" data-ground-anchor="${p.origin.join(',')}">${html}</g>`});
 }
 for(const t of c.trees){const r=t.size;entries.push({id:c.id+'-tree-'+t.x,depth:t.y,html:`<g data-yard-tree="${c.id}"><path d="M${t.x},${t.y}l-.15,-${r*2.2}" stroke="#98866a" stroke-width=".65"/><ellipse cx="${t.x-r*.25}" cy="${t.y-r*2.15}" rx="${r*.78}" ry="${r*.95}" fill="#96a582" opacity=".8"/><ellipse cx="${t.x+r*.4}" cy="${t.y-r*2.1}" rx="${r*.7}" ry="${r*.82}" fill="#b1b890" opacity=".8"/></g>`});}
 }
 return entries;
}
