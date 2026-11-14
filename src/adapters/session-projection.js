/** Persist public browsing pose/preferences, never content, auth, selections or history. */
export function publicSessionSnapshot(state) {
  const result = { schemaVersion: 1 };
  const copyString = key => { if (typeof state[key] === 'string' && state[key].length <= 128) result[key] = state[key]; };
  for (const key of ['periodId', 'styleId', 'characterId', 'mapRevision', 'entryTransition', 'travelMode']) copyString(key);
  if (state.camera && ['x','y','zoom'].every(key => Number.isFinite(state.camera[key]))) result.camera = { x: state.camera.x, y: state.camera.y, zoom: state.camera.zoom };
  const route = state.route;
  if (route && /^xinhua-edge-\d+$/.test(route.edgeId) && Number.isFinite(route.t) && [1,-1].includes(route.direction)) result.route = { edgeId: route.edgeId, t: route.t, direction: route.direction };
  const street = state.street;
  if (street && ['lateral','heading','cameraYaw'].every(key => Number.isFinite(street[key]))) result.street = { lateral: street.lateral, heading: street.heading, cameraYaw: street.cameraYaw, target: null };
  const outline = state.outline;
  if (outline && typeof outline.revision === 'string' && outline.revision.length <= 128 && typeof outline.originRoute === 'string' && outline.originRoute.length <= 256 && Array.isArray(outline.position) && outline.position.length === 2 && outline.position.every(Number.isFinite) && ['yaw','distance','pitch','distanceWalked'].every(key => Number.isFinite(outline[key]))) {
    result.outline = { revision: outline.revision, originRoute: outline.originRoute, environmentId: typeof outline.environmentId === 'string' ? outline.environmentId.slice(0, 128) : null, position: [...outline.position], yaw: outline.yaw, distance: outline.distance, pitch: outline.pitch, distanceWalked: outline.distanceWalked, path: [], visited: [], destination: null };
  }
  return result;
}
