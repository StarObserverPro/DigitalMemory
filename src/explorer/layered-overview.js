import { planMapAssembly, validateMapAssembly } from '../domain/map-assembly.js';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const path=points=>'M'+points.map(p=>p.join(',')).join(' L');
const bounds=(points,pad=0)=>{const xs=points.map(p=>p[0]),ys=points.map(p=>p[1]),x=Math.min(...xs)-pad,y=Math.min(...ys)-pad;return[x,y,Math.max(1,Math.max(...xs)-x+pad),Math.max(1,Math.max(...ys)-y+pad)];};
const periods=['window-2000','window-1995'];
const servicePaths=[[[365,370],[370,470],[375,565],[382,645],[389,700],[408,750],[446,820],[480,900],[500,1010]],[[441,370],[443,470],[449,565],[455,645],[463,700],[480,750],[510,810],[540,900],[565,1010]]];
export const mapLevel=zoom=>zoom<1.5?0:zoom<2.25?1:2;

/** Drawing reservations remain display proxies, not new geographic registrations. */
export function createOverviewAssembly(data,context){
 const sourceRoads=[...data.roads,...servicePaths.map((art,i)=>({id:'four-ring-service-'+i,sourceId:data.roads.find(r=>r.class==='ring').id,art,width:6,class:'service'}))];
 const roads=sourceRoads.flatMap(road=>road.art.slice(1).map((b,i)=>{
   const a=road.art[i],rect=bounds([a,b],road.class==='ring'?14:road.width/2+4),id=road.id+'-'+i;
   const isWalk=road.class!=='ring';
   return {id,registrationRef:road.sourceId||road.id,states:[{id:id+'-orientation',periodIds:periods,approval:'accepted',profileStatus:'schematic-art-plane',basePartId:id+'-surface',reservations:[rect],bands:[{id:id+'-band',role:isWalk?'shared':'main',modes:isWalk?['walk','cycle','vehicle']:['vehicle'],profiles:[{t:0,offset:0,width:road.width,elevation:0},{t:1,offset:0,width:road.width,elevation:0}]}],parts:[{id:id+'-surface',kind:'surface',minLevel:0,bounds:rect,paintAfter:[],art:[a,b],roadClass:road.class,width:road.width}]}]};
 }));
 const owner=roads.find(r=>r.id==='osm-way-176437978-2')||roads.find(r=>r.registrationRef==='osm-way-176437978');
 const roadState=owner.states[0],floor=roadState.parts[0];
 for(const [id,kind,box]of [['wall-west','retaining-wall',[386,548,15,96]],['wall-east','retaining-wall',[422,535,16,98]],['north-road-deck','deck',[355,535,99,54]],['south-rail-deck','deck',[385,590,57,34]]]){roadState.reservations.push(box);roadState.parts.push({id,kind,minLevel:0,bounds:box,paintAfter:[floor.id],evidenceStatus:'schematic-user-described',heightRange:null});}
 floor.bounds=bounds(roadState.reservations.flatMap(([x,y,w,h])=>[[x,y],[x+w,y+h]]));
 const features=[];
 function feature(id,placeId,ground,kind,label,priority=50){
   const [x,y,w,d]=ground,h=kind==='tower'?91:kind==='slab'?42:48;
   const reps=Object.fromEntries([0,1,2].map(level=>[level,{assetRef:kind==='theatre'?'venue-symbol@1':kind==='tower'?'towerSketch':'slabSketch',styleRevision:'loose-thumbnail-r1',bounds:[x,y+d-h,w,h],groundAnchor:[x+w/2,y+d],labelBounds:[x-18,y+d+5,w+36,15]}]));
   const f={id,placeId,registrationRef:'existing-place:'+placeId,ground,kind,label,emphasis:'landmark',priority,states:[{id:id+'-typology',approval:'accepted',periodIds:periods,representations:reps}]};
   features.push(f);
 }
 feature('theatre-symbol','place-theatre',[452,224,108,26],'theatre','丰台影剧院',100);
 // Reviewed family, approximate district layout only; these are not claimed individual addresses.
 feature('xinhua-tower-a','place-xinhua',[609,787,43,12],'tower',null);
 feature('xinhua-tower-b','place-xinhua',[681,753,43,12],'tower','新华街三里',80);
 feature('xinhua-tower-c','place-xinhua',[746,700,43,12],'tower',null);
 feature('nankai-slab-a','place-nankai',[250,945,112,15],'slab','南开西里',75);
 feature('nankai-slab-b','place-nankai',[215,995,112,15],'slab',null);
 const patches=[];
 for(let y=-1500;y<3000;y+=300)for(let x=-1500;x<3000;x+=300)patches.push({id:`patch-${x}-${y}`,bounds:[x,y,300,300],interactive:false,recipe:{seed:`city-${x}-${y}`,styleRevision:'loose-thumbnail-r1',typology:'land-wash'}});
 const model={schemaVersion:1,id:'fengtai-overview-review',revision:1,layoutRevision:data.mappingRevision,registrationBounds:[100,150,1050,1000],backdrop:{styleRevision:'paper-r2'},context:patches,roads,features};
 validateMapAssembly(model);
 return {model,data,context};
}
function image(asset,rect,opacity=1){const[x,y,w,h]=rect;return `<image x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="none" href="${esc(asset.url)}" opacity="${opacity}"/>`;}
function venue(rect){const[x,y,w,h]=rect;return `<g filter="url(#loose-edge)"><path d="M${x},${y+h}v-${h*.65}l${w*.13},-${h*.2}h${w*.74}l${w*.13},${h*.2}v${h*.65}Z" fill="#dfb57e"/><path d="M${x-2},${y+h*.16}l${w*.16},-${h*.14}h${w*.7}l${w*.16},${h*.14}Z" fill="#a67861"/><path d="M${x+w*.13},${y+h*.55}h${w*.74}v${h*.45}h-${w*.74}Z" fill="#968e79"/><path d="M${x+w*.35},${y+h*.56}v${h*.44}m${w*.3},0v-${h*.44}" stroke="#e8c9a1" stroke-width="4"/></g>`;}

/** Native SVG renderer of the same planner used by insertion and temporal selection. */
export function layeredOverviewMarkup(assembly,assets,state,availableAssets){
 const level=mapLevel(state.camera.zoom);
 const plan=planMapAssembly(assembly.model,{periodId:state.periodId,level,viewport:[-1500,-1500,4500,4500],availableAssets:[...availableAssets,'venue-symbol@1']});
 // Orientation roads persist for unassociated life stages; they are contemporary reference,
 // not a statement that today's facades existed in that life stage.
 const periodSupported=periods.includes(state.periodId);
 const roadPlan=periodSupported?plan:planMapAssembly(assembly.model,{periodId:'window-2000',level,viewport:[-1500,-1500,4500,4500],availableAssets:[]});
 const roadShapes=roadPlan.roadParts.filter(r=>r.art).map(r=>`<path d="${path(r.art)}" fill="none" stroke="black" stroke-width="${r.width+10}" stroke-linecap="round"/>`).join('');
 const masks=plan.features.map(f=>`<rect x="${f.ground[0]-3}" y="${f.ground[1]-5}" width="${f.ground[2]+6}" height="${f.ground[3]+10}" fill="black"/>`).join('');
 const defs=`<defs><filter id="loose-edge" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency=".04" numOctaves="2" seed="19" result="grain"/><feDisplacementMap in="SourceGraphic" in2="grain" scale="2.5"/></filter><mask id="context-open" maskUnits="userSpaceOnUse" x="-1500" y="-1500" width="4500" height="4500"><rect x="-1500" y="-1500" width="4500" height="4500" fill="white"/>${roadShapes}${masks}</mask></defs>`;
 const washes=assembly.context.districts.map(d=>`<path d="${path(d.art)}Z" fill="${d.kind==='park'?'#a5b58c':'#cfc0a5'}" opacity="${d.kind==='park'?.24:.13}"/>`).join('');
 const pale=assembly.context.buildings.map((b,i)=>{
   const tower=i%7===0,asset=assets[tower?'towerSketch':'slabSketch'],w=tower?20:54,h=tower?43:23;
   return image(asset,[b.x-w/2,b.y-h,w,h],level===0?.17:level===1?.21:.25);
 }).join('');
 const context=`<g data-layer="pale-context" mask="url(#context-open)">${washes}${pale}</g>`;
 const minor=`<g fill="none" stroke-linecap="round" stroke-linejoin="round" opacity=".23" filter="url(#loose-edge)">${assembly.context.roads.map(r=>`<path d="${path(r.art)}" stroke="#7a7569" stroke-width="${r.width}"/><path d="${path(r.art)}" stroke="#e2d6bc" stroke-width="${Math.max(2,r.width-3)}"/>`).join('')}</g>`;
 const mainRoads=assembly.data.roads.map(r=>{
   const p=path(r.art),ring=r.class==='ring',w=r.width;
   return `<g data-road="${r.id}" fill="none" stroke-linecap="round" stroke-linejoin="round" filter="url(#loose-edge)"><path d="${p}" stroke="#e4d4b6" stroke-width="${w+8}"/><path d="${p}" stroke="${ring?'#555752':'#60635b'}" stroke-width="${w}"/>${level>0?`<path d="${p}" stroke="#d8ceb3" stroke-width=".85" stroke-dasharray="5 12" opacity=".5"/>`:''}</g>`;
 }).join('');
 // These outside service/walking bands remain schematic; exact underpass profiles await street-view evidence.
  const service=servicePaths.map(points=>`<g fill="none" stroke-linecap="round" stroke-linejoin="round" filter="url(#loose-edge)"><path d="${path(points)}" stroke="#c1af92" stroke-width="12"/><path d="${path(points)}" stroke="#e6d6b9" stroke-width="10"/><path d="${path(points)}" stroke="#6a6b61" stroke-width="6"/></g>`).join('');
 const structures=`<g data-layer="bridge-structures" filter="url(#loose-edge)"><path d="M388,551 L392,625 L400,643 L398,572Z" fill="#b8b09b"/><path d="M422,538 L428,614 L436,631 L431,550Z" fill="#c7bfa9"/><path d="M361,581 L448,543" stroke="#8a887a" stroke-width="24"/><path d="M361,576 L448,538" stroke="#5e625b" stroke-width="15"/>${assembly.data.rails.map(r=>`<path d="${path(r.art)}" fill="none" stroke="#b6ae96" stroke-width="13"/><path d="${path(r.art)}" fill="none" stroke="#6b6a5d" stroke-width="7" stroke-dasharray="2 5"/><path d="${path(r.art)}" fill="none" stroke="#ded3b9" stroke-width="2"/>`).join('')}</g>`;
 const objects=plan.features.map(f=>`<g data-map-object="${f.id}" data-place-id="${f.placeId}">${f.assetRef==='venue-symbol@1'?venue(f.bounds):image(assets[f.assetRef],f.bounds)}</g>`).join('');
 const labels=plan.labels.map(l=>`<text x="${l.bounds[0]+l.bounds[2]/2}" y="${l.bounds[1]+10}" text-anchor="middle" class="map-name" style="font-size:${18/state.camera.zoom}px">${esc(l.text)}</text>`).join('');
 const roadNames=[['新华街',832,788,-26],['正阳大街',685,447,-26],['西四环南路',394,395,87],['丰台南路',782,942,-10]];
 const names=roadNames.map(([n,x,y,r])=>`<text x="${x}" y="${y}" transform="rotate(${r} ${x} ${y})" text-anchor="middle" class="road-name" style="font-size:${16/state.camera.zoom}px">${n}</text>`).join('');
 return `${defs}<g data-map-tier="${plan.level}">${minor}${context}<g data-layer="road-art">${mainRoads}${service}${structures}</g><g data-layer="solid-places">${objects}</g><g data-layer="place-names">${labels}${names}<text x="330" y="523" class="map-name">丰台大桥</text><text x="313" y="657" class="map-name">铁路桥</text>${level>0?'<text x="454" y="1035" class="map-name">看丹桥</text>':''}</g></g>`;
}
