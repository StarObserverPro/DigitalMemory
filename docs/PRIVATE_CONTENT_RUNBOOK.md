# Private content operations

This runbook owns deployment and archive operations, not a second architecture. [ARCHITECTURE](ARCHITECTURE.md#dual-source-mount) owns boundaries; [DATA_MODEL](DATA_MODEL.md#private-release-v1) owns the executable schema; [CONTENT_PIPELINE](CONTENT_PIPELINE.md) owns approval. No real archive IDs, account identities or credentials belong here.

## Current delivery boundary

The repository contains executable client/server seams and synthetic checks. The static explorer still uses `PublicRepository`; the new private mount is **not wired into `main.js` or a street reader**. There is no deployed private API, password/OIDC login, Google token provider, real-content ingestion, automatic watcher or production authorization. A private folder and draft/empty registry are operational scaffolding, not a working authenticated production archive.

## Archive layout

```text
DigitalMemory-Vault/
  registry/          release.json, pinned attachment JSON
  memoirs/           versioned note JSON; drafts are never implicitly released
  media/original/    originals; not readable by the runtime identity
  media/display/     selected PNG/JPEG/WebP derivatives
  revisions/         approved snapshots and restore records
  operations/        private IDs/configuration; no secrets
```

Actual IDs are retained only in private operations configuration and server deployment secrets/configuration. The browser knows only same-origin `/api/private/`; the GitHub repository knows the provider contract, not the installation's root folder. Drive sharing remains restricted; do not enable anyone-with-link or domain-wide sharing.

## Production activation gate

1. Choose a same-origin HTTPS deployment with server functions or a same-origin reverse proxy. The current static `dist` hosting does not execute `server/`. Do not place handlers or credentials in `dist` as a workaround.
2. Provision a dedicated Google runtime identity and token provider using Google's maintained auth library/ADC. Grant read-only access to **registry, memoirs and media/display**, not the Vault root, operations, originals or unrelated Drive files. No domain-wide delegation is needed for a dedicated shared archive.
3. Independently deploy verified website sessions. `authorize(request)` must verify signature/issuer/audience or an opaque server-side session, expiration and revocation, and return `{subject, releaseIds, expiresAt}` with milliseconds since epoch. Never trust browser-provided identity headers or a client `unlocked` flag. Login cookies should be HttpOnly/Secure with appropriate SameSite; logout must revoke the server session. Password login needs hashing, anti-bruteforce limits and CSRF protection; no hand-written demo password gate is supplied.
4. Build `DriveContentStore` from private configuration; create the handler with an exact public origin and `enabled: true` only in the intended protected environment. Preview/CI/local static deployments remain disabled. Service credentials are not injected into browser-visible variables.
5. Integrate `PrivateRepository` and `createContentMount` with an actual street reader. Mount only after verified login; register `onClear` to remove DOM text, thumbnails and private selection state; render strings as text, not raw HTML. Keep private anchors out of the public spatial registry, persisted browsing session and diagnostics. Attachments do not automatically teleport or change the selected historical environment.
6. Validate anonymous/unauthorized reads, media-ID substitution, revoked/expired sessions, stale loads, logout across tabs and back/forward cache, map-version mismatch, dependency hashes, correct street approach/return, and an actual authorized production read. Only then activate an approved release. Never use a successful Drive connector read as proof of website authorization.

## Release operations

The v1 reader supports approved note records with selected display images. A draft release fails closed. Upload immutable dependency files first, compute their SHA-256, then change the small release file with a new `revision`; the client pins `releaseId:revision` on subsequent requests. A mismatch returns 409, locks the private mount and requires a fresh authorized mount. Revising geography requires explicit remapping; never silently snap to a nearest place/year.

`DriveContentStore` reads exact file IDs, verifies direct parent/MIME/trashed state, rejects shortcuts, caps JSON at 2 MiB and media at 12 MiB, and verifies pinned dependency hashes. v1 uses raw `application/json`; Google Docs can remain authoring inputs but must be converted into reviewed JSON before release. Subfolders need an explicit future contract, not recursive folder crawling.

The API reloads the small release and attachment package as needed; it does not scan Drive or pretend Drive supplies spatial queries. Attachments are filtered/paginated server-side by `routeId`. The 2 MiB/10,000-record package bounds are explicit v1 limits. Later route shards must preserve IDs, per-scope authorization and immutable revision closure.

All private responses, including errors and images, use no-store headers; configure the hosting CDN/image optimizer/service worker not to cache them. Logs must not record private response bodies, Drive IDs, precise positions, user narratives or bearer tokens. Client `lock()` is local cleanup, not server-session revocation or erasure of copies an authorized reader has saved.

Back up records and assets outside the same mutable working set; restore into a clean private instance and verify hashes/relationships. Withdrawal removes authorized release references and server/client caches under operator control; do not promise to erase third-party copies or existing public Git history.

## Provider references

- [Google Drive file reads](https://developers.google.com/workspace/drive/api/reference/rest/v3/files/get)
- [Download versus native-document export](https://developers.google.com/workspace/drive/api/guides/manage-downloads)
- [Drive sharing and permission inheritance](https://developers.google.com/workspace/drive/api/guides/manage-sharing)
- [Server-to-server authorization](https://developers.google.com/identity/protocols/oauth2/service-account)

These are generic implementation references, not geographic research records.
