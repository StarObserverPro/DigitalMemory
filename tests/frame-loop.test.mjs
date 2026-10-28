import test from 'node:test';
import assert from 'node:assert/strict';
import { createFrameLoop } from '../src/engine/frame-loop.js';

function scheduler() {
  let serial = 0;
  const pending = new Map(), history = new Map();
  return {
    pending, history,
    request(callback) { const id = ++serial; pending.set(id, callback); history.set(id, callback); return id; },
    cancel(id) { pending.delete(id); },
    step(time) {
      assert.equal(pending.size, 1);
      const [id, callback] = pending.entries().next().value;
      pending.delete(id);
      callback(time);
      return id;
    }
  };
}

test('pause cancels the sole scheduled frame; resume excludes paused time', () => {
  const clock = scheduler(), seen = [];
  let resumed = 0;
  const loop = createFrameLoop((now, dt) => seen.push([now, dt]), { scheduler: clock, onResume: () => resumed++ });
  assert.equal(clock.pending.size, 0);
  loop.setPaused(false); loop.setPaused(false);
  clock.step(100); clock.step(116);
  assert.deepEqual(seen, [[100, 0], [116, .016]]);
  loop.setPaused(true); loop.setPaused(true);
  assert.equal(clock.pending.size, 0);
  loop.setPaused(false); clock.step(10_000);
  assert.deepEqual(seen.at(-1), [10_000, 0]);
  assert.equal(resumed, 2);
  loop.dispose(); loop.dispose(); loop.setPaused(false);
  assert.equal(clock.pending.size, 0);
  assert.equal(loop.isDisposed(), true);
});

test('a late cancelled callback cannot erase or extend a resumed frame chain', () => {
  const clock = scheduler(); let frames = 0;
  const loop = createFrameLoop(() => frames++, { scheduler: clock });
  loop.setPaused(false);
  const old = clock.pending.values().next().value;
  loop.setPaused(true); loop.setPaused(false);
  const current = clock.pending.keys().next().value;
  old(500);
  assert.equal(frames, 0);
  assert.deepEqual([...clock.pending.keys()], [current]);
  clock.step(700);
  assert.equal(frames, 1);
  loop.dispose();
  for (const callback of clock.history.values()) callback(900);
  assert.equal(frames, 1);
  assert.equal(clock.pending.size, 0);
});

test('callbacks may refresh or pause their owner without creating a second loop', () => {
  const clock = scheduler(); let calls = 0, loop;
  loop = createFrameLoop(() => {
    calls++;
    loop.setPaused(false); loop.setPaused(false);
    if (calls === 2) loop.setPaused(true);
  }, { scheduler: clock });
  loop.setPaused(false); clock.step(0);
  assert.equal(clock.pending.size, 1);
  clock.step(16);
  assert.equal(clock.pending.size, 0);
  assert.equal(loop.isPaused(), true);
});

test('a failing frame stops scheduling and disposal remains safe', () => {
  const clock = scheduler();
  const loop = createFrameLoop(() => { throw Error('render failed'); }, { scheduler: clock });
  loop.setPaused(false);
  assert.throws(() => clock.step(0), /render failed/);
  assert.equal(clock.pending.size, 0);
  loop.dispose();
});
