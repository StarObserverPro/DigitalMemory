import fs from 'node:fs/promises';import path from 'node:path';import{createRequire}from'node:module';import{createTransform}from'../src/domain/spatial.js';
const sharp=createRequire(import.meta.url)(path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES,'sharp'));
const read=async p=>JSON.parse(await fs.readFile(p)),root='assets/modules/overview-r4';
const layouts=await read('assets/candidates/compound-study-r3/layout.json'),source=await read('assets/candidates/compound-study-r3/source.json'),t=createTransform((await read('content/public/orientation.json')).bounds),e=source.imagery.result.extent;
const geo=([px,py])=>{const x=e.xmin+px/1800*(e.xmax-e.xmin),y=e.ymax-py/1400*(e.ymax-e.ymin);return[x/6378137*180/Math.PI,(2*Math.atan(Math.exp(y/6378137))-Math.PI/2)*180/Math.PI];};
const point=p=>p.map(v=>v.toFixed(2)).join(','),poly=p=>p.map(point).join(' ');let items=[],markup=[];
for(const level of[1,2])for(const group of layouts)for(const b of group.buildings){
 const i=items.length,col=i%8,row=Math.floor(i/8),cell=[col*192,row*204.8,192,204.8],groundGeo=b.shape.map(geo),ground=groundGeo.map(t.toImage),xs=ground.map(p=>p[0]),ys=ground.map(p=>p[1]);
 const lo=[Math.min(...xs),Math.min(...ys)],hi=[Math.max(...xs),Math.max(...ys)],anchor=[(lo[0]+hi[0])/2,(lo[1]+hi[1])/2],zoom=level===1?1.8:2.7,screen=1008*zoom/1200;
 const heightMetres=b.kind==='tower'?38:group.id==='liuli'?12:26,height=t.scale*heightMetres;
 const origin=[cell[0]+96,cell[1]+140],g=ground.map(p=>p.map((v,k)=>origin[k]+(v-anchor[k])*screen)),roof=g.map(([x,y])=>[x,y-height*screen]),all=[...g,...roof];
 const vb=[Math.min(...all.map(p=>p[0])),Math.min(...all.map(p=>p[1])),Math.max(...all.map(p=>p[0])),Math.max(...all.map(p=>p[1]))];
 let faces=[];for(let j=0;j<g.length;j++){const k=(j+1)%g.length;if(g[k][0]<=g[j][0])continue;faces.push({points:[g[j],g[k],roof[k],roof[j]],fill:group.id==='liuli'?'#b77b66':'#e5d5b8'});}
 // Side polygons first, then fronts and roof. No projected image is subsequently sheared.
 let part=[];for(let j=0;j<g.length;j++){const k=(j+1)%g.length;if(g[k][0]>g[j][0])continue;part.push(`<polygon points="${poly([g[j],g[k],roof[k],roof[j]])}" fill="${group.id==='liuli'?'#916858':'#b9c3ba'}"/>`);}
 part.push(...faces.map(f=>`<polygon points="${poly(f.points)}" fill="${f.fill}"/>`),`<polygon points="${poly(roof)}" fill="#a7ada4"/>`);
 markup.push(`<g stroke="#77746a" stroke-width="1.1" stroke-linejoin="round">${part.join('')}</g>`);
 items.push({id:`${group.id}-${b.id}-${level}`,compoundId:group.id,sourceId:b.id,kind:b.kind,level,cell,guideVisualBounds:vb,guideAnchor:origin,groundGeo,anchorGeo:t.fromImage(anchor),groundSize:[hi[0]-lo[0],hi[1]-lo[1]],height,displaySize:[vb[2]-vb[0],vb[3]-vb[1]],screenScale:screen,shapeEvidence:b.evidence});
}
await fs.mkdir(root,{recursive:true});await fs.writeFile(root+'/plan.json',JSON.stringify({revision:'modular-overview-r4',canvas:[1536,1024],projection:{id:'north-up-orthographic-rise-r1',ground:'shared local equirectangular transform',vertical:'screen y minus illustrated height; no vanishing point',heightPolicy:'compressed illustration height, not measured storeys'},sizeGate:{minimum:.8,maximum:1.5,aspectTolerance:.12},items},null,2)+'\n');
const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1536" height="1024" viewBox="0 0 1536 1024">${markup.join('')}</svg>`;await fs.writeFile(root+'/parts-guide.svg',svg);await sharp(Buffer.from(svg)).png().toFile(root+'/parts-guide.png');console.log(`${items.length} independently anchored building parts; 2 display tiers, 1536x1024 atlas.`);
