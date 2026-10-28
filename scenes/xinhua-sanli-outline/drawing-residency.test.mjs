import test from 'node:test';
import assert from 'node:assert/strict';
import { register } from 'node:module';
register(new URL('./three-test-loader.mjs', import.meta.url));
let T, makeDrawing, makeSiteDetails, makeSpatialDrawing, boundsOf;
const ready = Promise.all([import('../xinhua-junction-outline/vendor/three/build/three.module.js'), import('./drawing.mjs'),
  import('./site-details.mjs'), import('./spatial-drawing.mjs')]).then(([three, drawing, site, spatial]) => {
  T = three; ({ makeDrawing } = drawing); ({ makeSiteDetails } = site); ({ makeSpatialDrawing, boundsOf } = spatial);
});

function cameraAt(x = 0) {
  const camera = new T.PerspectiveCamera(50, 1280 / 720, .1, 380);
  camera.position.set(x, 16, 30); camera.lookAt(x, 1, 0); camera.updateMatrixWorld();
  return camera;
}
const house = (id, x) => ({ id, ring: [[x - 4, -4], [x + 4, -4], [x + 4, 4], [x - 4, 4]], height: 12, kind: 'tower' });
function fixture() {
  return { northDirection: [0, -1], eastDirection: [1, 0], northLength: 50, eastLength: 50, gates: [],
    buildings: [house('near', 0), house('far', 1000)],
    cars: [{ id: 'car-near', position: [8, 0], yaw: 0 }, { id: 'car-far', position: [1008, 0], yaw: 0 }],
    trees: [{ id: 'tree-near', position: [-8, 0], height: 5 }, { id: 'tree-far', position: [992, 0], height: 5 }] };
}

test('Open rear contours have no false roof, retain source height and release their private fade material',async()=>{
 await ready;const data=fixture();data.buildings=[{...house('near',0),height:71.1}];data.cars=[];data.trees=[];
 data.buildingPresentation=[{sourceBuildingId:'near',openUpper:{fadeStart:18,fadeEnd:24}}];
 const scene=new T.Scene(),drawing=makeDrawing(scene,data,{maxWarmChunks:0});drawing.resize(1280,720);drawing.update(cameraAt());
 const silhouette=drawing.active('silhouettes')[0],mesh=drawing.meshes[0];assert.equal(data.buildings[0].height,71.1);
 const lines=silhouette.outline.geometry.attributes.instanceStart.data.array;
 for(let i=0;i<silhouette.outline.geometry.instanceCount;i++){const a=lines.slice(i*6,i*6+6);assert(!(a[1]>1&&a[4]>1),'upper horizontal cap is absent');assert(Math.max(a[1],a[4])<=20.11);}
 assert.notEqual(mesh.material,drawing.face);assert(mesh.material.transparent);let disposed=0;mesh.material.addEventListener('dispose',()=>disposed++);
 drawing.update(cameraAt(1000));assert.equal(disposed,1);drawing.dispose();assert.equal(disposed,1);
});

test('Geometry is lazy, warm eviction releases private buffers, and shared ink survives reentry', async () => {
  await ready;
  const scene = new T.Scene(), drawing = makeDrawing(scene, fixture(), { maxWarmChunks: 0 });
  let sharedDisposals = 0;
  drawing.mainInk.addEventListener('dispose', () => sharedDisposals++);
  assert.equal(drawing.residencyAudit.created, 0);
  drawing.resize(1280, 720); drawing.update(cameraAt(), 0, true);
  const near = drawing.meshes.find(mesh => mesh.userData.id === 'near');
  assert(near); assert(!drawing.meshes.some(mesh => mesh.userData.id === 'far'));
  const owner = drawing.trees.find(tree => tree.id === 'tree-near').inkOwner;
  const allOwners = [...drawing.trees.map(tree => tree.inkOwner), ...drawing.cars.flatMap(car => [car.outline.userData.inkOwner, ...car.wheels.map(wheel => wheel.userData.inkOwner)])];
  assert.equal(new Set(allOwners).size, allOwners.length);
  let privateDisposals = 0;
  near.geometry.addEventListener('dispose', () => privateDisposals++);
  const updates = drawing.residencyAudit.staticUpdates;
  drawing.update(cameraAt(), 1, true);
  assert.equal(drawing.residencyAudit.staticUpdates, updates, 'an unchanged camera does not rewrite static contours');
  drawing.update(cameraAt(1000), 2, true);
  assert.equal(privateDisposals, 1); assert.equal(sharedDisposals, 0);
  assert.equal(drawing.residencyAudit.warm, 0);
  drawing.update(cameraAt(), 3, true);
  assert.notEqual(drawing.meshes.find(mesh => mesh.userData.id === 'near').geometry, near.geometry);
  assert.equal(drawing.trees.find(tree => tree.id === 'tree-near').inkOwner, owner, 'owner identity survives chunk reload');
  drawing.dispose(); drawing.dispose(); drawing.releaseObject(scene);
  assert.equal(sharedDisposals, 1); assert.equal(scene.children.length, 0);
});

test('Collision candidates can load an offscreen chunk without activating its rendering', async () => {
  await ready;
  const scene = new T.Scene(), shared = new T.MeshBasicMaterial(), pool = makeSpatialDrawing(scene, { shared: new Set([shared]), maxWarmChunks: 0 });
  for (const x of [0, 1000]) pool.register({ id: String(x), bounds: boundsOf([[x, 0]], 2, 0, 10), collision: true,
    build(root, collections) { const mesh = new T.Mesh(new T.BoxGeometry(4, 10, 4), shared); mesh.position.set(x, 5, 0); root.add(mesh); collections.meshes.push(mesh); } });
  pool.prepare(cameraAt());
  const candidates = pool.collisionCandidates(new T.Vector3(990, 5, 0), new T.Vector3(1010, 5, 0));
  assert.equal(candidates.length, 1); assert.equal(candidates[0].position.x, 1000);
  const ray = new T.Raycaster(new T.Vector3(990, 5, 0), new T.Vector3(1, 0, 0), 0, 20);
  assert(ray.intersectObjects(candidates, false).length > 0);
  pool.prepare(cameraAt());
  assert.equal(pool.audit.pinned, 1);
  assert(!pool.active('meshes').includes(candidates[0]));
  assert.equal(candidates[0].parent.parent.parent, null, 'inactive chunk is detached from the render tree');
  pool.dispose(); shared.dispose();
});

test('A dense visible fence grows past the old 2400-segment capacity without truncation', async () => {
  await ready;
  const data = fixture(); data.buildings = []; data.cars = []; data.trees = [];
  data.fences = [{ id: 'dense', points: [[-20, 0], [20, 0]], height: 2, barSpacing: .01 }];
  const scene = new T.Scene(), drawing = makeDrawing(scene, data), site = makeSiteDetails(scene, data, drawing), camera = cameraAt();
  camera.position.set(0, 16, 40); camera.lookAt(0, 1, 0); camera.updateMatrixWorld();
  drawing.update(camera, 0, true); site.update(camera);
  assert(site.audit.visibleFenceBars > 2400);
  const fence = drawing.active('fences')[0], buffer = fence.geometry.attributes.instanceStart.data;
  assert(buffer.array.length >= site.audit.visibleFenceBars * 6);
  const version = buffer.version; site.update(camera); assert.equal(buffer.version, version);
  drawing.dispose(); drawing.releaseObject(scene);
});

test('An evicted shop releases its texture and ignores a late font completion', async () => {
  await ready;
  const original = globalThis.document; let finish, paints = 0;
  globalThis.document = { fonts: { ready: new Promise(resolve => finish = resolve) },
    createElement: () => ({ width: 0, height: 0, getContext: () => ({ clearRect() {}, fillText() { paints++; } }) }) };
  try {
    const data = fixture(); data.buildings[0] = { ...data.buildings[0], kind: 'shop', label: '店', streetFacing: true };
    const scene = new T.Scene(), drawing = makeDrawing(scene, data, { maxWarmChunks: 0 });
    drawing.update(cameraAt(), 0, true);
    let texture;
    scene.traverse(object => { if (object.material?.map) texture = object.material.map; });
    assert(texture); let released = 0; texture.addEventListener('dispose', () => released++);
    drawing.update(cameraAt(1000), 1, true); assert.equal(released, 1);
    const before = paints; finish(); await Promise.resolve(); assert.equal(paints, before);
    drawing.dispose(); drawing.releaseObject(scene);
  } finally { globalThis.document = original; }
});
