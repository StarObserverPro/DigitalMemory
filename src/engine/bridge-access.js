import {SpatialIndex} from './spatial-index.js';
import {corridorSection} from '../../scenes/fengtai-bridges/corridor-section.mjs';
import {sideSurface} from '../../scenes/fengtai-bridges/levels.mjs';

const inside=(p,ring)=>{let yes=false;for(let i=0,j=ring.length-1;i<ring.length;j=i++){const a=ring[i],b=ring[j];if((a[1]>p[1])!==(b[1]>p[1])&&p[0]<(b[0]-a[0])*(p[1]-a[1])/(b[1]-a[1])+a[0])yes=!yes;}return yes;};
const project=(p,a,b)=>{const dx=b[0]-a[0],dz=b[1]-a[1],t=Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dz)/(dx*dx+dz*dz||1)));return{t,point:[a[0]+dx*t,a[1]+dz*t],distance:Math.hypot(p[0]-a[0]-dx*t,p[1]-a[1]-dz*t)};};

/** Uses the registered frames, never illustration pixels, for the shared ground. */
export function bridgeFrame(model,data){
 const scale=[data.kx/model.frame.sx,data.ky/model.frame.sz],offset=[(model.frame.origin[0]-data.origin[0])*data.kx,(data.origin[1]-model.frame.origin[1])*data.ky];
 return{scale,offset,toWorld:p=>[offset[0]+p[0]*scale[0],offset[1]+p[1]*scale[1]],toModel:p=>[(p[0]-offset[0])/scale[0],(p[1]-offset[1])/scale[1]]};
}

export function createBridgeAccess(data){
 const model=data.bridgeCorridor;if(!model)return null;
 const frame=bridgeFrame(model,data),index=new SpatialIndex(64),supports=new SpatialIndex(32),roads=new SpatialIndex(64),pointBounds=p=>({minX:p[0],maxX:p[0],minZ:p[1],maxZ:p[1]}),box=(points,pad)=>({minX:Math.min(...points.map(p=>p[0]))-pad,maxX:Math.max(...points.map(p=>p[0]))+pad,minZ:Math.min(...points.map(p=>p[1]))-pad,maxZ:Math.max(...points.map(p=>p[1]))+pad});
 for(let i=1;i<model.ring.length;i++){const a=model.ring[i-1],b=model.ring[i];index.insert(i,box([[a.x,a.z],[b.x,b.z]],70),{a,b});}
 for(const[pier,i]of model.supports.map((p,i)=>[p,i])){const poly=pier.poly||[[pier.x-pier.width/2,pier.z-pier.depth/2],[pier.x+pier.width/2,pier.z-pier.depth/2],[pier.x+pier.width/2,pier.z+pier.depth/2],[pier.x-pier.width/2,pier.z+pier.depth/2]];supports.insert(i,box(poly,.4),{...pier,poly});}
 for(const road of model.roads)for(let i=1;i<road.points.length;i++)roads.insert(road.id+':'+i,box([road.points[i-1],road.points[i]],road.width/2),{road,a:road.points[i-1],b:road.points[i]});
 function nearestLocal(p){let best=null;for(const{a,b}of index.query(pointBounds(p))){const q=project(p,[a.x,a.z],[b.x,b.z]);if(!best||q.distance<best.distance){const t=q.t,v={};for(const key of ['x','z','y','nx','nz','s','lat'])v[key]=a[key]+(b[key]-a[key])*t;best={...q,p:v,off:(p[0]-v.x)*v.nx+(p[1]-v.z)*v.nz};}}return best;}
 let previousPoint=null,previousSurface=null;
 function surface(point){if(previousPoint&&previousPoint[0]===point[0]&&previousPoint[1]===point[1])return previousSurface;previousPoint=[...point];previousSurface=computeSurface(point);return previousSurface;}
 function computeSurface(point){const p=frame.toModel(point),n=nearestLocal(p);if(n){const c=corridorSection(n.p),off=Math.abs(n.off),side=Math.sign(n.off)||1;if(off>=c.serviceInner+.35&&off<=c.walkOuter-.25)return{height:sideSurface(n.p,side)+(off>=c.walkInner?.18:0),station:n.p.s,side,kind:off>=c.walkInner?'walkway':'service-road'};}
  for(const{road,a,b}of roads.query(pointBounds(p))){const q=project(p,a,b);if(q.distance>road.width/2-.3)continue;const near=nearestLocal(q.point);if(!near)return{height:.1,kind:'road'};const side=Math.sign(near.off)||1,blend=Math.max(0,Math.min(1,(80-Math.abs(near.off))/45));return{height:.1+(sideSurface(near.p,side)-.1)*blend,kind:'road'};}
  return null;
 }
 function blocked(point){const p=frame.toModel(point),n=nearestLocal(p);if(n&&n.p.lat>39.8421&&n.p.lat<39.8488&&Math.abs(n.off)<corridorSection(n.p).serviceInner+.3)return true;const h=surface(point)?.height??0;return supports.query(pointBounds(p)).some(s=>s.bottom<=h+1.7&&s.top>h+.1&&(inside(p,s.poly)||s.poly.some((a,i)=>project(p,a,s.poly[(i+1)%s.poly.length]).distance<.35)));}
 function under(point){const p=frame.toModel(point);for(const b of model.crossings){const yaw=Math.atan(.39),dx=p[0]-b.displayCenter[0],dz=p[1]-b.displayCenter[1],u=dx*Math.cos(yaw)-dz*Math.sin(yaw),v=dx*Math.sin(yaw)+dz*Math.cos(yaw);if(Math.abs(u)<b.length/2&&Math.abs(v)<b.width/2)return true;}const n=nearestLocal(p);return Boolean(n&&Math.abs(n.off)<18.7&&n.p.y>2);}
 return{frame,surface,height:p=>surface(p)?.height??0,blocked,under,dispose(){index.clear();supports.clear();roads.clear();}};
}
