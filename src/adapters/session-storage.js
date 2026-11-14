import { initialSession,validOutlineState } from '../application/session.js';
import { publicSessionSnapshot } from './session-projection.js';
export function restoreSession(storage, manifest) {
  try {
    const saved = JSON.parse(storage.getItem('digitalmemory:session:v1'));
    if (!saved || saved.schemaVersion !== 1 || !manifest.periods.some(p => p.id === saved.periodId) || !manifest.assets.some(a => a.id === saved.styleId)) return null;
    const camera = saved.camera;
    if (!camera || ![camera.x, camera.y, camera.zoom].every(Number.isFinite) || camera.zoom < 1 || camera.zoom > 3) return null;
    const safe = publicSessionSnapshot(saved);
    // Drop legacy full-session selections/history immediately, not only on the next save.
    try { storage.setItem('digitalmemory:session:v1', JSON.stringify(safe)); } catch { /* Browsing remains usable without storage writes. */ }
    const entryTransition = safe.entryTransition === 'simple' ? 'simple' : 'journal';
    return { ...structuredClone(initialSession), entryTransition, travelMode: safe.travelMode === 'jump' ? 'jump' : 'walk', outline: validOutlineState(safe.outline) ? safe.outline : null, mapRevision: typeof safe.mapRevision === 'string' ? safe.mapRevision : null, placeId: null, periodId: safe.periodId, styleId: safe.styleId, characterId: ['child','youth'].includes(safe.characterId)?safe.characterId:'child', camera: { ...safe.camera }, route: safe.route || structuredClone(initialSession.route), street: safe.street && [safe.street.lateral,safe.street.heading].every(Number.isFinite) && safe.street.lateral >= 4.65 && safe.street.lateral <= 7.05 ? safe.street : structuredClone(initialSession.street) };
  } catch { return null; }
}
export function saveSession(storage, state) {
  try { storage.setItem('digitalmemory:session:v1', JSON.stringify(publicSessionSnapshot(state))); return true; } catch { return false; }
}
