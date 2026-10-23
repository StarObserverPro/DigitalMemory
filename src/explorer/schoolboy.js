import * as T from '../../assets/vendor/three/three.module.min.js';
import {GLTFLoader} from '../../assets/vendor/three/loaders/GLTFLoader.js';

// All parts use one real KayKit Rig_Medium skeleton. No procedural knees or animation retarget.
const base=new URL('../../assets/characters/schoolboy/',import.meta.url);
const files=Object.freeze({
  body:'body.glb',hair:'hair-short.glb',jacket:'jacket.glb',
  trousers:'trousers.glb',shoes:'shoes.glb',idle:'idle.glb',walk:'walk.glb',
});
export const SCHOOLBOY_VARIANTS=Object.freeze({
  red:Object.freeze({accent:'#ba3439',label:'junior red/white'}),
  blue:Object.freeze({accent:'#295da5',label:'high school blue/white'}),
});
export const SCHOOLBOY_SCALE=Object.freeze({height:1.4,headBoneScale:0.48});
const HIDDEN_BODY=new Set([
  'skin_torso','skin_armUpperL','skin_armUpperR','skin_armLowerL','skin_armLowerR',
  'skin_legUpperL','skin_legUpperR','skin_legLowerL','skin_legLowerR',
  'skin_footL','skin_footR',
]);
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));

// Use bind-pose coordinates for stripes; the pattern must not slide during a walk cycle.
function patternedMaterial(original,kind,accents) {
  const m=original.clone(),accent=new T.Color(SCHOOLBOY_VARIANTS.blue.accent);
  accents.push(accent);
  const white=new T.Color('#e9e9e2');
  m.color.set('#ffffff');m.roughness=.92;m.metalness=0;
  m.customProgramCacheKey=()=> 'dm-school-'+kind+'-r1';
  m.onBeforeCompile=shader=>{
    shader.uniforms.dmAccent={value:accent};
    shader.uniforms.dmWhite={value:white};
    shader.vertexShader=shader.vertexShader
      .replace('#include <common>','#include <common>\nvarying vec3 dmBindPos;')
      .replace('#include <begin_vertex>','#include <begin_vertex>\ndmBindPos = position;');
    const decoration=(kind==='jacket' ? [
      'float lateral = min(abs(dmBindPos.x)/0.35,1.0);',
      'float boundary = 0.95 + 0.19*lateral;',
      'float shoulder = step(0.42,abs(dmBindPos.x));',
      'float whitePanel = mix(smoothstep(boundary-0.018,boundary+0.018,dmBindPos.y),smoothstep(1.17,1.24,dmBindPos.y),shoulder);',
      'float seam=(1.0-shoulder)*(1.0-smoothstep(0.015,0.026,abs(dmBindPos.y-boundary+0.035)));',
      'diffuseColor.rgb=mix(dmAccent,dmWhite,max(whitePanel,seam));'
    ] : [
      'float outer=smoothstep(0.28,0.315,abs(dmBindPos.x));',
      'float inner=1.0-smoothstep(0.345,0.365,abs(dmBindPos.x));',
      'diffuseColor.rgb=mix(dmAccent,dmWhite,outer*inner);'
    ]).join('\n');
    shader.fragmentShader=shader.fragmentShader
      .replace('#include <common>','#include <common>\nvarying vec3 dmBindPos;\nuniform vec3 dmAccent;\nuniform vec3 dmWhite;')
      .replace('#include <color_fragment>','#include <color_fragment>\n'+decoration);
  };
  return m;
}
function simpleMaterial(original) {
  const m=original.clone();
  const palette={
    hair:'#2b2825',skin:'#e1bc9c',eyes:'#282724',eyeshine:'#fdfcf7',
    mouth:'#9c6762',linen:'#e7e7df',boots:'#eae7dc',belt:'#295da5'
  };
  if(palette[m.name])m.color.set(palette[m.name]);
  m.roughness=.9;m.metalness=0;
  return m;
}
function namedAnimation(g,name) {
  const clip=g.animations.find(a=>a.name===name);
  if(!clip)throw Error('Missing schoolboy animation: '+name);
  const c=clip.clone();
  // World-space locomotion belongs to the session's registered route, not the animation file.
  c.tracks=c.tracks.filter(t=>!/^root\.(position|quaternion|scale)$/.test(t.name));
  return c;
}
/** Create one male student from genuine rigged GLB meshes + original idle and walk cycles. */
export async function loadSchoolboy() {
  const loader=new GLTFLoader();
  const load=id=>loader.loadAsync(new URL(files[id],base).href);
  const [body,hair,jacket,trousers,shoes,idles,walkers]=await Promise.all(
    ['body','hair','jacket','trousers','shoes','idle','walk'].map(load));
  const model=body.scene,bones=new Map(),resources=new Set(),accents=[];
  const own=v=>(resources.add(v),v);
  model.traverse(o=>{
    if(o.isBone)bones.set(o.name,o);
    if(o.isSkinnedMesh) {
      if(HIDDEN_BODY.has(o.name))o.visible=false;
      o.material=own(simpleMaterial(o.material));
      o.frustumCulled=false;o.castShadow=true;o.receiveShadow=true;
      own(o.geometry);
    }
  });
  for(const id of ['head','hips','footl','footr'])
    if(!bones.has(id))throw Error('Student skeleton missing bone '+id);
  for(const [slot,g] of [['hair',hair],['jacket',jacket],['trousers',trousers],['shoes',shoes]]) {
    let n=0;
    g.scene.traverse(o=>{
      if(!o.isSkinnedMesh || (slot==='trousers'&&o.name==='belt'))return;
      const linked=o.skeleton.bones.map(b=>{
        const match=bones.get(b.name);
        if(!match)throw Error('Unmatched '+slot+' bone '+b.name);
        return match;
      });
      const paint=o.material.name==='shirt' ? patternedMaterial(o.material,'jacket',accents)
        : o.material.name==='trousers' ? patternedMaterial(o.material,'trousers',accents)
        : simpleMaterial(o.material);
      const mesh=new T.SkinnedMesh(o.geometry,own(paint));
      mesh.name='school-'+slot+'-'+o.name;
      mesh.bind(new T.Skeleton(linked,o.skeleton.boneInverses),o.bindMatrix);
      mesh.frustumCulled=false;mesh.castShadow=true;mesh.receiveShadow=true;
      model.add(mesh);own(o.geometry);n++;
    });
    if(!n)throw Error('Rigged '+slot+' mesh is missing');
  }
  const head=bones.get('head');
  // Rescale the donor's large head ON THE BONE: face and short hair remain aligned.
  head.scale.setScalar(SCHOOLBOY_SCALE.headBoneScale);
  model.updateMatrixWorld(true);
  const bounds=new T.Box3().setFromObject(model);
  const h=bounds.max.y-bounds.min.y;
  if(!Number.isFinite(h)||h<1)throw Error('Invalid character bounds');
  const fit=SCHOOLBOY_SCALE.height/h;
  model.scale.setScalar(fit);model.position.y=-bounds.min.y*fit;
  const root=new T.Group();root.name='male-y2k-student';root.add(model);
  // Donor meshes face +Z (their eyes sit on the +Z face); street heading expects -Z.
  root.rotation.y=Math.PI;
  const mixer=new T.AnimationMixer(model);
  const idle=mixer.clipAction(namedAnimation(idles,'Idle_A'));
  const walk=mixer.clipAction(namedAnimation(walkers,'Walking_A'));
  idle.play();walk.play();
  let variant=null;
  const setVariant=id=>{
    if(!(id in SCHOOLBOY_VARIANTS))throw Error('Unknown school uniform: '+id);
    if(variant===id)return;
    variant=id;
    for(const accent of accents)accent.set(SCHOOLBOY_VARIANTS[id].accent);
  };
  setVariant('blue');
  return {
    root,source:'modular-glb-walk-r1',get variant(){return variant;},setVariant,
    update(dt,amount,stepDistance=0) {
      const v=clamp(amount,0,1);
      idle.setEffectiveWeight(1-v);
      walk.setEffectiveWeight(v);
      walk.timeScale=clamp((dt>0?stepDistance/dt:0)/0.72,0.8,1.45);
      mixer.update(clamp(dt,0,0.06));
      // The original clip keys head.scale, too: maintain the edited head-to-body ratio.
      head.scale.setScalar(SCHOOLBOY_SCALE.headBoneScale);
    },
    dispose() {
      mixer.stopAllAction();
      for(const value of resources)value.dispose?.();
    }
  };
}
