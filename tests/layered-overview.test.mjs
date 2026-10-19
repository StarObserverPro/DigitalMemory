import test from 'node:test';import assert from 'node:assert/strict';import fs from'node:fs';
import{createOverviewAssembly,layeredOverviewMarkup,mapLevel,pointInPolygon,overviewLabelLayout}from'../src/explorer/layered-overview.js';
import{mapMetrics,placeMapLabels}from'../src/explorer/map-labels.js';
import{createTransform}from'../src/domain/spatial.js';import{overlaps}from'../src/domain/map-assembly.js';
const read=n=>JSON.parse(fs.readFileSync('content/public/'+n+'.json'));
const transform=createTransform(read('orientation').bounds),registration=read('overview-registration');
const assets=read('manifest').moduleAssets,loaded=Object.keys(assets).filter(k=>k.startsWith('painted-'));
const make=reg=>createOverviewAssembly(read('scene-composition'),read('map-context'),reg,transform,assets);
const assembly=make(registration),parts=assembly.painted.compounds.flatMap(c=>c.parts);
const render=(zoom=1.8,available=loaded,periodId='window-2000')=>layeredOverviewMarkup(assembly,assets,{periodId,camera:{zoom}},available);

test('consumer uses raster artwork at all three detail levels and no overview person',()=>{
 assert.deepEqual([1,1.8,2.7].map(mapLevel),[0,1,2]);
 for(const zoom of[1,1.8,2.7]){
  const markup=render(zoom);
  for(const layer of['pale-context','road-art','solid-places'])assert.match(markup,new RegExp(`data-layer="${layer}"`));
  assert.match(markup,/xinhua-wax-r6\//);assert.doesNotMatch(markup,/data-map-person|preserveAspectRatio="none"/);
  for(const id of['qili','wuli-west','wuli-east','sanli','yili','bali','liuli','sili','erli','heating','school'])assert.ok(markup.includes(`data-compound="${id}"`));
  assert.doesNotMatch(markup.replace(/<defs>[\s\S]*?<\/defs>/g,''),/<(?:path|rect|polygon|ellipse|circle|line)\b/,'no visible vector illustration');
  if(zoom>=1.5)assert.match(markup,/data-frontage="sanli-opposite-detached-frontage"/);
  assert.match(markup,new RegExp(`data-detail-level="${mapLevel(zoom)}"`));
 }
});
test('unassociated periods and failed images cannot create fallback buildings',()=>{
 for(const period of['stage-primary','window-1995'])assert.doesNotMatch(render(1.8,loaded,period),/data-part=|data-frontage=|data-registered-corridor=/);
 assert.doesNotMatch(render(1.8,[]),/<image\b|data-part=|data-map-object=/);
 const missing=render(1.8,loaded.filter(k=>k!=='painted-sanli-r6-1'));
 assert.doesNotMatch(missing,/data-compound="sanli"/);assert.match(missing,/data-compound="qili"/);
 assert.equal(layeredOverviewMarkup({...assembly,painted:null},assets,{periodId:'window-2000',camera:{zoom:1.8}},loaded,{includeLabels:false}),'');
});
test('source-linked masses retain geographic XY and evidenced height at every level',()=>{
 const plan=JSON.parse(fs.readFileSync('content/reference/xinhua-spatial-plan.json'));
 assert.equal(parts.length,plan.objects.length);assert.ok(parts.length>100);assert.equal(new Set(parts.map(p=>p.id)).size,parts.length);
 for(const p of parts){
  const source=plan.objects.find(o=>o.id===p.id);
  assert.deepEqual(p.groundGeo,source.geometry.coordinates[0].slice(0,-1));
  assert.deepEqual(p.ground,p.groundGeo.map(transform.toImage));assert.deepEqual(p.origin,transform.toImage(p.anchorGeo));
  assert.ok(p.heightEvidence.sources.length);assert.ok(p.heightEvidence.storeyRange[0]<=p.storeys&&p.heightEvidence.storeyRange[1]>=p.storeys);
  if(p.kind==='tower')assert.ok(p.storeys>=23&&p.heightMetres>=65);
  for(const level of[0,1,2]){const r=p.levels[level],a=assets[r.assetRef];assert.ok(r.crop[0]+r.crop[2]<=a.width&&r.crop[1]+r.crop[3]<=a.height);assert.ok(Math.abs(r.crop[2]/r.crop[3]-p.visualBounds[2]/p.visualBounds[3])<1e-9);}
 }
 const anchors=zoom=>Object.fromEntries([...render(zoom).matchAll(/data-part="([^"]+)"[^>]+data-ground-anchor="([^"]+)"/g)].map(m=>[m[1],m[2]]));
 const far=anchors(1),near=anchors(2.7);for(const[id,anchor]of Object.entries(far))assert.equal(near[id],anchor);
 assert.ok(Object.keys(far).length<Object.keys(near).length,'far view suppresses tiny low-rise clutter');
 assert.notEqual(assets['painted-sanli-r6-0'].sha256,assets['painted-sanli-r6-2'].sha256);
});
const cross=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
const properIntersection=(a,b,c,d)=>cross(a,b,c)*cross(a,b,d)<-1e-8&&cross(c,d,a)*cross(c,d,b)<-1e-8;
const strictlyInside=(p,poly)=>pointInPolygon(p,poly)&&poly.every((a,i)=>{const b=poly[(i+1)%poly.length];return Math.abs(cross(a,b,p))>1e-7||p[0]<Math.min(a[0],b[0])-1e-7||p[0]>Math.max(a[0],b[0])+1e-7||p[1]<Math.min(a[1],b[1])-1e-7||p[1]>Math.max(a[1],b[1])+1e-7;});
const groundOverlap=(a,b)=>a.some((p,i)=>b.some((q,j)=>properIntersection(p,a[(i+1)%a.length],q,b[(j+1)%b.length])))||a.some(p=>strictlyInside(p,b))||b.some(p=>strictlyInside(p,a));
test('independent buildings and detached shops do not occupy the same ground',()=>{
 for(let i=0;i<parts.length;i++)for(let j=i+1;j<parts.length;j++)assert.ok(!groundOverlap(parts[i].ground,parts[j].ground),parts[i].id+' / '+parts[j].id);
});
test('road clearance rejects a displaced non-landmark building',()=>{
 const changed=structuredClone(registration),p=changed.paintedOverview.compounds.find(c=>c.id==='liuli').parts.find(p=>p.kind==='slab');
 const road=assembly.data.roads.find(r=>r.label==='新华街'),target=road.art[Math.floor(road.art.length/2)],center=transform.toImage(p.anchorGeo),delta=target.map((n,i)=>n-center[i]);
 p.groundGeo=p.groundGeo.map(g=>transform.fromImage(transform.toImage(g).map((n,i)=>n+delta[i])));
 assert.throws(()=>make(changed),/Painted footprint overlaps road/);
 const missing=structuredClone(registration);delete missing.paintedOverview.compounds[0].parts[0].heightEvidence;
 assert.throws(()=>make(missing),/Missing geographic\/height evidence/);
});
test('Sanli families, Wuli curved perimeter, Bali towers and retrieved school boundary persist',()=>{
 const sanli=assembly.painted.compounds.find(c=>c.id==='sanli'),front=sanli.parts.filter(p=>p.appearanceFamily==='cream-red-cap'),rear=sanli.parts.filter(p=>p.appearanceFamily==='green-flat-top');
 assert.equal(front.length,3);assert.equal(rear.length,2);assert.ok(front.every(p=>p.storeys===23));
 assert.ok(rear.every(p=>p.origin[1]<Math.min(...front.map(p=>p.origin[1]))));
 for(const p of front){assert.ok(pointInPolygon(p.origin,sanli.mask));assert.ok(!assembly.model.features.some(f=>f.id===p.sourceFeatureId));}
 const curved=parts.filter(p=>p.id.startsWith('wuli-east-'));assert.equal(curved.length,2);assert.ok(curved.every(p=>p.ground.length>=12));
 assert.equal(assembly.painted.compounds.find(c=>c.id==='bali').parts.filter(p=>p.kind==='tower').length,2);
 const school=assembly.painted.compounds.find(c=>c.id==='school');assert.equal(school.boundarySource,'osm-way-961273731');
 assert.ok(school.parts.every(p=>pointInPolygon(p.origin,school.mask)),'school cannot absorb the southern neighbouring campus');
 const invalid=structuredClone(registration);invalid.features.find(f=>f.kind==='tower').geo=transform.fromImage([630,800]);
 assert.throws(()=>make(invalid),/outside its geographic parcel|anchor mismatch/);
});
test('street endpoints keep source continuation across the context boundary',()=>{
 const selected=assembly.data.roads.find(r=>r.class==='focus'),end=selected.art.at(-1);
 assert.ok(assembly.context.roads.some(r=>r.art.some(p=>Math.hypot(p[0]-end[0],p[1]-end[1])<.02)));
});
test('labels remain readable and collision-free on desktop and phone',()=>{
 for(const[width,height]of[[1440,900],[1011,810],[390,844]])for(const zoom of[1,1.8,2.7]){
  const metrics=mapMetrics({zoom},width,height,width<560?height*1.05:Math.max(height,width*.7)),layout=overviewLabelLayout(assembly,{periodId:'window-2000',camera:{zoom}},loaded,metrics);
  assert.ok(layout.labels.length>0);assert.ok(layout.labels.length<=layout.countLimit);assert.ok(layout.characters<=layout.characterLimit);
  for(const l of layout.labels){assert.ok(l.fontPx>=18);assert.ok(Math.abs(l.fontUnits*metrics.scale-l.fontPx)<1e-9);const[x,y,w,h]=l.screenBounds;assert.ok(x>=12&&y>=12&&x+w<=width-12&&y+h<=height-12);}
  for(let i=0;i<layout.labels.length;i++)for(let j=i+1;j<layout.labels.length;j++)assert.ok(!overlaps(layout.labels[i].screenBounds,layout.labels[j].screenBounds));
 }
});
test('dense labels drop lower priorities instead of shrinking text',()=>{
 const candidates=Array.from({length:25},(_,i)=>({id:String(i),text:'记忆地点',kind:'place',priority:25-i,minLevel:0,positions:[[600,600]]}));
 const result=placeMapLabels(candidates,[],mapMetrics({zoom:1},1011,810,810),0);
 assert.equal(result.labels.length,1);assert.equal(result.labels[0].id,'0');assert.equal(result.labels[0].fontPx,23);
});
