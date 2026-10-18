import { resolvePeriodState } from './temporal.js';

/**
 * Pure composition planning, not a coordinate registry or an image renderer.
 * All bounds are rectangles in one already-registered illustration layout.
 * Production geometry remains owned by spatial.js / illustration.js.
 */
export const MAP_LEVELS = Object.freeze([
  Object.freeze({ id: 'town', contextOpacity: .16, labelBudget: 10 }),
  Object.freeze({ id: 'neighborhood', contextOpacity: .22, labelBudget: 16 }),
  Object.freeze({ id: 'street-map', contextOpacity: .26, labelBudget: 10 }),
]);
const clone = value => structuredClone(value);
const validRect = r => Array.isArray(r) && r.length === 4 && r.every(Number.isFinite) && r[2] > 0 && r[3] > 0;
export const overlaps = (a, b) => a[0] < b[0] + b[2] && b[0] < a[0] + a[2] && a[1] < b[1] + b[3] && b[1] < a[1] + a[3];
const contains = (outer, inner) => inner[0] >= outer[0] && inner[1] >= outer[1] && inner[0] + inner[2] <= outer[0] + outer[2] && inner[1] + inner[3] <= outer[1] + outer[3];
const intersect = (a, b) => {
  if (!overlaps(a, b)) return null;
  const x = Math.max(a[0], b[0]), y = Math.max(a[1], b[1]);
  return [x, y, Math.min(a[0] + a[2], b[0] + b[2]) - x, Math.min(a[1] + a[3], b[1] + b[3]) - y];
};
const union = rects => {
  const x = Math.min(...rects.map(r => r[0])), y = Math.min(...rects.map(r => r[1]));
  return [x, y, Math.max(...rects.map(r => r[0] + r[2])) - x, Math.max(...rects.map(r => r[1] + r[3])) - y];
};
const rect = (r, id) => { if (!validRect(r)) throw new Error(`Invalid bounds: ${id}`); };
const unique = (rows, name) => {
  if (rows.some(r => typeof r.id !== 'string' || !r.id) || new Set(rows.map(r => r.id)).size !== rows.length) throw new Error(`Duplicate or missing ${name} identity`);
};
const acceptedPeriods = feature => feature.states.filter(s => s.approval === 'accepted').flatMap(s => s.periodIds);
const sharesPeriod = (a, b) => acceptedPeriods(a).some(id => acceptedPeriods(b).includes(id));

/** Bridge ordering is explicit. Crossing lines do not create an intersection. */
export function orderRoadParts(parts) {
  unique(parts, 'road part');
  const byId = new Map(parts.map(p => [p.id, p]));
  const done = new Set(), visiting = new Set(), sorted = [];
  function visit(part) {
    if (done.has(part.id)) return;
    if (visiting.has(part.id)) throw new Error('Cyclic road paint order');
    visiting.add(part.id);
    for (const id of part.paintAfter || []) {
      if (!byId.has(id)) throw new Error(`Unknown road paint dependency: ${id}`);
      visit(byId.get(id));
    }
    visiting.delete(part.id); done.add(part.id); sorted.push(part);
  }
  [...parts].sort((a, b) => a.id.localeCompare(b.id)).forEach(visit);
  return sorted;
}

function validateStates(states, owner) {
  unique(states, `${owner} state`);
  for (const state of states) {
    if (!Array.isArray(state.periodIds) || !state.periodIds.length || state.periodIds.some(p => typeof p !== 'string' || !p) || new Set(state.periodIds).size !== state.periodIds.length) throw new Error(`Invalid periods: ${owner}`);
    if (!['accepted', 'draft'].includes(state.approval)) throw new Error(`Invalid state approval: ${owner}`);
  }
  for (const periodId of new Set(states.flatMap(s => s.periodIds))) resolvePeriodState(states, periodId);
}

export function validateMapAssembly(model) {
  if (model.schemaVersion !== 1 || !Number.isInteger(model.revision) || model.revision < 1 || !model.layoutRevision) throw new Error('Invalid assembly revision');
  rect(model.registrationBounds, 'registration');
  unique(model.context, 'context'); unique(model.roads, 'road'); unique(model.features, 'feature');
  for (const patch of model.context) {
    rect(patch.bounds, patch.id);
    if (!['land-wash', 'vegetation-wash', 'neutral-ground'].includes(patch.recipe?.typology)) throw new Error('Context fallback must be neutral');
    if (patch.states) validateStates(patch.states, patch.id);
    for (const recipe of [patch.recipe, ...(patch.states || []).map(s => s.recipe)]) {
      if (!recipe?.seed || !recipe?.styleRevision || !recipe?.typology) throw new Error(`Missing deterministic context recipe: ${patch.id}`);
    }
    if (patch.interactive !== false || patch.label != null) throw new Error('Context cannot impersonate a named place');
  }
  for (const road of model.roads) {
    if (!road.registrationRef) throw new Error('Road must reference spatial registration');
    validateStates(road.states, road.id);
    for (const state of road.states) {
      for (const reservation of state.reservations) rect(reservation, road.id);
      unique(state.parts, 'road part');
      const basePart = state.parts.find(p => p.id === state.basePartId);
      if (!basePart || basePart.kind !== 'surface' || basePart.minLevel !== 0 || state.reservations.some(r => !contains(basePart.bounds, r))) throw new Error('Road reservations require a visible base surface');
      for (const part of state.parts) {
        rect(part.bounds, part.id);
        if (!['surface', 'retaining-wall', 'deck', 'shadow', 'railing'].includes(part.kind)) throw new Error('Unknown road part');
        if (!Number.isInteger(part.minLevel) || part.minLevel < 0 || part.minLevel > 2) throw new Error('Invalid road detail level');
      }
      unique(state.bands, 'road band');
      for (const band of state.bands) {
        if (!['main', 'service', 'sidewalk', 'shared', 'rail'].includes(band.role)) throw new Error('Unknown road band');
        if (!Array.isArray(band.modes) || !band.modes.length || !band.profiles?.length) throw new Error('Missing road band profile');
        if (band.role === 'main' && band.modes.some(m => m === 'walk' || m === 'cycle')) throw new Error('Main carriageway is not a walking/cycling route');
        let previous = -1;
        for (const p of band.profiles) {
          if (![p.t, p.offset, p.width, p.elevation].every(Number.isFinite) || p.t < 0 || p.t > 1 || p.t <= previous || p.width <= 0) throw new Error('Invalid independent band profile');
          previous = p.t;
        }
        if (band.profiles[0].t !== 0 || band.profiles.at(-1).t !== 1) throw new Error('Road profile must cover its complete segment');
      }
    }
  }
  for (const feature of model.features) {
    if (!feature.placeId || !feature.registrationRef || !['landmark', 'memory'].includes(feature.emphasis)) throw new Error('Missing registered feature identity');
    rect(feature.ground, feature.id);
    if (!contains(model.registrationBounds, feature.ground)) throw new Error('Feature outside registration scope');
    validateStates(feature.states, feature.id);
    for (const state of feature.states) {
      if (!state.representations || !Object.keys(state.representations).length) throw new Error('Missing representations');
      for (const [level, rep] of Object.entries(state.representations)) {
        if (!['0', '1', '2'].includes(level) || !rep.assetRef || !rep.styleRevision) throw new Error('Invalid representation');
        rect(rep.bounds, feature.id);
        if (!Array.isArray(rep.groundAnchor) || rep.groundAnchor.length !== 2 || !rep.groundAnchor.every(Number.isFinite)) throw new Error('Missing drawing ground anchor');
        if (rep.labelBounds) rect(rep.labelBounds, feature.id);
      }
    }
  }
  const periods = new Set([...model.roads, ...model.features].flatMap(x => x.states.flatMap(s => s.periodIds)));
  for (const period of periods) {
    const roadStates = model.roads.map(r => resolvePeriodState(r.states, period)).filter(Boolean);
    const parts = roadStates.flatMap(s => s.parts);
    orderRoadParts(parts);
    const reservations = roadStates.flatMap(s => s.reservations);
    for (const feature of model.features.filter(f => resolvePeriodState(f.states, period))) {
      if (reservations.some(r => overlaps(feature.ground, r))) throw new Error(`Feature overlaps reserved road: ${feature.id}`);
    }
  }
  for (let i = 0; i < model.features.length; i++) for (let j = i + 1; j < model.features.length; j++) {
    const a = model.features[i], b = model.features[j];
    if (overlaps(a.ground, b.ground) && sharesPeriod(a, b)) throw new Error(`Feature reservation conflict: ${a.id}, ${b.id}`);
  }
  return true;
}

/**
 * Rendering instructions only. Context stays pale at every zoom and remains
 * non-interactive. Mask only solids actually drawn at this period/detail tier.
 */
export function planMapAssembly(model, { periodId, level, viewport, availableAssets = null }) {
  validateMapAssembly(model);
  if (!Number.isInteger(level) || !MAP_LEVELS[level]) throw new Error('Unknown map detail level');
  rect(viewport, 'viewport');
  if (availableAssets !== null && !Array.isArray(availableAssets)) throw new Error('Expected available asset reference list');
  const policy = MAP_LEVELS[level];
  const roadStates = model.roads.map(r => ({ road: r, state: resolvePeriodState(r.states, periodId) })).filter(r => r.state);
  const roadParts = orderRoadParts(roadStates.flatMap(({ road, state }) => state.parts.map(p => ({ ...p, roadId: road.id })))).filter(p => p.minLevel <= level && overlaps(p.bounds, viewport));
  const features = model.features.flatMap(feature => {
    const state = resolvePeriodState(feature.states, periodId), rep = state?.representations[level];
    if (!rep || !overlaps(rep.bounds, viewport) || (availableAssets !== null && !availableAssets.includes(rep.assetRef))) return [];
    return [{ id: feature.id, placeId: feature.placeId, registrationRef: feature.registrationRef, stateId: state.id, ground: feature.ground, emphasis: feature.emphasis, priority: feature.priority || 0, label: feature.label || null, ...rep, opacity: 1 }];
  }).sort((a, b) => a.groundAnchor[1] - b.groundAnchor[1] || a.id.localeCompare(b.id));
  // A culled, unsupported or not-yet-loaded object cannot erase its pale context.
  const allRenderedSolids = features.map(feature => feature.ground);
  const renderedRoadIds = new Set(roadParts.map(p => p.id));
  const reservations = roadStates.filter(({ state }) => renderedRoadIds.has(state.basePartId)).flatMap(({ state }) => state.reservations);
  const context = model.context.filter(c => overlaps(c.bounds, viewport)).map(patch => ({
    id: patch.id, bounds: patch.bounds, interactive: false, opacity: policy.contextOpacity,
    recipe: (patch.states && resolvePeriodState(patch.states, periodId)?.recipe) || patch.recipe,
    exclude: [...reservations, ...allRenderedSolids].map(r => intersect(patch.bounds, r)).filter(Boolean),
  }));
  const labels = [];
  for (const f of [...features].sort((a, b) => b.priority - a.priority || a.id.localeCompare(b.id))) {
    if (labels.length >= policy.labelBudget) break;
    if (f.label && f.labelBounds && !labels.some(l => overlaps(l.bounds, f.labelBounds))) labels.push({ id: f.id, text: f.label, bounds: f.labelBounds });
  }
  return clone({ revision: model.revision, layoutRevision: model.layoutRevision, level: policy.id, periodId,
    backdrop: { ...model.backdrop, bounds: viewport }, context, roadParts, features, labels,
    character: null, registrationBounds: model.registrationBounds,
  });
}

/** Propose a local insertion/revision; never push neighboring solids or roads. */
export function upsertMapFeature(model, feature, expectedRevision) {
  if (model.revision !== expectedRevision) throw new Error('Assembly revision conflict');
  validateMapAssembly(model);
  const next = clone(model), replacement = clone(feature);
  const index = next.features.findIndex(f => f.id === feature.id), prior = next.features[index];
  if (prior && prior.placeId !== feature.placeId) throw new Error('Cannot change stable place identity');
  if (index === -1) next.features.push(replacement); else next.features[index] = replacement;
  next.revision += 1;
  validateMapAssembly(next);
  const versions = [prior, replacement].filter(Boolean);
  const dirtyGround = versions.map(f => f.ground);
  const dirtyVisual = versions.flatMap(f => [f.ground, ...f.states.flatMap(s => Object.values(s.representations).flatMap(r => [r.bounds, r.labelBounds].filter(Boolean)))]);
  return {
    model: next,
    change: {
      featureId: feature.id, dirtyBounds: union(dirtyVisual),
      contextIds: next.context.filter(p => dirtyGround.some(r => overlaps(r, p.bounds))).map(p => p.id),
      changedRoadIds: [],
    },
  };
}
