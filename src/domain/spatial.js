/** The sole world/image registration authority. Coordinates are WGS84, never GCJ-02. */
const R = 6371008.8;
const rad = Math.PI / 180;
export function createTransform(bounds, size = 1200, padding = 78) {
  if (bounds.length !== 4 || !bounds.every(Number.isFinite) || bounds[0] >= bounds[2] || bounds[1] >= bounds[3]) throw new Error('Invalid bounds');
  const origin = [(bounds[0] + bounds[2]) / 2, (bounds[1] + bounds[3]) / 2];
  const kx = R * rad * Math.cos(origin[1] * rad), ky = R * rad;
  const scale = (size - 2 * padding) / Math.max((bounds[2] - bounds[0]) * kx, (bounds[3] - bounds[1]) * ky);
  const toWorld = ([lng, lat]) => [(lng - origin[0]) * kx, (lat - origin[1]) * ky];
  const toImage = coordinate => { const [x, y] = toWorld(coordinate); return [size / 2 + x * scale, size / 2 - y * scale]; };
  const fromImage = ([x, y]) => [origin[0] + (x - size / 2) / scale / kx, origin[1] - (y - size / 2) / scale / ky];
  return Object.freeze({ revision: 'local-equirectangular-r1', bounds, origin, size, padding, scale, toWorld, toImage, fromImage });
}
export class SpatialRegistry {
  constructor(places, transform) {
    this.transform = transform;
    this.places = new Map();
    for (const place of places) {
      if (!place.id || this.places.has(place.id)) throw new Error('Duplicate or absent place ID');
      this.places.set(place.id, structuredClone(place));
    }
  }
  all() { return [...this.places.values()].map(p => structuredClone(p)); }
  get(id) { const p = this.places.get(id); return p ? structuredClone(p) : null; }
  register(id, geometry, expectedRevision) {
    const place = this.places.get(id);
    if (!place || place.geometryRevision !== expectedRevision) throw new Error('Registration revision conflict');
    if (!geometry || !['Point', 'LineString', 'Polygon'].includes(geometry.type)) throw new Error('Unsupported geometry');
    const coordinates = geometry.type === 'Point' ? [geometry.coordinates] : geometry.type === 'LineString' ? geometry.coordinates : geometry.coordinates.flat();
    if (!coordinates.length || coordinates.some(p => p.length !== 2 || !p.every(Number.isFinite) || Math.abs(p[0]) > 180 || Math.abs(p[1]) > 90)) throw new Error('Invalid WGS84 geometry');
    const next = { ...place, geometry: structuredClone(geometry), geometryRevision: expectedRevision + 1 };
    this.places.set(id, next);
    return structuredClone(next);
  }
  anchor(id) { const g = this.places.get(id)?.geometry; return g?.type === 'Point' ? this.transform.toImage(g.coordinates) : null; }
  queryWindow([west, south, east, north]) {
    return this.all().filter(p => p.geometry?.type === 'Point' && p.geometry.coordinates[0] >= west && p.geometry.coordinates[0] <= east && p.geometry.coordinates[1] >= south && p.geometry.coordinates[1] <= north);
  }
  queryCorridor(line, widthMeters) {
    if (line.length < 2 || widthMeters < 0) throw new Error('Invalid corridor');
    const route = line.map(this.transform.toWorld);
    return this.all().filter(place => {
      if (place.geometry?.type !== 'Point') return false;
      const p = this.transform.toWorld(place.geometry.coordinates);
      return route.slice(1).some((b, i) => segmentDistance(p, route[i], b) <= widthMeters);
    });
  }
}
export function segmentDistance(p, a, b) {
  const dx = b[0] - a[0], dy = b[1] - a[1];
  const t = Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / (dx * dx + dy * dy || 1)));
  return Math.hypot(p[0] - a[0] - t * dx, p[1] - a[1] - t * dy);
}
