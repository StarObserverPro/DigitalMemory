export const initialSession = Object.freeze({ schemaVersion: 1, placeId: null, periodId: 'window-2000', styleId: 'paper', sceneId: 'map', selectedMemoryId: null, camera: { x: 0, y: 0, zoom: 1 }, mode: 'walking', returnStack: [] });
export function reduceSession(state, command) {
  switch (command.type) {
    case 'select-place': return { ...state, placeId: command.id, selectedMemoryId: null };
    case 'select-memory': return { ...state, placeId: command.placeId, selectedMemoryId: command.id };
    case 'period': return { ...state, periodId: command.id, selectedMemoryId: null };
    case 'style': return { ...state, styleId: command.id };
    case 'camera': return { ...state, camera: { ...state.camera, ...command.camera, zoom: Math.max(1, Math.min(3, command.camera.zoom ?? state.camera.zoom)) } };
    case 'enter': return { ...state, sceneId: command.sceneId, returnStack: [...state.returnStack, structuredClone({ ...state, returnStack: [] })] };
    case 'back': { const previous = state.returnStack.at(-1); return previous ? { ...previous, returnStack: state.returnStack.slice(0, -1) } : state; }
    default: throw new Error(`Unknown command: ${command.type}`);
  }
}
export function createSession(saved = null) {
  let state = structuredClone(saved ?? initialSession);
  const listeners = new Set();
  return { get: () => structuredClone(state), dispatch(command) { state = reduceSession(state, command); for (const fn of listeners) fn(structuredClone(state)); return structuredClone(state); }, subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); } };
}
/** Late responses cannot change a navigation that has been superseded or cancelled. */
export function createPortalController(session, repository) {
  let generation = 0;
  return {
    cancel() { generation++; },
    async enter(sceneId) {
      const token = ++generation;
      const scene = await repository.loadScene(sceneId);
      if (token !== generation) return null;
      session.dispatch({ type: 'enter', sceneId });
      return scene;
    },
    back() { generation++; return session.dispatch({ type: 'back' }); }
  };
}
