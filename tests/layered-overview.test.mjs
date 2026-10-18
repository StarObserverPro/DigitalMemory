import test from 'node:test';import assert from 'node:assert/strict';import fs from'node:fs';
import{createOverviewAssembly,layeredOverviewMarkup,mapLevel}from'../src/explorer/layered-overview.js';
const read=n=>JSON.parse(fs.readFileSync('content/public/'+n+'.json'));
const model=createOverviewAssembly(read('scene-composition'),read('map-context'));
const assets=read('manifest').moduleAssets;
test('real consumer uses the three-tier planner, separate road/context/solid groups and loose thumbnail assets',()=>{
 assert.deepEqual([1,1.8,2.7].map(mapLevel),[0,1,2]);
 for(const zoom of[1,1.8,2.7]){
  const markup=layeredOverviewMarkup(model,assets,{periodId:'window-2000',camera:{zoom}},['towerSketch','slabSketch']);
  for(const layer of['pale-context','road-art','solid-places'])assert.ok(markup.includes(`data-layer="${layer}"`));
  assert.ok(markup.includes('towerSketch-r1.webp'));assert.ok(markup.includes('slabSketch-r1.webp'));
  assert.ok(!markup.includes('data-map-person'));assert.equal((markup.match(/data-map-object=/g)||[]).length,6);
 }
 assert.ok(model.model.roads.some(r=>r.id.startsWith('four-ring-service-')),'Service corridor is reserved independently');
 assert.ok(model.model.roads.flatMap(r=>r.states.flatMap(s=>s.parts)).some(p=>p.kind==='retaining-wall'));
});
test('unassociated life stage does not assert dated solid buildings; unavailable assets leave only supported symbols',()=>{
 const render=(periodId,loaded)=>layeredOverviewMarkup(model,assets,{periodId,camera:{zoom:1.8}},loaded);
 assert.ok(!render('stage-primary',['towerSketch','slabSketch']).includes('data-map-object='));
 assert.equal((render('window-2000',[]).match(/data-map-object=/g)||[]).length,1);
});
