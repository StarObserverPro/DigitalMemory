// Transient screen-space journal art. It never registers a map building or
// writes the street pose: the application session remains the location owner.
export const JOURNAL_LINES = Object.freeze([
  ['十二日', '早点铺的油饼刚出锅，', '接过纸袋时还烫手。'],
  ['十七日', '路上看见一只花猫，', '窝在自行车筐里。'],
  ['二十一日', '修车摊的螺丝，', '都装在一个旧茶缸里。'],
  ['二十四日', '买了两个烧饼，', '走到街口就吃掉一个。'],
  ['二十七日', '刚下过雨。卖菜的人', '正往筐上盖塑料布。']
].map(Object.freeze));

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

let lastJournal = -1;
export function chooseJournal(random = Math.random, previous = lastJournal) {
  const choices = JOURNAL_LINES.map((_, i) => i).filter(i => i !== previous);
  return choices[Math.min(choices.length - 1, Math.max(0, Math.floor(random() * choices.length)))];
}

const clamp = value => Math.max(0, Math.min(1, value));
const smooth = value => { const t = clamp(value); return t * t * (3 - 2 * t); };
const mix = (a, b, t) => a + (b - a) * t;

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

// One continuous rounded silhouette and two curved face seams. Sampling the
// authored curves once lets the pencil follow the exact ink path as it grows.
function curvePoints(start, segments) {
  const points = [start];
  for (const [cx1, cy1, cx2, cy2, x, y] of segments) {
    const [sx, sy] = points.at(-1);
    for (let step = 1; step <= 12; step++) {
      const t = step / 12, u = 1 - t;
      points.push([u ** 3 * sx + 3 * u * u * t * cx1 + 3 * u * t * t * cx2 + t ** 3 * x,
        u ** 3 * sy + 3 * u * u * t * cy1 + 3 * u * t * t * cy2 + t ** 3 * y]);
    }
  }
  return points;
}
const BOX_STROKES = [
  curvePoints([24, 42], [
    [42, 29, 65, 13, 77, 7], [83, 3, 89, 3, 101, 7],
    [130, 16, 181, 31, 204, 40], [214, 44, 218, 49, 218, 60],
    [218, 84, 217, 130, 216, 148], [216, 157, 213, 162, 204, 169],
    [185, 183, 160, 201, 143, 211], [137, 215, 131, 216, 123, 212],
    [92, 202, 34, 182, 13, 174], [4, 171, 0, 164, 0, 154],
    [0, 125, 1, 83, 1, 65], [1, 55, 8, 50, 24, 42]
  ]),
  curvePoints([4, 55], [[30, 64, 82, 86, 118, 96], [127, 100, 134, 100, 144, 95], [164, 82, 196, 60, 215, 50]]),
  curvePoints([132, 99], [[131, 126, 133, 184, 133, 213]])
];
const strokeLength = points => points.slice(1).reduce((sum, p, i) => sum + Math.hypot(p[0] - points[i][0], p[1] - points[i][1]), 0);
const BOX_LENGTH = BOX_STROKES.reduce((sum, points) => sum + strokeLength(points), 0);

function line(ctx, points, length = Infinity) {
  ctx.beginPath(); ctx.moveTo(...points[0]);
  let tip = points[0];
  for (let i = 1; i < points.length && length > 0; i++) {
    const a = points[i - 1], b = points[i], distance = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const t = Math.min(1, length / distance);
    tip = [mix(a[0], b[0], t), mix(a[1], b[1], t)];
    ctx.lineTo(...tip); length -= distance;
  }
  ctx.stroke(); return tip;
}

function drawBox(ctx, progress, x, y, scale) {
  ctx.save(); ctx.translate(x, y); ctx.scale(scale, scale);
  ctx.lineWidth = 7.2; ctx.strokeStyle = '#11120f'; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  if (progress > .82) {
    ctx.save(); ctx.globalAlpha = smooth((progress - .82) / .18) * .8;
    ctx.fillStyle = '#fffbee'; ctx.beginPath(); ctx.moveTo(...BOX_STROKES[0][0]);
    for (const point of BOX_STROKES[0].slice(1)) ctx.lineTo(...point);
    ctx.closePath(); ctx.fill(); ctx.restore();
  }
  let remaining = BOX_LENGTH * clamp(progress), tip = BOX_STROKES[0][0];
  for (const points of BOX_STROKES) {
    if (remaining <= 0) break;
    tip = line(ctx, points, remaining); remaining -= strokeLength(points);
  }
  ctx.restore(); return [x + tip[0] * scale, y + tip[1] * scale];
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
function drawHand(ctx, sprite, x, y, scale, frame, lifted = false) {
  if (!sprite) return;
  const index = [0, 1, 2, 1][frame % 4], pose = HAND_FRAMES[index];
  ctx.save(); ctx.translate(x, y); ctx.rotate(lifted ? -.06 : 0); ctx.scale(scale, scale);
  ctx.translate(-pose.tip[0], -pose.tip[1]);
  ctx.drawImage(fadedHandPoses(sprite)[index], 0, 0);
  ctx.restore();
}

function drawJournal(ctx, lines, progress, x, y, fontSize) {
  const glyphs = lines.map(text => [...text]), total = glyphs.reduce((sum, text) => sum + text.length, 0);
  let remaining = clamp(progress) * total, tip = [x, y], current = false;
  const angle = -.025;
  ctx.save(); ctx.translate(x, y); ctx.rotate(angle); ctx.fillStyle = '#30322d';
  ctx.textBaseline = 'alphabetic';
  glyphs.forEach((row, rowIndex) => {
    const size = rowIndex === 0 ? fontSize * .8 : fontSize, baseline = rowIndex * fontSize * 1.5;
    ctx.font = `${size}px "Street Journal", cursive`;
    row.forEach((glyph, i) => {
      const left = i * size * 1.03, portion = clamp(remaining);
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
  let disposed = false, controller = null, handSprite = null, width = 0, height = 0, redraw = () => {}, phase = 'preparing', frameIndex = -1;
  const journal = chooseJournal(); lastJournal = journal;
  const writingMs = JOURNAL_LINES[journal].reduce((count, row) => count + [...row].length, 0) * 105;
  const writingEnd = 1700 + writingMs, preludeMs = Math.ceil((writingEnd + 350) / 125) * 125;
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
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); frameIndex = -1;
    if (phase === 'revealing' && !simple && !reducedMotion) sketch(preludeMs);
    redraw();
  }
  function clear() { ctx.clearRect(0, 0, width, height); }
  function sketch(time) {
    clear();
    // One unframed sheet: the map is a faint underlay, not a corner layout grid.
    ctx.fillStyle = 'rgba(250,247,237,.86)'; ctx.fillRect(0, 0, width, height);
    const mobile = width < 600, boxScale = Math.min(mobile ? width * .00165 : width * .00105, height * .00135, 1.22);
    const penScale = Math.min(width / 1400, height / 1400, .48);
    const font = Math.min(mobile ? width * .066 : width * .032, height * .052, 40);
    const textX = width * .13, textY = height * (mobile ? .25 : .27);
    // Preserve the accepted writing anchor and block size. The illustration
    // belongs below the text on the same page, inset from its right margin.
    const pageRight = Math.min(width * .84, textX + font * 15);
    const boxX = pageRight - 218 * boxScale, boxY = textY + font * 4.8;
    const drawProgress = clamp(time / 1250), textProgress = clamp((time - 1700) / writingMs);
    const boxTip = drawBox(ctx, drawProgress, boxX, boxY, boxScale);
    const textTip = drawJournal(ctx, JOURNAL_LINES[journal], textProgress, textX, textY, font);
    let tip = boxTip, lifted = false;
    if (time > 1250 && time < 1700) {
      const t = smooth((time - 1250) / 450);
      tip = [mix(boxTip[0], textX, t), mix(boxTip[1], textY - font * .35, t) - Math.sin(t * Math.PI) * height * .12]; lifted = true;
    } else if (time >= 1700) tip = textTip;
    if (time > writingEnd) {
      const t = clamp((time - writingEnd) / 300);
      tip = [tip[0] + t * width * .18, tip[1] + t * height * .12];
      ctx.save(); ctx.globalAlpha = 1 - t; drawHand(ctx, handSprite, ...tip, penScale, Math.floor(time / 125), true); ctx.restore();
    } else drawHand(ctx, handSprite, ...tip, penScale, Math.floor(time / 125), lifted);
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
    const [sprite] = await Promise.all([loadHandSprite(), document.fonts.load('40px "Street Journal"', JOURNAL_LINES[journal].join(''))]);
    if (disposed) return false;
    handSprite = sprite;
    phase = 'drawing'; dialog.dataset.mode = 'journal'; dialog.dataset.journal = String(journal);
    const result = await play(preludeMs, progress => {
      const index = Math.floor(progress * preludeMs / 125);
      if (index === frameIndex && canvas.width) return;
      frameIndex = index; dialog.dataset.frame = String(index); sketch(index * 125);
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
    inspect: () => ({ mode: reducedMotion ? 'reduced' : mode, phase, journal, frame: frameIndex, disposed }),
    async reveal(stage) {
      if (disposed || !await prepared) return false;
      controller = stage; phase = 'revealing'; dialog.dataset.phase = phase;
      dialog.dataset.mode = reducedMotion ? 'reduced' : mode;
      controller.setEntryView?.(simple && !reducedMotion ? 0 : 1);
      street.style.opacity = '0';
      const result = await play(reducedMotion ? 180 : simple ? 2300 : 650, progress => {
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
