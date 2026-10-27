import {makeStreetProps} from './street-props.mjs';
import * as T from '../xinhua-junction-outline/vendor/three/build/three.module.js';import {makeDrawing} from './drawing.mjs';import {makeNavigation,inside} from './navigation.mjs';
import {makeAvatar} from './avatar.mjs';import {makeMotion} from './motion.mjs';
import {makeSiteDetails} from './site-details.mjs';
import {makeNavigationUI} from './navigation-ui.mjs';
export async function mountOutline({container,sceneData,readState,writeState,isActive,isVisible,onMenu}){
let disposed=false,raf=0;const controller=new AbortController();
const listen=(el,type,fn,options={})=>el.addEventListener(type,fn,{...options,signal:controller.signal});
const host=document.createElement('div');host.className='outline-host';host.style.cssText='position:absolute;inset:0';container.append(host);
const root=host.attachShadow({mode:'open'});
root.innerHTML=`<link rel="stylesheet" href="${new URL('./style.css',import.meta.url)}"><div id="outline-root"><main id="stage" aria-label="新华街可行走场景"><canvas id="scene" tabindex="0" aria-label="街道。点击地面行走，拖动转向，滚轮缩放。WASD或方向键移动，Shift快走。"></canvas></main><button id="menu" aria-label="打开菜单" aria-haspopup="dialog" aria-controls="panel" aria-expanded="false" title="打开菜单"><svg class="menu-mark" viewBox="0 0 64 64" aria-hidden="true" focusable="false"><path class="menu-paper" d="M16 11 Q29 7 44 12 Q53 17 51 30 L53 43 Q48 53 34 52 L20 54 Q9 49 11 37 L9 24 Q9 15 16 11Z"/><g class="menu-ink"><path d="M21 23 Q29 21 40 24 M20 32 Q31 34 42 31 M23 41 Q32 38 40 41"/><path class="menu-rays" d="M4 14 1 10 M28 4 28 1 M57 19 62 16 M57 48 62 51 M8 53 4 57"/></g></svg></button><dialog id="panel"><button id="close" aria-label="关闭菜单">×</button><h1>新华街 · 沿街走走</h1><p>点击地面行走，拖动转向。<br>WASD / 方向键移动，Shift 快走，滚轮缩放。</p><div id="destinations"><button data-go="court">走进南侧塔楼内院</button><button data-go="bins">走到门内大垃圾桶</button><button data-go="plaza">走到中庭小广场</button><button data-go="garden">走到中央绿地旁</button><button data-go="mid">走到中部板楼院路</button><button data-go="rear">走到后排楼间</button><button data-go="northCourt">走到北侧两塔之间</button><button data-go="eastCourt">走到丰台分院方向</button><button data-go="north">走到向阳街门</button><button data-go="east">走到新华街门</button><button data-go="south">走到新华街路口</button><button data-go="west">沿新华街向西走30米</button></div><button id="reset">回到起点</button></dialog><div id="notice" role="status" aria-live="polite"></div><div id="load" role="status">正在打开这段街道…</div></div>`;
root.querySelector('#menu').removeAttribute('aria-controls');
const canvas=root.querySelector('#scene'),load=root.querySelector('#load'),panel=root.querySelector('#panel'),notice=root.querySelector('#notice');
let data,renderer,world,camera,nav,drawing,site;
try{
 data=sceneData;
 renderer=new T.WebGLRenderer({canvas,antialias:true,alpha:false,preserveDrawingBuffer:true});renderer.setPixelRatio(Math.min(2,devicePixelRatio));renderer.setClearColor(0xfaf9f4);renderer.outputColorSpace=T.SRGBColorSpace;
 world=new T.Scene();world.background=new T.Color(0xfaf9f4);world.fog=new T.Fog(0xfaf9f4,78,165);camera=new T.PerspectiveCamera(50,1,.1,380);
 drawing=makeDrawing(world,data);site=makeSiteDetails(world,data,drawing);site.streetProps=makeStreetProps(world,data,drawing);nav=makeNavigation(data);
}catch(e){renderer?.dispose();host.remove();load.textContent='街道暂时没能打开。刷新后再试。';host.dataset.error=e.message;throw e;}
const start=nav.closest(data.spawn);if(!start)throw Error('No starting pavement');
const initial={position:[...start],yaw:Math.PI/6,distance:23,pitch:.68,path:[],walking:false,paused:false,visited:[],destination:null,elapsed:0,distanceWalked:0};
const state={...initial,...readState()};
const commit=()=>writeState(Object.fromEntries(['position','yaw','distance','pitch','path','visited','destination','distanceWalked'].map(k=>[k,structuredClone(state[k])])));
const character=makeAvatar(world,drawing),avatar=character.group,motion=makeMotion(world,data,drawing),reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
const navigationUI=makeNavigationUI(data,{host:root.querySelector('#outline-root'),storage:null});
character.update(state,0);
const keys=new Set(),raycaster=new T.Raycaster(),pointer=new T.Vector2(),plane=new T.Plane(new T.Vector3(0,1,0),0),hit=new T.Vector3();let down=null,noticeUntil=0,last=performance.now(),lastSave=0,lastDom=0;
const goalMarker=new T.Group();const diamond=[[0,.07,-.22],[.22,.07,0],[0,.07,.22],[-.22,.07,0],[0,.07,-.22]];drawing.stroke(diamond,drawing.detailInk,goalMarker);world.add(goalMarker);goalMarker.visible=false;
function say(text,seconds=2.5){notice.textContent=text;notice.classList.add('show');noticeUntil=performance.now()+seconds*1000;}
function clearKeys(){keys.clear();state.walking=false;}
function setDestination(p,name=null){const route=nav.route(state.position,p,9);if(!route){say('沿铺地换个方向走走');return false;}state.path=route;state.destination=name;goalMarker.position.set(route.at(-1)[0],0,route.at(-1)[1]);goalMarker.visible=true;commit();return true;}
function save(){commit();}
function sync(){host.dataset.avatarProjection=JSON.stringify({foot:new T.Vector3(...[state.position[0],.1,state.position[1]]).project(camera).toArray(),head:new T.Vector3(state.position[0],2.3,state.position[1]).project(camera).toArray(),camera:camera.position.toArray(),avatar:avatar.position.toArray(),visible:avatar.visible});host.dataset.ready='true';host.dataset.position=state.position.map(v=>v.toFixed(2)).join(',');host.dataset.yaw=state.yaw.toFixed(3);host.dataset.walking=String(state.walking);host.dataset.visited=state.visited.join(',');host.dataset.destination=state.destination||'';host.dataset.paused=String(state.paused);host.dataset.distanceWalked=state.distanceWalked.toFixed(2);host.dataset.renderer=renderer.info.render.calls+','+renderer.info.memory.geometries;host.dataset.avatar=JSON.stringify(character.audit);host.dataset.motion=JSON.stringify(motion.audit);host.dataset.artRevision=data.artRevision;host.dataset.navigationUi=JSON.stringify(navigationUI.audit);host.dataset.site=JSON.stringify(site.audit);host.dataset.ink=JSON.stringify({...drawing.inkAudit,shopOpenings:drawing.openings.length,joinedDoors:drawing.openings.filter(o=>o.type==='door').length});}
function openMenu(){clearKeys();if(onMenu){onMenu();return;}state.paused=true;root.querySelector('#menu').setAttribute('aria-expanded','true');panel.showModal();}
listen(root.querySelector('#menu'),'click',openMenu);listen(root.querySelector('#close'),'click',()=>panel.close());listen(panel,'close',()=>{root.querySelector('#menu').setAttribute('aria-expanded','false');state.paused=false;clearKeys();canvas.focus();});listen(panel,'click',e=>{if(e.target===panel){const r=panel.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)panel.close();}});
for(const b of root.querySelectorAll('[data-go]'))listen(b,'click',()=>{const g=data.landmarks[b.dataset.go];panel.close();setDestination(g.position,g.id);});
listen(root.querySelector('#reset'),'click',()=>{state.position=[...start];state.path=[];state.destination=null;goalMarker.visible=false;state.yaw=Math.PI/6;state.distance=23;panel.close();save();});
listen(window,'keydown',e=>{if(panel.open||!isActive()||e.target.closest?.('input,textarea,select,[contenteditable=true]'))return;if(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright','shift'].includes(e.key.toLowerCase())){e.preventDefault();keys.add(e.key.toLowerCase());if(e.key!=='Shift'){state.path=[];state.destination=null;goalMarker.visible=false;commit();}}if(e.key==='Escape'){state.path=[];state.destination=null;goalMarker.visible=false;commit();}});
listen(window,'keyup',e=>keys.delete(e.key.toLowerCase()));const suspend=()=>{clearKeys();state.path=[];state.destination=null;goalMarker.visible=false;commit();};listen(window,'blur',suspend);listen(document,'visibilitychange',()=>{if(document.hidden)suspend();});
listen(canvas,'pointerdown',e=>{canvas.focus();canvas.setPointerCapture(e.pointerId);down={id:e.pointerId,x:e.clientX,y:e.clientY,lastX:e.clientX,lastY:e.clientY,moved:0};});
listen(canvas,'pointermove',e=>{if(!down||down.id!==e.pointerId)return;const dx=e.clientX-down.lastX,dy=e.clientY-down.lastY;down.moved+=Math.abs(dx)+Math.abs(dy);if(down.moved>6){state.yaw-=dx*.006;state.pitch=T.MathUtils.clamp(state.pitch+dy*.0025,.38,1.0);commit();}down.lastX=e.clientX;down.lastY=e.clientY;});
listen(canvas,'pointerup',e=>{if(!down)return;const click=down.moved<7;down=null;if(click&&!panel.open){const r=canvas.getBoundingClientRect();pointer.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);raycaster.setFromCamera(pointer,camera);if(raycaster.ray.intersectPlane(plane,hit))setDestination([hit.x,hit.z]);}});
listen(canvas,'pointercancel',()=>down=null);listen(canvas,'wheel',e=>{e.preventDefault();state.distance=T.MathUtils.clamp(state.distance+e.deltaY*.025,12,43);commit();},{passive:false});
function resize(){const {width:w,height:h}=host.getBoundingClientRect();if(!w||!h)return;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();drawing.resize(w,h);motion.resize(w,h);navigationUI.resize();host.dataset.viewport=w+','+h;}
const observer=new ResizeObserver(resize);observer.observe(host);resize();
function movement(dt){
 if(state.paused||document.hidden||!isActive()){state.walking=false;return;}
 let dx=0,dz=0;const forward=(keys.has('w')||keys.has('arrowup')?1:0)-(keys.has('s')||keys.has('arrowdown')?1:0),side=(keys.has('d')||keys.has('arrowright')?1:0)-(keys.has('a')||keys.has('arrowleft')?1:0);
 const old=[...state.position];
 if(forward||side){dx=-Math.sin(state.yaw)*forward+Math.cos(state.yaw)*side;dz=-Math.cos(state.yaw)*forward-Math.sin(state.yaw)*side;const l=Math.hypot(dx,dz),speed=keys.has('shift')?5.8:3.8;dx*=speed*dt/l;dz*=speed*dt/l;
  const p=[old[0]+dx,old[1]+dz];if(nav.walkable(p))state.position=p;else if(nav.walkable([old[0]+dx,old[1]]))state.position=[old[0]+dx,old[1]];else if(nav.walkable([old[0],old[1]+dz]))state.position=[old[0],old[1]+dz];
 }else if(state.path.length){let remaining=dt*4.8;while(remaining>0&&state.path.length){const target=state.path[0],v=[target[0]-state.position[0],target[1]-state.position[1]],l=Math.hypot(...v);if(l<=remaining){state.position=[...target];state.path.shift();remaining-=l;}else{state.position=[state.position[0]+v[0]/l*remaining,state.position[1]+v[1]/l*remaining];remaining=0;}}
  if(!state.path.length){goalMarker.visible=false;if(state.destination){const g=data.landmarks[state.destination];say(g.label);if(!state.visited.includes(g.id))state.visited.push(g.id);}state.destination=null;}
 }
 const travelled=Math.hypot(state.position[0]-old[0],state.position[1]-old[1]);state.distanceWalked+=travelled;state.walking=travelled>.0001;if(travelled>0)commit();
 for(const g of Object.values(data.landmarks))if(Math.hypot(state.position[0]-g.position[0],state.position[1]-g.position[1])<1.8&&!state.visited.includes(g.id)){state.visited.push(g.id);say(g.label);commit();}
}
function frame(now){if(disposed)return;const dt=Math.max(0,Math.min(.045,(now-last)/1000));last=now;const active=isActive()&&!document.hidden;host.hidden=!isVisible();if(!active){clearKeys();if(isVisible())sync();raf=requestAnimationFrame(frame);return;}Object.assign(state,readState());const animationDt=state.paused||document.hidden?0:dt;state.elapsed+=animationDt;movement(dt);character.update(state,animationDt);
 const underBridge=data.bridges?.some(b=>b.deckRings.some(r=>inside(state.position,r))),narrow=camera.aspect<.8?1.2:1,d=state.distance*narrow,s=Math.sin(state.yaw),c=Math.cos(state.yaw),target=new T.Vector3(state.position[0]-s*3.5,.9,state.position[1]-c*3.5),desired=new T.Vector3(state.position[0]+s*d,underBridge?3.9:d*state.pitch,state.position[1]+c*d);
 const direction=desired.clone().sub(target),length=direction.length();raycaster.set(target,direction.normalize());raycaster.far=length;const hits=raycaster.intersectObjects(drawing.meshes,false);if(hits.length&&hits[0].distance<length-1)desired.copy(target).addScaledVector(direction,Math.max(5.2,hits[0].distance-1));
 camera.position.lerp(desired,1-Math.exp(-dt*9));camera.lookAt(target);camera.updateMatrixWorld();drawing.update(camera,state.elapsed,reducedMotion.matches);site.update(camera);navigationUI.update(state,Math.atan2(camera.position.x-target.x,camera.position.z-target.z),now);motion.update(camera,state,reducedMotion.matches);renderer.render(world,camera);
 if(now>noticeUntil)notice.classList.remove('show');if(now-lastSave>1800){save();lastSave=now;}if(now-lastDom>180){sync();lastDom=now;}raf=requestAnimationFrame(frame);
}
camera.position.set(state.position[0]+Math.sin(state.yaw)*23,16,state.position[1]+Math.cos(state.yaw)*23);camera.lookAt(avatar.position);load.hidden=true;sync();raf=requestAnimationFrame(frame);
// Read-only evidence surface is DOM-backed; no mutation/debug controls are exposed.
host.dataset.strokeAudit=JSON.stringify(drawing.audit);host.dataset.geometryRevision=data.revision;host.dataset.navCells=String(nav.cellCount);canvas.focus();

return {menuState:open=>root.querySelector('#menu').setAttribute('aria-expanded',String(open)),focus:()=>canvas.focus({preventScroll:true}),go:id=>{const g=data.landmarks[id];return g&&setDestination(g.position,id);},clear(){clearKeys();state.path=[];state.destination=null;goalMarker.visible=false;commit();},inspect:()=>({...host.dataset,nearEntrance:false}),dispose(){disposed=true;cancelAnimationFrame(raf);controller.abort();observer.disconnect();navigationUI.dispose();world.traverse(o=>{o.geometry?.dispose();for(const m of Array.isArray(o.material)?o.material:[o.material])m?.dispose();});renderer.dispose();host.remove();}};
}
