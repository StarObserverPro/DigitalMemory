// Screen-space paper/ink only. No geographic coordinates or camera authority.
const clamp = x => Math.max(0, Math.min(1, x));
const smooth = x => { const t = clamp(x); return t * t * (3 - 2 * t); };

export const TRAVEL_TIMING = Object.freeze({ cover: 650, hold: 160, reveal: 760 });

export function travelMoment(phase, progress, reduced = false) {
  const p = clamp(progress), t = smooth(p);
  if (reduced) return {
    opacity: phase === 'cover' ? t : phase === 'reveal' ? 1 - t : 1,
    paper: 'none', title: 1, plane: null
  };
  const revealing = phase === 'reveal';
  const edge = revealing ? -42 + 168 * t : -64 + 168 * t;
  return {
    opacity: 1,
    paper: phase === 'covered' ? 'none' : revealing
      ? `polygon(${edge}% 0, 100% 0, 100% 100%, ${edge + 40}% 100%)`
      : `polygon(0 0, ${edge}% 0, ${edge + 40}% 100%, 0 100%)`,
    title: phase === 'covered' ? 1 : revealing ? 1 - smooth(p / .42) : smooth((p - .64) / .36),
    plane: revealing
      ? { x: .62 + .52 * t, y: .36 - .16 * t, scale: 1.65 - 1.2 * t,
        angle: -.24 + .18 * t, alpha: 1 - smooth((p - .62) / .38), path: 1 + t }
      : { x: .12 + .5 * t, y: .63 - .27 * t - .08 * Math.sin(Math.PI * t),
        scale: 1 + .65 * t, angle: -.12 - .12 * t - .12 * Math.sin(Math.PI * t),
        alpha: smooth(p / .2), path: t }
  };
}

function flightPoint(t) {
  return t <= 1
    ? [.12 + .5 * t, .63 - .27 * t - .08 * Math.sin(Math.PI * t)]
    : [.62 + .52 * (t - 1), .36 - .16 * (t - 1)];
}

export function drawTravelPlane(ctx, width, height, plane) {
  ctx.clearRect(0, 0, width, height);
  if (!plane) return;
  const size = Math.min(100, Math.max(55, Math.min(width, height) * .125));
  // The broken pencil line recalls a doodle, never a registered walking route.
  ctx.save();
  const start = Math.max(0, plane.path - .65);
  const fade = ctx.createLinearGradient(width * flightPoint(start)[0], height * flightPoint(start)[1], width * plane.x, height * plane.y);
  fade.addColorStop(0, 'rgba(104,110,85,0)'); fade.addColorStop(1, 'rgba(104,110,85,.48)');
  ctx.strokeStyle = fade; ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.setLineDash([5, 10]);
  ctx.globalAlpha = plane.alpha;
  ctx.beginPath();
  for (let i = 0; i <= 30; i++) {
    const t = start + (plane.path - start) * i / 30, [x, y] = flightPoint(t);
    const px = width * x - size * .65, py = height * y + size * .12;
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.stroke(); ctx.setLineDash([]);
  ctx.translate(width * plane.x, height * plane.y);
  ctx.rotate(plane.angle); ctx.scale(size * plane.scale, size * plane.scale);
  ctx.lineWidth = .032; ctx.strokeStyle = '#2b3028'; ctx.lineJoin = 'round';
  ctx.fillStyle = '#faf7ed';
  ctx.beginPath(); ctx.moveTo(-.71, -.18);
  ctx.quadraticCurveTo(.1, -.31, .91, -.44);
  ctx.quadraticCurveTo(.38, .12, -.23, .59);
  ctx.lineTo(-.34, .14); ctx.closePath(); ctx.fill(); ctx.stroke();
  // Two quiet imperfect color marks, matching the existing unfinished washes.
  ctx.fillStyle = '#e9d995';
  ctx.beginPath(); ctx.moveTo(-.55, -.16); ctx.lineTo(.68, -.37); ctx.lineTo(-.27, .07); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#d9e0cf';
  ctx.beginPath(); ctx.moveTo(-.23, .17); ctx.lineTo(.72, -.34); ctx.lineTo(-.18, .43); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-.69, -.18); ctx.quadraticCurveTo(-.48, .02, -.34, .14);
  ctx.lineTo(.91, -.44); ctx.moveTo(-.34, .14); ctx.lineTo(-.23, .59); ctx.stroke();
  ctx.restore();
}
