import * as T from '../xinhua-junction-outline/vendor/three/build/three.module.js';
import {prismTriangles,ribbonTriangles,orientedTriangle} from './mesh-topology.mjs';
import {sideSurface,sideTerrace,outerGround,evidence as levelsEvidence} from './levels.mjs';
import {corridorSection} from './corridor-section.mjs';
export function buildBridgeGeometry(data){
 const PAPER='#faf9f4',palette={road:'#f0f0e9',side:'#f5f4ed',ground:PAPER,deck:PAPER,wall:PAPER,pier:PAPER,rail:'#f3f0e7',line:'#20231f',ink:'#20231f',walk:'#f6f5ee'};
 const geometry=new T.Group(),batches=new Map(),inkPositions=[],detailPositions=[],whitePositions=[],piers=[],crossings=[],joins=[],supportBounds=[],contextSilhouettes=[],roadInk=[];
 let owner='fourth-ring-system',section='core',surfaceKind='surface';const sectionAudit=[];
 const strokes=[];let inkRule=null;
 const V=(p)=>new T.Vector3(...p),seg=(a,b,arr=inkPositions)=>{arr.push(...a,...b);strokes.push({a,b,owner,role:arr===inkPositions?'main':arr===detailPositions?'detail':arr===whitePositions?'mark':'boundary',rule:inkRule});};
 function batch(g,color=PAPER,kind=surfaceKind){g=g.index?g.toNonIndexed():g;const key=owner+'|'+kind+'|'+color,buf=batches.get(key)||[];sectionAudit.push({key,section,kind,start:buf.length,count:g.attributes.position.array.length});for(const x of g.attributes.position.array)buf.push(x);batches.set(key,buf);g.dispose();}
 function tri(points,color,kind='surface'){const g=new T.BufferGeometry(),out=[];if(kind==='surface'||kind==='overlay')for(let i=0;i<points.length;i+=3)orientedTriangle(out,points[i],points[i+1],points[i+2],[0,1,0]);else out.push(...points);g.setAttribute('position',new T.Float32BufferAttribute(out.flat(2),3));batch(g,color,kind);}
 function box(x,y,z,w,h,d,color=PAPER,yaw=0,draw=false){const g=new T.BoxGeometry(w,h,d);g.rotateY(yaw);g.translate(x,y,z);batch(g,color,'solid');if(draw){const a=[x-w/2,y-h/2,z+d/2],b=[x+w/2,y-h/2,z+d/2],c=[x+w/2,y+h/2,z+d/2],q=[x-w/2,y+h/2,z+d/2];seg(a,q);seg(b,c);seg(q,c);}}
 function prism(poly,bottom,top,color=PAPER,draw=false){if(poly.length<3)return;tri(prismTriangles(poly,bottom,top),color,'solid');if(draw)for(let i=0;i<poly.length;i++)if(i%2===0){const p=poly[i],q=poly[(i+1)%poly.length];seg([p[0],bottom,p[1]],[p[0],top,p[1]]);seg([p[0],top,p[1]],[q[0],top,q[1]]);}}
 const ring=data.ring,D=data.dimensions;
 const ringPoint=(p,off,y=p.y)=>[p.x+p.nx*off,y,p.z+p.nz*off];
 const offsetAt=(offset,p)=>typeof offset==='function'?offset(p):offset;
 function ribbon(ps,left,right,yFn,color=PAPER,depth=0,edges=false,mode='surface'){tri(ribbonTriangles(ps,left,right,yFn,depth,mode==='slab'),color,mode==='slab'?'solid':mode);if(edges)for(let i=1;i<ps.length;i++){const a=ps[i-1],b=ps[i];seg(ringPoint(a,offsetAt(left,a),yFn(a)),ringPoint(b,offsetAt(left,b),yFn(b)));if(i%19<12)seg(ringPoint(a,offsetAt(right,a),yFn(a)),ringPoint(b,offsetAt(right,b),yFn(b)),detailPositions);}}
 function curtain(ps,off,bottomFn,topFn,ink=true){const vs=[];for(let i=1;i<ps.length;i++){const p=ps[i-1],q=ps[i],a=ringPoint(p,offsetAt(off,p),bottomFn(p)),b=ringPoint(q,offsetAt(off,q),bottomFn(q)),c=ringPoint(p,offsetAt(off,p),topFn(p)),d=ringPoint(q,offsetAt(off,q),topFn(q));vs.push(a,b,c,b,d,c);if(ink)seg(c,d,detailPositions);}tri(vs,PAPER,'wall');}
 function path(points,width,color=palette.side,ink=true,mode='surface'){const ps=points.map((p,i)=>{const a=points[Math.max(0,i-1)],b=points[Math.min(points.length-1,i+1)],dx=b[0]-a[0],dz=b[2]-a[2],l=Math.hypot(dx,dz)||1;return{x:p[0],z:p[2],y:p[1],nx:-dz/l,nz:dx/l};});ribbon(ps,-width/2,width/2,p=>p.y,color,0,ink,mode);return ps;}
 function runs(ps,fn){const out=[];let r=[];for(const p of ps){if(fn(p))r.push(p);else{if(r.length>1)out.push(r);r=[];}}if(r.length>1)out.push(r);return out;}
 for(const off of [-D.carriagewayOffset,D.carriagewayOffset]){
  ribbon(ring,off-8.6,off+8.6,p=>p.y,palette.road,1.25,false,'slab');
  for(let i=1;i<ring.length;i++)if(Math.floor(ring[i].s/12)%2===0)for(const lane of [-3.5,0,3.5])seg(ringPoint(ring[i-1],off+lane,ring[i-1].y+.028),ringPoint(ring[i],off+lane,ring[i].y+.028),whitePositions);
 }
 for(const off of [-18.2,18.2])for(let i=1;i<ring.length;i++)if(i%31<22)seg(ringPoint(ring[i-1],off,ring[i-1].y+.035),ringPoint(ring[i],off,ring[i].y+.035),roadInk);
 ribbon(ring,-.45,.45,p=>p.y+.24,PAPER,.42,false);
 for(let i=1;i<ring.length;i++)if(i%23<17)seg(ringPoint(ring[i-1],0,ring[i-1].y+.25),ringPoint(ring[i],0,ring[i].y+.25),detailPositions);
 const serviceY=(p,side=1)=>sideSurface(p,side);
 const trough=runs(ring,p=>p.lat>39.8421&&p.lat<39.8488);
 for(const side of [-1,1]){
  section='service-road';ribbon(ring,p=>side<0?-corridorSection(p).serviceOuter:corridorSection(p).serviceInner,p=>side<0?-corridorSection(p).serviceInner:corridorSection(p).serviceOuter,p=>serviceY(p,side),palette.side,.08,false);
  section='walkway';ribbon(ring,p=>side<0?-corridorSection(p).walkOuter:corridorSection(p).walkInner,p=>side<0?-corridorSection(p).walkInner:corridorSection(p).walkOuter,p=>serviceY(p,side)+.18,palette.walk,.08,false);
  section='side-boundary';
  for(const ps of trough){
   section='inner-divider';
   const wall=p=>corridorSection(p).serviceInner-.28;
   const bank=[];for(let i=1;i<ps.length;i++){const p=ps[i-1],q=ps[i],a=ringPoint(p,side*18.7,p.y+.02),b=ringPoint(q,side*18.7,q.y+.02),c=ringPoint(p,side*(wall(p)-.14),serviceY(p,side)),d=ringPoint(q,side*(wall(q)-.14),serviceY(q,side));bank.push(a,b,c,b,d,c);}tri(bank,PAPER);
   ribbon(ps,p=>side*(wall(p)-.14),p=>side*(wall(p)+.14),p=>serviceY(p,side)+.42,PAPER,0,false);
   for(const offset of [-.14,.14])curtain(ps,p=>side*(wall(p)+offset),p=>serviceY(p,side),p=>serviceY(p,side)+.42,false);
   section='side-boundary';
   curtain(ps,p=>side*corridorSection(p).outerWall,p=>serviceY(p,side),p=>outerGround(p,side));
   ribbon(ps,p=>side*corridorSection(p).outerWall,side*(side<0?65:56),p=>outerGround(p,side),PAPER,0,false);
  }
  section='core';
  for(const ps of runs(ring,p=>p.y>2)){
   ribbon(ps,side*18.6-.2,side*18.6+.2,p=>p.y+.58,PAPER,.64,false,'slab');
   for(let i=1;i<ps.length;i++)seg(ringPoint(ps[i-1],side*18.6,ps[i-1].y+.6),ringPoint(ps[i],side*18.6,ps[i].y+.6));
  }
 }
 for(const ps of runs(ring,p=>p.lat>39.8512))ribbon(ps,-7,7,()=>.12,palette.side,.05,false);
 let last=-1000;
 for(const p of ring){if(p.y<4.8||p.s-last<36)continue;last=p.s;for(const off of [-9.6,9.6]){const[x,,z]=ringPoint(p,off),h=p.y-1.25;box(x,h/2,z,1.5,h,2,PAPER,0,true);box(x,p.y-1.65,z,12.5,.8,2.6,PAPER,0,false);piers.push({x,z,width:1.5,depth:2,bottom:0,top:h,station:p.s});}}
 for(const r of data.roads){const points=r.points.map(pt=>{const p=ring.reduce((a,q)=>Math.hypot(q.x-pt[0],q.z-pt[1])<Math.hypot(a.x-pt[0],a.z-pt[1])?q:a),off=(pt[0]-p.x)*p.nx+(pt[1]-p.z)*p.nz,side=Math.sign(off)||1,blend=Math.max(0,Math.min(1,(80-Math.abs(off))/45));return[pt[0],.1+(serviceY(p,side)-.1)*blend,pt[1]];});path(points,r.width,palette.side,false);}
 path([[-220,.12,-2020],[0,.12,-2034],[220,.12,-2048]],15,palette.side,false);
 const local=([lon,lat])=>[(lon-data.frame.origin[0])*data.frame.sx,(data.frame.origin[1]-lat)*data.frame.sz];
 const yaw=Math.atan(.39),c=Math.cos(yaw),sn=Math.sin(yaw);
 function bridge(id,center,length,width,type){owner=id;const[sx,sz]=local(center),axis=ring.reduce((a,p)=>Math.hypot(p.x-sx,p.z-sz)<Math.hypot(a.x-sx,a.z-sz)?p:a),x=axis.x,z=axis.z,uv=(u,t,y=.8)=>[x+c*u+sn*t,y,z-sn*u+c*t],toUV=p=>[(p[0]-x)*c-(p[1]-z)*sn,(p[0]-x)*sn+(p[1]-z)*c];
  const deck=[uv(-length/2,-width/2),uv(length/2,-width/2),uv(length/2,width/2),uv(-length/2,width/2)].map(p=>[p[0],p[2]]);
  section='deck-solid';prism(deck,-1.1,.8,PAPER,false);
  function clipped(poly){let ps=poly.map(toUV);for(const[axis,sign,limit]of[[0,1,length/2-.12],[0,-1,length/2-.12],[1,1,width/2-.12],[1,-1,width/2-.12]]){const out=[];for(let i=0;i<ps.length;i++){const a=ps[i],b=ps[(i+1)%ps.length],da=sign*a[axis]-limit,db=sign*b[axis]-limit;if(da<=0)out.push(a);if((da<=0)!==(db<=0)){const t=da/(da-db);out.push([a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t]);}}ps=out;}return ps.map(([u,t])=>{const p=uv(u,t);return[p[0],p[2]];});}
  const host=ring.reduce((a,p)=>Math.hypot(p.x-x,p.z-z)<Math.hypot(a.x-x,a.z-z)?p:a),tangent=[-host.nz,host.nx],pierYaw=-Math.atan2(host.nz,host.nx);
  section='support-solid';for(const off of [-41,-20,0,20,41]){
   if(type==='road'&&Math.abs(off)<40){
    for(const row of [-7,7]){const baseX=host.x+host.nx*off,baseZ=host.z+host.nz*off,v0=(baseX-x)*sn+(baseZ-z)*c,tv=tangent[0]*sn+tangent[1]*c,along=(row-v0)/tv;const px=host.x+host.nx*off+tangent[0]*along,pz=host.z+host.nz*off+tangent[1]*along,r=.82;box(px,-3.35,pz,r*2,4.5,r*2,PAPER,0,true);box(px,-1.2,pz,2.4,.2,2.4,PAPER,0,false);const poly=[[px-r,pz-r],[px+r,pz-r],[px+r,pz+r],[px-r,pz+r]];supportBounds.push({owner:id,poly,uv:poly.map(toUV),length,width,type:'column'});piers.push({owner:id,x:px,z:pz,width:r*2,depth:r*2,bottom:-5.6,top:-1.1});}
   }else{
    const centerP=ringPoint(host,off,0),a=[centerP[0],centerP[2]],poly=clipped([[-.55,-width],[.55,-width],[.55,width],[-.55,width]].map(([u,t])=>[a[0]+host.nx*u+tangent[0]*t,a[1]+host.nz*u+tangent[1]*t]));
    prism(poly,-5.6,-1.1,PAPER,true);supportBounds.push({owner:id,poly,uv:poly.map(toUV),length,width,type:Math.abs(off)>40?'abutment':'rail-frame-wall'});piers.push({owner:id,x:a[0],z:a[1],width:1.1,depth:width,yaw:pierYaw,bottom:-5.6,top:-1.1,poly});
   }
  }
  for(const side of [-1,1]){
   const edge=side*width/2;
   inkRule={kind:'deck-top',center:[x,.92,z],normal:[side*sn,0,side*c]};
   seg(uv(-length/2,edge,.92),uv(length/2,edge,.92));
   inkRule={kind:'deck-lip',center:[x,-1.1,z],normal:[side*sn,0,side*c]};
   seg(uv(-length/2,edge,-1.1),uv(length/2,edge,-1.1),detailPositions);
   inkRule=null;
  }
  if(type==='road'){
   const stations=[-245,-180,-100,-length/2,length/2,100,180,245];
   const pts=stations.map(u=>uv(u,0,Math.abs(u)<=length/2?.82:.12+.7*Math.max(0,(180-Math.abs(u))/140)));
   section='road-approach';path(pts,26.6,PAPER,false);path(pts.map(p=>[p[0],p[1]+.025,p[2]]),16,palette.road,false);
   for(const side of [-1,1]){const ps=stations.map((u,i)=>uv(u,side*10.65,pts[i][1]+.1));path(ps,5.3,palette.walk,false);for(let i=1;i<pts.length;i++){seg(uv(stations[i-1],side*8.15,pts[i-1][1]+.12),uv(stations[i],side*8.15,pts[i][1]+.12),detailPositions);seg(uv(stations[i-1],side*13.3,pts[i-1][1]+.1),uv(stations[i],side*13.3,pts[i][1]+.1));}}
   for(const side of [-1,1])joins.push({owner:id,end:side,deck:uv(side*length/2,0,.8),approach:pts[side<0?3:4],gap:.02,widthGap:0});
  }else{
   const pts=[uv(-155,0,.8),uv(-length/2,0,.8),uv(length/2,0,.8),uv(155,0,.8)];section='rail-approach';path(pts.slice(0,2),width,PAPER,false);path(pts.slice(2),width,PAPER,false);
   section='rail-wash';path(pts.map(p=>[p[0],p[1]+.025,p[2]]),40,palette.rail,false,'overlay');
   for(const track of [0,2,4,6,9]){const t=(track-4.5)*5.5;for(const g of [-.72,.72])seg(uv(-155+(track%3)*16,t+g,.93),uv(155-(track%4)*13,t+g,.93),detailPositions);if(track%2===0)for(const u of [-95,-90,-85,78,83,88])seg(uv(u,t-1.1,.94),uv(u,t+1.1,.94),detailPositions);}
   for(const side of [-1,1])joins.push({owner:id,end:side,deck:uv(side*length/2,0,.8),approach:pts[side<0?1:2],gap:0,widthGap:0});
  }
  crossings.push({id,type,displayCenter:[x,z],length,width,deckTop:.8,underside:-1.1,roadSurface:-5.6,clearance:4.5,supportType:type==='road'?'six discrete columns plus end abutments':'four-opening rail frame'});owner='fourth-ring-system';
 }
 bridge('fengtai-1990-road-over-ring',[116.27765,39.84564],80,26.6,'road');
 bridge('fengtai-1990-rail-over-ring',[116.2779,39.84487],80,68.2,'rail');
 owner='registered-context';section='context-solid';for(const b of data.contextBuildings?.records||[]){const h=b.openUpper?.fadeStart||Math.min(b.height,21),poly=b.ring;prism(poly,0,h,PAPER,false);contextSilhouettes.push({id:b.id,ring:poly,height:h,open:!!b.openUpper||b.height>24});}
 for(const[key,positions]of batches){const[name,kind,color]=key.split('|'),g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(positions,3));g.computeVertexNormals();const mesh=new T.Mesh(g,new T.MeshBasicMaterial({color,side:kind==='wall'?T.DoubleSide:T.FrontSide,depthWrite:kind!=='overlay'}));mesh.name=name;mesh.userData.surfaceKind=kind;mesh.userData.batchKey=key;mesh.renderOrder=kind==='overlay'?1:0;geometry.add(mesh);}
 function lines(arr,name,color,opacity=1){const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(arr,3));const o=new T.LineSegments(g,new T.LineBasicMaterial({color,transparent:opacity<1,opacity,depthWrite:false}));o.name=name;geometry.add(o);}
 lines(inkPositions,'selected-main-contours',palette.ink);lines(detailPositions,'selected-structural-details',palette.ink,.72);lines(whitePositions,'sparse-road-markings',palette.line,.64);lines(roadInk,'quiet-road-boundaries','#828c7e',.6);
 return{geometry,piers,crossings,serviceY,ringPoint,palette,supportBounds,joins,levelsEvidence,contextSilhouettes,strokes,sectionAudit,corridorSection};
}
