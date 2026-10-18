# Recollection intake, editing, review and publication

Status: authoring contract; no personal-content archive is connected or implemented.

## Preserve input before interpretation

Accept free-form text, audio and photographs in batches. Save the original privately with source ID, checksum and recording metadata. Attach the current location, period and view as suggestions, not unquestionable truth: the user may describe a different place or jump between decades during one input.

Extract coherent fragments and source-supported statements. Keep source spans/crops so a reviewer can see why a word, place, period, or reconstruction parameter was proposed. An extraction model's confidence is neither historical verification nor the user's approval.

Unresolved place/date associations enter a private review queue. Repeated inputs can be related or merged for display after review, without discarding their distinct originals. Contradictions and corrections remain visible in authoring history. The system must not require the user to complete a metadata form before a recollection can be retained.

## Three textual layers

**Original:** the user's words or faithful transcript, with any transcription uncertainty preserved.

**Organized record:** concise statements, associations and optional summaries supported by source spans. Structure can be rearranged; substantive meaning cannot be expanded.

**Display passage:** an edited, readable version attached to a place, route or scene. It may improve rhythm, remove repetition, and combine equivalent phrases, but each substantive claim must remain supported by the original or be explicitly labeled external context, never written as the user's recollection.

Editorial illustration only, not a real memory record:

> Input: 我经常从那儿过，买一样的烧饼。  
> Permitted edit: 我常从这里经过，买同样的烧饼。

Do not add “放学后”, “每天”, “热乎乎”, a friendly shopkeeper, a price, an emotion, or a smell unless the user actually supplied it. Do not convert “好像”, “大概”, or a life-stage phrase into a definite fact or exact date. Even a plausible detail is a new substantive claim.

A reconstruction can use generic visual completion such as a representative room layout; the image must be marked reconstructed, and that completion must not migrate into the display passage as remembered fact.

## A batch is the unit of conversation, not a monolithic content object

One user session can create many fragments. A batch manifest groups the proposed place/period associations, edited text revisions and visual proposals so they can be reviewed together. Individual fragments and assets retain their own IDs and revision histories.

Use paginated queues, aliases, route-based retrieval, source links and duplicate suggestions for the expected volume of hundreds of fragments per month. An Agent loads only the current batch, affected places/periods and necessary evidence; it does not reread every previous transcript. Multiple batches can proceed independently when their revision/asset dependencies do not conflict.

## Review dimensions

| Dimension | Question | Consequence |
| --- | --- | --- |
| Wording | Does this preserve what was said, including uncertainty? | Allows the selected text revision to be displayed privately |
| Registration | Is this the intended place, entrance, route side, and period association? | Allows that spatial/time association to become active |
| Appearance | Does this visual version serve the remembered atmosphere? | Allows the selected scene/asset revision |
| Evidence | Which individual assertions are supported, inferred, disputed, or unknown? | Updates claim metadata; not implied by overall likeness |
| Publication | Which audience may see this exact content and these derivatives? | Allows only the selected public/shared/private release scope |

Approval may be per item or an explicitly defined batch. Do not equate “this looks right” with confirmation of every detail. Do not interpret approval to attach content in a private project as authorization to expose it on a public site or in Git history.

## Proposed lifecycle

`captured → organized → draft → in_review → approved_for_selected_use → included_in_release`

Alternative transitions include `needs_revision`, `rejected`, `superseded`, and `withdrawn`. These are content states, not code/PR states. A code merge cannot automatically advance them. A new visual or textual revision is a new review subject; previously approved unrelated revisions remain usable.

The workbench shows before/after text and images with original sources reachable. After the user confirms a scoped batch, the release builder attaches the approved revisions to the chosen scene. No automatic publication from a generator output directory or ingestion job is allowed.

## Private archive and public repository

The repository is public. Do not commit raw transcripts, recordings, private photos, precise residential locations, third-party identifiers, private object URLs, or unreviewed generated content into repository files, issues, PR bodies, CI artifacts or logs. Ignore rules are a convenience, not enforcement. Review staged content and export payloads explicitly.

Keep a durable private store for originals and derivatives. Public manifests use only cleared data and opaque references that cannot retrieve private assets without authorization. Signed/private URLs are not stored in public fixtures. A source being online is not equivalent to reusable or publication-cleared.

When a runtime is implemented, private-workbench authorization must be enforced at the actual data boundary, not just by hiding navigation controls. A public build must not ship the entire private archive as a downloadable client bundle. Disable automatic personal-content telemetry and redact diagnostic logs.

## Durability and corrections

Ordinary editorial correction preserves the original and adds a revision. Backups and exports contain the selected records, assets, provenance, approvals, transforms and checksums; test restoration into a clean environment. Browser storage is not the only archive.

User-authorized deletion requires a separate purge path covering originals, derived assets, indexes, caches and published manifests under the operator's control. Keep only permissible minimal tombstones. Do not promise to erase third-party copies beyond that control. This is another reason not to place personal originals in public Git history.
