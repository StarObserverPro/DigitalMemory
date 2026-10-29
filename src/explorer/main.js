import { createComposition } from '../domain/composition.js';
import { createOverviewAssembly, layeredOverviewMarkup, overviewLabelsMarkup, mapLevel } from './layered-overview.js';
import { mapMetrics } from './map-labels.js';
import { createIllustrationMapping, STAGE } from '../domain/illustration.js';
import { createTransform, SpatialRegistry } from '../domain/spatial.js';
import { resolveEnvironment } from '../domain/temporal.js';
import { createSession, createPortalController } from '../application/session.js';
import { PublicRepository } from '../adapters/public-repository.js';
import { restoreSession, saveSession } from '../adapters/session-storage.js';
import { createEntryTransition } from './entry-transition.js';
import { createTravelTransition } from './travel-transition.js';
import { destinationGroups } from './destinations.js';
const $ = id => document.getElementById(id);
const escape = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
let repository, manifest, registry, session, portals, includeDemo = false, queryGeneration = 0, sceneData = null, loading = false;
let streetLoadGeneration=0,streetLoadController=null,streetLoadKey=null,stageSlot=null;
let entryTransition = null;
let destinationLandmarks = null, destinationQueryGeneration = 0;
let overviewAssembly, mapDragged=false; const availableMapAssets=new Set();
let composition, mapContext, moduleAssets, mapping, stage = null, startingStage = false, lastRenderKey = '', lastArtKey = '', saveTimer, mapDestination = null; const mapKeys = new Set();
const relationLabels = { current: '这段时间', earlier: '更早的片段', later: '更晚的片段', overlapping: '时间有交叠', unknown: '时间关系未定' };
const assetURL = asset => new URL(asset.url, repository.baseURL).href;
function notify(message = '') { $('status').textContent = message; }
function cancelStreetLoad() {
  streetLoadGeneration++;
  streetLoadController?.abort();
  streetLoadController=null;
  startingStage=false;
  // A cancelled reconstruction has no renderer to resume. Return to a usable
  // overview; a retained street and a nested attachment keep their own origin.
  const state=session?.get();
  if(!stage&&state?.view==='street'&&state.sceneId==='map')session.dispatch({type:'view',view:'map'});
}
function discardStage() {
  const previous=stage;
  stage=null;
  if(stageSlot)stageSlot.clear();else previous?.dispose();
  lastRenderKey='';
}
function refreshStage() {
  if(!stage)return;
  if(!stage.compatible()) {
    discardStage();
    const state=session.get();
    if(state.view==='street'&&state.sceneId==='map'&&!startingStage)queueMicrotask(()=>enterStreet());
    return;
  }
  const state=session.get();
  if(state.view==='street'&&state.sceneId==='map')stageSlot?.resume();
  else stageSlot?.suspend();
  stage?.refresh?.();
}
function closeMenuDialog() {
  $('menu-dialog').close();
  stage?.menuState?.(false);
  stage?.refresh?.();
}
function showDialog(id) {
  if(startingStage){cancelStreetLoad();notify();}
  queryGeneration++;
  if (loading) { portals.cancel(); loading = false; notify(); }
  for (const dialog of document.querySelectorAll('dialog[open]')) if (dialog.id !== id) dialog.close();
  if (!$(id).open) $(id).showModal();
  if(id==='menu-dialog')stage?.menuState?.(true);
  stage?.refresh?.();
}
function currentPeriod() { return manifest.periods.find(p => p.id === session.get().periodId); }
function render() {
  refreshStage();
  const state = session.get();
  $('simple-entry').checked = state.entryTransition === 'simple';
  for (const button of document.querySelectorAll('[data-travel-mode]')) button.setAttribute('aria-pressed', String(button.dataset.travelMode === state.travelMode));
  const location = mapping.locate(state.route);
  $('map-person').style.left = `${location.art[0] / 12}%`;
  $('map-person').style.top = `${location.art[1] / 12}%`;



  clearTimeout(saveTimer); saveTimer = setTimeout(() => saveSession(localStorage, session.get()), 200);
  const viewport=$('map-viewport'),side=$('map-camera').clientWidth;
  const metrics=mapMetrics(state.camera,viewport.clientWidth,viewport.clientHeight,side);
  const key = JSON.stringify([state.periodId,state.styleId,state.camera,state.placeId,state.sceneId,state.view,state.selectedMemoryId,state.layers,state.frontagePreview,state.characterId,metrics.width,metrics.height,side,!!stage]);
  if (key === lastRenderKey) return;
  lastRenderKey = key;
  $('app').classList.toggle('outline-active',state.view==='street'&&state.sceneId==='map'&&!!stage?.landmarks);
  $('uniform-toggle').hidden=!!stage?.landmarks&&state.view==='street';
  $('street-stage').hidden = state.view !== 'street' || state.sceneId !== 'map';
  $('period-label').textContent = currentPeriod().label;
  $('uniform-label').textContent = state.characterId==='youth'?'高中蓝白':'初中红白';
  const asset = manifest.assets.find(a => a.id === state.styleId);

  const artKey=JSON.stringify([state.styleId,state.periodId,mapLevel(state.camera.zoom),Math.round(metrics.scale*100)]);
  if(artKey!==lastArtKey){lastArtKey=artKey;$('map-composition').innerHTML=layeredOverviewMarkup(overviewAssembly,moduleAssets,state,[...availableMapAssets],{includeLabels:false,metrics});}
  $('map-labels').innerHTML=overviewLabelsMarkup(overviewAssembly,state,[...availableMapAssets],metrics);
  $('map-person').hidden = true;
  $('map-person').src = moduleAssets.walker.url;
  $('map-person').style.height = state.characterId==='youth'?'53px':'46px';

  $('map-art').style.clipPath = asset.displayClip || 'none';
  $('map-camera').style.transform = `translate(calc(-50% + ${state.camera.x}%),calc(-50% + ${state.camera.y}%)) scale(${state.camera.zoom})`;
  $('street-entry').hidden = state.view === 'street' || state.sceneId !== 'map';
  $('leave-street').hidden = state.view !== 'street' || state.sceneId !== 'map';
  $('scene-back').hidden = state.sceneId === 'map';
  $('scene-next').hidden = !sceneData?.nextSceneId || state.sceneId === 'map';
  $('door-action').hidden = state.view !== 'street' || state.sceneId !== 'map' || !stage?.inspect()?.nearEntrance;
  document.querySelector('.menu-zoom').hidden = state.view !== 'map' || state.sceneId !== 'map';
  $('zoom-out').disabled = state.camera.zoom <= 1;
  $('zoom-in').disabled = state.camera.zoom >= 2.7;

  for (const button of document.querySelectorAll('[data-period]')) button.setAttribute('aria-pressed', String(button.dataset.period === state.periodId));

  const scene = $('scene');
  if (state.sceneId === 'map') { scene.hidden = true; scene.replaceChildren(); }

}
function renderMarkers() { $('markers').replaceChildren(); }
function renderRoadLabels() { $('road-labels').replaceChildren(); }
function renderDestinations(query = '') {
  if (!destinationLandmarks) return;
  const groups = destinationGroups(destinationLandmarks, query);
  $('destination-groups').innerHTML = groups.length ? groups.map(group => `<details class="destination-group"${query.trim() ? ' open' : ''}><summary>${escape(group.label)}<small>${group.places.length} 处</small></summary><div class="destination-list">${group.places.map(place => `<button data-travel-go="${escape(place.id)}"><span>${escape(place.label)}</span><span aria-hidden="true">↗</span></button>`).join('')}</div></details>`).join('') : '<p class="empty">这段街上暂时没有找到这个地方。</p>';
  for (const button of $('destination-groups').querySelectorAll('[data-travel-go]')) button.addEventListener('click', () => {
    const goal = destinationLandmarks[button.dataset.travelGo];
    $('destinations-dialog').close();
    enterStreet({ destination: goal });
  });
}
async function openDestinations() {
  const generation = ++destinationQueryGeneration;
  $('destination-search').value = '';
  $('destination-groups').textContent = '正在找这段街上的地方……';
  showDialog('destinations-dialog'); $('destination-search').focus();
  try {
    destinationLandmarks = stage?.landmarks || (await repository.loadOutline()).data.landmarks;
    if (generation === destinationQueryGeneration && $('destinations-dialog').open) renderDestinations($('destination-search').value);
  } catch {
    if (generation === destinationQueryGeneration && $('destinations-dialog').open) $('destination-groups').textContent = '地点暂时打不开，关上后可以再试一次。';
  }
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
  $('place-dialog').innerHTML = `<div class="dialog-heading"><div><h2 id="place-title">${escape(place.label)}</h2></div><button class="close" aria-label="关闭">×</button></div><p>${escape(place.summary)}</p><div class="place-empty"><p class="loading-note">正在找这段时间的片段……</p></div>`;
  $('place-dialog').querySelector('.close').addEventListener('click', () => { queryGeneration++; $('place-dialog').close(); });
  try {
    const page = await repository.memories({ placeIds: [id], period: currentPeriod(), includeDemo });
    if (generation !== queryGeneration || session.get().placeId !== id) return;
    const target = $('place-dialog').querySelector('.place-empty');
    const environment = resolveEnvironment(manifest.environmentStates, id, currentPeriod());
    target.dataset.environment = environment.status;
    target.innerHTML = page.records.length ? `<span class="time-tag">想象片段</span><div class="memory-list">${page.records.map(m => `<article class="memory-card" data-relation="${m.timeRelation}"><span class="time-tag">${relationLabels[m.timeRelation]}</span><h3>${escape(m.title)}</h3><p>${escape(m.text)}</p>${m.timeRelation !== 'current' ? `<button class="outline-button" data-switch="${escape(m.id)}">切到这段时间</button>` : ''}${m.portalId ? `<button class="primary-button" data-portal="${escape(m.portalId)}" data-memory="${escape(m.id)}">走进去 ↗</button>` : ''}</article>`).join('')}</div>` : `<p>${place.geometry ? '这段时间还没有放入记忆片段。' : '这处旧址的位置还没有确定。'}</p>`;

    for (const b of target.querySelectorAll('[data-switch]')) b.addEventListener('click', () => {
      const memory = page.records.find(m => m.id === b.dataset.switch);
      const period = manifest.periods.find(p => memory.time.kind === 'stage' ? p.kind === 'stage' && p.stageId === memory.time.stageId : p.kind === 'window' && memory.time.start >= p.start && memory.time.end <= p.end);
      if (period) { session.dispatch({ type: 'period', id: period.id }); session.dispatch({ type: 'select-memory', id: memory.id, placeId: id }); openPlace(id, { preserveSelection: true }); }
    });
    for (const b of target.querySelectorAll('[data-portal]')) b.addEventListener('click', () => {
      session.dispatch({ type: 'select-memory', id: b.dataset.memory, placeId: id });
      enterScene(b.dataset.portal);
    });
  } catch (error) { if (generation === queryGeneration) $('place-dialog').querySelector('.place-empty').textContent = '这段记忆暂时打不开，请稍后再试。'; }
}
async function enterScene(id) {
  if (loading) return;
  loading = true; notify('正在打开入口……');
  stage?.refresh?.();
  try {
    const scene = await portals.enter(id);
    if (!scene) return;
    sceneData = scene;
    for (const dialog of document.querySelectorAll('dialog[open]')) dialog.close();
    showScene(scene);
  } catch { notify('入口暂时打不开，原来的位置已保留。'); return; }
  finally { loading = false; refreshStage(); }
  notify();
}
function showScene(scene) {
  const element = $('scene');
  element.hidden = false;
  element.innerHTML = `<div class="scene-shell"><div class="scene-stage"><div class="courtyard ${scene.id === 'demo-room' ? 'room' : ''}" aria-label="${scene.id === 'demo-room' ? '屋内' : '院内'}"></div></div></div>`;
  lastRenderKey=''; render();
}
async function back() {
  cancelStreetLoad();
  portals.cancel();
  const state = portals.back();
  if (state.sceneId !== 'map') {
    const token = ++queryGeneration;
    try { const scene = await repository.loadScene(state.sceneId); if (token === queryGeneration && state.sceneId === session.get().sceneId) showScene(scene); } catch { notify('场景无法载入，可以继续返回。'); }
  } else {
    sceneData = null;
    lastRenderKey=''; render();
    if(state.view==='street'&&!stage)await enterStreet();
  }
}
function wireControls() {
  const closeMenu=closeMenuDialog;
  $('menu-button').addEventListener('click',()=>{lastRenderKey='';render();showDialog('menu-dialog');$('menu-button').setAttribute('aria-expanded','true');});
  $('menu-dialog').addEventListener('close',()=>{stage?.menuState?.(false);$('menu-button').setAttribute('aria-expanded','false');stage?.focus?.();});
  $('street-entry').addEventListener('click',async()=>{closeMenu();await enterStreet();});
  $('leave-street').addEventListener('click',()=>{closeMenu();cancelStreetLoad();stage?.clear();portals.cancel();loading=false;notify();session.dispatch({type:'view',view:'map'});});
  $('door-action').addEventListener('click',()=>{closeMenu();enterDoor();});
  $('scene-back').addEventListener('click',()=>{closeMenu();back();});
  $('scene-next').addEventListener('click',()=>{closeMenu();if(sceneData?.nextSceneId)enterScene(sceneData.nextSceneId);});
  $('period-button').addEventListener('click', () => showDialog('period-dialog'));
  $('uniform-toggle').addEventListener('click',()=>{const id=session.get().characterId==='child'?'youth':'child';session.dispatch({type:'character',id});closeMenu();stage?.focus?.();$('stage-canvas').querySelector('canvas')?.focus({preventScroll:true});});

  window.addEventListener('pagehide',event=>{saveSession(localStorage,session.get());cancelStreetLoad();if(event.persisted)stage?.suspend?.();else{stageSlot?.dispose();stage=null;repository.dispose();}});
  window.addEventListener('pageshow',event=>{if(event.persisted)refreshStage();});
  $('find-button').addEventListener('click', openDestinations);
  $('map-find-button').addEventListener('click', () => { renderPlaces(); showDialog('find-dialog'); $('place-search').focus(); });
  $('destination-search').addEventListener('input', event => renderDestinations(event.target.value));
  for (const button of document.querySelectorAll('[data-travel-mode]')) button.addEventListener('click', () => session.dispatch({ type: 'travel-mode', mode: button.dataset.travelMode }));
  $('help-button').addEventListener('click', () => showDialog('help-dialog'));
  $('options-button').addEventListener('click', () => showDialog('options-dialog'));
  $('simple-entry').addEventListener('change', event => {
    session.dispatch({ type: 'entry-transition', mode: event.target.checked ? 'simple' : 'journal' });
    saveSession(localStorage, session.get());
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden && startingStage) { cancelStreetLoad(); notify(); } });
  $('place-search').addEventListener('input', e => renderPlaces(e.target.value));

  for (const dialog of document.querySelectorAll('dialog')) {
    dialog.addEventListener('close',()=>stage?.refresh?.());
    dialog.querySelector('.close')?.addEventListener('click', () => { queryGeneration++; dialog.close(); });
    dialog.addEventListener('cancel', () => { queryGeneration++; portals.cancel(); loading = false; notify(); stage?.refresh?.(); });
    dialog.addEventListener('click', e => { const r = dialog.getBoundingClientRect(); if (e.target === dialog && (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom)) { dialog.close(); queryGeneration++; } });
  }
  const zoom = delta => { const camera=session.get().camera,stops=[1,1.8,2.7],next=delta>0?(stops.find(z=>z>camera.zoom+.01)||2.7):([...stops].reverse().find(z=>z<camera.zoom-.01)||1); session.dispatch({type:'camera',camera:{zoom:next,x:camera.x*next/camera.zoom,y:camera.y*next/camera.zoom}}); };
  $('zoom-in').addEventListener('click', () => zoom(1));
  $('zoom-out').addEventListener('click', () => zoom(-1));
  $('reset-view').addEventListener('click', () => session.dispatch({ type: 'camera', camera: { x: 0, y: 0, zoom: 1 } }));
  const viewport = $('map-viewport'); let drag = null;
  viewport.addEventListener('pointerdown', e => { if (e.target.closest('button') || e.button !== 0) return; mapDragged=false; drag = { id: e.pointerId, x: e.clientX, y: e.clientY, camera: session.get().camera }; viewport.setPointerCapture(e.pointerId); });
  viewport.addEventListener('pointermove', e => {
    if (!drag || drag.id !== e.pointerId) {
      const r=$('map-camera').getBoundingClientRect(),hit=mapping.nearestArt([(e.clientX-r.left)/r.width*1200,(e.clientY-r.top)/r.height*1200]),d=mapping.locate(hit.route).distance;
      viewport.style.cursor=hit.distance<28&&d>=STAGE.min&&d<=STAGE.max?'pointer':'grab';return;
    }
    if(Math.hypot(e.clientX-drag.x,e.clientY-drag.y)>6)mapDragged=true;
    const side = $('map-camera').clientWidth;
    session.dispatch({ type: 'camera', camera: { x: Math.max(-50*drag.camera.zoom, Math.min(50*drag.camera.zoom, drag.camera.x + (e.clientX - drag.x) / side * 100)), y: Math.max(-50*drag.camera.zoom, Math.min(50*drag.camera.zoom, drag.camera.y + (e.clientY - drag.y) / side * 100)) } });
  });
  viewport.addEventListener('pointerup', () => { drag = null; });
  viewport.addEventListener('pointercancel', () => { drag = null; });
  viewport.addEventListener('wheel', e => { if (e.ctrlKey || e.metaKey) return; e.preventDefault(); zoom(e.deltaY < 0 ? .12 : -.12); }, { passive: false });
  document.addEventListener('keydown', e => { if (e.key !== 'Escape') return; if(startingStage){cancelStreetLoad();notify();}const dialog = document.querySelector('dialog[open]'); if (dialog) { e.preventDefault(); e.stopImmediatePropagation(); dialog.close(); queryGeneration++; portals.cancel(); loading=false; notify(); } }, true);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { portals.cancel(); if (!document.querySelector('dialog[open]') && session.get().sceneId !== 'map') back(); } });
}
async function enterStreet({ destination = null } = {}) {
  const requestedKey=JSON.stringify([session.get().route,session.get().periodId,destination?.position]);
  if(startingStage){if(streetLoadKey===requestedKey)return;cancelStreetLoad();}
  streetLoadKey=requestedKey;
  mapDestination = null; mapKeys.clear();
  const d = mapping.locate(session.get().route).distance;
  if (d < STAGE.min || d > STAGE.max) { notify('这段街景还在绘制，请先点新华街院门附近的路。');if(session.get().view==='street')session.dispatch({type:'view',view:'map'});return; }
  const token=++streetLoadGeneration;
  const request=new AbortController();streetLoadController=request;
  const fromMap = session.get().view === 'map';
  let transition = null, entered = false, relocated = false;
  request.signal.addEventListener('abort', () => {
    transition?.cancel();
    // Dispatch even when still on the map: a newly mounted stage must enter its
    // bounded suspended slot if the drawing is cancelled before the reveal.
    if (fromMap && !relocated && session.get().sceneId === 'map') session.dispatch({ type: 'view', view: 'map' });
    if (fromMap && !document.hidden) $('menu-button').focus({ preventScroll: true });
  }, { once: true });
  startingStage = true; stage?.clear(); stage?.refresh(); notify(destination ? '正在换个地方……' : '正在走到街上……');
  try {
    const options = { container: $('app'), street: $('street-stage'), mode: session.get().entryTransition, signal: request.signal,
      onCancel: () => { cancelStreetLoad(); notify(); stage?.focus?.(); if (!stage) $('menu-button').focus(); } };
    transition = destination ? createTravelTransition({ ...options, label: destination.label }) : createEntryTransition(options);
    entryTransition = transition;
    const { createOutlineStage,createRetainedStageSlot } = await import('./outline-stage.js');
    if(token!==streetLoadGeneration)return;
    if(!stageSlot)stageSlot=createRetainedStageSlot({onEvict:previous=>{if(stage===previous){stage=null;lastRenderKey='';}}});
    if(stage&&!stage.compatible())discardStage();
    if (!stage) {
      const candidate = await createOutlineStage({container:$('stage-canvas'),session,mapping,repository,signal:request.signal,isCurrent:()=>token===streetLoadGeneration,blocked:()=>loading||startingStage||!!document.querySelector('dialog[open]'),onMenu:()=>showDialog('menu-dialog'),onTravel:destination=>enterStreet({destination})});
      if(!candidate||token!==streetLoadGeneration){candidate?.dispose();if(token===streetLoadGeneration)notify();return;}
      stageSlot.set(candidate);stage=candidate;
      destinationLandmarks=stage.landmarks;
      const origin=session.get().outline;
      $('stage-canvas').dataset.outlineRevision=origin.revision;
    }
    if (!await transition.prepared || token !== streetLoadGeneration) return;
    if (destination) {
      if (!stage.arrive(destination.position, destination.id)) throw Error('No nearby landing ground');
      relocated = true;
    }
    session.dispatch({ type: 'select-place', id: 'place-xinhua' });
    session.dispatch({ type: 'view', view: 'street' });
    refreshStage();
    if (!await transition.reveal(stage) || token !== streetLoadGeneration) return;
    entered = true;
    notify();
  } catch (error) { if(token!==streetLoadGeneration)return;console.error('Outline street load failed',error);discardStage();$('stage-canvas').replaceChildren();if(session.get().view==='street')session.dispatch({type:'view',view:'map'});notify('街景暂时打不开，手绘图上的位置已保留。'); }
  finally {
    transition?.cancel();
    if (entryTransition === transition) entryTransition = null;
    if(token===streetLoadGeneration){startingStage=false;streetLoadController=null;refreshStage();if(entered)stage?.focus?.();}
  }
}
async function enterDoor() {
  if ($('door-action').hidden) return;
  stage?.clear();
  session.dispatch({ type: 'select-memory', id: 'demo-current', placeId: 'place-xinhua' });
  await enterScene('demo-courtyard');
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
  mapContext = await repository.read(manifest.context);
  moduleAssets=Object.fromEntries(Object.entries(manifest.moduleAssets).map(([id,a])=>[id,{...a,url:assetURL(a)}]));
  const overviewRegistration=await repository.read(manifest.overviewRegistration);
  if(overviewRegistration.geometryRevision!==geometry.revision)throw new Error('地图暂时无法载入，请刷新重试。');
  overviewAssembly=createOverviewAssembly(composition.data,mapContext,overviewRegistration,transform,moduleAssets);
  const painted=overviewAssembly.painted;
 const mapAssetKeys=painted?[...new Set([painted.base.assetRef,painted.ground?.assetRef,...painted.compounds.flatMap(c=>c.assetRefsByLevel||[c.assetRef]),...painted.landmarks.map(l=>l.assetRef),...painted.frontages.map(f=>f.assetRef)].filter(Boolean))]:[];
  await Promise.allSettled(mapAssetKeys.map(id=>new Promise(resolve=>{const im=new Image();im.onload=()=>{availableMapAssets.add(id);resolve();};im.onerror=resolve;im.src=moduleAssets[id].url;})));
  let saved = restoreSession(localStorage, manifest);
  if(saved && saved.mapRevision!=='journal-r6'){saved.camera={x:0,y:0,zoom:1};saved.view='map';saved.sceneId='map';saved.returnStack=[];}
  if(saved)saved.mapRevision='journal-r6';
  if(saved){saved.layers={roads:true,buildings:true,frontages:true,person:true};saved.frontagePreview='none';}
  if (saved && !mapping.valid(saved.route)) saved.route = mappingData.spawn;
  if (saved && !manifest.assets.find(a => a.id === saved.styleId)?.selectable) saved.styleId = 'journal';
  session = createSession({...saved,mapRevision:'journal-r6'}, mapping);
  if (!saved) session.dispatch({ type: 'route', route: mappingData.spawn });
  portals = createPortalController(session, repository);
  session.subscribe(render);
  $('period-options').innerHTML = manifest.periods.map(p => `<button class="option-button" data-period="${p.id}" aria-pressed="false">${escape(p.label)}</button>`).join('');
  for (const b of document.querySelectorAll('[data-period]')) b.addEventListener('click', () => { session.dispatch({ type: 'period', id: b.dataset.period }); $('period-dialog').close(); });
  await document.fonts.load('23px "Fengtai Pen"','新华街三里丰台大桥');
  await document.fonts.ready;
  renderMarkers(); renderRoadLabels(transform); wireControls(); render();
  new ResizeObserver(()=>{lastRenderKey='';render();}).observe($('map-viewport'));
  $('walking-path').innerHTML = `<path d="M${mapping.data.nodes.map(n => n.art.join(',')).join(' L')}"/>`;
  globalThis.__VISUAL_READY__ = true;$('app').dataset.ready='true';
  $('map-viewport').addEventListener('click', async e => { if(mapDragged||e.target.closest('button')||session.get().view!=='map')return; const r=$('map-camera').getBoundingClientRect(),p=[(e.clientX-r.left)/r.width*1200,(e.clientY-r.top)/r.height*1200],hit=mapping.nearestArt(p); if(hit.distance<28){session.dispatch({type:'route',route:hit.route});const d=mapping.locate(hit.route).distance;if(d>=STAGE.min&&d<=STAGE.max)await enterStreet();} });
  $('map-art').addEventListener('error', () => notify('底图未载入，地点入口仍可使用。请刷新重试。'));
  // Read-only diagnostic hook: domain state remains owned by the application session.
  globalThis.digitalMemory = Object.freeze({ inspect: () => ({ session: session.get(), geometryRevision: geometry.revision, transformRevision: transform.revision, assets: manifest.assets.map(a => ({ id: a.id, revision: a.revision })), mappingRevision: mapping.data.id, position: mapping.locate(session.get().route), composition: composition.resolve(session.get().periodId,session.get().frontagePreview), stage: stage?.inspect() || null, entryTransition: entryTransition?.inspect() || null, dataCache:repository.inspect() }) });
}
start().catch(error => {
  const panel = document.createElement('div'); panel.className = 'error-screen';
  const text = document.createElement('p'); text.textContent = '暂时没能打开这张地图，请重新载入。';
  const button = document.createElement('button'); button.textContent = '重新载入'; button.onclick = () => location.reload();
  panel.append(text, button); $('app').append(panel);
});
