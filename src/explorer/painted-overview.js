/** Raster imagery owns visible art. SVG paths below are invisible registration masks only. */
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const path=points=>'M'+points.map(p=>p.join(',')).join('L')+'Z';
const bounds=points=>{const x=Math.min(...points.map(p=>p[0])),y=Math.min(...points.map(p=>p[1]));return[x,y,Math.max(...points.map(p=>p[0]))-x,Math.max(...points.map(p=>p[1]))-y];};
const hull=points=>{
 const ps=[...points].sort((a,b)=>a[0]-b[0]||a[1]-b[1]),cross=(o,a,b)=>(a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0]);
 const lo=[],hi=[];for(const p of ps){while(lo.length>=2&&cross(lo.at(-2),lo.at(-1),p)<=0)lo.pop();lo.push(p);}for(const p of ps.toReversed()){while(hi.length>=2&&cross(hi.at(-2),hi.at(-1),p)<=0)hi.pop();hi.push(p);}return lo.slice(0,-1).concat(hi.slice(0,-1));
};
const image=(asset,rect,extra='')=>`<image ${extra} x="${rect[0]}" y="${rect[1]}" width="${rect[2]}" height="${rect[3]}" preserveAspectRatio="xMidYMid meet" href="${esc(asset.url)}"/>`;
const roadWidth=r=>r.class==='ring'?12:r.class==='primary'||r.class==='secondary'?10:r.role==='service'||r.class==='service'?4.5:r.class==='focus'?8:r.width<=3?2.8:7;
const pointSegmentDistance=(p,a,b)=>{
 const dx=b[0]-a[0],dy=b[1]-a[1],length=dx*dx+dy*dy,t=length?Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/length)):0;
 return Math.hypot(p[0]-a[0]-dx*t,p[1]-a[1]-dy*t);
};
const cross=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
const segmentDistance=(a,b,c,d)=>cross(a,b,c)*cross(a,b,d)<0&&cross(c,d,a)*cross(c,d,b)<0?0:Math.min(pointSegmentDistance(a,c,d),pointSegmentDistance(b,c,d),pointSegmentDistance(c,a,b),pointSegmentDistance(d,a,b));

export function compilePaintedOverview(registration,transform,assets,options={}){
 const source=registration.paintedOverview;if(!source)return null;
 if(source.projectionId!=='north-up-orthographic-rise-r1')throw new Error('Painted overview projection mismatch');
 const compounds=source.compounds.map(c=>{
  const asset=assets[c.assetRef],u=c.frame.modelUnitsPerPixel,o=c.frame.sourceOrigin;
  if(!asset||!(u>0)||o.length!==2||!o.every(Number.isFinite))throw new Error('Invalid painted compound frame '+c.id);
  const mask=c.contextMaskGeo.map(transform.toImage),parts=c.parts.map(p=>{
   const ground=p.groundGeo.map(transform.toImage),height=p.heightMetres*transform.scale;
   const sourceGround=(p.sourceGroundGeo||p.groundGeo).map(transform.toImage);
   let sourceSilhouette=hull([...sourceGround,...sourceGround.map(([x,y])=>[x,y-height])]);
   if(p.paintBounds){
    const[x,y,w,h]=p.paintBounds;
    if(!p.paintBounds.every(Number.isFinite)||w<=0||h<=0||x<0||y<0||x+w>asset.width||y+h>asset.height)throw new Error('Invalid painted source bounds: '+p.id);
    sourceSilhouette=[[x,y],[x+w,y],[x+w,y+h],[x,y+h]].map(([x,y])=>[(x-o[0])*u,(y-o[1])*u]);
   }
   const origin=transform.toImage(p.anchorGeo),sourceOrigin=transform.toImage(p.sourceAnchorGeo||p.anchorGeo),translation=origin.map((v,i)=>v-sourceOrigin[i]);
   const silhouette=sourceSilhouette.map(p=>p.map((v,i)=>v+translation[i]));
   if(p.sourceFeatureId){
    const f=registration.features.find(f=>f.id===p.sourceFeatureId);
    if(!f||f.geo.some((v,i)=>Math.abs(v-p.anchorGeo[i])>1e-9))throw new Error('Painted feature anchor mismatch: '+p.id);
    // Preserve the road-clearance gate with the detailed polygon instead of the
    // retired axis-aligned glyph rectangle, whose corners over-reserved space.
    for(const road of options.roads||[])for(let i=1;i<road.art.length;i++)for(let j=0;j<ground.length;j++)if(segmentDistance(ground[j],ground[(j+1)%ground.length],road.art[i-1],road.art[i])<roadWidth(road)/2+2)throw new Error('Painted footprint overlaps road: '+p.id);
   }
   return {...p,ground,height,silhouette,sourceSilhouette,translation,visualBounds:bounds(silhouette),origin,depth:Math.max(...ground.map(p=>p[1]))};
  });
  return {...c,mask,bounds:bounds(mask),parts,rect:[-o[0]*u,-o[1]*u,asset.width*u,asset.height*u],anchor:mask.reduce((a,p)=>[a[0]+p[0]/mask.length,a[1]+p[1]/mask.length],[0,0])};
 });
 const landmarks=source.landmarks.map(l=>{const f=registration.features.find(f=>f.id===l.featureId),a=assets[l.assetRef];if(!f||!a)throw new Error('Invalid painted landmark '+l.featureId);const groundAnchor=transform.toImage(f.geo),height=l.width*a.height/a.width;return {...l,groundAnchor,rect:[groundAnchor[0]-l.width*l.sourceAnchor[0],groundAnchor[1]-height*l.sourceAnchor[1],l.width,height]};});
 const frontages=(source.frontages||[]).map(f=>{
  const a=assets[f.assetRef];if(!a)throw new Error('Invalid painted frontage '+f.id);
  const groundAnchor=transform.toImage(f.anchorGeo),width=f.widthMetres*transform.scale,height=width*a.height/a.width;
  return {...f,ground:f.groundGeo.map(transform.toImage),groundAnchor,rect:[groundAnchor[0]-width*f.sourceAnchor[0],groundAnchor[1]-height*f.sourceAnchor[1],width,height]};
 });
 if(!assets[source.base.assetRef])throw new Error('Missing painted ground');
 return {...source,compounds,landmarks,frontages};
}

export const visiblePaintedCompounds=(assembly,state,available)=>assembly.painted.compounds.filter(c=>c.periodIds.includes(state.periodId)&&available.includes(c.assetRef));
export function paintedOverviewMarkup(assembly,assets,state,available){
 const painted=assembly.painted,compounds=visiblePaintedCompounds(assembly,state,available),defs=[],ground=[],standing=[];
 // Full original road painting uses the same fixed world frame as all compound patches.
 const base=available.includes(painted.base.assetRef)?image(assets[painted.base.assetRef],painted.base.bounds,'data-raster-ground="true"'):'';
 const publicRoads=[...assembly.context.roads,...assembly.data.roads].filter(r=>r.label||r.class==='focus'||r.class==='ring'||r.role==='service');
 const roadMasks=publicRoads.map(r=>`<path d="M${r.art.map(p=>p.join(',')).join('L')}" fill="none" stroke="black" stroke-width="${roadWidth(r)+2}" stroke-linecap="round" stroke-linejoin="round"/>`).join('');
 defs.push(`<mask id="painted-road-clear" maskUnits="userSpaceOnUse" x="-1500" y="-1500" width="4500" height="4500"><rect x="-1500" y="-1500" width="4500" height="4500" fill="white"/>${roadMasks}</mask>`);
 for(const c of compounds){
  const clip='painted-yard-'+c.id;defs.push(`<clipPath id="${clip}"><path d="${path(c.mask)}"/></clipPath>`);
  const clear='painted-standing-clear-'+c.id;
  defs.push(`<mask id="${clear}" maskUnits="userSpaceOnUse" x="-1500" y="-1500" width="4500" height="4500"><rect x="-1500" y="-1500" width="4500" height="4500" fill="white"/>${c.parts.map(p=>`<path d="${path(p.sourceSilhouette)}" fill="black" stroke="black" stroke-width="8" stroke-linejoin="round"/>`).join('')}</mask>`);
  ground.push(`<g data-compound-ground="${esc(c.id)}" clip-path="url(#${clip})" mask="url(#painted-road-clear)"><g mask="url(#${clear})">${image(assets[c.assetRef],c.rect)}</g></g>`);
  for(const p of c.parts){
   const id='painted-body-'+p.id,[x,y,w,h]=p.visualBounds,pad=4;
   defs.push(`<mask id="${id}" maskUnits="userSpaceOnUse" x="${x-pad}" y="${y-pad}" width="${w+2*pad}" height="${h+2*pad}"><path d="${path(p.silhouette)}" fill="white" stroke="white" stroke-width="${pad*2}" stroke-linejoin="round"/></mask>`);
   const rect=c.rect.map((v,i)=>i<2?v+p.translation[i]:v);
   standing.push({id:p.id,depth:p.depth,html:`<g data-compound="${esc(c.id)}" data-part="${esc(p.id)}" data-storeys="${p.storeys}" data-kind="${p.kind}" data-ground-anchor="${p.origin.join(',')}" mask="url(#${id})">${image(assets[c.assetRef],rect,'data-uniform-scale="'+c.frame.modelUnitsPerPixel+'"')}</g>`});
  }
 }
 if(['window-2000','window-1995'].includes(state.periodId))for(const l of painted.landmarks)if(available.includes(l.assetRef))standing.push({id:l.featureId,depth:l.groundAnchor[1],html:`<g data-map-object="${esc(l.featureId)}">${image(assets[l.assetRef],l.rect)}</g>`});
 for(const f of painted.frontages)if(f.periodIds.includes(state.periodId)&&available.includes(f.assetRef)){
  const id='painted-frontage-'+f.id,[x,y,w,h]=f.rect;
  defs.push(`<clipPath id="${id}"><path d="${path(f.sourceClip.map(([u,v])=>[x+u*w,y+v*h]))}"/></clipPath>`);
  standing.push({id:f.id,depth:f.groundAnchor[1],html:`<g data-frontage="${esc(f.id)}" data-kind="shop" clip-path="url(#${id})">${image(assets[f.assetRef],f.rect)}</g>`});
 }
 return `<defs>${defs.join('')}</defs><g data-layer="pale-context">${base}</g><g data-layer="road-art" data-raster-roads="true"></g><g data-layer="compound-ground">${ground.join('')}</g><g data-layer="solid-places">${standing.sort((a,b)=>a.depth-b.depth||a.id.localeCompare(b.id)).map(s=>s.html).join('')}</g>`;
}
