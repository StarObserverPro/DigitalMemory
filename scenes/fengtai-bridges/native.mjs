import * as T from '../xinhua-junction-outline/vendor/three/build/three.module.js';
import {buildBridgeGeometry} from './geometry.mjs';
import {makeRoadGrammar} from './road-grammar.mjs';
import {makeSceneInk} from './scene-ink.mjs';
import {makeUnderpassLamps} from './underpass-lamps.mjs';
import {bridgeFrame} from '../../src/engine/bridge-access.js';
import {createResourceScope} from '../../src/engine/resource-scope.js';

export function makeNativeBridges(scene,data){
 if(!data.bridgeCorridor)return null;
 const model=data.bridgeCorridor,built=buildBridgeGeometry(model),lamps=makeUnderpassLamps(model,built),root=new T.Group(),inkRoot=new T.Group(),frame=bridgeFrame(model,data);
 root.name='registered-fourth-ring';root.position.set(frame.offset[0],0,frame.offset[1]);root.scale.set(frame.scale[0],1,frame.scale[1]);root.add(built.geometry,lamps.fills,inkRoot);scene.add(root);root.updateMatrixWorld(true);
 const ink=makeSceneInk(inkRoot,makeRoadGrammar(model,built),[],lamps),meshes=[];built.geometry.traverse(o=>{if(o.isMesh)meshes.push(o);});let disposed=false;
 return{meshes,update:camera=>ink.update(camera),resize:(w,h)=>ink.resize(w,h),audit:{revision:model.revision,fixtures:lamps.fixtures.length,rayPaths:lamps.paths.filter(p=>p.role==='ray').length,topology:'closed solids; top-facing ground; no background proxy',...frame},pick(raycaster,navigation){for(const hit of raycaster.intersectObjects(meshes,false)){const point=[hit.point.x,hit.point.z],floor=navigation.height(point);if(navigation.walkable(point)&&Math.abs(hit.point.y-floor)<.35)return hit.point;}return null;},dispose(){if(disposed)return;disposed=true;ink.dispose();const scope=createResourceScope();scope.trackObject(root);scope.dispose();root.removeFromParent();}};
}
