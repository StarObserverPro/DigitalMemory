import test from 'node:test';
import assert from 'node:assert/strict';
import { animateFrames, chooseJournal, JOURNAL_LINES, journalTiming, journalMoment, JOURNAL_ENTRIES, JOURNAL_ASSETS } from '../src/explorer/entry-transition.js';
import { journalLayout, doodleMoment } from '../src/explorer/journal-drawing.js';
import { existsSync } from 'node:fs';
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

test('all 38 paired journal variants remain reachable without consecutive repeats', () => {
  assert.equal(JOURNAL_LINES.length, 38);
  for (let previous = -1; previous < 38; previous++) {
    const seen = new Set(Array.from({ length: 76 }, (_, n) => chooseJournal(() => n / 76, previous)));
    assert.equal(seen.size, previous === -1 ? 38 : 37);
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


test('journal allows time to read and continues writing smoothly between object pose changes', () => {
  for (const lines of JOURNAL_LINES) {
    const timing = journalTiming(lines);
    assert(timing.duration + 900 >= 10000 && timing.duration + 900 <= 18500);
    assert.equal(journalMoment(timing.drawEnd + 100, timing).beat, 'pause');
    assert.equal(journalMoment(timing.exitEnd + 1000, timing).beat, 'reading');
    const row = timing.rows[1];
    const a = journalMoment(row.start + 151, timing), b = journalMoment(row.start + 167, timing);
    assert(b.progress > a.progress && b.progress - a.progress < .01, 'writing advances within a pose interval');
    for (let i = 0; i < timing.rows.length - 1; i++) {
      const end = timing.rows[i].end, next = timing.rows[i + 1].start;
      assert.equal(journalMoment(end + 1, timing).progress, journalMoment(next - 1, timing).progress, 'ink holds during a lifted line change');
      assert.equal(journalMoment(end, timing).lineTravel.progress, 0, 'line lift begins at the previous endpoint');
      assert(journalMoment(end + 1, timing).lineTravel.progress < .001);
      assert(journalMoment(next - 1, timing).lineTravel.progress > .999);
      assert.equal(journalMoment(next, timing).progress, journalMoment(end, timing).progress);
    }
    assert.equal(journalMoment(timing.duration, timing).progress, 1);
  }
});


test('reviewed copy retains source numbers, paired files and the two-bus observation', () => {
  assert.equal(new Set(JOURNAL_ENTRIES.map(e => e.id)).size, 38);
  assert.equal(Object.keys(JOURNAL_ASSETS).length, 30);
  const byId = Object.fromEntries(JOURNAL_ENTRIES.map(e => [e.id, e]));
  assert.equal(byId['17'].text, '我都走到看丹桥了，哎呀，没拿伞。');
  assert.equal(byId['19'].text, '下雪挺好看，就是没积住。鞋都湿了。');
  assert.equal(byId['22'].text, '等半天没来，一来来两辆。');
  assert.equal(byId['22'].copies, 2); assert.equal(byId['22'].asset, 'bus');
  assert.equal(byId['42'].text, '橡皮粘尺子上了。');
  assert.equal(byId['47'].asset, 'yogurt');
  for (const id of ['15','16','25','27','28','29','36','37','38','39','45','46']) assert(!byId[id]);
  for (const entry of JOURNAL_ENTRIES) {
    const asset = JOURNAL_ASSETS[entry.asset]; assert(asset);
    assert(existsSync(new URL('../assets/transitions/doodles-r1/' + asset.file, import.meta.url)));
  }
  for (const asset of Object.values(JOURNAL_ASSETS)) {
    assert(asset.paths.length > 0);
    for (const progress of [0,.1,.5,.85,1]) {
      const moment = doodleMoment(asset, progress);
      assert(moment.tip.every(Number.isFinite));
    }
  }
});

test('every fragment and its complete one/two-object group fit phone and desktop pages', () => {
  for (const [width,height] of [[320,568],[390,844],[430,844],[646,528],[1280,800]]) {
    for (let i=0; i<JOURNAL_ENTRIES.length; i++) {
      const entry=JOURNAL_ENTRIES[i], lines=JOURNAL_LINES[i];
      assert.equal(lines.slice(1).join(''),entry.text, 'wrapping preserves exact copy');
      const l=journalLayout(width,height,lines,entry.copies);
      assert(l.artX>=width*.13-1 && l.artX+l.groupWidth<=width*.87+1, entry.id);
      assert(l.artY+l.size<=height-89, entry.id);
      assert(l.font>=17, entry.id+' remains readable');
      for (const row of lines.slice(1)) assert([...row].length*l.font*1.03<=width*.74+1,entry.id);
    }
  }
});
