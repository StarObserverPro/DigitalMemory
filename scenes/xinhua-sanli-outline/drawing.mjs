import * as T from '../xinhua-junction-outline/vendor/three/build/three.module.js';
import {Line2} from '../xinhua-junction-outline/vendor/three/examples/jsm/lines/Line2.js';
import {LineGeometry} from '../xinhua-junction-outline/vendor/three/examples/jsm/lines/LineGeometry.js';
import {LineSegments2} from '../xinhua-junction-outline/vendor/three/examples/jsm/lines/LineSegments2.js';
import {LineSegmentsGeometry} from '../xinhua-junction-outline/vendor/three/examples/jsm/lines/LineSegmentsGeometry.js';
import {LineMaterial} from '../xinhua-junction-outline/vendor/three/examples/jsm/lines/LineMaterial.js';
import {makeInkOcclusion} from './ink-occlusion.mjs';
import {makeSpatialDrawing,boundsOf,ensureSegmentCapacity} from './spatial-drawing.mjs';
import {createResourceScope} from '../../src/engine/resource-scope.js';
const INK=0x20231f,PAPER=0xfaf9f4;
export function makeDrawing(scene,data,options={}){
 const shared=new Set(),sharedScope=createResourceScope(),lineMaterials=[],audit=[],ink=makeInkOcclusion();
 const spatial=makeSpatialDrawing(scene,{shared,...options}),releasedObjects=new WeakSet(),owners=new Map();
 let nextOwner=1,auditRevision=0,disposed=false,resolution=[1,1],context={root:scene,life:{disposed:false}};
 const existingRoots=new Set(scene.children);
 try{
 const share=resource=>{shared.add(resource);sharedScope.own(resource);return resource;};
 const owner=key=>{if(!owners.has(key))owners.set(key,nextOwner++);return owners.get(key);};
 function register({id,bounds,build,collision=false}){
  return spatial.register({id,bounds,collision,build(root,collections,life){const previous=context;context={root,...collections,life};try{build(root,collections,life);}finally{context=previous;}}});
 }
 const face=share(new T.MeshBasicMaterial({color:PAPER,polygonOffset:true,polygonOffsetFactor:1,polygonOffsetUnits:1}));
 function lineMaterial(width=3.3){
  const m=share(new LineMaterial({color:INK,linewidth:width,worldUnits:false,alphaToCoverage:true,depthTest:true,depthWrite:false}));
  // Thick strokes straddle the filled silhouette. A small, pixel-scaled depth
  // offset keeps their inner half from being cut away by their own white mesh.
  // Depth testing remains enabled, so nearer buildings still occlude the ink.
  m.onBeforeCompile=shader=>{shader.vertexShader=shader.vertexShader.replace('gl_Position = clip;',`gl_Position = clip;
   vec4 inkView = ( position.y < 0.5 ) ? start : end;
   float inkLift = min(0.22, linewidth * max(0.0, -inkView.z) * 1.8 / (resolution.y * projectionMatrix[1][1]));
   inkView.z += min(inkLift, max(0.0, -inkView.z - 0.11));
   vec4 inkClip = projectionMatrix * inkView;
   gl_Position.z = inkClip.z / inkClip.w * gl_Position.w;`);};
  m.customProgramCacheKey=()=> 'stable-contour-depth-v1';ink.material(m);lineMaterials.push(m);m.resolution.set(...resolution);return m;
 }
 const mainInk=lineMaterial(3.5),detailInk=lineMaterial(2.9),groundInk=lineMaterial(2.2);
 function stroke(points,material=mainInk,parent=context.root,owner=0){const g=new LineGeometry();g.setPositions(points.flat());const l=new Line2(g,material);l.frustumCulled=false;l.renderOrder=3;ink.stroke(l,owner);parent.add(l);return l;}
 function patch(points,color,y=.01,holes=[]){const s=new T.Shape();s.moveTo(points[0][0],-points[0][1]);for(const p of points.slice(1))s.lineTo(p[0],-p[1]);s.closePath();for(const ring of holes){const h=new T.Path();h.moveTo(ring[0][0],-ring[0][1]);for(const p of ring.slice(1))h.lineTo(p[0],-p[1]);h.closePath();s.holes.push(h);}const m=new T.Mesh(new T.ShapeGeometry(s),new T.MeshBasicMaterial({color,side:T.DoubleSide}));m.rotation.x=-Math.PI/2;m.position.y=y;context.root.add(m);return m;}
 const roadColor=0xe8e9e2;
 let partId=0;
 const layer=(name,ring,color,y=.01,holes=[])=>register({id:name+':'+partId++,bounds:boundsOf(ring,0,y,y+.1),build:()=>patch(ring,color,y,holes)});
 const line=(name,points,material=groundInk,inkOwner=0)=>register({id:name+':'+partId++,bounds:boundsOf(points.map(p=>[p[0],p[2]]),.2,Math.min(...points.map(p=>p[1])),Math.max(...points.map(p=>p[1]))),build:()=>stroke(points,material,undefined,inkOwner)});
 function ribbon(dir,start,end,width){const r=[-dir[1],dir[0]],p=(s,d)=>[dir[0]*s+r[0]*d,dir[1]*s+r[1]*d];layer('road-ribbon',[p(start,-width/2),p(end,-width/2),p(end,width/2),p(start,width/2)],roadColor,.012);}
 const base=new T.Group();base.name='outline-base';scene.add(base);
 const ground=new T.Mesh(new T.PlaneGeometry(1600,1600),new T.MeshBasicMaterial({color:PAPER}));ground.rotation.x=-Math.PI/2;ground.position.y=-.03;base.add(ground);
 ribbon(data.northDirection,-12,data.northLength+45,10.5);
 if(!data.corridor)ribbon(data.eastDirection,-65,data.eastLength+65,13.2);
 for(const p of data.corridorRoadSurfaces||[])layer('corridor-road',p.ring,roadColor,.012,p.holes);
 for(const p of data.paving||[])layer('paving',p.ring,0xf3f2ea,.016,p.holes);
 for(const p of data.roadSurfaces||[])layer('road-surface',p.ring,roadColor,.021,p.holes);
 for(const g of data.greenAreas||[]){layer('green',g.ring,0xe3e8dc,.024,g.holes);line('green-edge',[...g.ring,g.ring[0]].map(p=>[p[0],.032,p[1]]));}
 for(const road of data.contextRoads||[])for(let i=1;i<road.points.length;i++){const a=road.points[i-1],b=road.points[i],dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz),rx=-dz/l*road.width/2,rz=dx/l*road.width/2;layer('context-road',[[a[0]+rx,a[1]+rz],[b[0]+rx,b[1]+rz],[b[0]-rx,b[1]-rz],[a[0]-rx,a[1]-rz]],roadColor,.012);}
 if(data.roadOutlines){for(const path of data.roadOutlines)line('road-edge',path.map(p=>[p[0],.043,p[1]]));}else for(const p of data.roadSurfaces||[]){line('road-edge',[...p.ring,p.ring[0]].map(p=>[p[0],.043,p[1]]));for(const h of p.holes||[])line('road-hole',[...h,h[0]].map(p=>[p[0],.043,p[1]]));}
 function at(dir,s,d=0,y=.08){return [dir[0]*s-dir[1]*d,y,dir[1]*s+dir[0]*d];}
 for(const side of [-1,1]){
  line('lane-edge',[at(data.northDirection,10,side*5.25),at(data.northDirection,data.northLength+25,side*5.25)]);
  if(!data.corridor){line('lane-edge',[at(data.eastDirection,-60,side*6.6),at(data.eastDirection,-10,side*6.6)]);line('lane-edge',[at(data.eastDirection,10,side*6.6),at(data.eastDirection,data.eastLength+25,side*6.6)]);}
 }
 for(const path of data.corridorCurbs||[])line('corridor-curb',path.map(p=>[p[0],.05,p[1]]));
 for(let i=-3;i<=3;i++){const s=i*1.15,p=[at(data.eastDirection,s-.34,-7),at(data.eastDirection,s+.34,-7),at(data.eastDirection,s+.34,data.corridor?7:-4.8),at(data.eastDirection,s-.34,data.corridor?7:-4.8)];layer('crosswalk',p.map(v=>[v[0],v[2]]),PAPER,.025);}
 const circle=(x,y,z,r,n=24)=>Array.from({length:n+1},(_,i)=>[x+Math.cos(i/n*Math.PI*2)*r,y,z+Math.sin(i/n*Math.PI*2)*r]);
 line('ground-mark',circle(1,.035,1,.55));line('ground-mark',[at(data.northDirection,38,-18),at(data.northDirection,40,-18.7),at(data.northDirection,43,-18.5)]);
 function body(id,ring,height,material=face,openUpper=null){
  const shape=new T.Shape();shape.moveTo(ring[0][0],-ring[0][1]);for(const p of ring.slice(1))shape.lineTo(p[0],-p[1]);shape.closePath();
  const mesh=new T.Mesh(new T.ExtrudeGeometry(shape,{depth:height,steps:1,bevelEnabled:false,curveSegments:1}),material);mesh.rotation.x=-Math.PI/2;mesh.position.y=.055;mesh.userData.id=id;context.root.add(mesh);context.meshes.push(mesh);
  const capacity=ring.length*3,geo=new LineSegmentsGeometry();geo.setPositions(new Float32Array(capacity*6));geo.instanceCount=0;
  const outline=new LineSegments2(geo,mainInk);outline.frustumCulled=false;outline.renderOrder=2;ink.stroke(outline);context.root.add(outline);
  const area=ring.reduce((s,p,i)=>{const q=ring[(i+1)%ring.length];return s+p[0]*q[1]-q[0]*p[1];},0),sign=area>0?1:-1;
  context.silhouettes.push({id,ring,height:height+.055,bottom:.055,outline,sign,openUpper,baseCuts:new Map()});return mesh;
 }
 function facadeFrames(o){
  if(o.kind==='low-rise'&&o.height<10)return;
  const edges=o.ring.map((a,i)=>{const b=o.ring[(i+1)%o.ring.length],l=Math.hypot(b[0]-a[0],b[1]-a[1]);return {a,b,l,i,mid:[(a[0]+b[0])/2,(a[1]+b[1])/2]};}).filter(e=>e.l>6);
  if(!edges.length)return;
  // One selected facade only; never populate whole buildings with a window grid.
  const score=p=>{if(!o.sourceIds||!data.corridor)return Math.hypot(...p);let best=Infinity;const line=data.corridor.centerline;for(let i=1;i<line.length;i++){const a=line[i-1],b=line[i],dx=b[0]-a[0],dz=b[1]-a[1],t=Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dz)/(dx*dx+dz*dz)));best=Math.min(best,Math.hypot(p[0]-a[0]-t*dx,p[1]-a[1]-t*dz));}return best;};
  edges.sort((a,b)=>o.facadeEdge!==undefined?Number(b.i===o.facadeEdge)-Number(a.i===o.facadeEdge):score(a.mid)-score(b.mid));const e=edges[0],u=[(e.b[0]-e.a[0])/e.l,(e.b[1]-e.a[1])/e.l],winding=context.silhouettes.find(s=>s.id===o.id).sign;const normal=[u[1]*winding,-u[0]*winding],nl=1,offset=normal.map(v=>v*.045);
  const p=(t,y)=>[e.a[0]+u[0]*t+offset[0],y,e.a[1]+u[1]*t+offset[1]];
  const n=o.kind==='shop'?Math.min(3,Math.floor(e.l/4)):Math.min(4,Math.floor(e.l/5));
  for(let i=0;i<n;i++){
   const t=e.l*(i+1)/(n+1),door=o.kind==='shop'&&i===0;
   const w=Math.min(o.kind==='shop'?(i%2?2.5:3.1):1.65,e.l/(n+1)-.75);
   const y=door?.055:o.kind==='shop'?.78:Math.min(o.height-3,4+i*o.height*.17),h=door?2.65:o.kind==='shop'?1.95:1.95;
   // The shop door replaces a section of the baseline: one joined opening,
   // never a nearly coincident closed rectangle on top of another black line.
   const pts=door?[p(t-w/2,y),p(t-w/2,y+h),p(t+w/2,y+h),p(t+w/2,y)]:o.kind!=='shop'&&i===n-1?[p(t-w/2,y+h),p(t-w/2,y),p(t+w/2,y),p(t+w/2,y+h)]:[p(t-w/2,y),p(t+w/2,y),p(t+w/2,y+h),p(t-w/2,y+h),p(t-w/2,y)];
   stroke(pts,door?mainInk:detailInk);
   if(door)context.silhouettes.find(s=>s.id===o.id).baseCuts.set(e.i,[(t-w/2)/e.l,(t+w/2)/e.l]);
   if(o.kind==='shop')context.openings.push({id:o.id+':opening:'+i,buildingId:o.id,type:door?'door':'window',anchor:new T.Vector3(...p(t+w/2,y+h*.68)),center:new T.Vector3(...p(t,y+h*.68)),normal:new T.Vector3(normal[0]/nl,0,normal[1]/nl)});
  }
  if(o.streetFacing){stroke([p(.3,o.height-.62),p(e.l-.3,o.height-.62)],detailInk);}
  if(o.label&&o.streetFacing){
   const canvas=document.createElement('canvas');canvas.width=384;canvas.height=80;const ctx=canvas.getContext('2d'),texture=new T.CanvasTexture(canvas);
   const life=context.life;const paint=()=>{if(life.disposed)return;ctx.clearRect(0,0,384,80);ctx.fillStyle='#20231f';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='48px "Sanli Happy",sans-serif';ctx.fillText(o.label,192,42);texture.needsUpdate=true;};paint();document.fonts.ready.then(paint);
   const sign=new T.Mesh(new T.PlaneGeometry(6.5,.72),new T.MeshBasicMaterial({map:texture,transparent:true,side:T.DoubleSide,depthWrite:false}));sign.position.set(...p(e.l*.5,o.height-.31));sign.rotation.y=Math.atan2(normal[0],normal[1]);context.root.add(sign);
  }
  const record=audit.find(a=>a.id===o.id),count=n+(o.streetFacing?1:0);
  if(record.facadeStrokes!==count){record.facadeStrokes=count;auditRevision++;}
 }
 const rearById=new Map((data.residentialDisplayVolumes||[]).map(v=>[v.sourceBuildingId,v]));
 const presentationById=new Map((data.buildingPresentation||[]).map(v=>[v.sourceBuildingId,v]));
 for(const source of [...data.buildings,...(data.frontageBuildings||[])]){
  const override=rearById.get(source.id),presentation=presentationById.get(source.id),openUpper=presentation?.openUpper;
  const o={...source,ring:override?.ring??source.ring,height:presentation?.displayHeight??source.height,kind:presentation?.displayKind??source.kind};
  if(presentation?.facadeEdge!==undefined)o.facadeEdge=presentation.facadeEdge;
  audit.push({id:o.id,type:'building',outlineStrokes:1,facadeStrokes:0,surfaceMarks:0});
  const drawnHeight=openUpper?.fadeEnd??o.height;
  register({id:'building:'+o.id,bounds:boundsOf(o.ring,.6,0,drawnHeight+.8),collision:true,build:()=>{
   let material=face;
   if(openUpper){
    // This local drawing band never changes source height or creates a low roof.
    // The private material follows the same chunk eviction owner as its mesh.
    material=face.clone();material.transparent=true;material.alphaTest=.01;
    material.onBeforeCompile=shader=>{
     shader.uniforms.outlineFadeStart={value:openUpper.fadeStart};shader.uniforms.outlineFadeEnd={value:openUpper.fadeEnd};
     shader.vertexShader='varying float outlineHeight;\n'+shader.vertexShader;
     shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\noutlineHeight = position.z;');
     shader.fragmentShader='varying float outlineHeight;\nuniform float outlineFadeStart;\nuniform float outlineFadeEnd;\n'+shader.fragmentShader;
     shader.fragmentShader=shader.fragmentShader.replace('#include <alphatest_fragment>','diffuseColor.a *= 1.0 - smoothstep(outlineFadeStart, outlineFadeEnd, outlineHeight);\n#include <alphatest_fragment>');
    };
    material.customProgramCacheKey=()=> 'open-upper-building-v1';
   }
   body(o.id,o.ring,drawnHeight,material,openUpper);
   facadeFrames({...o,height:openUpper?.fadeStart??o.height});
  }});
 }
 for(const g of data.gates?[]:[data.landmarks.north,data.landmarks.east]){
  const d=g.id==='north'?data.northDirection:data.eastDirection,[x,z]=g.anchor,w=2.9;
  line('gate',[[x-d[0]*w,.08,z-d[1]*w],[x-d[0]*w,2.9,z-d[1]*w],[x+d[0]*w,2.9,z+d[1]*w],[x+d[0]*w,.08,z+d[1]*w]],mainInk);audit.push({id:'gate-'+g.id,type:'gate',outlineStrokes:1,surfaceMarks:0});
 }
 const wheelFace=share(new T.MeshBasicMaterial({color:PAPER,side:T.DoubleSide,polygonOffset:true,polygonOffsetFactor:1,polygonOffsetUnits:1}));
 for(const c of data.cars){
  audit.push({id:c.id,type:'car',outlineStrokes:1,extraStrokes:3,totalStrokes:4,surfaceMarks:0});
  register({id:'car:'+c.id,bounds:boundsOf([c.position],2.5,0,1.7),build:()=>{
  const group=new T.Group();group.position.set(c.position[0],.09,c.position[1]);group.rotation.y=c.yaw;context.root.add(group);
  const hull=new T.Mesh(new T.BoxGeometry(1.75,.78,3.65),face);hull.position.y=.55;group.add(hull);
  const roof=new T.Mesh(new T.BoxGeometry(1.5,.67,1.9),face);roof.position.set(0,1.06,-.08);group.add(roof);
  const geom=new LineGeometry();geom.setPositions(new Float32Array(13*3));const outline=new Line2(geom,mainInk);outline.frustumCulled=false;outline.renderOrder=3;ink.stroke(outline,owner('car:'+c.id));group.add(outline);
  const points=[];for(const [wx,yy,zz] of [[.875,.16,1.825],[.875,.94,1.825],[.875,.94,-1.825],[.875,.16,-1.825],[-.875,.16,1.825],[-.875,.94,1.825],[-.875,.94,-1.825],[-.875,.16,-1.825],[.75,1.395,.87],[.75,1.395,-1.03],[-.75,1.395,.87],[-.75,1.395,-1.03]])points.push(new T.Vector3(wx,yy,zz));
  stroke([[-.45,1.4,.61],[.45,1.4,.61]],detailInk,group,owner('car:'+c.id));
  const wheels=[];for(const zz of [-1.12,1.12]){const wheel=new T.Group();wheel.position.set(.9,.32,zz);wheel.userData.inkOwner=owner('wheel:'+c.id+':'+wheels.length);const pts=Array.from({length:25},(_,i)=>[0,Math.sin(i/24*Math.PI*2)*.3,Math.cos(i/24*Math.PI*2)*.3]);const disc=new T.Mesh(new T.CircleGeometry(.3,24),wheelFace);disc.rotation.y=Math.PI/2;wheel.add(disc);stroke(pts,detailInk,wheel,wheel.userData.inkOwner);group.add(wheel);wheels.push(wheel);}
  context.cars.push({id:c.id,group,points,outline,wheels});

  }});
 }
 const treeFace=share(new T.MeshBasicMaterial({color:PAPER,side:T.DoubleSide,polygonOffset:true,polygonOffsetFactor:1,polygonOffsetUnits:1}));
 for(const [index,t] of data.trees.entries()){
  audit.push({id:t.id,type:'tree',outlineStrokes:1,extraStrokes:1,totalStrokes:2,surfaceMarks:0});
  register({id:'tree:'+t.id,bounds:boundsOf([t.position],2.2,0,t.height+.6),build:()=>{
  const group=new T.Group();group.position.set(t.position[0],.08,t.position[1]);context.root.add(group);const h=t.height;
  // A tree has one quiet crown contour and one trunk line, no leaf scribbles.
  const crown=[];for(let i=0;i<=32;i++){const a=i/32*Math.PI*2;crown.push([Math.cos(a)*1.6,h-1.5+Math.sin(a)*1.85,0]);}
  const shape=new T.Shape(crown.map(p=>new T.Vector2(p[0],p[1])));group.add(new T.Mesh(new T.ShapeGeometry(shape),treeFace));
  const inkOwner=owner('tree:'+t.id);stroke(crown,mainInk,group,inkOwner);stroke([[0,.02,0],[0,h-3.35,0]],mainInk,group,inkOwner);context.trees.push({id:t.id,group,height:h,phase:index*2.17,inkOwner});

  }});
 }
 for(const [i,p] of [12,63].entries()){const v=at(data.northDirection,p,i?-6.2:6.2),d=data.northDirection,points=[[v[0],.1,v[2]],[v[0],5.3,v[2]],[v[0]+d[0]*2.1,5.6,v[2]+d[1]*2.1]],inkOwner=owner('thin:'+i);
  register({id:'thin:'+i,bounds:boundsOf(points.map(p=>[p[0],p[2]]),.2,0,5.8),build:()=>{stroke(points,mainInk,context.root,inkOwner);context.thinLines.push({points,group:context.root,owner:inkOwner,radius:4.25});}});
 }
 function update(camera,time=0,reducedMotion=false){
  if(disposed)return;spatial.prepare(camera);const silhouettes=spatial.active('silhouettes'),cars=spatial.active('cars'),trees=spatial.active('trees'),thinLines=spatial.active('thinLines'),key=spatial.cameraKey;
  const cam=camera.position;
  for(const o of silhouettes){if(o.cameraKey===key)continue;o.cameraKey=key;spatial.audit.staticUpdates++;const {ring,height,bottom,sign}=o,n=ring.length,visible=ring.map((p,i)=>{const q=ring[(i+1)%n],dx=q[0]-p[0],dz=q[1]-p[1];return sign*(dz*(cam.x-(p[0]+q[0])/2)-dx*(cam.z-(p[1]+q[1])/2))>0;}),top=cam.y>height,bot=cam.y<bottom,coords=[];
   const add=(a,ay,b,by)=>coords.push(a[0],ay,a[1],b[0],by,b[1]);
   for(let i=0;i<n;i++){const p=ring[i],q=ring[(i+1)%n];if(!o.openUpper&&visible[i]!==top)add(p,height,q,height);if(visible[i]!==bot){const cut=o.baseCuts.get(i);if(cut){const at=t=>[p[0]+(q[0]-p[0])*t,p[1]+(q[1]-p[1])*t];add(p,bottom,at(cut[0]),bottom);add(at(cut[1]),bottom,q,bottom);}else add(p,bottom,q,bottom);}if(visible[i]!==visible[(i+n-1)%n])add(p,bottom,p,o.openUpper?o.openUpper.fadeStart+(i%4)*.7:height);}
   ensureSegmentCapacity(o.outline.geometry,coords.length/6);const a=o.outline.geometry.attributes.instanceStart.data;a.array.set(coords);a.needsUpdate=true;o.outline.geometry.instanceCount=coords.length/6;
  }
  for(const c of cars){if(c.cameraKey===key)continue;c.cameraKey=key;spatial.audit.staticUpdates++;c.group.updateMatrixWorld();const p=c.points.map((v,i)=>{const q=v.clone().applyMatrix4(c.group.matrixWorld).project(camera);return {x:q.x,y:q.y,i};});
   p.sort((a,b)=>a.x-b.x||a.y-b.y);const cross=(a,b,c)=>(b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x),lo=[],hi=[];for(const q of p){while(lo.length>1&&cross(lo.at(-2),lo.at(-1),q)<=0)lo.pop();lo.push(q);}for(const q of p.slice().reverse()){while(hi.length>1&&cross(hi.at(-2),hi.at(-1),q)<=0)hi.pop();hi.push(q);}const hull=lo.slice(0,-1).concat(hi.slice(0,-1));if(hull.length){hull.push(hull[0]);const a=c.outline.geometry.attributes.instanceStart.data;const arr=[];for(let i=0;i<hull.length-1;i++)arr.push(...c.points[hull[i].i].toArray(),...c.points[hull[i+1].i].toArray());a.array.set(arr);a.needsUpdate=true;c.outline.geometry.instanceCount=hull.length-1;}
   const localCam=c.group.worldToLocal(cam.clone()),side=localCam.x>0?1:-1;for(const w of c.wheels)w.position.x=.91*side;
  }
  for(const t of trees){t.group.rotation.y=Math.atan2(cam.x-t.group.position.x,cam.z-t.group.position.z);t.group.rotation.z=reducedMotion?0:Math.sin(time*.9+t.phase)*.018;t.group.updateMatrixWorld();}
  ink.update(camera,trees,cars,thinLines);
 }
 function resize(w,h){resolution=[w,h];for(const m of lineMaterials)m.resolution.set(w,h);ink.resize(w,h);}
 function releaseObject(root){if(!root||releasedObjects.has(root))return;releasedObjects.add(root);const scope=createResourceScope({shared});scope.trackObject(root);scope.dispose();}
 function dispose(){if(disposed)return;disposed=true;spatial.dispose();releaseObject(base);base.removeFromParent();sharedScope.dispose();}
 return {stroke,lineMaterial,mainInk,detailInk,groundInk,face,inkAudit:ink.audit,update,resize,audit,patch,register,releaseObject,dispose,
  prepare:spatial.prepare,collisionCandidates:spatial.collisionCandidates,residencyAudit:spatial.audit,active:spatial.active,
  get auditRevision(){return auditRevision;},get cameraKey(){return spatial.cameraKey;},get meshes(){return spatial.active('meshes');},get cars(){return spatial.active('cars');},get trees(){return spatial.active('trees');},get openings(){return spatial.active('openings');}};
 }catch(error){
  spatial.dispose();const abandoned=createResourceScope({shared});
  for(const root of [...scene.children])if(!existingRoots.has(root)){abandoned.trackObject(root);root.removeFromParent();}
  abandoned.dispose();sharedScope.dispose();throw error;
 }
}
