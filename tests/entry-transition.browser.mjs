// Real built-app entry checks. Review captures go outside the checkout.
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright-core');
const port = Number(process.env.ENTRY_QA_PORT || 43218);
const evidenceDir = process.env.ENTRY_EVIDENCE_DIR || await mkdtemp(path.join(tmpdir(), 'digitalmemory-entry-'));
await mkdir(evidenceDir, { recursive: true });
const server = spawn(process.execPath, ['scripts/serve.mjs', '--dist'], { env: { ...process.env, PORT: String(port) }, stdio: ['ignore', 'pipe', 'pipe'] });
const evidence = { checks: [], errors: [], viewports: [] };
let browser;
try {
  await Promise.race([once(server.stdout, 'data'), once(server, 'exit').then(() => { throw Error('Server stopped'); })]);
  browser = await chromium.launch({ executablePath: process.env.CHROMIUM_EXECUTABLE || '/usr/bin/google-chrome', headless: true,
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: 'no-preference' });
  const page = await context.newPage();
  page.on('pageerror', error => evidence.errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') evidence.errors.push(message.text()); });
  const url = `http://127.0.0.1:${port}`;
  const load = async p => { await p.goto(url); await p.waitForFunction(() => !!globalThis.digitalMemory); };
  const state = () => page.evaluate(() => digitalMemory.inspect());
  const menu = () => page.getByRole('button', { name: '打开菜单', exact: true }).click();
  const begin = async () => { await menu(); await page.locator('#street-entry').click(); };
  const landed = () => page.waitForFunction(() => { const s = digitalMemory.inspect(); return !s.entryTransition && s.session.view === 'street' && s.stage?.entryProgress === ''; }, null, { timeout: 30000 });
  const leave = async () => { await menu(); await page.locator('#leave-street').click(); };
  const simple = async checked => {
    await menu(); await page.locator('#options-button').click(); await page.locator('#simple-entry').setChecked(checked);
    await page.getByRole('button', { name: '关闭选项', exact: true }).click();
  };
  const shot = name => page.screenshot({ path: path.join(evidenceDir, name + '.png') });
  const stamp = async name => { evidence[name] = await state(); };
  await load(page);
  const origin = (await state()).session;
  await begin();
  await page.waitForFunction(() => { const s = digitalMemory.inspect(); return s.stage && s.entryTransition?.phase === 'drawing'; });
  await page.keyboard.press('Escape');
  await page.waitForFunction(() => !digitalMemory.inspect().entryTransition);
  assert.equal((await state()).session.view, 'map');
  assert.equal(JSON.parse((await state()).stage.frameLoop).paused, true);
  assert.equal(await page.locator('.outline-host').isVisible(), false);
  assert(await page.locator('#menu-button').evaluate(el => el === document.activeElement));
  evidence.checks.push('Cancelling the first drawing after scene mount suspends the fresh renderer and restores map keyboard focus.');
  await begin();
  await page.waitForFunction(() => digitalMemory.inspect().entryTransition?.beat === 'drawing' && digitalMemory.inspect().entryTransition.elapsedMs > 1900);
  await shot('journal-box-desktop');
  const cadence = await page.evaluate(() => new Promise(resolve => {
    const samples = [], start = performance.now();
    function sample() {
      const entry = digitalMemory.inspect().entryTransition;
      samples.push({ frame: entry.frame, time: entry.elapsedMs });
      if (performance.now() - start < 500) requestAnimationFrame(sample); else resolve(samples);
    }
    requestAnimationFrame(sample);
  }));
  assert(new Set(cadence.map(s => s.frame)).size > 8, 'continuous canvas updates must exceed the old 8 fps gate');
  assert(cadence.some(s => Math.abs(s.time % 125) > 1), 'elapsed motion time must not be quantized');
  evidence.motionCadence = cadence;
  await page.waitForFunction(() => digitalMemory.inspect().entryTransition?.beat === 'writing' && digitalMemory.inspect().entryTransition.elapsedMs > 7000);
  const during = await state();
  await page.keyboard.down('w'); await page.waitForTimeout(160); await page.keyboard.up('w');
  assert.deepEqual((await state()).session.outline.position, during.session.outline.position, 'entry must block walking');
  await shot('journal-writing-desktop');
  const firstJournal = during.entryTransition.journal;
  await page.waitForFunction(() => digitalMemory.inspect().entryTransition?.beat === 'reading');
  const reading = (await state()).entryTransition;
  assert(reading.durationMs - reading.elapsedMs > 1700, 'the completed page must have time to read');
  await page.waitForTimeout(1000);
  assert.equal((await state()).entryTransition.beat, 'reading');
  await shot('journal-reading-desktop');
  evidence.readingHold = reading;
  await landed(); await stamp('journalLanding'); await shot('street-desktop');
  assert.deepEqual((await state()).session.camera, origin.camera);
  assert.deepEqual((await state()).session.route, origin.route);
  assert.equal(await page.locator('.street-transition').count(), 0);
  evidence.checks.push('Desktop journal: paired lower-right doodle, upper-left writing, blocked walking, fade and usable street.');

  // Actual pointer orbit, then return/re-entry must preserve the new camera.
  const canvas = page.locator('.outline-host canvas#scene');
  const bounds = await canvas.boundingBox();
  await page.mouse.move(bounds.width * .5, bounds.height * .5); await page.mouse.down();
  await page.mouse.move(bounds.width * .5 + 50, bounds.height * .5); await page.mouse.up();
  await page.waitForTimeout(100);
  const pose = (await state()).session.outline;
  const owner = await page.locator('.outline-host').elementHandle();
  await leave();
  await simple(true);
  assert.equal((await state()).session.entryTransition, 'simple');
  await begin();
  await page.waitForFunction(() => digitalMemory.inspect().entryTransition?.phase === 'revealing');
  await page.waitForTimeout(180); await shot('simple-overhead'); await stamp('overhead');
  assert(Number((await state()).stage.entryProgress) < .2);
  await page.waitForTimeout(700); await shot('simple-cloud');
  await landed();
  const afterSimple = (await state()).session.outline;
  for (const key of ['position', 'yaw', 'distance', 'pitch']) assert.deepEqual(afterSimple[key], pose[key], key);
  assert(await owner.evaluate(element => element === document.querySelector('.outline-host')));
  evidence.checks.push('Simple overhead/cloud/descent preserves position and saved camera and reuses one renderer.');

  await leave(); await page.reload(); await page.waitForFunction(() => !!globalThis.digitalMemory);
  assert.equal((await state()).session.entryTransition, 'simple');
  await menu(); await page.locator('#options-button').click(); assert(await page.locator('#simple-entry').isChecked());
  await page.locator('#simple-entry').uncheck(); await page.getByRole('button', { name: '关闭选项', exact: true }).click();
  evidence.checks.push('Menu switch persists through reload and can return to the default journal.');

  await page.setViewportSize({ width: 390, height: 844 });
  await begin();
  await page.waitForFunction(() => digitalMemory.inspect().entryTransition?.beat === 'pause');
  await shot('journal-box-phone');
  await page.waitForFunction(() => digitalMemory.inspect().entryTransition?.beat === 'writing' && digitalMemory.inspect().entryTransition.elapsedMs > 7000);
  await shot('journal-writing-phone');
  await page.setViewportSize({ width: 430, height: 844 });
  await landed(); await shot('street-phone');
  assert.equal(await page.locator('.outline-host').count(), 1);
  evidence.viewports.push('1280x800', '390x844', '430x844 resize during entry');
  evidence.checks.push('Narrow-screen journal and resize finish without a stale overlay or second renderer.');

  await leave(); await begin();
  await page.waitForFunction(() => digitalMemory.inspect().entryTransition?.phase === 'drawing');
  const secondJournal = (await state()).entryTransition.journal;
  await page.keyboard.press('Escape');
  await page.waitForFunction(() => !document.querySelector('.street-transition'));
  assert.equal((await state()).session.view, 'map');
  const stopped = Number((await state()).stage.frameSerial); await page.waitForTimeout(200);
  assert.equal(Number((await state()).stage.frameSerial), stopped);
  evidence.journalChoices = { firstJournal, secondJournal };
  evidence.checks.push('Escape during drawing leaves the map usable and stops the retained street loop.');

  await simple(true); await begin();
  await page.waitForFunction(() => digitalMemory.inspect().entryTransition?.phase === 'revealing');
  await page.keyboard.press('Escape');
  await page.waitForFunction(() => !digitalMemory.inspect().entryTransition);
  assert.equal((await state()).session.view, 'map'); assert.equal((await state()).stage.entryProgress, '');
  assert.equal(await page.locator('#street-stage').evaluate(el => el.style.opacity), '');
  evidence.checks.push('Escape during camera descent clears camera/opacity overrides and returns to the map.');

  await page.emulateMedia({ reducedMotion: 'reduce' });
  const reducedStart = Date.now(); await begin(); await landed();
  evidence.reducedMs = Date.now() - reducedStart;
  assert(evidence.reducedMs < 1800, 'reduced motion must not wait for the full sequence');
  assert.equal((await state()).stage.entryProgress, '');
  evidence.checks.push('Reduced motion uses a short fade with no drawn prelude or camera travel.');
  await leave();
  await page.emulateMedia({ reducedMotion: 'no-preference' }); await simple(false);
  await begin(); await page.goto('about:blank'); await page.goBack();
  await page.waitForFunction(() => !!globalThis.digitalMemory);
  assert.equal((await state()).session.view, 'map'); assert.equal(await page.locator('.street-transition').count(), 0);
  evidence.checks.push('Navigating away during entry and returning restores a usable map without an orphaned overlay.');

  // Delayed load: the drawing can finish while the renderer is still unavailable.
  const delayed = await context.newPage(); let release;
  const hold = new Promise(resolve => release = resolve);
  await delayed.route('**/xinhua-sanli-outline/scene-data.json', async route => { await hold; await route.continue().catch(() => {}); });
  await load(delayed); await delayed.getByRole('button', { name: '打开菜单', exact: true }).click(); await delayed.locator('#street-entry').click();
  await delayed.waitForFunction(() => digitalMemory.inspect().entryTransition?.phase === 'waiting');
  assert.equal(await delayed.evaluate(() => digitalMemory.inspect().session.view), 'map');
  await delayed.screenshot({ path: path.join(evidenceDir, 'slow-load-hold.png') });
  await delayed.locator('.transition-cancel').click(); release();
  await delayed.waitForTimeout(250);
  assert.equal(await delayed.locator('.street-transition').count(), 0);
  assert.equal(await delayed.evaluate(() => digitalMemory.inspect().session.view), 'map');
  await delayed.unrouteAll(); await delayed.emulateMedia({ reducedMotion: 'reduce' });
  await delayed.getByRole('button', { name: '打开菜单', exact: true }).click(); await delayed.locator('#street-entry').click();
  await delayed.waitForFunction(() => !digitalMemory.inspect().entryTransition && digitalMemory.inspect().session.view === 'street');
  await delayed.close();
  evidence.checks.push('Delayed load holds the drawing; cancellation ignores late completion and a subsequent entry succeeds.');

  const failed = await context.newPage();
  await failed.route('**/xinhua-sanli-outline/scene-data.json', route => route.fulfill({ status: 503, body: 'fixture unavailable' }));
  await load(failed); await failed.getByRole('button', { name: '打开菜单', exact: true }).click(); await failed.locator('#street-entry').click();
  await failed.waitForFunction(() => document.getElementById('status').textContent.includes('街景暂时打不开'));
  assert.equal(await failed.locator('.street-transition').count(), 0);
  assert.equal(await failed.evaluate(() => digitalMemory.inspect().session.view), 'map');
  await failed.unrouteAll(); await failed.emulateMedia({ reducedMotion: 'reduce' });
  await failed.getByRole('button', { name: '打开菜单', exact: true }).click(); await failed.locator('#street-entry').click();
  await failed.waitForFunction(() => !digitalMemory.inspect().entryTransition && digitalMemory.inspect().session.view === 'street');
  await failed.close();
  evidence.checks.push('Scene failure removes the animation; the original map remains usable and retry succeeds.');

  const missingArt = await context.newPage();
  await missingArt.route('**/assets/transitions/doodles-r1/*.png', route => route.fulfill({ status: 503, body: 'fixture unavailable' }));
  await load(missingArt);
  await missingArt.getByRole('button', { name: '打开菜单', exact: true }).click(); await missingArt.locator('#street-entry').click();
  await missingArt.waitForFunction(() => document.getElementById('status').textContent.includes('街景暂时打不开'));
  assert.equal(await missingArt.locator('.street-transition').count(), 0);
  assert.equal(await missingArt.evaluate(() => digitalMemory.inspect().session.view), 'map');
  await missingArt.unrouteAll();
  await missingArt.getByRole('button', { name: '打开菜单', exact: true }).click(); await missingArt.locator('#street-entry').click();
  await missingArt.waitForFunction(() => !digitalMemory.inspect().entryTransition && digitalMemory.inspect().session.view === 'street', null, { timeout: 30000 });
  await missingArt.close();
  evidence.checks.push('Doodle failure removes the overlay, keeps the map usable and retries with working art.');

  assert.deepEqual(evidence.errors, []);
  evidence.browser = await browser.version();
  console.log(JSON.stringify({ checks: evidence.checks.length, errors: evidence.errors.length, evidenceDir, reducedMs: evidence.reducedMs }));
} catch (error) {
  evidence.failure = error.stack; throw error;
} finally {
  await writeFile(path.join(evidenceDir, 'results.json'), JSON.stringify(evidence, null, 2) + '\n');
  await browser?.close(); server.kill();
}
