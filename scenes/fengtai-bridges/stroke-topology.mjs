export const STYLES={
 service:{width:1.65,rank:2},
 bridge:{width:3.2,rank:6},motorway:{width:2.65,rank:4},walk:{width:1.35,rank:2},
 railing:{width:1.6,rank:3},track:{width:1.6,rank:2},ground:{width:1.2,rank:1},lane:{width:1.3,rank:0},
 main:{width:2.8,rank:4},detail:{width:1.65,rank:2},
 boundary:{width:1.35,rank:1},mark:{width:1.05,rank:0},
 context:{width:2.8,rank:4}
};
const sub=(a,b)=>a.map((x,i)=>x-b[i]),dot=(a,b)=>a.reduce((s,x,i)=>s+x*b[i],0);
const mix=(a,b,t)=>a.map((x,i)=>x+(b[i]-x)*t),clamp=x=>Math.max(0,Math.min(1,x));
const distance=(a,b)=>Math.hypot(...sub(a,b));
function closest(a,b,c,d){
 const u=sub(b,a),v=sub(d,c),w=sub(a,c),aa=dot(u,u),bb=dot(u,v),cc=dot(v,v),dd=dot(u,w),ee=dot(v,w),den=aa*cc-bb*bb;
 let s=den>1e-12?clamp((bb*ee-cc*dd)/den):0,t=cc?clamp((bb*s+ee)/cc):0;
 s=aa?clamp((bb*t-dd)/aa):0;t=cc?clamp((bb*s+ee)/cc):0;
 return{s,t,distance:distance(mix(a,b,s),mix(c,d,t))};
}
export function buildStrokeGraph(input,epsilon=.04){
 const lines=input.filter(s=>distance(s.a,s.b)>epsilon/10).map((s,i)=>({...s,id:i,cuts:[0,1]}));
 const cells=new Map(),pairs=new Set(),cell=20;
 for(let i=0;i<lines.length;i++){
  const s=lines[i],lo=s.a.map((x,k)=>Math.floor((Math.min(x,s.b[k])-epsilon)/cell)),hi=s.a.map((x,k)=>Math.floor((Math.max(x,s.b[k])+epsilon)/cell));
  for(let x=lo[0];x<=hi[0];x++)for(let y=lo[1];y<=hi[1];y++)for(let z=lo[2];z<=hi[2];z++){
   const key=[x,y,z].join(','),bucket=cells.get(key)||[];
   for(const j of bucket){const pk=j+':'+i;if(pairs.has(pk))continue;pairs.add(pk);const q=lines[j],p=closest(s.a,s.b,q.a,q.b);if(p.distance<=epsilon){s.cuts.push(p.s);q.cuts.push(p.t);}for(const pt of [s.a,s.b]){const v=sub(q.b,q.a),t=clamp(dot(sub(pt,q.a),v)/dot(v,v));if(distance(pt,mix(q.a,q.b,t))<=epsilon)q.cuts.push(t);}for(const pt of [q.a,q.b]){const v=sub(s.b,s.a),t=clamp(dot(sub(pt,s.a),v)/dot(v,v));if(distance(pt,mix(s.a,s.b,t))<=epsilon)s.cuts.push(t);}}
   bucket.push(i);cells.set(key,bucket);
  }
 }
 const nodes=[],nodeCells=new Map(),edges=new Map();let duplicates=0,splits=0;
 function node(p){const c=p.map(x=>Math.floor(x/epsilon));for(let x=-1;x<=1;x++)for(let y=-1;y<=1;y++)for(let z=-1;z<=1;z++)for(const n of nodeCells.get([c[0]+x,c[1]+y,c[2]+z].join(','))||[])if(distance(nodes[n],p)<=epsilon)return n;const n=nodes.push(p)-1,k=c.join(','),bucket=nodeCells.get(k)||[];bucket.push(n);nodeCells.set(k,bucket);return n;}
 for(const s of lines){const ts=[...new Set(s.cuts.map(t=>Math.round(t*1e8)/1e8))].sort((a,b)=>a-b);splits+=Math.max(0,ts.length-2);for(let i=1;i<ts.length;i++){const a=node(mix(s.a,s.b,ts[i-1])),b=node(mix(s.a,s.b,ts[i]));if(a===b)continue;const k=a<b?a+':'+b:b+':'+a,old=edges.get(k),edge={...s,a:nodes[a],b:nodes[b],nodeA:a,nodeB:b};delete edge.cuts;if(old){duplicates++;if(STYLES[s.role].rank>STYLES[old.role].rank)edges.set(k,edge);}else edges.set(k,edge);}}
 const degree=new Uint16Array(nodes.length),segments=[...edges.values()],parent=segments.map((_,i)=>i),byNode=new Map();
 const root=i=>parent[i]===i?i:(parent[i]=root(parent[i]));
 for(let i=0;i<segments.length;i++){const s=segments[i];for(const n of [s.nodeA,s.nodeB]){degree[n]++;const key=n+':'+s.role+':'+s.owner;if(byNode.has(key))parent[root(i)]=root(byNode.get(key));else byNode.set(key,i);}}
 for(let i=0;i<segments.length;i++)segments[i].chain=root(i);
 return{segments,nodes,audit:{input:input.length,edges:edges.size,nodes:nodes.length,duplicates,splits,junctions:[...degree].filter(n=>n>=3).length}};
}
export function coalesceStraightStrokes(segments,epsilon=.0001){
 const adjacent=new Map(),used=new Set(),out=[];
 for(let i=0;i<segments.length;i++)for(const n of [segments[i].nodeA,segments[i].nodeB]){const list=adjacent.get(n)||[];list.push(i);adjacent.set(n,list);}
 const signature=s=>s.owner+':'+s.role+':'+JSON.stringify(s.rule||null);
 for(let i=0;i<segments.length;i++){
  if(used.has(i))continue;const first=segments[i],sig=signature(first);let n=first.nodeA;
  if(adjacent.get(n).length===2&&adjacent.get(first.nodeB).length!==2)n=first.nodeB;
  const points=[],nodes=[];let edge=i;
  while(edge!==undefined&&!used.has(edge)){
   const s=segments[edge],forward=s.nodeA===n;if(!points.length){points.push(forward?s.a:s.b);nodes.push(n);}used.add(edge);n=forward?s.nodeB:s.nodeA;points.push(forward?s.b:s.a);nodes.push(n);
   const list=adjacent.get(n);edge=list.length===2?list.find(j=>!used.has(j)&&signature(segments[j])===sig):undefined;
  }
  const stack=[];
  for(let k=0;k<points.length;k++){
   stack.push(k);while(stack.length>=3){const a=points[stack.at(-3)],b=points[stack.at(-2)],c=points[stack.at(-1)],ac=sub(c,a),t=dot(sub(b,a),ac)/dot(ac,ac);if(t<=0||t>=1||distance(b,mix(a,c,t))>epsilon)break;stack.splice(stack.length-2,1);}
  }
  for(let k=1;k<stack.length;k++){const a=stack[k-1],b=stack[k];out.push({...first,a:points[a],b:points[b],nodeA:nodes[a],nodeB:nodes[b]});}
 }
 return out;
}
