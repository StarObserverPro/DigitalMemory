"""Z-buffered native projection of the exact consumer geometry, not browser QA."""
import json, pathlib
import numpy as np
from PIL import Image
for path in pathlib.Path('local-evidence/street').glob('*.json'):
 d=json.loads(path.read_text());w,h=d['width'],d['height']
 pixels=np.empty((h,w,3),dtype=np.float32);pixels[:]=[235,231,220]
 depths=np.full((h,w),np.inf)
 opaque=[t for t in d['triangles'] if t['opacity']>=.99]
 transparent=sorted((t for t in d['triangles'] if t['opacity']<.99),key=lambda t:-sum(p[2] for p in t['p'])/3)
 for t in opaque+transparent:
  p=np.array(t['p']);xmin=max(0,int(np.floor(p[:,0].min())));xmax=min(w-1,int(np.ceil(p[:,0].max())));ymin=max(0,int(np.floor(p[:,1].min())));ymax=min(h-1,int(np.ceil(p[:,1].max())))
  if xmax<xmin or ymax<ymin:continue
  y,x=np.mgrid[ymin:ymax+1,xmin:xmax+1];x=x+.5;y=y+.5
  (x0,y0,z0),(x1,y1,z1),(x2,y2,z2)=p
  den=(y1-y2)*(x0-x2)+(x2-x1)*(y0-y2)
  if abs(den)<1e-9:continue
  a=((y1-y2)*(x-x2)+(x2-x1)*(y-y2))/den;b=((y2-y0)*(x-x2)+(x0-x2)*(y-y2))/den;c=1-a-b
  z=a*z0+b*z1+c*z2;window=depths[ymin:ymax+1,xmin:xmax+1]
  mask=(a>=-1e-6)&(b>=-1e-6)&(c>=-1e-6)&(z<window)
  if not mask.any():continue
  region=pixels[ymin:ymax+1,xmin:xmax+1];opacity=t['opacity'];region[mask]=np.array(t['color'])*opacity+region[mask]*(1-opacity)
  if opacity>=.99:window[mask]=z[mask]
 out=pathlib.Path('evidence')/(path.stem+'-r3.webp');Image.fromarray(np.uint8(np.clip(pixels,0,255))).save(out,quality=90);print(out)
