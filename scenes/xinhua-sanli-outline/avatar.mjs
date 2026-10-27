import * as T from '../xinhua-junction-outline/vendor/three/build/three.module.js';

// One uninterrupted boundary: left neck, limbs, right neck, head, left neck.
// The head has an open lower arc that joins the neck; no circle or joint seam.
const base=[[-.17,1.58],[-.34,1.46],[-.63,1.12],[-.56,1.01],[-.26,1.24],[-.24,.88],[-.43,.12],[-.24,.08],[0,.64],[.24,.08],[.43,.12],[.24,.88],[.26,1.24],[.56,1.01],[.63,1.12],[.34,1.46],[.17,1.58]];
for(let i=0;i<=28;i++){const a=(-62+i*304/28)*Math.PI/180;base.push([Math.cos(a)*.34,1.92+Math.sin(a)*.34]);}

export function avatarContour(distance=0,amount=0){
 const phase=distance*2.8,s=Math.sin(phase),leftLift=Math.max(0,s)*.17*amount,rightLift=Math.max(0,-s)*.17*amount;
 return base.map(([x,y],i)=>{
  if(i===6||i===7){x+=s*.13*amount;y+=leftLift;}
  if(i===9||i===10){x-=s*.13*amount;y+=rightLift;}
  if(i===2||i===3){x-=s*.045*amount;y-=s*.055*amount;}
  if(i===13||i===14){x+=s*.045*amount;y+=s*.055*amount;}
  if(y>.64)y+=Math.abs(s)*.018*amount;
  return [x,y];
 });
}

export function makeAvatar(scene,drawing){
 const group=new T.Group();scene.add(group);
 const rest=avatarContour(),geometry=new T.BufferGeometry();
 geometry.setAttribute('position',new T.Float32BufferAttribute(rest.flatMap(p=>[...p,0]),3));
 geometry.setIndex(T.ShapeUtils.triangulateShape(rest.map(p=>new T.Vector2(...p)),[]).flat());
 geometry.boundingSphere=new T.Sphere(new T.Vector3(0,1.15,0),1.5);
 const face=new T.MeshBasicMaterial({color:0xfaf9f4,side:T.DoubleSide,polygonOffset:true,polygonOffsetFactor:1,polygonOffsetUnits:1});
 const fill=new T.Mesh(geometry,face);group.add(fill);
 const outline=drawing.stroke(rest.concat([rest[0]]).map(p=>[...p,.015]),drawing.mainInk,group);
 let amount=0;
 const audit={outlineStrokes:1,headSeparate:false,phase:0,leftFoot:[-.24,.08],rightFoot:[.24,.08],amount:0};
 function update(state,dt){
  amount=T.MathUtils.lerp(amount,state.walking?1:0,1-Math.exp(-dt*15));
  if(amount<.001)amount=0;
  const points=avatarContour(state.distanceWalked,amount),position=geometry.attributes.position;
  points.forEach((p,i)=>position.setXYZ(i,p[0],p[1],0));position.needsUpdate=true;
  const buffer=outline.geometry.attributes.instanceStart.data;
  for(let i=0;i<points.length;i++){const a=points[i],b=points[(i+1)%points.length];buffer.array.set([a[0],a[1],.015,b[0],b[1],.015],i*6);}buffer.needsUpdate=true;
  group.position.set(state.position[0],.11,state.position[1]);group.rotation.y=state.yaw;
  audit.phase=+(state.distanceWalked*2.8).toFixed(3);audit.amount=+amount.toFixed(3);audit.leftFoot=points[7].map(v=>+v.toFixed(3));audit.rightFoot=points[9].map(v=>+v.toFixed(3));
 }
 return {group,update,audit};
}
