"""Cut generated parts and register each footprint independently; never warp an illustration."""
from pathlib import Path
import json,math,hashlib,sys
import numpy as np
from PIL import Image,ImageDraw,ImageFont
R=Path(__file__).resolve().parents[1];O=R/'assets/modules/overview-r4';P=json.loads((O/'plan.json').read_text());im=Image.open(sys.argv[1]).convert('RGBA');im.save(O/'parts-atlas.webp',quality=94)
manifest=json.loads((R/'content/public/manifest.json').read_text());reg=json.loads((R/'content/public/overview-registration.json').read_text());groups={c['id']:c for c in reg['trialCompounds']};report=[];S=im.width/P['canvas'][0];SY=im.height/P['canvas'][1]
for c in groups.values():c['parts']=[];c['revision']='modular-overview-r4';c['projectionId']=P['projection']['id'];c['groundStyle']='worn-hardscape-and-patchy-grass';c['registrationStatus']='independent candidate footprints; no whole-image affine';c.pop('controlPoints',None);c.pop('fitControlPoints',None);c.pop('fitRmsReferencePixels',None);c.pop('assetRef',None)
parts={}
for item in P['items']:
 x,y,w,h=item['cell'];cell=[round(x*S),round(y*SY),round((x+w)*S),round((y+h)*SY)];crop=im.crop(cell);a=np.array(crop.getchannel('A'));ys,xs=np.where(a>128);bb=[max(0,int(xs.min())-1),max(0,int(ys.min())-1),min(crop.width,int(xs.max())+2),min(crop.height,int(ys.max())+2)];native=[int(xs.max()-xs.min()+1),int(ys.max()-ys.min()+1)];ratio=[native[i]/item['displaySize'][i] for i in [0,1]];passed=max(ratio)<=1.5 and min(ratio)>=.8
 f=item['id']+'.webp';art=crop.crop(bb);art.save(O/f,quality=94)
 key=item['compoundId']+'-'+item['sourceId'];part=parts.setdefault(key,{'id':key,'kind':item['kind'],'groundGeo':item['groundGeo'],'anchorGeo':item['anchorGeo'],'height':item['height'],'representations':{},'sourceEvidence':item['shapeEvidence']})
 ref='map-part-'+item['id'];units=item['groundSize'][0]/native[0];anchor=[art.width/2,art.height-1-item['groundSize'][1]/2/units]
 if passed:
  manifest['moduleAssets'][ref]={'id':ref,'url':'../../assets/modules/overview-r4/'+f,'width':art.width,'height':art.height,'sha256':hashlib.sha256((O/f).read_bytes()).hexdigest(),'revision':4}
  part['representations'][str(item['level'])]={'assetRef':ref,'modelUnitsPerPixel':units,'sourceAnchor':anchor,'sourceNativeSize':native,'displayBudget':item['displaySize'],'sizeRatio':ratio}
 else:part['representations'][str(item['level'])]={'assetRef':None,'fallback':'controlled-footprint-sketch','reason':'native subject/display ratio exceeds limit','sizeRatio':ratio}
 report.append({'id':item['id'],'cellNative':cell,'trim':bb,'nativeSubject':native,'budget':item['displaySize'],'ratio':ratio,'sizeStatus':'accepted' if passed else 'vector-fallback','sourceAnchor':anchor if passed else None,'registration':'source footprint anchor; approximate base contour, no measured height'})
for c in groups.values():c['parts']=[v for k,v in parts.items() if k.startswith(c['id']+'-')]
manifest['id']='phase1-modular-overview-r9';manifest['revision']=9
(R/'content/public/manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n');(R/'content/public/overview-registration.json').write_text(json.dumps(reg,ensure_ascii=False,indent=2)+'\n');(O/'measurement.json').write_text(json.dumps({'nativeCanvas':im.size,'policy':P['sizeGate'],'parts':report},indent=2)+'\n')
board=Image.new('RGB',(1200,1000),'#f1eadb');d=ImageDraw.Draw(board);font=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',14)
for i,v in enumerate(report):
 x=(i%8)*150;y=(i//8)*195;img=Image.open(O/(v['id']+'.webp'));img.thumbnail((130,155));board.paste(img,(x+(150-img.width)//2,y+10),img);d.text((x+5,y+168),f'{i+1}: '+v['sizeStatus'],font=font,fill='#4e5c50')
board.save(O/'parts-review.webp',quality=90);print('accepted',sum(x['sizeStatus']=='accepted' for x in report),'fallback',[x['id'] for x in report if x['sizeStatus']!='accepted'])
