export function inside(p,ring){let v=false;for(let i=0,j=ring.length-1;i<ring.length;j=i++){const a=ring[i],b=ring[j];if((a[1]>p[1])!==(b[1]>p[1])&&p[0]<(b[0]-a[0])*(p[1]-a[1])/(b[1]-a[1])+a[0])v=!v;}return v;}
export function segmentDistance(p,a,b){const x=b[0]-a[0],z=b[1]-a[1],t=Math.max(0,Math.min(1,((p[0]-a[0])*x+(p[1]-a[1])*z)/(x*x+z*z)));return Math.hypot(p[0]-a[0]-t*x,p[1]-a[1]-t*z);}
export function basis(p,d){return {s:p[0]*d[0]+p[1]*d[1],d:-p[0]*d[1]+p[1]*d[0]};}
export function makeNavigation(data){
 const N=data.northDirection,E=data.eastDirection,b=data.bounds,step=1,cols=Math.ceil((b.maxX-b.minX)/step)+1,rows=Math.ceil((b.maxZ-b.minZ)/step)+1;
 const obstacles=data.buildings.map(o=>({ring:o.originalRing,minX:Math.min(...o.originalRing.map(p=>p[0]))-.45,maxX:Math.max(...o.originalRing.map(p=>p[0]))+.45,minZ:Math.min(...o.originalRing.map(p=>p[1]))-.45,maxZ:Math.max(...o.originalRing.map(p=>p[1]))+.45}));
 function inPaving(p){
  const n=basis(p,N),e=basis(p,E);
  const left=n.s<45?31:n.s<80?22:15;
  let yes=(n.s>=4&&n.s<=data.northLength&&((n.d>=-left&&n.d<=-5.35)||(n.d>=5.35&&n.d<=18))) || (e.s>=-31&&e.s<=data.eastLength&&((e.d>=-20&&e.d<=-6.7)||(e.d>=6.7&&e.d<=12&&e.s<10))) || (n.s>=5&&n.s<=9&&Math.abs(n.d)<18);
  for(const g of [data.landmarks.north,data.landmarks.east])if(segmentDistance(p,g.position,g.anchor)<3.7)yes=true;
  return yes;
 }
 function blocked(p){
  for(const o of obstacles){if(p[0]<o.minX||p[0]>o.maxX||p[1]<o.minZ||p[1]>o.maxZ)continue;if(inside(p,o.ring))return true;for(let i=0;i<o.ring.length;i++)if(segmentDistance(p,o.ring[i],o.ring[(i+1)%o.ring.length])<.4)return true;}
  for(const c of data.cars){const dx=p[0]-c.position[0],dz=p[1]-c.position[1],s=Math.sin(c.yaw),co=Math.cos(c.yaw);if(Math.abs(dx*co-dz*s)<1.15&&Math.abs(dx*s+dz*co)<2.5)return true;}
  return false;
 }
 function walkable(p){return p[0]>=b.minX&&p[0]<=b.maxX&&p[1]>=b.minZ&&p[1]<=b.maxZ&&inPaving(p)&&!blocked(p);}
 const cells=new Uint8Array(cols*rows),positions=[];
 const pos=id=>[b.minX+(id%cols)*step,b.minZ+Math.floor(id/cols)*step];
 for(let id=0;id<cells.length;id++){const p=pos(id);if(walkable(p)){cells[id]=1;positions.push(id);}}
 function closest(p,max=Infinity){let best=-1,d=max*max;for(const id of positions){const q=pos(id),v=(q[0]-p[0])**2+(q[1]-p[1])**2;if(v<d){d=v;best=id;}}return best;}
 function clear(a,c){const d=Math.hypot(c[0]-a[0],c[1]-a[1]),n=Math.ceil(d/.35);for(let i=0;i<=n;i++)if(!walkable([a[0]+(c[0]-a[0])*i/(n||1),a[1]+(c[1]-a[1])*i/(n||1)]))return false;return true;}
 function route(from,to,maxSnap=8){
  const start=closest(from,4),end=closest(to,maxSnap);if(start<0||end<0)return null;if(start===end)return [pos(end)];
  const cost=new Float32Array(cells.length);cost.fill(Infinity);const previous=new Int32Array(cells.length);previous.fill(-1);const closed=new Uint8Array(cells.length),heap=[];
  function push(id,f){heap.push({id,f});let i=heap.length-1;while(i){const j=(i-1)>>1;if(heap[j].f<=f)break;heap[i]=heap[j];i=j;}heap[i]={id,f};}
  function pop(){const first=heap[0],last=heap.pop();if(heap.length){let i=0;while(i*2+1<heap.length){let j=i*2+1;if(j+1<heap.length&&heap[j+1].f<heap[j].f)j++;if(heap[j].f>=last.f)break;heap[i]=heap[j];i=j;}heap[i]=last;}return first.id;}
  const ep=pos(end),heuristic=id=>Math.hypot(pos(id)[0]-ep[0],pos(id)[1]-ep[1]);cost[start]=0;push(start,heuristic(start));
  while(heap.length){const id=pop();if(closed[id])continue;if(id===end){const r=[];let c=end;while(c!==-1){r.push(pos(c));c=previous[c];}r.reverse();const out=[r[0]];for(let i=1;i<r.length;){let k=i;while(k+1<r.length&&clear(out.at(-1),r[k+1]))k++;out.push(r[k]);i=k+1;}return out;}
   closed[id]=1;const x=id%cols,y=Math.floor(id/cols);
   for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]){const xx=x+dx,yy=y+dy;if(xx<0||xx>=cols||yy<0||yy>=rows)continue;const n=yy*cols+xx;if(!cells[n]||closed[n])continue;if(dx&&dy&&(!cells[y*cols+xx]||!cells[yy*cols+x]))continue;const c=cost[id]+(dx&&dy?Math.SQRT2:1);if(c<cost[n]){cost[n]=c;previous[n]=id;push(n,c+heuristic(n));}}
  }return null;
 }
 return {walkable,route,closest:p=>{const id=closest(p);return id<0?null:pos(id);},clear,cellCount:positions.length,blocked};
}
export function routeLength(path){return path?path.slice(1).reduce((s,p,i)=>s+Math.hypot(p[0]-path[i][0],p[1]-path[i][1]),0):Infinity;}
