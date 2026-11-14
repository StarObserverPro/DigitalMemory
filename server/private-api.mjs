import { releaseRecord, attachmentRecords, memoryRecord, id, MEDIA_LIMIT } from './private-content.mjs';

const HEADERS = { 'Cache-Control': 'private, no-store, max-age=0', 'Vary': 'Cookie, Authorization, Origin', 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer' };
const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...HEADERS, 'Content-Type': 'application/json; charset=utf-8' } });
const problem = status => json({ error: status === 401 ? 'authorization_required' : status === 409 ? 'revision_changed' : 'private_content_unavailable' }, status);

/** authorize must verify the session on every call; default configuration denies all. */
export function createPrivateApi({ authorize, store, publicOrigin, enabled = false, clock = Date.now } = {}) {
  const origin = publicOrigin ? new URL(publicOrigin).origin : null;
  return async request => {
    if (!enabled || !store || !origin || typeof authorize !== 'function') return problem(503);
    const url = new URL(request.url);
    if (url.origin !== origin || (request.headers.has('Origin') && request.headers.get('Origin') !== origin) || request.headers.get('Sec-Fetch-Site') === 'cross-site') return problem(403);
    if (request.method !== 'GET') return problem(405);
    let principal;
    try { principal = await authorize(request); } catch { return problem(401); }
    if (!principal || typeof principal.subject !== 'string' || !principal.subject || !Array.isArray(principal.releaseIds) || !Number.isFinite(principal.expiresAt) || principal.expiresAt <= clock()) return problem(401);
    if (url.pathname === '/api/private/session') return json({ authenticated: true, expiresAt: principal.expiresAt });
    if (!['/api/private/manifest','/api/private/attachments'].includes(url.pathname) && !/^\/api\/private\/(memories|media)\/[a-zA-Z0-9][a-zA-Z0-9_-]{0,127}$/.test(url.pathname)) return problem(404);
    try {
      const release = releaseRecord(await store.loadRelease(request.signal));
      if (!principal.releaseIds.includes(release.releaseId)) return problem(404);
      const expected = request.headers.get('X-DigitalMemory-Revision');
      if (url.pathname !== '/api/private/manifest' && expected !== `${release.releaseId}:${release.revision}`) return problem(409);
      if (principal.expiresAt <= clock()) return problem(401);
      if (url.pathname === '/api/private/manifest') return json({ schemaVersion: 1, privacy: 'private', releaseId: release.releaseId, revision: release.revision, geometryRevision: release.geometryRevision, transformRevision: release.transformRevision, capabilities: ['note','display-image'] });
      if (url.pathname === '/api/private/attachments') {
        const routeId = id(url.searchParams.get('routeId'));
        const offset = Number(url.searchParams.get('offset') || 0), limit = Number(url.searchParams.get('limit') || 50);
        if (!Number.isSafeInteger(offset) || offset < 0 || !Number.isSafeInteger(limit) || limit < 1 || limit > 100) return problem(400);
        const rows = attachmentRecords(await store.loadAttachments(release, request.signal), release).filter(row => row.routeId === routeId);
        if (principal.expiresAt <= clock()) return problem(401);
        return json({ records: rows.slice(offset, offset + limit), nextOffset: offset + limit < rows.length ? offset + limit : null });
      }
      const [, , , kind, key] = url.pathname.split('/');
      const ref = release[kind === 'memories' ? 'memories' : 'media'].find(row => row.id === key);
      if (!ref) return problem(404);
      if (kind === 'memories') {
        const memory = memoryRecord(await store.loadMemory(ref, request.signal), key, release);
        if (principal.expiresAt <= clock()) return problem(401);
        return json(memory);
      }
      const bytes = await store.loadMedia(ref, request.signal);
      if (principal.expiresAt <= clock()) return problem(401);
      if (!(bytes instanceof Uint8Array) || bytes.byteLength > MEDIA_LIMIT) return problem(502);
      return new Response(bytes, { headers: { ...HEADERS, 'Content-Type': ref.mimeType, 'Content-Length': String(bytes.byteLength), 'Content-Security-Policy': "default-src 'none'; sandbox" } });
    } catch { return problem(503); }
  };
}
