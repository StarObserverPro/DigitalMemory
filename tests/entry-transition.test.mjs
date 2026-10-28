import test from 'node:test';
import assert from 'node:assert/strict';
import { animateFrames, chooseJournal, JOURNAL_LINES } from '../src/explorer/entry-transition.js';
import { createSession } from '../src/application/session.js';
import { restoreSession, saveSession } from '../src/adapters/session-storage.js';

function clock() {
  let serial = 0;
  const pending = new Map(), history = new Map();
  return {
    pending, history,
    requestFrame(callback) { pending.set(++serial, callback); history.set(serial, callback); return serial; },
    cancelFrame(id) { pending.delete(id); },
    now: () => 0,
    tick(time) { const callbacks = [...pending.values()]; pending.clear(); for (const callback of callbacks) callback(time); }
  };
}

test('cancelling an entry stops its frame chain and rejects queued late draws', async () => {
  const scheduler = clock(), abort = new AbortController(), frames = [];
  const done = animateFrames({ ...scheduler, duration: 100, signal: abort.signal, draw: p => frames.push(p) });
  scheduler.tick(25);
  assert.deepEqual(frames, [.25]); assert.equal(scheduler.pending.size, 1);
  const late = [...scheduler.pending.values()][0];
  abort.abort();
  assert.equal(await done, false); assert.equal(scheduler.pending.size, 0);
  late(1000); assert.deepEqual(frames, [.25]);
});

test('entry settles once at the final frame and never queues a second chain', async () => {
  const scheduler = clock(), frames = [], abort = new AbortController();
  const done = animateFrames({ ...scheduler, duration: 100, signal: abort.signal, draw: p => frames.push(p) });
  scheduler.tick(30); scheduler.tick(150);
  assert.equal(await done, true); assert.deepEqual(frames, [.3, 1]); assert.equal(scheduler.pending.size, 0);
  abort.abort(); scheduler.tick(300); assert.deepEqual(frames, [.3, 1]);
});

test('already-cancelled and draw-cancelled entries cannot schedule work', async () => {
  const scheduler = clock(), abort = new AbortController(); abort.abort();
  assert.equal(await animateFrames({ ...scheduler, duration: 100, signal: abort.signal, draw: () => assert.fail('stale draw') }), false);
  assert.equal(scheduler.pending.size, 0);
  const current = new AbortController();
  const done = animateFrames({ ...scheduler, duration: 100, signal: current.signal, draw: () => current.abort() });
  scheduler.tick(10); assert.equal(await done, false); assert.equal(scheduler.pending.size, 0);
});

test('five journal variants remain reachable without consecutive repeats', () => {
  assert.equal(JOURNAL_LINES.length, 5);
  for (let previous = -1; previous < 5; previous++) {
    const seen = new Set(Array.from({ length: 20 }, (_, n) => chooseJournal(() => n / 20, previous)));
    assert.equal(seen.size, previous === -1 ? 5 : 4);
    assert(!seen.has(previous));
  }
});

test('transition preference persists without changing the map or route, including nested returns', () => {
  const session = createSession(), origin = session.get();
  assert.equal(origin.entryTransition, 'journal');
  session.dispatch({ type: 'enter', sceneId: 'fixture' });
  session.dispatch({ type: 'entry-transition', mode: 'simple' });
  session.dispatch({ type: 'back' });
  assert.equal(session.get().entryTransition, 'simple');
  assert.deepEqual(session.get().route, origin.route); assert.deepEqual(session.get().camera, origin.camera);
  session.dispatch({ type: 'entry-transition', mode: 'unknown' });
  assert.equal(session.get().entryTransition, 'simple');
  let saved;
  const storage = { setItem: (_, value) => saved = value, getItem: () => saved };
  const manifest = { periods: [{ id: origin.periodId }], assets: [{ id: origin.styleId }], placeIds: [] };
  saveSession(storage, session.get());
  assert.equal(restoreSession(storage, manifest).entryTransition, 'simple');
  saved = JSON.stringify({ ...session.get(), entryTransition: 'invalid' });
  assert.equal(restoreSession(storage, manifest).entryTransition, 'journal');
  assert.equal(createSession({ entryTransition: {} }).get().entryTransition, 'journal');
});
