import * as T from '../../assets/vendor/three/three.module.min.js';
import { STAGE } from '../domain/illustration.js';
import { CHARACTER_PROFILES } from '../domain/composition.js';
import { STREET_VIEW, createStreetFrame, displayedHeight, gaitPose, cameraPose } from './street-layout.js';

/** Geometry only. No renderer, input loop or competing location state. */
export function createStreetWorld({mapping, transform, composition, periodId, labelMaterial}) {
  const scene = new T.Scene(); scene.background = new T.Color('#ebe7dc'); scene.fog = new T.Fog('#ebe7dc', 36, 68);
  const {frame, locateGround} = createStreetFrame(mapping, transform), scale = STREET_VIEW.groundScale;
  const resources = new Set(), meshes = [], materials = new Map();
  const own = value => (resources.add(value), value);
  const cube = own(new T.BoxGeometry(1,1,1));
  const sphere = own(new T.SphereGeometry(1,16,12));
  const cylinder = own(new T.CylinderGeometry(1,1,1,10));
  function material(color, group='shared') {
    const key=color+'|'+group;
    if(!materials.has(key))materials.set(key,own(new T.MeshLambertMaterial({color})));
    return materials.get(key);
  }
  function mesh(parent, geometry, color, position, size, group='shared') {
    const m = new T.Mesh(geometry,material(color,group));m.position.set(...position);m.scale.set(...size);
    m.castShadow=true;m.receiveShadow=true;parent.add(m);meshes.push(m);return m;
  }
  const box = (parent, position, size, color, group) => mesh(parent,cube,color,position,size,group);
  const ball = (parent, position, size, color) => mesh(parent,sphere,color,position,size);
  const road = new T.Group(), buildings = new T.Group(), frontages = new T.Group();scene.add(road,buildings,frontages);
  function strip(left,right,y,color) {
    const v=[],idx=[];
    for(let d=STAGE.min-24;d<=STAGE.max+24;d+=2)for(const x of[left,right]){const p=frame(d,x);v.push(p.x,y,p.z);}
    for(let i=0;i<v.length/6-1;i++){const a=i*2;idx.push(a,a+1,a+2,a+1,a+3,a+2);}
    const g=own(new T.BufferGeometry());g.setAttribute('position',new T.Float32BufferAttribute(v,3));g.setIndex(idx);g.computeVertexNormals();
    return mesh(road,g,color,[0,0,0],[1,1,1]);
  }
  strip(-70,70,-.08,'#deddd2');strip(-4.1,4.1,0,'#707777');
  const walkingSurface=strip(4.1,7.7,STREET_VIEW.pavementY,'#d3d0c6');walkingSurface.userData.pick='walk';
  strip(-7.7,-4.1,STREET_VIEW.pavementY,'#d3d0c6');
  strip(7.7,27,.03,'#c2c9b8');strip(-27,-7.7,.03,'#c2c9b8');
  for(let d=STAGE.min-20;d<=STAGE.max+20;d+=4)for(const side of[-1,1]){
    const p=frame(d,side*4.12),b=box(road,[p.x,.08,p.z],[.12,.16,4*scale],'#eeece3');b.rotation.y=p.yaw;
  }
  for(let d=STAGE.min-18;d<=STAGE.max+18;d+=8){const p=frame(d),m=box(road,[p.x,.006,p.z],[.07,.012,1.8*scale],'#c9c9b9');m.rotation.y=p.yaw;}
  // Broad paving joints only. The sidewalk stays readable at the actual camera scale.
  for(let d=STAGE.min-18;d<STAGE.max+18;d+=3)for(const side of[-1,1]){
    const p=frame(d,side*5.9),m=box(road,[p.x,.162,p.z],[3.45*scale,.004,.016],'#babdb5');m.rotation.y=p.yaw;
  }
  const resolved=composition.resolve(periodId),instances=new Map(),occluders=[],pickObjects=[walkingSurface],gateParts=[];
  const entrance=resolved.entrances[0],gateDistance=mapping.locate(entrance.route).distance;
  const gateBuilding=composition.buildings.get(composition.slots.get(entrance.slotId).buildingId);
  const gateTarget={distance:gateDistance,lateral:STAGE.lateralMax,entranceId:entrance.id};
  for(const b of resolved.buildings){
    const distance=mapping.locate(b.route).distance,side=b.side==='north'?-1:1,p=frame(distance,side*b.setback);
    const root=new T.Group();root.position.set(p.x,STREET_VIEW.pavementY,p.z);root.rotation.y=p.yaw;buildings.add(root);
    const h=displayedHeight(b),w=b.width*scale,depth=b.depth*scale,parts=[];
    const add=(pos,size,color)=>{const m=box(root,pos,size,color,b.id);parts.push(m);return m;};
    if(b.shellAsset==='entry'){
      for(const z of[-1,1])add([0,1.08,z*1.1],[.32,2.16,.3],'#ccc8bd');
      add([0,2.25,0],[.4,.2,2.5],'#7e8b82');
      // Open passage. The gate leaves are pushed back, with no solid invisible panel across it.
      for(const z of[-1,1])add([.62,.62,z*.98],[1.15,1.24,.07],'#87978c');
      const pick=add([0,1.05,0],[.08,2.1,2.2],'#87978c');pick.material=own(new T.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false}));pick.castShadow=false;
      pick.userData.pick='entrance';pickObjects.push(pick);gateParts.push(...parts.filter(m=>m!==pick));
      const gp=frame(distance,8.4);const path=box(road,[gp.x,.08,gp.z],[3.2*scale,.16,2.8*scale],'#d3d0c6');path.rotation.y=gp.yaw;
      if(labelMaterial){const sign=new T.Mesh(own(new T.PlaneGeometry(1.05,.24)),own(labelMaterial('院门')));sign.position.set(-.23,2.25,0);sign.rotation.y=-Math.PI/2;root.add(sign);parts.push(sign);}
    }else{
      add([side*depth/2,-.065,0],[depth+.08,.13,w+.08],'#b6b9af');
      const body=add([side*depth/2,h/2,0],[depth,h,w],b.shellAsset==='apartment'?'#c5c5bd':'#cfcac0');
      body.userData.pick='building';pickObjects.push(body);
      add([side*depth/2,h+.075,0],[depth+.16,.15,w+.14],'#a4aaa5');
      add([-side*.04,.1,0],[.13,.2,w+.06],'#b1b4ab');
      if(b.shellAsset==='apartment'){
        // Compressed floors are a presentation choice, not surveyed floor heights.
        for(let row=0;row<4;row++)for(let col=0;col<4;col++){
          add([-side*.035,1.1+row*1.23,(col-1.5)*w/4.4],[.07,.58,w/7.5],'#91a1a0');
        }
        for(let row=0;row<4;row++)for(let col=0;col<4;col++)add([side*(depth+.035),1.1+row*1.23,(col-1.5)*w/4.4],[.07,.58,w/7.5],'#91a1a0');
        add([-side*.065,.86,0],[.13,1.72,.7],'#8d9890');
      }
    }
    if(b.shellAsset==='entry')for(const part of parts){part.userData.pick='entrance';if(!pickObjects.includes(part))pickObjects.push(part);}
    instances.set(b.id,{root,parts,building:b,distance,height:h});
    occluders.push({id:b.id,parts,opacity:1});
  }
  // Housing, its boundary fence and the detached small shops are distinct modules.
  for(const side of[-1,1])for(let d=STAGE.min-8;d<STAGE.max+8;d+=6){
    if(side>0&&(Math.abs(d-gateDistance)<5||resolved.buildings.some(b=>b.side==='south'&&b.shellAsset==='service'&&Math.abs(d-mapping.locate(b.route).distance)<b.width/2+2)))continue;
    const p=frame(d,side*7.85),group=new T.Group();group.position.set(p.x,.03,p.z);group.rotation.y=p.yaw;buildings.add(group);
    box(group,[0,.11,0],[.12,.22,5.7*scale],'#aaaFA4');
    for(const y of[.42,.82])box(group,[0,y,0],[.05,.045,5.7*scale],'#8d9991');
    for(const z of[-2.75,0,2.75])box(group,[0,.48,z*scale],[.07,.96,.07],'#8d9991');
  }
  const slotMeshes=new Map();
  for(const s of resolved.frontages){
    const instance=instances.get(s.buildingId),b=instance.building;if(s.type!=='shop')continue;
    const side=b.side==='north'?-1:1,p=frame(instance.distance+s.offset,side*(b.setback-.045));
    const root=new T.Group();root.position.set(p.x,.16,p.z);root.rotation.y=p.yaw;frontages.add(root);
    const width=s.width*scale,parts=[];
    for(const [position,size,color]of[
      [[0,.99,0],[.1,1.98,width*.91],'#a2afab'],
      [[-side*.07,.95,-width*.31],[.12,1.9,width*.24],'#7f918a'],
      [[-side*.08,2.23,0],[.14,.35,width*.98],'#aab6ab']]){
      const m=box(root,position,size,color,b.id);parts.push(m);instance.parts.push(m);
    }
    slotMeshes.set(s.id,{root,parts,sign:parts.at(-1),occupantId:null});
  }
  // A small fully volumetric, three-head-high child. Its root never bobs above the pavement.
  const person=new T.Group();person.name='grounded-child';scene.add(person);
  const contactShadow=new T.Mesh(own(new T.CircleGeometry(.29,24)),own(new T.MeshBasicMaterial({color:'#56645a',transparent:true,opacity:.20,depthWrite:false})));contactShadow.rotation.x=-Math.PI/2;contactShadow.scale.y=.7;scene.add(contactShadow);
  ball(person,[0,1.12,0],[.27,.28,.25],'#e0c4a1');
  const cap=mesh(person,own(new T.SphereGeometry(1,16,10,0,Math.PI*2,0,Math.PI*.52)),'#696c68',[0,1.13,0],[.278,.284,.257]);
  ball(person,[0,.78,0],[.245,.27,.17],'#849d9e');
  ball(person,[0,.55,0],[.205,.13,.16],'#737f80');
  box(person,[0,.78,.19],[.31,.37,.16],'#a58d70');
  for(const x of[-.09,.09])ball(person,[x,1.11,-.239],[.024,.034,.014],'#515955');
  ball(person,[0,1.06,-.254],[.035,.04,.035],'#d2b792');
  const limbs=[-1,1].map(side=>({
    thigh:mesh(person,cylinder,'#6f7e7d',[0,0,0],[.075,1,.075]),
    shin:mesh(person,cylinder,'#7a8b89',[0,0,0],[.063,1,.063]),
    knee:ball(person,[0,0,0],[.082,.082,.082],'#7a8b89'),
    shoe:box(person,[0,0,0],[.18,.12,.29],'#555f5c'),
    arm:mesh(person,cylinder,'#849d9e',[0,0,0],[.078,1,.078]),
    hand:ball(person,[0,0,0],[.078,.08,.075],'#e0c4a1'),side
  }));
  function bone(m,a,b){const av=new T.Vector3(...a),bv=new T.Vector3(...b),delta=bv.clone().sub(av);m.position.copy(av.add(bv).multiplyScalar(.5));m.scale.y=delta.length();m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),delta.normalize());}
  let pose;
  function posePerson(state,travel=0,amount=0){
    const profile=CHARACTER_PROFILES[state.characterId]||CHARACTER_PROFILES.child;
    const p=frame(mapping.locate(state.route).distance,state.street.lateral);
    person.scale.setScalar(profile.height/1.4);person.position.set(p.x,.16,p.z);person.rotation.y=p.yaw-state.street.heading;contactShadow.position.set(p.x,.164,p.z);
    pose=gaitPose(travel,amount);
    pose.legs.forEach((leg,i)=>{const l=limbs[i];bone(l.thigh,leg.hip,leg.knee);bone(l.shin,leg.knee,leg.ankle);l.knee.position.set(...leg.knee);l.shoe.position.set(...leg.foot);
      const shoulder=[l.side*.255,.91,0],hand=[l.side*.30,.58,-leg.swing];bone(l.arm,shoulder,hand);l.hand.position.set(...hand);
    });
    return {point:p,profile,pose};
  }
  const mark=new T.Mesh(own(new T.RingGeometry(.14,.19,24)),own(new T.MeshBasicMaterial({color:'#6f8c7b',transparent:true,opacity:.55,depthWrite:false})));mark.rotation.x=-Math.PI/2;scene.add(mark);mark.visible=false;
  const hemisphere=new T.HemisphereLight('#fff7e4','#a5b5a4',1.25);scene.add(hemisphere);
  const sun=new T.DirectionalLight('#fff5de',1.5);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);
  Object.assign(sun.shadow.camera,{left:-20,right:20,top:20,bottom:-20,near:1,far:70});sun.shadow.bias=-.0005;sun.shadow.normalBias=.02;scene.add(sun,sun.target);
  const camera=new T.OrthographicCamera(-10,10,7,-7,.1,120);
  function setCamera(point,aspect,orbit=0){const c=cameraPose(point,aspect,orbit);camera.left=-c.span*aspect/2;camera.right=-camera.left;camera.top=c.span/2;camera.bottom=-c.span/2;camera.position.set(...c.position);camera.lookAt(...c.target);camera.updateProjectionMatrix();camera.updateMatrixWorld();sun.position.set(point.x-9,24,point.z+9);sun.target.position.set(point.x,0,point.z);return c;}
  const occlusionRay=new T.Raycaster();
  function revealPerson(){
    const target=person.position.clone().add(new T.Vector3(0,.65,0));const direction=target.clone().sub(camera.position),length=direction.length();
    occlusionRay.set(camera.position,direction.normalize());occlusionRay.far=length-.5;
    scene.updateMatrixWorld(true);
    for(const entry of occluders){
      const hit=occlusionRay.intersectObjects(entry.parts.filter(m=>m.userData.pick==='building'),false).length>0;
      const opacity=hit?.18:1;if(opacity===entry.opacity)continue;entry.opacity=opacity;
      for(const m of entry.parts){if(m.userData.pick==='entrance')continue;m.material.opacity=opacity;m.material.transparent=hit;m.material.depthWrite=!hit;m.castShadow=!hit;}
    }
  }
  let occupancyKey='';
  function sync(state){
    road.visible=state.layers.roads;buildings.visible=state.layers.buildings;frontages.visible=state.layers.buildings&&state.layers.frontages;person.visible=contactShadow.visible=state.layers.person;
    const key=state.periodId+'|'+state.frontagePreview;if(occupancyKey!==key){occupancyKey=key;
      for(const s of composition.resolve(state.periodId,state.frontagePreview).frontages){const record=slotMeshes.get(s.id);if(!record)continue;
        const id=s.occupant?.id||null;if(record.occupantId===id)continue;
        const previous=record.sign.material;if(previous.userData.ownedTexture){previous.userData.ownedTexture.dispose();previous.dispose();resources.delete(previous);}
        record.sign.material=s.occupant&&labelMaterial?own(labelMaterial(s.occupant.label)):material('#aab6ab',s.buildingId);record.occupantId=id;
      }
    }
    const t=state.street.target;mark.visible=Boolean(t)&&state.layers.roads;if(t){const p=frame(t.distance,t.lateral);mark.position.set(p.x,.166,p.z);}
  }
  function dispose(){for(const r of resources){r.userData?.ownedTexture?.dispose();r.dispose();}}
  return {scene,camera,road,buildings,frontages,person,frame,locateGround,posePerson,setCamera,revealPerson,sync,dispose,
    gateDistance,gateTarget,gateBuilding,gateParts,entrance,pickObjects,instances,slotMeshes,
    get pose(){return pose;},meshes,resources};
}
