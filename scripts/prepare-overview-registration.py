"""Build public overview geometry from OSM; satellite picks are explicitly approximate.
Usage: python scripts/prepare-overview-registration.py reference.osm
Does not modify the walkable route or historical approval.
"""
import json, math, sys, hashlib, xml.etree.ElementTree as E
from pathlib import Path
root=E.parse(sys.argv[1]).getroot()
nodes={n.get('id'):[float(n.get('lon')),float(n.get('lat'))] for n in root.findall('node')}
geo=json.load(open('content/public/orientation.json')); comp=json.load(open('content/public/scene-composition.json'))
b=geo['bounds']; ox=(b[0]+b[2])/2; oy=(b[1]+b[3])/2; kx=math.cos(math.radians(oy)); scale=1044/max((b[2]-b[0])*kx,b[3]-b[1])
def xy(p): return [round(600+(p[0]-ox)*kx*scale,3),round(600-(p[1]-oy)*scale,3)]
def centre(ps): return [sum(p[i] for p in ps[:-1])/(len(ps)-1) for i in (0,1)]
ways=[]
for w in root.findall('way'):
    tags={t.get('k'):t.get('v') for t in w.findall('tag')}; ps=[nodes[n.get('ref')] for n in w.findall('nd') if n.get('ref') in nodes]
    if len(ps)>1: ways.append({'id':'osm-way-'+w.get('id'),'tags':tags,'points':ps,'art':[xy(p) for p in ps]})
existing={r['id'] for r in comp['roads']}; roads=[]; buildings=[]; districts=[]
for w in ways:
    t=w['tags']; art=w['art']; h=t.get('highway'); name=t.get('name','')
    if h in ['primary','secondary','tertiary','residential','unclassified','living_street','service','primary_link','secondary_link','tertiary_link'] and w['id'] not in existing:
        service=name=='西四环南路' and h=='tertiary'
        roads.append({'id':w['id'],'art':art,'width':6 if service else 9 if h in ['primary','secondary'] else 3 if h=='service' else 6,'label':name,'class':'service' if service else h,'role':'service' if service else 'context','bridge':t.get('bridge')})
    if t.get('landuse') in ['residential','industrial'] or t.get('leisure')=='park':
        districts.append({'id':w['id'],'art':art,'label':name,'kind':'park' if t.get('leisure')=='park' else 'neighborhood'})
    if 'building' in t and len(art)>3:
        x,y=xy(centre(w['points'])); area=abs(sum(a[0]*b[1]-a[1]*b[0] for a,b in zip(art,art[1:])))/2
        if area>24 and -900<x<2100 and -900<y<2200: buildings.append({'id':w['id'],'x':x,'y':y,'footprint':art})
context={'schemaVersion':1,'privacy':'public','revision':'fengtai-context-r2','source':geo['source'],'sourceFileSha256':hashlib.sha256(Path(sys.argv[1]).read_bytes()).hexdigest(),'notice':'Contemporary geographic context, not historical facade evidence. Source road continuations use the same projection and paint as the focus area.','roads':roads,'districts':districts,'buildings':buildings}
Path('content/public/map-context.json').write_text(json.dumps(context,ensure_ascii=False,separators=(',',':'))+'\n')
parcels=[{'id':d['id'],'label':d['label'].removesuffix('小区'),'geometry':{'type':'Polygon','coordinates':[d['points']]},'sourceRef':d['id']} for d in geo['districts']]
places=json.load(open('content/public/places.json'));sanli=next(p for p in parcels if p['id']=='osm-way-897762350')
if not any(p['id']=='place-sanli' for p in places['records']):
    places['records'].append({'id':'place-sanli','schemaVersion':1,'revision':1,'label':'新华街三里','kind':'neighborhood','geometryRevision':1,'geometry':{'type':'Point','coordinates':centre(sanli['geometry']['coordinates'][0])},'registration':'orientation-only','sourceRefs':['osm-2026-10-18:way/897762350'],'historicalApproval':'unverified','privacy':'public','summary':'沿街的塔楼与院子，留在各自的位置上，慢慢补回记忆。'})
places['revision']='places-r2';Path('content/public/places.json').write_text(json.dumps(places,ensure_ascii=False,indent=2)+'\n')
theatre=next(p for p in places['records'] if p['id']=='place-theatre')
features=[{'id':'theatre-symbol','placeId':'place-theatre','geo':theatre['geometry']['coordinates'],'sourceRefs':theatre['sourceRefs'],'kind':'theatre','label':'丰台影剧院','priority':100,'width':40,'groundSize':[20,8],'uncertaintyMeters':None}]
# Roof-centre picks from the retained, georeferenced World Imagery export.
# Camera lean and capture date remain unknown: no unit number or exact doorway is asserted.
for i,coord in enumerate([[116.2854472222,39.8438600487],[116.2859972222,39.8432313085],[116.2855388889,39.8427104819]]):
    features.append({'id':'xinhua-tower-'+str(i+1),'placeId':'place-sanli','parcelId':sanli['id'],'geo':coord,'sourceRefs':['esri-xinhua-detail-2026-10-18',sanli['id']],'kind':'tower','label':None,'priority':80,'width':52,'groundSize':[19,10],'uncertaintyMeters':30,'registration':'approximate-roof-centre'})
for i,coord in enumerate([[116.2747,39.8408],[116.274,39.83995]]):
    features.append({'id':'nankai-slab-'+str(i+1),'placeId':'place-nankai','parcelId':'osm-way-897762342','geo':coord,'sourceRefs':['osm-way-897762342'],'kind':'slab','label':None,'priority':75,'width':73,'groundSize':[43,9],'uncertaintyMeters':70,'registration':'parcel-interior-symbol-not-individual-building'})
out={'schemaVersion':1,'privacy':'public','revision':'fengtai-overview-registration-r1','geometryRevision':geo['revision'],'transformRevision':'local-equirectangular-r1','crs':'WGS84','sourceNotice':'Current geographic orientation only; visual typology approval and historical verification are separate. Icons never shift geographic anchors.','sources':[geo['source'],{'id':'esri-xinhua-detail-2026-10-18','url':'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer','retrievedAt':'2026-10-18','captureDate':None,'use':'reference-only; imagery not distributed','extent3857':[12944119.069951057,4842713.684796739,12945343.584349785,4843666.084884639],'imageSize':[1800,1400],'roofPicksPixels':[[1055,570],[1145,704],[1070,815]]}],'parcels':parcels,'features':features,'bridgeDecks':[{'id':w['id'],'geo':w['points'],'sourceRef':w['id']} for w in ways if w['id']=='osm-way-608978968'],'railContinuations':[{'id':w['id'],'geo':w['points'],'sourceRef':w['id']} for w in ways if w['id'] in ['osm-way-661490588','osm-way-1034917347']]}
Path('content/public/overview-registration.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n')
print('context roads',len(roads),'footprints',len(buildings),'registered symbols',len(features))
