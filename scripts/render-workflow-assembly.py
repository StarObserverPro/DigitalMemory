"""Diagnostic assembly only: metre-based ground and uniformly scaled sprites."""
from pathlib import Path
import json,base64,subprocess,io
from PIL import Image
R=Path(__file__).resolve().parents[1];O=R/'assets/candidates/pipeline-validation-r1';P=json.loads((O/'plan.json').read_text());M=json.loads((O/'measurement.json').read_text());byid={v['id']:v for v in M['results']};panels=[];diagnostics=[]
for s in P['items']:
 m=byid[s['id']];col=['qili','wuli-west','liuli'].index(s['compoundId']);row=s['level'];base=[col*400+200,row*350+255];cx,cy=s['worldCenter'];k=s['metresToScreen'];
 def screen(p):return [base[0]+(p[0]-cx)*k,base[1]+(p[1]-cy)*k]
 poly=[screen(p) for g in s['groundPolygonsWorld'] for p in g];lo=[min(p[i] for p in poly) for i in [0,1]];hi=[max(p[i] for p in poly) for i in [0,1]]
 floor=[];markers=[]
 for i,g in enumerate(s['groundPolygonsWorld']):
  pts=[screen(p) for p in g];floor.append('<polygon points="'+' '.join(f'{x:.2f},{y:.2f}' for x,y in pts)+'" fill="#c6cbb0" stroke="#a0aa91" stroke-width=".8" opacity=".45"/>');f=max(pts,key=lambda p:p[1]);markers.append(f'<circle cx="{f[0]}" cy="{f[1]}" r="2.4" fill="#b9554d"/>')
 w,h=m['finalDisplaySize'];vb=s['guideVisualBounds'];ga=s['guideGroundAnchor'];mid=[(vb[i]+vb[i+2])/2-ga[i] for i in [0,1]];left=base[0]+mid[0]-w/2;top=base[1]+mid[1]-h/2
 buffer=io.BytesIO();Image.open(O/(s['id']+'.webp')).save(buffer,format='PNG');data=base64.b64encode(buffer.getvalue()).decode();im=f'<image x="{left}" y="{top}" width="{w}" height="{h}" preserveAspectRatio="xMidYMid meet" href="data:image/png;base64,{data}"/>'
 # Deliberately a ground road under the standing art, never a building mask.
 road=f'<path d="M{lo[0]-15} {lo[1]+(hi[1]-lo[1])*.48} L{hi[0]+15} {lo[1]+(hi[1]-lo[1])*.48}" stroke="#d7d9cf" stroke-width="8"/>'
 border=f'<rect x="{lo[0]}" y="{lo[1]}" width="{hi[0]-lo[0]}" height="{hi[1]-lo[1]}" fill="none" stroke="#99ac99" stroke-dasharray="3 4" opacity=".65"/>'
 panels.append(f'<g><text x="{col*400+15}" y="{row*350+32}" font-size="18" fill="#4a584d">{s["id"]} / {w}x{h} px</text>{"".join(floor)}{road}{im}{border}{"".join(markers)}</g>')
 # Relative floor probes are independent of the generated silhouette box and stay diagnostic.
 diagnostics.append({'id':s['id'],'groundWidthMetres':s['groundSizeMetres'][0],'spriteSize':m['finalDisplaySize'],'fit':'one uniform scale; visual-bounds centering only','groundControls':'red diagnostic dots are independent ground targets, not asserted matches','geometryStatus':'review-needed; source footprint and generated floor shape are not proven equivalent'})
svg='<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1100" viewBox="0 0 1200 1100"><rect width="1200" height="1100" fill="#f2ebdc"/>'+''.join(panels)+'<text x="20" y="1080" font-size="16" fill="#5c675c">Diagnostic only: floor outline + road below / standing art above / floor probes in red. No shear.</text></svg>'
(O/'assembly-review.svg').write_text(svg);subprocess.run(['node','-e',"require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/sharp')(process.argv[1]).webp({quality:92}).toFile(process.argv[2])",str(O/'assembly-review.svg'),str(O/'assembly-review.webp')],check=True);(O/'geometry-review.json').write_text(json.dumps(diagnostics,indent=2)+'\n')
