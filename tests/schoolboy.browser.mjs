import {chromium} from 'playwright-core';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {mkdir} from 'node:fs/promises';
import assert from 'node:assert/strict';

const executablePath = process.env.CHROMIUM_EXECUTABLE || '/usr/bin/google-chrome';
const port = Number(process.env.STUDENT_QA_PORT || 43179);
const server=spawn(process.execPath,['scripts/serve.mjs','--dist'],{env:{...process.env,PORT:String(port)},stdio:['ignore','pipe','pipe']});
let browser=null;
const failures=[],errors=[],httpErrors=[];
try {
  const ready=Promise.race([
    once(server.stdout,'data'),
    once(server,'exit').then(([code])=>{throw Error('Street server ended with '+code);}),
  ]);
  await ready;
  browser=await chromium.launch({executablePath,headless:true,
    args:['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  const page=await browser.newPage({viewport:{width:1280,height:800}});
  page.on('pageerror',error=>errors.push(error.stack||error.message));
  page.on('requestfailed',r=>failures.push(r.url()+' '+r.failure()?.errorText));
  page.on('response',r=>{if(r.status()>=400)httpErrors.push({url:r.url(),code:r.status()});});
  const url='http://127.0.0.1:'+port;
  await page.goto(url,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.digitalMemory && window.__VISUAL_READY__,null,{timeout:30000});
  await page.click('#menu-button');
  await page.click('#street-entry');
  await page.waitForFunction(()=>window.__QA_STATE__?.avatarAsset==='modular-glb-walk-r1',null,{timeout:45000});
  const initial=await page.evaluate(()=>window.__QA_STATE__);
  assert.equal(initial.uniform,'red');
  assert.equal(initial.characterHeight,1.4);
  assert.equal(initial.projection,'orthographic');
  assert.equal(initial.renderer.webgl2,true);
  assert.ok(initial.avatarNdc.top<1 && initial.avatarNdc.bottom>-1,
    'Avatar needs to be within camera view: '+JSON.stringify(initial.avatarNdc));
  assert.deepEqual(errors,[]);
  assert.deepEqual(httpErrors,[]);
  await mkdir('local-evidence',{recursive:true});
  await page.screenshot({path:'local-evidence/schoolboy-red-idle.png'});
  const before=initial.travel;
  await page.keyboard.down('ArrowUp');
  await page.waitForTimeout(900);
  await page.screenshot({path:'local-evidence/schoolboy-red-in-motion.png'});
  await page.keyboard.up('ArrowUp');
  await page.waitForTimeout(240);
  let after=await page.evaluate(()=>window.__QA_STATE__);
  console.log('movement diagnostic after ArrowUp',JSON.stringify({
    before,after:after.travel,route:after.route,street:after.street,
    documentView:await page.evaluate(()=>({
      focused:document.activeElement?.id,
      activeDialogs:[...document.querySelectorAll('dialog[open]')].map(x=>x.id),
      currentView:window.digitalMemory.inspect().session.view
    }))
  }));
  if(after.travel<=before+0.02){
    await page.keyboard.down('ArrowDown');
    await page.waitForTimeout(950);
    await page.keyboard.up('ArrowDown');
    await page.waitForTimeout(200);
    after=await page.evaluate(()=>window.__QA_STATE__);
    console.log('movement diagnostic after ArrowDown',JSON.stringify({
      before,after:after.travel,route:after.route,street:after.street
    }));
  }
  assert.ok(after.travel>before+0.02,
    'Walking must move the registered character along the street');
  assert.ok(after.avatarAsset==='modular-glb-walk-r1');
  await page.screenshot({path:'local-evidence/schoolboy-red-walk-stop.png'});
  await page.setViewportSize({width:390,height:844});
  await page.waitForTimeout(200);
  const narrow=await page.evaluate(()=>window.__QA_STATE__);
  assert.ok(narrow.avatarNdc.left>-1 && narrow.avatarNdc.right<1,
    'Avatar should remain visible on phone view');
  await page.screenshot({path:'local-evidence/schoolboy-red-mobile.png'});
  // The map has no avatar. A single menu action changes the model colors/height
  // without rebuilding the street world or inventing a period-to-school mapping.
  await page.click('#menu-button');
  await page.click('#uniform-toggle');
  await page.waitForFunction(()=>window.__QA_STATE__?.uniform==='blue',null,{timeout:20000});
  const blue=await page.evaluate(()=>window.__QA_STATE__);
  assert.equal(blue.characterHeight,1.6);
  assert.equal(blue.avatarAsset,'modular-glb-walk-r1');
  await page.screenshot({path:'local-evidence/schoolboy-blue-mobile.png'});
  await page.setViewportSize({width:1280,height:800});
  await page.waitForTimeout(400);
  await page.screenshot({path:'local-evidence/schoolboy-blue-desktop.png'});
  // The explicit costume decision must survive a reload.
  await page.waitForTimeout(240);
  await page.reload();
  await page.waitForFunction(()=>window.digitalMemory && window.__VISUAL_READY__,null,{timeout:30000});
  assert.equal(await page.evaluate(()=>window.digitalMemory.inspect().session.characterId),'youth');
  assert.deepEqual(errors,[]);
  assert.deepEqual(httpErrors,[]);
  console.log(JSON.stringify({status:'passed',initial:{avatar:initial.avatarAsset,uniform:initial.uniform,
    size:initial.avatarNdc,renderer:initial.renderer},walkDistance:after.travel-before,
    mobileAvatar:narrow.avatarNdc,screenshots:6,uniformToggle:'red/blue verified',
    requestsFailed:failures.length,pageErrors:errors.length,httpErrors:httpErrors.length},null,2));
} catch(error) {
  console.error('student browser smoke:',error);
  if(errors.length)console.error('page errors',errors);
  if(failures.length)console.error('request failures',failures);
  if(httpErrors.length)console.error('HTTP failures',httpErrors);
  process.exitCode=1;
} finally {
  await browser?.close();
  server.kill();
}
