import * as T from '../xinhua-junction-outline/vendor/three/build/three.module.js';
import {samplePath} from './sketch-path.mjs';
const vertexShader=`attribute vec3 tangent;attribute vec2 offset;attribute float weight;attribute float cap;uniform vec2 resolution;uniform float linewidth;varying vec2 vOffset;varying float vCap;varying float vDepth;
void main(){vec4 view=modelViewMatrix*vec4(position,1.0);vec4 clip=projectionMatrix*view;vec4 dc=projectionMatrix*vec4(mat3(modelViewMatrix)*tangent,0.0);vec2 delta=(dc.xy*clip.w-clip.xy*dc.w)*resolution;vec2 dir=delta/max(length(delta),0.00001);vec2 normal=vec2(-dir.y,dir.x);clip.xy+=(normal*offset.x+dir*offset.y)*linewidth*weight/resolution*clip.w;
float lift=min(.045,linewidth*max(0.,-view.z)*1.25/(resolution.y*projectionMatrix[1][1]));view.z+=min(lift,max(0.,-view.z-.105));vec4 lifted=projectionMatrix*view;clip.z=lifted.z/lifted.w*clip.w;gl_Position=clip;vOffset=offset;vCap=cap;vDepth=-view.z;}`;
const fragmentShader=`uniform vec3 inkColor;varying float vDepth;void main(){float fog=smoothstep(78.,165.,vDepth);gl_FragColor=vec4(mix(inkColor,vec3(0.956,0.947,0.905),fog),1.0);
#include <tonemapping_fragment>
#include <colorspace_fragment>}`;
export function ribbonGeometry(path){
 const samples=samplePath(path),positions=[],tangents=[],offsets=[],weights=[],caps=[],indices=[];
 const vertex=(s,x,y,cap)=>{const id=positions.length/3;positions.push(...s.p);tangents.push(...s.tangent);offsets.push(x,y);weights.push(s.weight??1);caps.push(cap);return id;};
 for(const s of samples){vertex(s,-1,0,0);vertex(s,1,0,0);}
 for(let i=1;i<samples.length;i++){const a=(i-1)*2,b=i*2;indices.push(a,a+1,b,a+1,b+1,b);}
 if(!path.closed)for(const [s,sign]of[[samples[0],-1],[samples.at(-1),1]]){const center=vertex(s,0,0,1),arc=[];for(let i=0;i<=10;i++){const angle=-Math.PI/2+i*Math.PI/10;arc.push(vertex(s,Math.sin(angle),sign*Math.cos(angle),1));}for(let i=1;i<arc.length;i++)indices.push(center,arc[i-1],arc[i]);}
 const geometry=new T.BufferGeometry();for(const[name,array,size]of[['position',positions,3],['tangent',tangents,3],['offset',offsets,2],['weight',weights,1],['cap',caps,1]])geometry.setAttribute(name,new T.Float32BufferAttribute(array,size));geometry.setIndex(indices);geometry.computeBoundingSphere();geometry.userData.samples=samples.length;return geometry;
}
export function makeContinuousInk(root,paths){
 const layers=new Map();let samples=0;
 for(const path of paths){const geometry=ribbonGeometry(path);samples+=geometry.userData.samples;const material=new T.ShaderMaterial({uniforms:{inkColor:{value:new T.Color('#20231f')},resolution:{value:new T.Vector2(1,1)},linewidth:{value:path.width}},vertexShader,fragmentShader,depthTest:true,depthWrite:false,transparent:false,alphaToCoverage:true,side:T.DoubleSide});const line=new T.Mesh(geometry,material);line.name='cubic-'+path.id;line.userData.inkPath=true;line.frustumCulled=false;line.renderOrder=3;root.add(line);layers.set('cubic-'+path.id,{line});}
 return{layers,audit:{curvePaths:paths.length,curveSamples:samples,curveUploads:paths.length,curveAuthoring:'cubic shared tangent',curveJoins:'shared vertex ribbon; caps at whole-path ends only'},resize(w,h){for(const{line}of layers.values())line.material.uniforms.resolution.value.set(w,h);},dispose(){for(const{line}of layers.values()){root.remove(line);line.geometry.dispose();line.material.dispose();}layers.clear();}};
}
