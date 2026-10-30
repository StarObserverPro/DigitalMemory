export function contextStrokes(buildings){
 const out=[];
 for(const b of buildings){
  const r=b.ring,area=r.reduce((s,p,i)=>{const q=r[(i+1)%r.length];return s+p[0]*q[1]-q[0]*p[1];},0),sign=area>0?1:-1;
  const normals=r.map((p,i)=>{const q=r[(i+1)%r.length];return[(q[1]-p[1])*sign,0,-(q[0]-p[0])*sign];});
  for(let i=0;i<r.length;i++){
   const p=r[i],q=r[(i+1)%r.length],center=[(p[0]+q[0])/2,0,(p[1]+q[1])/2],rule={kind:'face',center,normal:normals[i]},owner=b.id;
   out.push({a:[p[0],.06,p[1]],b:[q[0],.06,q[1]],role:'context',owner,rule});
   if(!b.open)out.push({a:[p[0],b.height,p[1]],b:[q[0],b.height,q[1]],role:'context',owner,rule});
   out.push({a:[p[0],.06,p[1]],b:[p[0],b.height*(b.open?.8+(i%3)*.09:1),p[1]],role:'context',owner,rule:{kind:'silhouette',center:[p[0],0,p[1]],normal:normals[i],other:normals[(i+r.length-1)%r.length]}});
  }
 }
 return out;
}
