import * as T from '../xinhua-junction-outline/vendor/three/build/three.module.js';
export function orientedTriangle(out,a,b,c,normal){const u=b.map((x,i)=>x-a[i]),v=c.map((x,i)=>x-a[i]),n=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]];if(Math.hypot(...n)<1e-9)return;if(n.reduce((s,x,i)=>s+x*normal[i],0)<0)[b,c]=[c,b];out.push(a,b,c);}
export function cleanPolygon(poly){const out=[];for(const p of poly)if(!out.length||Math.hypot(p[0]-out.at(-1)[0],p[1]-out.at(-1)[1])>1e-7)out.push([...p]);if(out.length>1&&Math.hypot(out[0][0]-out.at(-1)[0],out[0][1]-out.at(-1)[1])<1e-7)out.pop();return out;}
export function capBoundary(faces){const edges=new Map();for(const face of faces)for(const[a,b]of[[face[0],face[1]],[face[1],face[2]],[face[2],face[0]]]){const key=[a,b].sort((x,y)=>x-y).join(',');if(edges.has(key))edges.get(key).count++;else edges.set(key,{a,b,count:1});}return[...edges.values()].filter(e=>e.count===1).map(e=>[e.a,e.b]);}
export function prismTriangles(polygon,bottom,top){const poly=cleanPolygon(polygon),out=[];if(poly.length<3)return out;const raw=T.ShapeUtils.triangulateShape(poly.map(p=>new T.Vector2(...p)),[]),faces=[];
 for(const face of raw){let[a,b,c]=face;const p=poly[a],q=poly[b],r=poly[c],ny=(q[1]-p[1])*(r[0]-p[0])-(q[0]-p[0])*(r[1]-p[1]);if(Math.abs(ny)<1e-9)continue;if(ny<0)[b,c]=[c,b];faces.push([a,b,c]);const points=[a,b,c].map(i=>poly[i]);orientedTriangle(out,...points.map(([x,z])=>[x,top,z]),[0,1,0]);orientedTriangle(out,...points.map(([x,z])=>[x,bottom,z]),[0,-1,0]);}
 for(const[i,j]of capBoundary(faces)){const p=poly[i],q=poly[j],a=[p[0],bottom,p[1]],b=[q[0],bottom,q[1]],c=[q[0],top,q[1]],d=[p[0],top,p[1]],n=[-(q[1]-p[1]),0,q[0]-p[0]];orientedTriangle(out,a,b,d,n);orientedTriangle(out,b,c,d,n);}
 return out;
}
export function ribbonTriangles(ps,left,right,yFn,depth=0,closed=false){const out=[],offset=(v,p)=>typeof v==='function'?v(p):v,rp=(p,off,y)=>[p.x+p.nx*off,y,p.z+p.nz*off];
 for(let i=1;i<ps.length;i++){const a=ps[i-1],b=ps[i],ya=yFn(a),yb=yFn(b),al=rp(a,offset(left,a),ya),ar=rp(a,offset(right,a),ya),bl=rp(b,offset(left,b),yb),br=rp(b,offset(right,b),yb);orientedTriangle(out,al,ar,bl,[0,1,0]);orientedTriangle(out,ar,br,bl,[0,1,0]);
  if(depth){const center=[(al[0]+ar[0]+bl[0]+br[0])/4,0,(al[2]+ar[2]+bl[2]+br[2])/4];for(const[p,q]of[[al,bl],[ar,br]]){const lowP=[p[0],p[1]-depth,p[2]],lowQ=[q[0],q[1]-depth,q[2]],n=[(p[0]+q[0])/2-center[0],0,(p[2]+q[2])/2-center[2]];orientedTriangle(out,p,q,lowP,n);orientedTriangle(out,q,lowQ,lowP,n);}if(closed){const low=p=>[p[0],p[1]-depth,p[2]];orientedTriangle(out,low(al),low(ar),low(bl),[0,-1,0]);orientedTriangle(out,low(ar),low(br),low(bl),[0,-1,0]);}}
 }
 if(depth&&closed&&ps.length>1)for(const[index,other,sign]of[[0,1,-1],[ps.length-1,ps.length-2,1]]){const p=ps[index],q=ps[other],y=yFn(p),a=rp(p,offset(left,p),y),b=rp(p,offset(right,p),y),c=[b[0],y-depth,b[2]],d=[a[0],y-depth,a[2]],n=[p.x-q.x,0,p.z-q.z];orientedTriangle(out,a,b,d,n);orientedTriangle(out,b,c,d,n);}
 return out;
}
