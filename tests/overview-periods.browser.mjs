// Exercise the built overview through its real period/zoom menu and storage restore.
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright-core');
const port=Number(process.env.OVERVIEW_QA_PORT||43281);
const output=process.env.OVERVIEW_EVIDENCE_DIR||'local-evidence/overview-periods';
const server=spawn(process.execPath,['scripts/serve.mjs','--dist'],{env:{...process.env,PORT:String(port)},stdio:['ignore','pipe','pipe']});
let browser,context;
const evidence={errors:[],views:[]};
try{
 await Promise.race([once(server.stdout,'data'),once(server,'exit').then(()=>{throw Error('Server stopped');})]);
 browser=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE||'/usr/bin/google-chrome',headless:true,args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 context=await browser.newContext({viewport:{width:1280,height:800},reducedMotion:'reduce'});
 const page=await context.newPage();
 page.on('pageerror',error=>evidence.errors.push(error.message));
 page.on('requestfailed',request=>evidence.errors.push(request.url()));
 page.on('response',response=>{if(response.status()>=400&&!response.url().endsWith('/favicon.ico'))evidence.errors.push(response.status()+' '+response.url());});
 await page.goto(`http://127.0.0.1:${port}`);
 await page.waitForFunction(()=>window.__VISUAL_READY__===true);
 await mkdir(output,{recursive:true});
 const inspect=()=>page.evaluate(()=>digitalMemory.inspect().session);
 const menu=()=>page.getByRole('button',{name:'打开菜单',exact:true}).click();
 const choosePeriod=async id=>{
  await menu();await page.locator('#period-button').click();await page.locator(`[data-period="${id}"]`).click();
  await page.waitForFunction(period=>digitalMemory.inspect().session.periodId===period,id);
 };
 const capture=async name=>{
  await page.evaluate(async()=>{
   await document.fonts.ready;
   const urls=[...new Set([...document.querySelectorAll('#map-composition image')].map(image=>image.getAttribute('href')))];
   await Promise.all(urls.map(url=>{const image=new Image();image.src=url;return image.decode();}));
   await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
  });
  await page.screenshot({path:`${output}/${name}.png`});
 };
 const manifest=JSON.parse(await readFile('dist/content/public/manifest.json'));
 const origin=await inspect();
 for(const period of manifest.periods){
  await choosePeriod(period.id);
  assert.deepEqual((await inspect()).camera,origin.camera);
  assert.deepEqual((await inspect()).route,origin.route);
  for(const [level,zoom] of [1,1.8,2.7].entries()){
   if(level){await menu();await page.locator('#zoom-in').click();await page.getByRole('button',{name:'关闭菜单',exact:true}).click();}
   assert.equal((await inspect()).camera.zoom,zoom);
   const parts=await page.locator('[data-part]').count();
   assert.ok(parts>0,`${period.id} / ${zoom} retains building context`);
   for(const id of ["sili","liuli","erli"])assert.ok(await page.locator(`[data-compound="${id}"]`).count()>0,id+" context remains");
   assert.equal(await page.locator('[data-registered-corridor]').count(),1);
   assert.ok(await page.locator('#map-labels text').count()>0);
   assert.equal(await page.locator('dialog[open]').count(),0);
   const qiliTower=page.locator('[data-part="xinhua-71f81588-cee7-4b4d-b52b-06c2dc29dc44"]');
   assert.equal(await qiliTower.count(),['window-2000','stage-middle','unknown'].includes(period.id)?1:0);
   assert.equal(await page.locator('[data-part="xinhua-ca5d1563-4379-4a48-967b-a10ad18eb004"]').count(),period.id==='unknown'?1:0);
   evidence.views.push({period:period.id,zoom,parts});
   if(!level)await capture(period.id);
  }
  await menu();await page.locator('#reset-view').click();await page.getByRole('button',{name:'关闭菜单',exact:true}).click();
 }
 await choosePeriod('stage-primary');
 await menu();await page.locator('#zoom-in').click();await page.getByRole('button',{name:'关闭菜单',exact:true}).click();
 await page.mouse.move(620,400);await page.mouse.down();await page.mouse.move(675,425,{steps:5});await page.mouse.up();
 const saved=await inspect();
 await page.waitForFunction(expected=>JSON.parse(localStorage.getItem('digitalmemory:session:v1')).camera.x===expected,saved.camera.x);
 await page.reload();await page.waitForFunction(()=>window.__VISUAL_READY__===true);
 assert.equal((await inspect()).periodId,'stage-primary');
 assert.deepEqual((await inspect()).camera,saved.camera);assert.deepEqual((await inspect()).route,saved.route);
 assert.ok(await page.locator('[data-part]').count()>0);
 evidence.restore={period:'stage-primary',cameraPreserved:true,routePreserved:true};
 await page.setViewportSize({width:390,height:844});await capture('phone-primary');
 await choosePeriod('stage-middle');await capture('phone-middle');
 assert.ok(await page.locator('[data-part]').count()>0);
 const beforeStreet=await inspect();
 await menu();await page.locator('#street-entry').click();
 await page.waitForFunction(()=>document.querySelector('.outline-host')?.dataset.ready==='true',null,{timeout:45000});
 await page.waitForFunction(()=>!digitalMemory.inspect().entryTransition);
 assert.equal((await inspect()).periodId,'stage-middle');
 await menu();await page.locator('#leave-street').click();
 assert.equal((await inspect()).view,'map');
 assert.deepEqual((await inspect()).camera,beforeStreet.camera);assert.deepEqual((await inspect()).route,beforeStreet.route);
 assert.ok(await page.locator('[data-part]').count()>0);
 evidence.streetReturn={periodPreserved:true,cameraPreserved:true,routePreserved:true};
 assert.deepEqual(evidence.errors,[]);
 await writeFile(`${output}/results.json`,JSON.stringify(evidence,null,2)+'\n');
 console.log(JSON.stringify({views:evidence.views.length,restore:evidence.restore,errors:evidence.errors},null,2));
}finally{await context?.close();await browser?.close();server.kill();}
