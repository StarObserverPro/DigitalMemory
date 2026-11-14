import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { isPublicBuildPath, exportPublicFiles } from '../scripts/public-export.mjs';

test('asset authoring JSON is not published; runtime manifests remain strictly public', async () => {
  for (const name of ['generation.json', 'provenance.json', 'plan.json', 'source.geojson']) assert.equal(isPublicBuildPath(`assets/fixture/${name}`), false);
  assert.equal(isPublicBuildPath('assets/fixture/manifest.json'), true);
  const root = await mkdtemp(join(tmpdir(), 'dm-assets-'));
  try {
    await mkdir(join(root, 'assets/fixture'), { recursive: true });
    await writeFile(join(root, 'index.html'), 'synthetic entry');
    await writeFile(join(root, 'assets/fixture/provenance.json'), JSON.stringify({ privacy: 'synthetic authoring note, not an access class' }));
    await writeFile(join(root, 'assets/fixture/manifest.json'), JSON.stringify({ privacy: 'public' }));
    const paths = ['index.html', 'assets/fixture/provenance.json', 'assets/fixture/manifest.json'];
    assert.deepEqual(await exportPublicFiles(root, join(root, 'dist'), paths), ['index.html', 'assets/fixture/manifest.json']);
    await assert.rejects(() => readFile(join(root, 'dist/assets/fixture/provenance.json')));
    await writeFile(join(root, 'assets/fixture/manifest.json'), JSON.stringify({ privacy: 'private' }));
    await assert.rejects(() => exportPublicFiles(root, join(root, 'blocked'), paths), /Private data/);
  } finally { await rm(root, { recursive: true, force: true }); }
});
