import fs from 'node:fs';
import { createTransform } from '../src/domain/spatial.js';
const geo=JSON.parse(fs.readFileSync('content/public/orientation.json'));
const places=JSON.parse(fs.readFileSync('content/public/places.json')).places;
const transform=createTransform(geo.bounds);
const focus=geo.roads.find(r=>r.class==='focus');
// One independently editable drawing-space centreline. Real geometry stays untouched.
const art=[[480,1000],[489,994],[560,950],[594,927],[710,861],[786,820],[830,790],[930,720],[936,717],[1000,681],[1070,650]];
const nodes=focus.points.map((p,i)=>({id:`xinhua-${i}`,kind:i===0||i===focus.points.length-1?'segment-end':'shape-control',geo:p,art:art[i],evidence:'contemporary-osm-orientation'}));
const edges=nodes.slice(1).map((n,i)=>({id:`xinhua-edge-${i}`,from:nodes[i].id,to:n.id,sourceRoadId:focus.id,geo:[nodes[i].geo,n.geo],art:[nodes[i].art,n.art],traversal:'prototype-only',historicalWalk:'unverified'}));
const anchors=[
 {id:'place-theatre',art:[365,245],label:[365,285],entrance:[365,286],hit:[260,130,460,295]},
 {id:'place-bridge',art:[335,585],label:[335,634],entrance:[335,585],hit:[255,520,425,630]},
 {id:'place-nankai',art:[190,985],label:[180,1038],entrance:[210,1020],hit:[100,880,290,1040]},
 {id:'place-xinhua',art:[786,820],label:[870,886],entrance:[786,820],hit:[735,750,875,855]}
];
const mapping={schemaVersion:1,id:'fengtai-journal-mapping-r1',privacy:'public',geometryRevision:geo.revision,transformRevision:transform.revision,artboard:{width:1200,height:1200},notice:'Illustration layout is intentionally non-metric. Anchors are orientation references; doors are not surveyed historical entrances.',nodes,edges,anchors,spawn:{edgeId:'xinhua-edge-4',t:.34,direction:1},portals:[{id:'demo-street-door',placeId:'place-xinhua',edgeId:'xinhua-edge-4',t:.82,artDoor:[772,788],sceneId:'demo-courtyard',synthetic:true,realEntrance:null}],unplaced:['site-primary-old','site-middle-old']};
if (!fs.existsSync('content/public/illustration-mapping.json')) fs.writeFileSync('content/public/illustration-mapping.json',JSON.stringify(mapping,null,2)+'\n'); // Never overwrite reviewed registration.
const line=pts=>'M'+pts.map(p=>p.join(',')).join(' L');
let svg='<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1200" viewBox="0 0 1200 1200"><rect width="1200" height="1200" fill="#fff8e8"/>';
const roads=[{p:[[350,75],[345,300],[335,585],[370,760],[480,1000],[500,1140]],width:25,color:'#b3c4b3'}, {p:[[65,615],[335,585],[600,470],[880,350],[1130,285]],width:26,color:'#e7d9b4'},{p:[[370,760],[570,690],[800,590],[1100,480]],width:20,color:'#e7d9b4'},{p:art,width:36,color:'#e4c49b'},{p:[[430,1090],[740,1050],[1110,975]],width:22,color:'#e7d9b4'}];
for(const r of roads)svg+=`<path d="${line(r.p)}" stroke="${r.color}" stroke-width="${r.width}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
svg+='<path d="M50,885 L330,690 L650,480 L1140,130" fill="none" stroke="#a8a99a" stroke-width="9" stroke-dasharray="3 8"/>';
// Landmark slots are compositional guides, not building footprints or accepted art.
for(const [x,y,w,h,label] of [[260,130,200,150,'CINEMA'],[265,525,140,85,'ROAD BRIDGE'],[100,880,190,145,'HOMES'],[720,690,115,103,'COURTYARD'],[575,765,105,93,'SHOPS'],[865,600,105,92,'SHOPS']])svg+=`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="#d8d7b7" stroke="#788d74" stroke-width="2"/><text x="${x+w/2}" y="${y+h/2}" font-family="sans-serif" font-size="15" text-anchor="middle" fill="#496450">${label}</text>`;
svg+='</svg>';fs.mkdirSync('assets/maps',{recursive:true});fs.writeFileSync('assets/maps/fengtai-journal-guide-r1.svg',svg);
