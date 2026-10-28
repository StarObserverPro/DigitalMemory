#!/usr/bin/env python3
"""Compose selected image-generated wax/pencil materials onto registered masses.

Offline asset build: Python 3, Pillow, numpy, Shapely 2.1. Runtime has no Python
dependency. The source plan owns XY, height evidence owns Z, and level changes
only facade detail. All visible surface colour/marks originate in the selected
raster material atlas; geometry is used only as an invisible projection mask.
"""
import hashlib
import json
import math
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageEnhance
from shapely.geometry import Polygon, LineString, shape, mapping
from shapely.geometry.polygon import orient
from shapely.ops import transform, unary_union

ROOT = Path(__file__).resolve().parents[1]
read = lambda p: json.loads(Path(p).read_text(encoding='utf-8'))
write = lambda p, d: Path(p).write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
plan = read(ROOT / 'content/reference/xinhua-spatial-plan.json')
if plan.get('revision') != 'xinhua-registered-masses-r6':
    raise SystemExit('Legacy R6 compiler cannot overwrite the selected travel-map registration/art. See docs/research/XINHUA_SPATIAL_PIPELINE.md.')
registry_path = ROOT / 'content/public/overview-registration.json'
manifest_path = ROOT / 'content/public/manifest.json'
registration = read(registry_path)
manifest = read(manifest_path)
orientation = read(ROOT / 'content/public/orientation.json')
context = read(ROOT / 'content/public/map-context.json')
composition = read(ROOT / 'content/public/scene-composition.json')
b = orientation['bounds']
ox, oy = (b[0] + b[2]) / 2, (b[1] + b[3]) / 2
kx, ky = 111195.0802335329 * math.cos(math.radians(oy)), 111195.0802335329
scale = 1044 / max((b[2] - b[0]) * kx, (b[3] - b[1]) * ky)
to_art = lambda x, y, z=None: (600 + (x - ox) * kx * scale, 600 - (y - oy) * ky * scale)
to_geo = lambda p: [ox + (p[0] - 600) / scale / kx, oy - (p[1] - 600) / scale / ky]
P = 6  # selected assets support the near camera without oversized source sprites
OUT = ROOT / 'assets/modules/xinhua-wax-r6'
OUT.mkdir(parents=True, exist_ok=True)
atlas = Image.open(ROOT / 'assets/materials/xinhua-wax-r1.webp').convert('RGB')
cell = atlas.width // 3
materials = [atlas.crop((x * cell, y * cell, (x + 1) * cell, (y + 1) * cell)) for y in range(3) for x in range(3)]


def quiet(im, colour, amount):
    return Image.blend(Image.new('RGB', im.size, colour), im, amount)


def tiled(tile, size):
    out = Image.new('RGB', size)
    for y in range(0, size[1], tile.height):
        for x in range(0, size[0], tile.width):
            out.paste(tile, (x, y))
    return out


def mask_polygon(size, points, softness=.45):
    mask = Image.new('L', size)
    ImageDraw.Draw(mask).polygon(points, fill=255)
    return mask.filter(ImageFilter.GaussianBlur(softness)) if softness else mask


def surface(canvas, tex, quad, opacity=1):
    """Affine material projection onto an exact parallelogram, not image warping of a building."""
    a, b, _, d = np.array(quad, dtype=float)
    matrix = np.array([[b[0] - a[0], d[0] - a[0]], [b[1] - a[1], d[1] - a[1]]])
    if abs(np.linalg.det(matrix)) < .1:
        return
    inv = np.linalg.inv(matrix)
    coeff = (inv[0, 0] * tex.width, inv[0, 1] * tex.width, -np.dot(inv[0], a) * tex.width,
             inv[1, 0] * tex.height, inv[1, 1] * tex.height, -np.dot(inv[1], a) * tex.height)
    paint = tex.transform(canvas.size, Image.Transform.AFFINE, coeff, Image.Resampling.BICUBIC)
    mask = mask_polygon(canvas.size, [tuple(p) for p in quad])
    if opacity != 1:
        mask = mask.point(lambda x: round(x * opacity))
    canvas.paste(paint, (0, 0), mask)


def facade(length, height, obj, level, shade):
    size = (max(2, round(length)), max(2, round(height)))
    wax = quiet(materials[0], '#ead8b8', .8).resize(size, Image.Resampling.LANCZOS)
    shadow = quiet(materials[1], '#c1c2b5', .62).resize(size, Image.Resampling.LANCZOS)
    wax = Image.blend(wax, shadow, shade)
    if level == 0:
        return wax
    if obj['kind'] == 'shop':
        # One-storey storefront material, with the blank upper atlas area removed.
        tile = materials[8].crop((0, 154, cell, 370))
        tile = tile.resize((max(8, round(22 * scale * P)), size[1]), Image.Resampling.LANCZOS)
        detail = tiled(tile, size)
    elif obj['kind'] == 'industrial':
        # Plant halls have sparse openings; never repeat residential balconies.
        return wax
    else:
        source = materials[7 if 'sage' in obj['appearanceFamily'] or 'green' in obj['appearanceFamily'] else 6]
        tile = source.crop((7, 12, cell - 7, 374))
        row_h = height / max(1, obj['storeys'])
        tile = tile.resize((max(8, round(8 * 3.8 * scale * P)), max(6, round(row_h * 6))), Image.Resampling.LANCZOS)
        detail = tiled(tile, size)
    detail = Image.blend(detail, shadow, shade * .5)
    return Image.blend(wax, detail, .22 if level == 1 else .50)


def render_building(obj, level):
    g = orient(shape(obj['geometry']), sign=1)
    if not g.is_valid or g.geom_type != 'Polygon':
        raise ValueError('Invalid mass polygon: ' + obj['id'])
    ground = [to_art(*p) for p in list(g.exterior.coords)[:-1]]
    rise = obj['heightMetres'] * scale
    x = math.floor(min(p[0] for p in ground) - 1.5)
    y = math.floor(min(p[1] for p in ground) - rise - 1.5)
    w = math.ceil(max(p[0] for p in ground) + 2 - x)
    h = math.ceil(max(p[1] for p in ground) + 2 - y)
    size = (w * P, h * P)
    canvas = Image.new('RGBA', size)
    paint_ground = list(Polygon(ground).simplify((3 if level == 0 else 1 if level == 1 else 0) * scale, preserve_topology=True).exterior.coords)[:-1]
    pts = [((px - x) * P, (py - y) * P) for px, py in paint_ground]
    roof = [(px, py - rise * P) for px, py in pts]
    # Contact shade comes from pencil hatching, with no synthetic grain/noise.
    shade = quiet(materials[1], '#a6ab9b', .5).resize(size, Image.Resampling.LANCZOS)
    mask = mask_polygon(size, [(px + 4, py + 5) for px, py in pts], 2).point(lambda v: round(v * .22))
    canvas.paste(shade, (0, 0), mask)
    edges = [(i, (pts[i][1] + pts[(i + 1) % len(pts)][1]) / 2) for i in range(len(pts)) if pts[(i + 1) % len(pts)][0] - pts[i][0] > .3]
    for i, _ in sorted(edges, key=lambda e: e[1]):
        j = (i + 1) % len(pts)
        dx, dy = pts[j][0] - pts[i][0], pts[j][1] - pts[i][1]
        length = math.hypot(dx, dy)
        shade_amount = .12 + .53 * abs(dy) / max(length, 1)
        tex = facade(length, rise * P, obj, level, shade_amount)
        surface(canvas, tex, [roof[i], roof[j], pts[j], pts[i]])
    roof_material = 5 if obj['appearanceFamily'] == 'cream-red-cap' else 2
    roof_tex = quiet(materials[roof_material], '#c9baa1' if roof_material == 5 else '#c4c6b4', .48)
    # Broad strokes span a roof. Distant representation never adds tiny windows.
    rb = Polygon(roof).bounds
    roof_paint = Image.new('RGB', size)
    roof_paint.paste(roof_tex.resize((max(1, math.ceil(rb[2] - rb[0]) + 2), max(1, math.ceil(rb[3] - rb[1]) + 2)), Image.Resampling.LANCZOS), (math.floor(rb[0]), math.floor(rb[1])))
    canvas.paste(roof_paint, (0, 0), mask_polygon(size, roof))
    return canvas, [x, y, w, h], ground


def add_asset(key, file, image):
    image.save(file, 'WEBP', quality=90, method=6)
    manifest['moduleAssets'][key] = {'id': key, 'url': '../../' + str(file.relative_to(ROOT)), 'width': image.width, 'height': image.height,
        'sha256': hashlib.sha256(file.read_bytes()).hexdigest(), 'revision': 'xinhua-wax-r6', 'privacy': 'public',
        'kind': 'imagegen-material-raster-composition', 'approval': 'working-reconstruction-not-user-style-approval'}


def pack(images, width=1536):
    rows, x, y, rowh = [], 0, 0, 0
    for im in images:
        if x + im.width > width:
            x, y, rowh = 0, y + rowh + 4, 0
        rows.append([x, y, im.width, im.height])
        x += im.width + 4
        rowh = max(rowh, im.height)
    out = Image.new('RGBA', (width, y + rowh))
    for im, rect in zip(images, rows):
        out.paste(im, tuple(rect[:2]))
    return out, rows


def ground_image():
    regions = [transform(to_art, shape(c['geometry'])) for c in plan['compounds']]
    area = unary_union(regions).convex_hull.buffer(5)
    xmin, ymin, xmax, ymax = area.bounds
    x, y, w, h = math.floor(xmin - 2), math.floor(ymin - 2), math.ceil(xmax - xmin + 4), math.ceil(ymax - ymin + 4)
    factor = 4
    size = (w * factor, h * factor)
    local = lambda p: ((p[0] - x) * factor, (p[1] - y) * factor)
    texture = quiet(materials[4], '#eee6d3', .16).resize(size, Image.Resampling.LANCZOS)
    ground = Image.new('RGBA', size)
    ground.paste(texture, (0, 0), mask_polygon(size, [local(p) for p in area.exterior.coords], 6))
    lawn = quiet(materials[3], '#e6e5ce', .28).resize(size, Image.Resampling.LANCZOS)
    for c, region in zip(plan['compounds'], regions):
        if c['id'] in ['school', 'heating', 'yili', 'sili']:
            continue
        mask = mask_polygon(size, [local(p) for p in region.exterior.coords], 2)
        ground.paste(lawn, (0, 0), mask)
    # Roads use the same source centerlines as the spatial checks. All visible
    # road colour is sampled pencil material, not SVG path art.
    seen = set()
    roadpaint = quiet(materials[1], '#d5d6c9', .2).resize(size, Image.Resampling.LANCZOS)
    for r in composition['roads'] + context['roads']:
        if r['id'] in seen:
            continue
        seen.add(r['id'])
        line = LineString(r['art'])
        if not line.intersects(area):
            continue
        width = (24 if r.get('class') == 'ring' else 14 if r.get('label') == '新华街' else 16 if r.get('class') in ['primary','secondary'] else 6 if r.get('role') == 'service' else 8) * scale
        road = line.buffer(width / 2, cap_style=1, join_style=1).intersection(area)
        polys = [road] if road.geom_type == 'Polygon' else list(getattr(road, 'geoms', []))
        for poly in polys:
            if poly.geom_type == 'Polygon':
                ground.paste(roadpaint, (0, 0), mask_polygon(size, [local(p) for p in poly.exterior.coords], .7))
    # Court space remains visibly empty. Its separate mass-free sports surface
    # is registered inside the actual school parcel.
    for open_space in plan['openSpaces']:
        poly = transform(to_art, shape(open_space['geometry']))
        green = quiet(materials[3], '#b5c7a5', .5).resize(size, Image.Resampling.LANCZOS)
        ground.paste(green, (0, 0), mask_polygon(size, [local(p) for p in poly.exterior.coords], 1.2))
    key = 'painted-xinhua-ground-r6'
    add_asset(key, OUT / 'ground.webp', ground)
    return {'assetRef': key, 'bounds': [x, y, w, h], 'periodIds': ['window-2000']}


old = registration['paintedOverview']
compounds = []
for c in plan['compounds']:
    objects = [o for o in plan['objects'] if o['compoundId'] == c['id']]
    parts = []
    assets_by_level = []
    for level in range(3):
        images, bounds_list, ground_list = [], [], []
        for o in objects:
            im, rect, ground = render_building(o, level)
            images.append(im); bounds_list.append(rect); ground_list.append(ground)
        sheet, rects = pack(images)
        key = f'painted-{c["id"]}-r6-{level}'
        add_asset(key, OUT / f'{c["id"]}-{level}.webp', sheet)
        assets_by_level.append(key)
        for j, (o, rect, crop, ground) in enumerate(zip(objects, bounds_list, rects, ground_list)):
            if level == 0:
                g = shape(o['geometry'])
                part = {k: v for k, v in o.items() if k not in ['geometry', 'reviewIndex', 'compoundId']}
                part.update({'groundGeo': list(g.exterior.coords)[:-1], 'anchorGeo': [g.centroid.x, g.centroid.y],
                    'renderBounds': rect, 'levels': {}, 'sourceFeatureId': None,
                    'minLevel': 1 if g.area * kx * ky < 360 and o['storeys'] <= 3 else 0})
                if o.get('reviewIndex') in [170, 182, 196]:
                    feature_id = 'xinhua-tower-' + str([170, 182, 196].index(o['reviewIndex']) + 1)
                    part['sourceFeatureId'] = feature_id
                    feature = next(f for f in registration['features'] if f['id'] == feature_id)
                    feature['geo'] = part['anchorGeo']
                    feature['geometrySource'] = o['sourceIds'][0]
                parts.append(part)
            parts[j]['levels'][str(level)] = {'assetRef': key, 'crop': crop}
    compounds.append({'id': c['id'], 'label': c['label'], 'shortLabel': c['shortLabel'],
        'contextMaskGeo': list(shape(c['geometry']).exterior.coords)[:-1], 'periodIds': c['periodIds'],
        'assetRef': assets_by_level[0], 'assetRefsByLevel': assets_by_level, 'parts': parts,
        'boundarySource': c['boundarySource']})
    print(c['id'], len(parts), flush=True)

registration['paintedOverview'] = {'revision': 6, 'renderer': 'registered-raster-volumes-v1', 'projectionId': plan['projectionId'],
    'base': old['base'], 'ground': ground_image(), 'compounds': compounds, 'landmarks': old['landmarks'], 'frontages': [],
    'sourceStatus': plan['sourceNotice'], 'spatialPlan': '../reference/xinhua-spatial-plan.json'}
registration['revision'] = 'overview-registration-r6'
registration['sourceNotice'] = plan['sourceNotice']
# Retire only superseded R5 compound/frontage assets. Shared ground and unchanged
# landmarks stay in the product; no trial or alternate atlas is retained.
used = {old['base']['assetRef'], *(l['assetRef'] for l in old['landmarks'])}
for key, value in list(manifest['moduleAssets'].items()):
    if value.get('revision') == 'xinhua-painted-r5' and key not in used:
        file = (ROOT / 'content/public' / value['url']).resolve()
        file.unlink(missing_ok=True)
        del manifest['moduleAssets'][key]
manifest['revision'] = 'xinhua-wax-r6'
manifest['id'] = 'fengtai-journal-xinhua-r6'
write(registry_path, registration)
write(manifest_path, manifest)
print('Selected registered raster assets built:', len(plan['objects']), 'masses / 3 detail levels')
