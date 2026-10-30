/** Life stages and date windows remain distinct until evidence supplies a mapping. */
export function relateTime(time, selection) {
  if (!time || !selection || time.kind === 'unknown' || selection.kind === 'unknown') return 'unknown';
  if (time.kind === 'stage' || selection.kind === 'stage') return time.kind === selection.kind && time.stageId === selection.stageId ? 'current' : 'unknown';
  if (![time.start, time.end, selection.start, selection.end].every(Number.isFinite)) return 'unknown';
  if (time.end < selection.start) return 'earlier';
  if (time.start > selection.end) return 'later';
  if (time.start >= selection.start && time.end <= selection.end) return 'current';
  return 'overlapping';
}
export function resolveEnvironment(states, placeId, period) {
  const state = states.find(s => s.placeId === placeId && s.approval === 'accepted' && relateTime(s.time, period) === 'current');
  return state ? { status: 'supported', state } : { status: 'no_supported_state', state: null };
}

/** Explicit period memberships, authored by the temporal registry; no nearest-year fallback. */
export function resolvePeriodState(states, periodId) {
  const selected = states.filter(s => s.approval === 'accepted' && s.periodIds.includes(periodId));
  if (selected.length > 1) throw new Error(`Conflicting accepted states for period: ${periodId}`);
  return selected[0] || null;
}

/** Extensions only join the selected street in their explicitly registered periods. */
export function outlineForPeriod(source, registration, periodId) {
  const data=structuredClone(source),enabled=!registration.bridgePeriodIds||registration.bridgePeriodIds.includes(periodId);
  if(!enabled){if(data.bridgeCorridor?.baseBounds)data.bounds=data.bridgeCorridor.baseBounds;delete data.bridgeCorridor;}
  data.landmarks=Object.fromEntries(Object.entries(data.landmarks).filter(([,place])=>!place.periodIds||place.periodIds.includes(periodId)));
  return data;
}
