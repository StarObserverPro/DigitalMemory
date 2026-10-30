import { validOutlineState } from '../application/session.js';
import { createLocalSceneFrame } from '../domain/spatial.js';
import { resolvePeriodState, outlineForPeriod } from '../domain/temporal.js';
import { makeNavigation } from '../../scenes/xinhua-sanli-outline/navigation.mjs';

/** One warm scene, with an expiry that is not extended by unrelated map renders. */
export function createRetainedStageSlot({
  ttlMs = 60_000, schedule = (callback, delay) => setTimeout(callback, delay),
  cancel = id => clearTimeout(id), onEvict = () => {}
} = {}) {
  let current = null, timer = null, disposed = false, generation = 0;
  const cancelExpiry = () => { generation++; if (timer !== null) cancel(timer); timer = null; };
  function clear() {
    cancelExpiry();
    const old = current;
    current = null;
    if (old) { try { old.dispose(); } finally { onEvict(old); } }
  }
  return {
    peek: () => current,
    set(value) {
      if (disposed) { value?.dispose(); return; }
      if (value !== current) { clear(); current = value; }
      cancelExpiry();
    },
    resume(compatible = () => true) {
      if (!current) return null;
      if (!compatible(current)) { clear(); return null; }
      cancelExpiry();
      current.resume?.();
      return current;
    },
    suspend() {
      if (!current || disposed) return;
      current.suspend?.();
      if (timer !== null) return;
      const token = generation, candidate = current;
      timer = schedule(() => {
        if (token !== generation || current !== candidate || disposed) return;
        timer = null;
        clear();
      }, ttlMs);
    },
    clear,
    dispose() { if (!disposed) { disposed = true; clear(); } }
  };
}

/** Adapts the renderer to the one application session and registered route. */
export async function createOutlineStage({
  container, session, mapping, repository, blocked = () => false, onMenu, onTravel,
  isCurrent = () => true, signal,
  loadRuntime = () => import('../../scenes/xinhua-sanli-outline/runtime.mjs'),
  createNavigation = makeNavigation
}) {
  if (!isCurrent() || signal?.aborted) return null;
  const requested = session.get(), routeKey = JSON.stringify(requested.route);
  const epoch = repository.epoch, sourcePath = repository.manifest?.outlineScene;
  const currentRequest = () => isCurrent() && !signal?.aborted && repository.epoch === epoch &&
    repository.manifest?.outlineScene === sourcePath && JSON.stringify(session.get().route) === routeKey &&
    session.get().periodId === requested.periodId;
  const { registration, data: sourceData } = await repository.loadOutline({ signal });
  const data=outlineForPeriod(sourceData,registration,requested.periodId),bridgeEnabled=Boolean(data.bridgeCorridor);
  if (!currentRequest()) return null;
  const { mountOutline } = await loadRuntime();
  if (!currentRequest()) return null;
  const environment = resolvePeriodState(registration.periodStates, requested.periodId);
  if (!environment) throw Error('No supported outline environment');
  const frame = createLocalSceneFrame(registration.frame), navigation = createNavigation(data);
  let controller = null, unsubscribe = null, disposed = false, published = false;
  const compatible = () => {
    if (disposed || repository.epoch !== epoch || repository.manifest?.outlineScene !== sourcePath) return false;
    const state = session.get();
    return JSON.stringify(state.route) === routeKey &&
      resolvePeriodState(registration.periodStates, state.periodId)?.id === environment.id &&
      Boolean(sourceData.bridgeCorridor&&(!registration.bridgePeriodIds||registration.bridgePeriodIds.includes(state.periodId))) === bridgeEnabled &&
      (!published || state.outline?.revision === registration.revision);
  };
  const dispose = () => {
    if (disposed) return;
    disposed = true;
    unsubscribe?.();
    try { controller?.dispose(); } finally { navigation.dispose?.(); }
  };
  try {
    const old = session.get().outline;
    const retain = validOutlineState(old) && old.revision === registration.revision &&
      old.originRoute === routeKey && old.environmentId === environment.id && navigation.walkable(old.position);
    const position = navigation.closest(frame.toLocal(mapping.locate(requested.route).geo));
    if (!position) throw Error('No starting pavement');
    const initial = retain ? { ...old, path: [], destination: null } : {
      revision: registration.revision, originRoute: routeKey, environmentId: environment.id,
      position, yaw: Math.PI / 6, distance: 23, pitch: .68,
      path: [], visited: [], destination: null, distanceWalked: 0
    };
    const visible = () => published && compatible() && session.get().view === 'street' && session.get().sceneId === 'map';
    controller = await mountOutline({
      container, sceneData: data, navigation,
      readState: () => published ? session.get().outline : initial,
      writeState: patch => {
        if (!published || !compatible()) return;
        session.dispatch({ type: 'outline-state', value: { ...session.get().outline, ...patch } });
      },
      isVisible: visible, isActive: () => visible() && !blocked(), onMenu, onTravel,
      readTravelMode: () => session.get().travelMode
    });
    if (!currentRequest()) { dispose(); return null; }
    published = true;
    session.dispatch({ type: 'outline-state', value: initial });
    unsubscribe = session.subscribe(() => controller.refresh?.());
    controller.refresh?.();
    return {
      ...controller, compatible, dispose, landmarks: data.landmarks,
      inspect: () => ({
        ...controller.inspect(), registrationRevision: registration.revision,
        environmentId: environment.id, geo: frame.toGeo(session.get().outline.position),
        navigation: navigation.stats?.() || null, nearEntrance: false
      })
    };
  } catch (error) { dispose(); throw error; }
}
