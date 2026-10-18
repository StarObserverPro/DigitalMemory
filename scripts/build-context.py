# Build display-only geographic context from the retained OSM extract.
# Usage: python scripts/build-context.py /absolute/path/to/reference.osm
import json,xml.etree.ElementTree as E,math,hashlib,sys
source_path=sys.argv[1]
root=E.parse(source_path).getroot();nodes={n.get('id'):[float(n.get('lon')),float(n.get('lat'))] for n in root.findall('node')}
geo=json.load(open('content/public/orientation.json'));bounds=geo['bounds'];ox=(bounds[0]+bounds[2])/2;oy=(bounds[1]+bounds[3])/2;kx=math.cos(math.radians(oy));scale=1044/max((bounds[2]-bounds[0])*kx,bounds[3]-bounds[1])
def xy(p):return [round(600+(p[0]-ox)*kx*scale,2),round(600-(p[1]-oy)*scale,2)]
def near(p,a,b):
 dx=b[0]-a[0];dy=b[1]-a[1];t=max(0,min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/(dx*dx+dy*dy or 1)));return math.hypot(p[0]-a[0]-t*dx,p[1]-a[1]-t*dy)
roads=[];candidates=[];districts=[]
existing={r['id'] for r in geo['roads']}
for w in root.findall('way'):
 tags={t.get('k'):t.get('v') for t in w.findall('tag')};ps=[nodes[n.get('ref')] for n in w.findall('nd') if n.get('ref') in nodes];points=[xy(p) for p in ps]
 if len(points)<2:continue
 if tags.get('highway') in ['primary','secondary','tertiary','residential','unclassified','living_street'] and 'osm-way-'+w.get('id') not in existing:
  roads.append({'id':'osm-way-'+w.get('id'),'art':points,'width':9 if tags.get('highway') in ['primary','secondary'] else 5})
 if tags.get('landuse') in ['residential','industrial'] or tags.get('leisure')=='park':districts.append({'art':points,'kind':'park' if tags.get('leisure')=='park' else 'neighborhood'})
 if 'building' in tags and len(points)>=4:
  pts=points[:-1];x=sum(p[0] for p in pts)/len(pts);y=sum(p[1] for p in pts)/len(pts);area=abs(sum(a[0]*b[1]-a[1]*b[0] for a,b in zip(points,points[1:])))/2
  if area>50 and -450<x<1700 and -500<y<1800:candidates.append((area,x,y,w.get('id')))
comp=json.load(open('content/public/scene-composition.json'));allroads=roads+comp['roads'];accepted=[]
for area,x,y,id in sorted(candidates,reverse=True):
 w=min(65,max(38,math.sqrt(area)*1.8));h=w*.72
 if any(math.hypot(x-a['x'],(y-a['y'])*1.35)<w*.95 for a in accepted):continue
 if any(abs(x-(a['ground'][0]+a['ground'][2]/2))<w/2+a['ground'][2]/2+12 and abs(y-(a['ground'][1]+a['ground'][3]/2))<70 for a in comp['overview']):continue
 if any(near((x,y),a,b)<w*.42+r['width']/2+3 for r in allroads for a,b in zip(r['art'],r['art'][1:])):continue
 accepted.append({'id':'context-'+id,'x':round(x,1),'y':round(y,1),'width':round(w,1),'height':round(h,1)})
out={'schemaVersion':1,'privacy':'public','revision':'fengtai-context-r1','source':geo['source'],'sourceFileSha256':hashlib.sha256(open(source_path,'rb').read()).hexdigest(),'notice':'Contemporary street context only. Illustrated building symbols are typology proxies centered on OSM building footprints, not historical facade claims. Not the editable registration area.','roads':roads,'districts':districts,'buildings':accepted}
open('content/public/map-context.json','w').write(json.dumps(out,ensure_ascii=False,separators=(',',':'))+'\n')
p='content/public/manifest.json';m=json.load(open(p));m['context']='map-context.json';m['id']='phase1-immersive-r4';m['revision']=4;open(p,'w').write(json.dumps(m,ensure_ascii=False,indent=2)+'\n');print('context roads',len(roads),'vignettes',len(accepted),'districts',len(districts))
