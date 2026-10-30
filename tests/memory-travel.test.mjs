import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { destinationGroups, resolveLanding } from '../src/explorer/destinations.js';
import { makeNavigation, routeLength } from '../scenes/xinhua-sanli-outline/navigation.mjs';
import { createSession } from '../src/application/session.js';
import { saveSession, restoreSession } from '../src/adapters/session-storage.js';

const data = JSON.parse(await readFile('scenes/xinhua-sanli-outline/scene-data.json'));

test('regional search preserves all scene anchors exactly once, including future anchors', () => {
  const groups = destinationGroups(data.landmarks);
  assert.equal(groups.length, 5);
  const ids = groups.flatMap(group => group.places.map(place => place.id));
  assert.equal(new Set(ids).size, ids.length);
  assert.deepEqual(ids.toSorted(), Object.keys(data.landmarks).toSorted());
  assert.deepEqual(destinationGroups(data.landmarks, '云柏').flatMap(group => group.places.map(place => place.id)), ['yunbai']);
  assert.equal(destinationGroups(data.landmarks, '三里')[0].places.length, 10);
  assert.equal(destinationGroups(data.landmarks, '不存在的地方').length, 0);
  const future = destinationGroups({ ...data.landmarks, future: { id: 'future', label: '新地点', position: [1, 2] } });
  assert.equal(future.at(-1).places[0].id, 'future');
});

test('all registered destinations have valid landing ground without path search', () => {
  const navigation = makeNavigation(data);
  navigation.route = () => { throw Error('Landing must not run A*'); };
  try {
    for (const goal of Object.values(data.landmarks)) {
      const landing = resolveLanding(navigation, goal.position);
      assert(landing, goal.id);
      assert(navigation.walkable(landing), goal.id);
      assert(Math.hypot(...landing.map((value, index) => value - goal.position[index])) <= 3, goal.id);
    }
    assert.equal(resolveLanding(navigation, [data.bounds.maxX + 100, data.bounds.maxZ + 100]), null);
    assert.equal(resolveLanding(navigation, [NaN, 1]), null);
  } finally { navigation.dispose(); }
});

test('Xinhua crossings use the direct segment at six separated road sections', () => {
  const navigation = makeNavigation(data);
  try {
    for (const index of [2, 3, 4, 6, 8, 9]) {
      const a = data.corridor.centerline[index], b = data.corridor.centerline[index + 1];
      const length = Math.hypot(b[0] - a[0], b[1] - a[1]);
      const normal = [-(b[1] - a[1]) / length, (b[0] - a[0]) / length];
      const midpoint = a.map((value, axis) => (value + b[axis]) / 2);
      const from = midpoint.map((value, axis) => value + normal[axis] * 9);
      const to = midpoint.map((value, axis) => value - normal[axis] * 9);
      assert(navigation.walkable(from) && navigation.walkable(to), `section ${index}: both sidewalks`);
      assert(navigation.clear(from, to), `section ${index}: unobstructed crossing`);
      const route = navigation.route(from, to);
      assert.equal(route.length, 2);
      assert(Math.abs(routeLength(route) - 18) < 1e-7, `section ${index}: no crossing-node detour`);
    }
    for (const fence of data.fences) {
      const [a, b] = fence.points;
      assert(!navigation.walkable(a.map((value, axis) => (value + b[axis]) / 2)));
    }
  } finally { navigation.dispose(); }
});

test('ground travel preference persists, validates old saves and survives nested return', () => {
  const session = createSession();
  assert.equal(session.get().travelMode, 'walk');
  session.dispatch({ type: 'enter', sceneId: 'fixture' });
  session.dispatch({ type: 'travel-mode', mode: 'jump' });
  session.dispatch({ type: 'back' });
  assert.equal(session.get().travelMode, 'jump');
  session.dispatch({ type: 'travel-mode', mode: 'invalid' });
  assert.equal(session.get().travelMode, 'jump');
  let saved;
  const storage = { setItem: (_, value) => { saved = value; }, getItem: () => saved };
  const manifest = { periods: [{ id: 'window-2000' }], assets: [{ id: 'journal' }], placeIds: [] };
  saveSession(storage, session.get());
  assert.equal(restoreSession(storage, manifest).travelMode, 'jump');
  saved = JSON.stringify({ ...session.get(), travelMode: undefined });
  assert.equal(restoreSession(storage, manifest).travelMode, 'walk');
});
