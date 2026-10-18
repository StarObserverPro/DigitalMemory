import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { createTransform } from '../src/domain/spatial.js';
const geo = JSON.parse(await readFile(new URL('../content/public/orientation.json', import.meta.url)));
const transform = createTransform(geo.bounds);
const path = points => points.map((p, i) => `${i ? 'L' : 'M'}${transform.toImage(p).map(n => n.toFixed(2)).join(',')}`).join(' ');
const palettes = {
  paper: { title: 'A · 纸上街区', ground: '#f3edda', edge: '#c5c8ae', district: '#e0e2c6', road: '#fff9e9', ring: '#c9c6b6', ink: '#868977', roof: '#d2b7a0', wall: '#b8957e', green: '#c1d0af', rail: '#8e9485' },
  board: { title: 'B · 彩色底盘', ground: '#e8eedb', edge: '#91afa1', district: '#c7d8bb', road: '#fff9e8', ring: '#abbeb4', ink: '#54786e', roof: '#e3ae83', wall: '#b98264', green: '#a8c69f', rail: '#77998d' },
  ink: { title: 'C · 蓝墨地图', ground: '#eaf0ee', edge: '#a4bec1', district: '#d5e3e0', road: '#f7faf5', ring: '#bdd0cf', ink: '#567d87', roof: '#bad1d3', wall: '#94b3bb', green: '#c1d7cd', rail: '#75939e' }
};
await mkdir('assets/maps', { recursive: true });
const assets = [];
const previous = JSON.parse(await readFile('content/public/manifest.json')); 
for (const [id, p] of Object.entries(palettes)) {
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="2400" height="2400" viewBox="0 0 1200 1200" role="img" aria-labelledby="title desc"><title id="title">${p.title}</title><desc id="desc">Sparse contemporary geographic orientation draft of Fengtai, not a historical reconstruction. © OpenStreetMap contributors.</desc><defs><clipPath id="clip"><rect x="56" y="56" width="1088" height="1088" rx="12"/></clipPath><pattern id="dots" width="13" height="13" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r=".65" fill="${p.ink}" opacity=".12"/></pattern></defs>`;
  // A tactile board edge; no game cells or invented travel itinerary.
  svg += `<rect x="34" y="46" width="1132" height="1132" rx="24" fill="${p.edge}"/><rect x="34" y="28" width="1132" height="1132" rx="24" fill="${p.ground}" stroke="${p.edge}" stroke-width="2"/><rect x="48" y="42" width="1104" height="1104" rx="16" fill="none" stroke="${p.edge}" opacity=".6"/><g clip-path="url(#clip)"><rect x="56" y="56" width="1088" height="1088" fill="url(#dots)"/>`;
  for (const d of geo.districts) svg += `<path d="${path(d.points)}Z" fill="${p.district}" stroke="${p.edge}" stroke-width="1" opacity=".72"/>`;
  for (const r of geo.roads) {
    const width = r.class === 'ring' ? 18 : r.class === 'primary' ? 16 : r.class === 'focus' ? 16 : 9;
    svg += `<path d="${path(r.points)}" fill="none" stroke="${p.ink}" stroke-opacity=".28" stroke-width="${width + 3}" stroke-linejoin="round" stroke-linecap="round"/>`;
  }
  for (const r of geo.roads) {
    const width = r.class === 'ring' ? 18 : r.class === 'primary' ? 16 : r.class === 'focus' ? 16 : 9;
    svg += `<path d="${path(r.points)}" fill="none" stroke="${r.class === 'ring' ? p.ring : p.road}" stroke-width="${width}" stroke-linejoin="round" stroke-linecap="round"/>`;
  }
  // Rails are quiet but geographically continuous. They are never a walking route.
  for (const r of geo.railways) svg += `<path d="${path(r.points)}" fill="none" stroke="${p.rail}" stroke-width="2" opacity=".34"/>`;
  for (const b of geo.buildings) {
    svg += `<path d="${path(b.points)}Z" fill="${p.wall}" opacity=".55" transform="translate(0,5)"/><path d="${path(b.points)}Z" fill="${p.roof}" stroke="${p.ink}" stroke-opacity=".2" stroke-width=".8"/>`;
  }
  const focus = geo.roads.filter(r => r.class === 'focus');
  for (const r of focus) svg += `<path d="${path(r.points)}" fill="none" stroke="${id === 'ink' ? '#639baa' : '#c78359'}" stroke-width="3.5" stroke-linecap="round" opacity=".8"/>`;
  svg += `</g></svg>`;
  const filename = `fengtai-${id}-r1.svg`;
  await writeFile(`assets/maps/${filename}`, svg);
  assets.push({ id, label: p.title, revision: `${id}-r1`, url: `../../assets/maps/${filename}`, sha256: createHash('sha256').update(svg).digest('hex'), kind: 'procedural-cartographic-illustration', sourceRefs: [geo.source.id], geometryRevision: geo.revision, transformRevision: transform.revision, width: 2400, height: 2400, approval: 'candidate', privacy: 'public', rights: 'Project styling: MIT; underlying OSM extract: ODbL-1.0; retain attribution.' });
}
const manifestPath = 'content/public/manifest.json';
const manifest = previous;
for (let i = 0; i < assets.length; i++) {
  const generated = previous.assets.find(a => a.id === assets[i].id && a.kind === 'generated-map-style-candidate');
  if (generated && generated.geometryRevision === geo.revision && generated.referenceSha256 === assets[i].sha256) assets[i] = generated;
}
manifest.assets = [...previous.assets.filter(a => !['paper', 'board', 'ink'].includes(a.id)), ...assets.map(a => ({ ...a, approval: previous.assets.find(p => p.id === a.id)?.approval || a.approval, selectable: previous.assets.find(p => p.id === a.id)?.selectable ?? false }))];
await writeFile(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
console.log(`Built ${assets.length} registered map candidates, 2400 × 2400 SVG.`);
