import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {createTransform}from '../src/domain/spatial.js';
import {compileCompoundTrials,visibleCompoundTrials,compoundGroundMarkup,compoundStandingEntries}from '../src/explorer/compound-overview.js';
const read=n=>JSON.parse(fs.readFileSync(new URL('../content/public/'+n+'.json',import.meta.url)));
const reg=read('overview-registration'),assets=read('manifest').moduleAssets,t=createTransform(read('orientation').bounds),compounds=compileCompoundTrials(reg,t,assets),available=Object.keys(assets);
test('each building keeps its source ground footprint and anchor independently',()=>{
 assert.equal(compounds.flatMap(c=>c.parts).length,19);
 for(const c of compounds)for(const p of c.parts){assert.deepEqual(p.origin,t.toImage(p.anchorGeo));assert.deepEqual(p.ground,p.groundGeo.map(t.toImage));}
 assert.ok(compounds.every(c=>!c.matrix));
});
test('standing parts remain unmasked and use uniform scaling; ground alone excludes roads',()=>{
 const list=visibleCompoundTrials({compounds},{periodId:'window-2000'},available);assert.equal(list.length,3);
 const ground=compoundGroundMarkup(list,2);assert.ok(ground.includes('mask="url(#compound-road-clear)"'));
 const entries=compoundStandingEntries(list,assets,2,available,2.268);assert.ok(entries.length>=19);
 for(const p of entries){assert.ok(!p.html.includes('mask='));assert.ok(!p.html.includes('matrix('));assert.ok(!p.html.includes('preserveAspectRatio="none"'));}
 for(const c of list)for(const p of c.parts){const r=p.representations[2];if(!r.assetRef)continue;const entry=entries.find(e=>e.id===p.id);if(!entry.html.includes('<image'))continue;const w=+entry.html.match(/width="([\d.]+)"/)[1],h=+entry.html.match(/height="([\d.]+)"/)[1];assert.ok(Math.abs(w/h-assets[r.assetRef].width/assets[r.assetRef].height)<1e-9);}
});
test('missing assets, unsupported periods and out-of-budget zoom do not force a raster fit',()=>{
 assert.equal(visibleCompoundTrials({compounds},{periodId:'window-2000'},[]).length,0);
 assert.equal(visibleCompoundTrials({compounds},{periodId:'absent'},available).length,0);
 const native=compoundStandingEntries(compounds,assets,2,available,.2);assert.ok(native.every(e=>!e.html.includes('<image')));
 const before=compounds.flatMap(c=>c.parts.map(p=>p.origin));compoundStandingEntries(compounds,assets,0,available,1);assert.deepEqual(compounds.flatMap(c=>c.parts.map(p=>p.origin)),before);
});

test('all shipped raster part variants satisfy the declared native/display budget',()=>{
 const audit=JSON.parse(fs.readFileSync(new URL('../assets/modules/overview-r4/measurement.json',import.meta.url)));
 assert.equal(audit.parts.filter(p=>p.sizeStatus==='accepted').length,37);assert.equal(audit.parts.filter(p=>p.sizeStatus==='vector-fallback').length,1);
 for(const p of audit.parts.filter(p=>p.sizeStatus==='accepted'))for(const ratio of p.ratio)assert.ok(ratio>=.8&&ratio<=1.5);
});
