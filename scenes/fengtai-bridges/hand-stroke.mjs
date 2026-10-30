import {corridorSection} from './corridor-section.mjs';
import {interpolateKnots,scalarNoise} from './sketch-path.mjs';
const smooth=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);};
export function handGesture(p,side,total){const seed=side<0?739:1879,end=smooth(Math.min(p.s/9,(total-p.s)/9)),section=corridorSection(p);let common=.74*scalarNoise(p.s,18.5,seed)+.22*scalarNoise(p.s,6.8,seed+37);if(common>0)common*= (.20+.10*(1-section.enclosed))/1.08;return{service:end*(.42+.27*scalarNoise(p.s,13.5,seed+81)+.08*scalarNoise(p.s,5.3,seed+113)),inner:end*(common+.018*scalarNoise(p.s,5.7,seed+157)),outer:end*(common+.018*scalarNoise(p.s,6.3,seed+191))};}
export function makeSidePaths(ring,serviceY){
 const total=ring.at(-1).s,stations=[0];let s=0,index=0;
 while(s<total){s=Math.min(total,s+4.5+2.3*(1+scalarNoise(index++,1,912)));stations.push(s);}
 const sample=station=>{let lo=0,hi=ring.length-1;while(hi-lo>1){const m=(lo+hi)>>1;if(ring[m].s<station)lo=m;else hi=m;}const a=ring[lo],b=ring[hi],t=(station-a.s)/(b.s-a.s),p={};for(const k of ['x','y','z','nx','nz','lat'])p[k]=a[k]+(b[k]-a[k])*t;const length=Math.hypot(p.nx,p.nz);p.nx/=length;p.nz/=length;p.s=station;return p;};
 const paths=[];
 for(const side of [-1,1])for(const kind of ['service','inner','outer']){
  const knots=stations.map(station=>{const p=sample(station),section=corridorSection(p),pen=handGesture(p,side,total),off=side*(kind==='service'?section.serviceInner+pen.service:kind==='inner'?section.walkInner+pen.inner:section.walkOuter+pen.outer);return{s:station,p:[p.x+p.nx*off,serviceY(p,side)+(kind==='service'?.025:.195),p.z+p.nz*off],weight:.94+.11*scalarNoise(station,16,side<0?981:291)};});
  paths.push({id:'side-'+side+'-'+kind,role:kind==='service'?'service':'walk',width:kind==='service'?1.65:1.35,side,kind,curves:interpolateKnots(knots),surface:ring.map(p=>[p.s,serviceY(p,side)+(kind==='service'?.025:.195)]),closed:false});
 }
 return paths;
}
export const handStyle={revision:'cubic-sketch-r7',authoring:'shared-tangent cubic Bezier chains',renderer:'continuous joined ribbons',flatnessM:.0025,maxStepM:.7,cameraDependent:false};
