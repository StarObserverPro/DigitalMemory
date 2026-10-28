import { relateTime } from '../domain/temporal.js';

const cancelled = () => new DOMException('The public data request is no longer current.', 'AbortError');

/** Public data only. Cached decoded records have an LRU count/encoded-byte budget. */
export class PublicRepository {
  constructor(baseURL, fetcher = fetch, { maxEntries = 24, maxBytes = 8 * 1024 * 1024 } = {}) {
    this.baseURL = baseURL;
    this.fetcher = (...args) => fetcher(...args);
    this.cache = new Map();
    this.inFlight = new Map();
    this.maxEntries = Number.isFinite(maxEntries) ? Math.max(0, Math.floor(maxEntries)) : 24;
    this.maxBytes = Number.isFinite(maxBytes) ? Math.max(0, maxBytes) : 8 * 1024 * 1024;
    this.cachedBytes = 0;
    this.epoch = 0;
    this.disposed = false;
  }

  url(path) {
    const url = new URL(path, this.baseURL);
    if (url.origin !== new URL(this.baseURL).origin) throw new Error('Public records must be same-origin');
    return url.href;
  }

  check(epoch, signal) {
    if (this.disposed || epoch !== this.epoch || signal?.aborted) throw cancelled();
  }

  remember(key, value) {
    const bytes = new TextEncoder().encode(JSON.stringify(value)).byteLength;
    if (!this.maxEntries || bytes > this.maxBytes) return;
    const old = this.cache.get(key);
    if (old) { this.cachedBytes -= old.bytes; this.cache.delete(key); }
    this.cache.set(key, { value, bytes });
    this.cachedBytes += bytes;
    while (this.cache.size > this.maxEntries || this.cachedBytes > this.maxBytes) {
      const oldest = this.cache.keys().next().value;
      this.cachedBytes -= this.cache.get(oldest).bytes;
      this.cache.delete(oldest);
    }
  }

  consume(promise, signal, epoch) {
    if (signal?.aborted) return Promise.reject(cancelled());
    return new Promise((resolve, reject) => {
      let settled = false;
      const finish = (fn, value) => {
        if (settled) return;
        settled = true;
        signal?.removeEventListener('abort', abort);
        fn(value);
      };
      const abort = () => finish(reject, cancelled());
      signal?.addEventListener('abort', abort, { once: true });
      promise.then(value => {
        try { this.check(epoch, signal); finish(resolve, structuredClone(value)); }
        catch (error) { finish(reject, error); }
      }, error => finish(reject, error));
    });
  }

  request(key, loader, { signal } = {}) {
    const epoch = this.epoch;
    try { this.check(epoch, signal); }
    catch (error) { return Promise.reject(error); }
    const cached = this.cache.get(key);
    if (cached) {
      this.cache.delete(key);
      this.cache.set(key, cached);
      return this.consume(Promise.resolve(cached.value), signal, epoch);
    }
    let pending = this.inFlight.get(key);
    if (!pending) {
      pending = { controller: new AbortController(), promise: null };
      const entry = pending;
      pending.promise = Promise.resolve().then(() => {
        this.check(epoch, entry.controller.signal);
        return loader(entry.controller.signal, epoch);
      }).then(value => {
        this.check(epoch, entry.controller.signal);
        this.remember(key, value);
        return value;
      }).finally(() => {
        if (this.inFlight.get(key) === entry) this.inFlight.delete(key);
      });
      this.inFlight.set(key, pending);
    }
    // Cancelling a view detaches that consumer; another view may share the fetch.
    // Invalidation aborts the underlying request and rejects even a late response.
    return this.consume(pending.promise, signal, epoch);
  }

  async read(path, options) {
    const url = this.url(path);
    return this.request(url, async (signal, epoch) => {
      const response = await this.fetcher(url, { signal });
      this.check(epoch, signal);
      if (!response.ok) throw new Error('资料暂时无法载入，请重试。');
      const value = await response.json();
      if (value.privacy !== 'public') throw new Error('Non-public data rejected');
      return value;
    }, options);
  }

  async init({ refresh = false } = {}) {
    if (refresh) this.invalidate();
    this.manifest = await this.read('manifest.json');
    return this.manifest;
  }

  async places() { return (await this.read(this.manifest.places)).records; }

  async memories({ placeIds, period, includeDemo = false, offset = 0, limit = 20 }) {
    const chunks = this.manifest.memoryChunks.filter(c => c.placeIds.some(id => placeIds.includes(id)));
    const records = (await Promise.all(chunks.map(c => this.read(c.path)))).flatMap(c => c.records);
    const rows = records.filter(m => m.placeIds.some(id => placeIds.includes(id)) && (includeDemo || !m.synthetic)).map(m => ({ ...m, timeRelation: relateTime(m.time, period) }));
    return { records: rows.slice(offset, offset + limit), total: rows.length, nextOffset: offset + limit < rows.length ? offset + limit : null };
  }

  async loadOutline(options) {
    const path = this.manifest.outlineScene;
    return this.request(`outline:${this.url(path)}`, async (signal, epoch) => {
      const registration = await this.read(path, { signal });
      const response = await this.fetcher(this.url(registration.data), { signal });
      this.check(epoch, signal);
      if (!response.ok) throw Error('Outline data unavailable');
      const bytes = await response.arrayBuffer();
      this.check(epoch, signal);
      const hash = [...new Uint8Array(await crypto.subtle.digest('SHA-256', bytes))].map(v => v.toString(16).padStart(2, '0')).join('');
      this.check(epoch, signal);
      if (hash !== registration.sha256) throw Error('Outline checksum mismatch');
      const data = JSON.parse(new TextDecoder().decode(bytes));
      if (data.privacy !== 'public' || data.revision !== registration.dataRevision || data.artRevision !== registration.artRevision) throw Error('Outline revision mismatch');
      return { registration, data };
    }, options);
  }

  async loadScene(id, options) {
    const path = this.manifest.scenes[id];
    if (!path) throw new Error('这个入口还没有场景。');
    return this.read(path, options);
  }

  invalidate() {
    this.epoch++;
    for (const { controller } of this.inFlight.values()) controller.abort();
    this.inFlight.clear();
    this.cache.clear();
    this.cachedBytes = 0;
  }

  inspect() {
    return { epoch: this.epoch, cachedEntries: this.cache.size, cachedEncodedBytes: this.cachedBytes, inFlight: this.inFlight.size, maxEntries: this.maxEntries, maxEncodedBytes: this.maxBytes };
  }

  dispose() { if (!this.disposed) { this.invalidate(); this.disposed = true; } }
}
