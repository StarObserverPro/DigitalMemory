import { compileCompoundTrials, visibleCompoundTrials, compoundTrialMarkup } from './compound-overview.js';
import { planMapAssembly, validateMapAssembly } from '../domain/map-assembly.js';
import { mapMetrics, placeMapLabels } from './map-labels.js';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const path=points=>'M'+points.map(p=>p.join(',')).join(' L');
const bounds=(points,pad=0)=>{const xs=points.map(p=>p[0]),ys=points.map(p=>p[1]),x=Math.min(...xs)-pad,y=Math.min(...ys)-pad;return[x,y,Math.max(1,Math.max(...xs)-x+pad),Math.max(1,Math.max(...ys)-y+pad)];};
const periods=['window-2000','window-1995'];
export const mapLevel=zoom=>zoom<1.5?0:zoom<2.25?1:2;
export function pointInPolygon(p,poly) {
  let inside=false;
  for(let i=0,j=poly.length-1;i<poly.length;j=i++) {
    const a=poly[i],b=poly[j];if((a[1]>p[1])!==(b[1]>p[1])&&p[0]<(b[0]-a[0])*(p[1]-a[1])/(b[1]-a[1])+a[0])inside=!inside;
  }
  return inside;
}

/** All feature anchors go through the same geographic transform as the roads. */
export function createOverviewAssembly(data,context,registration,transform,assets) {
  if(!registration||registration.transformRevision!==transform?.revision)throw new Error('Overview registration transform mismatch');
  const parcels=registration.parcels.map(p=>({...p,art:p.geometry.coordinates[0].map(transform.toImage)}));
  const sourceRoads=[...data.roads,...context.roads.filter(r=>r.role==='service')];
  const roads=sourceRoads.flatMap(road=>road.art.slice(1).map((b,i)=>{
    const a=road.art[i],width=roadWidth(road),pad=width/2+2,rect=bounds([a,b],pad+.001),id=road.id+'-'+i,isWalk=road.class!=='ring';
    // A long diagonal's bounding box is not its road surface. Reserve short pieces
    // instead of forcing correctly registered buildings to move away from the road.
    const steps=Math.max(1,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/2));
    const at=t=>a.map((v,j)=>v+(b[j]-v)*t);
    const reservations=Array.from({length:steps},(_,j)=>bounds([at(j/steps),at((j+1)/steps)],pad));
    return {id,registrationRef:road.id,states:[{id:id+'-orientation',periodIds:periods,approval:'accepted',profileStatus:'contemporary-orientation-not-surveyed-height',basePartId:id+'-surface',reservations,bands:[{id:id+'-band',role:road.role==='service'?'service':isWalk?'shared':'main',modes:isWalk?['walk','cycle','vehicle']:['vehicle'],profiles:[{t:0,offset:0,width,elevation:0},{t:1,offset:0,width,elevation:0}]}],parts:[{id:id+'-surface',kind:'surface',minLevel:0,bounds:rect,paintAfter:[],art:[a,b],roadClass:road.class,width}]}]};
  }));
  const owner=roads.find(r=>r.id==='osm-way-176437978-2')||roads.find(r=>r.registrationRef==='osm-way-176437978');
  const roadState=owner.states[0],floor=roadState.parts[0];
  for(const [id,kind,box]of [['wall-west','retaining-wall',[386,548,15,96]],['wall-east','retaining-wall',[422,535,16,98]],['north-road-deck','deck',[355,535,99,54]],['south-rail-deck','deck',[385,590,57,34]]]) {
    roadState.reservations.push(box);roadState.parts.push({id,kind,minLevel:0,bounds:box,paintAfter:[floor.id],evidenceStatus:'schematic-user-described',heightRange:null});
  }
  floor.bounds=bounds(roadState.reservations.flatMap(([x,y,w,h])=>[[x,y],[x+w,y+h]]));
  const features=registration.features.map(f=>{
    const [x,y]=transform.toImage(f.geo),[gw,gd]=f.groundSize,ground=[x-gw/2,y-gd/2,gw,gd];
    if(f.parcelId&&!pointInPolygon([x,y],parcels.find(p=>p.id===f.parcelId).art))throw new Error('Feature outside its geographic parcel: '+f.id);
    const representations=Object.fromEntries([0,1,2].map(level=>{
      const assetRef=f.kind==='theatre'?'venue-symbol@1':f.kind+(level<2?'Glyph':'Sketch');
      const ratio=f.kind==='theatre'?2.2:assets[assetRef].width/assets[assetRef].height;
      const w=f.width*(f.kind==='tower'&&level<2?.85:1),h=w/ratio;
      return [level,{assetRef,styleRevision:'proportional-thumbnail-r3',bounds:[x-w/2,y-h,w,h],groundAnchor:[x,y]}];
    }));
    return {...f,registrationRef:registration.revision+':'+f.id,ground,emphasis:'landmark',states:[{id:f.id+'-typology',approval:'accepted',periodIds:periods,representations}]};
  });
  const patches=[];
  for(let y=-1500;y<3000;y+=300)for(let x=-1500;x<3000;x+=300)patches.push({id:`patch-${x}-${y}`,bounds:[x,y,300,300],interactive:false,recipe:{seed:`city-${x}-${y}`,styleRevision:'paper-roads-r2',typology:'land-wash'}});
  const model={schemaVersion:1,id:'fengtai-overview-review',revision:2,layoutRevision:data.mappingRevision,registrationBounds:[100,150,1050,1000],backdrop:{styleRevision:'paper-r2'},context:patches,roads,features};
  validateMapAssembly(model);
  return {model,data,context,registration,transform,parcels,compounds:compileCompoundTrials(registration,transform,assets)};
}
function image(asset,rect,opacity=1) {
  const[x,y,w,h]=rect;return `<image x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="xMidYMax meet" href="${esc(asset.url)}" opacity="${opacity}"/>`;
}
function venue(rect) {
  const[x,y,w,h]=rect;return `<g filter="url(#loose-edge)"><path d="M${x},${y+h}v-${h*.65}l${w*.13},-${h*.2}h${w*.74}l${w*.13},${h*.2}v${h*.65}Z" fill="#dfb57e"/><path d="M${x-2},${y+h*.16}l${w*.16},-${h*.14}h${w*.7}l${w*.16},${h*.14}Z" fill="#a67861"/><path d="M${x+w*.13},${y+h*.55}h${w*.74}v${h*.45}h-${w*.74}Z" fill="#968e79"/></g>`;
}
const planCache=new WeakMap();
function currentPlan(assembly,state,availableAssets) {
  const key=JSON.stringify([assembly.model.revision,state.periodId,mapLevel(state.camera.zoom),[...availableAssets].sort()]);
  if(!planCache.has(assembly.model))planCache.set(assembly.model,new Map());
  const cache=planCache.get(assembly.model);if(cache.has(key))return cache.get(key);
  const plan=planMapAssembly(assembly.model,{periodId:state.periodId,level:mapLevel(state.camera.zoom),viewport:[-1500,-1500,4500,4500],availableAssets:[...availableAssets,'venue-symbol@1']});
  cache.set(key,plan);return plan;
}
const roadWidth=r=>r.class==='ring'?12:r.class==='primary'||r.class==='secondary'?10:r.class==='service'||r.role==='service'?4.5:r.class==='focus'?8:r.width<=3?2.8:7;

export function overviewLabelLayout(assembly,state,availableAssets,metrics=mapMetrics(state.camera)) {
  const plan=currentPlan(assembly,state,availableAssets),level=mapLevel(state.camera.zoom),candidates=[],s=metrics.scale;
  const around=(x,y,w=0,h=0)=>[[x,y+h/2+29/s],[x,y-h/2-29/s],[x+w/2+90/s,y],[x-w/2-90/s,y]];
  for(const f of plan.features.filter(f=>f.label)) {
    const[x,y,w,h]=f.bounds;candidates.push({id:f.id,text:f.label,kind:'place',priority:f.priority,minLevel:0,positions:around(x+w/2,y+h/2,w,h)});
  }
  const compounds=visibleCompoundTrials(assembly,state,availableAssets);
  for(const c of compounds){const[x,y,w,h]=bounds(c.mask);candidates.push({id:'compound-'+c.id,text:c.label,kind:'place',priority:103,minLevel:1,positions:[[x+w/2,y+h+24/s],[x+w+66/s,y+h/2],[x-66/s,y+h/2]]});}
  for(const p of assembly.parcels) {
    if(compounds.some(c=>p.label.includes(c.id==='wuli-west'?'新华街五里':c.label)))continue;
    const [x,y,w,h]=bounds(p.art),members=plan.features.filter(f=>assembly.model.features.find(a=>a.id===f.id).parcelId===p.id);
    const named=['新华街三里','南开西里'].includes(p.label),box=members.length?bounds(members.flatMap(f=>[[f.bounds[0],f.bounds[1]],[f.bounds[0]+f.bounds[2],f.bounds[1]+f.bounds[3]]])):[x,y,w,h];
    const [bx,by,bw,bh]=box;
    candidates.push({id:p.id,text:p.label,kind:'place',priority:named?95:55,minLevel:named?0:1,positions:[[bx+bw/2,by+bh+28/s],[x+w/2,y+h/2],...around(bx+bw/2,by+bh/2,bw,bh)]});
  }
  const bridge=assembly.transform.toImage([116.27759698571428,39.84562054285714]);
  candidates.push({id:'road-bridge',text:'丰台大桥',kind:'place',priority:108,minLevel:0,positions:[[bridge[0]-65/s,bridge[1]-22/s],[bridge[0]+65/s,bridge[1]-22/s]]});
  candidates.push({id:'rail-bridge',text:'铁路桥',kind:'place',priority:106,minLevel:0,positions:[[395-58/s,620+10/s],[420+55/s,620+16/s]]});
  const importance={'新华街':102,'西四环南路':101,'正阳大街':90,'丰台南路':90,'建国街':60,'东大街':58,'正阳新开路':52,'丰台大桥南街':45,'东安街':40,'东安街头条':40};
  const groups=new Map();
  for(const r of assembly.data.roads) {
    if(!groups.has(r.label))groups.set(r.label,[]);
    for(let i=1;i<r.art.length;i++) {
      const a=r.art[i-1],b=r.art[i],len=Math.hypot(b[0]-a[0],b[1]-a[1]);
      if(len<20)continue;
      for(const t of [.5,.25,.75])groups.get(r.label).push([a[0]+(b[0]-a[0])*t+(r.class==='ring'?-23/s:0),a[1]+(b[1]-a[1])*t+(r.class==='ring'?0:14/s)]);
    }
  }
  for(const[text,positions]of groups) {
    const center=[metrics.viewport[0]+metrics.viewport[2]/2,metrics.viewport[1]+metrics.viewport[3]/2];
    positions.sort((a,b)=>Math.hypot(a[0]-center[0],a[1]-center[1])-Math.hypot(b[0]-center[0],b[1]-center[1]));
    candidates.push({id:'road-name-'+text,text,kind:'road',vertical:text==='西四环南路',priority:importance[text]||30,minLevel:(importance[text]||30)>=90?0:1,positions});
  }
  return placeMapLabels(candidates,[...plan.features.map(f=>f.bounds),...compounds.map(c=>bounds(c.mask))],metrics,level);
}
export function overviewLabelsMarkup(assembly,state,availableAssets,metrics=mapMetrics(state.camera)) {
  const {labels}=overviewLabelLayout(assembly,state,availableAssets,metrics);
  return `<g data-layer="place-names">${labels.map(l=>{
    const[x,y]=l.position,size=l.fontUnits;
    const text=l.vertical?[...l.text].map((c,i)=>`<tspan x="${x}" y="${y+(i-(l.text.length-1)/2)*size*1.12}">${esc(c)}</tspan>`).join(''):esc(l.text);
    return `<text data-map-label="${esc(l.id)}" x="${x}" y="${y}" text-anchor="middle" dominant-baseline="central" class="${l.kind==='road'?'road-name':'map-name'}" style="font-size:${size}px;stroke-width:${3/metrics.scale}px;letter-spacing:0px">${text}</text>`;
  }).join('')}</g>`;
}

/** Roads are quiet paper marks; click affordance does not change their permanent color. */
export function layeredOverviewMarkup(assembly,assets,state,availableAssets,options={}) {
  const plan=currentPlan(assembly,state,availableAssets),level=mapLevel(state.camera.zoom);
  const compounds=visibleCompoundTrials(assembly,state,availableAssets);
  const allRoads=[...assembly.context.roads,...assembly.data.roads];
  const compoundMasks=compounds.map(c=>`<path d="${path(c.mask)}Z" fill="black"/>`).join('');
  const masks=compoundMasks+plan.features.map(f=>`<rect x="${f.ground[0]-2}" y="${f.ground[1]-2}" width="${f.ground[2]+4}" height="${f.ground[3]+4}" fill="black"/>`).join('');
  const roadMasks=allRoads.map(r=>`<path d="${path(r.art)}" fill="none" stroke="black" stroke-width="${roadWidth(r)+3}"/>`).join('');
  const defs=`<defs><filter id="loose-edge" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency=".055" numOctaves="2" seed="19" result="grain"/><feDisplacementMap in="SourceGraphic" in2="grain" scale="1.4"/></filter><mask id="context-open" maskUnits="userSpaceOnUse" x="-1500" y="-1500" width="4500" height="4500"><rect x="-1500" y="-1500" width="4500" height="4500" fill="white"/>${roadMasks}${masks}</mask><mask id="compound-road-clear" maskUnits="userSpaceOnUse" x="-1500" y="-1500" width="4500" height="4500"><rect x="-1500" y="-1500" width="4500" height="4500" fill="white"/>${roadMasks}</mask></defs>`;
  const washes=assembly.context.districts.map(d=>`<path d="${path(d.art)}Z" fill="${d.kind==='park'?'#a5b58c':'#cfc0a5'}" opacity="${d.kind==='park'?.22:.11}"/>`).join('');
  const pale=assembly.context.buildings.map(b=>`<path d="${path(b.footprint)}Z" fill="#bbaf98" stroke="#aaa28c" stroke-width=".7" opacity="${level===0?.18:.23}"/>`).join('');
  const yards=assembly.parcels.filter(p=>['osm-way-897762350','osm-way-897762342'].includes(p.id)).map(p=>`<path d="${path(p.art)}Z" fill="#b8c7a4" opacity=".14"/>`).join('');
  const context=`<g data-layer="pale-context" mask="url(#context-open)" filter="url(#loose-edge)">${washes}${pale}${yards}</g>`;
  // One casing pass followed by one fill pass: connected ways share their junctions.
  const casing=allRoads.map(r=>`<path data-road="${r.id}" d="${path(r.art)}" stroke="#aea99a" stroke-width="${roadWidth(r)+1.6}"/>`).join('');
  const fill=allRoads.map(r=>`<path d="${path(r.art)}" stroke="${r.class==='ring'?'#d4d6ca':'#e8e7dc'}" stroke-width="${roadWidth(r)}"/>`).join('');
  const roads=`<g data-layer="road-art" fill="none" stroke-linecap="round" stroke-linejoin="round" filter="url(#loose-edge)" opacity=".72">${casing}${fill}</g>`;
  const rails=[...assembly.data.rails,...assembly.registration.railContinuations.map(r=>({id:r.id,art:r.geo.map(assembly.transform.toImage)}))];
  const rail=rails.map(r=>`<path d="${path(r.art)}" fill="none" stroke="#c4c0af" stroke-width="9"/><path d="${path(r.art)}" fill="none" stroke="#8e9486" stroke-width="4" stroke-dasharray="1.5 5"/><path d="${path(r.art)}" fill="none" stroke="#eae5d5" stroke-width="1.5"/>`).join('');
  const decks=assembly.registration.bridgeDecks.map(d=>{const art=d.geo.map(assembly.transform.toImage),p=path(art)+'Z';return `<path d="${p}" transform="translate(0,4)" fill="#928f7c" opacity=".22"/><path data-bridge-deck="${d.id}" d="${p}" fill="#e5e4d8" stroke="#aaa996" stroke-width="1.3"/>`;}).join('');
  const structures=`<g data-layer="bridge-structures" opacity=".85" filter="url(#loose-edge)">${level===2?'<path d="M388,551 L392,625 L400,643 L398,572Z M422,538 L428,614 L436,631 L431,550Z" fill="#b8b09b" opacity=".36"/>':''}${decks}${rail}</g>`;
  const objects=plan.features.map(f=>`<g data-map-object="${f.id}" data-place-id="${f.placeId}" data-anchor="${f.groundAnchor.join(',')}">${f.assetRef==='venue-symbol@1'?venue(f.bounds):image(assets[f.assetRef],f.bounds)}</g>`).join('');
  return `${defs}<g data-map-tier="${plan.level}">${context}${compoundTrialMarkup(compounds,assets,level)}${roads}${structures}<g data-layer="solid-places">${objects}</g>${options.includeLabels===false?'':overviewLabelsMarkup(assembly,state,availableAssets,options.metrics)}</g>`;
}
