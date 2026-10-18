import * as T from '../../assets/vendor/three/three.module.min.js';
import { STAGE } from '../domain/illustration.js';

/** Painted upright scenery, selective ground geometry, one session-owned pedestrian. */
export async function createStage({ container, session, mapping, transform, assets, blocked, onNear, onError }) {
  const renderer=new T.WebGLRenderer({antialias:true,alpha:false});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.outputColorSpace=T.SRGBColorSpace;
  const scene=new T.Scene();scene.background=new T.Color('#eee8d7');scene.fog=new T.Fog('#eee8d7',15,43);
  const camera=new T.PerspectiveCamera(57,1,.08,95);container.append(renderer.domElement);
  const canvas=renderer.domElement;canvas.tabIndex=0;canvas.setAttribute('aria-label','新华街人行道，方向键行走和转身');
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();clear();globalThis.__VISUAL_READY__=false;onError('街景暂时中断，请返回手绘图后重新载入。');});
  const loader=new T.TextureLoader();
  let flats,walker;
  try { [flats,walker]=await Promise.all([loader.loadAsync(assets.flats),loader.loadAsync(assets.walker)]); } catch(error) { renderer.dispose();canvas.remove();throw error; }
  for(const texture of [flats,walker]){texture.colorSpace=T.SRGBColorSpace;texture.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());}
  const origin=transform.toWorld(mapping.locate(mapping.atDistance(360)).geo);
  const end=transform.toWorld(mapping.locate(mapping.atDistance(500)).geo);
  const angle=Math.atan2(end[1]-origin[1],end[0]-origin[0]);
  function frame(distance,lateral=0){const route=mapping.atDistance(distance),p=transform.toWorld(mapping.locate(route).geo),q=transform.toWorld(mapping.locate(mapping.atDistance(distance+.05)).geo);const theta=Math.atan2(q[1]-p[1],q[0]-p[0]);const east=p[0]+Math.sin(theta)*lateral-origin[0],north=p[1]-Math.cos(theta)*lateral-origin[1];return{x:east*Math.sin(angle)-north*Math.cos(angle),z:-(east*Math.cos(angle)+north*Math.sin(angle)),yaw:theta-angle};}
  const basic=color=>new T.MeshBasicMaterial({color,fog:true});
  const sharedCube=new T.BoxGeometry(1,1,1),materials=new Map();
  function box(x,y,z,w,h,d,color){if(!materials.has(color))materials.set(color,basic(color));const mesh=new T.Mesh(sharedCube,materials.get(color));mesh.position.set(x,y,z);mesh.scale.set(w,h,d);scene.add(mesh);return mesh;}
  function strip(left,right,y,color){const v=[],indices=[];for(let s=STAGE.min-10;s<=STAGE.max+10;s+=2){for(const x of [left,right]){const p=frame(s,x);v.push(p.x,y,p.z);}}for(let i=0;i<v.length/6-1;i++){const a=i*2;indices.push(a,a+1,a+2,a+1,a+3,a+2);}const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(v,3));geo.setIndex(indices);geo.computeVertexNormals();const mesh=new T.Mesh(geo,basic(color));scene.add(mesh);}
  strip(-30,30,-.05,'#e6ddc7');strip(-4.1,4.1,0,'#b5b5a7');strip(4.1,7.7,.16,'#e0d2b4');strip(-7.7,-4.1,.16,'#e0d2b4');
  for(let s=350;s<510;s+=2){const p=frame(s);const curb=box(p.x+4.13,.08,p.z,.16,.16,2.04,'#f4e5c7');curb.rotation.y=p.yaw;const seam=box(p.x+5.9,.165,p.z,3.5,.008,.025,'#b8aa8f');seam.rotation.y=p.yaw;}
  for(let s=354;s<508;s+=10){const p=frame(s);const stripe=box(p.x,.012,p.z,.10,.01,2.3,'#e9ddbd');stripe.rotation.y=p.yaw;}
  const flatMaterial=new T.MeshBasicMaterial({map:flats,transparent:true,alphaTest:.35,side:T.DoubleSide,fog:true,depthWrite:true});
  const portal=mapping.data.portals[0],doorDistance=mapping.locate(portal).distance;
  // On right-side panels texture u=.36 is the courtyard gate; align its feet to portal.
  const gateU=.36,flatWidth=18,flatHeight=flatWidth*727/2164;
  const panelOrigin=doorDistance+(gateU-.5)*flatWidth;
  for(const side of [-1,1])for(let i=-5;i<=5;i++){
    const distance=panelOrigin+i*flatWidth+(side===-1?7:0);if(distance<350||distance>510)continue;
    const p=frame(distance,side*7.65),mesh=new T.Mesh(new T.PlaneGeometry(flatWidth,flatHeight),flatMaterial);
    mesh.position.set(p.x,.16+flatHeight/2-.055,p.z);mesh.rotation.y=p.yaw+(side===1?-Math.PI/2:Math.PI/2);scene.add(mesh);
    // A very shallow perpendicular return sells a film flat, without modeling a building.
    if(i%2===0){const wing=new T.Mesh(new T.PlaneGeometry(.8,flatHeight*.68),basic('#d5c8b0'));wing.position.set(p.x+side*.38,flatHeight*.34+.16,p.z+flatWidth/2);wing.rotation.y=p.yaw;scene.add(wing);}
  }
  const person=new T.Sprite(new T.SpriteMaterial({map:walker,transparent:true,alphaTest:.6,depthWrite:true,fog:true}));person.scale.set(1.22,1.83,1);person.center.set(.5,.033);scene.add(person);
  const shadow=new T.Mesh(new T.CircleGeometry(.34,24),new T.MeshBasicMaterial({color:'#6c6250',transparent:true,opacity:.20,depthWrite:false}));shadow.rotation.x=-Math.PI/2;shadow.scale.y=.65;scene.add(shadow);
  function label(text,bg='#eadbbd',ink='#475c51'){
    const c=document.createElement('canvas');c.width=640;c.height=128;const ctx=c.getContext('2d');ctx.fillStyle=bg;ctx.fillRect(0,0,640,128);ctx.strokeStyle=ink;ctx.lineWidth=5;ctx.strokeRect(6,6,628,116);ctx.font='400 43px "Memory CJK", sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle=ink;ctx.fillText(text,320,66,605);const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;return new T.MeshBasicMaterial({map:tex,transparent:true,side:T.DoubleSide,fog:true});
  }
  const gate=frame(doorDistance,7.50),plaque=new T.Mesh(new T.PlaneGeometry(1.65,.33),label('院门 · 交互样例'));
  plaque.position.set(gate.x,2.5,gate.z);plaque.rotation.y=gate.yaw-Math.PI/2;scene.add(plaque);
  for(const [d,text]of [[STAGE.min+3,'← 回到手绘图'],[STAGE.max-3,'前方街景待绘 →']]){const p=frame(d,5.8);const sign=new T.Mesh(new T.PlaneGeometry(2.9,.58),label(text));sign.position.set(p.x,1.5,p.z);scene.add(sign);box(p.x,.65,p.z,.07,1.3,.07,'#847d66');}
  const keys=new Set(),touch=new Set();let drag=null,last=0,near=false,disposed=false;const codes={KeyW:'forward',ArrowUp:'forward',KeyS:'back',ArrowDown:'back',KeyA:'left',ArrowLeft:'left',KeyD:'right',ArrowRight:'right'};
  const clear=()=>{keys.clear();touch.clear();drag=null;};
  const active=()=>session.get().view==='street'&&session.get().sceneId==='map'&&!blocked();
  const down=e=>{if(!active()||e.target.closest('dialog,input,textarea'))return;if(codes[e.code]){e.preventDefault();keys.add(codes[e.code]);}};
  const up=e=>{if(codes[e.code])keys.delete(codes[e.code]);};window.addEventListener('keydown',down);window.addEventListener('keyup',up);window.addEventListener('blur',clear);document.addEventListener('visibilitychange',clear);
  for(const b of document.querySelectorAll('[data-walk]')){b.addEventListener('pointerdown',e=>{if(!active())return;e.preventDefault();b.setPointerCapture(e.pointerId);touch.add(b.dataset.walk);b.classList.add('pressed');});for(const type of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(type,()=>{touch.delete(b.dataset.walk);b.classList.remove('pressed');});}
  canvas.addEventListener('pointerdown',e=>{if(e.button===0&&active()){drag={id:e.pointerId,x:e.clientX};canvas.setPointerCapture(e.pointerId);}});canvas.addEventListener('pointermove',e=>{if(!drag||!active())return;const delta=e.clientX-drag.x;drag.x=e.clientX;session.dispatch({type:'street-heading',heading:session.get().street.heading+delta*.005});});for(const type of ['pointerup','pointercancel'])canvas.addEventListener(type,()=>drag=null);
  function resize(){const r=container.getBoundingClientRect();if(!r.width||!r.height)return;renderer.setSize(r.width,r.height,false);camera.aspect=r.width/r.height;camera.updateProjectionMatrix();}const observer=new ResizeObserver(resize);observer.observe(container);resize();
  const gl=renderer.getContext(),ext=gl.getExtension('WEBGL_debug_renderer_info');const diagnostics={webgl2:gl instanceof WebGL2RenderingContext,version:gl.getParameter(gl.VERSION),renderer:ext?gl.getParameter(ext.UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER)};
  renderer.setAnimationLoop(time=>{if(disposed)return;const dt=Math.min((time-last)/1000,.05);last=time;let moving=false;
    if(active()){const has=k=>keys.has(k)||touch.has(k),input={forward:Number(has('forward'))-Number(has('back')),turn:Number(has('right'))-Number(has('left'))};moving=!!input.forward;if(input.forward||input.turn)session.dispatch({type:'walk',input,dt});}else clear();
    const state=session.get(),d=mapping.locate(state.route).distance,p=frame(d,state.street.lateral),heading=state.street.heading-p.yaw;
    person.position.set(p.x,.17,p.z);person.material.rotation=moving?Math.sin(time*.009)*.016:0;shadow.position.set(p.x,.168,p.z);
    const dx=Math.sin(heading),dz=-Math.cos(heading);
    const eyeX=p.x-dx*4.5, cameraX=Math.max(p.x-state.street.lateral+4.35,Math.min(p.x-state.street.lateral+7.25,eyeX));
    // Slide along the pavement boundary while retaining follow distance: turning
    // must not push the camera into a flat or crop the character's feet.
    const dzEye=Math.sqrt(Math.max(.2,4.5**2-(cameraX-p.x)**2))*Math.sign(-dz||1);
    const lookAhead=camera.aspect<.8?.7:3.6;
    camera.position.set(cameraX,2.65,p.z+dzEye);camera.lookAt(p.x+dx*lookAhead,1.3,p.z+dz*lookAhead);
    const nowNear=Math.abs(d-doorDistance)<2.5;if(nowNear!==near){near=nowNear;onNear(near);}
    if(state.view==='street'&&state.sceneId==='map'){renderer.render(scene,camera);globalThis.__VISUAL_READY__=true;}
    camera.updateMatrixWorld();
    const right=new T.Vector3().setFromMatrixColumn(camera.matrixWorld,0),lower=person.position.clone(),upper=person.position.clone().add(new T.Vector3(0,1.83,0));
    const avatarNdc={left:lower.clone().addScaledVector(right,-.61).project(camera).x,right:lower.clone().addScaledVector(right,.61).project(camera).x,bottom:lower.clone().project(camera).y,top:upper.clone().project(camera).y};
    globalThis.__QA_STATE__={avatarNdc,revision:STAGE.revision,route:state.route,geo:mapping.locate(state.route).geo,street:state.street,feet:person.position.toArray(),camera:camera.position.toArray(),doorDistance,nearEntrance:near,renderer:diagnostics,drawCalls:renderer.info.render.calls};
  });
  return{clear,inspect:()=>structuredClone(globalThis.__QA_STATE__),dispose(){disposed=true;renderer.setAnimationLoop(null);observer.disconnect();window.removeEventListener('keydown',down);window.removeEventListener('keyup',up);window.removeEventListener('blur',clear);document.removeEventListener('visibilitychange',clear);scene.traverse(o=>{o.geometry?.dispose();});flats.dispose();walker.dispose();flatMaterial.dispose();renderer.dispose();canvas.remove();}};
}
