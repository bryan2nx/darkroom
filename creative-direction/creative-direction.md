# Scene Study 01 — Darkroom · Creative Direction

The piece is a mobile-first, real-time 3D diorama of a 1970s photographic
darkroom, published under the fictional brand *Scene Study*. The visitor
operates the darkroom through a seven-state print cycle by tapping hero
props. This document defines the tone, palette, reference board, typography,
and copy voice the build will follow.

Treat this document as a contract with the piece — the code should not
invent its own palette or type choices; it should implement these.

---

## 1 · Tone

Scene Study speaks in the register of a quiet architectural publication:
plate captions, specifications, curatorial footnotes. Third person. Past
tense where possible. No marketing voice, no exclamations, no adjectives
doing emotional labor.

**Tonal touchstones:**

- *2G* magazine (Spanish architectural journal)
- *The Architectural Review* issues from the late 1970s
- Vitra Design Museum catalogs
- MoMA *Small Scale, Big Change* catalog
- Georges Perec, *Species of Spaces*
- Joseph Rykwert, *The Idea of a Town*
- The *Documenta* series artist books

**Personality markers:**

- Cultural specificity over abstraction. "Kodak D-76, Ilford MG IV RC,
  Durst M605" — real tools named.
- Specifications replace adjectives. "11 × 14 enamel trays" instead of
  "classic photographic trays."
- Restraint over expression. The plate caption says less than the image
  shows; the image fills in the rest.
- Quiet humor is allowed in the credits/colophon, not in the body.

**What Scene Study is NOT:**

- Not nostalgic. The room is gone-or-going, but the study is archival,
  not wistful. (The studio statement has to carry this line.)
- Not product-promotional. No "discover," no "experience," no CTA.
- Not precious. No Cornell-box pseudo-poetry. No MFA voice.
- Not a brand site for a fake brand. Scene Study reads as a small
  publisher; no services, no pricing, no client roster.

---

## 2 · Palette

The piece's entire visual identity is the **red safelight** — a single
monochromatic source that dominates six of seven states. The seventh state
(dry) briefly admits cool overhead fluorescent as a moment of inspection,
then returns to safelight for the resting state.

### Lighting per state

| State    | Dominant source              | Accent                          | Read                                 |
|----------|------------------------------|---------------------------------|--------------------------------------|
| Setup    | Safelight (~640 nm, 15W)     | —                               | Almost-black room; red wash; stillness |
| Expose   | Safelight + enlarger cone    | Sharp white projection on paper | Red room with one white rectangle of light |
| Develop  | Safelight                    | Wet paper subsurface            | **Climax.** Red room; image emerging in tray 1 |
| Stop     | Safelight                    | Tray 2 chemistry agitation      | Red room; paper in motion            |
| Fix      | Safelight                    | Tray 3 cool chemistry tint      | Red room; chemistry reads cooler     |
| Wash     | Safelight                    | Moving water in wash tray       | Red room; first living water surface |
| Dry      | Safelight + fluorescent (1 beat) → safelight | Cool white, brief | Room briefly exposed, then returns   |

### Hex values (starting points — refine during scene assembly)

| Role                                | Hex       | Notes                                              |
|-------------------------------------|-----------|----------------------------------------------------|
| Safelight ambient / wall wash       | `#4a0a08` | Deep red; low value, high chroma                   |
| Safelight highlight (lit surfaces)  | `#c4301a` | Primary rim color on props                         |
| Safelight wet-surface highlight     | `#ff5535` | Only on glossy / wet materials                     |
| Deep shadow (not true black)        | `#0a0505` | Red-tinted black; absolute black reads digital     |
| Enlarger projection cone            | `#fff0d0` | Warm tungsten ~3200K                               |
| Fluorescent inspection              | `#e8f4ff` | Cool white ~4100K, only in dry-state inspection beat |
| Paper base, dry                     | `#e8dfc8` | Ilford MG IV warm off-white                        |
| Paper base, wet                     | `#d6c8a8` | Saturation darkens the paper                       |
| Emerging print mid-tone             | `#5a4d3a` | Warm grey; paper develops toward this              |
| Enamel tray interior                | `#f8f4ed` | White enamel                                       |
| Enamel tray edge (chip)             | `#5a5a5a` | Exposed iron                                       |
| Chemistry fluid — developer         | `#c4a880` | Warm amber, slightly oxidized                      |
| Chemistry fluid — stop              | `#b8a87a` | Near-identical, slightly cooler                    |
| Chemistry fluid — fix               | `#a89c78` | Coolest of the three                               |
| Wash water                          | `#b8b8b8` | Clear-tending, grey-neutral                        |

Color temperature contrast between the safelight-red palette and the
single tungsten enlarger cone is the strongest compositional tool in the
piece. Protect it — do not let any other warm light bleed into the scene.

---

## 3 · Reference photography board

Bryan to curate a board of 12–20 reference images before modeling begins.
Target references fall into four groups:

### A · Darkrooms photographed in situ (highest priority)

Photos taken *inside* darkrooms, shot on fast stock, that actually capture
the red-only lighting. These are the pieces we are translating.

- **Erich Hartmann** — 1979 Magnum darkroom series, especially the enlarger
  and tray close-ups (original plates are in the Hartmann Family Foundation
  archive)
- **David Goldblatt's** own darkroom photographs (South Africa)
- **Kodak / Ilford promotional photography** from the era — less artful,
  but accurate to the room plan and equipment layout
- **Ralph Gibson** — darkroom self-portraits
- **Old "Popular Photography" magazine** darkroom how-to spreads, 1974–82

### B · Equipment product photography (modeling reference)

Clean white-background shots of the actual tools, for proportion and
surface fidelity.

- **Durst M605 / M805** enlarger — front, three-quarter, base close-up
- **Paterson** enamel trays (11×14 and 16×20)
- **Gralab 300** darkroom timer (the orange-dial iconic unit)
- **Ilford 500** safelight / OC safelight filters
- **Kodak D-76** packaging (visible on chemistry bottle labels in scene)

### C · Enamel and wet-surface material reference

Close-ups for shader development.

- Aged white enamel with minor chips (the trays)
- Wet fiber-based photographic paper (for the emerging print)
- Still vs. agitated chemistry surface tension
- Running water in a shallow tray (wash state)

### D · Architectural period reference (room shell only)

Accurate 1970s darkroom interior — plywood cabinetry, sealed doors,
ventilation fan, shelves of bottles, a clock high on the wall. Avoid
"photographic studio" aesthetic — a darkroom is utilitarian, not styled.

- *Popular Photography* darkroom-at-home features, 1970s
- University / newspaper darkroom documentation from the era
- Garry Winogrand's lab photographs

---

## 4 · Typography

**MVP pairing: IBM Plex Sans + IBM Plex Mono** (both `next/font/google`,
free, credible Swiss grotesque, ships with real tabular figures).

If license budget opens up in a later revision, upgrade to **Söhne** (Klim)
for the brand mark and body, keeping IBM Plex Mono for specifications.
Do not pair Söhne with anything other than its own mono variant.

### Usage

| Element                  | Family             | Weight | Case       | Tracking | Notes                                  |
|--------------------------|--------------------|--------|------------|----------|----------------------------------------|
| Brand mark (SCENE STUDY)  | IBM Plex Sans      | 500    | Small caps | 0.08em   | Letterspaced; never italicized         |
| Plate caption (Scene Study 01 — Darkroom) | IBM Plex Sans | 400 | Sentence | 0em      | Em-dash separator                      |
| Section labels           | IBM Plex Sans      | 500    | Uppercase  | 0.12em   | For "SPECIFICATIONS", "CREDITS" etc.   |
| Body copy                | IBM Plex Sans      | 400    | Sentence   | 0em      | Measure: 60–65ch                       |
| Italic body              | IBM Plex Sans Italic | 400  | Sentence   | 0em      | For studio statement only              |
| Specifications           | IBM Plex Mono      | 400    | Sentence   | 0em      | Tabular figures; left-aligned; rules between rows |
| Footnotes / colophon     | IBM Plex Mono      | 400    | Sentence   | 0em      | Smaller size; grey value               |
| Numerals in metadata     | IBM Plex Mono      | 400    | —          | —        | Tabular lining figures                 |

### Grid

- 12-column on desktop, 4-column on tablet, stacked on mobile.
- Left-align always. No center-aligned body copy.
- Ruled dividers (1px, `#4a3a3a` on dark background) between sections.
- Baseline grid: 4px minor, 24px major.

---

## 5 · Copy

### 5a · Studio statement (~90 words, approved draft below)

> *Scene Study publishes digital dioramas of rooms as archival studies.
> Each study is a reconstruction of a specific kind of interior — the
> rooms where particular work was once made — at scale, lit across its
> working states, presented with the specifications of its reference.*
>
> *The rooms chosen for study tend to be vanishing, or already gone. We
> make the studies to look closely, not as nostalgia. Scene Study 01 is a
> 1970s photographic darkroom: safelight, three trays, an enlarger, a
> line. You operate it through the cycle of a print.*

### 5b · Plate caption (top-left overlay on hero)

> **SCENE STUDY 01**
> *Darkroom*

### 5c · Specifications block (below hero, journal page)

```
SCENE STUDY 01 — DARKROOM

Dimensions       2.8 × 3.4 m
Ventilation      Sealed; overhead fan
Natural light    None
Safelight        OC amber filter, 15W, 1.2m above trays
Enlarger         Durst M605, 50mm EL-Nikkor
Trays            11 × 14 enamel, three
Developer        Kodak D-76, 20 °C
Stop bath        Acetic acid, 2%
Fixer            Kodak rapid fixer
Paper            Ilford Multigrade IV RC
Wash             Running tap, 5 min
Dry              Horizontal line, wooden clips
Referenced       1978
```

### 5d · State captions (shown subtly in the top-right during interaction)

| State   | Caption                                   |
|---------|-------------------------------------------|
| Setup   | *Safelight on. Trays filled. Paper box closed.* |
| Expose  | *Enlarger open. Timer set 00:08.*         |
| Develop | *Paper in developer. Agitate gently.*     |
| Stop    | *Paper in stop bath. Ten seconds.*        |
| Fix     | *Paper in fixer. Two minutes.*            |
| Wash    | *Running wash. Five minutes.*             |
| Dry     | *Line drying. Inspection beat.*           |

### 5e · Credits / colophon

> *Scene Study is a fictional publisher operated by 2NX Partners. Scene Study
> 01 was built in 2026 using Next.js, React Three Fiber, and Blender. All
> equipment references are to real products manufactured in the 1970s.
> No darkroom chemistry was used in the making of this page.*

---

## 6 · The emerging print — subject of the photograph

The image that appears in the developer tray is the single most-remembered
visual in the piece. It is a static image plugged in as a paper texture;
it is also the one place the piece allows nostalgia to lean in, since it
*is* a photograph from 1978.

**Criteria:**

- Culturally era-correct (1978, vernacular black-and-white silver-gelatin)
- Not a famous photograph (licensing + we don't want the viewer to
  recognize it before it fully emerges)
- Slow-reveal-friendly: needs a clear dark/light composition so that the
  emergence reads when only 40% of the paper is developed
- Restrained subject — not emotionally on-the-nose

**Candidate directions (to decide before asset generation):**

- **A.** A quiet empty interior — an unmade bed, a kitchen table at
  morning, an empty chair by a window. Present without being sentimental.
- **B.** A portrait fragment — hands, the back of a head, a shoulder.
  Suggestion of a person without identifying them.
- **C.** A still life — books, a cup, a telephone. Most 1970s-vernacular.
- **D.** A street moment — a figure crossing, a doorway, a sign.

Recommendation: **A**, a quiet empty interior. Rewards slow looking,
sits honestly next to the studio statement's "to look closely, not as
nostalgia" line, and scales to a second Scene Study someday without
telegraphing subject matter.

Source path: first-choice public-domain archival (LIFE archive on Getty
Open Content, Library of Congress, public-domain newspaper morgues).
Higgsfield generation permitted as a last resort for this single asset
only, with a physics-based prompt specifying 1978 Kodak Tri-X stock,
available-light interior, medium format (6×6 or 6×7), overcast daylight.

---

## 7 · Sound direction

Beyond palette and type, the piece has a sonic identity. The audio is
discussed technically in the plan; this section defines the *feel*.

**Ambient bed (continuous, all seven states):**

- Enlarger fan, low drone (~80Hz fundamental with harmonics)
- Distant water trickle (faintly audible, consistent)
- Very faint AC line hum at 60Hz (the room is in a building)

**Per-state cues:**

| State   | Cue sound                                               |
|---------|---------------------------------------------------------|
| Setup   | (no cue — the visitor arrives into the bed)             |
| Expose  | Enlarger relay click → timer tick (8 beats) → relay off |
| Develop | Paper sliding into liquid; soft agitation of tongs in tray |
| Stop    | Paper lifted (drip) + slid into tray 2; brief chemistry agitation |
| Fix     | Paper lifted + slid into tray 3; quieter agitation       |
| Wash    | Increased water sound as wash tray is filled            |
| Dry     | Paper pegged (two wooden-clip snaps); overhead fluorescent ballast buzz for inspection beat, then click-off |

Sound sources: library (Pond5, Freesound CC0, Epidemic Sound). Total
audio payload ≤ 2 MB, 128kbps mp3.

---

## 8 · What goes next

Once Bryan approves this document:

1. **Reference board** — Bryan curates 12–20 reference images into
   `creative-direction/reference-board/` for modeling, lighting, and
   shader work.
2. **Asset brief** — I translate this doc into a prop-by-prop modeling
   checklist for Blender, including polygon targets, texture resolutions,
   and the specific photographic references for each prop.
3. **Emerging-print image** — a single Bryan-approved photograph (path A,
   quiet empty interior) sourced from public-domain archives or, if
   necessary, generated via Higgsfield with a physics-based prompt.

Nothing is modeled, scaffolded, or coded until this document is approved.
