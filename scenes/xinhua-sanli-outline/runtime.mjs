import {makeStreetProps} from './street-props.mjs';
import * as T from '../xinhua-junction-outline/vendor/three/build/three.module.js';
import {makeDrawing} from './drawing.mjs';
import {makeNavigation,inside} from './navigation.mjs';
import {makeAvatar} from './avatar.mjs';
import {makeMotion} from './motion.mjs';
import {makeSiteDetails} from './site-details.mjs';
import {makeNavigationUI} from './navigation-ui.mjs';
import {createFrameLoop} from '../../src/engine/frame-loop.js';
import {createResourceScope} from '../../src/engine/resource-scope.js';

export async function mountOutline({container,sceneData,navigation,readState,writeState,isActive,isVisible,onMenu}){
 let disposed=false,suspended=false,windowFocused=true,externalMenu=false,entryProgress=null;
 const listeners=new AbortController();
 const listen=(element,type,fn,options={})=>element.addEventListener(type,fn,{...options,signal:listeners.signal});
 const host=document.createElement('div');host.className='outline-host';host.style.cssText='position:absolute;inset:0';container.append(host);
 const root=host.attachShadow({mode:'open'});
root.innerHTML=`<link rel="stylesheet" href="${new URL('./style.css',import.meta.url)}"><div id="outline-root"><main id="stage" aria-label="新华街可行走场景"><canvas id="scene" tabindex="0" aria-label="街道。点击地面行走，拖动转向，滚轮缩放。WASD或方向键移动，Shift快走。"></canvas></main><button id="menu" aria-label="打开菜单" aria-haspopup="dialog" aria-controls="panel" aria-expanded="false" title="打开菜单"><svg class="menu-mark" viewBox="0 0 64 64" aria-hidden="true" focusable="false"><path class="menu-paper" d="M16 11 Q29 7 44 12 Q53 17 51 30 L53 43 Q48 53 34 52 L20 54 Q9 49 11 37 L9 24 Q9 15 16 11Z"/><g class="menu-ink"><path d="M21 23 Q29 21 40 24 M20 32 Q31 34 42 31 M23 41 Q32 38 40 41"/><path class="menu-rays" d="M4 14 1 10 M28 4 28 1 M57 19 62 16 M57 48 62 51 M8 53 4 57"/></g></svg></button><dialog id="panel"><button id="close" aria-label="关闭菜单">×</button><h1>新华街 · 沿街走走</h1><p>点击地面行走，拖动转向。<br>WASD / 方向键移动，Shift 快走，滚轮缩放。</p><div id="destinations"><button data-go="court">走进南侧塔楼内院</button><button data-go="bins">走到门内大垃圾桶</button><button data-go="plaza">走到中庭小广场</button><button data-go="garden">走到中央绿地旁</button><button data-go="mid">走到中部板楼院路</button><button data-go="rear">走到后排楼间</button><button data-go="northCourt">走到北侧两塔之间</button><button data-go="eastCourt">走到丰台分院方向</button><button data-go="north">走到向阳街门</button><button data-go="east">走到新华街门</button><button data-go="south">走到新华街路口</button><button data-go="west">沿新华街向西走30米</button></div><button id="reset">回到起点</button></dialog><div id="notice" role="status" aria-live="polite"></div><div id="load" role="status">正在打开这段街道…</div></div>`;
root.querySelector('#menu').removeAttribute('aria-controls');
 const canvas=root.querySelector('#scene'),load=root.querySelector('#load'),panel=root.querySelector('#panel'),notice=root.querySelector('#notice');
 let renderer,world,camera,drawing,site,character,motion,navigationUI,observer,loop;
 let nav=navigation,completedFrames=0,updateMs=0,submissionMs=0,previousDiagnosticTime=null;
 const intervals=[];
 // The adapter owns a supplied navigation index; a standalone mount owns its own.
 function dispose(){
  if(disposed)return;
  disposed=true;
  const cleanups=[()=>loop?.dispose(),()=>listeners.abort(),()=>observer?.disconnect(),()=>navigationUI?.dispose(),
   ()=>drawing?.dispose(),()=>{
    if(!world)return;
    if(drawing?.releaseObject)drawing.releaseObject(world);
    else{const resources=createResourceScope();resources.trackObject(world);resources.dispose();}
   },()=>{if(!navigation)nav?.dispose?.();},()=>renderer?.dispose(),()=>renderer?.forceContextLoss(),()=>host.remove()];
  let failure;
  for(const cleanup of cleanups){try{cleanup();}catch(error){failure ||= error;}}
  if(failure)console.warn('Outline resource cleanup failed',failure);
 }
 try{
  const data=sceneData;
  renderer=new T.WebGLRenderer({canvas,antialias:true,alpha:false,preserveDrawingBuffer:true});renderer.setPixelRatio(Math.min(2,devicePixelRatio));renderer.setClearColor(0xfaf9f4);renderer.outputColorSpace=T.SRGBColorSpace;
  world=new T.Scene();world.background=new T.Color(0xfaf9f4);world.fog=new T.Fog(0xfaf9f4,78,165);camera=new T.PerspectiveCamera(50,1,.1,380);
  nav ||= makeNavigation(data);
  const start=nav.closest(data.spawn);if(!start)throw Error('No starting pavement');
  drawing=makeDrawing(world,data);site=makeSiteDetails(world,data,drawing);site.streetProps=makeStreetProps(world,data,drawing);
  const initial={position:[...start],yaw:Math.PI/6,distance:23,pitch:.68,path:[],walking:false,paused:false,visited:[],destination:null,elapsed:0,distanceWalked:0};
  const state={...initial,...readState()};
  const commit=()=>{if(!disposed)writeState(Object.fromEntries(['position','yaw','distance','pitch','path','visited','destination','distanceWalked'].map(k=>[k,structuredClone(state[k])])));};
  character=makeAvatar(world,drawing);const avatar=character.group;
  motion=makeMotion(world,data,drawing);const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
  navigationUI=makeNavigationUI(data,{host:root.querySelector('#outline-root'),storage:null});
  character.update(state,0);
  const keys=new Set(),raycaster=new T.Raycaster(),pointer=new T.Vector2(),plane=new T.Plane(new T.Vector3(0,1,0),0),hit=new T.Vector3();
  let down=null,noticeUntil=0,lastSave=0,lastDom=0,lastStrokeAuditRevision=-1;
  const goalMarker=new T.Group(),diamond=[[0,.07,-.22],[.22,.07,0],[0,.07,.22],[-.22,.07,0],[0,.07,-.22]];
  drawing.stroke(diamond,drawing.detailInk,goalMarker);world.add(goalMarker);goalMarker.visible=false;
  function say(text,seconds=2.5){notice.textContent=text;notice.classList.add('show');noticeUntil=performance.now()+seconds*1000;}
  function clearKeys(){
   keys.clear();state.walking=false;
   if(down){try{if(canvas.hasPointerCapture(down.id))canvas.releasePointerCapture(down.id);}catch{}down=null;}
  }
  function inputActive(){return entryProgress===null&&!disposed&&!suspended&&!document.hidden&&windowFocused&&!panel.open&&!externalMenu&&isActive();}
  function sync(){
   if(lastStrokeAuditRevision!==drawing.auditRevision){host.dataset.strokeAudit=JSON.stringify(drawing.audit);lastStrokeAuditRevision=drawing.auditRevision;}
   const sorted=intervals.slice().sort((a,b)=>a-b),p95=sorted.length?sorted[Math.min(sorted.length-1,Math.floor(sorted.length*.95))]:0;
   host.dataset.avatarProjection=JSON.stringify({foot:new T.Vector3(state.position[0],.1,state.position[1]).project(camera).toArray(),head:new T.Vector3(state.position[0],2.3,state.position[1]).project(camera).toArray(),camera:camera.position.toArray(),avatar:avatar.position.toArray(),visible:avatar.visible});
   const navigationStats=nav.stats?.()||{cachedCells:nav.cellCount};host.dataset.navigation=JSON.stringify(navigationStats);host.dataset.navCells=String(navigationStats.cachedCells);host.dataset.ready='true';host.dataset.position=state.position.map(v=>v.toFixed(2)).join(',');host.dataset.yaw=state.yaw.toFixed(3);host.dataset.walking=String(state.walking);host.dataset.visited=state.visited.join(',');host.dataset.destination=state.destination||'';host.dataset.paused=String(state.paused);host.dataset.distanceWalked=state.distanceWalked.toFixed(2);
   host.dataset.renderer=renderer.info.render.calls+','+renderer.info.memory.geometries;
   host.dataset.frameSerial=String(completedFrames);host.dataset.frameLoop=JSON.stringify(loop?.inspect()||{paused:true,scheduled:false});
   host.dataset.renderDiagnostics=JSON.stringify({completedFrames,frameIntervalP95Ms:p95,cpuUpdateMs:updateMs,cpuSubmissionMs:submissionMs,gpuMs:null,calls:renderer.info.render.calls,triangles:renderer.info.render.triangles,geometries:renderer.info.memory.geometries,textures:renderer.info.memory.textures,residency:drawing.residencyAudit||null});
   host.dataset.avatar=JSON.stringify(character.audit);host.dataset.motion=JSON.stringify(motion.audit);host.dataset.artRevision=data.artRevision;host.dataset.navigationUi=JSON.stringify(navigationUI.audit);host.dataset.site=JSON.stringify(site.audit);host.dataset.ink=JSON.stringify({...drawing.inkAudit,shopOpenings:drawing.openings.length,joinedDoors:drawing.openings.filter(o=>o.type==='door').length});
  }
  function refresh(){
   if(disposed)return false;
   const visible=Boolean(isVisible()),active=visible&&inputActive();
   const presenting=visible&&entryProgress!==null&&!disposed&&!suspended&&!document.hidden&&windowFocused&&!panel.open&&!externalMenu;
   host.hidden=!visible;state.paused=!active;
   const changed=loop?.setPaused(!(active||presenting));
   if(changed)sync();
   return active||presenting;
  }
  function setDestination(p,name=null){
   if(!inputActive())return false;
   const route=nav.route(state.position,p,9);if(!route){say('沿铺地换个方向走走');return false;}
   state.path=route;state.destination=name;goalMarker.position.set(route.at(-1)[0],0,route.at(-1)[1]);goalMarker.visible=true;commit();return true;
  }
  function clear(){if(disposed)return;Object.assign(state,readState());clearKeys();state.path=[];state.destination=null;goalMarker.visible=false;commit();}
  function focus(){if(inputActive())canvas.focus({preventScroll:true});}
  function openMenu(){clearKeys();if(onMenu)onMenu();else{root.querySelector('#menu').setAttribute('aria-expanded','true');panel.showModal();}refresh();}
  listen(root.querySelector('#menu'),'click',openMenu);
  listen(root.querySelector('#close'),'click',()=>panel.close());
  listen(panel,'close',()=>{root.querySelector('#menu').setAttribute('aria-expanded','false');clearKeys();refresh();focus();});
  listen(panel,'click',e=>{if(e.target===panel){const r=panel.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)panel.close();}});
  for(const button of root.querySelectorAll('[data-go]'))listen(button,'click',()=>{const goal=data.landmarks[button.dataset.go];panel.close();refresh();if(goal)setDestination(goal.position,goal.id);});
  listen(root.querySelector('#reset'),'click',()=>{state.position=[...start];state.path=[];state.destination=null;goalMarker.visible=false;state.yaw=Math.PI/6;state.distance=23;panel.close();commit();refresh();});
  listen(window,'keydown',e=>{
   if(!inputActive()||e.target.closest?.('input,textarea,select,[contenteditable=true]'))return;
   if(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright','shift'].includes(e.key.toLowerCase())){e.preventDefault();keys.add(e.key.toLowerCase());if(e.key!=='Shift'){state.path=[];state.destination=null;goalMarker.visible=false;commit();}}
   if(e.key==='Escape'){state.path=[];state.destination=null;goalMarker.visible=false;commit();}
  });
  listen(window,'keyup',e=>keys.delete(e.key.toLowerCase()));
  listen(window,'blur',()=>{windowFocused=false;clear();refresh();});
  listen(window,'focus',()=>{windowFocused=true;refresh();});
  listen(document,'visibilitychange',()=>{if(document.hidden)clear();refresh();});
  listen(canvas,'pointerdown',e=>{if(!inputActive()||e.button!==0)return;canvas.focus();canvas.setPointerCapture(e.pointerId);down={id:e.pointerId,x:e.clientX,y:e.clientY,lastX:e.clientX,lastY:e.clientY,moved:0};});
  listen(canvas,'pointermove',e=>{if(!inputActive()||!down||down.id!==e.pointerId)return;const dx=e.clientX-down.lastX,dy=e.clientY-down.lastY;down.moved+=Math.abs(dx)+Math.abs(dy);if(down.moved>6){state.yaw-=dx*.006;state.pitch=T.MathUtils.clamp(state.pitch+dy*.0025,.38,1.0);commit();}down.lastX=e.clientX;down.lastY=e.clientY;});
  listen(canvas,'pointerup',e=>{if(!inputActive()||!down||down.id!==e.pointerId)return;const click=down.moved<7;down=null;if(click){const r=canvas.getBoundingClientRect();pointer.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);raycaster.setFromCamera(pointer,camera);if(raycaster.ray.intersectPlane(plane,hit))setDestination([hit.x,hit.z]);}});
  listen(canvas,'pointercancel',()=>down=null);
  listen(canvas,'wheel',e=>{if(!inputActive())return;e.preventDefault();state.distance=T.MathUtils.clamp(state.distance+e.deltaY*.025,12,43);commit();},{passive:false});
  const size=new T.Vector2();
  function resize(){
   if(disposed)return;
   const {width:w,height:h}=host.getBoundingClientRect();if(!w||!h)return;
   renderer.getSize(size);if(size.x!==w||size.y!==h)renderer.setSize(w,h,false);
   camera.aspect=w/h;camera.updateProjectionMatrix();drawing.resize(w,h);motion.resize(w,h);navigationUI.resize();host.dataset.viewport=w+','+h;
  }
  observer=new ResizeObserver(resize);observer.observe(host);resize();
  function movement(dt){
   if(!inputActive()){state.walking=false;return;}
   let dx=0,dz=0;const forward=(keys.has('w')||keys.has('arrowup')?1:0)-(keys.has('s')||keys.has('arrowdown')?1:0),side=(keys.has('d')||keys.has('arrowright')?1:0)-(keys.has('a')||keys.has('arrowleft')?1:0);
   const old=[...state.position];
   if(forward||side){dx=-Math.sin(state.yaw)*forward+Math.cos(state.yaw)*side;dz=-Math.cos(state.yaw)*forward-Math.sin(state.yaw)*side;const l=Math.hypot(dx,dz),speed=keys.has('shift')?5.8:3.8;dx*=speed*dt/l;dz*=speed*dt/l;
    const p=[old[0]+dx,old[1]+dz];if(nav.walkable(p))state.position=p;else if(nav.walkable([old[0]+dx,old[1]]))state.position=[old[0]+dx,old[1]];else if(nav.walkable([old[0],old[1]+dz]))state.position=[old[0],old[1]+dz];
   }else if(state.path.length){let remaining=dt*4.8;while(remaining>0&&state.path.length){const target=state.path[0],v=[target[0]-state.position[0],target[1]-state.position[1]],l=Math.hypot(...v);if(l<=remaining){state.position=[...target];state.path.shift();remaining-=l;}else{state.position=[state.position[0]+v[0]/l*remaining,state.position[1]+v[1]/l*remaining];remaining=0;}}
    if(!state.path.length){goalMarker.visible=false;if(state.destination){const g=data.landmarks[state.destination];say(g.label);if(!state.visited.includes(g.id))state.visited.push(g.id);}state.destination=null;}
   }
   const travelled=Math.hypot(state.position[0]-old[0],state.position[1]-old[1]);state.distanceWalked+=travelled;state.walking=travelled>.0001;if(travelled>0)commit();
   for(const goal of Object.values(data.landmarks))if(Math.hypot(state.position[0]-goal.position[0],state.position[1]-goal.position[1])<1.8&&!state.visited.includes(goal.id)){state.visited.push(goal.id);say(goal.label);commit();}
  }
  function frame(now,dt){
   if(!refresh())return;
   const frameStarted=performance.now();
   if(previousDiagnosticTime!==null){intervals.push(Math.max(0,now-previousDiagnosticTime));if(intervals.length>120)intervals.shift();}previousDiagnosticTime=now;
   Object.assign(state,readState());if(entryProgress===null)state.elapsed+=dt;movement(dt);character.update(state,dt);avatar.visible=entryProgress===null||entryProgress>.86;
   const underBridge=data.bridges?.some(bridge=>bridge.deckRings.some(ring=>inside(state.position,ring))),narrow=camera.aspect<.8?1.2:1,d=state.distance*narrow,s=Math.sin(state.yaw),c=Math.cos(state.yaw),target=new T.Vector3(state.position[0]-s*3.5,.9,state.position[1]-c*3.5),desired=new T.Vector3(state.position[0]+s*d,underBridge?3.9:d*state.pitch,state.position[1]+c*d);
   const direction=desired.clone().sub(target),length=direction.length();raycaster.set(target,direction.normalize());raycaster.far=length;
   const candidates=drawing.collisionCandidates?drawing.collisionCandidates(target,desired):drawing.meshes;
   const hits=raycaster.intersectObjects(candidates,false);if(hits.length&&hits[0].distance<length-1)desired.copy(target).addScaledVector(direction,Math.max(5.2,hits[0].distance-1));
   if(entryProgress!==null){
    // Presentation-only camera: the session's valid street pose is never changed.
    desired.lerp(new T.Vector3(state.position[0]+s*9,88,state.position[1]+c*9),1-entryProgress);
    target.lerp(new T.Vector3(state.position[0],.9,state.position[1]),1-entryProgress);
    camera.position.copy(desired);
   }else camera.position.lerp(desired,1-Math.exp(-dt*9));
   camera.lookAt(target);camera.updateMatrixWorld();
   drawing.update(camera,state.elapsed,reducedMotion.matches||entryProgress!==null);site.update(camera);navigationUI.update(state,Math.atan2(camera.position.x-target.x,camera.position.z-target.z),now);motion.update(camera,state,reducedMotion.matches||entryProgress!==null);
   const submittedAt=performance.now();updateMs=submittedAt-frameStarted;
   renderer.render(world,camera);submissionMs=performance.now()-submittedAt;completedFrames++;
   host.dataset.frameSerial=String(completedFrames);
   if(now>noticeUntil)notice.classList.remove('show');if(now-lastSave>1800){commit();lastSave=now;}if(now-lastDom>180){sync();lastDom=now;}
  }
  loop=createFrameLoop(frame,{onPause:()=>{clearKeys();previousDiagnosticTime=null;},onResume:()=>{Object.assign(state,readState());resize();previousDiagnosticTime=null;lastSave=performance.now();}});
  camera.position.set(state.position[0]+Math.sin(state.yaw)*23,16,state.position[1]+Math.cos(state.yaw)*23);camera.lookAt(avatar.position);load.hidden=true;
  host.dataset.strokeAudit=JSON.stringify(drawing.audit);host.dataset.geometryRevision=data.revision;host.dataset.navCells=String(nav.stats?.().cachedCells??nav.cellCount);
  sync();refresh();
  return {
   refresh,focus,clear,dispose,
   setEntryView(progress){
    if(disposed)return;
    entryProgress=Number.isFinite(progress)?T.MathUtils.clamp(progress,0,1):null;
    root.querySelector('#outline-root').classList.toggle('entering',entryProgress!==null);
    host.dataset.entryProgress=entryProgress===null?'':String(entryProgress);
    clearKeys();refresh();
   },
   menuState(open){externalMenu=Boolean(open);root.querySelector('#menu').setAttribute('aria-expanded',String(open));refresh();},
   suspend(){if(disposed)return;suspended=true;refresh();},
   resume(){if(disposed)return;suspended=false;refresh();},
   go(id){const goal=data.landmarks[id];return Boolean(goal&&setDestination(goal.position,id));},
   inspect:()=>{if(!disposed)sync();return {...host.dataset,nearEntrance:false};}
  };
 }catch(error){dispose();throw error;}
}
