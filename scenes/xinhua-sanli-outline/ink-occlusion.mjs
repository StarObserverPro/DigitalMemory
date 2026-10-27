import * as T from '../xinhua-junction-outline/vendor/three/build/three.module.js';

const LIMIT=40;
// These masks remove ink fragments only. They do not paint a white halo on the
// road, move any world geometry, or disable real building depth occlusion.
export function makeInkOcclusion(){
 const uniforms={inkMaskCount:{value:0},inkMaskA:{value:Array.from({length:LIMIT},()=>new T.Vector4())},inkMaskB:{value:Array.from({length:LIMIT},()=>new T.Vector4())},inkMaskC:{value:Array.from({length:LIMIT},()=>new T.Vector4())},inkPixelRatio:{value:1}};
 let width=1,height=1,count=0;
 const audit={masks:0,clearGapPixels:2.5,treeMasks:0,wheelMasks:0,visibleWheels:0,thinLineMasks:0};
 function material(m){
  m.uniforms.inkOwner={value:0};const previous=m.onBeforeCompile;
  m.onBeforeCompile=shader=>{
   previous(shader);Object.assign(shader.uniforms,uniforms,{inkOwner:m.uniforms.inkOwner});
   shader.vertexShader='varying float vInkDepth;\n'+shader.vertexShader.replace('#include <fog_vertex>','#include <fog_vertex>\n vInkDepth = -mvPosition.z;');
   shader.fragmentShader=`
    varying float vInkDepth;
    uniform int inkMaskCount;
    uniform vec4 inkMaskA[${LIMIT}];
    uniform vec4 inkMaskB[${LIMIT}];
    uniform vec4 inkMaskC[${LIMIT}];
    uniform float inkOwner;
    uniform float inkPixelRatio;
    void maskBackgroundInk(){
     vec2 pixel=gl_FragCoord.xy/inkPixelRatio;
     for(int i=0;i<${LIMIT};i++){
      if(i>=inkMaskCount)break;
      vec4 a=inkMaskA[i],b=inkMaskB[i],c=inkMaskC[i];
      if(abs(inkOwner-b.w)<0.1)continue;
      float distanceToInk,depth;
      if(c.x>0.5){
       vec2 q=pixel-a.xy;
       vec2 xAxis=a.zw*(b.z+c.y)-q*c.y,yAxis=b.xy*(b.z+c.z)-q*c.z;
       float det=xAxis.x*yAxis.y-xAxis.y*yAxis.x;
       if(abs(det)<0.01)continue;
       vec2 uv=vec2(q.x*yAxis.y-q.y*yAxis.x,xAxis.x*q.y-xAxis.y*q.x)*b.z/det;
       float radius=length(uv);
       vec2 unit=uv/max(radius,0.001);
       float boundaryDepth=b.z+c.y*unit.x+c.z*unit.y;
       if(boundaryDepth<=0.1)continue;
       vec2 boundary=(a.zw*(b.z+c.y)*unit.x+b.xy*(b.z+c.z)*unit.y)/boundaryDepth;
       distanceToInk=radius<0.001?-100.0:length(q)-length(boundary);
       depth=b.z+uv.x*c.y+uv.y*c.z;
      }else{
       vec2 edge=a.zw-a.xy;float t=clamp(dot(pixel-a.xy,edge)/max(dot(edge,edge),0.001),0.0,1.0);
       distanceToInk=length(pixel-mix(a.xy,a.zw,t));depth=1.0/mix(1.0/b.z,1.0/c.y,t);
      }
      if(depth>0.1 && distanceToInk<c.w && vInkDepth>=depth-0.035)discard;
     }
    }
   `+shader.fragmentShader.replace('#include <clipping_planes_fragment>','#include <clipping_planes_fragment>\n maskBackgroundInk();');
  };
  m.customProgramCacheKey=()=> 'stable-contour-ink-clearance-v2';
 }
 function stroke(line,owner=0){
  line.userData.inkOwner=owner;const previous=line.onBeforeRender;
  line.onBeforeRender=function(renderer,...args){previous.call(this,renderer,...args);this.material.uniforms.inkOwner.value=this.userData.inkOwner;uniforms.inkPixelRatio.value=renderer.getPixelRatio();this.material.uniformsNeedUpdate=true;};
  return line;
 }
 function project(p,camera){const view=p.clone().applyMatrix4(camera.matrixWorldInverse),q=p.clone().project(camera);return {x:(q.x+1)*width/2,y:(q.y+1)*height/2,depth:-view.z,z:q.z};}
 function ellipse(group,center,axisX,axisY,owner,gap,camera,minimumRadius=0){
  if(count>=LIMIT)return false;
  const p=project(group.localToWorld(center.clone()),camera),x=project(group.localToWorld(center.clone().add(axisX)),camera),y=project(group.localToWorld(center.clone().add(axisY)),camera);
  if(p.z<=-1||p.z>=1||p.depth<Math.hypot(x.depth-p.depth,y.depth-p.depth)+.2)return false;
  const ax=x.x-p.x,ay=x.y-p.y,bx=y.x-p.x,by=y.y-p.y,major=Math.max(Math.hypot(ax,ay),Math.hypot(bx,by));
  if(p.x+major+gap<0||p.y+major+gap<0||p.x-major-gap>width||p.y-major-gap>height)return false;
  if(Math.abs(ax*by-ay*bx)/Math.max(.001,major)<minimumRadius)return false;
  uniforms.inkMaskA.value[count].set(p.x,p.y,x.x-p.x,x.y-p.y);
  uniforms.inkMaskB.value[count].set(y.x-p.x,y.y-p.y,p.depth,owner);
  uniforms.inkMaskC.value[count].set(1,x.depth-p.depth,y.depth-p.depth,gap);count++;return true;
 }
 function capsule(group,start,end,owner,radius,camera){
  if(count>=LIMIT)return;const a=project(group.localToWorld(start.clone()),camera),b=project(group.localToWorld(end.clone()),camera);
  if(a.depth<.2||b.depth<.2)return;
  if(Math.max(a.x,b.x)+radius<0||Math.max(a.y,b.y)+radius<0||Math.min(a.x,b.x)-radius>width||Math.min(a.y,b.y)-radius>height)return;
  uniforms.inkMaskA.value[count].set(a.x,a.y,b.x,b.y);uniforms.inkMaskB.value[count].set(0,0,a.depth,owner);uniforms.inkMaskC.value[count].set(0,b.depth,0,radius);count++;
 }
 function update(camera,trees,cars,thinLines=[]){
  count=0;
  // Full-block trees must not consume every slot before nearby wheels are considered.
  for(const c of cars)for(const w of c.wheels){w.updateMatrixWorld();w.visible=ellipse(w,new T.Vector3(),new T.Vector3(0,.3,0),new T.Vector3(0,0,.3),w.userData.inkOwner,3.95,camera,w.visible?1.3:1.7);}
  audit.wheelMasks=count;audit.visibleWheels=count;
  const beforeTrees=count;
  for(const t of [...trees].sort((a,b)=>a.group.position.distanceToSquared(camera.position)-b.group.position.distanceToSquared(camera.position))){
   ellipse(t.group,new T.Vector3(0,t.height-1.5,0),new T.Vector3(1.6,0,0),new T.Vector3(0,1.85,0),t.inkOwner,4.25,camera);
   capsule(t.group,new T.Vector3(0,.02,0),new T.Vector3(0,t.height-3.35,0),t.inkOwner,4.25,camera);
  }
  audit.treeMasks=count-beforeTrees;
  const beforeThin=count;for(const line of thinLines)for(let i=1;i<line.points.length;i++)capsule(line.group,new T.Vector3(...line.points[i-1]),new T.Vector3(...line.points[i]),line.owner,line.radius,camera);
  audit.thinLineMasks=count-beforeThin;uniforms.inkMaskCount.value=count;audit.masks=count;
 }
 return {material,stroke,update,audit,resize:(w,h)=>{width=w;height=h;}};
}
