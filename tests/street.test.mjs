import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as T from '../assets/vendor/three/three.module.min.js';
import {createTransform} from '../src/domain/spatial.js';
import {createIllustrationMapping,STAGE} from '../src/domain/illustration.js';
import {createComposition} from '../src/domain/composition.js';
import {createSession,createPortalController} from '../src/application/session.js';
import {STREET_VIEW,gaitPose,createStreetFrame,cameraPose} from '../src/explorer/street-layout.js';
import {createStreetWorld} from '../src/explorer/street-world.js';
const read=n=>JSON.parse(fs.readFileSync(new URL('../content/public/'+n,import.meta.url)));
const transform=createTransform(read('orientation.json').bounds),mapping=createIllustrationMapping(read('illustration-mapping.json'),transform);
const composition=createComposition(read('scene-composition.json'),mapping);
const close=(a,b,t=.00001)=>assert.ok(Math.abs(a-b)<t,`${a} differs from ${b}`);

test('target walking reaches the gate without overshoot, clamps sidewalk and stops at the modeled ends',()=>{
 const s=createSession(null,mapping);s.dispatch({type:'view',view:'street'});
 const d=mapping.locate(composition.data.entrances[0].route).distance;
 s.dispatch({type:'street-target',target:{distance:d,lateral:STAGE.lateralMax,entranceId:'demo-street-door'}});
 for(let i=0;i<500;i++)s.dispatch({type:'walk',input:{along:0,lateral:0},dt:.05});
 close(mapping.locate(s.get().route).distance,d);close(s.get().street.lateral,STAGE.lateralMax);
 const reached=s.get();s.dispatch({type:'walk',input:{along:0,lateral:0},dt:.05});assert.deepEqual(s.get(),reached);
 // Real displacement determines facing and cancels the previous destination.
 s.dispatch({type:'walk',input:{along:-1,lateral:0},dt:.05});assert.equal(s.get().street.target,null);close(Math.abs(s.get().street.heading),Math.PI);
 for(let i=0;i<2000;i++)s.dispatch({type:'walk',input:{along:-1,lateral:-1},dt:.05});
 close(mapping.locate(s.get().route).distance,STAGE.min);close(s.get().street.lateral,STAGE.lateralMin);
});

test('ground projection and pointer inverse retain the source route through a bend',()=>{
 const {frame,locateGround}=createStreetFrame(mapping,transform);
 for(const d of[362,405,434.9439,456,487,499])for(const lateral of[5.1,5.5,6.7]){
  const p=frame(d,lateral),hit=locateGround(p.x,p.z);close(hit.distance,d,.04);close(hit.lateral,lateral,.04);
 }
});

test('each gait phase keeps a foot planted, joints connected and root on pavement',()=>{
 for(let i=0;i<180;i++){
  const pose=gaitPose(i/179*1.05);close(pose.rootY,STREET_VIEW.pavementY);
  assert.ok(Math.min(...pose.legs.map(l=>l.sole))<1e-10);
  for(const l of pose.legs){assert.ok(l.sole>=0);close(l.foot[1]-.06,l.sole);close(Math.hypot(...l.hip.map((v,j)=>v-l.knee[j])),.265);close(Math.hypot(...l.ankle.map((v,j)=>v-l.knee[j])),.265);}
 }
 const idle=gaitPose(100,0);assert.deepEqual(idle.legs.map(l=>l.sole),[0,0]);
});

test('actual scene volumes, camera projection and raycast keep the child, sidewalk and gate usable',()=>{
 const world=createStreetWorld({mapping,transform,composition,periodId:'window-2000'}),s=createSession(null,mapping).get();
 s.route=mapping.atDistance(world.gateDistance);s.street.lateral=STAGE.lateralMax;
 const p=world.frame(world.gateDistance,s.street.lateral);world.posePerson(s);world.sync(s);
 assert.ok([...world.instances.values()].filter(i=>i.building.shellAsset!=='entry').every(i=>i.height>1.4&&i.building.depth*STREET_VIEW.groundScale>1));
 assert.ok([...world.instances.values()].filter(i=>i.building.shellAsset==='apartment').every(i=>i.height/1.4>3&&i.height/1.4<5.5));
 for(const [width,height]of[[1280,800],[390,844]]){
  world.setCamera(p,width/height,0);world.revealPerson();
  const box=new T.Box3().setFromObject(world.person);close(box.min.y,.16);assert.ok(box.max.y-box.min.y>1.39);
  const foot=new T.Vector3(p.x,.16,p.z).project(world.camera),head=new T.Vector3(p.x,1.56,p.z).project(world.camera);
  const screenHeight=Math.abs(head.y-foot.y)*height/2;assert.ok(screenHeight>45&&screenHeight<110);
  assert.ok(Math.abs(foot.x)<.8&&Math.abs(head.y)<.8&&Math.abs(foot.y)<.8);
  const gp=world.frame(world.gateDistance,world.gateBuilding.setback),gate=new T.Vector3(gp.x,1.2,gp.z).project(world.camera);
  assert.ok(Math.abs(gate.x)<.9&&Math.abs(gate.y)<.9);
  const ray=new T.Raycaster();ray.setFromCamera(new T.Vector2(gate.x,gate.y),world.camera);
  const hits=ray.intersectObjects(world.pickObjects,false);assert.equal(hits[0]?.object.userData.pick,'entrance');
  const walk=world.frame(world.gateDistance-3,5.7),screen=new T.Vector3(walk.x,.16,walk.z).project(world.camera);ray.setFromCamera(new T.Vector2(screen.x,screen.y),world.camera);
  assert.equal(ray.intersectObjects(world.pickObjects,false)[0]?.object.userData.pick,'walk');
 }
 world.dispose();
});

test('camera does not rotate with facing; entering and returning restores route, orbit and sidewalk',async()=>{
 const s=createSession(null,mapping);s.dispatch({type:'view',view:'street'});s.dispatch({type:'street-camera',yaw:.4});
 s.dispatch({type:'walk',input:{along:0,lateral:1},dt:.05});
 const origin=s.get(),p=createStreetFrame(mapping,transform).frame(mapping.locate(origin.route).distance,origin.street.lateral);
 const camera=cameraPose(p,1.6,origin.street.cameraYaw);s.dispatch({type:'street-heading',heading:2});assert.deepEqual(cameraPose(p,1.6,s.get().street.cameraYaw),camera);
 const before=s.get(),portals=createPortalController(s,{loadScene:async id=>({id})});await portals.enter('demo-courtyard');portals.back();assert.deepEqual(s.get(),before);
});
