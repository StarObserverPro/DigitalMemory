import * as T from '../xinhua-junction-outline/vendor/three/build/three.module.js';
import {LineSegments2} from '../xinhua-junction-outline/vendor/three/examples/jsm/lines/LineSegments2.js';
import {LineSegmentsGeometry} from '../xinhua-junction-outline/vendor/three/examples/jsm/lines/LineSegmentsGeometry.js';

export function makeSiteDetails(scene,data,drawing){
 const railInk=drawing.lineMaterial(2.2),barInk=drawing.lineMaterial(1.6),fixtures=[];
 const segmentGeometry=new LineSegmentsGeometry();segmentGeometry.setPositions(new Float32Array(2400*6));segmentGeometry.instanceCount=0;
 const bars=new LineSegments2(segmentGeometry,barInk);bars.frustumCulled=false;bars.renderOrder=2;scene.add(bars);
 const audit={fenceSegments:data.fences?.length||0,northFence:'unknown-not-added',equipment:data.equipment?.length||0,gates:data.gates?.map(g=>({id:g.id,width:g.widthMetres,ends:g.ends}))||[],bins:data.trashBins?.length||0,visibleFenceBars:0,plazaEvidence:'user-confirmed-existence-provisional-placement'};
 for(const g of data.gates||[]){const [a,b]=g.ends;drawing.stroke([[a[0],.08,a[1]],[a[0],g.height,a[1]],[b[0],g.height,b[1]],[b[0],.08,b[1]]],drawing.mainInk);}
 for(const b of data.trashBins||[]){
  const group=new T.Group();group.position.set(b.position[0],.06,b.position[1]);group.rotation.y=b.yaw;scene.add(group);
  const w=b.width/2,d=b.depth/2,h=b.height;
  const box=new T.Mesh(new T.BoxGeometry(b.width,h,b.depth),drawing.face);box.position.y=h/2;group.add(box);
  const s=pts=>drawing.stroke(pts,railInk,group);
  // Big shared containers: quiet body, closed lid and short handle, no modern sorting labels.
  s([[-w,0,-d],[-w,h,-d],[w,h,-d],[w,0,-d],[-w,0,-d]]);
  s([[-w,h,-d],[-w,h,d],[w,h,d],[w,h,-d]]);
  s([[w,h,d],[w,0,d],[w,0,-d]]);
  s([[-.23,h+.04,.05],[.23,h+.04,.05]]);
  fixtures.push({id:b.id,kind:'shared-trash-bin',group});
 }
 for(const f of data.fences||[])for(let k=1;k<f.points.length;k++){
  const a=f.points[k-1],b=f.points[k],length=Math.hypot(b[0]-a[0],b[1]-a[1]),at=(t,y)=>[a[0]+(b[0]-a[0])*t,y,a[1]+(b[1]-a[1])*t];
  drawing.stroke([at(0,.45),at(1,.45)],railInk);drawing.stroke([at(0,f.height-.13),at(1,f.height-.13)],railInk);
  const n=Math.ceil(length/4.3);for(let i=0;i<=n;i++)drawing.stroke([at(i/n,.08),at(i/n,f.height+.08)],railInk);
 }
 for(const p of data.plazas||[]){drawing.patch(p.ring,0xeeeae0,.027,p.holes);for(const path of p.outlinePaths||[[...p.ring,p.ring[0]]])drawing.stroke(path.map(p=>[p[0],.044,p[1]]),drawing.groundInk||railInk);}
 const circle=(x,y,z,r,plane='horizontal')=>Array.from({length:25},(_,i)=>{const a=i/24*Math.PI*2;return plane==='vertical'?[x+Math.cos(a)*r,y+Math.sin(a)*r,z]:[x+Math.cos(a)*r,y,z+Math.sin(a)*r];});
 for(const e of data.equipment||[]){
  const group=new T.Group();group.position.set(e.position[0],.035,e.position[1]);group.rotation.y=e.yaw;scene.add(group);
  const s=p=>drawing.stroke(p,railInk,group);
  if(e.kind==='air-walker'){
   s([[-.8,0,0],[-.8,1.5,0],[.8,1.5,0],[.8,0,0]]);
   for(const x of [-.4,.4]){s([[x,1.3,0],[x,.32,.4]]);s([[x-.15,.32,.18],[x+.15,.32,.18],[x+.15,.32,.68],[x-.15,.32,.68],[x-.15,.32,.18]]);}
  }else if(e.kind==='shoulder-wheels'){
   s([[0,0,0],[0,1.8,0]]);for(const x of [-.48,.48]){s([[0,1.5,0],[x,1.5,0]]);s(circle(x,1.5,0,.38,'vertical'));}
  }else if(e.kind==='twister'){
   s([[-.7,0,0],[-.7,1.1,0],[.7,1.1,0],[.7,0,0]]);for(const x of [-.46,.46])s(circle(x,.13,.55,.28));
  }else{
   for(const x of [-.45,.45])s([[x,0,-.7],[x,1.3,-.7],[x,1.3,.7],[x,0,.7]]);
  }
  fixtures.push({id:e.id,kind:e.kind,group});
 }
 for(const b of data.benches||[]){const g=new T.Group();g.position.set(b.position[0],.04,b.position[1]);g.rotation.y=b.yaw;scene.add(g);drawing.stroke([[-.8,.48,-.2],[.8,.48,-.2],[.8,.48,.2],[-.8,.48,.2],[-.8,.48,-.2]],railInk,g);for(const x of [-.6,.6])drawing.stroke([[x,0,.13],[x,.48,.13],[x,.95,.29]],railInk,g);drawing.stroke([[-.8,.95,.29],[.8,.95,.29]],railInk,g);}
 function update(camera){
  const out=[];
  for(const f of data.fences||[])for(let k=1;k<f.points.length;k++){
   const a=f.points[k-1],b=f.points[k],length=Math.hypot(b[0]-a[0],b[1]-a[1]),n=Math.ceil(length/f.barSpacing);
   for(let i=1;i<n;i++){const t=i/n,x=a[0]+(b[0]-a[0])*t,z=a[1]+(b[1]-a[1])*t;if(Math.hypot(camera.position.x-x,camera.position.z-z)>48)continue;const q=new T.Vector3(x,.9,z).project(camera);if(q.z<=-1||q.z>=1||Math.abs(q.x)>1.1||Math.abs(q.y)>1.15)continue;out.push(x,.32,z,x,f.height-.15,z);}
  }
  const a=segmentGeometry.attributes.instanceStart.data;a.array.set(out);a.needsUpdate=true;segmentGeometry.instanceCount=out.length/6;audit.visibleFenceBars=out.length/6;
 }
 return {update,audit,fixtures};
}
