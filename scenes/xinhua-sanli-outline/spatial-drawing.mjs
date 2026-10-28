import * as T from '../xinhua-junction-outline/vendor/three/build/three.module.js';
import { SpatialIndex } from '../../src/engine/spatial-index.js';
import { createChunkResidency } from '../../src/engine/chunk-residency.js';
import { createResourceScope } from '../../src/engine/resource-scope.js';

export function boundsOf(points, padding = 0, minY = -.1, maxY = 1) {
  if (!points.length) throw new Error('A drawing needs spatial bounds');
  return { minX: Math.min(...points.map(p => p[0])) - padding,
    maxX: Math.max(...points.map(p => p[0])) + padding,
    minZ: Math.min(...points.map(p => p[1])) - padding,
    maxZ: Math.max(...points.map(p => p[1])) + padding, minY, maxY };
}

// Screen-space thick strokes can extend past their world-space centerlines.
const boxOf = b => new T.Box3(new T.Vector3(b.minX - 4, (b.minY ?? -.1) - 4, b.minZ - 4),
  new T.Vector3(b.maxX + 4, (b.maxY ?? 1) + 4, b.maxZ + 4));
const mergeBounds = (a, b) => ({ minX: Math.min(a.minX, b.minX), maxX: Math.max(a.maxX, b.maxX),
  minZ: Math.min(a.minZ, b.minZ), maxZ: Math.max(a.maxZ, b.maxZ),
  minY: Math.min(a.minY ?? -.1, b.minY ?? -.1), maxY: Math.max(a.maxY ?? 1, b.maxY ?? 1) });

/** Metadata is permanent; Three.js objects exist only in active or bounded warm chunks. */
export function makeSpatialDrawing(scene, { shared, chunkSize = 64, ...cacheOptions } = {}) {
  const chunks = new Map(), records = new Map(), collisionIndex = new SpatialIndex(chunkSize);
  const residency = createChunkResidency(cacheOptions), pinned = new Set();
  const frustum = new T.Frustum(), matrix = new T.Matrix4();
  const audit = { chunkSize, registeredObjects: 0, activeObjects: 0, collisionCandidates: 0,
    cameraSelections: 0, staticUpdates: 0, activeIds: [], ...residency.stats() };
  let sealed = false, disposed = false, cameraKey = '', activeIds = [], activeEntries = [], cullCamera;

  function register({ id, bounds, build, collision = false }) {
    if (disposed || sealed) throw new Error('Register drawing factories before the first frame');
    if (!id || records.has(id)) throw new Error('Duplicate drawing: ' + id);
    // A long pavement stays one low-complexity surface, with its own residency owner.
    // It must not enlarge the bounds of unrelated houses sharing its midpoint cell.
    const broad = Math.max(bounds.maxX - bounds.minX, bounds.maxZ - bounds.minZ) > chunkSize * 1.5;
    const chunkId = broad ? 'span:' + id : `cell:${Math.floor((bounds.minX + bounds.maxX) / (2 * chunkSize))},${Math.floor((bounds.minZ + bounds.maxZ) / (2 * chunkSize))}`;
    const record = { id, bounds, box: boxOf(bounds), build, collision, chunkId };
    records.set(id, record);
    if (!chunks.has(chunkId)) chunks.set(chunkId, { id: chunkId, bounds, records: [] });
    const chunk = chunks.get(chunkId); chunk.bounds = mergeBounds(chunk.bounds, bounds); chunk.records.push(record);
    if (collision) collisionIndex.insert(id, bounds, record);
    audit.registeredObjects = records.size;
    return record;
  }

  function createChunk(chunk) {
    const root = new T.Group(); root.name = chunk.id; root.visible = false;
    const scope = createResourceScope({ shared }), entries = new Map(), life = { disposed: false };
    scene.add(root);
    try {
      for (const record of chunk.records) {
        const group = new T.Group(); group.name = record.id; root.add(group);
        const collections = { meshes: [], silhouettes: [], cars: [], trees: [], openings: [], thinLines: [], fences: [], fixtures: [] };
        record.build(group, collections, life);
        entries.set(record.id, { record, root: group, collections });
      }
      scope.trackObject(root); root.updateMatrixWorld(true);
    } catch (error) {
      life.disposed = true; scope.trackObject(root); root.removeFromParent(); scope.dispose(); throw error;
    }
    return { root, entries, get bytes() { return scope.bytes; },
      setActive(active) { root.visible = active; if (active) { if (!root.parent) scene.add(root); } else root.removeFromParent(); },
      dispose() { if (life.disposed) return; life.disposed = true; root.removeFromParent(); scope.dispose(); } };
  }

  function seal() {
    if (sealed) return;
    sealed = true;
    for (const chunk of chunks.values()) residency.register({ id: chunk.id, bounds: chunk.bounds, create: () => createChunk(chunk) });
    Object.assign(audit, residency.stats());
  }

  function select(camera) {
    cullCamera ||= camera.clone(); cullCamera.copy(camera);
    // Keep the complete camera frustum: the accepted LineMaterial has fog=false,
    // so black contours beyond the filled surfaces' fog distance remain visible.
    cullCamera.updateProjectionMatrix(); cullCamera.updateMatrixWorld();
    matrix.multiplyMatrices(cullCamera.projectionMatrix, cullCamera.matrixWorldInverse); frustum.setFromProjectionMatrix(matrix);
    const corners = [];
    for (const x of [-1, 1]) for (const y of [-1, 1]) for (const z of [-1, 1]) corners.push(new T.Vector3(x, y, z).unproject(cullCamera));
    const viewBounds = boundsOf(corners.map(p => [p.x, p.z]), 4);
    activeIds = residency.query(viewBounds).filter(chunk => frustum.intersectsBox(boxOf(chunk.bounds))).map(chunk => chunk.id);
    audit.cameraSelections++;
  }

  function prepare(camera, now) {
    if (disposed) return;
    seal(); camera.updateMatrixWorld();
    const nextKey = [...camera.matrixWorld.elements, ...camera.projectionMatrix.elements].map(v => v.toFixed(6)).join(',');
    if (nextKey !== cameraKey) { cameraKey = nextKey; select(camera); }
    const handles = residency.update({ activeIds, pinnedIds: [...pinned], ...(now === undefined ? {} : { now }) });
    pinned.clear(); activeEntries = [];
    for (const handle of handles) for (const entry of handle.entries.values()) {
      entry.root.visible = frustum.intersectsBox(entry.record.box);
      if (entry.root.visible) activeEntries.push(entry);
    }
    Object.assign(audit, residency.stats(), { activeObjects: activeEntries.length, activeIds: [...activeIds] });
  }

  function collisionCandidates(from, to) {
    if (disposed) return [];
    seal();
    const x = p => p.x ?? p[0], z = p => p.z ?? p[1];
    const candidates = collisionIndex.query(boundsOf([[x(from), z(from)], [x(to), z(to)]], .5));
    const result = [];
    for (const record of candidates) {
      pinned.add(record.chunkId);
      const handle = residency.ensure(record.chunkId), entry = handle.entries.get(record.id);
      entry.root.updateWorldMatrix(true, true); result.push(...entry.collections.meshes);
    }
    audit.collisionCandidates = result.length;
    return result;
  }

  return { register, prepare, collisionCandidates, audit,
    get cameraKey() { return cameraKey; },
    active: key => activeEntries.flatMap(entry => entry.collections[key] || []),
    dispose() { if (disposed) return; disposed = true; residency.dispose(); collisionIndex.clear(); activeEntries = []; activeIds = []; pinned.clear(); chunks.clear(); records.clear(); Object.assign(audit, residency.stats(), { activeObjects: 0, activeIds: [] }); } };
}

/** Grow a live line buffer only when needed, releasing its previous GPU allocation. */
export function ensureSegmentCapacity(geometry, segments) {
  const current = geometry.attributes.instanceStart.data.array.length / 6;
  if (segments <= current) return current;
  const capacity = Math.max(16, 2 ** Math.ceil(Math.log2(segments)));
  geometry.dispose(); geometry.setPositions(new Float32Array(capacity * 6));
  return capacity;
}
