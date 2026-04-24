# Scene Study 01 — Darkroom · Asset Brief

Concrete, prop-by-prop checklist for modeling, texturing, and audio
sourcing. Derived from the creative direction doc; nothing in this
document should contradict it.

Delivery target: **one `.glb` file**, Draco-compressed, KTX2 textures,
≤ 3 MB total payload. Plus an audio folder ≤ 2 MB total.

---

## 1 · Delivery format & pipeline

**Pipeline shift from original plan:** no Blender step. The scene is
composed directly in React Three Fiber using drei primitives and
small custom geometries. One hero object (the Durst M605 enlarger) is
imported as a glTF from Sketchfab; every other prop is authored in
TypeScript/JSX. Benefits: live HMR feedback loop, no export cycle,
one fewer tool in the pipeline, faster iteration with Bryan.

**Final deliverables:**

- `public/models/enlarger.glb` — single Sketchfab-sourced glTF of the
  Durst M605 (Draco-compressed if not already; KTX2 textures if
  possible — processed via `gltf-transform` or `gltfpack`)
- `public/textures/` — PBR texture sets for tileable materials from
  Poly Haven (concrete floor, painted wall, plywood counter), plus the
  emerging-print image
- `public/audio/` — ambient bed + seven per-state cue files
- `public/posters/darkroom-poster.jpg` — single rendered frame from the
  scene for the no-WebGL fallback (captured via headless puppeteer or
  scripted canvas export once the scene is built)

**Enlarger processing (one-time, post-Sketchfab-download):**

```bash
# Compress meshes and re-encode textures to KTX2
npx gltf-transform etc1s enlarger.glb enlarger.glb --quality 200
npx gltf-transform draco enlarger.glb enlarger.glb --level 6
```

**Loader setup in R3F:**

- `DRACOLoader` with decoder path `/draco/`
- `KTX2Loader` with decoder path `/basis/`
- Both decoders served from `public/` (not CDN — reliability)

---

## 2 · Room shell

| Element        | Geometry         | Dimensions            | Material                | Tri budget | Notes |
|----------------|------------------|-----------------------|-------------------------|------------|-------|
| Floor          | Plane            | 2.8 × 3.4 m           | PBR concrete or sealed plywood, tileable 1024² | 500  | Slightly scuffed, chemistry stains near trays |
| Walls (×4)     | Extruded boxes   | Ceiling @ 2.4 m       | Matte grey paint, tileable 1024² | 800  | Light fixture + vent cutout on ceiling wall |
| Ceiling        | Plane            | 2.8 × 3.4 m           | Matte white paint       | 400        | Holds fluorescent fixture + vent grille |
| Door (closed)  | Box + trim       | 2 × 0.9 m             | Painted wood            | 1k         | On the long wall; light-seal strip visible |
| Vent grille    | Slatted plane    | 0.4 × 0.2 m           | Dark painted metal      | 500        | Faint dust accumulation |
| Countertop     | Thick plane      | 0.6 × 2.8 m (long)    | Stained plywood 1024²   | 500        | Holds trays and bottles |
| Shelves (×2)   | Simple boxes     | 0.3 × 2.0 m           | Same plywood            | 1k (both)  | On wall above countertop |

**Total room shell: ~4,700 triangles.**

---

## 3 · Hero props (interactive / state-dependent)

All hero props get full PBR (albedo, normal, roughness, metallic where
relevant). Hero PBR atlases at 2048². They must be the visual weight of
the piece.

### 3.1 · Enlarger — the visual anchor

| Field                | Value                                                         |
|----------------------|---------------------------------------------------------------|
| Reference            | **Durst M605** with 50mm EL-Nikkor lens                       |
| Source               | Sketchfab (CC-BY or similar) or Blender build                 |
| Tri budget           | 20k                                                           |
| PBR atlas            | 2048² (albedo + normal + roughness + metal)                   |
| State variants       | Head-lamp material off / on (emissive swap only)              |
| Interactive          | Yes — "expose" trigger. Tap zone: enlarger head or timer.     |
| Notes                | Column baseplate, focus knobs, filter drawer, negative carrier, lamp house. The *most* modeled object in the scene. |

### 3.2 · Enamel trays (×3)

| Field                | Value                                                         |
|----------------------|---------------------------------------------------------------|
| Reference            | **Paterson** 11 × 14 inch enamel, white with faint iron-blue rim chips |
| Source               | Blender build (simple geometry)                               |
| Tri budget           | 2k each, 6k total                                             |
| PBR atlas            | Shared 1024² for all three                                    |
| State variants       | Empty / filled with chemistry (three tints from palette table) |
| Interactive          | Yes — each tray is a tap target in its respective state       |
| Notes                | Chip detail on rim adds honesty. Chemistry fluid is a separate plane mesh inside the tray with per-tray material variant. |

### 3.3 · Safelight fixture

| Field                | Value                                                         |
|----------------------|---------------------------------------------------------------|
| Reference            | **Kodak / Ilford 902** wall-mount safelight, OC filter        |
| Source               | Blender build                                                 |
| Tri budget           | 1.5k                                                          |
| PBR atlas            | Shared 1024² with other fixtures                              |
| State variants       | Always on (emissive always; never swapped)                    |
| Interactive          | Yes — tap to **reset** (returns to setup from any state)      |
| Notes                | Emits light via three.js `PointLight` at its position; the mesh emissive is purely visual indication. |

### 3.4 · Gralab 300 timer

| Field                | Value                                                         |
|----------------------|---------------------------------------------------------------|
| Reference            | **Gralab 300** darkroom timer, iconic orange-dial round face  |
| Source               | Blender build                                                 |
| Tri budget           | 2k                                                            |
| PBR atlas            | Shared 1024² with controls                                    |
| State variants       | Dial at 00:08 (expose) / 00:00 (all other states); emissive LED on during expose |
| Interactive          | Yes — tap to **start expose** (from setup); shows countdown   |
| Notes                | The iconic orange dial is a key identifier — get the face graphics right from reference photography. |

### 3.5 · Tongs

| Field                | Value                                                         |
|----------------------|---------------------------------------------------------------|
| Reference            | Bamboo or rubber-tipped print tongs                           |
| Source               | Blender build                                                 |
| Tri budget           | 800                                                           |
| PBR atlas            | Shared 1024² with small metal props                           |
| State variants       | Resting on counter / moving between trays (animated)          |
| Interactive          | Yes — tap to **transfer paper** between trays                 |
| Notes                | Hinges visible. Animation uses `AnimationMixer` clip. |

### 3.6 · Drying line + wooden clips

| Field                | Value                                                         |
|----------------------|---------------------------------------------------------------|
| Reference            | Horizontal wire across far wall with wooden spring clips      |
| Source               | Blender build (procedural array)                              |
| Tri budget           | 1k total                                                      |
| PBR atlas            | Shared 1024² with wood props                                  |
| State variants       | Empty / paper pegged (one clip holds the print)               |
| Interactive          | Yes — tap to **peg the print** (final state)                  |
| Notes                | Thin wire (hairline geometry); 5-6 clips, one active.         |

**Total hero props: ~31,300 triangles.**

---

## 4 · Support props (non-interactive)

All support props share a single 1024² texture atlas. Lower polygon
budget; no state dependency.

| Prop                           | Tri budget | Notes |
|--------------------------------|------------|-------|
| Chemistry bottles (×4, amber)  | 3k total   | Labels visible: "Kodak D-76", "Kodak Indicator Stop", "Kodak Rapid Fixer", blank 4th bottle. Label decal 512 × 1024 |
| Paper box (closed, on shelf)   | 400        | "Ilford Multigrade IV RC" label |
| Easel (for expose state)       | 1k         | Holds paper under enlarger |
| Wash tray                      | 1.5k       | Slightly different from enamel trays — deeper, with water-surface plane |
| Wall clock (high on wall)      | 1k         | Standard round industrial clock |
| Power outlet + switches        | 400        | Detail for honesty |
| Rubber floor mat (under trays) | 300        | Chemistry drip catcher |
| Rolls of tape, scissors, misc  | 500 total  | Shelf detail |
| Roller towel on hook           | 400        | Ambient detail |

**Total support props: ~8,500 triangles.**

---

## 5 · Paper instances (state-dependent)

The photographic paper is the narrative object — it moves through five
physical positions during the piece.

| Instance                    | Position                     | Material state                          | Tri budget |
|-----------------------------|------------------------------|-----------------------------------------|-----------|
| Paper on easel (expose)     | On easel under enlarger      | Dry, receiving light projection         | 100       |
| Paper in tray 1 (develop)   | Submerged in developer       | Wet; custom emergence shader (α curve)  | 200       |
| Paper in tray 2 (stop)      | Submerged in stop            | Wet; fully-developed image visible      | 200       |
| Paper in tray 3 (fix)       | Submerged in fix             | Wet; fully-developed, unchanged         | 200       |
| Paper in wash tray          | Submerged in running water   | Wet; ripples over surface               | 300       |
| Paper on drying line        | Clipped to wire              | Damp-to-dry; hanging curl               | 300       |

All paper instances share one material that accepts an `emergingPrint`
texture and a `developmentProgress` uniform (0–1). The shader drives
image opacity so the develop state can animate emergence over ~20 seconds.

**Total paper: ~1,300 triangles.**

---

## 6 · Totals

| Category           | Triangles |
|--------------------|-----------|
| Room shell         |    4,700  |
| Hero props         |   31,300  |
| Support props      |    8,500  |
| Paper instances    |    1,300  |
| **Scene total**    | **45,800** |

Budget: 120k. Headroom ~74k for unforeseen detail, LOD refinements, or
additional hero-prop fidelity during review waves.

---

## 7 · Texture atlas plan

| Atlas                  | Resolution | Contents                                | Target size (KTX2) |
|------------------------|-----------|----------------------------------------|---------------------|
| `hero_enlarger`        | 2048²     | Durst M605 all maps                    | ~400 KB             |
| `hero_trays_paper`     | 2048²     | Three trays + paper base + emergence map | ~400 KB           |
| `hero_controls`        | 1024²     | Timer, safelight, tongs, drying clips  | ~150 KB             |
| `support_shared`       | 1024²     | Bottles, labels, small props           | ~150 KB             |
| `room_tileable`        | 1024²     | Floor, walls, countertop (tileable)    | ~200 KB             |
| `emerging_print`       | 2048²     | The single hero photograph             | ~200 KB (swappable, not in GLB) |

**Total texture payload: ~1.5 MB** (within budget).

---

## 8 · Audio assets

| File                    | Source path (library)          | Format     | Target size | Notes |
|-------------------------|--------------------------------|------------|-------------|-------|
| `amb_darkroom.mp3`      | Freesound / Epidemic           | mp3 128kbps, loopable | ~400 KB | 30-60s loop: fan hum + distant water + AC hum |
| `cue_expose.mp3`        | Freesound                      | mp3 128kbps | ~60 KB | Enlarger relay click + 8 timer ticks + relay off |
| `cue_develop.mp3`       | Freesound                      | mp3 128kbps | ~80 KB | Paper sliding into liquid + tongs agitation loop |
| `cue_stop.mp3`          | Freesound                      | mp3 128kbps | ~60 KB | Drip + transition + chemistry agitation |
| `cue_fix.mp3`           | Freesound                      | mp3 128kbps | ~70 KB | Similar to stop, quieter |
| `cue_wash.mp3`          | Freesound                      | mp3 128kbps | ~120 KB | Water fill swell + flow |
| `cue_dry.mp3`           | Freesound                      | mp3 128kbps | ~80 KB | Clip snap (×2) + fluorescent ballast + click-off |
| `cue_setup.mp3`         | optional                       | —          | 0           | No cue; ambient bed alone |

**Total audio payload: ~870 KB** (well under 2 MB budget).

Sourcing notes: Freesound CC0 covers nearly all of these. "Gralab 300
timer tick" is the hardest — may need to record it if no library file
has the iconic mechanical-reed sound. Backup: any mechanical darkroom
timer library recording, pitch-shifted if needed.

---

## 9 · Emerging print — the photograph

Per creative direction doc §6, the subject is a **quiet empty interior**.

**Sourcing priority:**

1. **Library of Congress** Prints & Photographs Online — public domain,
   searchable, high-resolution. Start with FSA/OWI 1930s-40s era images
   (e.g. Walker Evans, Russell Lee) — era-close enough for 1978 vernacular,
   and fully public-domain.
2. **LIFE Magazine archive** (Getty Open Content portion)
3. **USPS historical archives** for interior postal photographs (dry,
   accidental poetry)
4. **Higgsfield generation** as a last resort, with this prompt shell:
   > *Medium-format 6×7 black-and-white photograph on Kodak Tri-X, 1978.
   > Interior: [subject], overcast daylight through a single window,
   > available light only, shot at f/5.6 1/30s from chest height. Natural
   > composition, slight grain structure visible. No people.*

**Technical specs for delivery:**

- 2048 × 2560 px (portrait) or 2048 × 2048 (square)
- Grayscale, 8-bit
- Contrast: strong dark/light zones so emergence reads at 40% progress
- No watermark, no caption, no frame
- Delivered as `emerging-print.jpg` (quality 90, ~300 KB)

**Creative note:** the photograph should survive being 50% visible. Test
it by layering a 50% white scrim over a proof; if the image still reads,
it's the right choice.

---

## 10 · Work order

Each step is its own review checkpoint per the "checkpoint cadence on
multi-wave creative work" rule. With the Blender pipeline dropped, the
work is one continuous R3F build with review waves along the way.

1. **Scaffold** Next.js 16 + R3F + TypeScript project. Ship a dev server
   on a Vercel preview URL so Bryan can see progress on his phone.
2. **Room shell in code** — walls, floor, ceiling, counter, shelves,
   door, vent. Tileable PBR from Poly Haven. Lighting: safelight
   `<PointLight>` only, default state. **Review wave 1.**
3. **Enlarger download + import** — source Durst M605 from Sketchfab,
   compress with `gltf-transform` to Draco + KTX2, drop into scene.
   Position on countertop. **Review wave 2.**
4. **Trays + chemistry fluid + paper shader** — second most important
   visual; develop state must read at proof. Custom shader uniform drives
   emergence. **Review wave 3.**
5. **Remaining props** (safelight, Gralab timer, tongs, drying line,
   bottles, easel, wash tray). **Review wave 4.**
6. **Lighting polish + all seven states wired via state machine.**
   **Review wave 5.**
7. **Interaction layer** (pointer orbit, tap affordances, tap zones,
   reduced-motion and no-WebGL fallbacks).
8. **Audio pass** (parallel OK with step 7).
9. **Typography / journal-page layout.**
10. **Emerging print selected + dropped in.**
11. **Perf pass + production deploy.**

Each review wave is a preview deploy on `bryan2nxs-projects`, phone
feel-test, then refinement before the next wave.

---

## 11 · Locked decisions

- **Modeling:** hybrid. Hero models (enlarger, possibly Gralab 300 timer,
  safelight fixture) sourced from Sketchfab / Poly Haven under CC-BY or
  CC0. Remaining geometry (trays, tongs, drying line, bottles, easel,
  room shell, countertop, shelves) built via bpy scripts that Blender
  executes headlessly. PBR textures for tileable room materials pulled
  from Poly Haven. Everything composed and exported from one Blender
  scene as `darkroom.glb` (Draco + KTX2).
- **Emerging-print image:** Higgsfield generation is allowed as a last
  resort for this single asset if no public-domain image fits.
- **Subdomain:** `darkroom.2nx.co`. Matches the portfolio's single-concept
  naming (`retro`, `submariner`, `6th-street`). Scene Study 02 — if it
  ever ships — gets its own single-concept subdomain and is tied to this
  piece via the journal page and portfolio, not via URL structure.
