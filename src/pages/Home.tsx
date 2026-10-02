import { MotionConfig, motion, type Variants } from 'framer-motion'
import { useCallback, useMemo, useRef, useState } from 'react'
import ChalkBoard from '@/components/ChalkBoard'
import { ExhibitIndex, ExhibitPlate } from '@/components/Exhibits'
import Folio, { type Section } from '@/components/Folio'
import { Correction, HandNote } from '@/components/Handwriting'
import PageRack from '@/components/PageRack'
import LedgerEntries from '@/components/LedgerEntries'
import MeteorRail from '@/components/MeteorRail'
import DeskBackdrop from '@/components/DeskBackdrop'
import PagePlate from '@/components/PagePlate'
import StarField from '@/components/StarField'
import SystemChart from '@/components/SystemChart'
import {
  backIssues,
  bands,
  education,
  entries,
  figures,
  person,
  wire,
  worlds,
} from '@/data/site'
import { dateline, moonPhase } from '@/lib/edition'
import { penEnd, type Tok } from '@/lib/pen'
import { useScrollcraft } from '@/lib/useScrollcraft'
import { PenGate } from '@/lib/penGate'
import DeskIntro from '@/components/DeskIntro'
import { useSmoothScroll } from '@/lib/useSmoothScroll'

const SECTIONS: Section[] = [
  { id: 'front', label: 'Front page', page: 1 },
  { id: 'instruments', label: 'Lab report', page: 2 },
  { id: 'ignition', label: 'Ledger', page: 3 },
  { id: 'system', label: 'Exhibits', page: 4 },
  { id: 'colophon', label: 'Letters', page: 5 },
]

const NAMEPLATE = 'The Naghiyev Observer'

/** The page's first screen, as the intro's monitor shows it. */
const INTRO_SOURCES = ['header.np-mast', 'nav.np-bar', '#front']

/* The front page's pen time, in seconds from load. The headline is corrected
   first, then the deck is written in under it, then the editor signs off. */
const HEAD_FIX_1 = 1.1
const HEAD_FIX_2 = 2.3
const DECK_START = 3.2
const DECK: Tok[] = [
  'Two years in: he builds the layer that holds an application together at',
  { wrong: 'Technosoft', right: 'Technosol' },
  'in Baku, where one frontend now runs sales, procurement, inventory and cash flow.',
]

/* The night cover sets its headline like type dropped into a forme: each word
   rises out of its own slot, a beat after the last. */
const EASE = [0.22, 1, 0.36, 1] as const
const rise: Variants = {
  hidden: { y: '108%' },
  shown: { y: '0%', transition: { duration: 1.1, ease: EASE } },
}
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  shown: { opacity: 1, y: 0, transition: { duration: 0.9, ease: EASE } },
}

export default function Home() {
  const rootRef = useRef<HTMLDivElement>(null)
  const frontRef = useRef<HTMLElement>(null)
  const systemActRef = useRef<HTMLElement>(null)
  const plateRef = useRef<HTMLDivElement>(null)
  const colophonRef = useRef<HTMLElement>(null)

  const [active, setActive] = useState(0)
  const [hintSpent, setHintSpent] = useState(false)

  // The intro is motion; without motion the page opens on its front page and
  // the pen is free at once.
  const [intro] = useState(
    () => !matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  const [penGo, setPenGo] = useState(!intro)
  const onEnter = useCallback(() => setPenGo(true), [])
  const onSelect = useCallback((index: number, byPointer: boolean) => {
    setActive(index)
    if (byPointer) setHintSpent(true)
  }, [])

  useScrollcraft(rootRef)
  useSmoothScroll()

  const today = useMemo(() => new Date(), [])
  const world = worlds[active]
  const mail = `mailto:${person.email}`

  return (
    <MotionConfig reducedMotion="user">
      <PenGate.Provider value={penGo}>
        <div className="ob np" ref={rootRef}>
          <a className="ob-skip" href="#colophon">
            Skip to contact
          </a>

          <DeskBackdrop />
          <StarField settleRef={colophonRef} />
          <div className="np-paper" aria-hidden="true" />

          {/* ======================================== the way in: the desk */}
          {intro ? (
            <DeskIntro sources={INTRO_SOURCES} onEnter={onEnter} />
          ) : null}

          {/* ================================================ the nameplate */}
          <header
            className={intro ? 'np-mast np-mast--after-intro' : 'np-mast'}
          >
            <div className="np-wrap">
              <div className="np-mast__ears">
                <p>Baku, Azerbaijan</p>
                <p>The Celestial Edition</p>
                <p>Est. 2024</p>
              </div>
              <p className="np-nameplate">{NAMEPLATE}</p>
              <p className="np-mast__motto">
                The personal record of a frontend developer
              </p>
              <div className="np-mast__dateline">
                <span>{dateline(today)}</span>
                <span>Vol. II · No. 45,000</span>
                <span>Sky over Baku: {moonPhase(today)}</span>
                <span>Price: one pull request</span>
              </div>
            </div>
          </header>

          <Folio
            sections={SECTIONS}
            name={NAMEPLATE}
            cta={person.cta}
            href={mail}
          />

          <PageRack sections={SECTIONS} />

          <main>
            {/* ======================================== front page. The lead. */}
            <section
              id="front"
              className="np-front"
              data-sc-act="flow"
              ref={frontRef}
            >
              <div className="np-wrap np-front__grid">
                <article className="np-lead">
                  <p className="np-kicker">
                    <span className="np-kicker__red">Front page</span>
                    <span>Filed under: systems, not screens</span>
                  </p>
                  {/* A proof, not a print: the misprints are set in type, and the
                    editor's pen corrects them in front of the reader. */}
                  <h1 className="np-headline">
                    <span className="np-sr">
                      {person.name}, frontend developer, ships a 45,000-line ERP
                      frontend alone.
                    </span>
                    <span aria-hidden="true">
                      {person.name}, frontend developer, ships a{' '}
                      <span className="np-nowrap">
                        <Correction
                          wrong="4,500"
                          right="45,000"
                          at={HEAD_FIX_1}
                        />
                        &#8209;line
                      </span>{' '}
                      ERP frontend{' '}
                      <Correction
                        wrong="with a team."
                        right="alone."
                        at={HEAD_FIX_2}
                      />
                    </span>
                  </h1>
                  <p className="np-deck np-deck--hand">
                    <span className="np-sr">
                      Two years in: he builds the layer that holds an
                      application together at Technosol in Baku, where one
                      frontend now runs sales, procurement, inventory and cash
                      flow.
                    </span>
                    <HandNote
                      tokens={DECK}
                      start={DECK_START}
                      className="np-hand"
                    />
                  </p>
                  <p className="np-byline">
                    By <b>the observatory desk</b>
                    <span aria-hidden="true">·</span>
                    Reporting from Baku, between Technosol and UNEC
                    <HandNote
                      tokens={['Checked & approved, A.N. ✓']}
                      start={penEnd(DECK, DECK_START) + 0.3}
                      className="np-hand np-hand--sign"
                    />
                  </p>
                  <div className="np-actions">
                    <a className="np-btn np-btn--ink" href="#ignition">
                      Read the ledger <span aria-hidden="true">→</span>
                    </a>
                    <a className="np-btn" href={mail}>
                      {person.cta}
                    </a>
                  </div>
                </article>

                <aside className="np-front__side">
                  <figure className="np-photo np-photo--portrait">
                    <div className="np-photo__print">
                      <img
                        data-sc-p
                        src="/plates/portrait.webp"
                        width={793}
                        height={793}
                        alt="Ink drawing of Azer Naghiyev at his desk, typing on an old computer with a coffee beside him"
                        fetchPriority="high"
                        decoding="async"
                      />
                    </div>
                    <figcaption>
                      <b>Pictured:</b> the subject at his desk in Baku, coffee
                      within reach.
                    </figcaption>
                  </figure>
                  <div className="np-copy np-copy--drop">
                    <p>
                      He likes the part of the job most people skip: the data
                      layer, the permissions, the forms that refuse bad input,
                      and the cache that keeps every screen honest. React 19 and
                      TypeScript on top, TanStack Query on the wire, Tailwind on
                      the surface.
                    </p>
                  </div>
                </aside>

                <dl className="np-index">
                  {figures.map((f) => (
                    <div key={f.value}>
                      <dt className="np-index__u">
                        {f.unit} · {f.note}
                      </dt>
                      <dd className="np-index__n">{f.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </section>

            {/* ======================================================= the wire */}
            <div className="np-wire" aria-label="Latest from the wire">
              <span className="np-wire__tag">The wire</span>
              <div className="np-wire__track">
                {[0, 1].map((copy) => (
                  <p key={copy} aria-hidden={copy === 1 ? 'true' : undefined}>
                    {wire.map((line) => (
                      <span key={line}>
                        {line}
                        <i aria-hidden="true">✶</i>
                      </span>
                    ))}
                  </p>
                ))}
              </div>
            </div>

            {/* ==================== the lab report. Samples fall, cards open. */}
            <section
              id="instruments"
              className="np-lab"
              data-sc-act="pan"
              data-sc-span="3.4"
              data-np-night
            >
              <div className="np-lab__stage" data-sc-stage>
                <p className="np-runhead">
                  <span>
                    <b>P. 2</b> Forensics / the lab report
                  </span>
                  <span>
                    Substances detected on the subject, as of this edition
                  </span>
                </p>

                <MeteorRail bands={bands} />
              </div>
            </section>

            {/* ================== special report. The plate opens to the page. */}
            <section
              id="ignition"
              className="np-special"
              data-sc-act="pin"
              data-sc-span="4.2"
            >
              <div className="np-special__stage" data-sc-stage>
                <p className="np-special__over" aria-hidden="true" data-sc-p>
                  <span>Special report</span>
                  <span>Fig. 2, the full moon</span>
                </p>
                <div className="np-special__frame" data-sc-p>
                  <div className="np-moon" aria-hidden="true" data-sc-p>
                    <img
                      src="/plates/moon.webp"
                      width={770}
                      height={772}
                      alt=""
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                  <div className="np-special__col">
                    <ChalkBoard issues={backIssues} />
                    <div className="np-special__read">
                      <p
                        className="np-kicker np-kicker--paper"
                        data-sc-cue="0.3"
                      >
                        <span className="np-kicker__red">
                          P. 3 · Known whereabouts
                        </span>
                      </p>
                      <h2 className="np-special__title" data-sc-cue="0.36">
                        Start with the <em>nearest</em> thing.
                      </h2>
                      <p className="np-special__note" data-sc-cue="0.46">
                        Before the systems and the figures: three roles between
                        February 2024 and now, every one of them in Baku. The
                        ledger follows.
                      </p>
                    </div>
                  </div>
                </div>
                <p className="np-special__cap" data-sc-p>
                  <b>Fig. 2.</b> The nearest body, engraved at full phase. Keep
                  scrolling; the plate opens.
                </p>
              </div>
            </section>

            {/* ============================================ the career ledger. */}
            <section id="field-notes" className="np-ledger" data-sc-act="flow">
              <div className="np-wrap">
                <header className="np-sechead" data-sc-in>
                  <div>
                    <p className="np-kicker">
                      <span className="np-kicker__red">Known whereabouts</span>
                    </p>
                    <h2 className="np-h2">The Career Ledger</h2>
                  </div>
                  <p className="np-sechead__aside">
                    Movements on record since 2024
                  </p>
                </header>

                <div className="np-ledger__grid">
                  <LedgerEntries entries={entries} />

                  <aside className="np-ledger__side">
                    <figure className="np-figure">
                      <div className="np-figure__frame">
                        <div data-sc-reveal="up" data-sc-reveal-at="0.12 0.4">
                          <PagePlate />
                        </div>
                      </div>
                      <figcaption>
                        <b>Plate 1.</b> The ERP frontend, drawn to scale. Upper
                        register: the 47 pages, by relative size. Lower
                        register: the 46 API modules behind them.
                      </figcaption>
                    </figure>

                    <div className="np-box" data-sc-in>
                      <p className="np-box__label">Schooling</p>
                      <p className="np-box__title">{education.degree}</p>
                      <p>{education.school}</p>
                      <p className="np-box__meta">{education.dates}</p>
                    </div>
                  </aside>
                </div>
              </div>
            </section>

            {/* ================================ the night edition. Its cover. */}
            <section id="system" className="np-night-cover" data-np-night>
              <motion.div
                className="np-wrap"
                initial="hidden"
                whileInView="shown"
                viewport={{ once: true, amount: 0.45 }}
                transition={{ staggerChildren: 0.09 }}
              >
                <motion.p
                  className="np-kicker np-kicker--paper"
                  variants={fadeUp}
                >
                  <span className="np-kicker__red">P. 4 · The evidence</span>
                  <span>Exhibits A to C · entered 2024 to now</span>
                </motion.p>
                <h2 className="np-night-cover__title">
                  {['The', 'Night', 'Edition'].map((word, i) => (
                    <span className="np-mask" key={word}>
                      <motion.span
                        variants={rise}
                        className={i === 2 ? 'np-em' : undefined}
                      >
                        {word}
                      </motion.span>
                    </span>
                  ))}
                </h2>
                <motion.p className="np-night-cover__note" variants={fadeUp}>
                  Three projects, set in orbit. Scroll and each comes round to
                  the front. On a mouse your pointer has mass: bring it near a
                  world and pull it out of its orbit.
                </motion.p>
              </motion.div>
            </section>

            {/* ======================================== the peak. The system. */}
            <section
              className="np-system"
              data-sc-act="pin"
              data-sc-span="4.4"
              data-np-night
              ref={systemActRef}
            >
              <div className="ob-system" data-sc-stage>
                <p className="np-runhead">
                  <span>
                    <b>P. 4</b> The evidence / plate III, the system
                  </span>
                  <span>Engraved from scroll, corrected by hand</span>
                </p>
                <SystemChart
                  actRef={systemActRef}
                  plateRef={plateRef}
                  onSelect={onSelect}
                />

                <p className="ob-system__hint" data-spent={hintSpent}>
                  Move the pointer. It has mass.
                </p>

                <ExhibitPlate world={world} plateRef={plateRef} />
                <ExhibitIndex items={worlds} active={active} />
              </div>
            </section>

            {/* ===================================== letters and commissions. */}
            <section
              id="colophon"
              className="np-letters"
              data-sc-act="flow"
              ref={colophonRef}
            >
              <div className="np-wrap">
                <header className="np-sechead" data-sc-in>
                  <div>
                    <p className="np-kicker">
                      <span className="np-kicker__red">
                        P. 5 · Submit a tip
                      </span>
                    </p>
                    <h2 className="np-h2">Letters &amp; Commissions</h2>
                  </div>
                  <p className="np-sechead__aside">
                    The desk is open for select work, 2026
                  </p>
                </header>

                <div className="np-letters__grid">
                  <div
                    className="np-letters__copy"
                    data-sc-in
                    data-sc-stagger="70"
                  >
                    <h3 className="np-letters__title">
                      Put it in <em>writing.</em>
                    </h3>
                    <p className="np-deck np-deck--plain">
                      A system that needs building, a role to fill, or a good
                      question. Send it to the desk.
                    </p>
                    <a className="np-btn np-btn--ink np-btn--lg" href={mail}>
                      {person.cta} <span aria-hidden="true">→</span>
                    </a>
                  </div>

                  <dl className="np-desk" data-sc-in>
                    <div>
                      <dt>Direct line</dt>
                      <dd>
                        <a className="np-link" href={mail}>
                          {person.email}
                        </a>
                      </dd>
                      <dd>{person.phone}</dd>
                    </div>
                    <div>
                      <dt>Wire services</dt>
                      <dd>
                        <a
                          className="np-link"
                          href={person.github.href}
                          rel="noreferrer noopener"
                        >
                          {person.github.label}
                        </a>
                      </dd>
                      <dd>
                        <a
                          className="np-link"
                          href={person.linkedin.href}
                          rel="noreferrer noopener"
                        >
                          {person.linkedin.label}
                        </a>
                      </dd>
                    </div>
                    <div>
                      <dt>The desk</dt>
                      <dd>{person.place}</dd>
                      <dd>GMT+4, working with teams anywhere</dd>
                    </div>
                  </dl>
                </div>

                <figure className="np-photo np-photo--hole">
                  <div className="np-hole">
                    <div className="np-hole__zoom" data-sc-p>
                      <img
                        src="/plates/black-hole.webp"
                        width={891}
                        height={446}
                        alt="Engraving of a black hole, its bright disk bent over and under the dark centre"
                        loading="lazy"
                        decoding="async"
                      />
                      <span className="np-hole__spin" aria-hidden="true" />
                    </div>
                  </div>
                  <figcaption>
                    <b>Fig. 4.</b> A black hole, engraved at the end of the
                    edition. Unlike this one, the address above lets things back
                    out.
                  </figcaption>
                </figure>
              </div>
            </section>
          </main>

          {/* ============================================================ footer */}
          <footer className="np-foot" data-np-night>
            <div className="np-wrap">
              <p className="np-foot__plate">{NAMEPLATE}</p>
              <div className="np-foot__grid">
                <p className="np-foot__about">
                  The personal record of {person.name}, a frontend developer in
                  Baku. Two years of shipped React and TypeScript, one ERP
                  delivered alone. This broadsheet is set in Caslon and
                  Franklin.
                </p>
                <div>
                  <p className="np-foot__label">Sections</p>
                  <ul>
                    {SECTIONS.slice(1).map((s) => (
                      <li key={s.id}>
                        <a href={`#${s.id}`}>{s.label}</a>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="np-foot__label">Wire services</p>
                  <ul>
                    <li>
                      <a href={person.github.href} rel="noreferrer noopener">
                        GitHub
                      </a>
                    </li>
                    <li>
                      <a href={person.linkedin.href} rel="noreferrer noopener">
                        LinkedIn
                      </a>
                    </li>
                    <li>
                      <a href={mail}>Email</a>
                    </li>
                  </ul>
                </div>
              </div>
              <p className="np-foot__end" aria-hidden="true">
                — 30 —
              </p>
              <p className="np-foot__legal">
                © {today.getFullYear()} {NAMEPLATE} · All rights reserved ·
                Printed in Baku
              </p>
            </div>
          </footer>
        </div>
      </PenGate.Provider>
    </MotionConfig>
  )
}
