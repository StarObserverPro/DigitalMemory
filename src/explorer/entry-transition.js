// Transient screen-space journal art. It never registers a map building or
// writes the street pose: the application session remains the location owner.
import { JOURNAL_ASSETS, JOURNAL_ENTRIES } from './journal-catalog.js';
import { journalLines, journalLayout, createDoodlePainter, drawDoodleAccents } from './journal-drawing.js';
export { JOURNAL_ENTRIES, JOURNAL_ASSETS };
export const JOURNAL_LINES = Object.freeze(JOURNAL_ENTRIES.map(entry => Object.freeze(journalLines(entry))));

// User-requested fictional street-journal decoration; these lines are never
// inserted into the memory catalog or attributed to a named real shop/person.
let handSpritePromise;
function loadHandSprite() {
  if (!handSpritePromise) handSpritePromise = new Promise((resolve, reject) => {
    const sprite = new Image();
    sprite.onload = () => resolve(sprite);
    sprite.onerror = () => { handSpritePromise = null; reject(Error('Entry hand unavailable')); };
    sprite.src = new URL('../../assets/transitions/hand-haring-r1.png', import.meta.url).href;
  });
  return handSpritePromise;
}

const doodlePromises = new Map();
function loadDoodle(asset) {
  if (!doodlePromises.has(asset.file)) doodlePromises.set(asset.file, new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => { doodlePromises.delete(asset.file); reject(Error('Entry doodle unavailable')); };
    image.src = new URL('../../assets/transitions/doodles-r1/' + asset.file, import.meta.url).href;
  }));
  return doodlePromises.get(asset.file);
}

let lastJournal = -1;
export function chooseJournal(random = Math.random, previous = lastJournal) {
  const choices = JOURNAL_LINES.map((_, i) => i).filter(i => i !== previous);
  return choices[Math.min(choices.length - 1, Math.max(0, Math.floor(random() * choices.length)))];
}

const clamp = value => Math.max(0, Math.min(1, value));
const smooth = value => { const t = clamp(value); return t * t * (3 - 2 * t); };
const mix = (a, b, t) => a + (b - a) * t;

// Deliberate beats are measured in time; object pose changes never throttle
// path growth, pen travel, paper opacity or the requestAnimationFrame chain.
export function journalTiming(lines) {
  const drawStart = 650, drawEnd = drawStart + 3200, travelStart = drawEnd + 650;
  const writingStart = travelStart + 1050;
  let cursor = writingStart, count = 0;
  const rows = lines.map((text, index) => {
    const length = [...text].length, start = cursor, end = start + length * 210;
    const row = { start, end, length, offset: count };
    cursor = end + (index < lines.length - 1 ? 650 : 0); count += length;
    return row;
  });
  const writingEnd = cursor, exitEnd = writingEnd + 600;
  return { drawStart, drawEnd, travelStart, writingStart, rows, count, writingEnd, exitEnd, duration: exitEnd + 2100 };
}

export function journalMoment(time, timing) {
  let progress = time >= timing.writingEnd ? 1 : 0, lineTravel = null;
  for (let index = 0; index < timing.rows.length; index++) {
    const row = timing.rows[index], next = timing.rows[index + 1];
    if (time >= row.start && time <= row.end) progress = (row.offset + (time - row.start) / 210) / timing.count;
    if (next && time >= row.end && time < next.start) {
      progress = (row.offset + row.length) / timing.count;
      lineTravel = { from: index, to: index + 1, progress: smooth((time - row.end) / (next.start - row.end)) };
    }
  }
  const beat = time < timing.drawStart ? 'arrival' : time < timing.drawEnd ? 'drawing'
    : time < timing.travelStart ? 'pause' : time < timing.writingStart ? 'travel'
      : time < timing.writingEnd ? lineTravel ? 'line-travel' : 'writing'
        : time < timing.exitEnd ? 'pen-away' : 'reading';
  return { progress, lineTravel, beat };
}

// Small irregular held poses, with a short soft settle between them. Only
// local objects receive this transform; paper/text and path time stay stable.
function objectPose(time, seed) {
  const frame = Math.floor(time / 145), blend = smooth(((time % 145) - 108) / 37);
  const noise = (n, axis) => {
    const value = Math.sin((n + seed * 17 + axis * 31) * 12.9898) * 43758.5453;
    return (value - Math.floor(value)) * 2 - 1;
  };
  return [0, 1, 2].map(axis => mix(noise(frame, axis), noise(frame + 1, axis), blend));
}

/** One abortable frame chain. A late callback cannot draw after cancellation. */
export function animateFrames({ duration, draw, signal, requestFrame = requestAnimationFrame, cancelFrame = cancelAnimationFrame, now = () => performance.now() }) {
  return new Promise((resolve, reject) => {
    let frame = null, settled = false;
    const start = now();
    function finish(result, error) {
      if (settled) return;
      settled = true;
      if (frame !== null) cancelFrame(frame);
      signal?.removeEventListener('abort', abort);
      if (error) reject(error); else resolve(result);
    }
    const abort = () => finish(false);
    function tick(time) {
      if (settled) return;
      frame = null;
      if (signal?.aborted) return finish(false);
      const progress = clamp((time - start) / duration);
      try { draw(progress); } catch (error) { finish(false, error); return; }
      if (settled) return;
      if (progress === 1) finish(true); else frame = requestFrame(tick);
    }
    if (signal?.aborted) { finish(false); return; }
    signal?.addEventListener('abort', abort, { once: true });
    frame = requestFrame(tick);
  });
}

// Source rectangles exclude the neighboring frame's cut forearm. Each pen tip
// is registered separately; pose changes cannot move the drawing contact point.
const HAND_FRAMES = [
  { x: 0, width: 512, tip: [51, 606] },
  { x: 530, width: 490, tip: [23, 606] },
  { x: 1040, width: 480, tip: [26, 607] }
];
const handPoseCache = new WeakMap();
function fadedHandPoses(sprite) {
  if (!handPoseCache.has(sprite)) handPoseCache.set(sprite, HAND_FRAMES.map(pose => {
    const canvas = document.createElement('canvas');
    canvas.width = pose.width; canvas.height = 1024;
    const ink = canvas.getContext('2d');
    ink.drawImage(sprite, pose.x, 0, pose.width, 1024, 0, 0, pose.width, 1024);
    // Mask only the short source wrist. The grip and pencil remain opaque;
    // the entire tail is transparent before the source crop's hard boundary.
    const fade = ink.createLinearGradient(pose.tip[0] + 305, pose.tip[1] - 10, pose.tip[0] + 410, pose.tip[1] + 60);
    fade.addColorStop(0, '#000'); fade.addColorStop(.35, '#000d');
    fade.addColorStop(.72, '#0004'); fade.addColorStop(1, '#0000');
    ink.globalCompositeOperation = 'destination-in';
    ink.fillStyle = fade; ink.fillRect(0, 0, canvas.width, canvas.height);
    return canvas;
  }));
  return handPoseCache.get(sprite);
}
function drawHand(ctx, sprite, x, y, scale, time, lifted = false) {
  if (!sprite) return;
  const index = [0, 1, 2, 1][Math.floor(time / 160) % 4], pose = HAND_FRAMES[index];
  const jitter = objectPose(time, 5), size = scale * (1 + jitter[1] * .003);
  // Pivot at the registered pencil tip so grip wobble cannot break contact.
  ctx.save(); ctx.translate(x, y); ctx.rotate((lifted ? -.06 : 0) + jitter[2] * .014); ctx.scale(size, size);
  ctx.translate(-pose.tip[0], -pose.tip[1]);
  ctx.drawImage(fadedHandPoses(sprite)[index], 0, 0);
  ctx.restore();
}

function drawJournal(ctx, lines, progress, x, y, fontSize) {
  const glyphs = lines.map(text => [...text]), total = glyphs.reduce((sum, text) => sum + text.length, 0);
  let remaining = clamp(progress) * total, tip = [x, y - fontSize * .8 * .2], current = false;
  const angle = -.025;
  ctx.save(); ctx.translate(x, y); ctx.rotate(angle); ctx.fillStyle = '#30322d';
  ctx.textBaseline = 'alphabetic';
  glyphs.forEach((row, rowIndex) => {
    const size = rowIndex === 0 ? fontSize * .8 : fontSize, baseline = rowIndex * fontSize * 1.5;
    ctx.font = `${size}px "Street Journal", cursive`;
    row.forEach((glyph, i) => {
      const left = i * size * 1.03, portion = clamp(remaining);
      if (remaining === 0 && !current) {
        const py = baseline - size * .2;
        tip = [x + left * Math.cos(angle) - py * Math.sin(angle), y + left * Math.sin(angle) + py * Math.cos(angle)];
      }
      if (portion > 0) {
        ctx.save(); ctx.beginPath(); ctx.rect(left - 2, baseline - size * 1.2, (size * 1.03 + 3) * portion, size * 1.5); ctx.clip();
        ctx.fillText(glyph, left, baseline + Math.sin(i * 1.7 + rowIndex) * size * .035); ctx.restore();
        if (!current) {
          const px = left + size * portion, py = baseline - size * (.2 + Math.sin(portion * Math.PI) * .35);
          tip = [x + px * Math.cos(angle) - py * Math.sin(angle), y + px * Math.sin(angle) + py * Math.cos(angle)];
        }
      }
      if (remaining < 1) current = true;
      remaining--;
    });
  });
  ctx.restore(); return tip;
}

function drawCloud(ctx, width, height, cover) {
  if (cover <= 0) return;
  const scale = mix(.18, 2.8, smooth(cover)), unit = Math.max(width, height) * .29;
  ctx.save(); ctx.translate(width * .5, height * .48); ctx.scale(scale, scale);
  ctx.globalAlpha = Math.min(1, cover * 3);
  const puffs = [[-.75, .12, .68], [-.35, -.35, .8], [.25, -.48, .75], [.85, -.12, .61], [.55, .4, .8], [-.15, .5, .88]];
  for (const [x, y, radius] of puffs) {
    const r = radius * unit, gradient = ctx.createRadialGradient(x * unit, y * unit, r * .64, x * unit, y * unit, r);
    gradient.addColorStop(0, '#faf9f4'); gradient.addColorStop(.77, '#faf9f4f5'); gradient.addColorStop(1, '#faf9f400');
    ctx.fillStyle = gradient; ctx.beginPath(); ctx.arc(x * unit, y * unit, r, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

export function createEntryTransition({ container, street, mode = 'journal', signal, onCancel, reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches }) {
  const lifetime = new AbortController(), dialog = document.createElement('dialog');
  dialog.className = 'street-transition'; dialog.setAttribute('aria-label', '进入街景');
  dialog.innerHTML = '<canvas aria-hidden="true"></canvas><p class="transition-announcement" role="status">正在走到街上……</p><button type="button" class="transition-cancel">返回地图 <span aria-hidden="true">↖</span></button>';
  const canvas = dialog.querySelector('canvas'), ctx = canvas.getContext('2d');
  if (!ctx) throw Error('Entry canvas unavailable');
  const opacity = street.style.opacity;
  let disposed = false, controller = null, handSprite = null, doodleSprite = null, width = 0, height = 0, redraw = () => {}, phase = 'preparing', frameIndex = 0, elapsedMs = 0, beat = 'arrival';
  const journal = chooseJournal(); lastJournal = journal;
  const entry = JOURNAL_ENTRIES[journal], asset = JOURNAL_ASSETS[entry.asset];
  const paintDoodle = createDoodlePainter();
  dialog.querySelector('.transition-announcement').textContent = entry.date + '。' + entry.text;
  const lines = JOURNAL_LINES[journal], timing = journalTiming(lines), preludeMs = timing.duration;
  const simple = mode === 'simple';
  container.append(dialog);
  const listen = (target, type, callback) => target.addEventListener(type, callback, { signal: lifetime.signal });
  const cancelRequest = () => onCancel?.();
  listen(dialog, 'cancel', event => { event.preventDefault(); cancelRequest(); });
  listen(dialog.querySelector('button'), 'click', cancelRequest);
  function resize() {
    const rect = dialog.getBoundingClientRect(), dpr = Math.min(2, devicePixelRatio || 1);
    width = rect.width; height = rect.height;
    canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (phase === 'revealing' && !simple && !reducedMotion) sketch(preludeMs);
    redraw();
  }
  function clear() { ctx.clearRect(0, 0, width, height); }
  function sketch(time) {
    clear();
    // One unframed sheet: the map is a faint underlay, not a corner layout grid.
    ctx.fillStyle = `rgba(250,247,237,${.86 * smooth(time / 500)})`; ctx.fillRect(0, 0, width, height);
    const penScale = Math.min(width / 1400, height / 1400, .48);
    const { textX, textY, font, artX, artY, size } = journalLayout(width, height, lines, entry.copies);
    const moment = journalMoment(time, timing);
    beat = moment.beat; dialog.dataset.beat = beat;
    const progress = clamp((time - timing.drawStart) / (timing.drawEnd - timing.drawStart));
    let drawing = { tip: [artX, artY], lifted: false };
    if (doodleSprite) for (let i = 0; i < entry.copies; i++) {
      const local = clamp(progress * entry.copies - i), x = artX + i * size;
      const result = paintDoodle(ctx, doodleSprite, asset, local, x, artY, size, time, Number(entry.id) + i);
      if (i === Math.min(entry.copies - 1, Math.floor(progress * entry.copies))) drawing = result;
      if (time >= timing.drawEnd) drawDoodleAccents(ctx, asset.motion, x, artY, size, time);
    }
    const boxTip = drawing.tip;
    const textTip = drawJournal(ctx, lines, moment.progress, textX, textY, font);
    const textStart = [textX - Math.sin(-.025) * (-font * .8 * .2), textY + Math.cos(-.025) * (-font * .8 * .2)];
    let tip = boxTip, lifted = drawing.lifted;
    if (time < timing.drawStart) {
      const arrival = smooth(time / timing.drawStart);
      tip = [boxTip[0] + (1 - arrival) * 22, boxTip[1] - (1 - arrival) * 30]; lifted = true;
    } else if (time >= timing.travelStart && time < timing.writingStart) {
      const t = smooth((time - timing.travelStart) / (timing.writingStart - timing.travelStart));
      tip = [mix(boxTip[0], textStart[0], t), mix(boxTip[1], textStart[1], t) - Math.sin(t * Math.PI) * height * .09]; lifted = true;
    } else if (time >= timing.writingStart) {
      tip = textTip;
      if (moment.lineTravel) {
        const { from, to, progress: t } = moment.lineTravel, py = to * font * 1.5 - font * .2;
        const size = from === 0 ? font * .8 : font, length = [...lines[from]].length;
        const endX = (length - 1) * size * 1.03 + size, endY = from * font * 1.5 - size * .2;
        const previous = [textX + endX * Math.cos(-.025) - endY * Math.sin(-.025), textY + endX * Math.sin(-.025) + endY * Math.cos(-.025)];
        const next = [textX - py * Math.sin(-.025), textY + py * Math.cos(-.025)];
        tip = [mix(previous[0], next[0], t), mix(previous[1], next[1], t) - Math.sin(t * Math.PI) * font * .7]; lifted = true;
      }
    }
    let alpha = smooth(time / timing.drawStart);
    if (time > timing.writingEnd) {
      const t = smooth((time - timing.writingEnd) / (timing.exitEnd - timing.writingEnd));
      tip = [tip[0] + t * width * .08, tip[1] + t * height * .06]; alpha *= 1 - t; lifted = true;
    }
    ctx.save(); ctx.globalAlpha = alpha; drawHand(ctx, handSprite, ...tip, penScale, time, lifted); ctx.restore();
  }

  function cleanup() {
    if (disposed) return;
    disposed = true; phase = 'finished'; lifetime.abort(); observer.disconnect();
    signal?.removeEventListener('abort', cleanup);
    controller?.setEntryView?.(null); street.style.opacity = opacity;
    dialog.close(); dialog.remove();
  }
  const observer = new ResizeObserver(resize);
  dialog.showModal(); observer.observe(dialog); resize();
  signal?.addEventListener('abort', cleanup, { once: true });
  if (signal?.aborted) cleanup();
  const play = (duration, draw) => animateFrames({ duration, signal: lifetime.signal, draw: progress => {
    redraw = () => draw(progress); redraw();
  } });
  const prepared = (async () => {
    if (simple || reducedMotion || disposed) return !disposed;
    const [sprite, doodle] = await Promise.all([loadHandSprite(), loadDoodle(asset), document.fonts.load('40px "Street Journal"', JOURNAL_LINES[journal].join(''))]);
    if (disposed) return false;
    handSprite = sprite; doodleSprite = doodle;
    phase = 'drawing'; dialog.dataset.mode = 'journal'; dialog.dataset.journal = String(journal); dialog.dataset.fragment = entry.id; dialog.dataset.asset = entry.asset;
    const result = await play(preludeMs, progress => {
      elapsedMs = progress * preludeMs; frameIndex++;
      dialog.dataset.frame = String(frameIndex); sketch(elapsedMs);
    });
    if (result) { phase = 'waiting'; dialog.dataset.phase = phase; }
    return result;
  })();
  // Scene mounting and handwriting run concurrently. Attach a rejection handler
  // now, even when the caller is still awaiting a slow scene load.
  prepared.catch(() => {});
  return {
    prepared,
    cancel: cleanup,
    inspect: () => ({ mode: reducedMotion ? 'reduced' : mode, phase, journal, fragmentId: entry.id, asset: entry.asset, copies: entry.copies, frame: frameIndex, elapsedMs, beat, durationMs: preludeMs, disposed }),
    async reveal(stage) {
      if (disposed || !await prepared) return false;
      controller = stage; phase = 'revealing'; dialog.dataset.phase = phase;
      dialog.dataset.mode = reducedMotion ? 'reduced' : mode;
      controller.setEntryView?.(simple && !reducedMotion ? 0 : 1);
      street.style.opacity = '0';
      const result = await play(reducedMotion ? 180 : simple ? 2300 : 900, progress => {
        if (simple && !reducedMotion) {
          clear();
          street.style.opacity = String(smooth(progress / .12));
          const cover = progress < .5 ? smooth((progress - .12) / .3) : 1 - smooth((progress - .59) / .38);
          drawCloud(ctx, width, height, cover);
          controller.setEntryView?.(smooth((progress - .38) / .56));
        } else {
          if (reducedMotion) { clear(); ctx.fillStyle = '#faf7ed'; ctx.fillRect(0, 0, width, height); }
          street.style.opacity = String(smooth(progress));
          canvas.style.opacity = String(1 - smooth(progress));
        }
      });
      cleanup(); return result;
    }
  };
}
