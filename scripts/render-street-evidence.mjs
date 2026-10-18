// Native geometry projection only. This is NOT a WebGL/browser screenshot.
import fs from 'node:fs';
import * as T from '../assets/vendor/three/three.module.min.js';
import { createTransform } from '../src/domain/spatial.js';
import { createIllustrationMapping } from '../src/domain/illustration.js';
import { createComposition } from '../src/domain/composition.js';
import { createSession } from '../src/application/session.js';
import { createStreetWorld } from '../src/explorer/street-world.js';
const read=n=>JSON.parse(fs.readFileSync('content/public/'+n));
const transform=createTransform(read('orientation.json').bounds),mapping=createIllustrationMapping(read('illustration-mapping.json'),transform);
const composition=createComposition(read('scene-composition.json'),mapping),world=createStreetWorld({mapping,transform,composition,periodId:'window-2000'});
fs.mkdirSync('local-evidence/street',{recursive:true});fs.mkdirSync('evidence',{recursive:true});
const reports=[];
for(const [name,width,height,distance,orbit,walk] of [
 ['street-arrival',1280,800,mapping.locate(createSession(null,mapping).get().route).distance,0,0],['street-gate',1280,800,world.gateDistance,0,0],
 ['street-walk',1280,800,430,.35,1],['street-mobile',390,844,world.gateDistance,0,0]]){
 const state=createSession(null,mapping).get();state.route=mapping.atDistance(distance);state.street.lateral=name.includes('gate')||name.includes('mobile')?6.7:5.5;state.street.cameraYaw=orbit;state.street.heading=walk?.5:Math.PI/2;
 world.posePerson(state,.16,walk);world.sync(state);world.setCamera(world.frame(distance,state.street.lateral),width/height,orbit);world.revealPerson();world.scene.updateMatrixWorld(true);
 const camera=world.camera,triangles=[],light=new T.Vector3(-9,24,9).normalize();
 world.scene.traverseVisible(o=>{
  if(!o.isMesh||o.material.opacity===0)return;
  const pos=o.geometry.attributes.position,index=o.geometry.index,normal=o.geometry.attributes.normal;
  const count=index?index.count:pos.count,nmat=new T.Matrix3().getNormalMatrix(o.matrixWorld);
  const base=o.material.color.clone();
  for(let i=0;i<count;i+=3){
   const ids=[0,1,2].map(j=>index?index.getX(i+j):i+j);
   const p=ids.map(j=>new T.Vector3().fromBufferAttribute(pos,j).applyMatrix4(o.matrixWorld));
   const facing=p[1].clone().sub(p[0]).cross(p[2].clone().sub(p[0])).normalize();
   if(o.material.side!==T.DoubleSide&&facing.dot(camera.position.clone().sub(p[0]))<=0)continue;
   const ndc=p.map(v=>v.clone().project(camera));
   if(ndc.every(v=>v.x< -1)||ndc.every(v=>v.x>1)||ndc.every(v=>v.y< -1)||ndc.every(v=>v.y>1))continue;
   const n=normal?ids.map(j=>new T.Vector3().fromBufferAttribute(normal,j).applyMatrix3(nmat).normalize()).reduce((a,b)=>a.add(b),new T.Vector3()).normalize():facing;
   const shade=.65+.40*Math.max(0,n.dot(light));
   const color=base.clone().multiplyScalar(shade).convertLinearToSRGB();
   const fog=Math.max(0,Math.min(1,(p[0].distanceTo(camera.position)-36)/32));
   const rgb=[color.r,color.g,color.b].map((v,k)=>Math.round(Math.min(255,Math.max(0,v*255*(1-fog)+[235,231,220][k]*fog))));
   triangles.push({p:ndc.map(v=>[(v.x+1)*width/2,(1-v.y)*height/2,v.z]),color:rgb,opacity:o.material.opacity});
  }
 });
 const corners=[];const bounds=new T.Box3().setFromObject(world.person);
 for(const x of[bounds.min.x,bounds.max.x])for(const y of[bounds.min.y,bounds.max.y])for(const z of[bounds.min.z,bounds.max.z]){const p=new T.Vector3(x,y,z).project(camera);corners.push([(p.x+1)*width/2,(1-p.y)*height/2]);}
 const bbox=[Math.min(...corners.map(p=>p[0])),Math.min(...corners.map(p=>p[1])),Math.max(...corners.map(p=>p[0])),Math.max(...corners.map(p=>p[1]))];
 const report={name,width,height,distance,orbit,walk,camera:camera.position.toArray(),characterPixels:bbox,soles:world.pose.legs.map(l=>l.sole),triangles:triangles.length,kind:'native geometry raster; not browser/WebGL evidence'};reports.push(report);
 fs.writeFileSync(`local-evidence/street/${name}.json`,JSON.stringify({width,height,triangles}));
}
fs.writeFileSync('evidence/street-proportions-r3.json',JSON.stringify(reports,null,2)+'\n');world.dispose();console.log(JSON.stringify(reports));
