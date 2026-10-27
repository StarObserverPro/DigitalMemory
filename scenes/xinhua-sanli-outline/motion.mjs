import * as T from '../xinhua-junction-outline/vendor/three/build/three.module.js';

export function inkExtension(age,life=5.8){
 const smooth=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);};
 return smooth(age/Math.min(1.15,life*.3))*smooth((life-age)/Math.min(1.5,life*.36));
}
const cross=(a,b,c)=>(b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x);
function hull(points){
 const p=points.slice().sort((a,b)=>a.x-b.x||a.y-b.y),lo=[],hi=[];
 for(const q of p){while(lo.length>1&&cross(lo.at(-2),lo.at(-1),q)<=0)lo.pop();lo.push(q);}
 for(const q of p.slice().reverse()){while(hi.length>1&&cross(hi.at(-2),hi.at(-1),q)<=0)hi.pop();hi.push(q);}
 return lo.slice(0,-1).concat(hi.slice(0,-1));
}
function outward(poly,i){
 const a=poly[(i+poly.length-1)%poly.length],b=poly[i],c=poly[(i+1)%poly.length];
 const ab=Math.hypot(b.x-a.x,b.y-a.y),bc=Math.hypot(c.x-b.x,c.y-b.y);
 let x=(b.y-a.y)/ab+(c.y-b.y)/bc,y=-(b.x-a.x)/ab-(c.x-b.x)/bc,l=Math.hypot(x,y);
 return l>.001?[x/l,y/l]:[0,1];
}

export function makeMotion(scene,data,drawing){
 const slots=Array.from({length:4},()=>{
  const group=new T.Group();scene.add(group);group.visible=false;
  const lines=Array.from({length:2},()=>drawing.stroke(Array.from({length:11},()=>[0,0,0]),drawing.detailInk,group));
  return {group,lines,event:null};
 });
 const right=new T.Vector3(),up=new T.Vector3(),view=new T.Vector3(),ray=new T.Raycaster(),direction=new T.Vector3();
 let width=1280,height=720,lastDistance=-1,lastTime=-10,lastKey='',sequence=0,lastCarCycle=-1,engineCar=null,player=[0,0],lastTreeCycle=-1,windTree=null,windSide=1,shopEvent=null,lastShopAt=-20;
 const audit={buildingEvents:0,shopEvents:0,active:[],visibleStrokes:0,history:[],opacity:1,animation:'extend-retract',buildingLifetime:5.8,extendSeconds:1.15,retractSeconds:1.5,maxVisibleStrokes:6};
 function project(world,camera){const p=world.clone().project(camera);return {x:p.x*width/2,y:p.y*height/2,z:p.z,world};}
 function onscreen(p,margin=28){return p.z>-1&&p.z<1&&Math.abs(p.x)<width/2-margin&&Math.abs(p.y)<height/2-margin;}
 function clearSight(world,id,camera){direction.copy(world).sub(camera.position);const distance=direction.length();ray.set(camera.position,direction.normalize());ray.far=Math.max(0,distance-.12);const first=ray.intersectObjects(drawing.meshes,false)[0];return !first||first.object.userData.id===id;}
 function buildingCandidates(camera,state){
  const candidates=[];
  for(const b of data.buildings){
   const nearest=Math.min(...b.ring.map(p=>Math.hypot(p[0]-state.position[0],p[1]-state.position[1])));if(nearest>34)continue;
   const points=[];b.ring.forEach((p,i)=>{for(const y of [.12,b.height+.055]){const q=project(new T.Vector3(p[0],y,p[1]),camera);q.key=b.id+':'+i+':'+y;q.id=b.id;points.push(q);}});
   // The projected hull gives an exterior direction even at a concave footprint.
   // Fixed world anchors remain attached to the building as the camera moves.
   const poly=hull(points.filter(p=>p.z>-1&&p.z<1));if(poly.length<3)continue;
   poly.forEach((p,i)=>{const distance=Math.hypot(p.world.x-state.position[0],p.world.z-state.position[1]);if(distance>32||!onscreen(p)||Math.hypot(p.x,p.y+height*.08)<65||!clearSight(p.world,b.id,camera))return;
    candidates.push({...p,out:outward(poly,i),score:distance+Math.hypot(p.x,p.y)/50+(p.key===lastKey?100:0)+(p.world.y<1?3:0)});
   });
  }
  return candidates.sort((a,b)=>a.score-b.score);
 }
 function exteriorDirection(event,camera){
  const b=data.buildings.find(b=>b.id===event.id);if(!b)return event.out;
  const points=[];for(const p of b.ring)for(const y of [.12,b.height+.055])points.push(project(new T.Vector3(p[0],y,p[1]),camera));
  const poly=hull(points.filter(p=>p.z>-1&&p.z<1));let closest=-1,dist=Infinity;const q=project(event.world,camera);
  poly.forEach((p,i)=>{const d=Math.hypot(p.x-q.x,p.y-q.y);if(d<dist){dist=d;closest=i;}});
  return closest>=0&&dist<3?outward(poly,closest):null;
 }
 function draw(slot,anchor,out,extension,pattern,count,camera,id,kind,planeNormal=null){
  slot.group.visible=false;const distance=Math.hypot(anchor.x-player[0],anchor.z-player[1]),limit=kind==='tree'?60:kind==='shop'?20:34;if(extension<.045||!out||distance>limit)return;
  const projected=project(anchor,camera);if(!onscreen(projected,20)||!clearSight(anchor,id,camera))return;
  view.copy(anchor).applyMatrix4(camera.matrixWorldInverse);const pixel=2*Math.max(.1,-view.z)/(height*camera.projectionMatrix.elements[5]);
  const outLength=Math.hypot(...out);out=out.map(v=>v/outLength);
  const tangent=[-out[1],out[0]],segmentCount=10,scale=kind==='building'?T.MathUtils.lerp(1.1,1.65,T.MathUtils.clamp((30-distance)/24,0,1)):kind==='shop'?1.25:kind==='tree'?T.MathUtils.lerp(.92,1.2,T.MathUtils.clamp((50-distance)/40,0,1)):1;
  for(let j=0;j<slot.lines.length;j++){
   const line=slot.lines[j];line.visible=j<count;line.material=kind==='building'?drawing.mainInk:drawing.detailInk;if(!line.visible)continue;
   const pts=[];
   for(let i=0;i<=segmentCount;i++){
    const t=i/segmentCount*extension;let normal,along;
    if(pattern==='tangent'){
     normal=9+j*6+2.2*Math.sin(Math.PI*t);along=-7+14*t;
    }else{
     const angle=(j-(count-1)/2)*.52;
     normal=(9+10*t)*Math.cos(angle);along=(9+10*t)*Math.sin(angle)+1.5*Math.sin(Math.PI*t);
    }
    const dx=(out[0]*normal+tangent[0]*along)*scale,dy=(out[1]*normal+tangent[1]*along)*scale;
    const point=anchor.clone().addScaledVector(right,dx*pixel).addScaledVector(up,dy*pixel);
    if(planeNormal){const direction=point.clone().sub(camera.position),denominator=planeNormal.dot(direction);if(Math.abs(denominator)>.0001){const t=planeNormal.dot(anchor.clone().sub(camera.position))/denominator;point.copy(camera.position).addScaledVector(direction,t);}}
    pts.push(point);
   }
   const buffer=line.geometry.attributes.instanceStart.data;
   for(let i=0;i<segmentCount;i++)buffer.array.set([...pts[i].toArray(),...pts[i+1].toArray()],i*6);
   buffer.needsUpdate=true;line.geometry.instanceCount=segmentCount;
  }
  slot.group.visible=true;audit.active.push({kind,id,pattern,anchor:anchor.toArray().map(v=>+v.toFixed(2)),distance:+distance.toFixed(2),extension:+extension.toFixed(2),lengthScale:+scale.toFixed(2),strokes:count});audit.visibleStrokes+=count;
 }
 function update(camera,state,reducedMotion=false){
  right.setFromMatrixColumn(camera.matrixWorld,0);up.setFromMatrixColumn(camera.matrixWorld,1);audit.active=[];audit.visibleStrokes=0;
  const time=state.elapsed;player=state.position;
  for(const slot of slots)slot.group.visible=false;
  if(reducedMotion)return;
  // Travel and a cooldown both gate events. Standing still cannot keep
  // re-triggering building decorations; camera-only turns cannot trigger them.
  if(state.walking&&state.distanceWalked-lastDistance>3.4&&time-lastTime>1.4){
   const previousFinished=slots.slice(0,2).every(s=>!s.event||time-s.event.birth>=5.8);
   const free=previousFinished?slots[0]:null;
   if(free){const activeIds=slots.slice(0,2).filter(s=>s.event&&time-s.event.birth<5.8).map(s=>s.event.id);
    const choice=buildingCandidates(camera,state).find(c=>!activeIds.includes(c.id)&&c.id!==shopEvent?.opening.buildingId);
    if(choice){free.event={...choice,birth:time,pattern:sequence++%2?'radial':'tangent'};lastKey=choice.key;lastDistance=state.distanceWalked;lastTime=time;audit.buildingEvents++;
     audit.history.push({id:choice.id,key:choice.key,pattern:free.event.pattern,distance:+state.distanceWalked.toFixed(2)});if(audit.history.length>16)audit.history.shift();}
   }
  }
  slots.slice(0,2).forEach(slot=>{const e=slot.event;if(!e)return;const age=time-e.birth;
   if(age>=5.8){slot.event=null;return;}
   draw(slot,e.world,exteriorDirection(e,camera),inkExtension(age),e.pattern,2,camera,e.id,'building');
  });
  // One local tree and one local engine may speak at once; all marks are
  // solid ink which grows/retracts. There is no opacity or linewidth animation.
  const treeCycle=Math.floor(time/6.8),treeAge=time%6.8;
  if(treeCycle!==lastTreeCycle){lastTreeCycle=treeCycle;
   const eligible=drawing.trees.map(t=>{const center=t.group.localToWorld(new T.Vector3(0,t.height-1.5,0)),p=project(center,camera),edge=project(t.group.localToWorld(new T.Vector3(1.6,t.height-1.5,0)),camera);return {t,d:Math.hypot(center.x-player[0],center.z-player[1]),visible:onscreen(p,18)&&Math.hypot(edge.x-p.x,edge.y-p.y)>6&&clearSight(center,t.id,camera)};}).filter(p=>p.d<58&&p.visible).sort((a,b)=>a.d-b.d);
   windTree=eligible.length?eligible[treeCycle%eligible.length].t:null;windSide=windTree&&Math.sin(time*.9+windTree.phase)>0?-1:1;
  }
  if(windTree&&treeAge<4.5){const t=windTree,anchor=t.group.localToWorld(new T.Vector3(windSide*1.69,t.height-1.45,0));draw(slots[2],anchor,[windSide,.15],inkExtension(treeAge,4.5),'tangent',2,camera,t.id,'tree');}
  // Shop and engine sounds share one two-stroke voice. A nearby shop speaks
  // only occasionally; it does not add another permanently active layer.
  if(shopEvent&&time-shopEvent.birth>=4.6)shopEvent=null;
  if(!shopEvent&&time-lastShopAt>12.8){
   const near=drawing.openings.map(o=>({o,d:Math.hypot(o.anchor.x-player[0],o.anchor.z-player[1])})).filter(({o,d})=>d<18&&o.normal.dot(camera.position.clone().sub(o.anchor))>0&&onscreen(project(o.anchor,camera),32)&&clearSight(o.anchor,o.buildingId,camera)&&!audit.active.some(a=>a.kind==='building'&&a.id===o.buildingId)).sort((a,b)=>a.d-b.d)[0];
   if(near){shopEvent={opening:near.o,birth:time};lastShopAt=time;audit.shopEvents++;}
  }
  if(shopEvent){const o=shopEvent.opening,a=project(o.anchor,camera),c=project(o.center,camera),out=[a.x-c.x,a.y-c.y];draw(slots[3],o.anchor,out,inkExtension(time-shopEvent.birth,4.6),'tangent',2,camera,o.buildingId,'shop',o.normal);}
  const cycle=Math.floor(time/6.8),age=time%6.8;
  if(cycle!==lastCarCycle){lastCarCycle=cycle;engineCar=drawing.cars.map(c=>({c,d:Math.hypot(c.group.position.x-state.position[0],c.group.position.z-state.position[1])})).filter(p=>p.d<24).sort((a,b)=>a.d-b.d)[0]?.c;}
  if(!shopEvent&&engineCar&&age<3.4){const c=engineCar,poly=hull(c.points.map(p=>project(c.group.localToWorld(p.clone()),camera)));const top=poly.reduce((best,p,i)=>p.y>poly[best].y?i:best,0),anchor=poly[top]?.world;
   if(anchor&&Math.hypot(c.group.position.x-state.position[0],c.group.position.z-state.position[1])<26){const pulse=.85+.15*Math.sin(age*3.8)**2;draw(slots[3],anchor,outward(poly,top),inkExtension(age,3.4)*pulse,'radial',2,camera,c.id,'engine');}
  }
 }
 return {update,audit,resize:(w,h)=>{width=w;height=h;}};
}
