import { segmentDistance } from './spatial.js';

/** Building identity and its slots outlive any tenant or rendering asset. */
export function createComposition(data, mapping) {
  const buildings = new Map(data.buildings.map(b => [b.id, structuredClone(b)]));
  const slots = new Map(data.slots.map(s => [s.id, structuredClone(s)]));
  if (buildings.size !== data.buildings.length || slots.size !== data.slots.length) throw new Error('Duplicate composition identity');
  for (const b of buildings.values()) {
    if (!mapping.valid(b.route) || !['north', 'south'].includes(b.side) || b.setback < data.road.sidewalkOuter + .3) throw new Error('Building intrudes into sidewalk');
    if (![b.width,b.height,b.depth].every(v=>Number.isFinite(v)&&v>0)) throw new Error('Invalid building dimensions');
  }
  for (const s of slots.values()) {
    const b=buildings.get(s.buildingId);
    if (!b || Math.abs(s.offset)+s.width/2>b.width/2 || s.height>b.height) throw new Error('Frontage outside building');
  }
  for (const e of data.entrances) {
    const s=slots.get(e.slotId),b=s&&buildings.get(s.buildingId);
    if (!b || !mapping.valid(e.route) || Math.abs(mapping.locate(e.route).distance-mapping.locate(b.route).distance-s.offset)>.01) throw new Error('Detached entrance');
  }
  for (const o of data.occupancies) if(!slots.has(o.slotId)) throw new Error('Detached occupant');
  return Object.freeze({data,buildings,slots,
    resolve(periodId, preview='none') {
      const frontages=[];
      for (const slot of slots.values()) {
        // No nearest-year substitution. Synthetic samples require an explicit preview.
        const exact=data.occupancies.filter(o=>o.slotId===slot.id&&o.approval==='accepted'&&o.periodIds.includes(periodId));
        if(exact.length>1)throw new Error('Conflicting accepted occupants');
        const occupant=exact[0] || (preview!=='none' ? data.occupancies.find(o=>o.slotId===slot.id&&o.fixture===preview) : null);
        frontages.push({...slot,occupant:occupant||null,status:occupant?(occupant.fixture?'preview':'supported'):'unknown'});
      }
      return {revision:data.revision,periodId,road:data.road,buildings:[...buildings.values()],frontages,entrances:data.entrances};
    }
  });
}

/** Keep cartographic ground reservations clear, independently of raised facades. */
export function roadClearance(rect, roads) {
  const [x,y,w,h]=rect;
  const inside=p=>p[0]>=x&&p[0]<=x+w&&p[1]>=y&&p[1]<=y+h;
  const corners=[[x,y],[x+w,y],[x+w,y+h],[x,y+h]];
  let clearance=Infinity;
  for(const road of roads)for(let i=1;i<road.art.length;i++){
    const a=road.art[i-1],b=road.art[i];
    // Liang–Barsky clips a segment against the reserved footprint.
    let lo=0,hi=1;const dx=b[0]-a[0],dy=b[1]-a[1];
    for(const [p,q]of [[-dx,a[0]-x],[dx,x+w-a[0]],[-dy,a[1]-y],[dy,y+h-a[1]]]){
      if(p===0){if(q<0){lo=1;hi=0;break;}}else if(p<0)lo=Math.max(lo,q/p);else hi=Math.min(hi,q/p);
    }
    if(inside(a)||inside(b)||lo<=hi)return -road.width/2;
    let d=Math.min(...corners.map(p=>segmentDistance(p,a,b)));
    for(let j=0;j<4;j++)d=Math.min(d,segmentDistance(a,corners[j],corners[(j+1)%4]),segmentDistance(b,corners[j],corners[(j+1)%4]));
    clearance=Math.min(clearance,d-road.width/2);
  }
  return clearance;
}

export function artSidePoint(mapping, distance, side, offset) {
  const p=mapping.locate(mapping.atDistance(distance)).art;
  const q=mapping.locate(mapping.atDistance(Math.min(mapping.total,distance+.1))).art;
  const dx=q[0]-p[0],dy=q[1]-p[1],len=Math.hypot(dx,dy)||1,sign=side==='south'?1:-1;
  return [p[0]-dy/len*offset*sign,p[1]+dx/len*offset*sign];
}
export const CHARACTER_PROFILES=Object.freeze({child:{height:1.4,width:.72,eye:1.24},youth:{height:1.6,width:.79,eye:1.43}});
