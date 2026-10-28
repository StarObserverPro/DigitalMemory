/** Lazy, bounded walkability cache. A* stores only nodes explored by this query. */
export function createNavigationGrid({ bounds, isWalkable, clear, edgeClear = clear,
  maxCachedCells = 32768, maxCachedEdges = 16384,
  maxSearchNodes = 50000, maxNearestChecks = 32768 } = {}) {
  const cols = Math.ceil(bounds.maxX - bounds.minX) + 1, rows = Math.ceil(bounds.maxZ - bounds.minZ) + 1;
  if (![bounds.minX,bounds.maxX,bounds.minZ,bounds.maxZ].every(Number.isFinite) || cols < 1 || rows < 1 || !Number.isSafeInteger(cols*rows)) throw new Error('Invalid navigation bounds');
  if (![maxCachedCells,maxCachedEdges].every(n=>Number.isInteger(n)&&n>=0)) throw new Error('Invalid navigation cache budget');
  if (![maxSearchNodes,maxNearestChecks].every(n=>Number.isInteger(n)&&n>0)) throw new Error('Invalid navigation search budget');
  const cellCache = new Map(), edgeCache = new Map();
  let disposed = false, evaluatedCells = 0, lastSearchNodes = 0, lastNearestChecks = 0;
  let lastSearchBudgetExceeded = false, lastNearestBudgetExceeded = false;
  const pos = id => [bounds.minX + id % cols, bounds.minZ + Math.floor(id / cols)];
  const cache = (map, key, create, limit) => {
    if (map.has(key)) { const value = map.get(key); map.delete(key); map.set(key, value); return value; }
    const value = create(); map.set(key, value);
    if (map.size > limit) map.delete(map.keys().next().value);
    return value;
  };
  function cell(id) {
    if (disposed || id < 0 || id >= cols * rows) return false;
    return cache(cellCache, id, () => { evaluatedCells++; return isWalkable(pos(id)); }, maxCachedCells);
  }
  function edge(a, b) {
    const key = a < b ? `${a}:${b}` : `${b}:${a}`;
    return cache(edgeCache, key, () => edgeClear(pos(a), pos(b)), maxCachedEdges);
  }

  function closestId(point, max = Infinity) {
    lastNearestChecks = 0; lastNearestBudgetExceeded = false;
    if (disposed || !point?.every(Number.isFinite) || !(max >= 0)) return -1;
    const cx = Math.max(0, Math.min(cols - 1, Math.round(point[0] - bounds.minX)));
    const cy = Math.max(0, Math.min(rows - 1, Math.round(point[1] - bounds.minZ)));
    let best = -1, distance = max * max;
    const check = (x, y) => {
      if (lastNearestChecks >= maxNearestChecks) { lastNearestBudgetExceeded = true; return; }
      lastNearestChecks++;
      const d = (bounds.minX + x - point[0]) ** 2 + (bounds.minZ + y - point[1]) ** 2;
      const id = y * cols + x;
      if ((d < distance || (best >= 0 && d === distance && id < best)) && cell(id)) { best = id; distance = d; }
    };
    const limit = Math.max(cx, cy, cols - 1 - cx, rows - 1 - cy);
    for (let r = 0; r <= limit; r++) {
      const x0 = Math.max(0, cx - r), x1 = Math.min(cols - 1, cx + r);
      const y0 = Math.max(0, cy - r), y1 = Math.min(rows - 1, cy + r);
      if (!r) check(cx, cy);
      else {
        if (cy - r >= 0) for (let x = x0; x <= x1 && !lastNearestBudgetExceeded; x++) check(x, cy - r);
        if (cy + r < rows) for (let x = x0; x <= x1 && !lastNearestBudgetExceeded; x++) check(x, cy + r);
        if (cx - r >= 0) for (let y = y0; y <= y1 && !lastNearestBudgetExceeded; y++) if (y !== cy-r && y !== cy+r) check(cx-r, y);
        if (cx + r < cols) for (let y = y0; y <= y1 && !lastNearestBudgetExceeded; y++) if (y !== cy-r && y !== cy+r) check(cx+r, y);
      }
      // A partial ring cannot prove the nearest result. Let the caller retry locally.
      if (lastNearestBudgetExceeded) return -1;
      // Lower bound to every not-yet-visited strip, including queries outside the map.
      const axisDistance=(v,min,max)=>Math.max(min-v,0,v-max);
      const boxDistance=(left,right,top,bottom)=>axisDistance(point[0],bounds.minX+left,bounds.minX+right)**2+axisDistance(point[1],bounds.minZ+top,bounds.minZ+bottom)**2;
      const remaining = [];
      if (x0 > 0) remaining.push(boxDistance(0,x0-1,0,rows-1));
      if (x1 < cols-1) remaining.push(boxDistance(x1+1,cols-1,0,rows-1));
      if (y0 > 0) remaining.push(boxDistance(0,cols-1,0,y0-1));
      if (y1 < rows-1) remaining.push(boxDistance(0,cols-1,y1+1,rows-1));
      if (!remaining.length || Math.min(...remaining) > distance) break;
    }
    return best;
  }

  function route(from, to, maxSnap = 8) {
    if (disposed) return null;
    lastSearchNodes = 0; lastSearchBudgetExceeded = false;
    const start = closestId(from, 4);
    if (start < 0) return null;
    const end = closestId(to, maxSnap);
    if (start < 0 || end < 0) return null;
    if (start === end) return [pos(end)];
    const cost = new Map([[start, 0]]), previous = new Map(), closed = new Set(), heap = [];
    const target = pos(end), heuristic = id => Math.hypot(pos(id)[0]-target[0], pos(id)[1]-target[1]);
    function push(id, f) {
      let i = heap.length; heap.push({ id, f });
      while (i) { const parent = (i-1)>>1; if (heap[parent].f <= f) break; heap[i]=heap[parent]; i=parent; }
      heap[i]={id,f};
    }
    function pop() {
      const first=heap[0],last=heap.pop();
      if(heap.length){let i=0;while(i*2+1<heap.length){let j=i*2+1;if(j+1<heap.length&&heap[j+1].f<heap[j].f)j++;if(heap[j].f>=last.f)break;heap[i]=heap[j];i=j;}heap[i]=last;}
      return first.id;
    }
    push(start, heuristic(start));
    while (heap.length) {
      const id = pop(); if (closed.has(id)) continue;
      if (id === end) {
        const path=[]; let at=end;
        while(at !== undefined){path.push(pos(at));at=previous.get(at);}path.reverse();
        const out=[path[0]];
        // Test longer segments exponentially, then refine the last successful span.
        // Rechecking every growing prefix would be quadratic on a long straight road.
        for(let i=1;i<path.length;){
          let k=i,step=1,failed=path.length;
          while(k<path.length-1){const candidate=Math.min(path.length-1,i+step);if(!clear(out.at(-1),path[candidate])){failed=candidate;break;}k=candidate;step*=2;}
          let lo=k+1,hi=failed-1;
          while(lo<=hi){const mid=Math.floor((lo+hi)/2);if(clear(out.at(-1),path[mid])){k=mid;lo=mid+1;}else hi=mid-1;}
          out.push(path[k]);i=k+1;
        }
        return out;
      }
      if (closed.size >= maxSearchNodes) { lastSearchBudgetExceeded = true; return null; }
      closed.add(id); lastSearchNodes=closed.size;
      const x=id%cols,y=Math.floor(id/cols);
      for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]){
        const xx=x+dx,yy=y+dy;if(xx<0||xx>=cols||yy<0||yy>=rows)continue;
        const next=yy*cols+xx;
        if(closed.has(next)||!cell(next))continue;
        if(dx&&dy&&(!cell(y*cols+xx)||!cell(yy*cols+x)))continue;
        if(!edge(id,next))continue;
        const nextCost=cost.get(id)+(dx&&dy?Math.SQRT2:1);
        if(nextCost<(cost.get(next)??Infinity)){cost.set(next,nextCost);previous.set(next,id);push(next,nextCost+heuristic(next));}
      }
    }
    return null;
  }

  return { route, closest: point => { const id=closestId(point);return id<0?null:pos(id); },
    get cellCount(){ return [...cellCache.values()].filter(Boolean).length; },
    stats: () => ({ logicalCells: cols*rows, cachedCells: cellCache.size, cachedEdges: edgeCache.size,
      evaluatedCells, lastSearchNodes, lastNearestChecks, lastSearchBudgetExceeded, lastNearestBudgetExceeded,
      maxCachedCells, maxCachedEdges, maxSearchNodes, maxNearestChecks, disposed }),
    dispose(){ if(disposed)return;disposed=true;cellCache.clear();edgeCache.clear(); },
  };
}
