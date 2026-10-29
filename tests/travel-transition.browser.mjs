// Real built-app travel, with a paused browser clock for repeatable paper/ink frames.
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright-core');
const port = Number(process.env.TRAVEL_QA_PORT || 43219);
const output = process.env.TRAVEL_EVIDENCE_DIR || await mkdtemp(path.join(tmpdir(), 'digitalmemory-travel-'));
await mkdir(output, { recursive: true });
const goals = JSON.parse(await readFile('scenes/xinhua-sanli-outline/scene-data.json')).landmarks;
const evidence = { checks: [], errors: [], frames: [], renderer: null };
const server = spawn(process.execPath, ['scripts/serve.mjs', '--dist'], { env: { ...process.env, PORT: String(port) }, stdio: ['ignore', 'pipe', 'pipe'] });
let browser;
try {
  await Promise.race([once(server.stdout, 'data'), once(server, 'exit').then(() => { throw Error('Server stopped'); })]);
  browser = process.env.CHROMIUM_CDP_URL ? await chromium.connectOverCDP(process.env.CHROMIUM_CDP_URL)
    : await chromium.launch({ executablePath: process.env.CHROMIUM_EXECUTABLE || '/usr/bin/google-chrome', headless: true,
      args: ['--no-sandbox', '--disable-dev-shm-usage', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: 'reduce' });
  const page = await context.newPage();
  const observe = p => {
    p.on('pageerror', e => evidence.errors.push(e.message));
    p.on('console', m => { if (m.type() === 'error') evidence.errors.push(m.text()); });
    p.on('response', r => { if (r.status() >= 400) evidence.errors.push(`${r.status()} ${r.url()}`); });
  };
  observe(page);
  const inspect = p => p.evaluate(() => digitalMemory.inspect());
  const load = async p => { await p.goto(`http://127.0.0.1:${port}`); await p.waitForFunction(() => globalThis.__VISUAL_READY__); };
  const picker = async p => { await p.getByRole('button', { name: '打开菜单', exact: true }).click(); await p.locator('#find-button').click(); await p.locator('.destination-group').first().waitFor(); };
  const choose = async (p, id) => { await picker(p); await p.locator('#destination-search').fill(goals[id].label); await p.locator(`[data-travel-go="${id}"]`).click(); };
  const landed = p => p.waitForFunction(() => !digitalMemory.inspect().entryTransition && digitalMemory.inspect().session.view === 'street');
  const freeze = async p => {
    const time = new Date('2026-10-29T12:00:00Z');
    await p.clock.install({ time }); await p.clock.pauseAt(new Date(+time + 1000));
  };
  const advance = async (p, ms) => { await p.clock.runFor(ms); await p.evaluate(() => new Promise(resolve => queueMicrotask(resolve))); };
  const capture = async (p, name) => {
    const state = await inspect(p);
    evidence.frames.push({ name, viewport: p.viewportSize(), dpr: await p.evaluate(() => devicePixelRatio), transition: state.entryTransition, position: state.session.outline?.position });
    await p.screenshot({ path: path.join(output, name + '.png') });
  };
  const assertAt = async (p, id) => {
    const state = (await inspect(p)).session.outline;
    assert(Math.hypot(...state.position.map((v, i) => v - goals[id].position[i])) <= 3, id);
    assert.deepEqual(state.path, []); assert.equal(state.destination, null);
    return state;
  };

  await load(page); await choose(page, 'yunbai'); await landed(page);
  const origin = (await inspect(page)).session, host = await page.locator('.outline-host').elementHandle();
  evidence.renderer = await page.locator('.outline-host canvas#scene').evaluate(c => {
    const gl = c.getContext('webgl2'), info = gl.getExtension('WEBGL_debug_renderer_info');
    return { version: gl.getParameter(gl.VERSION), renderer: info && gl.getParameter(info.UNMASKED_RENDERER_WEBGL) };
  });
  assert(evidence.renderer.version.includes('WebGL 2'));
  await page.emulateMedia({ reducedMotion: 'no-preference' }); await freeze(page);
  await choose(page, 'eastEnd'); await advance(page, 300); await capture(page, 'travel-desktop-approach');
  assert.equal((await inspect(page)).entryTransition.presentation, 'paper-plane');
  assert.deepEqual((await inspect(page)).session.outline.position, origin.outline.position);
  await advance(page, 380); await capture(page, 'travel-desktop-covered');
  assert.equal((await inspect(page)).entryTransition.phase, 'covered');
  const cover = await page.locator('.travel-paper').evaluate(el => ({ clip: getComputedStyle(el).clipPath, color: getComputedStyle(el).backgroundColor, opacity: getComputedStyle(el.parentElement).opacity }));
  assert.equal(cover.clip, 'none'); assert.equal(cover.opacity, '1'); assert.equal(cover.color, 'rgb(250, 247, 237)');
  const arrival = await assertAt(page, 'eastEnd');
  assert.equal(arrival.distanceWalked, origin.outline.distanceWalked);
  for (const key of ['yaw', 'pitch', 'distance']) assert.equal(arrival[key], origin.outline[key]);
  assert.equal((await inspect(page)).session.periodId, origin.periodId);
  await advance(page, 440); await capture(page, 'travel-desktop-reveal');
  assert.equal((await inspect(page)).entryTransition.phase, 'reveal');
  await advance(page, 600); assert.equal((await inspect(page)).entryTransition, null);
  assert(await host.evaluate(el => el === document.querySelector('.outline-host')));
  assert.equal(await page.locator('.memory-travel').count(), 0);
  await capture(page, 'travel-desktop-arrived');
  evidence.checks.push('Desktop passage, fully opaque landing seam, same WebGL owner, camera/period and empty path retained.');

  await choose(page, 'yunbai'); await advance(page, 220); await page.keyboard.press('Escape');
  assert.deepEqual((await inspect(page)).session.outline.position, arrival.position);
  await advance(page, 2000); assert.equal((await inspect(page)).entryTransition, null);
  assert.equal(await page.locator('.memory-travel').count(), 0);
  await choose(page, 'yunbai'); await advance(page, 680); await assertAt(page, 'yunbai');
  await page.locator('.travel-cancel').click(); await advance(page, 1000); await assertAt(page, 'yunbai');
  assert.equal((await inspect(page)).stage.entryProgress, '');
  evidence.checks.push('Escape before landing leaves origin; cancel after commit retains valid arrival and removes camera override/late callbacks.');

  await choose(page, 'eastEnd'); await advance(page, 180);
  await page.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, value: true }); document.dispatchEvent(new Event('visibilitychange')); delete document.hidden; document.dispatchEvent(new Event('visibilitychange')); });
  await advance(page, 2000); await assertAt(page, 'yunbai');
  assert.equal((await inspect(page)).entryTransition, null);
  evidence.checks.push('Visibility cancellation preserves the pre-commit origin.');

  await picker(page); await page.locator('[data-travel-mode="jump"]').click();
  await page.getByRole('button', { name: '关闭地点选择', exact: true }).click();
  const walking = (await inspect(page)).session.outline;
  await page.locator('.outline-host canvas#scene').focus(); await page.keyboard.down('ArrowUp'); await advance(page, 300); await page.keyboard.up('ArrowUp');
  assert((await inspect(page)).session.outline.distanceWalked > walking.distanceWalked);
  evidence.checks.push('Keyboard walking still works with ground-click direct travel selected.');
  await page.clock.resume(); await context.close();

  const phone = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, reducedMotion: 'reduce' });
  const mobile = await phone.newPage(); observe(mobile); await load(mobile); await choose(mobile, 'yunbai'); await landed(mobile);
  await mobile.emulateMedia({ reducedMotion: 'no-preference' }); await freeze(mobile);
  await choose(mobile, 'eastEnd'); await advance(mobile, 300); await capture(mobile, 'travel-phone-approach');
  await advance(mobile, 380); await capture(mobile, 'travel-phone-covered');
  const bounds = await mobile.locator('.travel-name').boundingBox(), cancel = await mobile.locator('.travel-cancel').boundingBox();
  assert(bounds.x >= 0 && bounds.x + bounds.width <= 390 && bounds.y + bounds.height < cancel.y);
  assert(cancel.height >= 44 && cancel.x >= 0 && cancel.y + cancel.height <= 844);
  const pixels = await mobile.locator('.memory-travel canvas').evaluate(c => [c.width, c.height]);
  assert.deepEqual(pixels, [780, 1688]);
  await mobile.setViewportSize({ width: 844, height: 390 }); await advance(mobile, 16);
  await capture(mobile, 'travel-phone-rotated');
  const rotated = await mobile.locator('.memory-travel canvas').evaluate(c => [c.width, c.height]);
  assert.deepEqual(rotated, [1688, 780]);
  await advance(mobile, 1200); await assertAt(mobile, 'eastEnd');
  await mobile.setViewportSize({ width: 390, height: 844 });
  await choose(mobile, 'yunbai'); await advance(mobile, 200); await mobile.locator('.travel-cancel').tap();
  await advance(mobile, 2000); await assertAt(mobile, 'eastEnd');
  assert.equal(await mobile.locator('.memory-travel').count(), 0);
  evidence.checks.push('390×844 touch/DPR 2, portrait→landscape redraw, destination label/cancel fit, touch cancellation.');
  await mobile.emulateMedia({ reducedMotion: 'reduce' }); await choose(mobile, 'yunbai');
  await advance(mobile, 48); const reduced = (await inspect(mobile)).entryTransition;
  assert.equal(reduced.reduced, true); assert.equal(await mobile.locator('.memory-travel canvas').isVisible(), false);
  assert.equal(await mobile.locator('.travel-paper').evaluate(el => getComputedStyle(el).clipPath), 'none');
  await capture(mobile, 'travel-phone-reduced'); await advance(mobile, 250);
  assert.equal((await inspect(mobile)).entryTransition, null); await assertAt(mobile, 'yunbai');
  evidence.checks.push('Reduced motion uses only a 90/1/90 ms fade, without plane, wipe or camera flight.');
  await mobile.clock.resume(); await phone.close();

  const slow = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const delayed = await slow.newPage(); observe(delayed);
  let release; const gate = new Promise(resolve => { release = resolve; });
  await delayed.route('**/scenes/xinhua-sanli-outline/runtime.mjs', async route => { await gate; await route.continue(); });
  await load(delayed); await freeze(delayed); await choose(delayed, 'yunbai'); await advance(delayed, 2200);
  assert.equal((await inspect(delayed)).entryTransition.phase, 'covered');
  assert.equal((await inspect(delayed)).session.view, 'map');
  await capture(delayed, 'travel-delayed-covered'); await delayed.locator('.travel-cancel').click();
  release(); await delayed.clock.resume(); await delayed.waitForTimeout(500);
  assert.equal((await inspect(delayed)).entryTransition, null); assert.equal((await inspect(delayed)).session.view, 'map');
  await choose(delayed, 'yunbai'); await landed(delayed); await assertAt(delayed, 'yunbai');
  evidence.checks.push('Slow first scene holds completed paper; cancellation ignores late load and a subsequent request succeeds.');
  await slow.close();
  assert.deepEqual(evidence.errors, []);
  console.log(JSON.stringify({ checks: evidence.checks, errors: evidence.errors, output }, null, 2));
} finally {
  await writeFile(path.join(output, 'travel-results.json'), JSON.stringify(evidence, null, 2));
  await browser?.close(); server.kill();
}
