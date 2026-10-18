import test from 'node:test';
import assert from 'node:assert/strict';
import { createTransform, SpatialRegistry } from '../src/domain/spatial.js';
import { relateTime, resolveEnvironment } from '../src/domain/temporal.js';
import { createSession, createPortalController } from '../src/application/session.js';
import { PublicRepository } from '../src/adapters/public-repository.js';
import { restoreSession, saveSession } from '../src/adapters/session-storage.js';
const transform = createTransform([10, 20, 10.02, 20.02]);
const point = (id, coordinates) => ({ id, geometryRevision: 1, geometry: { type: 'Point', coordinates } });
test('shared geographic/image transform round trips at corners and center', () => {
  for (const p of [[10,20],[10.02,20.02],[10.01,20.01]]) {
    const recovered = transform.fromImage(transform.toImage(p));
    assert.ok(Math.abs(recovered[0] - p[0]) < 1e-10);
    assert.ok(Math.abs(recovered[1] - p[1]) < 1e-10);
  }
});
test('registration correction keeps place identity and rejects stale writers; unresolved place stays unplaced', () => {
  const registry = new SpatialRegistry([point('p1',[10.01,20.01]),{ id: 'old-campus', geometryRevision: 0, geometry: null }], transform);
  assert.equal(registry.anchor('old-campus'), null);
  const revised = registry.register('p1', { type: 'Point', coordinates: [10.012,20.012] }, 1);
  assert.equal(revised.id, 'p1'); assert.equal(revised.geometryRevision, 2);
  assert.throws(() => registry.register('p1', { type: 'Point', coordinates: [10.013,20.013] }, 1), /conflict/);
  revised.geometry.coordinates[0] = 0;
  assert.equal(registry.get('p1').geometry.coordinates[0],10.012);
  assert.throws(() => registry.register('p1', {type:'Point', coordinates:[NaN,20]},2), /Invalid/);
});
test('metric corridor includes nearby points, excludes distant points and unregistered campuses', () => {
  const registry = new SpatialRegistry([point('near',[10.01,20.0101]),point('far',[10.01,20.015]),{id:'unknown',geometry:null}],transform);
  assert.deepEqual(registry.queryCorridor([[10,20.01],[10.02,20.01]],30).map(p=>p.id),['near']);
  assert.deepEqual(registry.queryWindow([10.009,20.01,10.011,20.011]).map(p=>p.id),['near']);
});
test('sparse time separates known windows, overlapping uncertainty and unmapped life stages', () => {
  const period = {kind:'window',start:2000,end:2005};
  for (const [time,relation] of [[{kind:'window',start:2001,end:2003},'current'],[{kind:'window',start:1995,end:1998},'earlier'],[{kind:'window',start:2008,end:2009},'later'],[{kind:'window',start:1995,end:2002},'overlapping'],[{kind:'stage',stageId:'primary'},'unknown'],[null,'unknown']]) assert.equal(relateTime(time,period),relation);
  assert.equal(relateTime({kind:'stage',stageId:'primary'},{kind:'stage',stageId:'primary'}),'current');
  assert.equal(resolveEnvironment([{placeId:'p',approval:'accepted',time:{kind:'window',start:1995,end:1996}}],'p',period).status,'no_supported_state');
});
test('nested portal return restores entire origin including selected memory, camera and period', async () => {
  const session=createSession();session.dispatch({type:'select-place',id:'p'});session.dispatch({type:'period',id:'other-time'});session.dispatch({type:'camera',camera:{x:12,y:-5,zoom:2}});session.dispatch({type:'select-memory',id:'fragment',placeId:'p'});
  const origin=session.get();const controller=createPortalController(session,{loadScene:async id=>({id})});
  await controller.enter('courtyard');const courtyard=session.get();await controller.enter('room');
  controller.back();assert.deepEqual(session.get(),courtyard);
  controller.back();assert.deepEqual(session.get(),origin);
});
test('late and failed portal loads leave origin usable and never overwrite a newer scene', async () => {
  const session=createSession();const pending={};const controller=createPortalController(session,{loadScene:id=>new Promise((resolve,reject)=>pending[id]={resolve,reject})});
  const slow=controller.enter('slow');const fast=controller.enter('fast');pending.fast.resolve({id:'fast'});await fast;
  pending.slow.resolve({id:'slow'});assert.equal(await slow,null);assert.equal(session.get().sceneId,'fast');
  controller.back();const before=session.get();const failed=controller.enter('missing');pending.missing.reject(new Error('missing'));await assert.rejects(failed);assert.deepEqual(session.get(),before);
  const cancelled=controller.enter('cancelled');controller.cancel();pending.cancelled.resolve({id:'cancelled'});assert.equal(await cancelled,null);assert.deepEqual(session.get(),before);
});
test('public adapter lazily requests relevant chunks, paginates and retains other-time discoverability', async () => {
  const calls=[];const memory=i=>({id:String(i),placeIds:['p'],privacy:'public',synthetic:i===2,time:{kind:'window',start:1994,end:1996}});
  const data={'manifest.json':{privacy:'public',places:'places.json',memoryChunks:[{placeIds:['p'],path:'chunk.json'},{placeIds:['other'],path:'other.json'}],scenes:{room:'room.json'}},'chunk.json':{privacy:'public',records:[0,1,2].map(memory)},'room.json':{privacy:'public',id:'room'}};
  const repo=new PublicRepository('https://fixture.test/public/',async url=>{const key=url.split('/').at(-1);calls.push(key);return{ok:!!data[key],json:async()=>data[key]}});
  await repo.init();const page=await repo.memories({placeIds:['p'],period:{kind:'window',start:2000,end:2005},limit:1});
  assert.equal(page.total,2);assert.equal(page.nextOffset,1);assert.equal(page.records[0].timeRelation,'earlier');assert.deepEqual(calls,['manifest.json','chunk.json']);
  await repo.loadScene('room');assert.equal(calls.at(-1),'room.json');
  await assert.rejects(repo.read('https://other.test/secret.json'),/same-origin/);
});
test('public adapter rejects non-public packages', async () => {
  const repo=new PublicRepository('https://fixture.test/',async()=>({ok:true,json:async()=>({privacy:'private'})}));
  await assert.rejects(repo.init(),/Non-public/);
});
test('session restore tolerates corrupt or unavailable storage, drops stale scene and unknown place', () => {
  const manifest={periods:[{id:'window-2000'}],assets:[{id:'journal'}],placeIds:['p']};let saved;
  const storage={setItem:(key,value)=>saved=value,getItem:()=>saved};const session=createSession();
  session.dispatch({type:'select-place',id:'p'});session.dispatch({type:'enter',sceneId:'unloaded'});assert.equal(saveSession(storage,session.get()),true);
  assert.equal(restoreSession(storage,manifest).sceneId,'map');saved='broken';assert.equal(restoreSession(storage,manifest),null);
  assert.equal(saveSession({setItem(){throw new Error('unavailable')}},session.get()),false);
});
