import { createHash } from 'node:crypto';
import { CONTENT_LIMIT, MEDIA_LIMIT, id } from './private-content.mjs';

/** Server only. Token acquisition belongs to the deployment's Google auth library. */
export class DriveContentStore {
  constructor({ getAccessToken, registryFolderId, memoirsFolderId, displayFolderId, releaseFileId, fetcher = fetch }) {
    if (typeof getAccessToken !== 'function') throw Error('Server token provider required');
    Object.assign(this, { getAccessToken, registryFolderId: id(registryFolderId), memoirsFolderId: id(memoirsFolderId), displayFolderId: id(displayFolderId), releaseFileId: id(releaseFileId), fetcher });
  }
  async request(fileId, params, signal) {
    signal?.throwIfAborted();
    const token = await this.getAccessToken();
    signal?.throwIfAborted();
    if (typeof token !== 'string' || !token || /[\r\n]/.test(token)) throw Error('Drive unavailable');
    const url = new URL(`https://www.googleapis.com/drive/v3/files/${id(fileId)}`);
    for (const [key, value] of Object.entries({ supportsAllDrives: 'true', ...params })) url.searchParams.set(key, value);
    return this.fetcher(url, { headers: { Authorization: `Bearer ${token}` }, signal, redirect: 'error', cache: 'no-store' });
  }
  async read(file, parent, mime, limit, requestSignal) {
    const signal = requestSignal ? AbortSignal.any([requestSignal, AbortSignal.timeout(15000)]) : AbortSignal.timeout(15000);
    const metaResponse = await this.request(file.fileId, { fields: 'id,mimeType,parents,trashed,size' }, signal);
    if (!metaResponse.ok) throw Error('Drive unavailable');
    const meta = JSON.parse(new TextDecoder().decode(await limitedBytes(metaResponse, 16384)));
    // Direct parent checking disallows shortcuts and accidental original-folder reads.
    if (meta.id !== file.fileId || meta.trashed || meta.mimeType !== mime || (!Array.isArray(meta.parents) || !meta.parents.includes(parent)) || Number(meta.size) > limit) throw Error('Archive boundary rejected');
    const response = await this.request(file.fileId, { alt: 'media' }, signal);
    if (!response.ok) throw Error('Drive unavailable');
    const bytes = await limitedBytes(response, limit);
    if (file.sha256 && createHash('sha256').update(bytes).digest('hex') !== file.sha256) throw Error('Archive revision mismatch');
    return bytes;
  }
  async json(file, parent, signal) { return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(await this.read(file, parent, 'application/json', CONTENT_LIMIT, signal))); }
  loadRelease(signal) { return this.json({ fileId: this.releaseFileId }, this.registryFolderId, signal); }
  loadAttachments(release, signal) { return this.json(release.attachments, this.registryFolderId, signal); }
  loadMemory(ref, signal) { return this.json(ref, this.memoirsFolderId, signal); }
  loadMedia(ref, signal) { return this.read(ref, this.displayFolderId, ref.mimeType, MEDIA_LIMIT, signal); }
}
export async function limitedBytes(response, limit) {
  if (Number(response.headers.get('content-length')) > limit) throw Error('Payload too large');
  if (!response.body) return new Uint8Array();
  const reader = response.body.getReader(); const chunks = []; let total = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read(); if (done) break;
      total += value.byteLength;
      if (total > limit) { await reader.cancel(); throw Error('Payload too large'); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const bytes = new Uint8Array(total); let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  return bytes;
}
