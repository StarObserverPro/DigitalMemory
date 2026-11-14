const validId = value => typeof value === 'string' && /^[a-zA-Z0-9][a-zA-Z0-9_-]{0,127}$/.test(value);
const cancelled = () => new DOMException('Private request is no longer current.', 'AbortError');

/** Same-origin session cookies only. No Drive IDs, OAuth tokens or persistent cache. */
export class PrivateRepository {
  constructor(baseURL, { fetcher = fetch, origin = globalThis.location?.origin, urls = URL, clock = Date.now } = {}) {
    this.baseURL = new URL(baseURL); this.fetcher = fetcher; this.urls = urls; this.clock = clock;
    if (this.baseURL.origin !== origin || this.baseURL.pathname !== '/api/private/' || this.baseURL.search || this.baseURL.hash || this.baseURL.username || this.baseURL.password) throw Error('Same-origin private API required');
    this.lockListeners = new Set(); this.epoch = 0; this.pending = new Set(); this.objectURLs = new Set(); this.manifest = null; this.expiresAt = 0; this.disposed = false; this.expiryTimer = null;
  }
  subscribeLock(listener) { this.lockListeners.add(listener); return () => this.lockListeners.delete(listener); }
  lock() {
    this.epoch++; clearTimeout(this.expiryTimer); this.expiryTimer = null;
    this.manifest = null; this.expiresAt = 0;
    for (const controller of this.pending) controller.abort(); this.pending.clear();
    for (const url of this.objectURLs) this.urls.revokeObjectURL(url); this.objectURLs.clear();
    for (const listener of this.lockListeners) listener();
  }
  check(epoch, signal) { if (this.disposed || epoch !== this.epoch || signal?.aborted) throw cancelled(); }
  async request(path, { signal, binary = false, initializing = false } = {}) {
    if (this.disposed || (!initializing && (!this.manifest || this.expiresAt <= this.clock()))) { this.lock(); throw Error('Private archive is locked'); }
    const epoch = this.epoch, controller = new AbortController();
    const abort = () => controller.abort(); signal?.addEventListener('abort', abort, { once: true });
    if (signal?.aborted) controller.abort(); this.pending.add(controller);
    try {
      this.check(epoch, controller.signal);
      const headers = !initializing && this.manifest ? { 'X-DigitalMemory-Revision': `${this.manifest.releaseId}:${this.manifest.revision}` } : {};
      const url = new URL(path, this.baseURL);
      if (url.origin !== this.baseURL.origin || !url.pathname.startsWith('/api/private/')) throw Error('Private endpoint boundary rejected');
      const response = await this.fetcher(url, { credentials: 'same-origin', cache: 'no-store', redirect: 'error', headers, signal: controller.signal });
      this.check(epoch, controller.signal);
      if (!response.ok) {
        if ([401,403,409].includes(response.status)) this.lock();
        throw Error('Private content unavailable');
      }
      if (binary && !['image/png','image/jpeg','image/webp'].includes(response.headers.get('content-type')?.split(';')[0])) throw Error('Invalid display image');
      const value = binary ? await response.blob() : await response.json();
      this.check(epoch, controller.signal);
      if (!initializing && this.expiresAt <= this.clock()) { this.lock(); throw cancelled(); }
      return value;
    } finally { this.pending.delete(controller); signal?.removeEventListener('abort', abort); }
  }
  async unlock({ geometryRevision, transformRevision, signal } = {}) {
    this.lock(); const epoch = this.epoch;
    try {
      const session = await this.request('session', { signal, initializing: true });
      this.check(epoch, signal);
      if (session.authenticated !== true || !Number.isFinite(session.expiresAt) || session.expiresAt <= this.clock()) throw Error('Authorization required');
      const manifest = await this.request('manifest', { signal, initializing: true });
      this.check(epoch, signal);
      if (manifest.schemaVersion !== 1 || manifest.privacy !== 'private' || !validId(manifest.releaseId) || typeof manifest.revision !== 'string' || manifest.geometryRevision !== geometryRevision || manifest.transformRevision !== transformRevision) throw Error('Private registration incompatible');
      if (session.expiresAt <= this.clock()) throw Error('Authorization expired');
      this.manifest = manifest; this.expiresAt = session.expiresAt;
      const delay = Math.min(2147483647, Math.max(0, this.expiresAt - this.clock()));
      this.expiryTimer = setTimeout(() => this.lock(), delay); this.expiryTimer.unref?.();
      return structuredClone(manifest);
    } catch (error) { if (epoch === this.epoch) this.lock(); throw error; }
  }
  attachments({ routeId, offset = 0, limit = 50, signal } = {}) {
    if (!validId(routeId) || !Number.isSafeInteger(offset) || offset < 0 || !Number.isSafeInteger(limit) || limit < 1 || limit > 100) throw Error('Invalid attachment query');
    return this.request(`attachments?${new URLSearchParams({ routeId, offset, limit })}`, { signal });
  }
  memory(memoryId, options = {}) { if (!validId(memoryId)) throw Error('Invalid memory ID'); return this.request(`memories/${memoryId}`, options); }
  async media(assetId, options = {}) {
    if (!validId(assetId)) throw Error('Invalid asset ID');
    const epoch = this.epoch, blob = await this.request(`media/${assetId}`, { ...options, binary: true });
    this.check(epoch, options.signal);
    const url = this.urls.createObjectURL(blob); this.objectURLs.add(url);
    if (this.objectURLs.size > 32) this.releaseMedia(this.objectURLs.values().next().value);
    return url;
  }
  releaseMedia(url) { if (this.objectURLs.delete(url)) this.urls.revokeObjectURL(url); }
  inspect() { return { unlocked: !!this.manifest && this.expiresAt > this.clock(), inFlight: this.pending.size, objectURLs: this.objectURLs.size }; }
  dispose() { if (!this.disposed) { this.lock(); this.lockListeners.clear(); this.disposed = true; } }
}
