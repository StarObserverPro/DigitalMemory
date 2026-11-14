import { execFileSync } from 'node:child_process';
import { readFile, lstat, mkdir, cp } from 'node:fs/promises';
import { dirname, join } from 'node:path';

/** A tracked-path allowlist, not a substitute for reviewing public commits. */
export function isPublicBuildPath(path) {
  if (path.includes('\\') || path.split('/').some(part => !part || part === '..' || part.startsWith('.'))) return false;
  if (/(^|\/)(private|local-archive|raw-inputs|operations|server|tests|evidence|candidates)(\/|$)/i.test(path)) return false;
  if (/\.(test|browser)\.[cm]?js$/.test(path)) return false;
  if (path === 'index.html') return true;
  if (/^src\//.test(path)) return /\.(js|css)$/.test(path);
  if (/^content\/(public|reference)\//.test(path)) return /\.(json|geojson|md)$/.test(path);
  // Asset authoring metadata is not a runtime dependency; only manifests ship as JSON.
  if (/^assets\//.test(path) && /\.(json|geojson|xml)$/.test(path)) return /\/manifest\.json$/.test(path);
  if (/^(assets|scenes)\//.test(path)) return /\.(js|mjs|css|html|json|geojson|xml|png|webp|jpg|jpeg|svg|glb|woff|woff2|ttf|txt|md)$/.test(path) || /\/LICENSE$/.test(path);
  return false;
}
export async function exportPublicFiles(root, output, paths) {
  const tracked = paths ?? execFileSync('git', ['ls-files', '-z'], { cwd: root, encoding: 'utf8' }).split('\0').filter(Boolean);
  const selected = tracked.filter(isPublicBuildPath);
  if (!selected.includes('index.html')) throw Error('No tracked public entry point');
  // Validate before copying anything; forbid symlinks in every path component.
  for (const path of selected) {
    let current = root;
    for (const part of path.split('/')) { current = join(current, part); if ((await lstat(current)).isSymbolicLink()) throw Error('Public export rejects symlinks'); }
    if (/\.(json|geojson)$/.test(path)) {
      const record = JSON.parse(await readFile(join(root, path), 'utf8'));
      const inspect = value => {
        if (!value || typeof value !== 'object') return;
        if (Object.hasOwn(value, 'privacy') && value.privacy !== 'public') throw Error('Private data in public export');
        for (const [key, item] of Object.entries(value)) {
          if (/^(private_key|client_secret|refresh_token|access_token|driveFileId|driveFolderId|releaseFileId)$/i.test(key)) throw Error('Server configuration in public export');
          inspect(item);
        }
      };
      inspect(record);
    }
  }
  for (const path of selected) { const target = join(output, path); await mkdir(dirname(target), { recursive: true }); await cp(join(root, path), target); }
  return selected;
}
