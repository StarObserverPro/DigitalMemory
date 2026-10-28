import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
import { PublicRepository } from '../src/adapters/public-repository.js';
import { createSession } from '../src/application/session.js';
import { createOutlineStage, createRetainedStageSlot } from '../src/explorer/outline-stage.js';

const deferred = () => { let resolve, reject; const promise = new Promise((a, b) => { resolve = a; reject = b; }); return { promise, resolve, reject }; };
const turn = () => new Promise(resolve => setImmediate(resolve));
const publicResponse = value => ({ ok: true, json: async () => ({ privacy: 'public', ...value }) });
const data = { privacy: 'public', revision: 'data-1', artRevision: 'art-1', spawn: [0, 0], landmarks: {} };
const bytes = Buffer.from(JSON.stringify(data));
const registration = {
  privacy: 'public', revision: 'registered-1', dataRevision: data.revision, artRevision: data.artRevision,
  data: 'scene-data.json', sha256: createHash('sha256').update(bytes).digest('hex'),
  frame: { origin: [116, 40], kx: 100, ky: 100 },
  periodStates: [
    { id: 'working', approval: 'accepted', periodIds: ['window-2000', 'window-1995'] },
    { id: 'different', approval: 'accepted', periodIds: ['another-period'] }
  ]
};

test('validated outline loads share pending work and return independent cached records', async () => {
  let registrations = 0, payloads = 0;
  const repository = new PublicRepository('https://fixture.test/', async url => {
    if (url.endsWith('registration.json')) { registrations++; return publicResponse(registration); }
    payloads++; return { ok: true, arrayBuffer: async () => bytes };
  });
  repository.manifest = { outlineScene: 'registration.json' };
  const [first, second] = await Promise.all([repository.loadOutline(), repository.loadOutline()]);
  first.data.artRevision = 'mutated';
  assert.equal(second.data.artRevision, 'art-1');
  assert.equal((await repository.loadOutline()).data.artRevision, 'art-1');
  assert.equal(registrations, 1); assert.equal(payloads, 1);
  assert.equal(repository.inspect().inFlight, 0);
});

test('decoded record retention is bounded by LRU entry and encoded-byte budgets', async () => {
  const counts = new Map();
  const repository = new PublicRepository('https://fixture.test/', async url => {
    counts.set(url, (counts.get(url) || 0) + 1);
    return publicResponse({ id: url });
  }, { maxEntries: 2, maxBytes: 150 });
  await repository.read('a'); await repository.read('b'); await repository.read('a'); await repository.read('c');
  assert.equal(repository.inspect().cachedEntries, 2);
  assert(repository.inspect().cachedEncodedBytes <= 150);
  await repository.read('b');
  assert.equal(counts.get('https://fixture.test/b'), 2);
  const tiny = new PublicRepository('https://fixture.test/', async () => publicResponse({ long: 'x'.repeat(300) }), { maxEntries: 2, maxBytes: 30 });
  await tiny.read('large');
  assert.equal(tiny.inspect().cachedEntries, 0);
});

test('aborting one consumer does not cancel another consumer of the same request', async () => {
  const response = deferred(), abort = new AbortController(); let fetches = 0;
  const repository = new PublicRepository('https://fixture.test/', () => { fetches++; return response.promise; });
  const cancelled = repository.read('shared', { signal: abort.signal });
  const remaining = repository.read('shared');
  await turn();
  const rejected = assert.rejects(cancelled, { name: 'AbortError' });
  abort.abort(); await rejected;
  response.resolve(publicResponse({ id: 'ready' }));
  assert.equal((await remaining).id, 'ready');
  assert.equal(fetches, 1);
});

test('invalidation rejects late results and cannot clear or poison a newer request', async () => {
  const responses = [deferred(), deferred()]; let fetches = 0;
  const repository = new PublicRepository('https://fixture.test/', () => responses[fetches++].promise);
  const old = repository.read('same');
  await turn(); repository.invalidate();
  const newer = repository.read('same');
  await turn();
  const rejected = assert.rejects(old, { name: 'AbortError' });
  responses[0].resolve(publicResponse({ version: 1 })); await rejected;
  assert.equal(repository.inspect().inFlight, 1);
  responses[1].resolve(publicResponse({ version: 2 }));
  assert.equal((await newer).version, 2);
  assert.equal((await repository.read('same')).version, 2);
  assert.equal(fetches, 2);
  repository.dispose(); repository.dispose();
  await assert.rejects(repository.read('same'), { name: 'AbortError' });
});

test('failed integrity checks are not cached and can be retried', async () => {
  let corrupt = true, payloads = 0;
  const repository = new PublicRepository('https://fixture.test/', async url => {
    if (url.endsWith('registration.json')) return publicResponse(registration);
    payloads++;
    return { ok: true, arrayBuffer: async () => corrupt ? Buffer.from('{}') : bytes };
  });
  repository.manifest = { outlineScene: 'registration.json' };
  await assert.rejects(repository.loadOutline(), /checksum/);
  assert.equal(repository.inspect().inFlight, 0);
  corrupt = false;
  assert.equal((await repository.loadOutline()).data.revision, 'data-1');
  assert.equal(payloads, 2);
});

function fixture(overrides = {}) {
  const session = createSession(null, { valid: () => true });
  const counters = { navigation: 0, released: 0, mounted: 0, disposed: 0, refreshed: 0 };
  const repository = { epoch: 0, manifest: { outlineScene: 'registration.json' }, loadOutline: async () => ({ registration, data }) };
  let suppliedNavigation;
  const options = {
    session, repository, mapping: { locate: () => ({ geo: [116, 40] }) },
    createNavigation: () => {
      counters.navigation++;
      return { closest: p => p, walkable: () => true, stats: () => ({ cachedCells: 1 }), dispose: () => counters.released++ };
    },
    loadRuntime: async () => ({ mountOutline: async options => {
      counters.mounted++; suppliedNavigation = options.navigation;
      assert.equal(session.get().outline, undefined, 'mount has not published session state');
      return { inspect: () => ({}), refresh: () => counters.refreshed++, dispose: () => counters.disposed++ };
    } }),
    ...overrides
  };
  return { options, session, repository, counters, suppliedNavigation: () => suppliedNavigation };
}

test('cancelled module loading does not construct a scene or alter the session', async () => {
  const runtime = deferred(); let current = true;
  const value = fixture({ isCurrent: () => current, loadRuntime: () => runtime.promise });
  const pending = createOutlineStage(value.options);
  await turn(); current = false;
  runtime.resolve({ mountOutline: () => { throw Error('stale mount'); } });
  assert.equal(await pending, null);
  assert.equal(value.session.get().outline, undefined);
  assert.equal(value.counters.navigation, 0);
});

test('a stage completed after cancellation releases its owners without publishing', async () => {
  const mounted = deferred(); let current = true;
  const value = fixture({ isCurrent: () => current, loadRuntime: async () => ({ mountOutline: () => mounted.promise }) });
  const pending = createOutlineStage(value.options);
  await turn(); current = false;
  mounted.resolve({ dispose: () => value.counters.disposed++ });
  assert.equal(await pending, null);
  assert.equal(value.counters.disposed, 1);
  assert.equal(value.counters.released, 1);
  assert.equal(value.session.get().outline, undefined);
});

test('the application cancellation owner restores an empty street origin to the overview', async () => {
  // Run the actual entry owner against a domain session without booting the DOM.
  const source = await readFile(new URL('../src/explorer/main.js', import.meta.url), 'utf8');
  const owner = source.slice(source.indexOf('function cancelStreetLoad()'), source.indexOf('function discardStage()'));
  for (const origin of [
    { view: 'street', sceneId: 'map', stage: null, expected: 'map' },
    { view: 'street', sceneId: 'map', stage: {}, expected: 'street' },
    { view: 'street', sceneId: 'courtyard', stage: null, expected: 'street' }
  ]) {
    const session = createSession({ view: origin.view, sceneId: origin.sceneId });
    const abort = new AbortController();
    const context = { session, stage: origin.stage, streetLoadController: abort, streetLoadGeneration: 4, startingStage: true };
    runInNewContext(owner + '\ncancelStreetLoad();', context);
    assert.equal(abort.signal.aborted, true);
    assert.equal(context.streetLoadGeneration, 5);
    assert.equal(context.startingStage, false);
    assert.equal(session.get().view, origin.expected);
    assert.equal(session.get().sceneId, origin.sceneId);
  }
});

test('stage compatibility follows route, temporal environment and repository epoch', async () => {
  const value = fixture(), stage = await createOutlineStage(value.options);
  assert(value.suppliedNavigation()); assert.equal(value.counters.navigation, 1);
  assert.equal(stage.compatible(), true);
  value.session.dispatch({ type: 'period', id: 'window-1995' });
  assert.equal(stage.compatible(), true, 'explicitly shared working environment is reusable');
  value.session.dispatch({ type: 'period', id: 'another-period' });
  assert.equal(stage.compatible(), false);
  value.session.dispatch({ type: 'period', id: 'window-2000' });
  value.session.dispatch({ type: 'route', route: { edgeId: 'other-entry', t: .5, direction: 1 } });
  assert.equal(stage.compatible(), false);
  value.repository.epoch++;
  assert.equal(stage.compatible(), false);
  stage.dispose(); stage.dispose();
  assert.equal(value.counters.disposed, 1); assert.equal(value.counters.released, 1);
  const before = value.counters.refreshed;
  value.session.dispatch({ type: 'view', view: 'map' });
  assert.equal(value.counters.refreshed, before, 'disposed stage removed its subscription');
});

test('mount failure releases the one navigation index and preserves the origin', async () => {
  const value = fixture({ loadRuntime: async () => ({ mountOutline: async () => { throw Error('WebGL allocation failed'); } }) });
  await assert.rejects(createOutlineStage(value.options), /allocation/);
  assert.equal(value.counters.released, 1);
  assert.equal(value.session.get().outline, undefined);
});

test('retention has one owner, a fixed warm expiry and safe stale timers', () => {
  let serial = 0;
  const timers = new Map(), history = new Map();
  const counts = { a: 0, b: 0, c: 0, resumes: 0 };
  const slot = createRetainedStageSlot({
    ttlMs: 60_000,
    schedule: (callback, delay) => { assert.equal(delay, 60_000); timers.set(++serial, callback); history.set(serial, callback); return serial; },
    cancel: id => timers.delete(id)
  });
  const a = { dispose: () => counts.a++, resume: () => counts.resumes++ };
  const b = { dispose: () => counts.b++ }, c = { dispose: () => counts.c++ };
  slot.set(a); slot.suspend();
  const first = timers.keys().next().value;
  slot.suspend(); slot.suspend();
  assert.deepEqual([...timers.keys()], [first]);
  assert.equal(slot.resume(), a); assert.equal(counts.resumes, 1); assert.equal(timers.size, 0);
  slot.suspend(); slot.set(b); slot.suspend();
  history.get(first)();
  assert.equal(slot.peek(), b); assert.equal(counts.a, 1); assert.equal(counts.b, 0);
  const expiry = timers.values().next().value; expiry();
  assert.equal(slot.peek(), null); assert.equal(counts.b, 1);
  slot.set(c); slot.resume(() => false);
  assert.equal(counts.c, 1);
  slot.dispose(); slot.dispose();
  assert.equal(counts.c, 1);
});
