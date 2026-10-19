import { compileCompoundTrials, visibleCompoundTrials } from './compound-overview.js';
import { planMapAssembly, validateMapAssembly } from '../domain/map-assembly.js';
import { mapMetrics, placeMapLabels } from './map-labels.js';
import { compilePaintedOverview, visiblePaintedCompounds, paintedOverviewMarkup } from './painted-overview.js';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
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
  const registeredFeatures=registration.features.map(f=>{
    const [x,y]=transform.toImage(f.geo),[gw,gd]=f.groundSize,ground=[x-gw/2,y-gd/2,gw,gd];
    if(f.parcelId&&!pointInPolygon([x,y],parcels.find(p=>p.id===f.parcelId).art))throw new Error('Feature outside its geographic parcel: '+f.id);
    const representations=Object.fromEntries([0,1,2].map(level=>{
      const height=f.kind==='tower'?38*transform.scale:12*transform.scale;
      let assetRef=f.kind==='theatre'?'venue-symbol@1':'registered-volume@1';
      if(level===2&&f.kind==='tower')assetRef='map-part-qili-osm-978924276-1';
      if(level>0&&f.kind==='slab')assetRef='map-part-liuli-liuli-roof-segment-1-'+level;
      const w=f.kind==='theatre'?f.width:gw,h=assetRef==='venue-symbol@1'?w/2.2:assetRef==='registered-volume@1'?height+gd:w*assets[assetRef].height/assets[assetRef].width;
      return [level,{assetRef,styleRevision:'north-up-orthographic-rise-r1',height,bounds:[x-w/2,y+gd/2-h,w,h],groundAnchor:[x,y]}];
    }));
    return {...f,registrationRef:registration.revision+':'+f.id,ground,emphasis:'landmark',states:[{id:f.id+'-typology',approval:'accepted',periodIds:periods,representations}]};
  });
  // Detailed painted footprints replace the old rectangular tower glyphs. Their
  // source feature IDs and geographic anchors remain in the registration ledger.
  const replacedIds=new Set((registration.paintedOverview?.compounds||[]).flatMap(c=>c.parts.map(p=>p.sourceFeatureId).filter(Boolean)));
  const features=registeredFeatures.filter(f=>!replacedIds.has(f.id));
  const patches=[];
  for(let y=-1500;y<3000;y+=300)for(let x=-1500;x<3000;x+=300)patches.push({id:`patch-${x}-${y}`,bounds:[x,y,300,300],interactive:false,recipe:{seed:`city-${x}-${y}`,styleRevision:'paper-roads-r2',typology:'land-wash'}});
  const model={schemaVersion:1,id:'fengtai-overview-review',revision:2,layoutRevision:data.mappingRevision,registrationBounds:[100,150,1050,1000],backdrop:{styleRevision:'paper-r2'},context:patches,roads,features};
  validateMapAssembly(model);
  return {model,data,context,registration,transform,parcels,compounds:compileCompoundTrials(registration,transform,assets,{roads:[...context.roads,...data.roads]}),painted:compilePaintedOverview(registration,transform,assets,{roads:[...context.roads,...data.roads]})};
}
const planCache=new WeakMap();
function currentPlan(assembly,state,availableAssets) {
  const key=JSON.stringify([assembly.model.revision,state.periodId,mapLevel(state.camera.zoom),[...availableAssets].sort()]);
  if(!planCache.has(assembly.model))planCache.set(assembly.model,new Map());
  const cache=planCache.get(assembly.model);if(cache.has(key))return cache.get(key);
  const plan=planMapAssembly(assembly.model,{periodId:state.periodId,level:mapLevel(state.camera.zoom),viewport:[-1500,-1500,4500,4500],availableAssets:[...availableAssets,'venue-symbol@1','registered-volume@1']});
  cache.set(key,plan);return plan;
}
const roadWidth=r=>r.class==='ring'?12:r.class==='primary'||r.class==='secondary'?10:r.class==='service'||r.role==='service'?4.5:r.class==='focus'?8:r.width<=3?2.8:7;

export function overviewLabelLayout(assembly,state,availableAssets,metrics=mapMetrics(state.camera)) {
  const plan=currentPlan(assembly,state,availableAssets),level=mapLevel(state.camera.zoom),candidates=[],s=metrics.scale;
  const around=(x,y,w=0,h=0)=>[[x,y+h/2+29/s],[x,y-h/2-29/s],[x+w/2+90/s,y],[x-w/2-90/s,y]];
  for(const f of plan.features.filter(f=>f.label)) {
    const[x,y,w,h]=f.bounds;candidates.push({id:f.id,text:f.label,kind:'place',priority:f.priority,minLevel:0,positions:around(x+w/2,y+h/2,w,h)});
  }
  const compounds=assembly.painted?visiblePaintedCompounds(assembly,state,availableAssets):visibleCompoundTrials(assembly,state,availableAssets);
  for(const c of compounds){
    const[x,y,w,h]=bounds(c.mask),top=assembly.painted?Math.min(...c.parts.map(p=>p.visualBounds[1])):y;
    const positions=c.labelPositionsGeo?c.labelPositionsGeo.map(assembly.transform.toImage):[[x+w/2,y+h/2],[x+w/2,y+h+24/s],[x+w/2,top-24/s],[x+w+66/s,y+h/2],[x-66/s,y+h/2],...[.25,.75].flatMap(t=>[[x+w*t,y+h*.6],[x+w*t,y+h*.85]])];
    candidates.push({id:'compound-'+c.id,text:c.shortLabel||c.label,kind:'place',priority:c.id==='sanli'?106:c.id==='school'?104:99,minLevel:c.id==='sanli'?0:1,positions});
  }
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
  const importance={'新华街':105,'西四环南路':101,'正阳大街':90,'丰台南路':90,'建国街':60,'东大街':58,'正阳新开路':52,'丰台大桥南街':45,'东安街':40,'东安街头条':40};
  const groups=new Map();
  for(const r of assembly.data.roads) {
    if(!groups.has(r.label))groups.set(r.label,[]);
    for(let i=1;i<r.art.length;i++) {
      const a=r.art[i-1],b=r.art[i],len=Math.hypot(b[0]-a[0],b[1]-a[1]);
      if(len<20)continue;
      for(const t of [.5,.25,.75])for(const offset of(r.label==='新华街'?[0,14,-14,28,-28,44,-44]:[r.class==='ring'?0:14]))groups.get(r.label).push([a[0]+(b[0]-a[0])*t+(r.class==='ring'?-23/s:0),a[1]+(b[1]-a[1])*t+offset/s]);
    }
  }
  for(const[text,positions]of groups) {
    const center=[metrics.viewport[0]+metrics.viewport[2]/2,metrics.viewport[1]+metrics.viewport[3]/2];
    positions.sort((a,b)=>Math.hypot(a[0]-center[0],a[1]-center[1])-Math.hypot(b[0]-center[0],b[1]-center[1]));
    candidates.push({id:'road-name-'+text,text,kind:'road',vertical:text==='西四环南路',priority:importance[text]||30,minLevel:(importance[text]||30)>=90?0:1,positions});
  }
  const obstacles=assembly.painted?[...compounds.flatMap(c=>c.parts.filter(p=>(p.minLevel||0)<=level).map(p=>p.visualBounds)),...assembly.painted.landmarks.filter(l=>availableAssets.includes(l.assetRef)).map(l=>l.rect)]:[...plan.features.map(f=>f.bounds),...compounds.map(c=>bounds(c.mask))];
  return placeMapLabels(candidates,obstacles,metrics,level);
}
export function overviewLabelsMarkup(assembly,state,availableAssets,metrics=mapMetrics(state.camera)) {
  const {labels}=overviewLabelLayout(assembly,state,availableAssets,metrics);
  return `<g data-layer="place-names">${labels.map(l=>{
    const[x,y]=l.position,size=l.fontUnits;
    const text=l.vertical?[...l.text].map((c,i)=>`<tspan x="${x}" y="${y+(i-(l.text.length-1)/2)*size*1.12}">${esc(c)}</tspan>`).join(''):esc(l.text);
    return `<text data-map-label="${esc(l.id)}" x="${x}" y="${y}" text-anchor="middle" dominant-baseline="central" class="${l.kind==='road'?'road-name':'map-name'}" style="font-size:${size}px;stroke-width:${3/metrics.scale}px;letter-spacing:0px">${text}</text>`;
  }).join('')}</g>`;
}

/** Visible map artwork is raster-only, including missing-asset/configuration paths. */
export function layeredOverviewMarkup(assembly,assets,state,availableAssets,options={}) {
  const art=assembly.painted?paintedOverviewMarkup(assembly,assets,state,availableAssets):'';
  return `${art}${options.includeLabels===false?'':overviewLabelsMarkup(assembly,state,availableAssets,options.metrics)}`;
}
