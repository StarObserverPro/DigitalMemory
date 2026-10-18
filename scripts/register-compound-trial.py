from PIL import Image
from pathlib import Path
import json,math,hashlib,numpy as np
r=Path(__file__).resolve().parents[1];out=r/'assets/candidates/compound-study-r3';layout=json.loads((out/'layout.json').read_text());ext=json.loads((out/'source.json').read_text())['imagery']['result']['extent']
def geo(p):
 x=ext['xmin']+p[0]/1800*(ext['xmax']-ext['xmin']);y=ext['ymax']-p[1]/1400*(ext['ymax']-ext['ymin']);return [math.degrees(x/6378137),math.degrees(2*math.atan(math.exp(y/6378137))-math.pi/2)]
files={'qili':'exec-0b66ef10-388f-4dee-a2ca-fb37f3fc5c68.png','wuli-west':'exec-376c8982-5885-4aec-8cf2-fa5ae9d7638f.png','liuli':'exec-c3c0ef1a-4430-4dc0-aafc-9db65f7d0a03.png'}
# Visually matched ground-centre candidates; NOT a survey. Least-squares affine retained for reproducibility.
controls={
'qili':[[[280,600],[217,981]],[[490,510],[307,934]],[[280,755],[213,1107]],[[500,820],[310,1169]]],
'wuli-west':[[[500,800],[470,1079]],[[710,735],[562,1038]],[[880,540],[639,905]],[[420,480],[432,884]],[[295,800],[372,1070]],[[1130,540],[739,895]]],
'liuli':[[[320,580],[555,1190]],[[630,505],[704,1128]],[[965,445],[852,1063]],[[440,860],[600,1360]],[[720,725],[726,1280]],[[1060,850],[893,1340]]]}
m=json.loads((r/'content/public/manifest.json').read_text());reg=json.loads((r/'content/public/overview-registration.json').read_text());reg['trialCompounds']=[]
for g in layout:
 id=g['id'];im=Image.open((r.parent/'generated_images')/files[id]).convert('RGBA');im.save(out/(id+'-illustrated.webp'),quality=90);asset='compound-'+id;f=out/(id+'-illustrated.webp');m['moduleAssets'][asset]={'id':asset,'url':'../../assets/candidates/compound-study-r3/'+f.name,'width':im.width,'height':im.height,'sha256':hashlib.sha256(f.read_bytes()).hexdigest(),'revision':3}
 X=np.array([[a[0],a[1],1] for a,b in controls[id]]);Y=np.array([b for a,b in controls[id]]);fit=np.linalg.lstsq(X,Y,rcond=None)[0];err=np.linalg.norm(X@fit-Y,axis=1)
 # Store 3 independent image corners with fitted WGS84 positions; renderer uses sole world transform.
 corners=[[0,0],[im.width,0],[0,im.height]]
 projected=[geo(np.array([*c,1])@fit) for c in corners]
 shape=[p for b in g['buildings'] for p in b['shape']];x0=min(p[0] for p in shape)-8;x1=max(p[0] for p in shape)+8;y0=min(p[1] for p in shape)-8;y1=max(p[1] for p in shape)+8
 reg['trialCompounds'].append({'id':id,'label':g['name'],'assetRef':asset,'revision':'compound-study-r3','periodIds':['window-2000','window-1995'],'periodStatus':'visual-trial-only; not confirmed for selected date','appearanceBasis':'user correction 2026-10-18; inferred visual height, not exact floors','controlPoints':[{'pixel':p,'geo':v} for p,v in zip(corners,projected)],'fitControlPoints':[{'pixel':a,'geo':geo(b)} for a,b in controls[id]],'fitRmsReferencePixels':round(float(np.sqrt(np.mean(err**2))),2),'registrationStatus':'approximate-trial; Liuli roof-to-ground uncertainty remains','contextMaskGeo':[geo(p) for p in [[x0,y0],[x1,y0],[x1,y1],[x0,y1]]],'geo':geo([(x0+x1)/2,(y0+y1)/2]),'publicRoadsBaked':False})
 print(id,'residual px',err.round(1).tolist())
m['id']='phase1-compound-trial-r8';m['revision']=8
(r/'content/public/manifest.json').write_text(json.dumps(m,ensure_ascii=False,indent=2)+'\n');(r/'content/public/overview-registration.json').write_text(json.dumps(reg,ensure_ascii=False,indent=2)+'\n')
