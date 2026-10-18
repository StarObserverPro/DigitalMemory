import { createTransform, SpatialRegistry } from '../domain/spatial.js';
import { resolveEnvironment } from '../domain/temporal.js';
import { createSession, createPortalController } from '../application/session.js';
import { PublicRepository } from '../adapters/public-repository.js';
import { restoreSession, saveSession } from '../adapters/session-storage.js';
const $ = id => document.getElementById(id);
const escape = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
let repository, manifest, registry, session, portals, includeDemo = false, queryGeneration = 0, sceneData = null, loading = false;
const relationLabels = { current: '这段时间', earlier: '更早的片段', later: '更晚的片段', overlapping: '时间有交叠', unknown: '时间关系未定' };
const assetURL = asset => new URL(asset.url, repository.baseURL).href;
function notify(message = '') { $('status').textContent = message; }
function showDialog(id) {
  queryGeneration++;
  if (loading) { portals.cancel(); loading = false; notify(); }
  for (const dialog of document.querySelectorAll('dialog[open]')) if (dialog.id !== id) dialog.close();
  if (!$(id).open) $(id).showModal();
}
function currentPeriod() { return manifest.periods.find(p => p.id === session.get().periodId); }
function render() {
  const state = session.get();
  $('period-label').textContent = currentPeriod().label;
  const asset = manifest.assets.find(a => a.id === state.styleId);
  const letter = asset.label[0];
  $('style-label').textContent = `底盘 ${letter}`;
  $('map-art').src = assetURL(asset);
  $('map-art').style.clipPath = asset.displayClip || 'none';
  $('map-camera').style.transform = `translate(${state.camera.x}%,${state.camera.y}%) scale(${state.camera.zoom})`;
  $('zoom-out').disabled = state.camera.zoom <= 1;
  $('zoom-in').disabled = state.camera.zoom >= 3;
  for (const button of document.querySelectorAll('.marker')) button.setAttribute('aria-pressed', String(button.dataset.id === state.placeId));
  for (const button of document.querySelectorAll('[data-period]')) button.setAttribute('aria-pressed', String(button.dataset.period === state.periodId));
  for (const button of document.querySelectorAll('[data-style]')) button.setAttribute('aria-pressed', String(button.dataset.style === state.styleId));
  const scene = $('scene');
  if (state.sceneId === 'map') { scene.hidden = true; scene.replaceChildren(); }
  saveSession(localStorage, state);
}
function renderMarkers() {
  const icons = { 'place-xinhua': '⌂', 'place-theatre': '▣', 'place-bridge': '≋', 'place-nankai': '⌂' };
  $('markers').innerHTML = registry.all().filter(p => registry.anchor(p.id)).map(place => {
    const [x, y] = registry.anchor(place.id);
    return `<button class="marker" data-id="${escape(place.id)}" aria-pressed="false" style="left:${x / 12}%;top:${y / 12}%"><span class="marker-dot" aria-hidden="true">${icons[place.id]}</span>${escape(place.label)}${place.id === 'place-xinhua' ? '<small>从这里开始</small>' : ''}${includeDemo && place.id === 'place-xinhua' ? '<span class="marker-demo" aria-label="有交互样例"></span>' : ''}</button>`;
  }).join('');
  for (const marker of document.querySelectorAll('.marker')) marker.addEventListener('click', () => openPlace(marker.dataset.id));
}
function renderRoadLabels(transform) {
  const labels = [ ['西四环南路', [116.27685, 39.849], -87], ['正阳大街', [116.2841, 39.8477], -25], ['建国街', [116.2842, 39.8452], -21], ['新华街', [116.2821, 39.84155], -25], ['铁路', [116.2898, 39.8486], -36] ];
  $('road-labels').innerHTML = labels.map(([label, point, rotate]) => { const [x,y] = transform.toImage(point); return `<text x="${x}" y="${y}" text-anchor="middle" transform="rotate(${rotate} ${x} ${y})">${label}</text>`; }).join('');
}
function renderPlaces(query = '') {
  const results = registry.all().filter(p => p.label.includes(query.trim()));
  $('place-results').innerHTML = results.length ? results.map(p => `<button class="place-result" data-place="${escape(p.id)}"><span>${escape(p.label)}</span><small>${p.geometry ? '打开地点 ↗' : '旧址待定位'}</small></button>`).join('') : '<p class="empty">暂时没有这个地点。</p>';
  for (const button of document.querySelectorAll('[data-place]')) button.addEventListener('click', () => openPlace(button.dataset.place));
}
async function openPlace(id, { preserveSelection = false } = {}) {
  if (!preserveSelection) session.dispatch({ type: 'select-place', id });
  const place = registry.get(id);
  if (!place) return;
  showDialog('place-dialog');
  const generation = ++queryGeneration;
  $('place-dialog').innerHTML = `<div class="dialog-heading"><div><span class="eyebrow">A PLACE IN TIME</span><h2 id="place-title">${escape(place.label)}</h2></div><button class="close" aria-label="关闭">×</button></div><p>${escape(place.summary)}</p><div class="place-empty"><p class="loading-note">正在找这段时间的片段……</p></div>`;
  $('place-dialog').querySelector('.close').addEventListener('click', () => { queryGeneration++; $('place-dialog').close(); });
  try {
    const page = await repository.memories({ placeIds: [id], period: currentPeriod(), includeDemo });
    if (generation !== queryGeneration || session.get().placeId !== id) return;
    const target = $('place-dialog').querySelector('.place-empty');
    const environment = resolveEnvironment(manifest.environmentStates, id, currentPeriod());
    target.dataset.environment = environment.status;
    target.innerHTML = page.records.length ? `<span class="time-tag">交互样例 · 均为虚构</span><div class="memory-list">${page.records.map(m => `<article class="memory-card" data-relation="${m.timeRelation}"><span class="time-tag">${relationLabels[m.timeRelation]}</span><h3>${escape(m.title)}</h3><p>${escape(m.text)}</p>${m.timeRelation !== 'current' ? `<button class="outline-button" data-switch="${escape(m.id)}">切到这段时间</button>` : ''}${m.portalId ? `<button class="primary-button" data-portal="${escape(m.portalId)}" data-memory="${escape(m.id)}">进入样例空间 ↗</button>` : ''}</article>`).join('')}</div>` : `<p>${place.geometry ? '这段时间还没有放入记忆片段。' : '先保留地点身份，核对旧址后再放到地图上。'}</p>${id === 'place-xinhua' && !includeDemo ? '<button class="outline-button" id="enable-demo">试走一个交互样例</button>' : ''}`;
    target.querySelector('#enable-demo')?.addEventListener('click', () => { includeDemo = true; $('demo-toggle').checked = true; renderMarkers(); render(); openPlace(id); });
    for (const b of target.querySelectorAll('[data-switch]')) b.addEventListener('click', () => {
      const memory = page.records.find(m => m.id === b.dataset.switch);
      const period = manifest.periods.find(p => memory.time.kind === 'stage' ? p.kind === 'stage' && p.stageId === memory.time.stageId : p.kind === 'window' && memory.time.start >= p.start && memory.time.end <= p.end);
      if (period) { session.dispatch({ type: 'period', id: period.id }); session.dispatch({ type: 'select-memory', id: memory.id, placeId: id }); openPlace(id, { preserveSelection: true }); }
    });
    for (const b of target.querySelectorAll('[data-portal]')) b.addEventListener('click', () => {
      session.dispatch({ type: 'select-memory', id: b.dataset.memory, placeId: id });
      enterScene(b.dataset.portal);
    });
  } catch (error) { if (generation === queryGeneration) $('place-dialog').querySelector('.place-empty').textContent = error.message; }
}
async function enterScene(id) {
  if (loading) return;
  loading = true; notify('正在打开入口……');
  try {
    const scene = await portals.enter(id);
    if (!scene) return;
    sceneData = scene;
    for (const dialog of document.querySelectorAll('dialog[open]')) dialog.close();
    showScene(scene);
  } catch { notify('入口暂时打不开，原来的位置已保留。'); return; }
  finally { loading = false; }
  notify();
}
function showScene(scene) {
  const element = $('scene');
  element.hidden = false;
  element.innerHTML = `<div class="scene-shell"><button class="pill scene-back" id="scene-back">← 返回${session.get().returnStack.length > 1 ? '上一处' : '地图'}</button><div class="scene-stage"><span class="eyebrow">A LITTLE FURTHER INSIDE</span><h2>${escape(scene.label)}</h2><div class="courtyard ${scene.id === 'demo-room' ? 'room' : ''}">${scene.nextSceneId ? '<button class="pill" id="scene-next">打开下一处入口 ↗</button>' : ''}</div><span class="scene-note">${escape(scene.provenanceLabel)}</span><p>${escape(scene.description)}</p></div></div>`;
  $('scene-next')?.addEventListener('click', () => enterScene(scene.nextSceneId));
  $('scene-back').addEventListener('click', back);
  $('scene-back').focus({ preventScroll: true });
}
async function back() {
  portals.cancel();
  const state = portals.back();
  if (state.sceneId !== 'map') {
    const token = ++queryGeneration;
    try { const scene = await repository.loadScene(state.sceneId); if (token === queryGeneration && state.sceneId === session.get().sceneId) showScene(scene); } catch { notify('场景无法载入，可以继续返回。'); }
  } else {
    sceneData = null;
    if (state.placeId) await openPlace(state.placeId, { preserveSelection: true });
  }
}
function wireControls() {
  $('period-button').addEventListener('click', () => showDialog('period-dialog'));
  $('style-button').addEventListener('click', () => showDialog('style-dialog'));
  $('find-button').addEventListener('click', () => { renderPlaces(); showDialog('find-dialog'); $('place-search').focus(); });
  $('help-button').addEventListener('click', () => showDialog('help-dialog'));
  $('place-search').addEventListener('input', e => renderPlaces(e.target.value));
  $('demo-toggle').addEventListener('change', e => { includeDemo = e.target.checked; renderMarkers(); render(); });
  for (const dialog of document.querySelectorAll('dialog')) {
    dialog.querySelector('.close')?.addEventListener('click', () => { queryGeneration++; dialog.close(); });
    dialog.addEventListener('cancel', () => { queryGeneration++; portals.cancel(); loading = false; notify(); });
    dialog.addEventListener('click', e => { const r = dialog.getBoundingClientRect(); if (e.target === dialog && (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom)) { dialog.close(); queryGeneration++; } });
  }
  const zoom = delta => { const camera = session.get().camera; session.dispatch({ type: 'camera', camera: { zoom: camera.zoom + delta, ...(camera.zoom + delta <= 1 ? { x: 0, y: 0 } : {}) } }); };
  $('zoom-in').addEventListener('click', () => zoom(.35));
  $('zoom-out').addEventListener('click', () => zoom(-.35));
  $('reset-view').addEventListener('click', () => session.dispatch({ type: 'camera', camera: { x: 0, y: 0, zoom: 1 } }));
  const viewport = $('map-viewport'); let drag = null;
  viewport.addEventListener('pointerdown', e => { if (e.target.closest('button') || e.button !== 0) return; drag = { id: e.pointerId, x: e.clientX, y: e.clientY, camera: session.get().camera }; viewport.setPointerCapture(e.pointerId); });
  viewport.addEventListener('pointermove', e => {
    if (!drag || drag.id !== e.pointerId) return;
    const side = $('board').clientWidth;
    session.dispatch({ type: 'camera', camera: { x: Math.max(-65, Math.min(65, drag.camera.x + (e.clientX - drag.x) / side * 100)), y: Math.max(-65, Math.min(65, drag.camera.y + (e.clientY - drag.y) / side * 100)) } });
  });
  viewport.addEventListener('pointerup', () => { drag = null; });
  viewport.addEventListener('pointercancel', () => { drag = null; });
  viewport.addEventListener('wheel', e => { if (e.ctrlKey || e.metaKey) return; e.preventDefault(); zoom(e.deltaY < 0 ? .12 : -.12); }, { passive: false });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { portals.cancel(); if (!document.querySelector('dialog[open]') && session.get().sceneId !== 'map') back(); } });
}
async function start() {
  repository = new PublicRepository(new URL('../../content/public/', import.meta.url));
  manifest = await repository.init();
  const [places, geometryResponse] = await Promise.all([repository.places(), fetch(new URL(manifest.geometry, repository.baseURL))]);
  if (!geometryResponse.ok) throw new Error('地图地理骨架暂时无法载入。');
  const geometry = await geometryResponse.json();
  if (geometry.revision !== manifest.geometryRevision) throw new Error('地图位置版本不匹配。');
  const transform = createTransform(geometry.bounds);
  if (transform.revision !== manifest.transformRevision) throw new Error('地图配准版本不匹配。');
  registry = new SpatialRegistry(places, transform);
  session = createSession(restoreSession(localStorage, manifest));
  portals = createPortalController(session, repository);
  session.subscribe(render);
  $('period-options').innerHTML = manifest.periods.map(p => `<button class="option-button" data-period="${p.id}" aria-pressed="false">${escape(p.label)}</button>`).join('');
  for (const b of document.querySelectorAll('[data-period]')) b.addEventListener('click', () => { session.dispatch({ type: 'period', id: b.dataset.period }); $('period-dialog').close(); });
  const captions = { paper: '淡纸色 · 安静的街区轮廓', board: '纸板建筑 · 生成式画风候选', ink: '冷色线稿 · 留出更多记忆空间' };
  $('style-options').innerHTML = manifest.assets.map(a => `<button class="style-card" data-style="${a.id}" aria-pressed="false"><img style="clip-path:${a.displayClip || 'none'}" src="${assetURL(a)}" alt="${escape(a.label)}候选底盘"/><strong>${escape(a.label)}</strong><span>${captions[a.id]}</span></button>`).join('');
  for (const b of document.querySelectorAll('[data-style]')) b.addEventListener('click', () => { session.dispatch({ type: 'style', id: b.dataset.style }); $('style-dialog').close(); });
  renderMarkers(); renderRoadLabels(transform); wireControls(); render();
  $('map-art').addEventListener('error', () => notify('底图未载入，地点入口仍可使用。请刷新重试。'));
  // Read-only diagnostic hook: domain state remains owned by the application session.
  globalThis.digitalMemory = Object.freeze({ inspect: () => ({ session: session.get(), geometryRevision: geometry.revision, transformRevision: transform.revision, assets: manifest.assets.map(a => ({ id: a.id, revision: a.revision })) }) });
}
start().catch(error => {
  const panel = document.createElement('div'); panel.className = 'error-screen';
  const text = document.createElement('p'); text.textContent = error.message;
  const button = document.createElement('button'); button.textContent = '重新载入'; button.onclick = () => location.reload();
  panel.append(text, button); $('app').append(panel);
});
