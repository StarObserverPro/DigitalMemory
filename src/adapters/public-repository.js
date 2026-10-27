import { relateTime } from '../domain/temporal.js';
/** Public demo adapter only. Private storage/auth can implement the same interface. */
export class PublicRepository {
  constructor(baseURL, fetcher = fetch) { this.baseURL = baseURL; this.fetcher = (...args) => fetcher(...args); this.cache = new Map(); }
  async read(path) {
    const url = new URL(path, this.baseURL).href;
    if (new URL(url).origin !== new URL(this.baseURL).origin) throw new Error('Public records must be same-origin');
    if (this.cache.has(url)) return structuredClone(this.cache.get(url));
    const response = await this.fetcher(url);
    if (!response.ok) throw new Error('资料暂时无法载入，请重试。');
    const value = await response.json();
    if (value.privacy !== 'public') throw new Error('Non-public data rejected');
    this.cache.set(url, value);
    return structuredClone(value);
  }
  async init() { this.manifest = await this.read('manifest.json'); return this.manifest; }
  async places() { return (await this.read(this.manifest.places)).records; }
  async memories({ placeIds, period, includeDemo = false, offset = 0, limit = 20 }) {
    const chunks = this.manifest.memoryChunks.filter(c => c.placeIds.some(id => placeIds.includes(id)));
    const records = (await Promise.all(chunks.map(c => this.read(c.path)))).flatMap(c => c.records);
    const rows = records.filter(m => m.placeIds.some(id => placeIds.includes(id)) && (includeDemo || !m.synthetic)).map(m => ({ ...m, timeRelation: relateTime(m.time, period) }));
    return { records: rows.slice(offset, offset + limit), total: rows.length, nextOffset: offset + limit < rows.length ? offset + limit : null };
  }
  async loadOutline() {
    const registration=await this.read(this.manifest.outlineScene);
    const url=new URL(registration.data,this.baseURL);
    if(url.origin!==new URL(this.baseURL).origin)throw Error('Outline data must be same-origin');
    const response=await this.fetcher(url.href);if(!response.ok)throw Error('Outline data unavailable');
    const bytes=await response.arrayBuffer();
    const hash=[...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))].map(v=>v.toString(16).padStart(2,'0')).join('');
    if(hash!==registration.sha256)throw Error('Outline checksum mismatch');
    const data=JSON.parse(new TextDecoder().decode(bytes));
    if(data.privacy!=='public'||data.revision!==registration.dataRevision||data.artRevision!==registration.artRevision)throw Error('Outline revision mismatch');
    return {registration,data};
  }
  async loadScene(id) {
    const path = this.manifest.scenes[id];
    if (!path) throw new Error('这个入口还没有场景。');
    return this.read(path);
  }
}
