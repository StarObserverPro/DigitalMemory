import * as T from '../xinhua-junction-outline/vendor/three/build/three.module.js';
import {lampLayout} from './lamp-layout.mjs';
import {makeFixture} from './lamp-fixture.mjs';
export function makeUnderpassLamps(data,built){const fixtures=lampLayout(data,built).map(makeFixture),paths=fixtures.flatMap(f=>f.paths),fills=new T.Group();for(const f of fixtures)for(const mesh of f.meshes)fills.add(mesh);return{fixtures,paths,fills,audit:{fixtures:fixtures.length,rayGroups:fixtures.filter(f=>f.rayMark).length,style:'plain rectangular head and solid rounded Haring ray strokes',internalDetailPaths:0,postProcessing:false,backClearanceM:.012,placementEvidence:'illustrative placement; exact count and spacing unknown'}};}
