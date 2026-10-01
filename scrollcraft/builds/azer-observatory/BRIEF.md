# BRIEF — azer-observatory

Personal portfolio for Azer Naghiyev, frontend developer, Baku.
Interviewed (not self-authored). Answers below are the human's own, in the
options they picked, not paraphrased into marketing prose.

---

## The eight interview answers

**1. Vibe, three to five words + references.**
"Interstellar / kinematik dərinlik" — brown-black void, one light source, an
enormous sense of scale, silent and grand. Large typography, very little colour.

**2. The scroll journey, in their words.**
"Ad → Bacarıq → Təcrübə → Layihələr → Əlaqə."
Name, then what he can do, then where he has worked, then what he has built,
then how to reach him.

**3. The energy curve.**
"Güclü açılış → sakinləşən orta → güclü bağlanış." Strong open, the middle
settles into something readable and quiet, the close is strong again.

**4. Feeling stage by stage, and the ONE moment.**
The one moment: "Layihələr orbit kimi açılır" — the projects open out as an
orbit; planets turning around a star, and one of them comes close enough to
fill the page.

**5. One thing no site they have seen does.**
"Kursor bir cəzb qüvvəsidir" — the cursor is a gravitational mass. Wherever it
goes the surrounding stars bend and are drawn toward it. The visitor is a mass
on the page, not a viewer of it.

**6. How far from premium-minimal.**
"Editorial / jurnal ruhu." Large headings, columns, page numbers, text-led.
Space stays as the ground; typography is in front.

**7. One unbroken world, or distinct scenes.**
"Ayrı səhnələr / fəsillər." Separate chapters, each with its own world, a
different animation on each scroll.

**8. Existing assets.**
"Heç nə — hamısını sən yarat." Nothing. No photos, no logo, no screenshots.

---

## What this is, who it is for

The personal site of a frontend developer with two years of shipped work,
including a ~45,000-line ERP frontend delivered solo. It is for engineering
managers and recruiters who will spend ninety seconds on it.

**What the visitor must believe by the end:** that he builds systems, not
screens.

**What they do next:** write to him. One label, used everywhere: _Write to me_.

---

## Grammar

**Chaptered editorial.** The page is an astronomical observation journal:
chapters, a folio in the margin, intertitle plates between them, media that
sits in its own column with a caption. Hard cuts between chapter grounds, never
a drift gradient.

Why the other seven lost:

- _Filmic one-shot_ — the human explicitly asked for separate chapters and a
  different animation per scroll. One continuous argument is the opposite.
- _Continuous world_ — same answer to question 7, and it needs footage this
  build has none of.
- _Live surface_ — his work is ERP internals; there is no product surface that
  is honestly his to run in public.
- _Typographic poster_ — would throw away the orbit, which is the peak he chose.
- _Gallery / catalog_ — three real projects is not a collection, and forcing a
  museum-label schema onto three items reads as padding.
- _Split stage_ — there is no two-sided argument here.
- _Rhythmic cutlist_ — bans `pin`, which the orbit peak needs, and "editorial,
  quiet middle" is the exact inverse of a pulse page.

## Aesthetic family

Editorial. Dark observatory paper: ink-blue-black ground, bone type, one amber
accent (sodium/starlight). No violet, no neon, no cream-and-brass.

## World

Technical drawing (worlds.md §8), in its astronomical form: archival chart
plates, fine consistent line weight, dimension lines and leader callouts, real
markup over an authored SVG/canvas ground. No generated photography — the
journal's plates are diagrams, honestly, which is what an observation record
actually contains.

---

## The feeling curve

```
1  Arrival      a title page alone on a live sky; the stars already answer the pointer
2  Curiosity    an absorption spectrum travelling sideways, each dark line named
3  Substance    field notes on paper, hard cut, a measured plate in its own column
4  Silence      one near-empty plate. Sky, a chapter mark, nothing else   [authored]
5  Awe→Control  the system chart: three worlds turning, and the cursor pulls one in
6  Resolve      everything settles to one line of running text and an address
```

Act 4 is **authored silence**, not dead scroll. It is the empty screen the peak
arrives from, and the verification pass should read it as intended.

## The peak

> the stars were bending toward my mouse the whole way down, and then his
> projects came out as planets and I pulled one out of its orbit with the cursor

Lives in act 5, Chapter III. It gets the largest span on the page by a clear
margin, the quiet plate in front of it, and the only interactive mechanic on
the site.

## The tell-someone sentence

> It's the site where your cursor has gravity, and you pull his projects out of
> orbit with it.

The signature move and the peak are deliberately the same moment. The gravity
is present from the first screen so that by the time it becomes the mechanism,
the visitor already knows they have mass.

## The signature move

**The cursor is a gravitational mass.** A fixed canvas star field under the
whole document. Every star is displaced toward the pointer by an inverse-square
falloff, brightens as it approaches, and relaxes back when the pointer leaves.
In Chapter III the same field acts on the project bodies: the nearest world
leaves its orbit toward the cursor and its data plate opens.

Not in the device kit, not a parameter change to `spotlight` (which this
grammar bans anyway), and it is the page's only pointer mechanic.
Gated to `(hover: hover) and (pointer: fine)`, inert under reduced motion and on
touch. The chapter still works without it: scroll alone brings each world to the
front of its orbit at the centre of its own window and opens that world's plate,
so the peak reads on a phone with no pointer at all. The gravity is what a mouse
adds, not what the chapter depends on.

---

## Language

Written in English, matching his CV, GitHub and LinkedIn, because the audience
is hiring engineers. Every figure on the page comes from the CV; there are no
invented numbers and therefore no counters on anything unverified.

---

## The score table

| Beat           | Section                 | Device                                                                                   | Why this one                                                                                                                                    |
| -------------- | ----------------------- | ---------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Arrival        | Title page              | `flow` + `in` stagger over a live canvas ground                                          | A journal's title page is printed, not animated. The only thing moving on the first screen is the sky, and it is already answering the pointer. |
| Curiosity      | Chapter I, Instruments  | `pan` + a running head                                                                   | An absorption spectrum is a horizontal axis. Lateral travel reads as breadth, which is what a skill list actually is.                           |
| Substance      | Chapter II, Field notes | `flow` + `in`, `reveal` wipe, `parallax` in the media column                             | The grammar's own leans-on list. The chapter is read, not watched, so nothing here is pinned.                                                   |
| Silence        | Intertitle III          | none, a plain section                                                                    | Authored. The empty screen the peak arrives from.                                                                                               |
| Awe to Control | Chapter III, The system | `pin` at the largest span, plus bespoke canvas driven off `--sc-p`, plus pointer gravity | The frame has to hold still while three worlds advance, and the pointer mechanic needs a stage that is not moving under it.                     |
| Resolve        | Colophon                | `flow`, nothing fades, gravity eases to zero                                             | The close resolves and holds. The final screen can stand still with content on it.                                                              |

Six device families (flow/in, pan, reveal, parallax, pin, bespoke canvas), no
family twice in a row, no `scrub` at all, one peak at 4.4vh against a page whose
next longest act is 2.9vh.

**Devices deliberately not used:** `count`, because the engine writes `0` into a
counter for the whole time its act is live but before the count window opens,
and the figures in chapter II are visible long before that. Static figures, all
of them real. `spotlight` and `magnet` are banned by the grammar.

## The feel check

Run cold against the desktop contact strip, one word per act, before rereading
this file.

| Act              | Intended       | Felt                               |              |
| ---------------- | -------------- | ---------------------------------- | ------------ |
| 1 Title page     | Arrival        | arrival                            | matches      |
| 2 Instruments    | Curiosity      | inventory                          | **diverged** |
| 3 Field notes    | Substance      | substance, and louder than planned | **diverged** |
| 4 Intertitle III | Silence        | quiet                              | matches      |
| 5 The system     | Awe to control | awe                                | matches      |
| 6 Colophon       | Resolve        | resolve                            | matches      |

Two disagreements, and the page was wrong both times, not the brief:

1. **Act 2 read as an inventory, not as curiosity.** The rail carries the
   chapter head off screen inside the first half viewport, so most of the act
   was a list of words with no reason attached to it. Fixed by adding a running
   head to the stage, which is what a journal would have there anyway, so the
   chapter keeps its name and its premise for its whole length.
2. **Act 3 landed harder than intended and briefly competed with the peak.**
   The hard cut from sky to paper is the second largest visual change on the
   page. It was left in place, because it is the thing that makes the middle
   feel like reading, but it carries no motion of any kind: no pin, no cue
   choreography, nothing that moves under the reader. The silence plate in act 4
   then drops the level again before the peak. Confirmed on the strip that act 5
   is still the largest change and holds the most scroll room.

## What a green harness run does not cover

No real phone was tested. Headless Chrome cannot reproduce iOS touch scrolling
or Low Power Mode. There is no video on this page, so the usual iOS clip
lifecycle failures do not apply, but the canvas frame rate on an older phone is
untested.

---

---

# Revision 2: the set pieces

The human asked for four additions after seeing revision 1: generated imagery,
a star shaped navigation on the right edge, a moon that is approached by
scrolling, a nebula burst, and a black hole with data around it.

## What this costs, said plainly

Revision 1 was 5 acts at 13.1 viewport-heights, one peak, inside the skill's
8 to 14 budget. Revision 2 is **7 acts at 16.6vh** (17.7vh on a phone), which
is over that budget, and it has **four spectacle moments instead of one**. Both
were the human's call, made with the trade named. What was done about it:

- The four are deliberately ranked rather than levelled. **Approach** builds,
  **Ignition** is a fast transition, **The system** is still the peak (4.4vh,
  the largest span by a clear margin, the quiet plate in front of it, and the
  only interactive mechanic), and **the black hole is the ending**, which is
  allowed to be loud because the last feeling is the one they carry.
- The quiet middle survives: chapter II is still paper, still motionless, and
  the silence plate still sits between it and the peak.

## The imagery, and why none of it shipped

Requested, attempted, and reported rather than quietly dropped.

- The account is on the **free plan with 2 credits**. Of the four image models
  offered, `soul_location` and `recraft_v4_1` both return
  _"Requires basic plan or higher"_, leaving `z_image` as the only one that can
  be called at all.
- Two `z_image` plates came back and neither is usable. The moon has a
  **telescope and a tripod in the frame**: the world preamble named the
  instrument ("500mm refractor on an equatorial mount") and the model drew it.
  Rerolling with `No telescope, no equipment, no tripod` in the negative list
  did not remove it, because the phrase "taken through a telescope" was still
  in the preamble. The nebula came back **violet and cyan**, which is the exact
  palette worlds.md and taste.md both forbid, and the page's accent is amber.
- Every later submission either hit `429 rate_limit_reached` on submission or
  sat queued and then failed. Roughly 0.45 credits went on the two plates that
  arrived; the rest of the balance is untouched.

**So the three set pieces are drawn, not photographed**, and that is a better
answer here rather than a consolation:

| Plate      | Why drawn beats a still                                                                                                                                                                                                                                                                              |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Moon       | The act is an approach. A 1920px still enlarged four times is four times softer at exactly the moment the reader is closest to it. Drawn, the terminator stays sharp and the surface _gains_ craters as the distance falls, because smaller features cross the size at which they are worth marking. |
| Burst      | An explosion is a change over time. A still cannot detonate; the shell, the filaments and the gas all run off one number, and that number is the reader's hand.                                                                                                                                      |
| Black hole | The data has to sit in specific places around the event horizon. With a still, that layout depends on where a generator happened to put the hole. Drawn, the horizon is at a known point and the callouts are placed against it.                                                                     |

All three are deterministic (seeded, never `Math.random`), so a screenshot is
reproducible, and all three cost one request instead of roughly 17 MB of PNG.

## Revised structure

```
1  Arrival     flow   title page, live sky, the pointer already has mass
2  Approach    pin    the moon closing, 2.6vh
3  Curiosity   pan    absorption spectrum, 2.6vh
4  Ignition    pin    the burst, and chapter II's title, 1.9vh
5  Substance   flow   field notes on paper, hard cut, motionless
6  Silence     -      one near empty plate                        [authored]
7  Awe→Control pin    the system chart, 4.4vh                     [the peak]
8  Resolve     flow   the black hole, contact data on a ring around it
```

Device order `flow > pin > pan > pin > flow > pin > flow`: no family twice in a
row, six families, still no `scrub` anywhere.

## The nav

The margin folio is gone, replaced by **a constellation on the right edge**:
seven stars at jittered positions and uneven magnitudes, joined by a hairline,
with the traversed part of the asterism lit amber so arriving at the footer
means having a record of the route rather than a bar at 100 per cent. It is a
real `<nav>` of real anchors, so it is tabbable and it jumps. Below 1024px it
becomes a bar at the bottom edge carrying the same stars plus the current
chapter name.

The chapter mark for III carries the `#system` id rather than the act, so the
jump lands on the chapter title and not in the middle of the chart.

## What verification caught this round

Every one of these was found by looking at the harness output, not by reasoning
about the code.

1. **The system chart rendered as ellipses.** The canvas bitmap was sized before
   the engine turned the stage into a pinned 100vh box, so it sat on a different
   aspect ratio to the element it was stretched over, and no window resize event
   ever fires to correct it. `ResizeObserver`, now shared by all four canvases.
2. **The chapter numeral over the burst measured 1.04:1.** Amber on an amber
   core. The numeral takes the ink on a plate; the accent stays on the label.
3. **The colophon lead sentence sat on the event horizon.** It carried both
   `ob-wrap` and its own class, and `ob-wrap` has `margin-inline: auto`, which
   centres a 30rem column straight over the hole.
4. **A seam across the moon on a phone.** A corner scrim on a tall narrow frame
   is a nearly horizontal gradient line. Band scrim below 860px, which is what
   taste.md says both corner anchors become at that width anyway.
5. **The craters read as soap bubbles.** Flat grey discs with no lighting. Each
   crater now gets a gradient inverted against the outer rim highlight, which is
   what makes a bowl read as a hole, plus foreshortening along the radius from
   the disc centre rather than down the screen.

Final passes, desktop 1440x900, phone 390x844, and reduced motion: **no dead
scroll, nothing below 4.5:1, no console errors** on all three.

## Still not covered

No real phone. Four canvases now run rAF loops at once; headless Chrome says
nothing about what that costs an older device, and that is the first thing to
check on real hardware.
