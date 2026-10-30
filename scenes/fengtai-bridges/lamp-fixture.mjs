import * as T from '../xinhua-junction-outline/vendor/three/build/three.module.js';
import {interpolateKnots} from './sketch-path.mjs';
import {orientedTriangle,capBoundary} from './mesh-topology.mjs';
const add=(a,b,k=1)=>a.map((x,i)=>x+b[i]*k),dot=(a,b)=>a.reduce((s,x,i)=>s+x*b[i],0),sub=(a,b)=>a.map((x,i)=>x-b[i]);
export function makeFixture(site){
 const wall=site.wallNormal,center=add(site.anchor,wall,.22),angle=1.04,u=site.tangent,v=add(wall.map(x=>x*Math.cos(angle)),[0,Math.sin(angle),0]),normal=add(wall.map(x=>x*Math.sin(angle)),[0,-Math.cos(angle),0]),paths=[],scale=.56;
 const world=(x,y,d=0)=>add(add(add(center,u,x),v,y),normal,d),path=(kind,points,width,closed=false)=>({id:'lamp-'+site.id+'-'+kind,role:kind.startsWith('ray')?'ray':'lamp',fixtureId:site.id,kind,width,closed,curves:interpolateKnots(points.map((p,i)=>({s:i,p,weight:1})),closed)});
 const outline=[[-.48,-.32],[0,-.325],[.48,-.31],[.57,-.23],[.575,0],[.565,.24],[.48,.32],[0,.33],[-.49,.325],[-.575,.24],[-.57,0],[-.565,-.24],[-.48,-.32]],casing=path('casing',outline.map(([x,y])=>world(x*scale,y*scale,.012)),3.1,true);paths.push(casing);
 const w=.322,h=.185,r=.035,contour=[[-w+r,-h],[w-r,-h],[w,-h+r],[w,h-r],[w-r,h],[-w+r,h],[-w,h-r],[-w,-h+r]].map(p=>new T.Vector2(...p)),shape=new T.ShapeGeometry(new T.Shape(contour)),flat=shape.attributes.position,front=[],back=[];
 for(let i=0;i<flat.count;i++){const p=world(flat.getX(i),flat.getY(i));front.push(p);back.push(add(p,wall,.012-dot(sub(p,site.anchor),wall)));}
 const triangles=[],indices=shape.index.array,faces=[];for(let i=0;i<indices.length;i+=3){const[a,b,c]=indices.slice(i,i+3),before=triangles.length;orientedTriangle(triangles,front[a],front[b],front[c],normal);if(triangles.length===before)continue;faces.push([a,b,c]);orientedTriangle(triangles,back[a],back[b],back[c],wall.map(x=>-x));}
 for(const[i,j]of capBoundary(faces)){const n=front[i].map((x,k)=>(x+front[j][k])/2-center[k]);orientedTriangle(triangles,front[i],back[i],front[j],n);orientedTriangle(triangles,back[i],back[j],front[j],n);}shape.dispose();
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(triangles.flat(2),3));g.computeVertexNormals();const body=new T.Mesh(g,new T.MeshBasicMaterial({color:'#faf9f4',side:T.FrontSide,depthTest:true,depthWrite:true}));body.name='simple-lamp-'+site.id;body.userData.surfaceKind='fixture-solid';
 if(site.rayMark)for(const[index,weights]of[[.80,-.20,-.18],[.65,-.50,.02],[.50,-.70,.20]].entries()){
  const direction=add(add(normal.map(x=>x*weights[0]),v,weights[1]),u,weights[2]),length=Math.hypot(...direction),d=direction.map(x=>x/length),points=[.42,.56,.73,.90].map((r,j)=>add(add(center,d,r),u,[0,.018,-.015,.008][j]));paths.push(path('ray-'+index,points,2.65));
 }
 return{...site,center,normal,faceU:u,faceV:v,faceWidthM:.644,faceHeightM:.37,backClearanceM:.012,backPoints:back,paths,meshes:[body]};
}
