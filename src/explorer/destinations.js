// These are UI groupings of existing scene anchors, not new geographic records.
const regions = [
  { id: 'xinhua-west', label: '新华街西段', ids: ['west', 'westWide', 'wuliForecourt', 'westShops', 'westEnd'] },
  { id: 'xinhua-east', label: '新华街路口与东段', ids: ['south', 'eastWide', 'eastEnd', 'southEdge'] },
  { id: 'sanli', label: '新华街三里', ids: ['east', 'north', 'bins', 'court', 'plaza', 'garden', 'mid', 'rear', 'northCourt', 'eastCourt'] },
  { id: 'kandan', label: '看丹桥与七里西侧', ids: ['kandanBridge', 'kandanView', 'bridgeWest', 'bridgePanorama', 'daoxiangcunPlaza', 'yunbai'] }
];

export function destinationGroups(landmarks, query = '') {
  const known = new Set(regions.flatMap(region => region.ids));
  const extra = Object.keys(landmarks).filter(id => !known.has(id));
  const needle = query.trim().toLocaleLowerCase();
  return [...regions, { id: 'other', label: '其他地点', ids: extra }].map(region => ({
    id: region.id, label: region.label,
    places: region.ids.map(id => landmarks[id]).filter(place => place &&
      (!needle || `${region.label} ${place.label}`.toLocaleLowerCase().includes(needle)))
  })).filter(region => region.places.length);
}

export function resolveLanding(navigation, point, maxSnap = 3) {
  if (!Array.isArray(point) || point.length !== 2 || !point.every(Number.isFinite)) return null;
  if (navigation.walkable(point)) return [...point];
  const nearby = navigation.closest(point);
  return nearby && Math.hypot(nearby[0] - point[0], nearby[1] - point[1]) <= maxSnap ? nearby : null;
}
