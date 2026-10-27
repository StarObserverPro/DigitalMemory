import fs from 'node:fs/promises';
import crypto from 'node:crypto';
const root=new URL('.',import.meta.url);
const source=await fs.readFile(new URL('sources/xinhua-spatial-plan.json',root),'utf8');
const plan=JSON.parse(source);
const origin=[116.2849081,39.8421715],kx=111195.08023*Math.cos(origin[1]*Math.PI/180),ky=111195.08023;
const local=([lon,lat])=>[(lon-origin[0])*kx,-(lat-origin[1])*ky];
const geo=([x,z])=>[origin[0]+x/kx,origin[1]-z/ky];
const unit=v=>{const n=Math.hypot(...v);return v.map(a=>a/n);};
const northDirection=unit(local([116.284109,39.8435086]));
const eastDirection=unit(local([116.2856357,39.8424415]));
const point=(direction,s,d=0)=>[direction[0]*s-direction[1]*d,direction[1]*s+direction[0]*d];
const northLength=110,eastLength=108;
const landmarks={
 north:{id:'north',label:'三里西侧入口',position:point(northDirection,100,16.5),anchor:point(northDirection,100,18),source:'Baidu POI 新华街三里小区-西南1门; public address: north of junction about 100 m; satellite/footprint cross-check; approach position approximate',sourceUid:'d11d0e2a2ec203d7b54f544f',positionUncertaintyMetres:15,accessScope:'Outside the entrance only; present-day gate access does not establish historical access'},
 east:{id:'east',label:'三里沿街入口',position:point(eastDirection,94,-17.5),anchor:point(eastDirection,94,-19),source:'Baidu POI 新华街三里小区-南门, inspected on local street map with the junction and streetward tower group; satellite ground-path cross-check. Approach coordinate is approximate, not copied from Baidu viewport centre.',sourceUid:'17a7d37d845bf5d2d92f28a8',positionUncertaintyMetres:15,accessScope:'Outside the entrance only; no compound interior implied'},
 south:{id:'south',label:'新华街路口',position:point(northDirection,7,8),source:'OSM node 534302826, inspected Baidu junction panos'},
 west:{id:'west',label:'路口以西30米',position:point(eastDirection,-30,-9),centerlinePosition:point(eastDirection,-30),distanceAlongMainRoadMetres:30,source:'30 m along OSM Xinhua centreline from node 534302826, north-side pedestrian approach'}
};
function simplify(ring,tol=1.3){
 let pts=ring.slice(0,-1).map(local),changed=true;
 while(changed&&pts.length>4){changed=false;for(let i=0;i<pts.length;i++){
  const a=pts[(i+pts.length-1)%pts.length],b=pts[i],c=pts[(i+1)%pts.length];const ac=[c[0]-a[0],c[1]-a[1]],l=Math.hypot(...ac);const dist=Math.abs(ac[0]*(a[1]-b[1])-ac[1]*(a[0]-b[0]))/l;
  if(dist<tol){pts.splice(i,1);changed=true;break;}
 }}return pts;
}
const relevant=plan.objects.filter(o=>['wuli-east','sanli','heating','sili'].includes(o.compoundId)).filter(o=>{
 const pts=o.geometry.coordinates[0].map(local);return pts.some(([x,z])=>x>-105&&x<160&&z>-175&&z<48);
});
const buildings=relevant.map(o=>({id:o.id,compound:o.compoundId,kind:o.kind,ring:simplify(o.geometry.coordinates[0]),originalRing:o.geometry.coordinates[0].slice(0,-1).map(local),height:o.id==='xinhua-bac3da74-8990-41da-b13e-984e350b9147'?71.1:o.heightMetres,storeys:o.id==='xinhua-bac3da74-8990-41da-b13e-984e350b9147'?24:o.storeys,label:o.id==='xinhua-bac3da74-8990-41da-b13e-984e350b9147'?'三里8号楼':o.facadeTreatment==='restaurant-frontage'?'天悦园':'',heightEvidence:o.id==='xinhua-bac3da74-8990-41da-b13e-984e350b9147'?'User-confirmed 24 storeys; 71.1 m is an illustrative conversion, not measured':o.heightEvidence.status,facade:o.facadeTreatment||'',silhouetteStrokes:1,maxFacadeStrokes:o.kind==='shop'?3:4}));
const parked=[];
for(const [i,p] of [18,31,48,72,91].entries())parked.push({id:'car-nl-'+i,position:point(northDirection,p,-7.9),yaw:Math.atan2(northDirection[0],northDirection[1])+(i<2?.42:0),strokes:4});
for(const [i,p] of [27,66].entries())parked.push({id:'car-nr-'+i,position:point(northDirection,p,8.1),yaw:Math.atan2(northDirection[0],northDirection[1])-.12,strokes:4});
parked.push({id:'car-west',position:point(eastDirection,-19,-11.8),yaw:Math.atan2(eastDirection[0],eastDirection[1]),strokes:4});
parked.push({id:'car-east',position:point(eastDirection,48,-12.8),yaw:Math.atan2(eastDirection[0],eastDirection[1])+.12,strokes:4});
const trees=[];
for(const [i,p] of [14,41,66,96].entries())trees.push({id:'tree-l-'+i,position:point(northDirection,p,-6.3),height:4.4+(i%2)*.7,strokes:2});
for(const [i,p] of [22,55,87].entries())trees.push({id:'tree-r-'+i,position:point(northDirection,p,6.8),height:4.7+(i%2)*.5,strokes:2});
trees.push({id:'tree-east',position:point(eastDirection,64,-8.4),height:4.8,strokes:2});
const data={revision:'outline-street-r4-02',origin,kx,ky,northDirection,eastDirection,northLength,eastLength,landmarks,buildings,cars:parked,trees,spawn:point(northDirection,15,11),bounds:{minX:-110,maxX:135,minZ:-140,maxZ:42},source:{planRevision:plan.revision,planSha256:crypto.createHash('sha256').update(source).digest('hex'),roadIds:['42724022','176437964'],junctionNode:'534302826',marbleOperation:'37eebc2f1c904c50a3f4614cf3fe8691',note:'Original source geometry retained alongside display simplification. Gate positions and apron dimensions are approximate reference reconstruction. No source photos, private records or rejected generated images are runtime assets.'},style:{bodyOutlineStrokes:1,maxCarStrokes:4,maxTreeStrokes:2,maxFacadeStrokes:4,textures:0,surfaceMarks:0},attribution:'OSM contributors / Overture Maps, ODbL; East Asia building provenance CC BY 4.0. Baidu and Esri inspected as reference only; no source imagery served.'};
for(const p of Object.values(landmarks))p.wgs84=geo(p.position);
await fs.writeFile(new URL('scene-data.json',root),JSON.stringify(data,null,2));
console.log(JSON.stringify({buildings:buildings.length,cars:parked.length,trees:trees.length,endpoints:Object.fromEntries(Object.entries(landmarks).map(([k,v])=>[k,v.position]))}));
