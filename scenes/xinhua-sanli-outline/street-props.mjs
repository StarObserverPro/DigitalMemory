import * as T from '../xinhua-junction-outline/vendor/three/build/three.module.js';
import {boundsOf} from './spatial-drawing.mjs';
// Quiet, closed volumes. Counts and positions are illustrative occupancy.
export function makeStreetProps(scene,data,drawing){
 const ink=drawing.lineMaterial(2.3),audit={objects:0,walls:0};
 function box(group,w,h,d,y=0){
  const mesh=new T.Mesh(new T.BoxGeometry(w,h,d),drawing.face);mesh.position.y=y+h/2;group.add(mesh);
  const x=w/2,z=d/2,s=p=>drawing.stroke(p,ink,group);
  s([[-x,y,-z],[-x,y+h,-z],[x,y+h,-z],[x,y,-z],[-x,y,-z]]);
  s([[-x,y+h,-z],[-x,y+h,z],[x,y+h,z],[x,y+h,-z]]);s([[x,y+h,z],[x,y,z],[x,y,-z]]);return mesh;
 }
 for(const [index,p] of (data.streetProps||[]).entries()){
  audit.objects++;drawing.register({id:'prop:'+index,bounds:boundsOf([p.position],Math.max(1,Math.hypot(p.width||1,p.depth||1)/2),0,1.8),build:root=>{
  const g=new T.Group();g.position.set(p.position[0],.06,p.position[1]);g.rotation.y=p.yaw;root.add(g);
  if(p.kind==='board'){
   drawing.stroke([[-.4,0,-.36],[-.4,1.5,0],[.4,1.5,0],[.4,0,-.36]],ink,g);
   drawing.stroke([[-.4,1.5,0],[-.4,0,.4],[.4,0,.4],[.4,1.5,0]],ink,g);
   drawing.stroke([[-.32,.45,-.25],[.32,.45,-.25]],ink,g);
  }else{box(g,p.width,.48,p.depth);if(p.kind==='stack')box(g,p.width*.76,.42,p.depth*.8,.48);}
  }});
 }
 for(const [index,w] of (data.streetWalls||[]).entries()){
  audit.walls++;drawing.register({id:'street-wall:'+index,bounds:boundsOf(w.points,w.depth,0,w.height+.2),build:root=>{
  const [a,b]=w.points,dx=b[0]-a[0],dz=b[1]-a[1],g=new T.Group();g.position.set((a[0]+b[0])/2,.04,(a[1]+b[1])/2);g.rotation.y=-Math.atan2(dz,dx);root.add(g);box(g,Math.hypot(dx,dz),w.height,w.depth);
  }});
 }
 for(const bridge of data.bridges||[]){
  for(const [index,ring] of bridge.deckRings.entries())drawing.register({id:'bridge:'+bridge.id+':deck:'+index,bounds:boundsOf(ring,.3,bridge.deckBottom,bridge.deckBottom+bridge.deckThickness),collision:true,build:(root,collections)=>{
   const shape=new T.Shape();shape.moveTo(ring[0][0],-ring[0][1]);for(const p of ring.slice(1))shape.lineTo(p[0],-p[1]);shape.closePath();
   const mesh=new T.Mesh(new T.ExtrudeGeometry(shape,{depth:bridge.deckThickness,steps:1,bevelEnabled:false}),new T.MeshBasicMaterial({color:0xe4e5de}));mesh.rotation.x=-Math.PI/2;mesh.position.y=bridge.deckBottom;root.add(mesh);collections.meshes.push(mesh);
   for(const y of [bridge.deckBottom,bridge.deckBottom+bridge.deckThickness])drawing.stroke([...ring,ring[0]].map(p=>[p[0],y,p[1]]),drawing.mainInk);
   for(const p of ring)drawing.stroke([[p[0],bridge.deckBottom,p[1]],[p[0],bridge.deckBottom+bridge.deckThickness,p[1]]],ink);
  }});
  for(const [index,pier] of bridge.piers.entries())drawing.register({id:'bridge:'+bridge.id+':pier:'+index,bounds:boundsOf([pier.position],Math.hypot(pier.width,pier.depth)/2,0,pier.height),collision:true,build:(root,collections)=>{const group=new T.Group();group.position.set(pier.position[0],0,pier.position[1]);root.add(group);const mesh=box(group,pier.width,pier.height,pier.depth);collections.meshes.push(mesh);}});
  audit.bridge=bridge.id;
 }
 return {audit};
}
