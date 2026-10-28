// Real main-entry smoke: the selected outline scene owns one reusable WebGL runtime.
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {mkdir, writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE || 'playwright-core');
const port=Number(process.env.STUDENT_QA_PORT||43179);
const evidenceDir=process.env.OUTLINE_EVIDENCE_DIR||'local-evidence';
const server=spawn(process.execPath,['scripts/serve.mjs','--dist'],{env:{...process.env,PORT:String(port)},stdio:['ignore','pipe','pipe']});
let browser,context;
const evidence={errors:[],rotation:[]};
try{
  await Promise.race([once(server.stdout,'data'),once(server,'exit').then(()=>{throw Error('Server stopped');})]);
  browser=process.env.CHROMIUM_CDP_URL
    ? await chromium.connectOverCDP(process.env.CHROMIUM_CDP_URL)
    : await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE||'/usr/bin/google-chrome',headless:true,
      args:['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  context=await browser.newContext({viewport:{width:1280,height:800},reducedMotion:'reduce'});
  const page=await context.newPage();
  page.on('pageerror',e=>evidence.errors.push(e.message));
  page.on('response',r=>{if(r.status()>=400)evidence.errors.push(r.status()+' '+r.url());});
  evidence.webgl=await page.evaluate(()=>{
    const gl=document.createElement('canvas').getContext('webgl2');
    if(!gl)return {available:false};
    gl.clearColor(.2,.4,.6,1);gl.clear(gl.COLOR_BUFFER_BIT);
    const pixel=new Uint8Array(4);gl.readPixels(0,0,1,1,gl.RGBA,gl.UNSIGNED_BYTE,pixel);
    const info=gl.getExtension('WEBGL_debug_renderer_info');
    const result={available:true,pixel:[...pixel],renderer:info&&gl.getParameter(info.UNMASKED_RENDERER_WEBGL),version:gl.getParameter(gl.VERSION)};
    gl.getExtension('WEBGL_lose_context')?.loseContext();return result;
  });
  assert(evidence.webgl.available);assert.deepEqual(evidence.webgl.pixel,[51,102,153,255]);
  await page.goto('http://127.0.0.1:'+port);
  await page.waitForFunction(()=>window.__VISUAL_READY__===true);
  const menu=()=>page.getByRole('button',{name:'打开菜单',exact:true});
  const host=page.locator('.outline-host'),canvas=host.locator('canvas#scene');
  const inspect=()=>page.evaluate(()=>globalThis.digitalMemory.inspect());
  const frame=async()=>Number(await host.getAttribute('data-frame-serial'));
  const waitFrames=async(count=2)=>{
    const before=await frame();
    await page.waitForFunction(n=>Number(document.querySelector('.outline-host')?.dataset.frameSerial)>=n,before+count,{timeout:15000});
  };
  const openStreet=async()=>{
    await menu().click();await page.locator('#street-entry').click();
    await page.waitForFunction(()=>document.querySelector('.outline-host')?.dataset.ready==='true',null,{timeout:45000});
    await page.waitForFunction(()=>!globalThis.digitalMemory.inspect().entryTransition);
    await waitFrames();
  };
  await openStreet();
  assert.equal(await host.getAttribute('data-art-revision'),'xinhua-corridor-outline-r5');
  await page.waitForFunction(()=>JSON.parse(document.querySelector('.outline-host').dataset.navigationUi).fontReady);
  const projection=JSON.parse(await host.getAttribute('data-avatar-projection'));
  assert(projection.visible);assert(projection.foot.slice(0,2).every(v=>Math.abs(v)<1));assert(projection.head.slice(0,2).every(v=>Math.abs(v)<1));
  evidence.initial=(await inspect()).stage;
  const pixels=await canvas.evaluate(c=>{
    const gl=c.getContext('webgl2'),p=new Uint8Array(4),colors=[];
    for(const [x,y] of [[.1,.1],[.5,.5],[.8,.8]]){gl.readPixels(Math.floor(c.width*x),Math.floor(c.height*y),1,1,gl.RGBA,gl.UNSIGNED_BYTE,p);colors.push([...p]);}
    return colors;
  });
  assert(pixels.some(p=>p[0]>20&&p[1]>20&&p[2]>20),'main canvas must contain rendered pixels');
  const read=()=>host.getAttribute('data-position');
  const before=await read();await canvas.focus();await page.keyboard.down('ArrowUp');
  await page.waitForFunction(p=>document.querySelector('.outline-host').dataset.position!==p,before,{timeout:10000});
  await page.keyboard.up('ArrowUp');assert.notEqual(await read(),before);

  await menu().click();
  await page.waitForFunction(()=>document.querySelector('.outline-host').dataset.paused==='true');
  const pausedPosition=await read(),pausedFrame=await frame();
  await page.waitForTimeout(300);
  assert.equal(await read(),pausedPosition);assert.equal(await frame(),pausedFrame,'menu must cancel rendering, not only movement');
  const paused=JSON.parse((await inspect()).stage.frameLoop);assert.equal(paused.paused,true);assert.equal(paused.scheduled,false);
  await page.getByRole('button',{name:'关闭菜单',exact:true}).click();await waitFrames();

  const map=page.getByRole('button',{name:'新华街',exact:true});
  await map.click();assert.equal(await map.getAttribute('aria-expanded'),'false');await map.click();
  const nav=JSON.parse(await host.getAttribute('data-navigation-ui'));
  const box=await canvas.boundingBox();
  await page.mouse.move(box.x+box.width*.5,box.y+box.height*.5);await page.mouse.down();
  await page.mouse.move(box.x+box.width*.5+80,box.y+box.height*.5);await page.mouse.up();
  await page.waitForFunction(h=>Math.abs(JSON.parse(document.querySelector('.outline-host').dataset.navigationUi).heading-h)>5,nav.heading);

  const originalHost=await host.elementHandle(),saved=await read();
  await menu().click();await page.locator('#leave-street').click();
  await host.waitFor({state:'hidden'});
  assert.equal(await host.count(),1,'one suspended runtime stays warm');
  const suspendedFrame=await frame();await page.waitForTimeout(300);assert.equal(await frame(),suspendedFrame);
  assert.equal(await page.locator('#map-person').isVisible(),false);
  await openStreet();
  assert(await originalHost.evaluate(el=>el===document.querySelector('.outline-host')),'quick re-entry reuses the same WebGL owner');
  assert.equal(await read(),saved);assert(await frame()>suspendedFrame);

  // Turn through the visible world using the real pointer controls; older chunks must be evicted.
  for(let turn=0;turn<8;turn++){
    await page.mouse.move(box.x+box.width*.5,box.y+box.height*.5);await page.mouse.down();
    await page.mouse.move(box.x+box.width*.5+160,box.y+box.height*.5);await page.mouse.up();await waitFrames();
    const stats=JSON.parse((await inspect()).stage.renderDiagnostics).residency;evidence.rotation.push(stats);
    assert(stats.warm<=stats.maxWarmChunks);assert(stats.warmBytes<=stats.maxWarmBytes);
    assert(stats.resident<=stats.registered);
  }
  assert(evidence.rotation.some(s=>s.evicted>0),'travel across viewpoints must release old chunks');
  assert.equal(await host.count(),1);
  await mkdir(evidenceDir,{recursive:true});
  await page.screenshot({path:evidenceDir+'/outline-main-desktop.png'});
  await page.setViewportSize({width:390,height:844});await waitFrames();
  await page.screenshot({path:evidenceDir+'/outline-main-phone.png'});
  const rect=await host.locator('#minimap-panel').boundingBox();assert(rect.x>=0&&rect.x+rect.width<=390);

  // The real 60-second warm timeout also needs to release the canvas and stage owner.
  await menu().click();await page.locator('#leave-street').click();
  const expiryStart=Date.now();await host.waitFor({state:'detached',timeout:65000});
  evidence.retentionExpiryMs=Date.now()-expiryStart;
  assert(evidence.retentionExpiryMs>=55000&&evidence.retentionExpiryMs<65000);
  assert.equal((await inspect()).stage,null);
  await openStreet();assert.equal(await read(),saved);
  assert.equal(await originalHost.evaluate(el=>el.isConnected),false);
  assert.equal(await host.count(),1);evidence.rebuilt=(await inspect()).stage;

  // A cancelled entry may finish its shared data request, but cannot publish a late stage.
  const cancelledContext=await browser.newContext({viewport:{width:1280,height:800},reducedMotion:'reduce'});
  try{
    const cancelledPage=await cancelledContext.newPage();
    cancelledPage.on('pageerror',e=>evidence.errors.push(e.message));
    let release,requested;
    const gate=new Promise(resolve=>release=resolve),seen=new Promise(resolve=>requested=resolve);
    await cancelledPage.route('**/scenes/xinhua-sanli-outline/scene-data.json',async route=>{requested();await gate;await route.continue();});
    await cancelledPage.goto('http://127.0.0.1:'+port);
    await cancelledPage.waitForFunction(()=>globalThis.__VISUAL_READY__===true);
    await cancelledPage.getByRole('button',{name:'打开菜单',exact:true}).click();
    await cancelledPage.locator('#street-entry').click();await seen;
    await cancelledPage.keyboard.press('Escape');release();
    await cancelledPage.waitForFunction(()=>globalThis.digitalMemory.inspect().dataCache.inFlight===0);
    assert.equal((await cancelledPage.evaluate(()=>digitalMemory.inspect())).session.view,'map');
    assert.equal(await cancelledPage.locator('.outline-host').count(),0);
    await cancelledPage.getByRole('button',{name:'打开菜单',exact:true}).click();
    await cancelledPage.locator('#street-entry').click();
    await cancelledPage.waitForFunction(()=>Number(document.querySelector('.outline-host')?.dataset.frameSerial)>=2);
    assert.equal(await cancelledPage.locator('.outline-host').count(),1);
    evidence.cancelledLoadRecovered=true;
  }finally{await cancelledContext.close();}
  assert.deepEqual(evidence.errors,[]);
  await writeFile(evidenceDir+'/outline-runtime.json',JSON.stringify(evidence,null,2));
  console.log('Main WebGL entry passed: render, walk, true menu pause, heading, retained re-entry, chunk eviction, phone fit, real warm expiry and rebuilt state.');
}finally{
  await context?.close();await browser?.close();server.kill();
}
