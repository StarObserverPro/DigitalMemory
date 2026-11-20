import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { posix } from 'node:path';

const owners = new Set(['README.md', 'docs/README.md', ...['ARCHITECTURE','DATA_MODEL','CONTENT_PIPELINE','RUNTIME','DECISIONS','STATUS','PRIVATE_CONTENT_RUNBOOK'].map(name => `docs/${name}.md`)]);
function anchors(text) {
  const result = new Set([...text.matchAll(/<(?:a|span)\b[^>]*\bid=["']([^"']+)["']/g)].map(match => match[1]));
  const counts = new Map();
  for (const match of text.matchAll(/^#{1,6}\s+(.+)$/gm)) {
    const raw = match[1].replace(/<[^>]+>/g, '').replace(/\s+#+$/, '').toLowerCase().trim();
    const slug = raw.replace(/[^\p{L}\p{N}\p{M}_\- ]/gu, '').replace(/ /g, '-');
    const count = counts.get(slug) || 0; counts.set(slug, count + 1);
    result.add(count ? `${slug}-${count}` : slug);
  }
  return result;
}

test('core documentation outgoing paths and inbound owner anchors remain connected', async () => {
  const tracked = new Set(execFileSync('git', ['ls-files', '-z'], { encoding: 'utf8' }).split('\0').filter(Boolean));
  const markdown = [...tracked].filter(path => path.endsWith('.md'));
  const texts = new Map(await Promise.all(markdown.map(async path => [path, await readFile(path, 'utf8')])));
  const errors = []; let checked = 0;
  for (const [source, text] of texts) {
    for (const match of text.matchAll(/\[[^\]]*\]\(([^)\s]+)\)/g)) {
      const href = match[1]; if (/^(?:[a-z]+:|\/\/)/i.test(href)) continue;
      const [rawPath, rawAnchor] = href.split('#');
      const target = rawPath ? posix.normalize(posix.join(posix.dirname(source), decodeURIComponent(rawPath))) : source;
      if (!owners.has(source) && !owners.has(target)) continue;
      checked++;
      if (!tracked.has(target)) { errors.push(`${source}: missing ${target}`); continue; }
      if (rawAnchor && texts.has(target) && !anchors(texts.get(target)).has(decodeURIComponent(rawAnchor))) errors.push(`${source}: missing anchor ${target}#${rawAnchor}`);
    }
  }
  assert(checked > 50, 'Core link check must inspect the actual repository');
  assert.deepEqual(errors, [], errors.join('\n'));
});
