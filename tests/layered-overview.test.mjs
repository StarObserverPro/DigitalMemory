import test from 'node:test';import assert from 'node:assert/strict';import fs from'node:fs';
import{createOverviewAssembly,layeredOverviewMarkup,mapLevel,pointInPolygon,overviewLabelLayout}from'../src/explorer/layered-overview.js';
import{mapMetrics,placeMapLabels}from'../src/explorer/map-labels.js';
import{createTransform}from'../src/domain/spatial.js';import{overlaps}from'../src/domain/map-assembly.js';
const read=n=>JSON.parse(fs.readFileSync('content/public/'+n+'.json'));
const transform=createTransform(read('orientation').bounds),registration=read('overview-registration');
const assets=read('manifest').moduleAssets,loaded=['towerSketch','slabSketch','towerGlyph','slabGlyph',...Object.keys(assets).filter(k=>k.startsWith('map-part-'))];
const assembly=createOverviewAssembly(read('scene-composition'),read('map-context'),registration,transform,assets);
test('consumer uses separate road/context/solid groups and no overview person',()=>{
 assert.deepEqual([1,1.8,2.7].map(mapLevel),[0,1,2]);
 for(const zoom of[1,1.8,2.7]){
  const markup=layeredOverviewMarkup(assembly,assets,{periodId:'window-2000',camera:{zoom}},loaded);
  for(const layer of['pale-context','road-art','solid-places'])assert.ok(markup.includes(`data-layer="${layer}"`));
  assert.ok(!markup.includes('preserveAspectRatio="none"'));if(zoom>=2.25)assert.ok(markup.includes('overview-r4/'));else assert.ok(markup.includes('stroke-linecap="round"'));
  assert.ok(!markup.includes('data-map-person'));assert.equal((markup.match(/data-map-object=/g)||[]).length,6);
  if(markup.includes('<image'))assert.match(markup,/preserveAspectRatio="xMidY(?:Mid|Max) meet"/);
 }
 assert.ok(assembly.model.roads.some(r=>r.states[0].bands.some(b=>b.role==='service')),'Source service roads have independent reservations');
 assert.ok(assembly.model.roads.flatMap(r=>r.states.flatMap(s=>s.parts)).some(p=>p.kind==='retaining-wall'));
});
test('unassociated life stage does not assert dated solid buildings; unavailable assets leave only supported symbols',()=>{
 const render=(periodId,available)=>layeredOverviewMarkup(assembly,assets,{periodId,camera:{zoom:1.8}},available);
 assert.ok(!render('stage-primary',loaded).includes('data-map-object='));
 assert.equal((render('window-2000',[]).match(/data-map-object=/g)||[]).length,4);
});
test('building anchors are projected from source coordinates; all Sanli towers stay in Sanli and retain their image proportions',()=>{
 const sanli=assembly.parcels.find(p=>p.label==='新华街三里'),wuli=assembly.parcels.find(p=>p.label==='新华街五里');
 for(const f of assembly.model.features)for(const rep of Object.values(f.states[0].representations)){
  assert.deepEqual(rep.groundAnchor,transform.toImage(f.geo),'No geographic displacement for icon layout');
  if(f.kind==='tower'){
   assert.equal(f.placeId,'place-sanli');assert.ok(pointInPolygon(rep.groundAnchor,sanli.art));assert.ok(!pointInPolygon(rep.groundAnchor,wuli.art));
   assert.equal(rep.bounds[2],f.ground[2]);if(assets[rep.assetRef])assert.ok(Math.abs(rep.bounds[2]/rep.bounds[3]-assets[rep.assetRef].width/assets[rep.assetRef].height)<1e-9);
  }
 }
 const changed=structuredClone(registration);changed.features.find(f=>f.kind==='tower').geo=transform.fromImage([630,800]);
 assert.throws(()=>createOverviewAssembly(read('scene-composition'),read('map-context'),changed,transform,assets),/outside its geographic parcel/);
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
