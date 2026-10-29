import { animateFrames } from './entry-transition.js';

// A short paper dissolve for relocation. The caller owns loading and the
// single session write at full cover; this overlay never stores a street pose.
export function createTravelTransition({ container, label, signal, onCancel }) {
  const lifetime = new AbortController();
  const dialog = document.createElement('dialog');
  dialog.className = 'memory-travel';
  dialog.setAttribute('aria-label', label ? `前往${label}` : '换个地方看看');
  const title = document.createElement('p');
  title.className = 'travel-name'; title.textContent = label || '换个地方看看';
  title.setAttribute('role', 'status'); dialog.append(title);
  const stay = document.createElement('button');
  stay.className = 'travel-cancel'; stay.textContent = '留在这里'; stay.setAttribute('aria-label', '取消跳转');
  stay.addEventListener('click', () => { onCancel?.(); cancel(); }); dialog.append(stay);
  container.append(dialog);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let stage = null, disposed = false, phase = 'cover';
  function cancel() {
    if (disposed) return;
    disposed = true; lifetime.abort(); signal?.removeEventListener('abort', cancel);
    stage?.setEntryView(null);
    dialog.close(); dialog.remove();
  }
  dialog.addEventListener('cancel', event => { event.preventDefault(); onCancel?.(); cancel(); });
  signal?.addEventListener('abort', cancel, { once: true });
  if (signal?.aborted) cancel(); else dialog.showModal();
  const animate = (duration, draw) => animateFrames({ duration, draw, signal: lifetime.signal });
  const prepared = disposed ? Promise.resolve(false) : animate(reduced ? 90 : 260, progress => {
    dialog.style.opacity = String(progress);
  }).then(result => { if (result) phase = 'covered'; return result; });
  return {
    prepared, cancel,
    async reveal(controller) {
      if (disposed || !await prepared) return false;
      stage = controller; stage.setEntryView(1);
      // Give the existing renderer time to submit the new camera/chunks under
      // opaque paper. There is no camera flight through intervening streets.
      if (!await animate(reduced ? 1 : 140, () => {})) return false;
      phase = 'reveal';
      const result = await animate(reduced ? 90 : 420, progress => { dialog.style.opacity = String(1 - progress); });
      cancel(); return result;
    },
    inspect: () => ({ kind: 'travel', phase, label: label || null, reduced })
  };
}
