// Image-derived ink paths and page composition for transient journal art.
export function journalLines(entry) {
  const rows = [], glyphs = [...entry.text];
  while (glyphs.length) {
    let cut = Math.min(12, glyphs.length);
    if (glyphs.length > cut) {
      const punctuation = glyphs.slice(0, cut).findLastIndex(glyph => '，。？！'.includes(glyph));
      if (punctuation >= 5) cut = punctuation + 1;
      else if ('，。？！、…'.includes(glyphs[cut])) cut--;
    }
    const row = glyphs.splice(0, cut);
    rows.push(row.join(''));
  }
  return [entry.date, ...rows];
}

export function journalLayout(width, height, lines, copies = 1) {
  const mobile = width < 600, left = width * .13, pageWidth = width * .71;
  const columns = Math.max(...lines.slice(1).map(row => [...row].length), 1);
  const font = Math.min(mobile ? width * .066 : width * .032, height * .052, 40, pageWidth / (columns * 1.03 + .2));
  const right = Math.min(width * .84, left + font * 15);
  const textY = height * (mobile ? .25 : .27);
  const artY = textY + font * ((lines.length - 1) * 1.5 + .9);
  const size = Math.max(12, Math.min((right - left) / copies, height - artY - 90, 266));
  const groupWidth = size * copies;
  return { textX: left, textY, font, artX: right - groupWidth, artY, size, groupWidth };
}

const distance = (a, b) => Math.hypot(b[0] - a[0], b[1] - a[1]);
const metrics = new WeakMap();
function drawingMetrics(asset) {
  if (!metrics.has(asset)) {
    const lengths = asset.paths.map(path => path.slice(1).reduce((sum, point, i) => sum + distance(path[i], point), 0));
    metrics.set(asset, { lengths, total: lengths.reduce((a, b) => a + b, 0) });
  }
  return metrics.get(asset);
}
const clamp = value => Math.max(0, Math.min(1, value));
const mix = (a, b, t) => a + (b - a) * t;

export function doodleMoment(asset, progress) {
  const { lengths, total } = drawingMetrics(asset);
  const gap = asset.paths.length > 1 ? .15 / (asset.paths.length - 1) : 0;
  let cursor = 0;
  const segments = [];
  for (let i = 0; i < asset.paths.length; i++) {
    const path = asset.paths[i], duration = .85 * lengths[i] / total;
    const fraction = clamp((progress - cursor) / duration);
    segments.push({ path, length: lengths[i] * fraction });
    if (progress < cursor + duration) {
      let remaining = lengths[i] * fraction;
      for (let n = 1; n < path.length; n++) {
        const length = distance(path[n - 1], path[n]);
        if (remaining <= length) {
          const t = length ? remaining / length : 0;
          return { segments, tip: [mix(path[n - 1][0], path[n][0], t), mix(path[n - 1][1], path[n][1], t)], lifted: false };
        }
        remaining -= length;
      }
    }
    cursor += duration;
    const next = asset.paths[i + 1];
    if (next && progress < cursor + gap) {
      const t = clamp((progress - cursor) / gap), end = path.at(-1);
      return { segments, tip: [mix(end[0], next[0][0], t), mix(end[1], next[0][1], t) - Math.sin(t * Math.PI) * 12], lifted: true };
    }
    cursor += next ? gap : 0;
  }
  return { segments, tip: asset.paths.at(-1)?.at(-1) || [256, 256], lifted: false };
}

function maskStroke(ctx, points, length) {
  ctx.beginPath(); ctx.moveTo(...points[0]);
  for (let i = 1; i < points.length && length > 0; i++) {
    const a = points[i - 1], b = points[i], d = distance(a, b), t = d ? Math.min(1, length / d) : 1;
    ctx.lineTo(mix(a[0], b[0], t), mix(a[1], b[1], t)); length -= d;
  }
  ctx.stroke();
}

export function createDoodlePainter() {
  const layer = document.createElement('canvas'); layer.width = layer.height = 512;
  const ink = layer.getContext('2d');
  const mask = document.createElement('canvas'); mask.width = mask.height = 512;
  const maskInk = mask.getContext('2d');
  return function paint(ctx, sprite, asset, progress, x, y, size, time, seed) {
    const moment = doodleMoment(asset, clamp(progress));
    ink.clearRect(0, 0, 512, 512);
    // Reveal the actual delivered pixels along their derived ink paths.
    ink.globalCompositeOperation = 'source-over'; ink.drawImage(sprite, 0, 0, 512, 512);
    ink.globalCompositeOperation = 'destination-in';
    ink.save(); ink.beginPath(); ink.rect(0, 0, 512, 512); ink.clip();
    maskInk.clearRect(0, 0, 512, 512);
    maskInk.strokeStyle = '#000'; maskInk.lineWidth = 24; maskInk.lineCap = maskInk.lineJoin = 'round';
    if (progress > 0) for (const segment of moment.segments) if (segment.length > 0) maskStroke(maskInk, segment.path, segment.length);
    ink.drawImage(mask, 0, 0); ink.restore(); ink.globalCompositeOperation = 'source-over';
    const jitter = Math.sin(Math.floor(time / 145) * 3.17 + seed);
    const angle = jitter * .005, dx = jitter * 1.1, dy = Math.cos(Math.floor(time / 145) * 2.3 + seed) * .8;
    ctx.save(); ctx.translate(x + size / 2 + dx, y + size / 2 + dy); ctx.rotate(angle);
    ctx.drawImage(layer, -size / 2, -size / 2, size, size);
    // One brief wash completes the quiet colors after the ink.
    if (progress > .84) {
      ctx.save(); ctx.globalAlpha = clamp((progress - .84) / .16);
      ctx.drawImage(sprite, -size / 2, -size / 2, size, size); ctx.restore();
    }
    ctx.restore();
    const px = (moment.tip[0] / 512 - .5) * size, py = (moment.tip[1] / 512 - .5) * size;
    return { tip: [x + size / 2 + dx + px * Math.cos(angle) - py * Math.sin(angle), y + size / 2 + dy + px * Math.sin(angle) + py * Math.cos(angle)], lifted: moment.lifted };
  };
}

export function drawDoodleAccents(ctx, motion, x, y, size, time) {
  const wave = Math.sin(time / 650), u = size / 512;
  ctx.save(); ctx.translate(x, y); ctx.scale(u, u);
  ctx.strokeStyle = '#24251f'; ctx.globalAlpha = .55 + wave * .15;
  ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  if (motion === 'steam-curves' || motion === 'heat-dashes') {
    for (const px of [220, 270]) { ctx.beginPath(); ctx.moveTo(px, 45); ctx.bezierCurveTo(px - 16, 32 + wave * 5, px + 15, 20, px, 6 + wave * 5); ctx.stroke(); }
  } else if (motion === 'wind-curves' || motion === 'sleep-curves') {
    for (const py of [165, 205]) { ctx.beginPath(); ctx.moveTo(12, py); ctx.quadraticCurveTo(42 + wave * 7, py + 20, 70, py - 3); ctx.stroke(); }
  } else if (['speed-dashes', 'bark-dashes', 'chirp-dashes'].includes(motion)) {
    for (const py of [190, 225]) { ctx.beginPath(); ctx.moveTo(455 + wave * 6, py); ctx.lineTo(480 + wave * 6, py - 8); ctx.stroke(); }
  } else if (motion === 'rain-dashes' || motion === 'drip') {
    ctx.beginPath(); ctx.moveTo(440, 350 + wave * 12); ctx.lineTo(434, 365 + wave * 12); ctx.stroke();
  }
  ctx.restore();
}
