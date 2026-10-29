import { SpatialIndex } from '../../src/engine/spatial-index.js';
import { createNavigationGrid } from '../../src/engine/navigation-grid.js';

export function inside(p,ring){let v=false;for(let i=0,j=ring.length-1;i<ring.length;j=i++){const a=ring[i],b=ring[j];if((a[1]>p[1])!==(b[1]>p[1])&&p[0]<(b[0]-a[0])*(p[1]-a[1])/(b[1]-a[1])+a[0])v=!v;}return v;}
export function segmentDistance(p,a,b){const x=b[0]-a[0],z=b[1]-a[1],t=Math.max(0,Math.min(1,((p[0]-a[0])*x+(p[1]-a[1])*z)/(x*x+z*z)));return Math.hypot(p[0]-a[0]-t*x,p[1]-a[1]-t*z);}
export function basis(p,d){return {s:p[0]*d[0]+p[1]*d[1],d:-p[0]*d[1]+p[1]*d[0]};}
export function segmentGap(a,b,c,d){
 const cross=(p,q,r)=>(q[0]-p[0])*(r[1]-p[1])-(q[1]-p[1])*(r[0]-p[0]);
 if(cross(a,b,c)*cross(a,b,d)<=0&&cross(c,d,a)*cross(c,d,b)<=0&&Math.max(a[0],b[0])>=Math.min(c[0],d[0])&&Math.max(c[0],d[0])>=Math.min(a[0],b[0])&&Math.max(a[1],b[1])>=Math.min(c[1],d[1])&&Math.max(c[1],d[1])>=Math.min(a[1],b[1]))return 0;
 return Math.min(segmentDistance(a,c,d),segmentDistance(b,c,d),segmentDistance(c,a,b),segmentDistance(d,a,b));
}
export function makeNavigation(data){
 const N=data.northDirection,E=data.eastDirection,b=data.bounds;
 const surfaces=new SpatialIndex(64),obstacles=new SpatialIndex(32),edges=new SpatialIndex(32);
 let serial=0,disposed=false;
 const bounds=(points,pad=0)=>({minX:Math.min(...points.map(p=>p[0]))-pad,maxX:Math.max(...points.map(p=>p[0]))+pad,minZ:Math.min(...points.map(p=>p[1]))-pad,maxZ:Math.max(...points.map(p=>p[1]))+pad});
 const pointBounds=p=>({minX:p[0],maxX:p[0],minZ:p[1],maxZ:p[1]});
 const segmentBounds=(a,b)=>bounds([a,b]);
 const polygonContains=(p,g)=>inside(p,g.ring)&&!(g.holes||[]).some(h=>inside(p,h));
 for(const g of [...(data.nonRoadAreas||[]),...(data.greenAreas||[])])surfaces.insert(serial++,bounds(g.ring),{g,excluded:true});
 // Road colour and pedestrian access are independent: this memoir allows
 // crossing the registered carriageway wherever the ground is unobstructed.
 for(const g of [...(data.paving||[]),...(data.corridorRoadSurfaces||[]),...(data.roadSurfaces||[])])surfaces.insert(serial++,bounds(g.ring),{g,excluded:false});
 function circle(position,radius){
  if(!(radius>0))return;
  const box=bounds([position],radius),point=p=>Math.hypot(p[0]-position[0],p[1]-position[1])<radius;
  obstacles.insert(serial++,box,point);edges.insert(serial++,box,(a,b)=>segmentDistance(position,a,b)<radius);
 }
 function wall(a,b,radius){
  const box=bounds([a,b],radius);
  obstacles.insert(serial++,box,p=>segmentDistance(p,a,b)<radius);
  edges.insert(serial++,box,(c,d)=>segmentGap(a,b,c,d)<radius);
 }
 for(const o of [...data.buildings,...(data.frontageBuildings||[])]){
  const ring=o.originalRing;
  obstacles.insert(serial++,bounds(ring,.45),p=>inside(p,ring)||ring.some((a,i)=>segmentDistance(p,a,ring[(i+1)%ring.length])<.4));
 }
 for(const bridge of data.bridges||[])for(const pier of bridge.piers)circle(pier.position,pier.collisionRadius);
 for(const e of [...(data.streetProps||[]),...(data.trashBins||[]),...(data.equipment||[])])circle(e.position,e.collisionRadius);
 for(const w of data.streetWalls||[])wall(w.points[0],w.points[1],.55);
 for(const f of data.fences||[])for(let i=1;i<f.points.length;i++)wall(f.points[i-1],f.points[i],f.collisionRadius||.55);
 for(const bench of data.benches||[])circle(bench.position,1.2);
 for(const c of data.cars){
  const sine=Math.sin(c.yaw),cosine=Math.cos(c.yaw);
  obstacles.insert(serial++,bounds([c.position],Math.hypot(1.15,2.5)),p=>{const dx=p[0]-c.position[0],dz=p[1]-c.position[1];return Math.abs(dx*cosine-dz*sine)<1.15&&Math.abs(dx*sine+dz*cosine)<2.5;});
 }
 for(const t of data.trees)circle(t.position,.38);
 function inPaving(p){
  const candidates=surfaces.query(pointBounds(p));
  if(candidates.some(({g,excluded})=>excluded&&polygonContains(p,g)))return false;
  if(candidates.some(({g,excluded})=>!excluded&&polygonContains(p,g)))return true;
  const n=basis(p,N),e=basis(p,E),left=n.s<45?31:n.s<80?22:15;
  let yes=(n.s>=4&&n.s<=data.northLength&&n.d>=-left&&n.d<=18) || (e.s>=-31&&e.s<=data.eastLength&&e.d>=-20&&e.d<=12) || (n.s>=5&&n.s<=9&&Math.abs(n.d)<18);
  for(const g of [data.landmarks.north,data.landmarks.east])if(segmentDistance(p,g.position,g.anchor)<3.7)yes=true;
  return yes;
 }
 function blocked(p){return !disposed&&obstacles.query(pointBounds(p)).some(test=>test(p));}
 function walkable(p){return !disposed&&p[0]>=b.minX&&p[0]<=b.maxX&&p[1]>=b.minZ&&p[1]<=b.maxZ&&inPaving(p)&&!blocked(p);}
 function clear(a,c){
  if(disposed||edges.query(segmentBounds(a,c)).some(test=>test(a,c)))return false;
  const distance=Math.hypot(c[0]-a[0],c[1]-a[1]),n=Math.ceil(distance/.35);
  for(let i=0;i<=n;i++)if(!walkable([a[0]+(c[0]-a[0])*i/(n||1),a[1]+(c[1]-a[1])*i/(n||1)]))return false;
  return true;
 }
 const grid=createNavigationGrid({bounds:b,isWalkable:walkable,clear});
 function route(from,to,maxSnap=8){
  if(walkable(from)&&walkable(to)&&clear(from,to))return [[...from],[...to]];
  return grid.route(from,to,maxSnap);
 }
 return {walkable,route,closest:grid.closest,clear,blocked,get cellCount(){return grid.cellCount;},stats:grid.stats,
  dispose(){if(disposed)return;disposed=true;grid.dispose();surfaces.clear();obstacles.clear();edges.clear();}};
}
export function routeLength(path){return path?path.slice(1).reduce((s,p,i)=>s+Math.hypot(p[0]-path[i][0],p[1]-path[i][1]),0):Infinity;}
