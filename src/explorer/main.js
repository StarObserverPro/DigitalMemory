import { createComposition } from '../domain/composition.js';
import { overviewMarkup } from './overview.js';
import { createIllustrationMapping, STAGE } from '../domain/illustration.js';
import { createTransform, SpatialRegistry } from '../domain/spatial.js';
import { resolveEnvironment } from '../domain/temporal.js';
import { createSession, createPortalController } from '../application/session.js';
import { PublicRepository } from '../adapters/public-repository.js';
import { restoreSession, saveSession } from '../adapters/session-storage.js';
const $ = id => document.getElementById(id);
const escape = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
let repository, manifest, registry, session, portals, includeDemo = false, queryGeneration = 0, sceneData = null, loading = false;
let composition, moduleAssets, mapping, stage = null, startingStage = false, lastRenderKey = '', saveTimer, mapDestination = null; const mapKeys = new Set();
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
  const location = mapping.locate(state.route);
  $('map-person').style.left = `${location.art[0] / 12}%`;
  $('map-person').style.top = `${location.art[1] / 12}%`;
  $('street-entry').style.left = `${location.art[0] / 12}%`;
  $('street-entry').style.top = `${location.art[1] / 12}%`;
  $('stage-limit').hidden = location.distance > STAGE.min + .3 && location.distance < STAGE.max - .3;
  clearTimeout(saveTimer); saveTimer = setTimeout(() => saveSession(localStorage, session.get()), 200);
  const key = JSON.stringify([state.periodId,state.styleId,state.camera,state.placeId,state.sceneId,state.view,state.selectedMemoryId,state.layers,state.frontagePreview,state.characterId]);
  if (key === lastRenderKey) return;
  lastRenderKey = key;
  $('street-stage').hidden = state.view !== 'street' || state.sceneId !== 'map';
  $('period-label').textContent = currentPeriod().label;
  const asset = manifest.assets.find(a => a.id === state.styleId);
  const letter = asset.label[0];
  $('style-label').textContent = `底盘 ${letter}`;
  $('map-art').src = assetURL(asset);
  $('map-composition').innerHTML = overviewMarkup(composition,moduleAssets,state);
  $('map-person').hidden = !state.layers.person;
  $('map-person').src = moduleAssets.walker.url;
  $('map-person').style.height = state.characterId==='youth'?'53px':'46px';
  for(const input of document.querySelectorAll('[data-layer-toggle]')) input.checked=state.layers[input.dataset.layerToggle];
  for(const b of document.querySelectorAll('[data-frontage-preview]')) b.setAttribute('aria-pressed',String(state.frontagePreview===b.dataset.frontagePreview));
  $('map-art').style.clipPath = asset.displayClip || 'none';
  $('map-camera').style.transform = `translate(${state.camera.x}%,${state.camera.y}%) scale(${state.camera.zoom})`;
  $('zoom-out').disabled = state.camera.zoom <= 1;
  $('zoom-in').disabled = state.camera.zoom >= 3;
  for (const button of document.querySelectorAll('.marker')) button.setAttribute('aria-pressed', String(button.dataset.id === state.placeId));
  for (const button of document.querySelectorAll('[data-period]')) button.setAttribute('aria-pressed', String(button.dataset.period === state.periodId));
  for (const button of document.querySelectorAll('[data-style]')) button.setAttribute('aria-pressed', String(button.dataset.style === state.styleId));
  const scene = $('scene');
  if (state.sceneId === 'map') { scene.hidden = true; scene.replaceChildren(); }

}
function renderMarkers() {
  const icons = { 'place-xinhua': '⌂', 'place-theatre': '▣', 'place-bridge': '≋', 'place-nankai': '⌂' };
  $('markers').innerHTML = registry.all().filter(p => registry.anchor(p.id)).map(place => {
    const [x, y] = mapping.data.anchors.find(a => a.id === place.id)?.label || registry.anchor(place.id);
    return `<button class="marker" data-id="${escape(place.id)}" aria-pressed="false" style="left:${x / 12}%;top:${y / 12}%"><span class="marker-dot" aria-hidden="true">${icons[place.id]}</span>${escape(place.label)}${place.id === 'place-xinhua' ? '<small>从这里开始</small>' : ''}${includeDemo && place.id === 'place-xinhua' ? '<span class="marker-demo" aria-label="有交互样例"></span>' : ''}</button>`;
  }).join('');
  for (const marker of document.querySelectorAll('.marker')) marker.addEventListener('click', () => openPlace(marker.dataset.id));
}
function renderRoadLabels(transform) {
  const labels = [ ['西四环南路', [355,415], 90], ['正阳大街', [686,438], -26], ['新华街', [892,781], -26], ['建国街',[753,633],-21],['铁路',[760,500],-22],['丰台南路',[752,966],-10] ];
  $('road-labels').innerHTML = labels.map(([label,[x,y],rotate])=>`<text x="${x}" y="${y}" text-anchor="middle" transform="rotate(${rotate} ${x} ${y})">${label}</text>`).join('')+'<text class="neighborhood-note" x="780" y="1090" text-anchor="middle">往 韩 庄 子</text>';
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
  element.innerHTML = `<div class="scene-shell"><button class="pill scene-back" id="scene-back">← 返回${session.get().returnStack.length > 1 ? '上一处' : (session.get().view === 'street' ? '街边' : '地图')}</button><div class="scene-stage"><span class="eyebrow">A LITTLE FURTHER INSIDE</span><h2>${escape(scene.label)}</h2><div class="courtyard ${scene.id === 'demo-room' ? 'room' : ''}">${scene.nextSceneId ? '<button class="pill" id="scene-next">打开下一处入口 ↗</button>' : ''}</div><span class="scene-note">${escape(scene.provenanceLabel)}</span><p>${escape(scene.description)}</p></div></div>`;
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
    if (state.placeId && state.view !== 'street') await openPlace(state.placeId, { preserveSelection: true });
  }
}
function wireControls() {
  for(const id of ['layers-button','street-layers-button']) $(id).addEventListener('click',()=>showDialog('layers-dialog'));
  for(const input of document.querySelectorAll('[data-layer-toggle]')) input.addEventListener('change',()=>session.dispatch({type:'layer',id:input.dataset.layerToggle,visible:input.checked}));
  for(const b of document.querySelectorAll('[data-frontage-preview]')) b.addEventListener('click',()=>session.dispatch({type:'frontage-preview',id:b.dataset.frontagePreview}));
  $('street-entry').addEventListener('click', enterStreet);
  $('leave-street').addEventListener('click', () => { stage?.clear(); portals.cancel(); loading=false; notify(); session.dispatch({ type: 'view', view: 'map' }); });
  $('mapping-button').addEventListener('click', () => { renderMapping(); showDialog('mapping-dialog'); });
  $('door-action').addEventListener('click', enterDoor);
  document.addEventListener('keydown', e => { if (e.code === 'KeyE' && !e.repeat && session.get().view === 'street' && session.get().sceneId === 'map' && !document.querySelector('dialog[open]') && !$('door-action').hidden) enterDoor(); });
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
  document.addEventListener('keydown', e => { if (e.key !== 'Escape') return; const dialog = document.querySelector('dialog[open]'); if (dialog) { e.preventDefault(); e.stopImmediatePropagation(); dialog.close(); queryGeneration++; portals.cancel(); loading=false; notify(); } }, true);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { portals.cancel(); if (!document.querySelector('dialog[open]') && session.get().sceneId !== 'map') back(); } });
}
async function enterStreet() {
  if (startingStage) return;
  mapDestination = null; mapKeys.clear();
  const d = mapping.locate(session.get().route).distance;
  if (d < STAGE.min || d > STAGE.max) { notify('这段街景还在绘制，请先点新华街院门附近的路。'); return; }
  startingStage = true; notify('正在展开街边布景……');
  try {
    if (!stage) {
      const { createStage } = await import('./stage.js');
      stage = await createStage({ container: $('stage-canvas'), session, mapping, transform: registry.transform,
        assets: Object.fromEntries(Object.entries(manifest.stageAssets).map(([k,a]) => [k,{...a,url:assetURL(a)}])), composition,
        blocked: () => loading || !!document.querySelector('dialog[open]'), onNear: near => { $('door-action').hidden = !near; }, onError: notify });
    }
    session.dispatch({ type: 'select-place', id: 'place-xinhua' });
    session.dispatch({ type: 'view', view: 'street' }); notify();
  } catch (error) { stage?.dispose(); stage = null; $('stage-canvas').replaceChildren(); notify('街景暂时打不开，手绘图上的位置已保留。'); }
  finally { startingStage = false; }
}
async function enterDoor() {
  if ($('door-action').hidden) return;
  stage?.clear();
  session.dispatch({ type: 'select-memory', id: 'demo-current', placeId: 'place-xinhua' });
  await enterScene('demo-courtyard');
}
function renderMapping(selected = 'walker') {
  const geoImage = new URL('../../assets/maps/fengtai-ink-r1.svg', import.meta.url).href;
  const artImage = assetURL(manifest.assets.find(a => a.id === 'journal'));
  const selectedAnchor = mapping.data.anchors.find(a => a.id === selected);
  const position = selected === 'walker' ? mapping.locate(session.get().route) : { geo: registry.get(selected).geometry.coordinates, art: selectedAnchor.art };
  const geoXY = registry.transform.toImage(position.geo);
  const line = points => 'M'+points.map(p => p.join(',')).join(' L');
  $('mapping-views').innerHTML = [[geoImage,geoXY,mapping.data.nodes.map(n=>registry.transform.toImage(n.geo)),'当代地理参照'],[artImage,position.art,mapping.data.nodes.map(n=>n.art),'独立图层合成']].map(([src,point,path,caption],i)=>`<figure><svg viewBox="0 0 1200 1200"><image href="${src}" width="1200" height="1200"/>${i?overviewMarkup(composition,moduleAssets,session.get()):''}<path d="${line(path)}" fill="none" stroke="#c87a50" stroke-width="7"/><circle cx="${point[0]}" cy="${point[1]}" r="15"/></svg><figcaption>${caption}</figcaption></figure>`).join('');
  $('mapping-detail').innerHTML = `<div>${[['walker','当前行走位置'],...mapping.data.anchors.map(a=>[a.id,registry.get(a.id).label])].map(([id,label])=>`<button data-map-node="${id}" aria-pressed="${id===selected}">${label}</button>`).join('')}</div><p><strong>${selected==='walker'?'人物走到的位置':escape(registry.get(selected).label)}</strong><br><code>${selected==='walker'?`${session.get().route.edgeId} · t=${session.get().route.t.toFixed(4)}`:selected}</code><br>经纬度 ${position.geo.map(n=>n.toFixed(6)).join(', ')} ↔ 插画坐标 ${position.art.map(n=>Math.round(n)).join(', ')} / 1200</p>`;
  for(const b of $('mapping-detail').querySelectorAll('[data-map-node]'))b.addEventListener('click',()=>renderMapping(b.dataset.mapNode));
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
  const mappingData = await repository.read(manifest.illustrationMapping);
  if (mappingData.geometryRevision !== geometry.revision || mappingData.transformRevision !== transform.revision) throw new Error('插画节点对应的地理版本不匹配。');
  mapping = createIllustrationMapping(mappingData, transform);
  composition = createComposition(await repository.read(manifest.composition),mapping);
  if(composition.data.mappingRevision!==mappingData.id)throw new Error('图层登记版本不匹配。');
  moduleAssets=Object.fromEntries(Object.entries(manifest.moduleAssets).map(([id,a])=>[id,{...a,url:assetURL(a)}]));
  let saved = restoreSession(localStorage, manifest);
  if (saved && !mapping.valid(saved.route)) saved.route = mappingData.spawn;
  if (saved && !manifest.assets.find(a => a.id === saved.styleId)?.selectable) saved.styleId = 'journal';
  session = createSession(saved, mapping);
  if (!saved) session.dispatch({ type: 'route', route: mappingData.spawn });
  portals = createPortalController(session, repository);
  session.subscribe(render);
  $('period-options').innerHTML = manifest.periods.map(p => `<button class="option-button" data-period="${p.id}" aria-pressed="false">${escape(p.label)}</button>`).join('');
  for (const b of document.querySelectorAll('[data-period]')) b.addEventListener('click', () => { session.dispatch({ type: 'period', id: b.dataset.period }); $('period-dialog').close(); });
  const captions = { paper: '淡纸色 · 安静的街区轮廓', board: '纸板建筑 · 生成式画风候选', ink: '冷色线稿 · 留出更多记忆空间' };
  $('style-options').innerHTML = manifest.assets.filter(a => a.selectable).map(a => `<button class="style-card" data-style="${a.id}" aria-pressed="false"><img style="clip-path:${a.displayClip || 'none'}" src="${assetURL(a)}" alt="${escape(a.label)}候选底盘"/><strong>${escape(a.label)}</strong><span>${captions[a.id]}</span></button>`).join('');
  for (const b of document.querySelectorAll('[data-style]')) b.addEventListener('click', () => { session.dispatch({ type: 'style', id: b.dataset.style }); $('style-dialog').close(); });
  await document.fonts.ready;
  renderMarkers(); renderRoadLabels(transform); wireControls(); render();
  $('walking-path').innerHTML = `<path d="M${mapping.data.nodes.map(n => n.art.join(',')).join(' L')}"/>`;
  globalThis.__VISUAL_READY__ = true;
  document.addEventListener('keydown', e => { if (session.get().view !== 'map' || session.get().sceneId !== 'map' || document.querySelector('dialog[open]')) return; if (['ArrowUp','ArrowRight','ArrowDown','ArrowLeft'].includes(e.code)) { e.preventDefault(); mapDestination = null; mapKeys.add(e.code); } });
  document.addEventListener('keyup', e => mapKeys.delete(e.code));
  window.addEventListener('blur', () => { mapKeys.clear(); mapDestination = null; });
  let lastMapFrame = performance.now();
  function animateMap(now) {
    const dt = Math.min((now-lastMapFrame)/1000,.05); lastMapFrame=now;
    if (session.get().view === 'map' && session.get().sceneId === 'map' && !document.querySelector('dialog[open]')) {
      const d=mapping.locate(session.get().route).distance;
      let forward=Number(mapKeys.has('ArrowUp')||mapKeys.has('ArrowRight'))-Number(mapKeys.has('ArrowDown')||mapKeys.has('ArrowLeft'));
      if (mapDestination !== null) { const gap=mapDestination-d; if (Math.abs(gap)<35*dt) { session.dispatch({type:'route',route:mapping.atDistance(mapDestination)}); mapDestination=null; } else forward=Math.sign(gap); }
      if (forward) session.dispatch({type:'walk',input:{forward},dt});
    } else { mapKeys.clear(); mapDestination=null; }
    requestAnimationFrame(animateMap);
  }
  requestAnimationFrame(animateMap);
  $('map-viewport').addEventListener('click', e => { if (e.target.closest('button')) return; const r = $('map-camera').getBoundingClientRect(), p = [(e.clientX-r.left)/r.width*1200,(e.clientY-r.top)/r.height*1200], hit = mapping.nearestArt(p); if (hit.distance < 25) mapDestination = mapping.locate(hit.route).distance; });
  $('map-art').addEventListener('error', () => notify('底图未载入，地点入口仍可使用。请刷新重试。'));
  // Read-only diagnostic hook: domain state remains owned by the application session.
  globalThis.digitalMemory = Object.freeze({ inspect: () => ({ session: session.get(), geometryRevision: geometry.revision, transformRevision: transform.revision, assets: manifest.assets.map(a => ({ id: a.id, revision: a.revision })), mappingRevision: mapping.data.id, position: mapping.locate(session.get().route), composition: composition.resolve(session.get().periodId,session.get().frontagePreview), stage: stage?.inspect() || null }) });
}
start().catch(error => {
  const panel = document.createElement('div'); panel.className = 'error-screen';
  const text = document.createElement('p'); text.textContent = error.message;
  const button = document.createElement('button'); button.textContent = '重新载入'; button.onclick = () => location.reload();
  panel.append(text, button); $('app').append(panel);
});
