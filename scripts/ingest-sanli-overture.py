#!/usr/bin/env python3
"""Import a tiny licensed Overture GeoJSON extract; NEVER guess missing 3D heights."""
import argparse
from collections import Counter
from datetime import datetime, timezone
import hashlib
import json
import math
from pathlib import Path
from shapely.geometry import LineString, box, shape
from shapely.ops import transform

BBOX = [116.28335, 39.84175, 116.28935, 39.84615]
PARCEL_ID = "osm-way-897762350"
CENTER = ((BBOX[0]+BBOX[2])/2, (BBOX[1]+BBOX[3])/2)
KX = 111195.0802335329 * math.cos(math.radians(CENTER[1]))
KY = 111195.0802335329

def meters(geometry):
    return transform(lambda x,y,z=None: ((x-CENTER[0])*KX,(y-CENTER[1])*KY),geometry)

def read(path):
    return json.loads(Path(path).read_text(encoding="utf-8"))

def records(path):
    source = read(path)
    if source.get("type") != "FeatureCollection" or not isinstance(source.get("features"),list):
        raise ValueError("Expected Overture GeoJSON FeatureCollection: " + path)
    return source["features"]

def save(path, content):
    p=Path(path)
    p.parent.mkdir(parents=True,exist_ok=True)
    p.write_text(json.dumps(content,ensure_ascii=False,indent=2,allow_nan=False)+"\n",encoding="utf-8")

def positive(p,key):
    v=p.get(key)
    if isinstance(v,bool) or not isinstance(v,(int,float)) or not math.isfinite(v) or v<=0:
        return None
    return v

def run():
    parser=argparse.ArgumentParser()
    parser.add_argument("--buildings",required=True)
    parser.add_argument("--parts",required=True)
    parser.add_argument("--release",default="latest-STAC-at-download-time")
    parser.add_argument("--registration",default="content/public/overview-registration.json")
    parser.add_argument("--orientation",default="content/public/orientation.json")
    parser.add_argument("--output",default="content/reference/sanli-open-geometry.geojson")
    parser.add_argument("--report",default="content/reference/sanli-open-audit.json")
    a=parser.parse_args()
    reg=read(a.registration)
    estate=next(p for p in reg["parcels"] if p["id"]==PARCEL_ID)
    boundary=meters(shape(estate["geometry"]))
    roi=box(*BBOX)
    roads=[]
    for road in read(a.orientation)["roads"]:
        if road["label"] in ("新华街","韩庄路","东兴里","建国街"):
            line=LineString(road["points"])
            if line.intersects(roi):
                roads.append((road,line))
    # The orientation subset omits smaller streets at both Sanli junctions.
    # Recover them from the same repo's OSM context art using its published
    # local-equirectangular transform (never from the hand-painted assets).
    orientation=read(a.orientation)
    bounds=orientation["bounds"]
    ox,oy=(bounds[0]+bounds[2])/2,(bounds[1]+bounds[3])/2
    factor=math.cos(math.radians(oy))
    scale=1044/max((bounds[2]-bounds[0])*factor,bounds[3]-bounds[1])
    to_geo=lambda p:(ox+(p[0]-600)/scale/factor,oy-(p[1]-600)/scale)
    present={r["id"] for r,_ in roads}
    for candidate in read("content/public/map-context.json")["roads"]:
        if candidate["label"] not in ("新华街","韩庄路","东兴里","建国街") or candidate["id"] in present:
            continue
        recovered=LineString([to_geo(p) for p in candidate["art"]])
        if recovered.intersects(roi):
            road={ "id":candidate["id"],"label":candidate["label"],
                   "source":"DigitalMemory OSM context inverse-projection" }
            roads.append((road,recovered))
            present.add(candidate["id"])
    road_buffers={r["id"]:meters(line).buffer(4) for r,line in roads}
    items=[]
    raw_counts={}
    hashes={}
    ignored=Counter()
    ids=set()
    for kind,path in (("building",a.buildings),("building_part",a.parts)):
        content=Path(path).read_bytes()
        hashes[kind]=hashlib.sha256(content).hexdigest()
        source=records(path)
        raw_counts[kind]=len(source)
        for f in source:
            props=f.get("properties") or {}
            geometry=f.get("geometry")
            if not geometry:
                ignored[kind+"-no-geometry"]+=1
                continue
            try:
                geom=shape(geometry)
            except (ValueError,TypeError):
                ignored[kind+"-bad-geometry"]+=1
                continue
            if geom.is_empty or not geom.is_valid or geom.geom_type not in ("Polygon","MultiPolygon") or not geom.intersects(roi):
                ignored[kind+"-invalid-or-outside"]+=1
                continue
            planar=meters(geom)
            if planar.area<4:
                ignored[kind+"-tiny"]+=1
                continue
            fid=props.get("id") or f.get("id")
            if not fid or (kind,str(fid)) in ids:
                ignored[kind+"-duplicate-or-no-id"]+=1
                continue
            ids.add((kind,str(fid)))
            proportion=planar.intersection(boundary).area/planar.area
            relation=("mostly-within-sanli" if proportion>0.8 else "sanli-boundary" if proportion>0.01 else "nearby-only")
            roads_near=sorted({r["label"] for r,_ in roads if planar.intersects(road_buffers[r["id"]])})
            source_datasets=sorted({str(s.get("dataset")) for s in (props.get("sources") or []) if isinstance(s,dict) and s.get("dataset")})
            items.append({"type":"Feature","id":str(fid),"geometry":geometry,"properties":{
                "kind":kind,"source":"Overture Maps","sourceId":str(fid),
                "buildingId":str(props.get("building_id")) if props.get("building_id") else None,
                "sanliRelation":relation,"nearRoadCenterline":roads_near,
                "heightMeters":positive(props,"height"),
                "numFloors":int(positive(props,"num_floors")) if positive(props,"num_floors") is not None else None,
                "minHeightMeters":positive(props,"min_height"),
                "hasParts":props.get("has_parts") if isinstance(props.get("has_parts"),bool) else None,
                "estimatedAreaSqM":round(planar.area,1),
                "sourceDatasets":source_datasets,
                "geometryRole":"footprint-or-roofprint-unresolved",
                "identityStatus":"unmatched-to-address",
                "periodStatus":"modern-reference-not-confirmed-historical"
            }})
    items.sort(key=lambda f:(f["properties"]["kind"],f["properties"]["sourceId"]))
    lines=[{"type":"Feature","id":r["id"],"geometry":{"type":"LineString","coordinates":list(line.coords)},
            "properties":{"kind":"road-centerline","source":r.get("source","DigitalMemory OSM orientation"),"name":r["label"]}}
           for r,line in roads]
    selected=lines+items
    buildings=[f for f in items if f["properties"]["kind"]=="building"]
    inside=[f for f in buildings if f["properties"]["sanliRelation"]=="mostly-within-sanli"]
    heights=[f for f in buildings if f["properties"]["heightMeters"] is not None]
    floors=[f for f in buildings if f["properties"]["numFloors"] is not None]
    conflicts=[f for f in buildings if f["properties"]["nearRoadCenterline"]]
    now=datetime.now(timezone.utc).isoformat(timespec="seconds")
    save(a.output,{"type":"FeatureCollection","metadata":{
        "schemaVersion":1,"crs":"WGS84","bboxWGS84":BBOX,
        "source":{"provider":"Overture Maps","release":a.release,
            "retrievedUTC":now,"license":"ODbL-1.0",
            "attribution":"© OpenStreetMap contributors, Overture Maps Foundation, and source contributors",
            "url":"https://docs.overturemaps.org/guides/buildings/","downloadSha256":hashes},
        "usage":"geographic QA reference only; NOT historically validated 3D or approved map geometry",
        "caution":"Some outlines are roofprints rather than ground footprints; absent height/floors never inferred."
    },"features":selected})
    audit={"schemaVersion":1,"status":"reference-only-not-promoted",
        "area":"新华街三里；新华街—韩庄路／东兴里交叉口",
        "bboxWGS84":BBOX,"rawFeatureCounts":raw_counts,
        "selectedCounts":dict(Counter(f["properties"]["kind"] for f in selected)),
        "ignoredCounts":dict(ignored),
        "sanliSourceFootprintsMostlyInside":len(inside),
        "sanliLargeFootprintCandidatesArea300SqM":sum(f["properties"]["estimatedAreaSqM"]>=300 for f in inside),
        "sourceRoadNames":sorted({r["label"] for r,_ in roads}),
        "sanliSourceIds":[f["properties"]["sourceId"] for f in inside],
        "workingSanliCountFromSurvey":10,
        "sourceBuildingsWithHeight":len(heights),
        "sourceBuildingsWithFloorCount":len(floors),
        "roadNearFlags":len(conflicts),
        "roadNearSourceIds":[f["properties"]["sourceId"] for f in conflicts],
        "downloadSha256":hashes,
        "decision":"Do not update illustratedOverview or street-world; inspect mismatched/missing outlines and roof-ground registration first.",
        "limitations":"No licensed Chinese commercial 3D meshes/panoramas imported; Overture may lack heights and its outlines may be roofprints; no historical date inferred."}
    save(a.report,audit)
    print(json.dumps(audit,ensure_ascii=False,indent=2))

if __name__=="__main__":
    run()
