import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {SCHOOLBOY_VARIANTS,SCHOOLBOY_SCALE} from '../src/explorer/schoolboy.js';

const asset=n=>readFileSync(new URL('../assets/characters/schoolboy/'+n,import.meta.url));
const json=n=>{
  const b=asset(n);
  assert.equal(b.toString('ascii',0,4),'glTF',n+' must be GLB, not an image/mock');
  assert.equal(b.readUInt32LE(4),2,n+' must be glTF 2');
  assert.equal(b.readUInt32LE(8),b.length,n+' byte length');
  const size=b.readUInt32LE(12);
  return JSON.parse(b.subarray(20,20+size).toString('utf8'));
};

test('schoolboy ships a real skinned body and all four independent appearance parts',()=>{
  const body=json('body.glb');
  assert.ok(body.skins?.length>0);
  assert.ok(body.nodes.some(n=>n.name==='head'));
  assert.ok(body.nodes.some(n=>n.name==='hips'));
  for(const p of ['hair-short.glb','jacket.glb','trousers.glb','shoes.glb']){
    const j=json(p);
    assert.ok(j.skins?.length>0,p+' needs its own transferable humanoid skin');
    assert.ok(j.meshes?.length>0);
    assert.ok(j.nodes.some(n=>n.name==='head'));
  }
});
test('the shipped clip files contain real named idle/walk animations',()=>{
  const idle=json('idle.glb'),walk=json('walk.glb');
  assert.ok(idle.animations.some(a=>a.name==='Idle_A'));
  assert.ok(walk.animations.some(a=>a.name==='Walking_A'));
  const both=[...idle.animations,...walk.animations];
  for(const a of both)assert.ok(a.channels.length>0);
});
test('the two Beijing-era student uniforms share the same shaped rig',()=>{
  assert.notEqual(SCHOOLBOY_VARIANTS.blue.accent,SCHOOLBOY_VARIANTS.red.accent);
  assert.match(SCHOOLBOY_VARIANTS.blue.label,/high school/);
  assert.match(SCHOOLBOY_VARIANTS.red.label,/junior/);
  assert.ok(SCHOOLBOY_SCALE.headBoneScale>0.4&&SCHOOLBOY_SCALE.headBoneScale<0.65);
  assert.equal(SCHOOLBOY_SCALE.height,1.4);
});
test('retained legacy street stage installs the GLB before its render loop and updates its clip',()=>{
  const stage=readFileSync(new URL('../src/explorer/stage.js',import.meta.url),'utf8');
  const world=readFileSync(new URL('../src/explorer/street-world.js',import.meta.url),'utf8');
  assert.ok(stage.indexOf('await loadSchoolboy()')<stage.indexOf('new T.WebGLRenderer'));
  assert.ok(stage.includes('world.installAvatar(avatar)'));
  assert.ok(stage.includes('world.updateAvatar(dt,gaitAmount,moved)'));
  assert.ok(world.includes('person.clear();schoolboy=avatar;person.add(avatar.root)'));
});
