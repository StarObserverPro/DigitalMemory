const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const lerp=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*t);
/** No global pixel-to-GPS inverse: correspondence is attached to stable nodes/edges. */
export function createIllustrationMapping(data, transform) {
  const edges=new Map(), nodes=new Map(data.nodes.map(n=>[n.id,n]));let total=0;
  if(nodes.size!==data.nodes.length)throw new Error('Duplicate illustration node');
  for(const e of data.edges){if(!nodes.has(e.from)||!nodes.has(e.to)||JSON.stringify(e.geo)!==JSON.stringify([nodes.get(e.from).geo,nodes.get(e.to).geo])||JSON.stringify(e.art)!==JSON.stringify([nodes.get(e.from).art,nodes.get(e.to).art]))throw new Error('Node/edge correspondence mismatch');const a=transform.toWorld(e.geo[0]),b=transform.toWorld(e.geo[1]),length=Math.hypot(b[0]-a[0],b[1]-a[1]);if(!length||edges.has(e.id))throw new Error('Invalid illustration edge');edges.set(e.id,{...structuredClone(e),start:total,length});total+=length;}
  const valid=r=>!!r&&edges.has(r.edgeId)&&Number.isFinite(r.t)&&r.t>=0&&r.t<=1;
  function locate(route){if(!valid(route))throw new Error('Unregistered route location');const e=edges.get(route.edgeId);return{edgeId:e.id,t:route.t,geo:lerp(e.geo[0],e.geo[1],route.t),art:lerp(e.art[0],e.art[1],route.t),distance:e.start+e.length*route.t};}
  function atDistance(d,direction=1){d=clamp(d,0,total);const e=[...edges.values()].find(e=>d<=e.start+e.length)||[...edges.values()].at(-1);return{edgeId:e.id,t:clamp((d-e.start)/e.length,0,1),direction};}
  function advance(route,meters,bounds=[0,total]){return atDistance(clamp(locate(route).distance+meters,...bounds),meters<0?-1:meters>0?1:route.direction);}
  function nearestArt(p){let best=null;for(const e of edges.values()){const [a,b]=e.art,dx=b[0]-a[0],dy=b[1]-a[1],t=clamp(((p[0]-a[0])*dx+(p[1]-a[1])*dy)/(dx*dx+dy*dy),0,1),q=lerp(a,b,t),distance=Math.hypot(q[0]-p[0],q[1]-p[1]);if(!best||distance<best.distance)best={route:{edgeId:e.id,t,direction:1},distance};}return best;}
  return Object.freeze({data,edges,total,valid,locate,atDistance,advance,nearestArt});
}
export const STAGE = Object.freeze({min:360,max:500,lateralMin:4.65,lateralMax:7.05,speed:2.5,revision:'xinhua-scenic-flats-r1'});
export function advanceStage(route,street,input,seconds,mapping){
  const dt=clamp(seconds,0,.05),heading=street.heading+clamp(input.turn||0,-1,1)*1.65*dt,d=clamp(input.forward||0,-1,1)*STAGE.speed*dt;
  return {route:mapping.advance(route,Math.cos(heading)*d,[STAGE.min,STAGE.max]),street:{heading,lateral:clamp(street.lateral+Math.sin(heading)*d,STAGE.lateralMin,STAGE.lateralMax)}};
}
