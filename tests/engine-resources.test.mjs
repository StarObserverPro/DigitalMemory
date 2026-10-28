import test from 'node:test';
import assert from 'node:assert/strict';
import { SpatialIndex } from '../src/engine/spatial-index.js';
import { createChunkResidency } from '../src/engine/chunk-residency.js';
import { createResourceScope } from '../src/engine/resource-scope.js';
import * as T from '../scenes/xinhua-junction-outline/vendor/three/build/three.module.js';

test('spatial broad phase keeps crossing bounds once and removes old registrations', () => {
  const index = new SpatialIndex(10), tower = { id: 'tower' };
  index.insert('tower', { minX: -1, maxX: 11, minZ: 2, maxZ: 25 }, tower);
  assert.deepEqual(index.query({ minX: 10, maxX: 12, minZ: 8, maxZ: 26 }), [tower]);
  index.insert('tower', { minX: 100, maxX: 101, minZ: 100, maxZ: 101 }, tower);
  assert.deepEqual(index.query({ minX: -10, maxX: 20, minZ: 0, maxZ: 30 }), []);
  index.insert('ground', { minX: -1e7, maxX: 1e7, minZ: -1e7, maxZ: 1e7 }, 'ground');
  assert.deepEqual(index.query({ minX: 0, maxX: 1, minZ: 0, maxZ: 1 }), ['ground']);
  assert(index.cells.size < 10);
  index.clear(); assert.equal(index.size, 0);
});

test('travel and return keep active chunks while warm count/bytes/age remain bounded', () => {
  const loads = new Map(), released = [], handles = [];
  const manager = createChunkResidency({ maxWarmChunks: 2, maxWarmBytes: 12, warmTTL: 50 });
  for (let i = 0; i < 8; i++) manager.register({
    id: String(i), bounds: { minX: i * 20, maxX: i * 20 + 10, minZ: 0, maxZ: 10 },
    create() {
      loads.set(i, (loads.get(i) || 0) + 1);
      const handle = { root: { visible: true }, bytes: 6, dispose() { released.push(handle); } };
      handles.push(handle); return handle;
    },
  });
  manager.update({ activeIds: ['0'], now: 0 }); const first = manager.get('0');
  manager.update({ activeIds: ['1'], now: 1 });
  assert.equal(first.root.visible, false);
  manager.update({ activeIds: ['0'], now: 2 });
  assert.equal(manager.get('0'), first); assert.equal(loads.get(0), 1);
  for (let i = 2; i < 8; i++) {
    manager.update({ activeIds: [String(i)], now: i + 5 });
    assert(manager.stats().warm <= 2); assert(manager.stats().warmBytes <= 12);
    assert.equal(manager.stats().active, 1);
  }
  assert.equal(manager.get('0'), null);
  manager.update({ activeIds: ['0'], pinnedIds: ['7'], now: 100 });
  assert.notEqual(manager.get('0'), first); assert.equal(loads.get(0), 2);
  assert.equal(manager.get('7').root.visible, false); assert.equal(manager.stats().pinned, 1);
  assert.equal(manager.stats().warm, 0);
  manager.dispose(); manager.dispose();
  assert.equal(released.length, handles.length); assert.equal(new Set(released).size, handles.length);
  assert.equal(manager.stats().resident, 0); assert.throws(() => manager.ensure('0'), /disposed/);
});

test('prefetch is bounded and never evicts a visible or collision-pinned allocation', () => {
  let built = 0;
  const manager = createChunkResidency({ maxWarmChunks: 1, maxWarmBytes: 1, warmTTL: 1000 });
  for (const id of ['visible', 'collision', 'near1', 'near2']) manager.register({ id,
    bounds: { minX: 0, maxX: 1, minZ: 0, maxZ: 1 },
    create: () => { built++; return { bytes: 2, dispose() {} }; },
  });
  manager.update({ activeIds: ['visible'], pinnedIds: ['collision'], prefetchIds: ['near1', 'near2'], now: 0 });
  assert.equal(built, 3); assert(manager.get('visible')); assert(manager.get('collision'));
  assert.equal(manager.stats().warm, 0); manager.dispose();
});

test('chunk disposal releases private line/mesh buffers once and preserves shared material/texture owners', () => {
  const sharedTexture = new T.Texture(), sharedMaterial = new T.MeshBasicMaterial({ map: sharedTexture });
  const owner = createResourceScope(); owner.own(sharedTexture); owner.own(sharedMaterial);
  const root = new T.Group(), geometry = new T.BoxGeometry(), lineGeometry = new T.BufferGeometry();
  lineGeometry.setAttribute('position', new T.Float32BufferAttribute([0,0,0,1,1,1], 3));
  const lineMaterial = new T.LineBasicMaterial(), privateTexture = new T.Texture();
  const shader = new T.ShaderMaterial({ uniforms: { image: { value: privateTexture } } });
  root.add(new T.Mesh(geometry, sharedMaterial), new T.Mesh(geometry, sharedMaterial),
    new T.LineSegments(lineGeometry, lineMaterial), new T.Mesh(new T.PlaneGeometry(), shader));
  const counts = new Map();
  for (const resource of [geometry, lineGeometry, lineMaterial, sharedMaterial, sharedTexture, shader, privateTexture]) {
    counts.set(resource, 0); resource.addEventListener('dispose', () => counts.set(resource, counts.get(resource) + 1));
  }
  const chunk = createResourceScope({ shared: new Set([sharedMaterial, sharedTexture]) });
  chunk.trackObject(root); assert(chunk.bytes > 0); chunk.dispose(); chunk.dispose();
  for (const resource of [geometry, lineGeometry, lineMaterial, shader, privateTexture]) assert.equal(counts.get(resource), 1);
  assert.equal(counts.get(sharedMaterial), 0); assert.equal(counts.get(sharedTexture), 0);
  owner.dispose(); owner.dispose(); assert.equal(counts.get(sharedMaterial), 1); assert.equal(counts.get(sharedTexture), 1);
  assert.equal(chunk.bytes, 0);
});
