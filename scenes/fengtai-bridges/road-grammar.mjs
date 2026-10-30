import {sideTerrace,outerGround} from './levels.mjs';
import {corridorSection,sectionEvidence} from './corridor-section.mjs';
import {makeSidePaths,handStyle} from './hand-stroke.mjs';

export function makeRoadGrammar(data,built){
 const strokes=[],ring=data.ring;
 const add=(a,b,role,owner,feature)=>strokes.push({a,b,role,owner,feature});
 const rp=(p,off,y=p.y)=>[p.x+p.nx*off,y,p.z+p.nz*off];
 function sample(station){let lo=0,hi=ring.length-1;while(hi-lo>1){const m=(lo+hi)>>1;if(ring[m].s<station)lo=m;else hi=m;}const a=ring[lo],b=ring[hi],t=Math.max(0,Math.min(1,(station-a.s)/(b.s-a.s)));const p={};for(const k of ['x','z','y','nx','nz','lat','s'])p[k]=a[k]+(b[k]-a[k])*t;return p;}
 function route(off,yFn,role,feature,selection=()=>true){for(let i=1;i<ring.length;i++){const a=ring[i-1],b=ring[i];if(selection(a)&&selection(b))add(rp(a,typeof off==='function'?off(a):off,yFn(a)),rp(b,typeof off==='function'?off(b):off,yFn(b)),role,'fourth-ring-system',feature);}}
 for(const s of built.strokes){
  if(s.owner==='fourth-ring-system'){if(s.role==='main')strokes.push({...s,role:'bridge',feature:'elevated-structure',rule:null});}
  else if(s.owner.startsWith('fengtai-')&&!s.rule&&Math.max(s.a[1],s.b[1])<=-1.09)strokes.push({...s,feature:'support'});
 }
 for(const off of [-18.2,18.2])route(off,p=>p.y+.04,'motorway','motorway-edge');
 route(0,p=>p.y+.25,'ground','median');
 for(const carriage of [-data.dimensions.carriagewayOffset,data.dimensions.carriagewayOffset])for(const lane of [-3.5,3.5])for(let station=0;station<ring.at(-1).s;station+=32){
  const end=Math.min(station+11,ring.at(-1).s),points=[sample(station),...ring.filter(p=>p.s>station&&p.s<end),sample(end)];
  for(let i=1;i<points.length;i++)add(rp(points[i-1],carriage+lane,points[i-1].y+.035),rp(points[i],carriage+lane,points[i].y+.035),'lane','fourth-ring-system','lane-dash-'+carriage+'-'+lane+'-'+station);
 }
 const inTrench=p=>p.lat>39.8421&&p.lat<39.8488;
 const paths=makeSidePaths(ring,built.serviceY);
 for(const side of [-1,1]){
  const wall=p=>side*(corridorSection(p).serviceInner-.28);
  route(wall,p=>built.serviceY(p,side)+.435,'ground','inner-low-wall',inTrench);
  for(const height of [.93,1.08])route(wall,p=>built.serviceY(p,side)+height,'railing','traffic-rail',inTrench);
  for(let station=0;station<ring.at(-1).s;station+=14){const p=sample(station);if(inTrench(p))add(rp(p,wall(p),built.serviceY(p,side)+.42),rp(p,wall(p),built.serviceY(p,side)+1.12),'railing','fourth-ring-system','traffic-post');}
  route(p=>side*corridorSection(p).outerWall,p=>outerGround(p,side)+.015,'ground','outer-ground',p=>inTrench(p)&&outerGround(p,side)-built.serviceY(p,side)>2);
 }
 const yaw=Math.atan(.39),c=Math.cos(yaw),sn=Math.sin(yaw);
 for(const bridge of built.crossings){
  const [x,z]=bridge.displayCenter,L=bridge.length,W=bridge.width,uv=(u,v,y)=>[x+c*u+sn*v,y,z-sn*u+c*v],owner=bridge.id;
  for(const side of [-1,1]){
   const edge=side*W/2,inset=side*(W/2-.3),top=bridge.type==='road'?.92:.82;
   add(uv(-L/2,edge,top),uv(L/2,edge,top),'bridge',owner,'deck-edge');
   add(uv(-L/2,edge,-1.1),uv(L/2,edge,-1.1),'ground',owner,'deck-lip');
   add(uv(-L/2,inset,1.65),uv(L/2,inset,1.65),'railing',owner,'handrail');
   for(let u=-L/2;u<=L/2;u+=20)add(uv(u,inset,top),uv(u,inset,1.65),'railing',owner,'railing-post');
  }
  if(bridge.type==='road'){
   const stations=[-245,-180,-100,-L/2,L/2,100,180,245],height=u=>Math.abs(u)<=L/2?.82:.12+.7*Math.max(0,(180-Math.abs(u))/140);
   for(const side of [-1,1])for(let i=1;i<stations.length;i++){
    const a=stations[i-1],b=stations[i];
    add(uv(a,side*13.3,height(a)+.1),uv(b,side*13.3,height(b)+.1),'bridge',owner,'approach-edge');
    add(uv(a,side*8.15,height(a)+.12),uv(b,side*8.15,height(b)+.12),'walk',owner,'bridge-walk');
   }
  }else{
   for(const t of [-16.5,0,16.5]){
    for(const g of [-.72,.72])add(uv(-145,t+g,.95),uv(145,t+g,.95),'track',owner,'fixed-track');
    for(const u of [-95,-87,87,95])add(uv(u,t-1.05,.96),uv(u,t+1.05,.96),'track',owner,'sleeper');
   }
  }
 }
 return{strokes,paths,audit:{dashPeriodM:32,dashLengthM:11,handStyle,walkToServiceRatio:sectionEvidence.ratio,typicalWalkWidthM:5,typicalServiceWidthM:10,fixedRailPairs:3,postsEveryM:20,sourceStrokes:strokes.length}};
}
