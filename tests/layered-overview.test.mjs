import test from 'node:test';import assert from 'node:assert/strict';import fs from'node:fs';
import{createOverviewAssembly,layeredOverviewMarkup,mapLevel,pointInPolygon,overviewLabelLayout}from'../src/explorer/layered-overview.js';
import{mapMetrics,placeMapLabels}from'../src/explorer/map-labels.js';
import{createTransform}from'../src/domain/spatial.js';import{overlaps}from'../src/domain/map-assembly.js';
const read=n=>JSON.parse(fs.readFileSync('content/public/'+n+'.json'));
const transform=createTransform(read('orientation').bounds),registration=read('overview-registration');
const assets=read('manifest').moduleAssets,loaded=Object.keys(assets).filter(k=>k.startsWith('painted-'));
const assembly=createOverviewAssembly(read('scene-composition'),read('map-context'),registration,transform,assets);
test('consumer uses separate road/context/solid groups and no overview person',()=>{
 assert.deepEqual([1,1.8,2.7].map(mapLevel),[0,1,2]);
 for(const zoom of[1,1.8,2.7]){
  const markup=layeredOverviewMarkup(assembly,assets,{periodId:'window-2000',camera:{zoom}},loaded);
  for(const layer of['pale-context','road-art','solid-places'])assert.ok(markup.includes(`data-layer="${layer}"`));
  assert.ok(!markup.includes('preserveAspectRatio="none"'));assert.ok(markup.includes('xinhua-painted-r5/'));
  assert.ok(!markup.includes('data-map-person'));
  for(const id of['qili','wuli-west','wuli-east','sanli','yili','bali','liuli','sili','erli','heating','school'])assert.ok(markup.includes(`data-compound-ground="${id}"`),id+' remains visible at every tier');
  const visible=markup.replace(/<defs>[\s\S]*?<\/defs>/g,'');
  assert.doesNotMatch(visible,/<(?:path|rect|polygon|ellipse|circle|line)\b/,'SVG geometry is invisible registration only');
  assert.match(visible,/data-frontage="sanli-opposite-detached-frontage"/);
  if(markup.includes('<image'))assert.match(markup,/preserveAspectRatio="xMidY(?:Mid|Max) meet"/);
 }
 assert.ok(assembly.model.roads.some(r=>r.states[0].bands.some(b=>b.role==='service')),'Source service roads have independent reservations');
 assert.ok(assembly.model.roads.flatMap(r=>r.states.flatMap(s=>s.parts)).some(p=>p.kind==='retaining-wall'));
});
test('unassociated life stage and failed image loads cannot introduce invented vector fallback art',()=>{
 const render=(periodId,available)=>layeredOverviewMarkup(assembly,assets,{periodId,camera:{zoom:1.8}},available);
 assert.ok(!render('stage-primary',loaded).includes('data-map-object='));
 assert.doesNotMatch(render('stage-primary',loaded),/data-compound-ground=|data-part=|data-frontage=/);
 assert.doesNotMatch(render('window-1995',loaded),/data-compound-ground=|data-part=|data-frontage=/,'new approximate composite is not silently asserted in an earlier window');
 assert.doesNotMatch(render('window-2000',[]),/<image\b|data-compound-ground=|data-map-object=/);
 const withoutSanli=render('window-2000',loaded.filter(k=>k!=='painted-sanli'));
 assert.doesNotMatch(withoutSanli,/data-compound-ground="sanli"|data-compound="sanli"/);
 assert.match(withoutSanli,/data-compound="qili"/);
 const legacy={...assembly,painted:null};
 assert.doesNotMatch(layeredOverviewMarkup(legacy,assets,{periodId:'window-2000',camera:{zoom:1.8}},loaded,{includeLabels:false}),/<(?:path|rect|polygon|ellipse|circle|line|image)\b/,'no legacy visible SVG path when painted configuration is absent');
});
test('painted frames preserve geographic ground anchors, tall storeys and one scalar at every tier',()=>{
 for(const c of assembly.painted.compounds){
  const a=assets[c.assetRef],u=c.frame.modelUnitsPerPixel;
  assert.ok(Math.abs(c.rect[2]/c.rect[3]-a.width/a.height)<1e-9,'no independent width/height fit');
  assert.equal(c.rect[2],a.width*u);assert.equal(c.rect[3],a.height*u);
  for(const p of c.parts){
   assert.deepEqual(p.origin,transform.toImage(p.anchorGeo));
   assert.deepEqual(p.ground,p.groundGeo.map(transform.toImage));
   if(p.kind==='tower')assert.ok(p.storeys>=23&&p.heightMetres>=60,'dense high-rise class is retained');
  }
 }
 const anchors=zoom=>[...layeredOverviewMarkup(assembly,assets,{periodId:'window-2000',camera:{zoom}},loaded).matchAll(/data-ground-anchor="([^"]+)"/g)].map(m=>m[1]);
 assert.deepEqual(anchors(1),anchors(2.7),'camera zoom never repositions a building');
});
const pointSegmentDistance=(p,a,b)=>{
 const dx=b[0]-a[0],dy=b[1]-a[1],length=dx*dx+dy*dy,t=length?Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/length)):0;
 return Math.hypot(p[0]-a[0]-dx*t,p[1]-a[1]-dy*t);
};
const cross=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
const segmentDistance=(a,b,c,d)=>cross(a,b,c)*cross(a,b,d)<0&&cross(c,d,a)*cross(c,d,b)<0?0:Math.min(pointSegmentDistance(a,c,d),pointSegmentDistance(b,c,d),pointSegmentDistance(c,a,b),pointSegmentDistance(d,a,b));
function groundOverlap(a,b){
 for(const poly of[a,b])for(let i=0;i<poly.length;i++){
  const p=poly[i],q=poly[(i+1)%poly.length],axis=[q[1]-p[1],p[0]-q[0]],project=poly=>poly.map(v=>v[0]*axis[0]+v[1]*axis[1]),aa=project(a),bb=project(b);
  if(Math.max(...aa)<=Math.min(...bb)||Math.max(...bb)<=Math.min(...aa))return false;
 }
 return true;
}
test('compound bodies and detached shops have separate ground space and keep the public corridor clear',()=>{
 const roads=[...assembly.data.roads,...assembly.context.roads].filter(r=>['新华街','西四环南路','丰台南路','造甲街'].includes(r.label));
 for(const c of assembly.painted.compounds){
  const parts=[...c.parts,...assembly.painted.frontages.filter(f=>f.compoundId===c.id)];
  for(let i=0;i<parts.length;i++)for(let j=i+1;j<parts.length;j++)assert.ok(!groundOverlap(parts[i].ground,parts[j].ground),parts[i].id+' / '+parts[j].id);
  for(const p of parts)for(const road of roads){
   const radius=(road.class==='ring'?12:road.class==='focus'?8:road.role==='service'?4.5:10)/2;let distance=Infinity;
   for(let i=0;i<p.ground.length;i++)for(let j=1;j<road.art.length;j++)distance=Math.min(distance,segmentDistance(p.ground[i],p.ground[(i+1)%p.ground.length],road.art[j-1],road.art[j]));
   assert.ok(distance>=radius+1,p.id+' intrudes into '+road.label);
  }
 }
 const markup=layeredOverviewMarkup(assembly,assets,{periodId:'window-2000',camera:{zoom:1.8}},loaded);
 const roadMask=markup.match(/<mask id="painted-road-clear"[\s\S]*?<\/mask>/)[0];
 const internal=assembly.context.roads.find(r=>r.id==='osm-way-1031923867');
 assert.ok(!roadMask.includes('M'+internal.art.map(p=>p.join(',')).join('L')),'an unnamed campus drive does not cut a road-shaped hole through the painted yard');
});
test('building anchors are projected from source coordinates; all Sanli towers stay in Sanli and retain their image proportions',()=>{
 const sanli=assembly.parcels.find(p=>p.label==='新华街三里'),wuli=assembly.parcels.find(p=>p.label==='新华街五里');
 const fronts=assembly.painted.compounds.find(c=>c.id==='sanli').parts.filter(p=>p.sourceFeatureId);
 assert.equal(fronts.length,3);
 for(const p of fronts){
  const f=registration.features.find(f=>f.id===p.sourceFeatureId);
  assert.equal(f.placeId,'place-sanli');assert.deepEqual(p.origin,transform.toImage(f.geo));
  assert.ok(pointInPolygon(p.origin,sanli.art));assert.ok(!pointInPolygon(p.origin,wuli.art));
  assert.ok(!assembly.model.features.some(f=>f.id===p.sourceFeatureId),'detailed footprint replaces the obsolete glyph reservation');
 }
 for(const f of assembly.model.features)for(const rep of Object.values(f.states[0].representations)){
  assert.deepEqual(rep.groundAnchor,transform.toImage(f.geo),'No geographic displacement for icon layout');
  if(f.kind==='tower'){
   assert.equal(f.placeId,'place-sanli');assert.ok(pointInPolygon(rep.groundAnchor,sanli.art));assert.ok(!pointInPolygon(rep.groundAnchor,wuli.art));
   assert.equal(rep.bounds[2],f.ground[2]);if(assets[rep.assetRef])assert.ok(Math.abs(rep.bounds[2]/rep.bounds[3]-assets[rep.assetRef].width/assets[rep.assetRef].height)<1e-9);
  }
 }
 const changed=structuredClone(registration);changed.features.find(f=>f.kind==='tower').geo=transform.fromImage([630,800]);
 assert.throws(()=>createOverviewAssembly(read('scene-composition'),read('map-context'),changed,transform,assets),/outside its geographic parcel/);
 const invalid=structuredClone(registration),body=invalid.paintedOverview.compounds.find(c=>c.id==='sanli').parts[0];
 body.groundGeo=body.groundGeo.map(g=>{const[x,y]=transform.toImage(g);return transform.fromImage([x,y+30]);});
 assert.throws(()=>createOverviewAssembly(read('scene-composition'),read('map-context'),invalid,transform,assets),/Painted footprint overlaps road/,'detailed geometry retains an executable road-clearance gate');
});
test('photo-informed Sanli keeps the three-front/two-rear families and an open shared court',()=>{
 const c=assembly.painted.compounds.find(c=>c.id==='sanli'),front=c.parts.filter(p=>p.appearanceFamily==='cream-red-cap'),rear=c.parts.filter(p=>p.appearanceFamily==='green-flat-top'),slabs=c.parts.filter(p=>p.kind==='slab');
 assert.equal(front.length,3);assert.equal(rear.length,2);assert.equal(slabs.length,5);
 const a=front[0].origin,b=front[2].origin,m=front[1].origin;
 assert.ok(Math.abs(cross(a,b,m))/Math.hypot(b[0]-a[0],b[1]-a[1])<1,'front towers share one row, not a longitudinal alternating arrangement');
 assert.ok(rear.every(p=>p.origin[1]<Math.min(...front.map(p=>p.origin[1]))));
 const court=c.openSpaces.find(s=>s.id==='sanli-main-court').groundGeo.map(transform.toImage);
 for(const p of c.parts)assert.ok(!groundOverlap(p.ground,court),'court stays open: '+p.id);
 const edge=p=>p.ground[1].map((v,i)=>v-p.ground[0][i]),u=edge(slabs[0]),v=edge(slabs.at(-1));
 assert.ok(Math.abs(u[0]*v[0]+u[1]*v[1])/Math.hypot(...u)/Math.hypot(...v)<.03,'eastern slab runs perpendicular to the other rows');
});
test('street endpoints keep their source continuation across the selected/context boundary',()=>{
 const selected=assembly.data.roads.find(r=>r.class==='focus'),end=selected.art.at(-1);
 assert.ok(assembly.context.roads.some(r=>r.art.some(p=>Math.hypot(p[0]-end[0],p[1]-end[1])<.02)),'Xinhua has a mapped continuation, not an invented extension');
});
test('labels retain readable screen size and no collisions at desktop, screenshot and phone sizes',()=>{
 for(const[width,height]of[[1440,900],[1011,810],[390,844]])for(const zoom of[1,1.8,2.7]){
  const metrics=mapMetrics({zoom},width,height,width<560?height*1.05:Math.max(height,width*.7));
  const layout=overviewLabelLayout(assembly,{periodId:'window-2000',camera:{zoom}},loaded,metrics);
  assert.ok(layout.labels.length>0);assert.ok(layout.labels.length<=layout.countLimit);assert.ok(layout.characters<=layout.characterLimit);
  for(const l of layout.labels){assert.ok(l.fontPx>=18);assert.ok(Math.abs(l.fontUnits*metrics.scale-l.fontPx)<1e-9);const[x,y,w,h]=l.screenBounds;assert.ok(x>=12&&y>=12&&x+w<=width-12&&y+h<=height-12);}
  for(let i=0;i<layout.labels.length;i++)for(let j=i+1;j<layout.labels.length;j++)assert.ok(!overlaps(layout.labels[i].screenBounds,layout.labels[j].screenBounds));
 }
});
test('dense labels drop lower priorities instead of shrinking names',()=>{
 const candidates=Array.from({length:25},(_,i)=>({id:String(i),text:'记忆地点',kind:'place',priority:25-i,minLevel:0,positions:[[600,600]]}));
 const result=placeMapLabels(candidates,[],mapMetrics({zoom:1},1011,810,810),0);
 assert.equal(result.labels.length,1);assert.equal(result.labels[0].id,'0');assert.equal(result.labels[0].fontPx,23);
});
