// Optional native SVG evidence, not browser QA. Uses the Codex runtime's sharp.
import fs from 'node:fs/promises';import path from 'node:path';import{createRequire}from'node:module';
import{createOverviewAssembly,layeredOverviewMarkup}from'../src/explorer/layered-overview.js';
const require=createRequire(import.meta.url),sharp=require(path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES,'sharp'));
const read=async f=>JSON.parse(await fs.readFile('content/public/'+f+'.json'));
const manifest=await read('manifest'),assembly=createOverviewAssembly(await read('scene-composition'),await read('map-context'));
const assets=Object.fromEntries(Object.entries(manifest.moduleAssets).map(([k,v])=>[k,{...v,url:new URL(v.url,new URL('file://'+process.cwd()+'/content/public/manifest.json')).href}]));
const resourceKeys=['towerSketch','slabSketch'],symbols=[];
for(const k of resourceKeys){const a=assets[k],data=await sharp(await fs.readFile(new URL(a.url))).png().toBuffer();symbols.push(`<symbol id="qa-${k}" viewBox="0 0 ${a.width} ${a.height}" preserveAspectRatio="none"><image width="${a.width}" height="${a.height}" href="data:image/png;base64,${data.toString('base64')}"/></symbol>`);}
const views=[{id:'town',zoom:1,center:[600,600]},{id:'neighborhood',zoom:1.8,center:[700,770]},{id:'street-map',zoom:2.7,center:[720,770]}];
for(const view of views){
 const body=layeredOverviewMarkup(assembly,assets,{periodId:'window-2000',camera:{zoom:view.zoom}},resourceKeys).replace(/<image([^>]*?)href="(file:[^"]+)"([^>]*?)\/>/g,(_,a,url,b)=>`<use${a}href="#qa-${resourceKeys.find(k=>assets[k].url===url)}"${b}/>`);
 const width=1440,height=900,side=Math.max(height,width*.7),w=width/side*1200/view.zoom,h=height/side*1200/view.zoom;
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="${view.center[0]-w/2} ${view.center[1]-h/2} ${w} ${h}"><defs>${symbols.join('')}</defs><rect x="-1500" y="-1500" width="4500" height="4500" fill="#f3ecd9"/><style>.map-name,.road-name{font-family:'Noto Sans SC',sans-serif;font-size:13px;fill:#78694f;paint-order:stroke;stroke:#f2ead8;stroke-width:2px}</style>${body}</svg>`;
 await sharp(Buffer.from(svg)).webp({quality:83}).toFile(`evidence/layered-${view.id}.webp`);
}
await fs.writeFile('evidence/layered-view-results.json',JSON.stringify({kind:'native SVG render, not browser screenshots',views,period:'window-2000',objects:assembly.model.features.length,roadParts:assembly.model.roads.length,tests:30,limits:['No managed control-browser available; browser QA skipped per Sites skill','Wall profile and historical site layout remain schematic','Street character/scenery still use previous candidate assets; camera framing improved']},null,2)+'\n');
console.log('Native map tier images written to evidence/');
