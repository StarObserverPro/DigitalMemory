import { cp, mkdir, rm, readFile, access } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const manifest = JSON.parse(await readFile('content/public/manifest.json'));
for (const asset of manifest.assets) {
  const bytes = await readFile(new URL(asset.url, new URL('../content/public/manifest.json', import.meta.url)));
  if (createHash('sha256').update(bytes).digest('hex') !== asset.sha256) throw new Error(`Checksum mismatch: ${asset.id}`);
}
for (const file of [manifest.places, ...manifest.memoryChunks.map(c => c.path), ...Object.values(manifest.scenes)]) {
  const record = JSON.parse(await readFile(`content/public/${file}`));
  if (record.privacy !== 'public') throw new Error('Private data in public manifest');
}
await rm('dist', { recursive: true, force: true });
await mkdir('dist');
for (const file of ['index.html', 'src', 'assets', 'content']) await cp(file, `dist/${file}`, { recursive: true });
await access('dist/src/explorer/main.js');
console.log('Built static application. Manifest checksums and public records verified.');
