import test from 'node:test';
import assert from 'node:assert/strict';
import { MAP_LEVELS, validateMapAssembly, planMapAssembly, upsertMapFeature, orderRoadParts } from '../src/domain/map-assembly.js';
import { assemblyFixture, exampleFeature } from './fixtures/map-assembly.mjs';
const viewport = [0,0,900,600];
const plan = (model, level=1, periodId='sample-2005', view=viewport) => planMapAssembly(model,{level,periodId,viewport:view});

test('three overview scales share identities and keep context pale; no map avatar', () => {
  const m=assemblyFixture(), scene=MAP_LEVELS.map((_,i)=>plan(m,i));
  assert.deepEqual(scene.map(s=>s.features.map(f=>f.placeId)), Array(3).fill(['fixture-place-hall']));
  for(const s of scene) { assert.equal(s.character,null); assert.ok(s.context.every(c=>c.opacity<.3&&!c.interactive)); assert.deepEqual(s.backdrop.bounds,viewport); }
  assert.ok(scene[0].context.some(c=>c.bounds[0]<m.registrationBounds[0]),'Display extends outside the editable region');
  assert.ok(scene[2].roadParts.length>scene[0].roadParts.length);
});

test('insert remembered corner changes only its local context mask, not road, neighbor or background recipe', () => {
  const m=assemblyFixture(), saved=structuredClone(m), before=plan(m);
  const {model:next,change}=upsertMapFeature(m,exampleFeature(),1), after=plan(next);
  assert.deepEqual(m,saved,'Input model is not mutated');
  assert.deepEqual(next.roads,m.roads); assert.deepEqual(next.features[0],m.features[0]);
  assert.deepEqual(next.context,m.context); assert.deepEqual(change.changedRoadIds,[]);
  assert.deepEqual(change.contextIds,['east-south']);
  const affected=after.context.filter((c,i)=>JSON.stringify(c.exclude)!==JSON.stringify(before.context[i].exclude));
  assert.deepEqual(affected.map(c=>c.id),['east-south']);
  assert.deepEqual(affected[0].exclude,[...before.context.find(c=>c.id==='east-south').exclude,[470,340,64,36]],'Only the new occupied footprint is added to existing road exclusions');
  assert.deepEqual(after.features.find(f=>f.id==='hall'),before.features[0]);
});

test('hidden detail, wrong period and draft state cannot cut empty holes into the background', () => {
  const m=assemblyFixture(), next=upsertMapFeature(m,exampleFeature(),1).model;
  assert.deepEqual(plan(next,0).context,plan(m,0).context,'No far-scale asset: retain pale context');
  assert.deepEqual(plan(next,1,'sample-1995').context,plan(m,1,'sample-1995').context,'No nearest-year substitution');
  const draft=exampleFeature('draft'); draft.states[0].approval='draft';
  assert.deepEqual(plan(upsertMapFeature(m,draft,1).model).context,plan(m).context);
  const off=exampleFeature('off'); off.states[0].representations[1].bounds=[1000,1000,50,50];
  assert.deepEqual(plan(upsertMapFeature(m,off,1).model).context,plan(m).context,'Culled art does not erase ground');
});

test('temporal replacement restores the old background and keeps accepted historical states distinct', () => {
  const m=assemblyFixture(); const f=exampleFeature();
  const old=structuredClone(f.states[0]); old.id='corner-1995'; old.periodIds=['sample-1995'];
  old.representations[1].assetRef='fixture-low-houses@1';
  f.states.push(old); const next=upsertMapFeature(m,f,1).model;
  assert.equal(plan(next,1,'sample-1995').features.find(f=>f.id==='new-corner').assetRef,'fixture-low-houses@1');
  assert.equal(plan(next,1,'sample-2005').features.find(f=>f.id==='new-corner').assetRef,'fixture-corner-neighborhood@1');
  assert.equal(plan(next,1,'unknown').features.length,0);
  assert.ok(plan(next,1,'unknown').context.every(c=>c.exclude.length===0));
  f.states.push({...old,id:'overlapping-old'});
  assert.throws(()=>upsertMapFeature(m,f,1),/Conflicting accepted states/);
});

test('road, accepted neighbor, region and optimistic version conflicts leave original intact', () => {
  const m=assemblyFixture(), saved=structuredClone(m);
  assert.throws(()=>upsertMapFeature(m,exampleFeature('on-road',[350,320,40,30]),1),/reserved road/);
  assert.throws(()=>upsertMapFeature(m,exampleFeature('on-hall',[550,100,30,30]),1),/reservation conflict/);
  assert.throws(()=>upsertMapFeature(m,exampleFeature('outside',[20,20,20,20]),1),/registration scope/);
  assert.throws(()=>upsertMapFeature(m,exampleFeature(),0),/revision conflict/);
  const rename=structuredClone(m.features[0]); rename.placeId='somewhere-else';
  assert.throws(()=>upsertMapFeature(m,rename,1),/stable place identity/);
  assert.deepEqual(m,saved);
});

test('relocating a local drawing invalidates both old and new patches and restores the old pale fill', () => {
  const first=upsertMapFeature(assemblyFixture(),exampleFeature(),1).model;
  const shifted=exampleFeature('new-corner',[180,340,64,36]);
  const result=upsertMapFeature(first,shifted,2);
  assert.deepEqual(result.change.contextIds,['west-south','east-south']);
  assert.deepEqual(plan(result.model).context.find(c=>c.id==='east-south').exclude,plan(assemblyFixture()).context.find(c=>c.id==='east-south').exclude);
  assert.deepEqual(result.model.roads,first.roads);
});

test('underpass keeps independent road elevations and explicit bridge ordering', () => {
  const m=assemblyFixture(); validateMapAssembly(m);
  const s=plan(m,2), index=id=>s.roadParts.findIndex(p=>p.id===id);
  assert.ok(index('road-floor')<index('wall-rear'));
  assert.ok(index('wall-rear')<index('rail-deck-south'));
  assert.ok(index('rail-deck-south')<index('railings'));
  assert.notEqual(m.roads[0].states[0].bands[1].profiles[1].elevation,m.roads[0].states[0].bands[2].profiles[1].elevation);
  const bad=structuredClone(m); bad.roads[0].states[0].bands[2].modes.push('walk');
  assert.throws(()=>validateMapAssembly(bad),/not a walking/);
  assert.throws(()=>orderRoadParts([{id:'a',paintAfter:['b']},{id:'b',paintAfter:['a']}]),/Cyclic/);
  assert.throws(()=>orderRoadParts([{id:'a',paintAfter:['missing']}]),/Unknown road/);
});

test('a road reservation must have a base surface at every overview tier', () => {
  const m=assemblyFixture(); m.roads[0].states[0].parts[0].minLevel=1;
  assert.throws(()=>validateMapAssembly(m),/visible base surface/);
});

test('label collisions reduce labels without removing places, and planned results are isolated', () => {
  const m=upsertMapFeature(assemblyFixture(),exampleFeature(),1).model;
  m.features[1].states[0].representations[1].labelBounds=m.features[0].states[0].representations[1].labelBounds;
  const s=plan(m); assert.equal(s.features.length,2); assert.equal(s.labels.length,1); assert.equal(s.labels[0].id,'hall');
  s.features[0].ground[0]=-900; s.context[0].recipe.seed='mutated';
  assert.notEqual(plan(m).features[0].ground[0],-900); assert.notEqual(m.context[0].recipe.seed,'mutated');
});

test('pale context has its own historical recipe and neutral fallback', () => {
  const m=assemblyFixture(), patch=m.context[3];
  patch.recipe={seed:'neutral-1',styleRevision:'paper-1',typology:'land-wash'};
  patch.states=[
    {id:'old-low-houses',approval:'accepted',periodIds:['sample-1995'],recipe:{seed:'old-1',styleRevision:'journal-1',typology:'low-roof-grain'}},
    {id:'new-towers',approval:'accepted',periodIds:['sample-2005'],recipe:{seed:'new-1',styleRevision:'journal-1',typology:'mixed-towers-slabs'}},
  ];
  const recipe=period=>plan(m,1,period).context.find(c=>c.id===patch.id).recipe.typology;
  assert.equal(recipe('sample-1995'),'low-roof-grain');
  assert.equal(recipe('sample-2005'),'mixed-towers-slabs');
  assert.equal(recipe('unresolved-time'),'land-wash');
});

test('failed or pending art leaves context intact until its asset is actually available', () => {
  const m=upsertMapFeature(assemblyFixture(),exampleFeature(),1).model;
  const pending=planMapAssembly(m,{periodId:'sample-2005',level:1,viewport,availableAssets:[]});
  assert.equal(pending.features.length,0);
  const empty=assemblyFixture(); empty.features=[];
  assert.deepEqual(pending.context,plan(empty).context);
  const loaded=planMapAssembly(m,{periodId:'sample-2005',level:1,viewport,availableAssets:['fixture-corner-neighborhood@1']});
  assert.equal(loaded.features.length,2,'Both fixture objects intentionally share an available template');
  assert.ok(loaded.context.find(c=>c.id==='east-south').exclude.some(r=>r[0]===470));
});
