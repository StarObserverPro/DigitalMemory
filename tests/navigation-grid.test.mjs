import test from 'node:test';
import assert from 'node:assert/strict';
import {createNavigationGrid} from '../src/engine/navigation-grid.js';

test('map area does not force an eager navigation scan or a full-grid search allocation',()=>{
  let calls=0;
  const grid=createNavigationGrid({bounds:{minX:-100000,maxX:100000,minZ:-100000,maxZ:100000},
    isWalkable:p=>{calls++;return p[1]===0;},clear:(a,b)=>a[1]===0&&b[1]===0,maxCachedCells:64,maxCachedEdges:64});
  assert.equal(calls,0);assert.deepEqual(grid.closest([0,0]),[0,0]);assert(calls<10);
  assert.deepEqual(grid.route([0,0],[80,0]),[[0,0],[80,0]]);
  assert(grid.stats().cachedCells<=64);assert(grid.stats().cachedEdges<=64);
  assert(grid.stats().lastSearchNodes<200);
  grid.dispose();grid.dispose();assert.equal(grid.stats().cachedCells,0);assert.equal(grid.closest([0,0]),null);assert.equal(grid.route([0,0],[5,0]),null);
});

test('nearest walkable grid point matches exhaustive distance, including out-of-bounds queries',()=>{
  const bounds={minX:-5,maxX:8,minZ:-4,maxZ:7},allowed=p=>(p[0]*3+p[1]*7)%5===0;
  const grid=createNavigationGrid({bounds,isWalkable:allowed,clear:()=>false,maxCachedCells:9});
  const points=[];for(let z=bounds.minZ;z<=bounds.maxZ;z++)for(let x=bounds.minX;x<=bounds.maxX;x++)if(allowed([x,z]))points.push([x,z]);
  for(const query of [[0,0],[-50,-40],[100,3],[2,70],[-3,-90],[1.5,2.5],...Array.from({length:40},(_,i)=>[Math.sin(i)*20,Math.cos(i*.7)*20])]){
    const expected=points.slice().sort((a,b)=>(a[0]-query[0])**2+(a[1]-query[1])**2-((b[0]-query[0])**2+(b[1]-query[1])**2))[0];
    assert.deepEqual(grid.closest(query),expected,JSON.stringify(query));
  }
});

test('lazy navigation keeps a narrow gate and rejects diagonal corner cutting after cache eviction',()=>{
  const walkable=([x,z])=>x>=0&&x<=12&&z>=0&&z<=8&&(x!==6||z===7);
  const clear=(a,b)=>{const n=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])*4);for(let i=0;i<=n;i++){const x=a[0]+(b[0]-a[0])*i/(n||1),z=a[1]+(b[1]-a[1])*i/(n||1);if(Math.abs(x-6)<.49&&Math.abs(z-7)>.49)return false;}return true;};
  const grid=createNavigationGrid({bounds:{minX:0,maxX:12,minZ:0,maxZ:8},isWalkable:walkable,clear,maxCachedCells:12,maxCachedEdges:12});
  for(const [a,b] of [[[1,1],[11,1]],[[11,1],[1,1]],[[1,1],[11,1]]]){
    const path=grid.route(a,b);assert(path);assert(path.some(p=>p[1]>=7));
    for(let i=1;i<path.length;i++)assert(clear(path[i-1],path[i]));
  }
});

test('empty and disconnected large maps stop at explicit work budgets',()=>{
  const bounds={minX:0,maxX:100000,minZ:0,maxZ:100000};
  const empty=createNavigationGrid({bounds,isWalkable:()=>false,clear:()=>false,maxNearestChecks:40});
  assert.equal(empty.closest([50000,50000]),null);
  assert.equal(empty.stats().lastNearestChecks,40);
  assert.equal(empty.stats().lastNearestBudgetExceeded,true);
  const disconnected=createNavigationGrid({bounds,isWalkable:()=>true,clear:()=>false,edgeClear:(a,b)=>a[0]!==50&&b[0]!==50,maxSearchNodes:60});
  assert.equal(disconnected.route([1,1],[80,1]),null);
  assert.equal(disconnected.stats().lastSearchNodes,60);
  assert.equal(disconnected.stats().lastSearchBudgetExceeded,true);
  assert.deepEqual(disconnected.route([1,1],[2,1]),[[1,1],[2,1]]);
  assert.equal(disconnected.stats().lastSearchBudgetExceeded,false);
});

test('long straight routes do not rescan every growing prefix when smoothing',()=>{
  let samples=0;
  const grid=createNavigationGrid({bounds:{minX:0,maxX:5000,minZ:0,maxZ:0},isWalkable:()=>true,
    edgeClear:()=>true,clear:(a,b)=>{samples+=Math.abs(b[0]-a[0]);return true;}});
  assert.deepEqual(grid.route([0,0],[5000,0]),[[0,0],[5000,0]]);
  assert(samples<20000,'line-of-sight work should scale with route length');
});
