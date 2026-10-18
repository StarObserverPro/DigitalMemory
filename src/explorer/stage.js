import * as T from '../../assets/vendor/three/three.module.min.js';
import { STAGE } from '../domain/illustration.js';
import { CHARACTER_PROFILES } from '../domain/composition.js';

/** Short independent scenic flats. Session owns movement; composition owns all placement. */
export async function createStage({ container, session, mapping, transform, assets, composition, blocked, onNear, onError }) {
 const renderer=new T.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.outputColorSpace=T.SRGBColorSpace;
 const scene=new T.Scene();scene.background=new T.Color('#f0eadb');scene.fog=new T.Fog('#f0eadb',28,66);
 const camera=new T.PerspectiveCamera(63,1,.06,110);container.append(renderer.domElement);
 const canvas=renderer.domElement;canvas.tabIndex=0;canvas.setAttribute('aria-label','新华街人行道，方向键行走和转身');
 let clear=()=>{};canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();clear();globalThis.__VISUAL_READY__=false;onError('街景暂时中断，请返回手绘图后重新载入。');});
 const loader=new T.TextureLoader(),textures={},allMaterials=new Set(),allGeometries=new Set();
 // Wait for every load to settle so a failed load cannot leak a late texture.
 const loaded=await Promise.allSettled(Object.entries(assets).map(async([id,a])=>{const t=await loader.loadAsync(a.url);t.colorSpace=T.SRGBColorSpace;t.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());if(a.crop){const[x,y,w,h]=a.crop;t.repeat.set(w/a.width,h/a.height);t.offset.set(x/a.width,1-(y+h)/a.height);}textures[id]=t;}));
 if(loaded.some(r=>r.status==='rejected')){Object.values(textures).forEach(t=>t.dispose());renderer.dispose();canvas.remove();throw new Error('Scenery asset unavailable');}
 const roadGroup=new T.Group(),shellGroup=new T.Group(),frontGroup=new T.Group();scene.add(roadGroup,shellGroup,frontGroup);
 const mat=opts=>{const m=new T.MeshBasicMaterial({fog:true,...opts});allMaterials.add(m);return m;};
 const plane=(w,h)=>{const g=new T.PlaneGeometry(w,h);allGeometries.add(g);return g;};
 const cube=new T.BoxGeometry(1,1,1);allGeometries.add(cube);const colors=new Map();
 const basic=color=>{if(!colors.has(color))colors.set(color,mat({color}));return colors.get(color);};
 function box(group,x,y,z,w,h,d,color){const m=new T.Mesh(cube,basic(color));m.position.set(x,y,z);m.scale.set(w,h,d);group.add(m);return m;}
 const origin=transform.toWorld(mapping.locate(mapping.atDistance(STAGE.min)).geo),end=transform.toWorld(mapping.locate(mapping.atDistance(STAGE.max)).geo),angle=Math.atan2(end[1]-origin[1],end[0]-origin[0]);
 function frame(distance,lateral=0){const p=transform.toWorld(mapping.locate(mapping.atDistance(distance)).geo),q=transform.toWorld(mapping.locate(mapping.atDistance(distance+.05)).geo),theta=Math.atan2(q[1]-p[1],q[0]-p[0]),east=p[0]+Math.sin(theta)*lateral-origin[0],north=p[1]-Math.cos(theta)*lateral-origin[1];return{x:east*Math.sin(angle)-north*Math.cos(angle),z:-(east*Math.cos(angle)+north*Math.sin(angle)),yaw:theta-angle};}
 function strip(left,right,y,color){const v=[],idx=[];for(let s=STAGE.min-10;s<=STAGE.max+10;s+=2)for(const x of[left,right]){const p=frame(s,x);v.push(p.x,y,p.z);}for(let i=0;i<v.length/6-1;i++){const a=i*2;idx.push(a,a+1,a+2,a+1,a+3,a+2);}const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(v,3));g.setIndex(idx);g.computeVertexNormals();allGeometries.add(g);roadGroup.add(new T.Mesh(g,basic(color)));}
 strip(-40,40,-.04,'#e5dfce');strip(-4.1,4.1,0,'#b9b9ad');strip(4.1,10.8,.16,'#e4d8bf');strip(-12,-4.1,.16,'#e4d8bf');
 for(let d=350;d<510;d+=4)for(const side of[-1,1]){const p=frame(d,side*4.15),curb=box(roadGroup,p.x,.1,p.z,.14,.20,4.04,'#f5e8cb');curb.rotation.y=p.yaw;}
 for(let d=355;d<505;d+=12){const p=frame(d);box(roadGroup,p.x,.013,p.z,.1,.02,2.2,'#eee7d0').rotation.y=p.yaw;}
 for(let d=STAGE.min-10;d<=STAGE.max+10;d+=2.4){for(const side of[-1,1]){const a=frame(d,side*4.24),b=frame(d,side*10.4),v=new T.BufferGeometry().setFromPoints([new T.Vector3(a.x,.165,a.z),new T.Vector3(b.x,.165,b.z)]);allGeometries.add(v);const m=new T.LineBasicMaterial({color:'#c8bea8',transparent:true,opacity:.35});allMaterials.add(m);roadGroup.add(new T.Line(v,m));}}
 const apartmentMat=mat({map:textures.apartment,transparent:true,alphaTest:.67,side:T.DoubleSide});
 const shopMat=mat({map:textures.shop,transparent:true,alphaTest:.67,side:T.DoubleSide});
 function flat(group,d,lateral,w,h,material,y=.16){const p=frame(d,lateral),m=new T.Mesh(plane(w,h),material);m.position.set(p.x,y+h/2,p.z);m.rotation.y=p.yaw+(lateral>0?-Math.PI/2:Math.PI/2);group.add(m);return m;}
 const resolved=composition.resolve(session.get().periodId,session.get().frontagePreview);
 const shellMeshes=[];
 for(const b of resolved.buildings){const d=mapping.locate(b.route).distance,side=b.side==='north'?-1:1,lateral=side*b.setback;
  if(b.shellAsset==='apartment')flat(shellGroup,d,lateral,b.width,b.height,apartmentMat);
  else if(b.shellAsset==='service'){
    flat(shellGroup,d,lateral,b.width,b.height,mat({color:'#c9b79b',map:textures.paper,side:T.DoubleSide}));
    flat(shellGroup,d,lateral-side*.06,b.width+.2,.15,basic('#858877'),.16+b.height-.12);
  }else{
    // Independent simple gate, no invented courtyard roof. The slot defines its width and alignment.
    for(const x of[-1.9,1.9]){const p=frame(d+x,lateral);const pillar=box(shellGroup,p.x,1.5,p.z,.35,2.7,.35,'#c2b59e');pillar.rotation.y=p.yaw;}
  }
  if(b.shellAsset!=='entry')for(const offset of[-b.width/2,b.width/2]){
    const p=frame(d+offset,lateral+side*.55),wing=new T.Mesh(plane(1.1,b.height),basic(b.side==='north'?'#c8c3b3':'#baad94'));wing.position.set(p.x,.16+b.height/2,p.z);wing.rotation.y=p.yaw;shellGroup.add(wing);
  }
  if(b.shellAsset!=='entry')flat(shellGroup,d,lateral-side*.08,b.width,.16,basic('#9f9783'),.16);
  shellMeshes.push({id:b.id,side:b.side,distance:d,shellRevision:b.shellRevision,width:b.width,height:b.height});
 }
 // A subdued second row gives the gaps between foreground buildings depth.
 for(const d of [374,408,442,476])flat(shellGroup,d,-32,18,15,apartmentMat);
 const frontageMeshes=new Map();
 for(const slot of resolved.frontages){const b=composition.buildings.get(slot.buildingId),d=mapping.locate(b.route).distance+slot.offset,side=b.side==='north'?-1:1,lateral=side*(b.setback-.06);
  if(slot.type==='shop'){const mesh=flat(frontGroup,d,lateral,slot.width,slot.height,shopMat);frontageMeshes.set(slot.id,mesh);}
  else{flat(frontGroup,d,lateral,slot.width,slot.height,basic('#75867d'));for(let n=-5;n<=5;n++){const p=frame(d+n*.2,lateral-.04);box(frontGroup,p.x,1.32,p.z,.05,2.3,.05,'#b3bbae');}}
 }
 const entrance=resolved.entrances[0],doorDistance=mapping.locate(entrance.route).distance,doorBuilding=composition.buildings.get(composition.slots.get(entrance.slotId).buildingId);
 function label(text,bg='#eadfc6',ink='#475c51'){
  const c=document.createElement('canvas');c.width=640;c.height=128;const ctx=c.getContext('2d');ctx.fillStyle=bg;ctx.fillRect(0,0,640,128);ctx.strokeStyle=ink;ctx.lineWidth=4;ctx.strokeRect(5,5,630,118);ctx.font='400 42px "Memory CJK",sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle=ink;ctx.fillText(text,320,65,610);const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;const m=mat({map:t,side:T.DoubleSide});m.userData.ownedTexture=t;return m;
 }
 flat(frontGroup,doorDistance,doorBuilding.setback-.12,3,.55,label('院门'),2.6);
 const occupantLabels=new Map();let lastOccupancyKey='';
 function syncOccupants(state){
  const key=state.periodId+'|'+state.frontagePreview;if(key===lastOccupancyKey)return;lastOccupancyKey=key;
  for(const slot of composition.resolve(state.periodId,state.frontagePreview).frontages){
   let mesh=occupantLabels.get(slot.id);if(!slot.occupant){if(mesh)mesh.visible=false;continue;}
   const o=slot.occupant,b=composition.buildings.get(slot.buildingId),side=b.side==='north'?-1:1,d=mapping.locate(b.route).distance+slot.offset;
   if(mesh?.userData.occupantId!==o.id){
    const material=label(o.label,o.fixture==='repair'?'#965d43':'#426855','#fff3d9');
    if(mesh){mesh.material.userData.ownedTexture.dispose();allMaterials.delete(mesh.material);mesh.material.dispose();mesh.material=material;}
    else{mesh=flat(frontGroup,d,side*(b.setback-.15),slot.width*.94,.55,material,2.36);occupantLabels.set(slot.id,mesh);}
    mesh.userData.occupantId=o.id;
   }mesh.visible=true;
  }
 }
 // Upright cutout, not a screen-facing sprite tilted by the camera pitch.
 const person=new T.Mesh(plane(CHARACTER_PROFILES.child.width,CHARACTER_PROFILES.child.height),mat({map:textures.walker,transparent:true,alphaTest:.67,side:T.DoubleSide}));scene.add(person);
 const shadowGeometry=new T.CircleGeometry(.27,20);allGeometries.add(shadowGeometry);const shadow=new T.Mesh(shadowGeometry,mat({color:'#6c6250',transparent:true,opacity:.18,depthWrite:false}));shadow.rotation.x=-Math.PI/2;shadow.scale.y=.6;scene.add(shadow);
  const keys=new Set(),touch=new Set();let drag=null,last=0,near=false,disposed=false;const codes={KeyW:'forward',ArrowUp:'forward',KeyS:'back',ArrowDown:'back',KeyA:'left',ArrowLeft:'left',KeyD:'right',ArrowRight:'right'};
  clear=()=>{keys.clear();touch.clear();drag=null;};
  const active=()=>session.get().view==='street'&&session.get().sceneId==='map'&&!blocked();
  const down=e=>{if(!active()||e.target.closest('dialog,input,textarea'))return;if(codes[e.code]){e.preventDefault();keys.add(codes[e.code]);}};
  const up=e=>{if(codes[e.code])keys.delete(codes[e.code]);};window.addEventListener('keydown',down);window.addEventListener('keyup',up);window.addEventListener('blur',clear);document.addEventListener('visibilitychange',clear);
  for(const b of document.querySelectorAll('[data-walk]')){b.addEventListener('pointerdown',e=>{if(!active())return;e.preventDefault();b.setPointerCapture(e.pointerId);touch.add(b.dataset.walk);b.classList.add('pressed');});for(const type of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(type,()=>{touch.delete(b.dataset.walk);b.classList.remove('pressed');});}
  canvas.addEventListener('pointerdown',e=>{if(e.button===0&&active()){drag={id:e.pointerId,x:e.clientX,startY:e.clientY,walk:0};canvas.setPointerCapture(e.pointerId);}});canvas.addEventListener('pointermove',e=>{if(!drag||!active())return;const delta=e.clientX-drag.x;drag.x=e.clientX;drag.walk=Math.abs(e.clientY-drag.startY)>28?Math.sign(drag.startY-e.clientY):0;session.dispatch({type:'street-heading',heading:session.get().street.heading+delta*.005});});for(const type of ['pointerup','pointercancel'])canvas.addEventListener(type,()=>drag=null);
  function resize(){const r=container.getBoundingClientRect();if(!r.width||!r.height)return;renderer.setSize(r.width,r.height,false);camera.aspect=r.width/r.height;camera.updateProjectionMatrix();}const observer=new ResizeObserver(resize);observer.observe(container);resize();
 const gl=renderer.getContext(),ext=gl.getExtension('WEBGL_debug_renderer_info'),diagnostics={webgl2:gl instanceof WebGL2RenderingContext,version:gl.getParameter(gl.VERSION),renderer:ext?gl.getParameter(ext.UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER)};
 renderer.setAnimationLoop(time=>{if(disposed)return;const dt=Math.min((time-last)/1000,.05);last=time;let moving=false;
  if(active()){const has=k=>keys.has(k)||touch.has(k),input={forward:Math.max(-1,Math.min(1,Number(has('forward'))-Number(has('back'))+(drag?.walk||0))),turn:Number(has('right'))-Number(has('left'))};moving=!!input.forward;if(input.forward||input.turn)session.dispatch({type:'walk',input,dt});}else clear();
  const state=session.get(),d=mapping.locate(state.route).distance,p=frame(d,state.street.lateral),heading=state.street.heading-p.yaw,profile=CHARACTER_PROFILES[state.characterId]||CHARACTER_PROFILES.child;
  roadGroup.visible=state.layers.roads;shellGroup.visible=state.layers.buildings;frontGroup.visible=state.layers.buildings&&state.layers.frontages;person.visible=shadow.visible=state.layers.person;
  syncOccupants(state);
  // Feet remain on the pavement; the near camera deliberately crops below the torso.
  person.scale.set(profile.width/CHARACTER_PROFILES.child.width,profile.height/CHARACTER_PROFILES.child.height,1);
  person.position.set(p.x,.17+profile.height/2,p.z);person.rotation.set(0,-heading,0);shadow.position.set(p.x,.168,p.z);
  const dx=Math.sin(heading),dz=-Math.cos(heading),follow=camera.aspect<.8?1.65:1.0;
  const eye=profile.eye+(camera.aspect<.8?.39:.03);
  camera.position.set(p.x-dx*follow,eye,p.z-dz*follow);
  camera.lookAt(camera.position.x+dx*10,eye+.25,camera.position.z+dz*10);
  const nowNear=Math.hypot(d-doorDistance,state.street.lateral-doorBuilding.setback)<3.5;if(nowNear!==near){near=nowNear;onNear(near);}
  if(state.view==='street'&&state.sceneId==='map'){renderer.render(scene,camera);globalThis.__VISUAL_READY__=true;}
  camera.updateMatrixWorld();const right=new T.Vector3().setFromMatrixColumn(camera.matrixWorld,0),lower=new T.Vector3(p.x,.17,p.z),upper=lower.clone().add(new T.Vector3(0,profile.height,0));
  const avatarNdc={left:lower.clone().addScaledVector(right,-profile.width/2).project(camera).x,right:lower.clone().addScaledVector(right,profile.width/2).project(camera).x,bottom:lower.clone().project(camera).y,top:upper.clone().project(camera).y};
  globalThis.__QA_STATE__={avatarNdc,revision:STAGE.revision,route:state.route,geo:mapping.locate(state.route).geo,street:state.street,feet:lower.toArray(),camera:camera.position.toArray(),characterHeight:profile.height,doorDistance,nearEntrance:near,renderer:diagnostics,drawCalls:renderer.info.render.calls,modules:shellMeshes,preview:state.frontagePreview,occupiedSlots:[...occupantLabels].filter(([,m])=>m.visible).map(([id,m])=>({id,occupantId:m.userData.occupantId})),layers:state.layers};
 });
 return{clear,inspect:()=>structuredClone(globalThis.__QA_STATE__),dispose(){disposed=true;renderer.setAnimationLoop(null);observer.disconnect();window.removeEventListener('keydown',down);window.removeEventListener('keyup',up);window.removeEventListener('blur',clear);document.removeEventListener('visibilitychange',clear);Object.values(textures).forEach(t=>t.dispose());allGeometries.forEach(g=>g.dispose());allMaterials.forEach(m=>{m.userData.ownedTexture?.dispose();m.dispose();});renderer.dispose();canvas.remove();}};
}
