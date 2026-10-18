from PIL import Image,ImageDraw,ImageFont
import numpy as np
from scipy.ndimage import label,find_objects
import json,pathlib,hashlib,sys
root=pathlib.Path(__file__).resolve().parents[1];source_dir=pathlib.Path(sys.argv[1]);out=root/'assets/candidates/overview-r1';out.mkdir(parents=True,exist_ok=True)
sources={'compounds':'exec-e3bbc99a-c352-406d-b362-296556ba245e.png','buildings':'exec-8376bfff-9ce2-42c9-ae56-57533f1510c5.png'}
ids={'compounds':['three-towers','parallel-slabs','corner-slabs','mixed-compound','walkup-rows','detached-shops-compound'],'buildings':['tower-blue','tower-gray','tower-sage','slab-coral','slab-gray','slab-corner','shop-sage','shop-red','shop-pair']}
items=[];sheets=[]
for kind,file in sources.items():
 source=source_dir/file;im=Image.open(source)
 atlas=out/f'{kind}-atlas.webp';im.save(atlas,quality=92,method=6)
 sheets.append({'id':kind,'url':atlas.name,'dimensions':im.size,'sha256':hashlib.sha256(atlas.read_bytes()).hexdigest(),'generationSourceSha256':hashlib.sha256(source.read_bytes()).hexdigest()})
 ys=[0,512,1024] if kind=='compounds' else [0,500,774,1024]
 for n,name in enumerate(ids[kind]):
  col,row=n%3,n//3
  xs=([0,490,1040,1536] if row==0 else [0,500,1050,1536]) if kind=='compounds' else [0,512,1024,1536]
  rect=(xs[col],ys[row],xs[col+1],ys[row+1]);cut=im.crop(rect)
  # Exclude clipped fragments from a neighboring vignette that touched the cell edge.
  if kind=='compounds':
   data=np.array(cut); labels,count=label(data[:,:,3]>40)
   for i,sl in enumerate(find_objects(labels),1):
    if sl is None:continue
    yy,xx=sl;area=np.count_nonzero(labels[sl]==i)
    if (xx.start==0 or xx.stop==cut.width) and xx.stop-xx.start<30 and area<1600:
     data[max(0,yy.start-4):min(cut.height,yy.stop+4),max(0,xx.start-4):min(cut.width,xx.stop+4),3]=0
   cut=Image.fromarray(data)
  alpha=cut.getchannel('A');mask=alpha.point(lambda p:255 if p>22 else 0);bbox=mask.getbbox()
  if bbox:
   bbox=(max(0,bbox[0]-3),max(0,bbox[1]-3),min(cut.width,bbox[2]+3),min(cut.height,bbox[3]+3));cut=cut.crop(bbox)
  cut.thumbnail((256,220) if kind=='compounds' else (180,180),Image.Resampling.LANCZOS)
  path=out/f'{name}.webp';cut.save(path,quality=94,method=6)
  items.append({'id':name,'type':'compound' if kind=='compounds' else 'building','url':path.name,'width':cut.width,'height':cut.height,'sheet':kind,'sourceCell':rect,'trim':bbox,'groundAnchor':[.5,.96],'registration':None,'approval':'candidate','sha256':hashlib.sha256(path.read_bytes()).hexdigest()})
catalog={'revision':'overview-batch-r1','kind':'original-generated-typology-candidates','privacy':'public','historicalStatus':'unverified; not place-specific reconstructions','automaticOverviewPlacement':False,'sheets':sheets,'assets':items}
(out/'catalog.json').write_text(json.dumps(catalog,ensure_ascii=False,indent=2)+'\n')
canvas=Image.new('RGB',(1200,720),'#f4eedf');draw=ImageDraw.Draw(canvas)
for i,item in enumerate(items):
 im=Image.open(out/item['url']);im.thumbnail((180,155) if i<6 else (160,155),Image.Resampling.LANCZOS)
 if i<6:x=100+(i%6)*200;y=115
 else:x=120+((i-6)%6)*190;y=345 if i<12 else 570
 canvas.paste(im,(x-im.width//2,y-im.height//2),im)

canvas.save(root/'evidence/overview-candidates-r1.webp',quality=92)
print(json.dumps({'sheets':len(sheets),'cutouts':len(items),'bytes':sum(p.stat().st_size for p in out.iterdir())}))
