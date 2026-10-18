import { advanceStage, STAGE } from '../domain/illustration.js';
import { CHARACTER_PROFILES } from '../domain/composition.js';
export const initialSession = Object.freeze({ schemaVersion: 1, placeId: null, periodId: 'window-2000', styleId: 'journal', sceneId: 'map', selectedMemoryId: null, camera: { x: 0, y: 0, zoom: 1 }, mode: 'walking', view: 'map', route: { edgeId: 'xinhua-edge-4', t: .70, direction: 1 }, street: { lateral: 5.5, heading: 0, cameraYaw: 0, target: null }, returnStack: [] });
export function reduceSession(state, command, mapping) {
  switch (command.type) {
    case 'layer': return Object.hasOwn(state.layers, command.id) ? {...state,layers:{...state.layers,[command.id]:!!command.visible}} : state;
    case 'frontage-preview': return ['none','stationery','repair'].includes(command.id) ? {...state,frontagePreview:command.id} : state;
    case 'character': return CHARACTER_PROFILES[command.id] ? {...state,characterId:command.id} : state;
    case 'route': return mapping?.valid(command.route) ? { ...state, route: { ...command.route } } : state;
    case 'walk': { if (!mapping || state.sceneId !== 'map') return state; return state.view === 'street' ? { ...state, ...advanceStage(state.route, state.street, command.input, command.dt, mapping) } : { ...state, route: mapping.advance(state.route, (command.input.forward || 0) * Math.min(command.dt, .05) * 35) }; }
    case 'street-camera': return Number.isFinite(command.yaw) ? {...state,street:{...state.street,cameraYaw:command.yaw}} : state;
    case 'street-target': {
      const t=command.target;
      if(t && (!Number.isFinite(t.distance)||!Number.isFinite(t.lateral)))return state;
      return {...state,street:{...state.street,target:t?{distance:Math.max(STAGE.min,Math.min(STAGE.max,t.distance)),lateral:Math.max(STAGE.lateralMin,Math.min(STAGE.lateralMax,t.lateral)),entranceId:t.entranceId||null}:null}};
    }
    case 'street-heading': return Number.isFinite(command.heading) ? { ...state, street: { ...state.street, heading: command.heading } } : state;
    case 'view': return ['map', 'street'].includes(command.view) ? { ...state, view: command.view } : state;
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
export function createSession(saved = null, mapping = null) {
  let state = structuredClone({ ...initialSession, characterId:'child',frontagePreview:'none',layers:{roads:true,buildings:true,frontages:true,person:true}, ...saved });
  state.street={...initialSession.street,...state.street,target:null};
  state.street.lateral=Math.max(STAGE.lateralMin,Math.min(STAGE.lateralMax,state.street.lateral));
  const listeners = new Set();
  return { get: () => structuredClone(state), dispatch(command) { state = reduceSession(state, command, mapping); for (const fn of listeners) fn(structuredClone(state)); return structuredClone(state); }, subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); } };
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
