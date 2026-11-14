/** Server-side allowlist projection. Never spread authoring records into responses. */
export const CONTENT_LIMIT = 2 * 1024 * 1024;
export const MEDIA_LIMIT = 12 * 1024 * 1024;
const ID = /^[a-zA-Z0-9][a-zA-Z0-9_-]{0,127}$/;
const HASH = /^[a-f0-9]{64}$/;
const MIME = new Set(['image/jpeg', 'image/png', 'image/webp']);
export function id(value) {
  if (typeof value !== 'string' || !ID.test(value)) throw Error('Invalid identifier');
  return value;
}
function text(value, max, optional = false) {
  if (optional && value == null) return '';
  if (typeof value !== 'string' || value.length > max) throw Error('Invalid text');
  return value;
}
function revision(value) { return text(value, 128); }
function unique(rows, max = 10000) {
  if (!Array.isArray(rows) || rows.length > max) throw Error('Invalid records');
  const seen = new Set();
  for (const row of rows) { id(row.id); if (seen.has(row.id)) throw Error('Duplicate identifier'); seen.add(row.id); }
  return rows;
}
function ref(value) {
  if (!value || !HASH.test(value.sha256)) throw Error('Unpinned file');
  return { fileId: id(value.fileId), sha256: value.sha256 };
}
export function releaseRecord(value) {
  if (value?.schemaVersion !== 1 || value.kind !== 'digitalmemory.private-release' || value.privacy !== 'private' || value.status !== 'approved') throw Error('Release unavailable');
  return {
    schemaVersion: 1, releaseId: id(value.releaseId), revision: revision(value.revision),
    geometryRevision: revision(value.geometryRevision), transformRevision: revision(value.transformRevision),
    attachments: ref(value.attachments),
    memories: unique(value.memories).map(row => ({ id: row.id, ...ref(row) })),
    media: unique(value.media).map(row => {
      if (row.role !== 'display' || !MIME.has(row.mimeType)) throw Error('Display media required');
      return { id: row.id, ...ref(row), role: 'display', mimeType: row.mimeType };
    })
  };
}
export function timeRecord(value) {
  if (!value || !['unknown','stage','window'].includes(value.kind)) throw Error('Invalid time');
  const result = { kind: value.kind, originalExpression: text(value.originalExpression, 500, true) };
  if (value.kind === 'stage') result.stageId = id(value.stageId);
  if (value.kind === 'window') {
    if (![value.start, value.end].every(Number.isFinite) || value.start > value.end) throw Error('Invalid time window');
    result.start = value.start; result.end = value.end;
  }
  return result;
}
function anchorRecord(value) {
  if (value?.kind === 'route-progress') {
    if (!Number.isFinite(value.progress) || value.progress < 0 || value.progress > 1) throw Error('Invalid progress');
    if (!['left', 'right', 'unspecified'].includes(value.side)) throw Error('Invalid side');
    return { kind: value.kind, edgeId: id(value.edgeId), progress: value.progress, side: value.side };
  }
  if (value?.kind === 'wgs84') {
    const p = value.coordinates;
    if (!Array.isArray(p) || p.length !== 2 || !p.every(Number.isFinite) || Math.abs(p[0]) > 180 || Math.abs(p[1]) > 90) throw Error('Invalid coordinates');
    return { kind: value.kind, coordinates: [...p] };
  }
  if (value?.kind === 'unresolved') return { kind: 'unresolved' };
  throw Error('Unsupported anchor');
}
export function attachmentRecords(value, release) {
  if (value?.schemaVersion !== 1 || value.privacy !== 'private') throw Error('Invalid attachment package');
  const memoryIds = new Set(release.memories.map(row => row.id));
  return unique(value.records).map(row => {
    if (row.geometryRevision !== release.geometryRevision || row.transformRevision !== release.transformRevision) throw Error('Registration revision mismatch');
    if (row.target?.type !== 'note' || !memoryIds.has(row.target.memoryId)) throw Error('Unreleased target');
    return { id: row.id, revision: revision(row.revision), routeId: id(row.routeId), placeId: row.placeId == null ? null : id(row.placeId),
      geometryRevision: row.geometryRevision, transformRevision: row.transformRevision,
      anchor: anchorRecord(row.anchor), time: timeRecord(row.time), target: { type: 'note', memoryId: row.target.memoryId } };
  });
}
export function memoryRecord(value, expectedId, release) {
  if (value?.schemaVersion !== 1 || value.privacy !== 'private' || value.id !== expectedId) throw Error('Invalid memory');
  const mediaIds = new Set(release.media.map(row => row.id));
  if (!Array.isArray(value.images) || value.images.length > 50) throw Error('Invalid images');
  return { id: id(value.id), revision: revision(value.revision), title: text(value.title, 300), text: text(value.text, 100000), time: timeRecord(value.time),
    images: value.images.map(image => {
      if (!mediaIds.has(image.assetId)) throw Error('Unreleased image');
      return { assetId: image.assetId, alt: text(image.alt, 1000, true), caption: text(image.caption, 2000, true) };
    }) };
}
