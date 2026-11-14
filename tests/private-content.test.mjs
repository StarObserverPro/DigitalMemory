import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtemp, mkdir, writeFile, readFile, rm, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createPrivateApi } from '../server/private-api.mjs';
import { releaseRecord, attachmentRecords } from '../server/private-content.mjs';
import { DriveContentStore, limitedBytes } from '../server/drive-store.mjs';
import { PrivateRepository } from '../src/adapters/private-repository.js';
import { createContentMount } from '../src/application/content-mount.js';
import { publicSessionSnapshot } from '../src/adapters/session-projection.js';
import { isPublicBuildPath, exportPublicFiles } from '../scripts/public-export.mjs';

// All records, identities, positions and storage IDs below are synthetic fixtures.
const hash = 'a'.repeat(64), origin = 'https://fixture.test';
const release = { schemaVersion:1, kind:'digitalmemory.private-release', privacy:'private', status:'approved', releaseId:'fixture-release', revision:'r1', geometryRevision:'geo-fixture', transformRevision:'frame-fixture', attachments:{fileId:'fixture-attachments',sha256:hash}, memories:[{id:'fixture-note',fileId:'fixture-note-file',sha256:hash}], media:[{id:'fixture-image',fileId:'fixture-image-file',sha256:hash,role:'display',mimeType:'image/png'}] };
const time = {kind:'unknown',originalExpression:'Synthetic unknown date'};
const attachments = {schemaVersion:1,privacy:'private',records:[{id:'fixture-attachment',revision:'1',routeId:'fixture-route',placeId:null,geometryRevision:'geo-fixture',transformRevision:'frame-fixture',anchor:{kind:'unresolved'},time,target:{type:'note',memoryId:'fixture-note'},privateSource:'must-not-export'}]};
const note = {schemaVersion:1,privacy:'private',id:'fixture-note',revision:'1',title:'Synthetic note',text:'No autobiographical content.',time,images:[{assetId:'fixture-image',alt:'Synthetic',caption:''}],privateSource:'must-not-export',fileId:'must-not-export',authorEmail:'must-not-export'};
const principal = {subject:'fixture-reader',releaseIds:['fixture-release'],expiresAt:90000};
function fixture({authorize = async()=>principal, changeRelease, clock = ()=>1000}={}) {
  const calls=[];
  const store={loadRelease:async()=>{calls.push('release');return changeRelease?changeRelease():structuredClone(release);},loadAttachments:async()=>{calls.push('attachments');return structuredClone(attachments);},loadMemory:async()=>{calls.push('memory');return structuredClone(note);},loadMedia:async()=>{calls.push('media');return new Uint8Array([137,80,78,71]);}};
  const handler=createPrivateApi({enabled:true,store,authorize,publicOrigin:origin,clock});
  const request=(path, options={})=>handler(new Request(origin+'/api/private/'+path,{...options,headers:{'X-DigitalMemory-Revision':'fixture-release:r1',...options.headers}}));
  return {handler,request,calls,store};
}

test('disabled and anonymous requests never touch the archive',async()=>{
  assert.equal((await createPrivateApi()(new Request(origin+'/api/private/manifest'))).status,503);
  for(const authorize of [async()=>null,async()=>{throw Error('sensitive provider failure');},async()=>({...principal,expiresAt:0})]){
    const f=fixture({authorize});for(const path of ['session','manifest','attachments?routeId=fixture-route','memories/fixture-note','media/fixture-image'])assert.equal((await f.request(path)).status,401);
    assert.deepEqual(f.calls,[]);
  }
});
test('API rejects cross-origin, cross-site and write methods',async()=>{
  const f=fixture();assert.equal((await f.request('manifest',{headers:{Origin:'https://other.test'}})).status,403);
  assert.equal((await f.request('manifest',{headers:{'Sec-Fetch-Site':'cross-site'}})).status,403);
  assert.equal((await f.request('manifest',{method:'POST'})).status,405);assert.deepEqual(f.calls,[]);
});
test('session check discloses no archive IDs and performs no Drive reads',async()=>{
  const f=fixture(),r=await f.request('session');assert.deepEqual(await r.json(),{authenticated:true,expiresAt:90000});assert.deepEqual(f.calls,[]);
});
test('wrong audience, arbitrary file IDs and revision changes fail closed',async()=>{
  const other=fixture({authorize:async()=>({...principal,releaseIds:['other-release']})});assert.equal((await other.request('memories/fixture-note')).status,404);assert.deepEqual(other.calls,['release']);
  const f=fixture();assert.equal((await f.request('media/fixture-image-file')).status,404);assert.equal((await f.request('memories/fixture-note',{headers:{'X-DigitalMemory-Revision':'old'}})).status,409);assert(!f.calls.includes('media'));assert(!f.calls.includes('memory'));
});
test('manifest, notes and attachments contain only display projection fields',async()=>{
  const f=fixture();for(const path of ['manifest','attachments?routeId=fixture-route','memories/fixture-note']){
    const response=await f.request(path);assert.equal(response.status,200);assert.match(response.headers.get('cache-control'),/no-store/);const text=await response.text();assert(!text.includes('must-not-export'));assert(!text.includes('fileId'));assert(!text.includes('sha256'));
  }
});
test('route pagination is bounded; a foreign route receives no records',async()=>{
  const f=fixture();assert.deepEqual(await (await f.request('attachments?routeId=other-route')).json(),{records:[],nextOffset:null});
  assert.equal((await f.request('attachments?routeId=fixture-route&limit=101')).status,400);
  assert.equal((await f.request('attachments?routeId=fixture-route&offset=-1')).status,400);
});
test('all API failures are no-store and suppress upstream exceptions',async()=>{
  const f=fixture();f.store.loadRelease=async()=>{throw Error('secret-source-url');};
  const r=await f.request('manifest');assert.equal(r.status,503);assert.match(r.headers.get('cache-control'),/no-store/);assert(!(await r.text()).includes('secret-source-url'));
});
test('media goes through authorization with a safe MIME and no-store',async()=>{
  const f=fixture(),r=await f.request('media/fixture-image');assert.equal(r.status,200);assert.equal(r.headers.get('content-type'),'image/png');assert.match(r.headers.get('cache-control'),/no-store/);assert.equal((await r.arrayBuffer()).byteLength,4);
});
test('draft releases, originals, unsupported MIME and dangling anchors are rejected',()=>{
  assert.throws(()=>releaseRecord({...release,status:'draft'}));
  assert.throws(()=>releaseRecord({...release,media:[{...release.media[0],role:'original'}]}));
  assert.throws(()=>releaseRecord({...release,media:[{...release.media[0],mimeType:'image/svg+xml'}]}));
  assert.throws(()=>attachmentRecords({...attachments,records:[{...attachments.records[0],geometryRevision:'wrong'}]},release));
  assert.throws(()=>attachmentRecords({...attachments,records:[{...attachments.records[0],target:{type:'note',memoryId:'unreleased'}}]},release));
  assert.throws(()=>attachmentRecords({...attachments,records:[{...attachments.records[0],anchor:{kind:'wgs84',coordinates:[181,0]}}]},release));
});
test('release IDs and dependency IDs must be unique and pinned',()=>{
  assert.throws(()=>releaseRecord({...release,memories:[...release.memories,...release.memories]}));
  assert.throws(()=>releaseRecord({...release,attachments:{fileId:'fixture',sha256:'not-a-hash'}}));
});
test('session expiry during slow storage reads suppresses the response',async()=>{
  let now=1000;const f=fixture({clock:()=>now});f.store.loadMemory=async()=>{now=100000;return note;};assert.equal((await f.request('memories/fixture-note')).status,401);
});

function clientFixture(options={}){
  const f=fixture(options),revoked=[];let next=0;
  const client=new PrivateRepository(origin+'/api/private/',{origin,clock:options.clock??(()=>1000),fetcher:(url,init)=>f.handler(new Request(url,init)),urls:{createObjectURL:()=>`blob:fixture-${++next}`,revokeObjectURL:url=>revoked.push(url)}});
  return {...f,client,revoked};
}
const compatible={geometryRevision:'geo-fixture',transformRevision:'frame-fixture'};
test('client refuses reads before explicit mount and refuses cross-origin configuration',async()=>{
  assert.throws(()=>new PrivateRepository('https://other.test/api/private/',{origin}));
  const {client,calls}=clientFixture();await assert.rejects(()=>client.memory('fixture-note'));assert.deepEqual(calls,[]);client.dispose();
});
test('client mounts compatible archive; lock aborts access and revokes image URLs',async()=>{
  const {client,revoked}=clientFixture();await client.unlock(compatible);assert.equal((await client.memory('fixture-note')).title,'Synthetic note');const image=await client.media('fixture-image');client.lock();assert.deepEqual(revoked,[image]);assert.equal(client.inspect().unlocked,false);await assert.rejects(()=>client.memory('fixture-note'));client.dispose();
});
test('map/frame mismatch and release revision conflicts unmount the private archive',async()=>{
  const first=clientFixture();await assert.rejects(()=>first.client.unlock({...compatible,geometryRevision:'wrong'}));assert.equal(first.client.inspect().unlocked,false);first.client.dispose();
  let revision='r1';const second=clientFixture({changeRelease:()=>({...release,revision})});await second.client.unlock(compatible);revision='r2';await assert.rejects(()=>second.client.memory('fixture-note'));assert.equal(second.client.inspect().unlocked,false);second.client.dispose();
});
test('late private reads cannot resurrect a locked session',async()=>{
  const {client,store}=clientFixture();await client.unlock(compatible);let finish;store.loadMemory=()=>new Promise(resolve=>finish=resolve);const pending=client.memory('fixture-note');
  while(!finish)await new Promise(resolve=>setImmediate(resolve));client.lock();finish(note);await assert.rejects(pending,error=>error.name==='AbortError');assert.equal(client.inspect().unlocked,false);client.dispose();
});
test('private mount never mutates/disposes the public world and clears on expiry',async()=>{
  let now=1000,clears=0;const {client}=clientFixture({clock:()=>now});const publicRepository={untouched:true};
  const mount=createContentMount({publicRepository,privateRepository:client,onClear:()=>clears++});assert.deepEqual(await mount.attachments({routeId:'fixture-route'}),{records:[],nextOffset:null});
  assert(await mount.mount(compatible));assert.equal((await mount.attachments({routeId:'fixture-route'})).records.length,1);assert.equal((await mount.memory('fixture-note')).id,'fixture-note');
  now=100000;await assert.rejects(()=>mount.memory('fixture-note'));assert.equal(mount.inspect().mounted,false);assert(clears>=2);assert.deepEqual(publicRepository,{untouched:true});mount.dispose();
});
test('private client stays same-origin and bounds unreleased image objects',async()=>{
  const {client,revoked}=clientFixture();await client.unlock(compatible);await assert.rejects(()=>client.request('https://other.test/secret'));
  for(let i=0;i<34;i++)await client.media('fixture-image');assert.equal(client.inspect().objectURLs,32);assert.equal(revoked.length,2);client.dispose();assert.equal(revoked.length,34);
});

function driveFixture({parent='fixture-registry',mime='application/json',sha,trashed=false}={}){
  const bytes=Buffer.from(JSON.stringify(attachments)),calls=[];
  const store=new DriveContentStore({registryFolderId:'fixture-registry',memoirsFolderId:'fixture-memoirs',displayFolderId:'fixture-display',releaseFileId:'fixture-release-file',getAccessToken:async()=>'fixture-token',fetcher:async(url,init)=>{
    calls.push({url:String(url),init});assert.equal(init.headers.Authorization,'Bearer fixture-token');assert.equal(init.redirect,'error');assert.equal(init.cache,'no-store');
    return url.searchParams.get('alt')==='media'?new Response(bytes):Response.json({id:'fixture-attachments',mimeType:mime,parents:[parent],trashed,size:String(bytes.length)});
  }});
  return {store,calls,ref:{fileId:'fixture-attachments',sha256:sha??createHash('sha256').update(bytes).digest('hex')}};
}
test('Drive adapter validates parent/MIME then verifies exact downloaded bytes',async()=>{
  const f=driveFixture();assert.deepEqual(await f.store.loadAttachments({attachments:f.ref}),attachments);assert.equal(f.calls.length,2);assert(f.calls.every(call=>call.url.startsWith('https://www.googleapis.com/drive/v3/files/fixture-attachments')));
});
for(const options of [{parent:'fixture-originals'},{mime:'application/vnd.google-apps.shortcut'},{trashed:true}])test(`Drive boundary rejects ${JSON.stringify(options)}`,async()=>{
  const f=driveFixture(options);await assert.rejects(()=>f.store.loadAttachments({attachments:f.ref}));assert.equal(f.calls.length,1);
});
test('Drive adapter rejects tampered hash and aborts before acquiring a token',async()=>{
  const f=driveFixture({sha:hash});await assert.rejects(()=>f.store.loadAttachments({attachments:f.ref}),/revision mismatch/);
  const controller=new AbortController();controller.abort();const before=f.calls.length;await assert.rejects(()=>f.store.loadAttachments({attachments:f.ref},controller.signal));assert.equal(f.calls.length,before);
});
test('bounded response reader rejects size declared or streamed beyond the limit',async()=>{
  await assert.rejects(()=>limitedBytes(new Response('abc',{headers:{'content-length':'100'}}),4));
  await assert.rejects(()=>limitedBytes(new Response('12345'),4));assert.equal((await limitedBytes(new Response('1234'),4)).length,4);
});

test('session projection retains public pose but drops content/auth/history at every depth',()=>{
  const state={schemaVersion:1,periodId:'window-2000',styleId:'journal',camera:{x:0,y:0,zoom:1,privateNote:'remove'},route:{edgeId:'xinhua-edge-4',t:0.7,direction:1,privateAnchor:'remove'},outline:{revision:'fixture',originRoute:'registered-entry',environmentId:'fixture-env',position:[1,2],yaw:0,distance:23,pitch:.6,distanceWalked:0,path:[[3,4]],visited:['private-visit'],destination:'private-place',privateText:'remove'},street:{lateral:5.5,heading:0,cameraYaw:0,target:{private:'remove'}},selectedMemoryId:'private-note',returnStack:[{text:'remove'}],auth:{token:'remove'}};
  const safe=publicSessionSnapshot(state),serialized=JSON.stringify(safe);assert(!serialized.includes('remove'));assert(!serialized.includes('private-'));assert(!('returnStack'in safe));assert.deepEqual(safe.outline.position,[1,2]);assert.equal(safe.outline.environmentId,'fixture-env');assert.deepEqual(safe.outline.visited,[]);assert.equal(safe.street.target,null);
});
test('public export policy excludes private/untracked/server/test/hidden paths',()=>{
  for(const path of ['content/private/x.json','private/x.json','server/private-api.mjs','tests/private-content.test.mjs','assets/private/x.png','assets/candidates/x.png','.env','content/public/../secret.json','src/x.test.js'])assert.equal(isPublicBuildPath(path),false,path);
  for(const path of ['index.html','src/adapters/private-repository.js','content/public/manifest.json','content/reference/map.geojson','assets/vendor/three/LICENSE','scenes/xinhua-sanli-outline/runtime.mjs'])assert.equal(isPublicBuildPath(path),true,path);
});
test('export copies only allowed tracked inputs and rejects nested private JSON and symlinks',async()=>{
  const dir=await mkdtemp(join(tmpdir(),'dm-public-'));
  try{
    await mkdir(join(dir,'content/public'),{recursive:true});await mkdir(join(dir,'content/private'),{recursive:true});await writeFile(join(dir,'index.html'),'fixture');await writeFile(join(dir,'content/public/ok.json'),'{"privacy":"public"}');await writeFile(join(dir,'content/private/secret.json'),'not-public');await writeFile(join(dir,'content/public/untracked.json'),'not-tracked');
    const copied=await exportPublicFiles(dir,join(dir,'dist'),['index.html','content/public/ok.json','content/private/secret.json']);assert.deepEqual(copied,['index.html','content/public/ok.json']);await assert.rejects(()=>readFile(join(dir,'dist/content/private/secret.json')));await assert.rejects(()=>readFile(join(dir,'dist/content/public/untracked.json')));
    await writeFile(join(dir,'content/public/ok.json'),'{"records":[{"privacy":"private"}]}');await assert.rejects(()=>exportPublicFiles(dir,join(dir,'out'),['index.html','content/public/ok.json']),/Private data/);
    await rm(join(dir,'content/public/ok.json'));await symlink(join(dir,'content/private/secret.json'),join(dir,'content/public/ok.json'));await assert.rejects(()=>exportPublicFiles(dir,join(dir,'out'),['index.html','content/public/ok.json']),/symlinks/);
  }finally{await rm(dir,{recursive:true,force:true});}
});
