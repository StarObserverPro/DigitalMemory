import { STAGE } from '../domain/illustration.js';

// Presentation compression is not a change to the geographic registration.
export const STREET_VIEW = Object.freeze({
  revision: 'xinhua-grounded-r3', groundScale: .48, pavementY: .16,
  cameraPitch: 44 * Math.PI / 180, desktopAzimuth: -.78, mobileAzimuth: -.38,
  desktopSpan: 15.2, mobileSpan: 14, gateReach: 1.85,
});
const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
export function displayedHeight(building) {
  return building.shellAsset === 'apartment' ? clamp(building.height * .35, 4.2, 7.2)
    : building.shellAsset === 'entry' ? 2.35 : 2.65;
}
export function createStreetFrame(mapping, transform) {
  const point = d => transform.toWorld(mapping.locate(mapping.atDistance(d)).geo);
  const origin = point(STAGE.min), end = point(STAGE.max);
  const angle = Math.atan2(end[1] - origin[1], end[0] - origin[0]);
  const scale = STREET_VIEW.groundScale;
  function frame(distance, lateral = 0) {
    const p = point(distance), q = point(Math.min(mapping.total, distance + .05));
    const theta = Math.atan2(q[1] - p[1], q[0] - p[0]);
    const east = p[0] + Math.sin(theta) * lateral - origin[0];
    const north = p[1] - Math.cos(theta) * lateral - origin[1];
    return { x: (east * Math.sin(angle) - north * Math.cos(angle)) * scale,
      z: -(east * Math.cos(angle) + north * Math.sin(angle)) * scale, yaw: theta - angle };
  }
  // Inverse is attached to this street's registered polyline, never a GPS guess.
  function locateGround(x, z) {
    let best = null;
    for (let d = STAGE.min; d < STAGE.max; d += 1) {
      const a = frame(d), b = frame(Math.min(d + 1, STAGE.max));
      const dx = b.x - a.x, dz = b.z - a.z, n = dx * dx + dz * dz;
      const t = clamp(((x - a.x) * dx + (z - a.z) * dz) / n, 0, 1);
      const q = { x: a.x + dx * t, z: a.z + dz * t };
      const error = Math.hypot(x - q.x, z - q.z);
      if (!best || error < best.error) best = { distance: d + t,
        lateral: ((x - q.x) * Math.cos(a.yaw) - (z - q.z) * Math.sin(a.yaw)) / scale, error };
    }
    return best;
  }
  return { frame, locateGround };
}
export function cameraPose(point, aspect, orbit = 0) {
  const narrow = aspect < .8;
  const azimuth = (narrow ? STREET_VIEW.mobileAzimuth : STREET_VIEW.desktopAzimuth) + orbit + point.yaw;
  const target = [point.x, STREET_VIEW.pavementY + .35, point.z - .8];
  const radius = 26, horizontal = radius * Math.cos(STREET_VIEW.cameraPitch);
  return { target, position: [target[0] + Math.sin(azimuth) * horizontal,
    target[1] + Math.sin(STREET_VIEW.cameraPitch) * radius,
    target[2] + Math.cos(azimuth) * horizontal], span: narrow ? STREET_VIEW.mobileSpan : STREET_VIEW.desktopSpan, azimuth };
}
export function cameraRelativeInput(right, up, azimuth, routeYaw) {
  // Camera-right and camera-forward projected onto the ground and then street frame.
  const x = right * Math.cos(azimuth) - up * Math.sin(azimuth);
  const z = -right * Math.sin(azimuth) - up * Math.cos(azimuth);
  return { along: -x * Math.sin(routeYaw) - z * Math.cos(routeYaw),
    lateral: x * Math.cos(routeYaw) - z * Math.sin(routeYaw) };
}
export function gaitPose(travel, amount = 1) {
  const phase = travel / 1.05 * Math.PI * 2;
  const legs = [-1, 1].map((side, i) => {
    const p = phase + i * Math.PI;
    const lift = Math.max(0, Math.sin(p)) * .14 * amount;
    const foot = [side * .135, .06 + lift, Math.cos(p) * .20 * amount];
    const hip = [side * .135, .55, 0], ankle = [foot[0], foot[1] + .06, foot[2]];
    const dy = ankle[1] - hip[1], dz = ankle[2] - hip[2], length = Math.hypot(dy, dz);
    const bend = Math.sqrt(Math.max(0, .265 ** 2 - (length / 2) ** 2));
    const knee = [hip[0], (hip[1] + ankle[1]) / 2 - dz / length * bend,
      (hip[2] + ankle[2]) / 2 + dy / length * bend];
    return { hip, knee, ankle, foot, sole: lift, swing: Math.sin(p) * .28 * amount };
  });
  return { legs, rootY: STREET_VIEW.pavementY };
}
