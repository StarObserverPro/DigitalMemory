import * as T from '../../assets/vendor/three/three.module.min.js';
import { STAGE } from '../domain/illustration.js';
import { STREET_VIEW, cameraRelativeInput } from './street-layout.js';
import { createStreetWorld } from './street-world.js';

/** The stage owns one renderer/input loop. The session owns every navigation target. */
export async function createStage({container,session,mapping,transform,composition,blocked,onNear,onEnter,onError}) {
  const renderer=new T.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));
  renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1;
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;container.append(renderer.domElement);
  const canvas=renderer.domElement;canvas.tabIndex=0;canvas.setAttribute('aria-label','新华街人行道，点地面行走，拖动换角度，点院门走进去');
  function labelMaterial(text){
    const c=document.createElement('canvas');c.width=384;c.height=96;const ctx=c.getContext('2d');
    ctx.fillStyle='#9cae9f';ctx.fillRect(0,0,384,96);ctx.fillStyle='#fcf8e9';ctx.font='42px "Fengtai Pen","Memory CJK",sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,192,49,360);
    const texture=new T.CanvasTexture(c);texture.colorSpace=T.SRGBColorSpace;
    const material=new T.MeshLambertMaterial({map:texture});material.userData.ownedTexture=texture;return material;
  }
  const world=createStreetWorld({mapping,transform,composition,periodId:session.get().periodId,labelMaterial});
  const {scene,camera}=world,ray=new T.Raycaster(),keys=new Set();
  let disposed=false,drag=null,lastTime=0,lastPoint=null,travel=0,gaitAmount=0,near=false,aspect=1,viewWasActive=false;
  const codes={KeyW:'up',ArrowUp:'up',KeyS:'down',ArrowDown:'down',KeyA:'left',ArrowLeft:'left',KeyD:'right',ArrowRight:'right'};
  const active=()=>session.get().view==='street'&&session.get().sceneId==='map'&&!blocked();
  function clear(){keys.clear();drag=null;if(session.get().street.target)session.dispatch({type:'street-target',target:null});}
  function pick(x,y){
    const r=canvas.getBoundingClientRect();ray.setFromCamera(new T.Vector2((x-r.left)/r.width*2-1,1-(y-r.top)/r.height*2),camera);
    const hit=ray.intersectObjects(world.pickObjects.filter(m=>!(m.userData.pick==='building'&&m.material.opacity<.5)&&m.visible&&(m.parent===world.road?world.road.visible:world.buildings.visible)),false)[0];
    if(!hit)return null;
    if(hit.object.userData.pick==='entrance')return {...world.gateTarget};
    if(hit.object.userData.pick!=='walk')return null;
    const p=world.locateGround(hit.point.x,hit.point.z);
    if(!p||p.lateral<4.1||p.lateral>7.7)return null;
    return {distance:p.distance,lateral:Math.max(STAGE.lateralMin,Math.min(STAGE.lateralMax,p.lateral))};
  }
  const down=e=>{
    if(!active()||e.target.closest?.('dialog,input,textarea,button,select'))return;
    if(codes[e.code]){e.preventDefault();keys.add(codes[e.code]);if(session.get().street.target)session.dispatch({type:'street-target',target:null});}
    else if(e.code==='Enter'&&near){e.preventDefault();clear();onEnter?.();}
  };
  const up=e=>{if(codes[e.code])keys.delete(codes[e.code]);};
  const lost=e=>{e.preventDefault();clear();globalThis.__VISUAL_READY__=false;onError('街景暂时中断，请返回手绘图后重新载入。');};
  canvas.addEventListener('webglcontextlost',lost);window.addEventListener('keydown',down);window.addEventListener('keyup',up);window.addEventListener('blur',clear);document.addEventListener('visibilitychange',clear);
  canvas.addEventListener('pointerdown',e=>{if(e.button!==0||!active())return;e.preventDefault();canvas.focus({preventScroll:true});
    drag={id:e.pointerId,x:e.clientX,y:e.clientY,yaw:session.get().street.cameraYaw||0,moved:false};canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener('pointermove',e=>{
    if(!active())return;
    if(!drag){canvas.style.cursor=pick(e.clientX,e.clientY)?'pointer':'grab';return;}
    if(drag.id!==e.pointerId)return;
    if(Math.hypot(e.clientX-drag.x,e.clientY-drag.y)>7)drag.moved=true;
    if(drag.moved){if(session.get().street.target)session.dispatch({type:'street-target',target:null});session.dispatch({type:'street-camera',yaw:drag.yaw-(e.clientX-drag.x)*.006});canvas.style.cursor='grabbing';}
  });
  canvas.addEventListener('pointerup',e=>{
    if(!drag||drag.id!==e.pointerId)return;
    if(!drag.moved&&active()){const target=pick(e.clientX,e.clientY);if(target)session.dispatch({type:'street-target',target});}
    drag=null;canvas.style.cursor='grab';
  });
  const cancel=()=>{drag=null;};canvas.addEventListener('pointercancel',clear);canvas.addEventListener('lostpointercapture',cancel);
  function resize(){const r=container.getBoundingClientRect();if(!r.width||!r.height)return;aspect=r.width/r.height;renderer.setSize(r.width,r.height,false);}
  const observer=new ResizeObserver(resize);observer.observe(container);resize();
  const gl=renderer.getContext(),ext=gl.getExtension('WEBGL_debug_renderer_info');
  const diagnostics={webgl2:gl instanceof WebGL2RenderingContext,version:gl.getParameter(gl.VERSION),renderer:ext?gl.getParameter(ext.UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER)};
  const outline=new T.Vector3();
  renderer.setAnimationLoop(time=>{
    if(disposed)return;const dt=lastTime?Math.min((time-lastTime)/1000,.05):0;lastTime=time;
    let state=session.get();const inStreet=state.view==='street'&&state.sceneId==='map';
    if(!inStreet){if(viewWasActive)clear();viewWasActive=false;lastPoint=null;return;}
    if(!viewWasActive){resize();lastPoint=null;viewWasActive=true;}
    const point=world.frame(mapping.locate(state.route).distance,state.street.lateral);
    const cam=world.setCamera(point,aspect,state.street.cameraYaw||0);
    if(active()){
      const input=cameraRelativeInput(Number(keys.has('right'))-Number(keys.has('left')),Number(keys.has('up'))-Number(keys.has('down')),cam.azimuth,point.yaw);
      if(input.along||input.lateral||state.street.target)session.dispatch({type:'walk',input,dt});
    }else clear();
    state=session.get();const distance=mapping.locate(state.route).distance,p=world.frame(distance,state.street.lateral);
    const moved=lastPoint?Math.hypot(p.x-lastPoint.x,p.z-lastPoint.z):0;lastPoint=p;travel+=moved;
    // Animation is driven by actual displacement: no marching at a boundary, no idle bounce.
    gaitAmount+=(Number(moved>.0002)-gaitAmount)*(1-Math.exp(-dt*18));
    const hero=world.posePerson(state,travel,gaitAmount);world.sync(state);world.setCamera(p,aspect,state.street.cameraYaw||0);world.revealPerson();
    const nowNear=Math.hypot(distance-world.gateDistance,state.street.lateral-world.gateBuilding.setback)<=STREET_VIEW.gateReach;
    if(nowNear!==near){near=nowNear;onNear(near);}
    const target=state.street.target;
    if(target&&Math.hypot(distance-target.distance,state.street.lateral-target.lateral)<.03){
      session.dispatch({type:'street-target',target:null});
      if(target.entranceId===world.entrance.id&&near){clear();onEnter?.();}
    }
    renderer.render(scene,camera);globalThis.__VISUAL_READY__=true;
    const bounds=new T.Box3().setFromObject(world.person),lo=outline.copy(bounds.min).project(camera).clone(),hi=outline.copy(bounds.max).project(camera).clone();
    globalThis.__QA_STATE__={revision:STREET_VIEW.revision,route:state.route,geo:mapping.locate(state.route).geo,street:state.street,
      feet:[p.x,STREET_VIEW.pavementY,p.z],soleOffsets:hero.pose.legs.map(l=>l.sole),travel,
      characterHeight:hero.profile.height,avatarNdc:{left:lo.x,right:hi.x,bottom:lo.y,top:hi.y},camera:camera.position.toArray(),projection:'orthographic',
      nearEntrance:near,doorDistance:world.gateDistance,renderer:diagnostics,drawCalls:renderer.info.render.calls,
      modules:[...world.instances].map(([id,b])=>({id,distance:b.distance,height:b.height,sourceHeight:b.building.height,depth:b.building.depth*STREET_VIEW.groundScale})),
      occupiedSlots:[...world.slotMeshes].filter(([,s])=>s.occupantId).map(([id,s])=>({id,occupantId:s.occupantId})),layers:state.layers};
  });
  return {clear,inspect:()=>structuredClone(globalThis.__QA_STATE__),dispose(){disposed=true;clear();renderer.setAnimationLoop(null);observer.disconnect();window.removeEventListener('keydown',down);window.removeEventListener('keyup',up);window.removeEventListener('blur',clear);document.removeEventListener('visibilitychange',clear);world.dispose();renderer.dispose();canvas.remove();}};
}
