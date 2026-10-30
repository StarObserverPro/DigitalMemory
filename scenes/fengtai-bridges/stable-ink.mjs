import * as T from '../xinhua-junction-outline/vendor/three/build/three.module.js';
import {LineSegments2} from '../xinhua-junction-outline/vendor/three/examples/jsm/lines/LineSegments2.js';
import {LineSegmentsGeometry} from '../xinhua-junction-outline/vendor/three/examples/jsm/lines/LineSegmentsGeometry.js';
import {LineMaterial} from '../xinhua-junction-outline/vendor/three/examples/jsm/lines/LineMaterial.js';
import {buildStrokeGraph,coalesceStraightStrokes,STYLES} from './stroke-topology.mjs';
import {contextStrokes} from './context-strokes.mjs';

export function configureSurfacePass(geometry){
 let overlays=0;
 for(const mesh of geometry.children)if(mesh.isMesh&&mesh.name.includes('rail')&&mesh.material.color.getHexString()!=='faf9f4'){
  mesh.renderOrder=1;mesh.material.polygonOffset=true;mesh.material.polygonOffsetFactor=-1;mesh.material.polygonOffsetUnits=-4;mesh.material.depthWrite=false;overlays++;
 }
 return{railOverlayMeshes:overlays};
}
export function setInkOnly(geometry,enabled){
 const paper=new T.Color('#faf9f4');
 for(const mesh of geometry.children)if(mesh.isMesh&&!mesh.isLineSegments2){if(!mesh.userData.washColor)mesh.userData.washColor=mesh.material.color.clone();mesh.material.color.copy(enabled?paper:mesh.userData.washColor);}
}
function contextVisible(s,camera){const r=s.rule;if(!r)return true;const v=camera.position.toArray().map((x,i)=>x-r.center[i]),front=n=>v.reduce((sum,x,i)=>sum+x*n[i],0)>0;return r.kind==='silhouette'?front(r.normal)!==front(r.other):front(r.normal);}
export function makeStableInk(root,source,buildings=[]){
 const graph=buildStrokeGraph(source),strokes=coalesceStraightStrokes(graph.segments),context=contextStrokes(buildings),layers=new Map();let previousPose='',previousContext='',width=1,height=1;
 const audit={...graph.audit,structuralStrokes:strokes.length,structuralUploads:0,contextUploads:0,allocations:0,poseUpdates:0,viewDependentStructuralCuts:0,screenSelectedDashes:0,updateMs:0};
 function material(role){
  const m=new LineMaterial({color:0x20231f,linewidth:STYLES[role].width,worldUnits:false,transparent:false,opacity:1,depthTest:true,depthWrite:false,alphaToCoverage:true});
  m.onBeforeCompile=shader=>{shader.vertexShader=shader.vertexShader.replace('gl_Position = clip;',`gl_Position = clip;
   vec4 inkView = ( position.y < 0.5 ) ? start : end;
   float inkLift = min(0.045, linewidth * max(0.0, -inkView.z) * 1.25 / (resolution.y * projectionMatrix[1][1]));
   inkView.z += min(inkLift, max(0.0, -inkView.z - 0.105));
   vec4 inkClip = projectionMatrix * inkView;
   gl_Position.z = inkClip.z / inkClip.w * gl_Position.w;`);};
  m.customProgramCacheKey=()=> 'bridge-stable-world-ink-r4';m.resolution.set(width,height);return m;
 }
 function createLayer(role,points){const g=new LineSegmentsGeometry();g.setPositions(points.length?points:new Float32Array(6));if(!points.length)g.instanceCount=0;const line=new LineSegments2(g,material(role));line.name='stable-'+role;line.frustumCulled=false;line.renderOrder=3;line.visible=points.length>0;root.add(line);layers.set(role,{line,capacity:points.length/6});audit.allocations++;return line;}
 const byRole=new Map();
 for(const s of strokes){const list=byRole.get(s.role)||[];list.push(...s.a,...s.b);byRole.set(s.role,list);}
 for(const [role,points]of byRole){createLayer(role,points);audit.structuralUploads++;}
 createLayer('context',[]);
 function update(camera){
  camera.updateMatrixWorld();const pose=camera.matrixWorld.elements.join(',');if(previousPose===pose)return false;previousPose=pose;const started=performance.now();
  const visible=context.filter(s=>contextVisible(s,camera)),key=visible.map(s=>s.owner+':'+s.a.join(',')+':'+s.b.join(',')).join('|');
  if(key!==previousContext){
   previousContext=key;const layer=layers.get('context'),points=visible.flatMap(s=>[...s.a,...s.b]),count=points.length/6;layer.line.visible=count>0;
   if(count>layer.capacity){layer.capacity=2**Math.ceil(Math.log2(Math.max(32,count)));layer.line.geometry.dispose();layer.line.geometry=new LineSegmentsGeometry();layer.line.geometry.setPositions(new Float32Array(layer.capacity*6));audit.allocations++;}
   if(count){const buffer=layer.line.geometry.attributes.instanceStart.data;buffer.array.set(points);buffer.needsUpdate=true;}layer.line.geometry.instanceCount=count;audit.contextUploads++;
  }
  audit.poseUpdates++;audit.updateMs=+(performance.now()-started).toFixed(3);return true;
 }
 function resize(w,h){width=w;height=h;for(const {line}of layers.values())line.material.resolution.set(w,h);}
 function dispose(){for(const {line}of layers.values()){root.remove(line);line.geometry.dispose();line.material.dispose();}layers.clear();}
 return{update,resize,dispose,audit,graph,layers,strokes};
}
