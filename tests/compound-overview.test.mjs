import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {createTransform}from '../src/domain/spatial.js';
import {compileCompoundTrials,visibleCompoundTrials,compoundTrialMarkup}from '../src/explorer/compound-overview.js';
const read=n=>JSON.parse(fs.readFileSync(new URL('../content/public/'+n+'.json',import.meta.url)));
const reg=read('overview-registration'),assets=read('manifest').moduleAssets,t=createTransform(read('orientation').bounds),compounds=compileCompoundTrials(reg,t,assets);
test('compound trial projections preserve the spatial registry control corners',()=>{
 for(const c of compounds){const[a,b,k,d,e,f]=c.matrix;for(const point of c.controlPoints){const[x,y]=point.pixel;const expected=t.toImage(point.geo);assert.ok(Math.hypot(a*x+k*y+e-expected[0],b*x+d*y+f-expected[1])<1e-7);}}
});
test('missing images retain context; zoom changes emphasis without relocating compounds',()=>{
 const s={periodId:'window-2000'};assert.equal(visibleCompoundTrials({compounds},s,[]).length,0);
 const list=visibleCompoundTrials({compounds},s,compounds.map(c=>c.assetRef));assert.equal(list.length,3);
 const matrices=level=>[...compoundTrialMarkup(list,assets,level).matchAll(/matrix\((.*?)\)/g)].map(m=>m[1]);assert.deepEqual(matrices(0),matrices(2));
 assert.equal(visibleCompoundTrials({compounds},{periodId:'absent'},Object.keys(assets)).length,0);
});
