// Native SVG component evidence. This is not a browser screenshot or walkthrough.
import fs from 'node:fs/promises';import path from 'node:path';import{createRequire}from'node:module';
import{createOverviewAssembly,layeredOverviewMarkup,overviewLabelLayout}from'../src/explorer/layered-overview.js';
import{createTransform}from'../src/domain/spatial.js';import{mapMetrics}from'../src/explorer/map-labels.js';
const require=createRequire(import.meta.url),sharp=require(path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES,'sharp'));
const read=async f=>JSON.parse(await fs.readFile('content/public/'+f+'.json'));
const manifest=await read('manifest'),assembly=createOverviewAssembly(await read('scene-composition'),await read('map-context'),await read('overview-registration'),createTransform((await read('orientation')).bounds),manifest.moduleAssets);
const assets=Object.fromEntries(Object.entries(manifest.moduleAssets).map(([k,v])=>[k,{...v,url:new URL(v.url,new URL('file://'+process.cwd()+'/content/public/manifest.json')).href}]));
const resourceKeys=['towerSketch','slabSketch','towerGlyph','slabGlyph',...Object.keys(assets).filter(k=>k.startsWith('compound-'))],symbols=[];
for(const k of resourceKeys){const a=assets[k],data=await sharp(await fs.readFile(new URL(a.url))).png().toBuffer();symbols.push(`<symbol id="qa-${k}" viewBox="0 0 ${a.width} ${a.height}" preserveAspectRatio="xMidYMax meet"><image width="${a.width}" height="${a.height}" href="data:image/png;base64,${data.toString('base64')}"/></symbol>`);}
const paper=await fs.readFile('assets/modules/paper-r2.png'),pm=await sharp(paper).metadata();
const views=[{id:'town',width:1011,height:810,zoom:1,center:[600,600]},{id:'neighborhood',width:1440,height:900,zoom:1.8,center:[680,740]},{id:'street-map',width:1440,height:900,zoom:2.7,center:[770,710]},{id:'compound-trial',width:1200,height:900,zoom:2.7,center:[650,810]},{id:'mobile',width:390,height:844,zoom:1,center:[600,600]}];
const results=[];
for(const view of views){
 const {width,height,zoom,center}=view,side=width<=560?height*1.05:Math.max(height,width*.7),camera={zoom,x:(600-center[0])*zoom/12,y:(600-center[1])*zoom/12};
 const metrics=mapMetrics(camera,width,height,side),state={periodId:'window-2000',camera};
 const body=layeredOverviewMarkup(assembly,assets,state,resourceKeys,{metrics}).replace(/<image([^>]*?)href="(file:[^"]+)"([^>]*?)\/>/g,(_,a,url,b)=>`<use${a}href="#qa-${resourceKeys.find(k=>assets[k].url===url)}"${b}/>`);
 const pw=800/metrics.scale,ph=pw*pm.height/pm.width;
 const paperPattern=`<pattern id="paper-qa" width="${pw}" height="${ph}" patternUnits="userSpaceOnUse"><image width="${pw}" height="${ph}" href="data:image/png;base64,${paper.toString('base64')}"/></pattern>`;
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="${metrics.viewport.join(' ')}"><defs>${symbols.join('')}${paperPattern}</defs><rect x="-1500" y="-1500" width="4500" height="4500" fill="#efe7d7"/><rect x="-1500" y="-1500" width="4500" height="4500" fill="url(#paper-qa)"/><style>.map-name,.road-name{font-family:'Fengtai Pen';font-weight:400;fill:#605e4b;paint-order:stroke;stroke:#f7f0df;stroke-linejoin:round}.road-name{fill:#717263}</style>${body}</svg>`;
 await sharp(Buffer.from(svg)).webp({quality:88}).toFile(`evidence/layered-${view.id}.webp`);
 const layout=overviewLabelLayout(assembly,state,resourceKeys,metrics);
 results.push({...view,labels:layout.labels.map(l=>({text:l.text,fontPx:l.fontPx,screenBounds:l.screenBounds})),characters:layout.characters});
}
await fs.writeFile('evidence/layered-view-results.json',JSON.stringify({revision:manifest.id,kind:'native SVG render of consumer markup, not browser screenshots',views:results,period:'window-2000',objects:assembly.model.features.length,roadParts:assembly.model.roads.length,limits:['No managed control-browser available; browser QA skipped per Sites skill','Satellite roof picks are approximate; capture date and individual tower identity remain unverified','Street scene unchanged']},null,2)+'\n');
console.log('Native map views written to evidence/');
