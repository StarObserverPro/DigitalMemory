import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs/promises';import {makeNavigation} from '../scenes/xinhua-sanli-outline/navigation.mjs';
const d=JSON.parse(await fs.readFile('scenes/xinhua-sanli-outline/scene-data.json')),nav=makeNavigation(d);
test('named Daoxiangcun frontage faces Fourth Ring without a south-facing duplicate',()=>{const shops=d.frontageBuildings.filter(s=>s.label==='稻香村');assert.equal(shops.length,1);assert.equal(shops[0].id,'daoxiangcun-qili-west');assert.equal(shops[0].facadeEdge,0);assert(shops[0].ring.every(p=>p[0]<-400));assert(d.landmarks.daoxiangcunPlaza.position[0]<-420);});
test('all corridor destinations connect on walkable segments; bridge piers stay solid',()=>{for(const g of Object.values(d.landmarks)){const path=nav.route(nav.closest(d.spawn),g.position,3);assert(path,g.id);assert(Math.hypot(...path.at(-1).map((v,i)=>v-g.position[i]))<2,g.id);for(let i=1;i<path.length;i++)assert(nav.clear(path[i-1],path[i]),g.id);}for(const b of d.bridges)for(const p of b.piers)assert(nav.blocked(p.position));});

test('Yunbai frontage joins the existing bridge route and keeps source geometry independent of display',async()=>{
 const plan=JSON.parse(await fs.readFile('content/reference/xinhua-spatial-plan.json'));
 for(const id of d.yunbaiKandan.buildingIds){
  const source=plan.objects.find(o=>o.id===id);if(!source)continue;
  const actual=[...d.buildings,...d.frontageBuildings].find(o=>o.id===id);assert(actual,id);assert.equal(actual.height,source.heightMetres);assert.equal(actual.storeys,source.storeys);
  const expected=source.geometry.coordinates[0].slice(0,-1).map(p=>[(p[0]-d.origin[0])*d.kx,-(p[1]-d.origin[1])*d.ky]);
  assert.equal(actual.originalRing.length,expected.length);for(let i=0;i<expected.length;i++)assert(Math.hypot(...actual.originalRing[i].map((v,j)=>v-expected[i][j]))<1e-7,id);
 }
 const [a,b]=d.yunbaiKandan.route;assert(nav.clear(a,b),'all 146 m must be continuously walkable');
 const path=nav.route(a,d.landmarks.kandanBridge.position,2);assert(path);for(let i=1;i<path.length;i++)assert(nav.clear(path[i-1],path[i]));
 assert.equal(d.buildingPresentation.filter(p=>p.openUpper).length,3);
 assert.notDeepEqual(d.landmarks.yunbai.position,d.landmarks.daoxiangcunPlaza.position);
});
