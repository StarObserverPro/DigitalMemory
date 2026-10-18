import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import{createComposition,roadClearance,CHARACTER_PROFILES}from'../src/domain/composition.js';
import{createIllustrationMapping}from'../src/domain/illustration.js';import{createTransform}from'../src/domain/spatial.js';
const read=n=>JSON.parse(fs.readFileSync('content/public/'+n+'.json'));
const data=read('scene-composition'),mapping=createIllustrationMapping(read('illustration-mapping'),createTransform(read('orientation').bounds));
test('one shop changes independently of shell, roads, entrance and route',()=>{
 const registry=createComposition(data,mapping),base=registry.resolve('window-1995'),a=registry.resolve('window-1995','stationery'),b=registry.resolve('window-2000','repair');
 assert.deepEqual(base.road,b.road);assert.deepEqual(base.buildings,b.buildings);assert.deepEqual(base.entrances,b.entrances);
 assert.equal(a.frontages.filter(f=>f.occupant).length,1);assert.equal(b.frontages.filter(f=>f.occupant).length,1);
 assert.equal(a.frontages.find(f=>f.occupant).id,b.frontages.find(f=>f.occupant).id);assert.notEqual(a.frontages.find(f=>f.occupant).occupant.id,b.frontages.find(f=>f.occupant).occupant.id);
 assert.ok(base.frontages.every(f=>f.status==='unknown'));assert.ok(registry.resolve('window-2000').frontages.every(f=>!f.occupant),'Preview is never silently promoted into a historical occupant');
});
test('only exact supported occupants resolve; replacing a tenant cannot rebuild a shell',()=>{
 const d=structuredClone(data);d.occupancies.push({id:'fixture-supported-shop',slotId:'north-4-shop-a',periodIds:['window-1995'],approval:'accepted',label:'TEST ONLY'});
 const r=createComposition(d,mapping);assert.equal(r.resolve('window-1995').frontages.find(f=>f.id==='north-4-shop-a').occupant.id,'fixture-supported-shop');assert.equal(r.resolve('window-2000').frontages.find(f=>f.id==='north-4-shop-a').occupant,null);assert.deepEqual(r.resolve('window-2000').buildings,r.resolve('window-1995').buildings);
});
test('all ground reservations and the theatre stay outside the drawn road corridors',()=>{
 for(const group of data.overview)assert.ok(roadClearance(group.ground,data.roads)>=5,group.id);
 const theatre=data.overview.find(g=>g.placeId==='place-theatre');assert.ok(theatre.ground[0]>mapping.data.anchors.find(a=>a.id==='place-theatre').art[0]);
 assert.ok(roadClearance([4,-1,2,2],[{art:[[0,0],[10,0]],width:2}])<0,'Crossing segment is detected even with endpoints outside');
});
test('invalid frontages and detached entrances are rejected; body height is physical',()=>{
 const d=structuredClone(data);d.slots[0].width=50;assert.throws(()=>createComposition(d,mapping),/Frontage outside/);
 const e=structuredClone(data);e.entrances[0].route=mapping.atDistance(370);assert.throws(()=>createComposition(e,mapping),/Detached entrance/);
 assert.equal(CHARACTER_PROFILES.child.height,1.4);assert.ok(CHARACTER_PROFILES.child.eye<CHARACTER_PROFILES.child.height);
});
