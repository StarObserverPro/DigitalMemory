import test from 'node:test';import assert from 'node:assert/strict';
import {avatarContour} from './avatar.mjs';import {inkExtension} from './motion.mjs';
import {ShapeUtils,Vector2} from '../xinhua-junction-outline/vendor/three/build/three.module.js';
const cross=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
test('Walking perimeter stays simple and its fixed fill triangles do not invert',()=>{
 const rest=avatarContour(),triangles=ShapeUtils.triangulateShape(rest.map(p=>new Vector2(...p)),[]);
 for(let step=0;step<128;step++)for(const amount of [0,.5,1]){
  const p=avatarContour(step/128*Math.PI*2/2.8,amount);assert.equal(p.length,rest.length);
  assert.ok(p.flat().every(Number.isFinite));assert.ok(Math.min(...p.map(v=>v[1]))>=.079);
  for(let i=0;i<p.length;i++)for(let j=i+2;j<p.length;j++){
   if(i===0&&j===p.length-1)continue;const a=p[i],b=p[(i+1)%p.length],c=p[j],d=p[(j+1)%p.length];
   assert.ok(!(cross(a,b,c)*cross(a,b,d)<-1e-10&&cross(c,d,a)*cross(c,d,b)<-1e-10),'perimeter crossed');
  }
  for(const [a,b,c] of triangles)assert.ok(cross(p[a],p[b],p[c])*cross(rest[a],rest[b],rest[c])>=-1e-9,'fill triangle inverted');
 }
});
test('Feet alternate contact, then return exactly to the stable original stance',()=>{
 const a=avatarContour(Math.PI/2/2.8,1),b=avatarContour(Math.PI*1.5/2.8,1),rest=avatarContour();
 assert.ok(a[7][1]>a[9][1]+.1);assert.ok(b[9][1]>b[7][1]+.1);
 assert.deepEqual(avatarContour(123,0),rest);assert.ok(Math.max(...rest.map(p=>p[1]))<2.27);
});
test('Accent strokes extend, hold, retract to zero, with no rebound at expiry',()=>{
 assert.equal(inkExtension(0),0);assert.equal(inkExtension(1.5),1);assert.equal(inkExtension(5.8),0);assert.equal(inkExtension(6),0);
 assert.ok(inkExtension(.45)<.4,'extension is deliberately slower than the previous revision');
 let previous=0;for(let t=0;t<=1.15;t+=.01){const n=inkExtension(t);assert.ok(n>=previous);previous=n;}
 previous=1;for(let t=4.3;t<5.9;t+=.01){const n=inkExtension(t);assert.ok(n<=previous+1e-12);previous=n;}
});
