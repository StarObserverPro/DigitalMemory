import { overlaps } from '../domain/map-assembly.js';

export function mapMetrics(camera, width=1440, height=900, side=Math.max(height,width*.7)) {
  const zoom=camera.zoom, scale=side*zoom/1200;
  const center=[600-(camera.x||0)*12/zoom,600-(camera.y||0)*12/zoom];
  return {width,height,side,scale,viewport:[center[0]-width/2/scale,center[1]-height/2/scale,width/scale,height/scale]};
}
const grow=(r,p)=>[r[0]-p,r[1]-p,r[2]+p*2,r[3]+p*2];
const screen=(p,m)=>[(p[0]-m.viewport[0])*m.scale,(p[1]-m.viewport[1])*m.scale];
const visible=(b,m)=>b[0]>=12&&b[1]>=12&&b[0]+b[2]<=m.width-12&&b[1]+b[3]<=m.height-12;

/** Labels compete in screen pixels, independently of the scale of the illustration. */
export function placeMapLabels(candidates, obstacles, metrics, level) {
  const narrow=metrics.width<600, countLimit=(narrow?[7,10,12]:[10,14,18])[level];
  const characterLimit=(narrow?[35,50,64]:[52,72,96])[level];
  const occupied=obstacles.map(obstacle=>{const r=Array.isArray(obstacle)?obstacle:obstacle.bounds,p=screen(r,metrics);return {bounds:grow([p[0],p[1],r[2]*metrics.scale,r[3]*metrics.scale],3),owner:obstacle.owner,context:obstacle.context};});
  // The only persistent control sits here, outside the map's semantic content.
  occupied.push({bounds:[metrics.width-78,0,78,82]});
  const labels=[];let characters=0;
  for(const c of [...candidates].sort((a,b)=>b.priority-a.priority||a.id.localeCompare(b.id))) {
    if(c.minLevel>level||labels.length>=countLimit||characters+c.text.length>characterLimit)continue;
    const fontPx=c.kind==='road'?(narrow?18:19):(narrow?21:23);
    const vertical=!!c.vertical;
    const w=vertical?fontPx*1.25:c.text.length*fontPx+2, h=vertical?c.text.length*fontPx*1.12:fontPx*1.35;
    let placed=false;
    for(const allowOwnArt of(c.overlapOwnArt?[false,true]:[false]))for(const p of c.positions) {
      if(placed)break;
      const q=screen(p,metrics),rect=[q[0]-w/2,q[1]-h/2,w,h];
      if(!visible(rect,metrics)||occupied.some(b=>!(allowOwnArt&&(b.owner===c.overlapOwnArt||b.context))&&overlaps(grow(rect,5),b.bounds)))continue;
      labels.push({...c,position:p,fontPx,fontUnits:fontPx/metrics.scale,screenBounds:rect,bounds:[p[0]-w/2/metrics.scale,p[1]-h/2/metrics.scale,w/metrics.scale,h/metrics.scale]});
      occupied.push({bounds:grow(rect,7)});characters+=c.text.length;placed=true;break;
    }
  }
  return {labels,countLimit,characterLimit,characters};
}
