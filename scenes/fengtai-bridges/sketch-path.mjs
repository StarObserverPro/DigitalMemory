export const mix=(a,b,t)=>a.map((x,i)=>x+(b[i]-x)*t);
export const distance=(a,b)=>Math.hypot(...a.map((x,i)=>x-b[i]));
export function cubicPoint(c,t){const u=1-t;return c[0].map((_,i)=>u*u*u*c[0][i]+3*u*u*t*c[1][i]+3*u*t*t*c[2][i]+t*t*t*c[3][i]);}
export function cubicTangent(c,t){const u=1-t;return c[0].map((_,i)=>3*(u*u*(c[1][i]-c[0][i])+2*u*t*(c[2][i]-c[1][i])+t*t*(c[3][i]-c[2][i])));}
export function interpolateKnots(knots,closed=false){return knots.slice(0,-1).map((k,i)=>{const next=knots[i+1],span=next.s-k.s;const tangent=j=>{if(closed&&(j===0||j===knots.length-1)){const a=knots.at(-2),b=knots[1],dt=knots.at(-1).s-a.s+b.s-knots[0].s;return a.p.map((x,d)=>(b.p[d]-x)/dt);}const a=knots[Math.max(0,j-1)],b=knots[Math.min(knots.length-1,j+1)];return a.p.map((x,d)=>(b.p[d]-x)/(b.s-a.s));};const a=tangent(i),b=tangent(i+1);return{c:[k.p,k.p.map((x,d)=>x+a[d]*span/3),next.p.map((x,d)=>x-b[d]*span/3),next.p],s0:k.s,s1:next.s,w0:k.weight??1,w1:next.weight??1};});}
export function samplePath(path,{flatness=.0025,maxStep=.7}={}){
 const out=[];
 function visit(curve,t0,t1,a,b,depth){const mid=(t0+t1)/2,m=cubicPoint(curve.c,mid),chord=mix(a,b,.5),q1=cubicPoint(curve.c,t0+(t1-t0)*.25),q3=cubicPoint(curve.c,t0+(t1-t0)*.75);const error=Math.max(distance(m,chord),distance(q1,mix(a,b,.25)),distance(q3,mix(a,b,.75)));
  if(depth<15&&(distance(a,b)>maxStep||error>flatness)){visit(curve,t0,mid,a,m,depth+1);visit(curve,mid,t1,m,b,depth+1);return;}
  out.push({p:[...b],tangent:cubicTangent(curve.c,t1),station:curve.s0+(curve.s1-curve.s0)*t1,weight:curve.w0+(curve.w1-curve.w0)*t1});
 }
 const first=path.curves[0];out.push({p:[...first.c[0]],tangent:cubicTangent(first.c,0),station:first.s0,weight:first.w0});
 for(const c of path.curves)visit(c,0,1,c.c[0],c.c[3],0);
 if(path.surface){let i=1;for(const sample of out){while(i<path.surface.length-1&&path.surface[i][0]<sample.station)i++;const a=path.surface[i-1],b=path.surface[i],t=Math.max(0,Math.min(1,(sample.station-a[0])/(b[0]-a[0])));sample.p[1]=a[1]+(b[1]-a[1])*t;sample.tangent[1]=(b[1]-a[1])/(b[0]-a[0])*Math.hypot(sample.tangent[0],sample.tangent[2]);}}
 return out;
}
export function scalarNoise(s,span,seed){const control=i=>{let n=Math.imul(i^seed,0x45d9f3b);n=Math.imul(n^(n>>>16),0x45d9f3b);return((n^(n>>>16))>>>0)/4294967295*2-1;};const x=s/span,i=Math.floor(x),t=x-i,a=control(i-1),b=control(i),c=control(i+1),d=control(i+2);return .5*((2*b)+(-a+c)*t+(2*a-5*b+4*c-d)*t*t+(-a+3*b-3*c+d)*t*t*t);}
