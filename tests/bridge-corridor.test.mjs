import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {bridgeFrame,createBridgeAccess} from '../src/engine/bridge-access.js';
import {makeNavigation} from '../scenes/xinhua-sanli-outline/navigation.mjs';
import {outlineForPeriod} from '../src/domain/temporal.js';
import {destinationGroups} from '../src/explorer/destinations.js';
const data=JSON.parse(await fs.readFile('scenes/xinhua-sanli-outline/scene-data.json')),registration=JSON.parse(await fs.readFile('content/public/outline-registration.json'));

test('bridge frame preserves geographic coordinates across native and model frames',()=>{
 const m=data.bridgeCorridor,f=bridgeFrame(m,data);for(const p of m.ring.filter((_,i)=>i%31===0)){const w=f.toWorld([p.x,p.z]),q=f.toModel(w);assert(Math.hypot(q[0]-p.x,q[1]-p.z)<1e-8);assert(Math.abs(data.origin[0]+w[0]/data.kx-(m.frame.origin[0]+p.x/m.frame.sx))<1e-10);assert(Math.abs(data.origin[1]-w[1]/data.ky-(m.frame.origin[1]-p.z/m.frame.sz))<1e-10);}
 assert.deepEqual(m.frame.origin,registration.bridgeFrame.origin);
});

test('native registered bridge destinations land on supported ground with real underpass height',()=>{
 const nav=makeNavigation(data);for(const id of data.bridgeDestinations)assert(nav.walkable(data.landmarks[id].position),id);
 const p=data.landmarks['fourth-ring-fengtai'].position;assert(nav.height(p)<-5);assert(nav.underBridge(p));
 for(const p of data.bridgeCorridor.supports){const point=bridgeFrame(data.bridgeCorridor,data).toWorld([p.x,p.z]),height=nav.height(point);if(p.bottom<=height+1.7&&p.top>height+.1)assert(nav.blocked(point));}
 nav.dispose();
});

test('period resolution excludes the bridge extension and its destinations outside registered membership',()=>{
 const old=outlineForPeriod(data,registration,'window-1995');assert.equal(old.bridgeCorridor,undefined);assert(!Object.keys(old.landmarks).some(id=>id.startsWith('fourth-ring-')));
 assert(outlineForPeriod(data,registration,'window-2000').bridgeCorridor);assert.equal(destinationGroups(data.landmarks,'','window-2000').flatMap(g=>g.places).length,31);assert.equal(destinationGroups(data.landmarks,'','window-1995').flatMap(g=>g.places).length,25);
});

test('selected native bridge render owns closed surfaces and rays on all fixtures',()=>{
 const source=`import fs from 'node:fs';import assert from 'node:assert/strict';import * as T from './scenes/xinhua-junction-outline/vendor/three/build/three.module.js';import {makeNativeBridges} from './scenes/fengtai-bridges/native.mjs';const d=JSON.parse(fs.readFileSync('scenes/xinhua-sanli-outline/scene-data.json')),scene=new T.Scene(),b=makeNativeBridges(scene,d);assert.equal(b.audit.fixtures,16);assert.equal(b.audit.rayPaths,48);assert(b.meshes.every(m=>m.userData.surfaceKind));assert(b.meshes.every(m=>!m.material.polygonOffset));b.resize(640,480);b.dispose();b.dispose();assert.equal(scene.children.length,0);`;
 execFileSync(process.execPath,['--no-warnings','--loader','./scenes/xinhua-sanli-outline/three-test-loader.mjs','--input-type=module','-e',source],{stdio:'pipe'});
});
