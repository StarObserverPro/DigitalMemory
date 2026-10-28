import { initialSession,validOutlineState } from '../application/session.js';
export function restoreSession(storage, manifest) {
  try {
    const saved = JSON.parse(storage.getItem('digitalmemory:session:v1'));
    if (!saved || saved.schemaVersion !== 1 || !manifest.periods.some(p => p.id === saved.periodId) || !manifest.assets.some(a => a.id === saved.styleId)) return null;
    const camera = saved.camera;
    if (!camera || ![camera.x, camera.y, camera.zoom].every(Number.isFinite) || camera.zoom < 1 || camera.zoom > 3) return null;
    // Scene content is loaded separately; a reload always has a usable map origin.
    const entryTransition = saved.entryTransition === 'simple' ? 'simple' : 'journal';
    return { ...structuredClone(initialSession), entryTransition, outline: validOutlineState(saved.outline) ? {...saved.outline,path:[],destination:null} : null, mapRevision: typeof saved.mapRevision === 'string' ? saved.mapRevision : null, placeId: manifest.placeIds.includes(saved.placeId) ? saved.placeId : null, periodId: saved.periodId, styleId: saved.styleId, characterId: ['child','youth'].includes(saved.characterId)?saved.characterId:'child', camera: { ...camera }, route: saved.route || structuredClone(initialSession.route), street: saved.street && [saved.street.lateral,saved.street.heading].every(Number.isFinite) && saved.street.lateral >= 4.65 && saved.street.lateral <= 7.05 ? saved.street : structuredClone(initialSession.street) };
  } catch { return null; }
}
export function saveSession(storage, state) {
  try { storage.setItem('digitalmemory:session:v1', JSON.stringify(state)); return true; } catch { return false; }
}
