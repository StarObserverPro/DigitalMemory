import { animateFrames } from './entry-transition.js';
import { TRAVEL_TIMING, travelMoment, drawTravelPlane } from './travel-drawing.js';

// A brief paper-plane passage. The caller owns loading and the
// single session write at full cover; this overlay never stores a street pose.
export function createTravelTransition({ container, label, signal, onCancel }) {
  const lifetime = new AbortController();
  const dialog = document.createElement('dialog');
  dialog.className = 'memory-travel';
  dialog.setAttribute('aria-label', label ? `前往${label}` : '换个地方看看');
  const paper = document.createElement('div'); paper.className = 'travel-paper'; paper.setAttribute('aria-hidden', 'true');
  const canvas = document.createElement('canvas'); canvas.setAttribute('aria-hidden', 'true');
  dialog.append(paper, canvas);
  const title = document.createElement('p');
  title.className = 'travel-name'; title.textContent = label || '换个地方看看';
  title.setAttribute('role', 'status'); dialog.append(title);
  const stay = document.createElement('button');
  stay.className = 'travel-cancel'; stay.textContent = '留在这里'; stay.setAttribute('aria-label', '取消跳转');
  stay.addEventListener('click', () => { onCancel?.(); cancel(); }); dialog.append(stay);
  container.append(dialog);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  dialog.classList.toggle('travel-reduced', reduced);
  let stage = null, disposed = false, phase = 'cover', progress = 0, width = 0, height = 0, dpr = 1;
  const ctx = canvas.getContext('2d');
  function draw(p) {
    if (disposed) return;
    progress = p;
    const moment = travelMoment(phase, p, reduced);
    dialog.style.opacity = String(moment.opacity);
    paper.style.clipPath = moment.paper;
    title.style.opacity = String(moment.title);
    if (ctx) drawTravelPlane(ctx, width, height, moment.plane);
  }
  const observer = new ResizeObserver(() => {
    if (disposed) return;
    width = dialog.clientWidth; height = dialog.clientHeight; dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
    ctx?.setTransform(dpr, 0, 0, dpr, 0, 0); draw(progress);
  });
  function cancel() {
    if (disposed) return;
    disposed = true; lifetime.abort(); observer.disconnect(); signal?.removeEventListener('abort', cancel);
    stage?.setEntryView(null);
    dialog.close(); dialog.remove();
  }
  dialog.addEventListener('cancel', event => { event.preventDefault(); onCancel?.(); cancel(); });
  signal?.addEventListener('abort', cancel, { once: true });
  if (signal?.aborted) cancel(); else { dialog.showModal(); observer.observe(dialog); draw(0); }
  const animate = (duration, draw) => animateFrames({ duration, draw, signal: lifetime.signal });
  const prepared = disposed ? Promise.resolve(false) : animate(reduced ? 90 : TRAVEL_TIMING.cover, draw)
    .then(result => { if (result) { phase = 'covered'; draw(1); } return result; });
  return {
    prepared, cancel,
    async reveal(controller) {
      if (disposed || !await prepared || disposed) return false;
      stage = controller; stage.setEntryView(1);
      // Give the existing renderer time to submit the new camera/chunks under
      // opaque paper. There is no camera flight through intervening streets.
      if (!await animate(reduced ? 1 : TRAVEL_TIMING.hold, () => {})) return false;
      phase = 'reveal'; draw(0);
      const result = await animate(reduced ? 90 : TRAVEL_TIMING.reveal, draw);
      cancel(); return result;
    },
    inspect: () => ({ kind: 'travel', presentation: 'paper-plane', phase, progress, label: label || null, reduced })
  };
}
