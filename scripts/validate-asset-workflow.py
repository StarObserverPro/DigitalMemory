"""Native workflow fixture: final-size atlas planning, measured crops and unwarped assembly."""
from pathlib import Path
import json,math,subprocess,sys
from PIL import Image,ImageDraw,ImageFont
import numpy as np
R=Path(__file__).resolve().parents[1];O=R/'assets/candidates/pipeline-validation-r1';O.mkdir(parents=True,exist_ok=True)
def dump(p,v):p.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
def render(svg,p):subprocess.run(['node','-e',"require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/sharp')(process.argv[1]).png().toFile(process.argv[2])",str(svg),str(p)],check=True)
def pt(p):return ' '.join(f'{x:.2f},{y:.2f}' for x,y in p)
def prepare():
 src=json.loads((R/'assets/candidates/compound-study-r3/layout.json').read_text());bounds=json.loads((R/'content/public/orientation.json').read_text())['bounds'];ext=json.loads((R/'assets/candidates/compound-study-r3/source.json').read_text())['imagery']['result']['extent'];lat0=(bounds[1]+bounds[3])/2;lon0=(bounds[0]+bounds[2])/2;kx=6371008.8*math.pi/180*math.cos(math.radians(lat0));ky=6371008.8*math.pi/180;scale=1044/max((bounds[2]-bounds[0])*kx,(bounds[3]-bounds[1])*ky)
 def geo(p):
  x=ext['xmin']+p[0]/1800*(ext['xmax']-ext['xmin']);y=ext['ymax']-p[1]/1400*(ext['ymax']-ext['ymin']);return [math.degrees(x/6378137),math.degrees(2*math.atan(math.exp(y/6378137))-math.pi/2)]
 def world(p):
  lon,lat=geo(p);return [(lon-lon0)*kx,(lat0-lat)*ky]
 specs=[];elements=[]
 for row,z in enumerate([1,1.8,2.7]):
  # 1200x900 desktop fixture, side=900; normal application mapMetrics conversion.
  pxPerMetre=scale*(900*z/1200)
  for col,g in enumerate(src):
   bs=[{**b,'world':[world(p) for p in b['shape']]} for b in g['buildings']];allp=[p for b in bs for p in b['world']];mn=[min(p[i] for p in allp) for i in [0,1]];mx=[max(p[i] for p in allp) for i in [0,1]];center=[(mn[i]+mx[i])/2 for i in [0,1]];x=col*400+2;y=row*400+2;anchor=[x+196,y+250];parts=[];visual=[]
   for b in sorted(bs,key=lambda b:sum(p[1] for p in b['world'])/len(b['world'])):
    ground=[[anchor[0]+(p[0]-center[0])*pxPerMetre,anchor[1]+(p[1]-center[1])*pxPerMetre] for p in b['world']];height=({'tower':38,'high-slab':26}.get(b['kind'],12 if g['id']=='liuli' else 24))*pxPerMetre;roof=[[a,b-height] for a,b in ground];visual+=ground+roof
    for i,a in enumerate(ground):
     j=(i+1)%len(ground);fill=('#ae705c' if ground[j][0]>a[0] else '#875f51') if g['id']=='liuli' else ('#e6d3b3' if ground[j][0]>a[0] else '#b9c2bb');parts.append(f'<polygon points="{pt([a,ground[j],roof[j],roof[i]])}" fill="{fill}"/>')
    parts.append(f'<polygon points="{pt(roof)}" fill="#a3aaa4"/>')
   vb=[min(p[i] for p in visual) for i in [0,1]]+[max(p[i] for p in visual) for i in [0,1]]
   specs.append({'id':g['id']+'-'+str(row),'compoundId':g['id'],'level':row,'zoom':z,'cell':[x,y,392,392],'guideVisualBounds':vb,'displaySize':[vb[2]-vb[0],vb[3]-vb[1]],'guideGroundAnchor':anchor,'worldCenter':center,'groundSizeMetres':[mx[i]-mn[i] for i in [0,1]],'worldBounds':[mn,mx],'metresToScreen':pxPerMetre,'heightPolicy':'illustrative reduced height; not physical survey','sourceIds':[b['id'] for b in bs],'groundPolygonsWorld':[b['world'] for b in bs]})
   elements.append('<g stroke="#6b7169" stroke-width="1.2" stroke-linejoin="round">'+''.join(parts)+'</g>')
 svg='<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1200" viewBox="0 0 1200 1200">'+''.join(elements)+'</svg>';(O/'atlas-guide.svg').write_text(svg);render(O/'atlas-guide.svg',O/'atlas-guide.png');dump(O/'plan.json',{'fixture':{'canvas':[1200,1200],'viewport':[1200,900],'mapSide':900,'zooms':[1,1.8,2.7],'source':'retained Esri extent plus OSM/manual candidate geometry; Liuli roof offset unresolved'},'policy':{'preferredGenerationToDisplayMax':1.5,'hardGenerationToDisplayMax':1.5,'minimumGeneratedToDisplay':0.8,'noNonuniformResize':True,'largeOpaqueYardForbidden':True},'items':specs});print([(s['id'],[round(v) for v in s['displaySize']]) for s in specs])
def process(file):
 plan=json.loads((O/'plan.json').read_text());im=Image.open(file).convert('RGBA');im.save(O/'atlas-native.webp',quality=95);W,H=im.size;sx=W/plan['fixture']['canvas'][0];sy=H/plan['fixture']['canvas'][1];result=[];font=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',16)
 board=Image.new('RGB',(1320,1190),'#f2ebdc');d=ImageDraw.Draw(board);d.text((20,15),'NATIVE ATLAS CROPS / FINAL DISPLAY PIXELS',font=font,fill='#485348')
 for s in plan['items']:
  x,y,w,h=s['cell'];box=[round(x*sx),round(y*sy),round((x+w)*sx),round((y+h)*sy)];crop=im.crop(box);a=np.asarray(crop.getchannel('A'));mask=a>32;ys,xs=np.where(mask)
  if not len(xs):result.append({'id':s['id'],'status':'reject-empty'});continue
  bb=[int(xs.min()),int(ys.min()),int(xs.max())+1,int(ys.max())+1];sizes=[bb[2]-bb[0],bb[3]-bb[1]];ratios=[sizes[i]/s['displaySize'][i] for i in [0,1]];spill=bool(mask[:3].any()or mask[-3:].any()or mask[:,:3].any()or mask[:,-3:].any());aspect=ratios[0]/ratios[1];passed=max(ratios)<=1.5 and min(ratios)>=.8 and not spill and .9<=aspect<=1.1
  # One common scale from the actual sheet; never independently force width/height.
  asset=crop.crop(bb);asset.save(O/(s['id']+'.webp'),quality=94)
  final=asset.copy();uniform=max(ratios); final=final.resize((round(asset.width/uniform),round(asset.height/uniform)),Image.Resampling.LANCZOS)
  row=s['level'];col=['qili','wuli-west','liuli'].index(s['compoundId']);bx=col*440;by=row*380+45;d.text((bx+16,by),s['id'],font=font,fill='#485348');board.paste(final,(bx+30,by+40),final);d.text((bx+16,by+318),f'native {sizes[0]}x{sizes[1]} / budget {s["displaySize"][0]:.0f}x{s["displaySize"][1]:.0f}',font=font,fill='#485348');d.text((bx+16,by+338),f'ratio {ratios[0]:.2f}/{ratios[1]:.2f}   {"PASS" if passed else "RETURN"}',font=font,fill='#485348')
  result.append({'id':s['id'],'cellNative':box,'trimInCell':bb,'nativeSubjectSize':sizes,'finalBudget':s['displaySize'],'generationToDisplay':ratios,'aspectDrift':aspect,'touchesCellEdge':spill,'sizeStatus':'pass' if passed else 'return-to-layout-or-generation','publicationApproved':False,'groundAnchorReview':'pending visual ground-control comparison','uniformSourcePixelsPerDisplayPixel':uniform,'finalDisplaySize':list(final.size),'cropOffsetMustBeRetained':True})
 board.save(O/'size-review.webp',quality=92);dump(O/'measurement.json',{'nativeCanvas':[W,H],'canvasScale':[sx,sy],'alphaThreshold':32,'policy':plan['policy'],'results':result,'limits':['A size pass does not establish correct floor geometry, composition, topology or historical identity.','Transparent pixels and padding do not count as subject size.','No nonuniform fitting or production replacement.']});print([(r['id'],r.get('sizeStatus')) for r in result])
if __name__=='__main__':prepare() if len(sys.argv)==1 else process(sys.argv[1])
