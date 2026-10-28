/** The frame owner schedules at most one callback and forgets paused wall time. */
export function createFrameLoop(frame, {
  scheduler = {
    request: callback => globalThis.requestAnimationFrame(callback),
    cancel: id => globalThis.cancelAnimationFrame(id)
  },
  maxDelta = .045,
  onResume = () => {},
  onPause = () => {}
} = {}) {
  let paused = true, disposed = false, frameId = null, generation = 0;
  let previousTime = null, frames = 0, lastDelta = 0;

  function schedule() {
    if (paused || disposed || frameId !== null) return;
    const token = generation;
    frameId = scheduler.request(now => {
      // A cancelled callback can already be queued by its host. It must not
      // clear the new chain's handle or restart a suspended scene.
      if (token !== generation || paused || disposed) return;
      frameId = null;
      lastDelta = previousTime === null ? 0 : Math.max(0, Math.min(maxDelta, (now - previousTime) / 1000));
      previousTime = now;
      frames++;
      try { frame(now, lastDelta); }
      catch (error) { setPaused(true); throw error; }
      schedule();
    });
  }

  function setPaused(next) {
    if (disposed) return false;
    next = Boolean(next);
    if (next === paused) { if (!next) schedule(); return false; }
    paused = next;
    previousTime = null;
    generation++;
    if (frameId !== null) { scheduler.cancel(frameId); frameId = null; }
    if (paused) onPause();
    else {
      try { onResume(); }
      catch (error) { paused = true; throw error; }
      schedule();
    }
    return true;
  }

  function dispose() {
    if (disposed) return;
    disposed = true;
    paused = true;
    generation++;
    previousTime = null;
    if (frameId !== null) { scheduler.cancel(frameId); frameId = null; }
    onPause();
  }

  return {
    setPaused, dispose,
    isPaused: () => paused,
    isDisposed: () => disposed,
    hasScheduledFrame: () => frameId !== null,
    inspect: () => ({ frames, paused, disposed, scheduled: frameId !== null, lastDelta })
  };
}
