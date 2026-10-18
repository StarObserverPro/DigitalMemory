import fs from 'node:fs';import{createHash}from'node:crypto';
const manifest=JSON.parse(fs.readFileSync('content/public/manifest.json'));
function asset(name,file,width,height,crop){const url='../../assets/modules/'+file;return{id:name,url,width,height,...(crop?{crop}:{}),revision:name+'-r2',sha256:createHash('sha256').update(fs.readFileSync('assets/modules/'+file)).digest('hex'),privacy:'public',kind:'generated-modular-illustration',approval:'candidate'};}
const assets={apartment:asset('apartment','apartment-front-r2.png',1024,1536,[75,71,875,1400]),shop:asset('shop','shop-front-r2.png',1659,948,[53,62,1552,833]),walker:asset('walker','child-back-r2.png',1024,1536,[211,13,603,1494]),paper:asset('paper','paper-r2.png',1254,1254)};
if(fs.existsSync('assets/modules/apartment-map-r2.png')){const dim=JSON.parse(fs.readFileSync('assets/modules/map-dimensions.json'));assets.mapApartment=asset('apartment-map','apartment-map-r2.png',dim.width,dim.height,dim.crop);}
manifest.revision=3;manifest.id='phase1-layered-prototype-r3';manifest.composition='scene-composition.json';
manifest.assets[0]={...assets.paper,id:'journal',label:'分层手绘街区',mappingRevision:'fengtai-journal-mapping-r2',selectable:true};
manifest.moduleAssets=assets;manifest.stageAssets=Object.fromEntries(Object.entries(assets).filter(([id])=>id!=='mapApartment'));
fs.writeFileSync('content/public/manifest.json',JSON.stringify(manifest,null,2)+'\n');
// The entrance is a separate module with its own setback, reachable from the path.
const composition=JSON.parse(fs.readFileSync('content/public/scene-composition.json'));composition.buildings.find(b=>b.id==='south-entry').setback=8.1;
fs.writeFileSync('content/public/scene-composition.json',JSON.stringify(composition,null,2)+'\n');
