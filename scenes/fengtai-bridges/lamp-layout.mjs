const dot=(a,b)=>a[0]*b[0]+a[1]*b[1],mid=poly=>poly.reduce((a,p)=>[a[0]+p[0]/poly.length,a[1]+p[1]/poly.length],[0,0]);
function facingEdge(poly,open,tangent){
 let best=null;
 for(let i=0;i<poly.length;i++){const a=poly[i],b=poly[(i+1)%poly.length],d=[b[0]-a[0],b[1]-a[1]],length=Math.hypot(...d);if(!length||Math.abs(dot(d,tangent))/length<.9)continue;let normal=[d[1]/length,-d[0]/length];if(dot(normal,open)<0)normal=normal.map(x=>-x);if(dot(normal,open)<.985)continue;const score=dot([(a[0]+b[0])/2,(a[1]+b[1])/2],open);if(!best||score>best.score)best={a,b,normal,length,score};}
 if(!best)throw Error('No supporting face');return best;
}
export function lampLayout(data,built){
 const sites=[];
 for(const bridge of built.crossings){const[cx,cz]=bridge.displayCenter,host=data.ring.reduce((a,p)=>Math.hypot(p.x-cx,p.z-cz)<Math.hypot(a.x-cx,a.z-cz)?p:a),n=[host.nx,host.nz],t=[-host.nz,host.nx];
  for(const side of [-1,1]){
   const outward=n.map(x=>x*side),append=(poly,open,count,kind)=>{const edge=facingEdge(poly,open,t);for(let i=0;i<count;i++){const fraction=(i+1)/(count+1),a=edge.a,b=edge.b,anchor=[a[0]+(b[0]-a[0])*fraction,bridge.underside-.48,a[1]+(b[1]-a[1])*fraction];sites.push({id:bridge.type+'-'+side+'-'+kind+'-'+i,bridge:bridge.id,bridgeType:bridge.type,side,kind,index:i,anchor,wallNormal:[edge.normal[0],0,edge.normal[1]],tangent:[t[0],0,t[1]],surfacePolygon:poly,rayMark:true,underside:bridge.underside});}};
   if(bridge.type==='road'){
    const columns=built.piers.filter(p=>p.owner===bridge.id&&!p.poly&&p.width<2&&dot([p.x-cx,p.z-cz],outward)>15).sort((a,b)=>dot([a.x-b.x,a.z-b.z],t));
    columns.forEach((p,i)=>append([[p.x-p.width/2,p.z-p.depth/2],[p.x+p.width/2,p.z-p.depth/2],[p.x+p.width/2,p.z+p.depth/2],[p.x-p.width/2,p.z+p.depth/2]],outward,1,'column-'+i));
   }else{
    for(const bound of built.supportBounds.filter(p=>p.owner===bridge.id)){
     const m=mid(bound.poly),off=dot([m[0]-cx,m[1]-cz],outward);if(off<15)continue;
     if(bound.type==='rail-frame-wall'&&off<25)append(bound.poly,outward,4,'inner-wall');
     if(bound.type==='abutment')append(bound.poly,outward.map(x=>-x),2,'outer-wall');
    }
   }
  }
 }
 return sites;
}
