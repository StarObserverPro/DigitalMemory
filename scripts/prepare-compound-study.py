"""Rebuild research SVGs from retained footprint sketches; not runtime registration."""
import json, math, xml.etree.ElementTree as ET
from pathlib import Path
import subprocess, os
from PIL import Image, ImageDraw, ImageFont
ROOT=Path(__file__).resolve().parents[1]; OUT=ROOT/'assets/candidates/compound-study-r2'; OUT.mkdir(parents=True,exist_ok=True)
REF=ROOT.parent/'dm6-references'; PRIVATE=ROOT/'local-evidence/dm11'; PRIVATE.mkdir(parents=True,exist_ok=True)
ext=json.loads((REF/'xinhua-detail-source.json').read_text())['result']['extent']
def pixel(lon,lat):
 x=6378137*math.radians(lon);y=6378137*math.log(math.tan(math.pi/4+math.radians(lat)/2))
 return [(x-ext['xmin'])/(ext['xmax']-ext['xmin'])*1800,(ext['ymax']-y)/(ext['ymax']-ext['ymin'])*1400]
r=ET.parse(ROOT.parent/'fengtai-reference.osm').getroot();nodes={n.get('id'):[float(n.get('lon')),float(n.get('lat'))] for n in r.findall('node')}; ways={w.get('id'):w for w in r.findall('way')}
def osm(suffix,kind):
 id='978924'+str(suffix);p=[pixel(*nodes[n.get('ref')]) for n in ways[id].findall('nd')][:-1]
 return {'id':'osm-'+id,'shape':p,'kind':kind,'evidence':'OSM apartment footprint; individual typology inferred from imagery and estate listing; ground accuracy unverified'}
def trace(id,poly):
 return {'id':'liuli-roof-segment-'+str(id),'shape':[[x+460,y+960] for x,y in poly],'kind':'slab','evidence':'manual visible roof segment, NOT surveyed ground footprint or confirmed building identity'}
liuli=[[(20,222),(160,164),(171,193),(30,253)],[(176,158),(298,105),(310,138),(190,189)],[(323,91),(450,43),(461,75),(337,122)],[(58,293),(184,241),(200,271),(73,324)],[(203,233),(321,182),(337,215),(216,267)],[(356,197),(489,175),(493,208),(362,232)],[(74,326),(109,314),(127,389),(208,368),(217,402),(98,431)],[(213,296),(278,285),(268,247),(301,239),(319,315),(218,335)],[(346,339),(379,333),(387,366),(508,341),(516,374),(358,409)]]
groups=[{'id':'qili','name':'新华街七里','crop':[160,860,420,1240],'buildings':[osm(i,'tower' if i!=279 else 'high-slab') for i in [276,277,278,279]],'note':'三塔 + 一条高板；楼号未逐栋匹配。西侧相邻短楼不并入本四栋样组。'}, {'id':'wuli-west','name':'新华街五里西区','crop':[325,820,800,1150],'buildings':[osm(i,'tower' if i in [280,281,282] else 'slab') for i in [280,281,282,283,285,286]],'note':'三塔 + 三低板；五里东区另留位置，不混成同一院子。'}, {'id':'liuli','name':'新华街六里','crop':[470,970,1000,1400],'buildings':[trace(i+1,p) for i,p in enumerate(liuli)],'note':'长条与折角板楼；九个可见屋面段不等于九栋楼，资料七栋尚未逐一配号。'}]
# Orthographic map pitch: preserve source plan x, compress plan y; heights are artistic, not metres.
def pts(p):return ' '.join(f'{x:.1f},{y:.1f}' for x,y in p)
for g in groups:
 l,t,rr,bb=g['crop']; scale=min(440/(rr-l),340/(bb-t)); g['sourcePixelCrop']=g.pop('crop');g['registrationStatus']='candidate-only';g['historicalDate']=None;g['projection']={'planScale':scale,'yCompression':0.72,'offset':[70,150],'source':'Esri export EPSG3857 extent retained in source.json; pixel traces not production anchors'}
 def xy(p):return [70+(p[0]-l)*scale,150+(p[1]-t)*scale*.72]
 parts=['<svg xmlns="http://www.w3.org/2000/svg" width="600" height="500" viewBox="0 0 600 500">','<g id="yard-wash" opacity=".42">']
 allp=[xy(p) for b in g['buildings'] for p in b['shape']];x0=min(p[0] for p in allp)-8;y0=min(p[1] for p in allp)-8;x1=max(p[0] for p in allp)+8;y1=max(p[1] for p in allp)+8
 parts += [f'<path d="M{x0} {y0+15} Q{(x0+x1)/2} {y0-10} {x1} {y0} L{x1} {y1-10} Q{(x0+x1)/2} {y1+8} {x0} {y1}Z" fill="#e0dfc6"/></g>','<g id="building-shells" stroke="#77756b" stroke-width="1.5" stroke-linejoin="round">']
 for b in sorted(g['buildings'],key=lambda b:sum(p[1] for p in b['shape'])/len(b['shape'])):
  p=[xy(a) for a in b['shape']];h={'tower':88,'high-slab':52,'slab':23}[b['kind']];roof=[[x,y-h] for x,y in p]
  parts.append(f'<g id="{b["id"]}" data-kind="{b["kind"]}">')
  for i,a in enumerate(p):
   z=p[(i+1)%len(p)];ar=roof[i];zr=roof[(i+1)%len(p)];fill='#e7d4b5' if z[0]>a[0] else '#c4c9bd'
   parts.append(f'<polygon points="{pts([a,z,zr,ar])}" fill="{fill}"/>')
  parts.append(f'<polygon points="{pts(roof)}" fill="'+('#b49a87' if b['kind']=='tower' else '#a3aaa3')+'"/>')
  # Sparse facade strokes, no window grille or architectural detail.
  for i,a in enumerate(p):
   z=p[(i+1)%len(p)]
   if z[0]>a[0]+12:
    for f in ([.3,.55,.8] if b['kind']=='tower' else [.5]):
     parts.append(f'<path d="M{a[0]+3:.1f} {a[1]-h*f:.1f} L{z[0]-3:.1f} {z[1]-h*f:.1f}" stroke="#9caaa4" stroke-width="3" opacity=".65"/>')
  parts.append('</g>')
 parts+=['</g><g id="frontage-reserved"/><g id="labels-external"/></svg>']; svg=''.join(parts);(OUT/(g['id']+'.svg')).write_text(svg)
 subprocess.run(['node','-e',"require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/sharp')(process.argv[1]).png().toFile(process.argv[2])",str(OUT/(g['id']+'.svg')),str(OUT/(g['id']+'-guide.png'))],check=True)
 im=Image.open(REF/'xinhua-detail.jpg').crop((l,t,rr,bb));im.save(PRIVATE/(g['id']+'-satellite.png'))
 # Source footprint overlay is private reference; labels identify shapes not addresses.
 d=ImageDraw.Draw(im)
 for i,b in enumerate(g['buildings']):
  p=[(x-l,y-t) for x,y in b['shape']];d.line(p+[p[0]],fill='#ffdc73',width=2);d.text(p[0],str(i+1),fill='white')
 im.save(PRIVATE/(g['id']+'-trace.png'))
(OUT/'layout.json').write_text(json.dumps(groups,ensure_ascii=False,indent=2)+'\n')
(OUT/'source.json').write_text(json.dumps({'imagery':json.loads((REF/'xinhua-detail-source.json').read_text()),'captureDate':None,'accessDate':'2026-10-18','imageryRedistribution':'reference-only; excluded from public asset batch','footprints':'OpenStreetMap contributors, ODbL; https://www.openstreetmap.org/copyright','caution':'Qili and Wuli-west OSM footprints are independent source geometry, not surveyed. Liuli visible roof traces are not ground registration. No GCJ02 data mixed with WGS84.'},ensure_ascii=False,indent=2)+'\n')
