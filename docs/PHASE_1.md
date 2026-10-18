# Phase 1: compact walking-memory network

Status: user-directed scope; geographic registration and historical-address research are not yet complete.

## Scope decision

Prioritize **新华街**, then connect the relevant portions of **南开西里**, **丰台一小旧址**, and **十二中初中旧址** through the user's actual walked segments. 新华街 receives the highest initial interaction and recollection density because the user identified roughly ten years of repeated walking there. That duration is not an exact calendar range.

This is a network of routes associated with different periods, not the asserted itinerary `南开西里 → 新华街 → 丰台一小 → 十二中`. Do not invent which entrance, side street, or crossing was used. Do not route with today's shortest-path result and call it the historical walk.

The two residential-area labels identify project anchors only. Precise homes, unit numbers, and private biographical associations belong in the private archive, not the public repository.

## Construction canvas — 2026-10-17 request

The user authorized a first construction pass using an approximate square around 新华街, the southwest/west Fourth Ring section, 丰台大桥 and 丰台影剧院. The current 1.8 km orientation canvas uses contemporary OSM vectors; it is not a historical source package or an asserted walking route. Four public orientation points are implemented, and both old school-site identities remain unplaced. Three board candidates share the same spatial frame. See [runtime](RUNTIME.md). This explicit task activates the bounded work in DM-0002; it does not activate the entire sequence below.

## Initial anchor register

These are planning aliases, not geocoded runtime IDs. Coordinates remain unset until a registration task supplies evidence.

| Planning alias | User-supplied label | Role | Registration state |
| --- | --- | --- | --- |
| `phase1-xinhua` | 新华街 | Highest-priority walking corridor; many possible local anchors | Unregistered; exact segments and dates unresolved |
| `phase1-nankai` | 南开西里 | Additional period-specific neighborhood anchor | Unregistered; no residential point recorded |
| `phase1-primary-old` | 丰台一小旧址 | Historical school destination and future portal | Historic campus boundary and entrances unverified |
| `phase1-middle-old` | 十二中初中旧址 | Historical school destination and future portal | Historic campus boundary and entrances unverified |

## School identity is not site identity

Keep the institution separate from a geographic site and from the institution's occupancy of that site. School moves must not relocate old memories.

The following are **user-reported research leads**, not externally verified facts in this deliverable:

- The primary school's former site was later used by 丰台二中.
- The old 十二中 site may later have been used by 丰台一小; the user's uncertainty must be retained.
- The newer 十二中 junior campus opposite 南开西里 is not the campus relevant to these junior-school recollections.
- The senior-school site at 丰益桥 belongs to a later, different interaction corridor.

A research task should resolve period-specific occupancy, old campus extents, and actual entrances before registration. A current school-name search result is insufficient. Do not add exact addresses from assumption.

## Temporal priorities

| Period bucket | Intended use | Current evidence status |
| --- | --- | --- |
| Around 2000–2005 | First coherent geographic/art base, then separate local states | No registered base-map package acquired in this change |
| Around 1995 | Earlier comparison where useful | Prior conversation mentioned a candidate; coverage/detail not verified here |
| Around 1990 | Optional early, often sparse layer | No Phase 1 source package verified |
| Around 2005–2010 | Later, lower-priority recollections and references | No Phase 1 source package verified; do not extend past 2010 by default |

These are collection windows, not five guaranteed snapshots. A 2002 source remains dated 2002 even when used to help construct a roughly 2000–2005 scene. User life-stage boundaries must not be inferred from the buckets. Missing source coverage may leave a stylized low-detail background; it cannot justify invented historical certainty.

The Fourth Ring Road can orient the 2000–2005 reference skeleton. Earlier states must not silently claim its later completed configuration. No requirement exists to trace or model the entire ring in Phase 1.

## Interaction emphasis

Build around walking pace, repeated street-side views, familiar turns, small shops, and school entrances. A physically small memory point may receive more detail and prominence than a large background compound. Background blocks can remain planar or generic volumes.

**Explicitly excluded:** the long extension to the 丰益桥 high school, continuous cycling interaction, the unrelated newer junior campus, the broad World Park/railway-hospital periphery, and a full-town reconstruction. Keep future cycling, transit, and jump-route modes representable in the data model without implementing them now.

## Bounded implementation sequence — not activated work

**P1-A / registration sample:** resolve the four anchor labels, identify usable reference coverage, and register one short, evidence-supported 新华街 segment. Record uncertain segments instead of guessing. The result is a spatial/reference package, not finished art.

**P1-B / visual sample:** make one approved style reference and a small overlapping-tile pair over that segment. Check ground registration, seam continuity, readable labels, and one simple raised building. This is a style/geometry acceptance sample, not permission to generate the whole district.

**P1-C / memory loop:** attach a user-approved fragment and another-time entrance, then demonstrate switching and return at the same place. Use a synthetic, clearly marked fixture until a real private-content workflow is available.

**P1-D / portal loop:** demonstrate entry into one school/corridor/image destination and exact return. Expand along approved walked segments only after the small loop works.

No backlog item starts merely because this document exists. Each activated item receives an attention packet and its own evidence. No real coordinates, imagery, generated art, or recollection content are delivered by this architecture PR.
