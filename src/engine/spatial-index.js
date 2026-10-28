/** Small immutable-record broad phase shared by rendering and navigation. */
export function intersectsBounds(a, b) {
  return a.minX <= b.maxX && a.maxX >= b.minX && a.minZ <= b.maxZ && a.maxZ >= b.minZ;
}

function validBounds(bounds) {
  return ['minX', 'maxX', 'minZ', 'maxZ'].every(key => Number.isFinite(bounds?.[key])) &&
    bounds.minX <= bounds.maxX && bounds.minZ <= bounds.maxZ;
}

export class SpatialIndex {
  constructor(cellSize = 64) {
    if (!(cellSize > 0) || !Number.isFinite(cellSize)) throw new Error('Invalid spatial cell size');
    this.cellSize = cellSize;
    this.cells = new Map();
    this.records = new Map();
    this.large = new Set();
  }

  keys(bounds) {
    const x0 = Math.floor(bounds.minX / this.cellSize), x1 = Math.floor(bounds.maxX / this.cellSize);
    const z0 = Math.floor(bounds.minZ / this.cellSize), z1 = Math.floor(bounds.maxZ / this.cellSize);
    // A long road or a whole-world ground plane must not allocate millions of buckets.
    if ((x1 - x0 + 1) * (z1 - z0 + 1) > 4096) return null;
    const keys = [];
    for (let z = z0; z <= z1; z++) for (let x = x0; x <= x1; x++) keys.push(`${x},${z}`);
    return keys;
  }

  insert(id, bounds, value) {
    if (!validBounds(bounds)) throw new Error('Invalid spatial bounds: ' + id);
    this.remove(id);
    const record = { id, bounds: { ...bounds }, value, keys: this.keys(bounds) };
    this.records.set(id, record);
    if (!record.keys) this.large.add(id);
    else for (const key of record.keys) {
      if (!this.cells.has(key)) this.cells.set(key, new Set());
      this.cells.get(key).add(id);
    }
    return value;
  }

  query(bounds) {
    if (!validBounds(bounds)) throw new Error('Invalid spatial query');
    const keys = this.keys(bounds), ids = new Set(this.large);
    if (!keys) for (const id of this.records.keys()) ids.add(id);
    else for (const key of keys) for (const id of this.cells.get(key) || []) ids.add(id);
    const matches = [];
    for (const id of ids) {
      const record = this.records.get(id);
      if (intersectsBounds(record.bounds, bounds)) matches.push(record.value);
    }
    return matches;
  }

  remove(id) {
    const record = this.records.get(id);
    if (!record) return false;
    for (const key of record.keys || []) {
      const bucket = this.cells.get(key);
      bucket.delete(id);
      if (!bucket.size) this.cells.delete(key);
    }
    this.large.delete(id);
    return this.records.delete(id);
  }

  clear() { this.records.clear(); this.cells.clear(); this.large.clear(); }
  get size() { return this.records.size; }
}
