# Fingerprints

Every site you build with **scrollcraft** gets one row here, appended after it
ships. The registry exists so your next build can prove it is a different page
rather than a re-skin of one you already made.

This file is **yours**. It starts empty on purpose: the gate is about not
repeating _yourself_, so it has nothing to say until you have built something.

The rules and the gate live in the skill's
`references/uniqueness.md`. Short version:

**A new build must differ from EVERY row below on at least 4 of the 6
dimensions.** Four against each row individually, not four on average across the
table. If a planned build fails, change the plan. Never edit a row to make room
for it.

The six dimensions are: **grammar**, **nav treatment**, **hero device**,
**act-sequence shape**, **close pattern**, **signature move**.

Dimension 6 is free, because a signature move is unique by definition. So the
gate really asks for three more out of the remaining five, and a build that
changes only grammar and world will fail it.

---

## The registry

| Build                             | Grammar             | Nav treatment                                                                                                                                                  | Hero device                                                                            | Act-sequence shape                                                                                                                | Close pattern                                                                                                                                                                              | Signature move                                                                                                                                                                           | World                                                                                                                                                                                     | Port                                                                                 |
| --------------------------------- | ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| azer-observatory (rev 1)          | Chaptered editorial | Vertical folio in the left margin, on a band of the current ground; no bar, no CTA in chrome; becomes a bottom chip below 1280px                               | Printed title page: type on a live canvas sky, `flow` + `in` stagger, no media, no pin | `flow` > `pan` > `flow` > `pin` > `flow`, 5 acts, 13.1vh desktop / 13.9vh mobile, two unpinned intertitle plates between chapters | Colophon plate on the sky: masthead, CTA as running text inside a serif sentence, contact grid, signed line; the star field's gravity eases to zero as it arrives so the sky comes to rest | The cursor is a gravitational mass: a fixed canvas star field bends toward the pointer with inverse-square falloff, and at the peak the same field pulls a project body out of its orbit | Technical drawing, astronomical: authored SVG and canvas plates, one amber accent, one light-paper chapter cut hard into a dark page                                                      | React 19 + Vite + TypeScript (engine mounted once over React's markup, never edited) |
| azer-observatory (rev 2, shipped) | Chaptered editorial | Constellation on the right edge: seven jittered stars joined by a hairline, traversed arc lit amber, real anchors that jump; becomes a bottom bar below 1024px | Printed title page: type on a live canvas sky, no media, no pin                        | `flow > pin > pan > pin > flow > pin > flow`, 7 acts, 16.6vh desktop / 17.7vh mobile, one unpinned silence plate before the peak  | A drawn black hole: contact data on a dashed ring around the event horizon, each block on its own patch of density, CTA as running serif text above it                                     | The cursor is a gravitational mass: a fixed canvas star field bends toward the pointer with inverse-square falloff, and at the peak the same field pulls a project body out of its orbit | Technical drawing, astronomical: four deterministic canvases (star field, moon, burst, black hole) plus authored SVG, one amber accent, one light-paper chapter cut hard into a dark page | React 19 + Vite + TypeScript (engine mounted once over React markup, never edited)   |

## What is taken

Add a bullet here whenever a build claims something a later build should avoid
reusing: a grammar, a nav treatment, a close pattern, a signature move, an
act-count-and-length band. The shared columns are what the next build inherits
as a constraint, so writing them down is the whole point.

- **Chaptered editorial** as a grammar, with intertitle plates between chapters.
- **The vertical margin folio** as the whole of the chrome (rev 1), and **the
  right edge constellation** that replaced it (rev 2). Both are taken.
- **A printed title page** as the hero: no media, no pin, no kinetic split.
- **The 5-act `flow > pan > flow > pin > flow` shape at 13.1vh** (rev 1) and the
  **7-act `flow > pin > pan > pin > flow > pin > flow` shape at 16.6vh** (rev 2).
  Rev 2 is over the 8 to 14 budget on purpose, at the human's request, and a
  later build should not read that as licence to ignore the budget.
- **Four spectacle moments on one page**, ranked rather than levelled: a build,
  a fast transition, the peak, and a loud ending. It works here; it is not a
  shape to reach for a second time without the same explicit ask.
- **A hard light-on-dark chapter inversion** (paper printed into a dark page) as
  the second-loudest moment, deliberately kept motionless so it cannot compete
  with the peak.
- **Pointer gravity** as a signature. Any later build that moves elements toward
  the cursor is repeating this, including a "magnetic" variation of it.
- **The colophon close**: CTA set inside running serif text plus a signed line,
  and its rev 2 form, **data on a ring around a drawn black hole**.
- **Deterministic canvas plates driven off `--sc-p`** as a substitute for
  generated stills. Reached for here because the account could not call a usable
  image model, and it is now a shape that exists.

---

## Appending a row

After shipping, add one line to the table and one bullet to **What is taken** if
the build claimed something new. Fill every column. Say what the build shares
with existing rows.

Rows are append-only. A build that has been superseded stays in the table,
because the space it occupies is still occupied.

---

## Worked example

The skill's author kept a registry of twelve builds across eight page grammars.
If you want to see what a filled-in table looks like, and which shapes tend to
collide, read `EXAMPLES.md` in the scrollcraft repository. Treat it as
illustration only: those rows are somebody else's builds and they do **not**
constrain yours.
