export const headingDegrees=yaw=>(((-yaw*180/Math.PI)%360)+360)%360;
export function mapProjection(bounds,width,height,padding=12){
 const scale=Math.min((width-padding*2)/(bounds.maxX-bounds.minX),(height-padding*2)/(bounds.maxZ-bounds.minZ));
 const ox=(width-(bounds.maxX-bounds.minX)*scale)/2,oy=(height-(bounds.maxZ-bounds.minZ)*scale)/2;
 return {scale,point:p=>[ox+(p[0]-bounds.minX)*scale,oy+(p[1]-bounds.minZ)*scale]};
}

export function makeNavigationUI(data,{host=document.body,storage=globalThis.localStorage}={}){
 const root=document.createElement('aside');root.id='navigation-ui';root.setAttribute('aria-label','方向与定位');
 root.innerHTML=`<div id="compass" role="img" aria-label="指南针"><svg class="nav-frame compass-drawing" viewBox="0 0 64 94" aria-hidden="true" focusable="false"><path d="M14 7Q30 2 48 8Q59 12 57 29L59 59Q61 81 48 86Q31 91 14 85Q5 81 7 62L5 30Q3 14 14 7Z"/><path class="nav-rays" d="M2 8 0 4 M60 8 63 4 M61 84 64 87"/><text x="32" y="23" class="compass-letter">北</text><g id="compass-needle"><path class="compass-arrow" transform="translate(-10 -16)" d="M11 2Q14 13 18 29L10 24 3 29Q6 13 11 2Z"/></g><text id="compass-heading" x="32" y="79">向北</text></svg></div><section id="minimap-panel"><svg class="nav-frame" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path d="M11 3Q29 1 48 3T87 3Q98 3 96 16C94 35 99 52 96 72L97 87Q98 97 86 96C62 94 38 99 14 96Q2 97 4 84C6 64 1 45 4 24L3 13Q2 4 11 3Z"/></svg><button id="map-toggle" aria-controls="map-content" aria-expanded="true" title="收起小地图"><span>新华街</span><span id="map-toggle-mark" aria-hidden="true">−</span></button><div id="map-content"><canvas id="minimap" role="img" aria-label="小地图，上北下南，箭头标示当前位置与视向"></canvas><div class="map-key">↑ 北 <span>▲ 位置·朝向</span></div></div></section>`;
 host.append(root);
 const canvas=root.querySelector('#minimap'),ctx=canvas.getContext('2d'),content=root.querySelector('#map-content'),toggle=root.querySelector('#map-toggle'),needle=root.querySelector('#compass-needle'),label=root.querySelector('#compass-heading'),compass=root.querySelector('#compass'),layer=document.createElement('canvas');
 const audit={northUp:true,heading:0,northNeedleAngle:0,position:[0,0],pixel:[0,0],collapsed:false,revision:data.revision,font:'Sanli Happy',fontReady:false};
 const bounds=data.bounds;
 let disposed=false;
 let width=170,height=190,projection,last=-1000,dpr=1;
 function path(c,points,close=false){c.beginPath();points.forEach((p,i)=>{const q=projection.point(p);i?c.lineTo(...q):c.moveTo(...q);});if(close)c.closePath();}
 function polygon(c,p,fill,outline=null){path(c,p.ring,true);for(const h of p.holes||[]){const q=projection.point(h[0]);c.moveTo(...q);for(const v of h.slice(1))c.lineTo(...projection.point(v));c.closePath();}c.fillStyle=fill;c.fill('evenodd');if(outline){c.strokeStyle=outline;c.lineWidth=.9;c.stroke();}}
 function resize(){
  width=matchMedia('(max-width:480px)').matches?136:170;height=matchMedia('(max-width:480px)').matches?152:190;dpr=Math.min(2,devicePixelRatio||1);
  for(const c of [canvas,layer]){c.width=Math.round(width*dpr);c.height=Math.round(height*dpr);}canvas.style.width=width+'px';canvas.style.height=height+'px';
  projection=mapProjection(bounds,width,height,10);const c=layer.getContext('2d');c.setTransform(dpr,0,0,dpr,0,0);c.fillStyle='#faf9f4';c.fillRect(0,0,width,height);
  c.strokeStyle='#e0e1d8';c.lineWidth=4;for(const road of data.contextRoads||[]){path(c,road.points);c.stroke();}
  for(const dir of [data.northDirection,data.eastDirection]){path(c,[-35,350].map(s=>[dir[0]*s,dir[1]*s]));c.stroke();}
  for(const p of data.paving||[])polygon(c,p,'#e9e8df');for(const p of data.greenAreas||[])polygon(c,p,'#d6dfcc');for(const p of data.plazas||[])polygon(c,p,'#e7dcc6');
  for(const b of [...data.buildings,...(data.frontageBuildings||[])])polygon(c,{ring:b.originalRing},b.compound==='sanli'?'#f6f4ed':'#ecebe3',b.compound==='sanli'?'#4f5744':'#a0a797');
  c.strokeStyle='#746047';c.lineWidth=1.1;for(const f of data.fences||[]){path(c,f.points);c.stroke();}
  c.font='11px "Sanli Happy",system-ui' ;c.textBaseline='middle';for(const g of data.gates||[]){const [x,y]=projection.point(g.center);c.fillStyle='#8c6b45';c.beginPath();c.arc(x,y,2.1,0,Math.PI*2);c.fill();c.fillStyle='#5c6254';c.textAlign=g.id==='north'?'right':'left';c.fillText(g.id==='north'?'向阳门':'新华门',g.id==='north'?x-5:x+5,Math.min(height-7,y+7));}
  for(const b of data.trashBins||[]){const [x,y]=projection.point(b.position);c.fillStyle='#586054';c.fillRect(x-1,y-1,2,2);}
  last=-1000;
 }
 function collapse(value){audit.collapsed=value;content.hidden=value;toggle.setAttribute('aria-expanded',String(!value));toggle.title=value?'展开小地图':'收起小地图';root.querySelector('#map-toggle-mark').textContent=value?'+':'−';try{storage?.setItem('sanli-minimap-collapsed',String(value));}catch{}}
 toggle.addEventListener('click',()=>collapse(!audit.collapsed));
 try{collapse(storage?.getItem('sanli-minimap-collapsed')==='true');}catch{}
 function update(state,yaw,now){
  if(now-last<90)return;last=now;const heading=headingDegrees(yaw),direction=['北','东北','东','东南','南','西南','西','西北'][Math.round(heading/45)%8];
  needle.setAttribute('transform',`translate(32 46) rotate(${yaw*180/Math.PI})`);label.textContent=`向${direction}`;compass.setAttribute('aria-label',`视向${direction}，方位角${Math.round(heading)}度，箭头指向北`);
  const [x,y]=projection.point(state.position);Object.assign(audit,{heading:+heading.toFixed(2),northNeedleAngle:yaw,position:[...state.position],pixel:[+x.toFixed(2),+y.toFixed(2)]});
  if(audit.collapsed)return;
  ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,width,height);ctx.drawImage(layer,0,0,width,height);
  if(state.path.length){path(ctx,[state.position,...state.path]);ctx.strokeStyle='#9a835e';ctx.lineWidth=1.2;ctx.setLineDash([3,2]);ctx.stroke();ctx.setLineDash([]);}
  ctx.save();ctx.translate(x,y);ctx.rotate(-yaw);ctx.beginPath();ctx.moveTo(0,-6);ctx.lineTo(4.2,4);ctx.lineTo(0,2);ctx.lineTo(-4.2,4);ctx.closePath();ctx.fillStyle='#77552f';ctx.strokeStyle='#faf9f4';ctx.lineWidth=1.5;ctx.fill();ctx.stroke();ctx.restore();
 }
 resize();
 // Repaint cached canvas labels once the local Chinese face is ready.
 document.fonts.load('12px "Sanli Happy"','三里北向阳门新华位置朝向').then(faces=>{if(disposed)return;audit.fontReady=faces.length>0;resize();}).catch(()=>{});
 return {resize,update,audit,dispose:()=>{disposed=true;root.remove();}};
}
