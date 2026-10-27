import {validOutlineState} from '../application/session.js';
import {createLocalSceneFrame} from '../domain/spatial.js';
import {resolvePeriodState} from '../domain/temporal.js';
import {makeNavigation} from '../../scenes/xinhua-sanli-outline/navigation.mjs';

/** Adapts the accepted renderer to the one application session and registered route. */
export async function createOutlineStage({container,session,mapping,repository,blocked,onMenu,isCurrent=()=>true}) {
 const {registration,data}=await repository.loadOutline();
 if(!isCurrent())return null;
 const {mountOutline}=await import('../../scenes/xinhua-sanli-outline/runtime.mjs');
 if(!isCurrent())return null;
 const environment=resolvePeriodState(registration.periodStates,session.get().periodId);
 if(!environment)throw Error('No supported outline environment');
 const frame=createLocalSceneFrame(registration.frame),nav=makeNavigation(data),current=session.get();
 const routeKey=JSON.stringify(current.route),old=current.outline;
 const retain=validOutlineState(old)&&old.revision===registration.revision&&old.originRoute===routeKey&&nav.walkable(old.position)&&Number.isFinite(old.yaw)&&Number.isFinite(old.distance)&&Number.isFinite(old.pitch);
 const position=nav.closest(frame.toLocal(mapping.locate(current.route).geo));
 const initial=retain?{...old,path:[],destination:null}:{revision:registration.revision,originRoute:routeKey,environmentId:environment.id,position,yaw:Math.PI/6,distance:23,pitch:.68,path:[],visited:[],destination:null,distanceWalked:0};
 session.dispatch({type:'outline-state',value:initial});
 const active=()=>session.get().view==='street'&&session.get().sceneId==='map';
 const controller=await mountOutline({container,sceneData:data,readState:()=>session.get().outline,writeState:patch=>session.dispatch({type:'outline-state',value:{...session.get().outline,...patch}}),isVisible:active,isActive:()=>active()&&!blocked()&&!!resolvePeriodState(registration.periodStates,session.get().periodId),onMenu});
 const result={...controller,landmarks:data.landmarks,inspect:()=>({...controller.inspect(),registrationRevision:registration.revision,environmentId:environment.id,geo:frame.toGeo(session.get().outline.position),nearEntrance:false})};
 return result;
}
