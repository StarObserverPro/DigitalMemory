import { initialSession } from '../application/session.js';
export function restoreSession(storage, manifest) {
  try {
    const saved = JSON.parse(storage.getItem('digitalmemory:session:v1'));
    if (!saved || saved.schemaVersion !== 1 || !manifest.periods.some(p => p.id === saved.periodId) || !manifest.assets.some(a => a.id === saved.styleId)) return null;
    const camera = saved.camera;
    if (!camera || ![camera.x, camera.y, camera.zoom].every(Number.isFinite) || camera.zoom < 1 || camera.zoom > 3) return null;
    // Scene content is loaded separately; a reload always has a usable map origin.
    return { ...structuredClone(initialSession), placeId: manifest.placeIds.includes(saved.placeId) ? saved.placeId : null, periodId: saved.periodId, styleId: saved.styleId, camera: { ...camera } };
  } catch { return null; }
}
export function saveSession(storage, state) {
  try { storage.setItem('digitalmemory:session:v1', JSON.stringify(state)); return true; } catch { return false; }
}
