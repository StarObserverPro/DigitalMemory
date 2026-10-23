# Male Y2K student — runtime rig kit (DM-0019)

This directory holds **only the seven GLB files used by the street viewer**, not the user's photograph, generated character portraits, source contact sheets, unused candidate art, or any original school mark.

## Origin and licensing record

- Skinned modular geometry (bare `Body`, `hair_short`, `top_long`, `bottom_trousers`, `boots_low`): [NoLimitNexus/game-models](https://github.com/NoLimitNexus/game-models), `library/ours/` at source tree `e702964e78ce5f82b4769b81704fc472c2f52ca1`. That repository describes the characters as its own creations and advertises CC0 in its repository description; **a standalone CC0 grant for its independently authored geometry was not found in its tree**. Do not release or merge publicly without resolving that provenance detail, or replace these meshes with an asset carrying an explicit license file.
- Rig and animation sets: Kay Lousberg's **KayKit Character Animations 1.1**, CC0. The original source includes `licenses/kaykit-character-animations.txt`, stating CC0 and credit optional. [Source repository](https://github.com/NoLimitNexus/game-models) and [creator](https://kaylousberg.com/).
- Geometry copied unchanged as GLB binary blobs; not a rip from Richman or Chinese Paladin. We added a runtime recoloring shader, not copyrighted game assets.
- Source files `library/animations/Rig_Medium_General.glb` (clip `Idle_A`) and `library/animations/Rig_Medium_MovementBasic.glb` (clip `Walking_A`).

| Local file | Upstream file |
| --- | --- |
| `body.glb` | `library/ours/body/Body.glb` |
| `hair-short.glb` | `library/ours/parts/hair_short.glb` |
| `jacket.glb` | `library/ours/parts/top_long.glb` |
| `trousers.glb` | `library/ours/parts/bottom_trousers.glb` |
| `shoes.glb` | `library/ours/parts/boots_low.glb` |
| `idle.glb` | `library/animations/Rig_Medium_General.glb` |
| `walk.glb` | `library/animations/Rig_Medium_MovementBasic.glb` |

## Visual contract and limitations

One **male**, unhooded, un-hatted short-hair student. A full skeletal walk, not procedural knee pose. Shrinking the donor head bone to 0.48 before scene scaling produces a less exaggerated RPG/Q-style proportion (the exact projection still needs a screenshot review). School tracksuit texture is calculated in *bind-space* so it follows the skinned clothing: white upper jacket, colored lower jacket and V stripe, matching loose colored trousers with white leg piping, white low shoes.

- `youth` presentation profile: **blue/white high-school** palette.
- `child` presentation profile: **red/white junior-school** palette; presentation choice only, **not a claim of exact school chronology**.
- The shoulder/chest seam uses an intentionally simplified generic stripe: the user-referenced photograph depicts a **later emblem revision**, not a verified historic logo. No specific school emblem is included.
- The screenshot/reference was not redistributed and no person's real facial identity was reconstructed.
- Glasses/backpack remain optional future accessories, not an invented physical trait.
- Map interaction/ground units remain as previously implemented. Existing older procedural geometry is retained for isolated unit fixtures but removed from the rendered player group before the first live street frame.
- The viewer's existing menu now has a compact **校服** toggle: junior red/white and high-school blue/white are explicit user choices, not inferred from historic date windows; the choice persists on reload.

**Review gates still open:** 3/4-view projected 3.5–4.5 head impression; costume stripe shape and age plausibility; front orientation; actual feet-to-ground through each phase; gait cadence/slide; desktop and phone WebGL screenshot; confirmed permission to reuse the mesh geometry. Script and GLB metadata tests cannot certify these.
