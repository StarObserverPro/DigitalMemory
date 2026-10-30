import {makeStableInk} from './stable-ink.mjs';
import {makeContinuousInk} from './continuous-ink.mjs';
export function makeSceneInk(root,grammar,context,lamps){
 const structural=makeStableInk(root,grammar.strokes,context),curves=makeContinuousInk(root,[...grammar.paths,...lamps.paths]),layers=new Map([...structural.layers,...curves.layers]);
 const audit={...structural.audit,...curves.audit,...grammar.audit,lamps:lamps.audit};
 return{layers,audit,curves,structural,update(camera){const changed=structural.update(camera);Object.assign(audit,structural.audit);return changed;},resize(w,h){structural.resize(w,h);curves.resize(w,h);},setRays(visible){for(const[id,{line}]of curves.layers)if(id.includes('-ray-'))line.visible=visible;audit.raysVisible=visible;},dispose(){structural.dispose();curves.dispose();}};
}
export function setSceneInkOnly(root,enabled){root.traverse(mesh=>{if(mesh.isMesh&&!mesh.isLineSegments2&&!mesh.userData.inkPath&&mesh.material.color){if(!mesh.userData.washColor)mesh.userData.washColor=mesh.material.color.clone();if(enabled)mesh.material.color.set('#faf9f4');else mesh.material.color.copy(mesh.userData.washColor);}});}
