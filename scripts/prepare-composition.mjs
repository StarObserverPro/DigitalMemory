// Deliberate authored scene fixtures; run only when revising this layout.
import fs from 'node:fs';
import {createTransform} from '../src/domain/spatial.js';
import {createIllustrationMapping} from '../src/domain/illustration.js';
import {roadClearance,artSidePoint} from '../src/domain/composition.js';
const read=p=>JSON.parse(fs.readFileSync(p));const write=(p,v)=>fs.writeFileSync(p,JSON.stringify(v,null,2)+'\n');
const geo=read('content/public/orientation.json'),data=read('content/public/illustration-mapping.json'),transform=createTransform(geo.bounds);
data.id='fengtai-journal-mapping-r2';data.revision=2;
for(const n of data.nodes)n.art=transform.toImage(n.geo).map(v=>+v.toFixed(3));
for(const e of data.edges)e.art=[data.nodes.find(n=>n.id===e.from).art,data.nodes.find(n=>n.id===e.to).art];
for(const anchor of data.anchors){const p=read('content/public/places.json').records.find(p=>p.id===anchor.id);anchor.art=transform.toImage(p.geometry.coordinates).map(Math.round);anchor.label=[anchor.art[0],anchor.art[1]+35];anchor.entranceArt=null;anchor.hitRegion=null;}
// Raised theatre vignette stays entirely east of the ring road; registration anchor stays unchanged.
data.anchors.find(a=>a.id==='place-theatre').label=[508,282];
data.anchors.find(a=>a.id==='place-bridge').label=[406,595];
data.anchors.find(a=>a.id==='place-nankai').label=[277,1013];
const mapping=createIllustrationMapping(data,transform),door=mapping.locate(data.portals[0]).distance;
data.portals[0].slotId='south-entry-door';data.portals[0].artDoor=artSidePoint(mapping,door,'south',28);data.stage.revision='xinhua-modules-r2';
write('content/public/illustration-mapping.json',data);
const roads=geo.roads.map(r=>({id:r.id,label:r.label,class:r.class,art:r.points.map(p=>transform.toImage(p).map(v=>+v.toFixed(3))),width:r.class==='ring'?17:r.class==='primary'?16:r.class==='focus'?22:12}));
const buildings=[],slots=[];
const add=(id,distance,side,kind,width,height,depth)=>{buildings.push({id,route:mapping.atDistance(distance),side,setback:side==='north'?10.8:9.5,width,height,depth,shellAsset:kind,shellRevision:kind+'-r2',registration:'typology-proxy',historicalApproval:'unverified',sourceRefs:kind==='apartment'?['xinhua2-current','hanzhuang-current']:['historic-fengtai-collection']});};
// North-side apartment frontage: gaps remain between short segments, not one painted block.
for(let i=0;i<8;i++){const d=365+i*18;add('north-'+i,d,'north','apartment',12,17.6,7.5);for(const [suffix,offset] of [['a',-3.1],['b',3.1]])slots.push({id:'north-'+i+'-shop-'+suffix,buildingId:'north-'+i,offset,width:4.3,height:2.8,type:'shop'});}
for(let i=0;i<8;i++){const d=361+i*20;if(Math.abs(d-door)<12)continue;add('south-'+i,d,'south','service',10,3.3,5);slots.push({id:'south-'+i+'-shop',buildingId:'south-'+i,offset:0,width:5,height:2.8,type:'shop'});}
add('south-entry',door,'south','entry',5,3,2.5);buildings.at(-1).setback=8.1;slots.push({id:'south-entry-door',buildingId:'south-entry',offset:0,width:2.4,height:2.35,type:'door'});
const overview=[];
for(const [i,d]of [250,435,640].entries()){
 for(const side of ['north','south']){
 const p=artSidePoint(mapping,d,side,side==='north'?38:54),w=side==='north'?70:64,h=side==='north'?18:14;
 const group={id:`xinhua-${side}-group-${i}`,kind:side==='north'?'apartment':'service',ground:[p[0]-w/2,p[1]-h/2,w,h],height:side==='north'?84:28,buildingIds:buildings.filter(b=>b.side===side).filter((b,j)=>j%3===i).map(b=>b.id),registration:'illustrative-cluster'};
 overview.push(group);
 }
}
overview.push({id:'theatre-vignette',kind:'theatre',placeId:'place-theatre',ground:[448,224,112,32],height:46,buildingIds:[],registration:'illustrative-offset',evidence:'Exterior not yet verified; abstract venue symbol only.'});
overview.push({id:'nankai-group',kind:'apartment',placeId:'place-nankai',ground:[240,955,76,20],height:91,buildingIds:[],registration:'neighborhood-symbol'});
// Move only a drawing-space group if a reservation would mask a road. Never change geographic registration.
for(const g of overview){let n=0;while(roadClearance(g.ground,roads)<5&&n++<30)g.ground[1]+=g.kind==='service'?4:-4;if(roadClearance(g.ground,roads)<5)throw new Error('No clear plot '+g.id);}
const rails=geo.railways.filter(r=>['osm-way-1034922494','osm-way-1034922495','osm-way-1034923474'].includes(r.id)).map(r=>({id:r.id,art:r.points.map(p=>transform.toImage(p))}));
const composition={rails,schemaVersion:1,privacy:'public',id:'xinhua-composition',revision:'xinhua-modules-r2',mappingRevision:data.id,road:{id:'osm-way-176437964',geometryRevision:geo.revision,width:8.2,sidewalkOuter:7.7},roads,buildings,slots,entrances:[{id:'demo-street-door',slotId:'south-entry-door',route:data.portals[0],sceneId:'demo-courtyard',status:'synthetic'}],occupancies:[{id:'preview-stationery',slotId:'north-4-shop-a',fixture:'stationery',periodIds:[],approval:'synthetic',assetId:'shop',label:'文具 · 试放'},{id:'preview-repair',slotId:'north-4-shop-a',fixture:'repair',periodIds:[],approval:'synthetic',assetId:'shop',label:'修车 · 试放'}],overview,sourceNotice:'Typology study only. Building routes and shop slots are authored test placements, not surveyed historical addresses.'};
write('content/public/scene-composition.json',composition);
console.log(JSON.stringify({buildings:buildings.length,slots:slots.length,clearances:overview.map(g=>[g.id,roadClearance(g.ground,roads)])},null,2));
