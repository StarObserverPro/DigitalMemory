import {createOverviewAssembly} from '../src/explorer/layered-overview.js';
import {createComposition} from '../src/domain/composition.js';
import {createIllustrationMapping} from '../src/domain/illustration.js';
import {createTransform} from '../src/domain/spatial.js';
import { cp, mkdir, rm, readFile, access } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const manifest = JSON.parse(await readFile('content/public/manifest.json'));
for (const asset of [...manifest.assets, ...Object.values(manifest.stageAssets || {}), ...Object.values(manifest.moduleAssets || {})]) {
  const bytes = await readFile(new URL(asset.url, new URL('../content/public/manifest.json', import.meta.url)));
  if (createHash('sha256').update(bytes).digest('hex') !== asset.sha256) throw new Error(`Checksum mismatch: ${asset.id}`);
}
for (const file of [manifest.context, manifest.places, manifest.overviewRegistration, manifest.illustrationMapping, manifest.composition, manifest.outlineScene, ...manifest.memoryChunks.map(c => c.path), ...Object.values(manifest.scenes)]) {
  const record = JSON.parse(await readFile(`content/public/${file}`));
  if (record.privacy !== 'public') throw new Error('Private data in public manifest');
}
const sceneManifest=JSON.parse(await readFile('scenes/xinhua-sanli-outline/manifest.json'));
for(const [file,hash] of Object.entries(sceneManifest.files))if(createHash('sha256').update(await readFile('scenes/xinhua-sanli-outline/'+file)).digest('hex')!==hash)throw Error('Selected scene checksum mismatch: '+file);
const geometry=JSON.parse(await readFile('content/public/'+manifest.geometry));
createComposition(JSON.parse(await readFile('content/public/'+manifest.composition)),createIllustrationMapping(JSON.parse(await readFile('content/public/'+manifest.illustrationMapping)),createTransform(geometry.bounds)));
createOverviewAssembly(JSON.parse(await readFile('content/public/'+manifest.composition)),JSON.parse(await readFile('content/public/'+manifest.context)),JSON.parse(await readFile('content/public/'+manifest.overviewRegistration)),createTransform(geometry.bounds),manifest.moduleAssets);
await rm('dist', { recursive: true, force: true });
await mkdir('dist');
for (const file of ['index.html', 'src', 'assets', 'content','scenes']) await cp(file, `dist/${file}`, { recursive: true });
const registration=JSON.parse(await readFile('content/public/'+manifest.outlineScene));
const outline=await readFile(new URL(registration.data,new URL('../content/public/',import.meta.url)));
if(createHash('sha256').update(outline).digest('hex')!==registration.sha256)throw Error('Outline checksum mismatch');
await access('dist/src/explorer/main.js');
console.log('Built static application. Manifest checksums and public records verified.');
