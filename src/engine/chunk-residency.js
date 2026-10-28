import { SpatialIndex } from './spatial-index.js';

/** Synchronous geometry factories; network ownership stays with the repository adapter. */
export function createChunkResidency({ maxWarmChunks = 8, maxWarmBytes = 16 * 1024 * 1024,
  warmTTL = 15000, clock = () => performance.now() } = {}) {
  for (const value of [maxWarmChunks, maxWarmBytes, warmTTL]) if (!Number.isFinite(value) || value < 0) throw new Error('Invalid warm-cache budget');
  const definitions = new Map(), resident = new Map(), index = new SpatialIndex();
  let destroyed = false, created = 0, evicted = 0;
  const check = () => { if (destroyed) throw new Error('Chunk residency disposed'); };
  const size = handle => Math.max(0, Number(handle.bytes) || 0);

  function ensure(id, { now = clock() } = {}) {
    check();
    let record = resident.get(id);
    if (!record) {
      const definition = definitions.get(id);
      if (!definition) throw new Error('Unknown chunk: ' + id);
      const handle = definition.create();
      if (!handle || typeof handle.dispose !== 'function') throw new Error('Chunk factory must provide dispose: ' + id);
      record = { id, handle, lastUsed: now, active: false, pinned: false };
      resident.set(id, record); created++;
    }
    record.lastUsed = now;
    return record.handle;
  }

  function release(record) {
    resident.delete(record.id);
    evicted++;
    record.handle.dispose();
  }

  function update({ activeIds = [], pinnedIds = [], prefetchIds = [], now = clock() } = {}) {
    check();
    const active = new Set(activeIds), pinned = new Set(pinnedIds);
    for (const id of new Set([...active, ...pinned])) ensure(id, { now });
    // Prepare at most one optional neighbour per turn; active/collision chunks take priority.
    const next = prefetchIds.find(id => definitions.has(id) && !resident.has(id));
    if (next !== undefined && maxWarmChunks > 0) ensure(next, { now });
    for (const record of resident.values()) {
      const wasActive = record.active;
      record.active = active.has(record.id); record.pinned = pinned.has(record.id);
      if (record.active || record.pinned || wasActive) record.lastUsed = now;
      if (record.handle.setActive) record.handle.setActive(record.active);
      else if (record.handle.root) record.handle.root.visible = record.active;
    }
    let warm = [...resident.values()].filter(record => !record.active && !record.pinned);
    for (const record of warm) if (now - record.lastUsed >= warmTTL) release(record);
    warm = warm.filter(record => resident.has(record.id)).sort((a, b) => a.lastUsed - b.lastUsed || a.id.localeCompare(b.id));
    let warmBytes = warm.reduce((sum, record) => sum + size(record.handle), 0);
    while (warm.length > maxWarmChunks || warmBytes > maxWarmBytes) {
      const record = warm.shift();
      warmBytes -= size(record.handle); release(record);
    }
    return [...active].map(id => resident.get(id).handle);
  }

  return {
    register(definition) {
      check();
      if (!definition?.id || definitions.has(definition.id) || typeof definition.create !== 'function') throw new Error('Invalid or duplicate chunk');
      index.insert(definition.id, definition.bounds, definition);
      definitions.set(definition.id, definition);
    },
    query: bounds => index.query(bounds),
    get: id => resident.get(id)?.handle || null,
    ensure, update,
    stats() {
      const records = [...resident.values()], warm = records.filter(r => !r.active && !r.pinned);
      return { registered: definitions.size, resident: records.length, active: records.filter(r => r.active).length,
        pinned: records.filter(r => r.pinned).length, warm: warm.length,
        estimatedBytes: records.reduce((sum, r) => sum + size(r.handle), 0),
        warmBytes: warm.reduce((sum, r) => sum + size(r.handle), 0),
        maxWarmChunks, maxWarmBytes, warmTTL, created, evicted, disposed: destroyed };
    },
    dispose() {
      if (destroyed) return;
      destroyed = true;
      let error;
      for (const record of [...resident.values()]) try { release(record); } catch (cause) { error ||= cause; }
      definitions.clear(); index.clear();
      if (error) throw error;
    },
  };
}
