import { useEffect, useRef } from 'react'
import { BurstCut, MeteorCut, SpecimenIcon } from '@/components/Woodcuts'

/**
 * P. 2, the lab report. Each sample arrives the way a sample from the sky
 * would: as a meteor. It falls into its slot on the rail, strikes, and the card
 * unrolls from the point of impact, then its findings land one by one.
 *
 * Nothing here is on a timer. Every card owns one number, --fall, worked out
 * from where that card actually is on screen: how far it has come in from the
 * right edge as the rail pans, and how far the stage has risen into view. So
 * the first cards fall as the sheet arrives, the later ones as the rail carries
 * them in, and scrolling back up runs the whole thing in reverse.
 */

export type Band = { id: string; label: string; lines: string[] }

const pad = (n: number) => String(n).padStart(2, '0')
const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x)

export default function MeteorRail({ bands }: { bands: Band[] }) {
  const railRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const rail = railRef.current
    if (!rail) return
    const cards = Array.from(rail.querySelectorAll<HTMLElement>('.np-skill'))
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) {
      cards.forEach((c) => c.style.setProperty('--fall', '1'))
      return
    }

    const cur = cards.map(() => 0)
    let raf = 0
    const frame = () => {
      const vw = innerWidth
      const vh = innerHeight
      cards.forEach((card, i) => {
        const r = card.getBoundingClientRect()
        const fx = clamp01((vw * 0.98 - r.left) / (vw * 0.5))
        const fy = clamp01((vh * 0.92 - r.top) / (vh * 0.6))
        const target = Math.min(fx, fy)
        // eased toward the target, so a fast flick still reads as a fall with
        // weight rather than a card that snaps open
        const next = cur[i] + (target - cur[i]) * 0.11
        if (
          Math.abs(next - cur[i]) > 0.0004 ||
          (target === 1 && cur[i] !== 1)
        ) {
          cur[i] = Math.abs(target - next) < 0.001 ? target : next
          card.style.setProperty('--fall', cur[i].toFixed(4))
        }
      })
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <div className="ob-rail np-meteors" data-sc-pan="0.04" ref={railRef}>
      <div className="ob-rail__head">
        <p className="np-kicker np-kicker--paper">
          <span className="np-kicker__red">Forensics</span>
          <span>Samples recovered: {pad(bands.length)}</span>
        </p>
        <h2 className="np-h2">
          The Lab <em>Report</em>
        </h2>
        <p className="np-lab__lede">
          Everything here fell out of real projects. Each sample came down in
          production code, and every finding on its card is something that
          shipped.
        </p>
      </div>

      {bands.map((band, bi) => (
        <article
          className="np-skill"
          key={band.id}
          style={
            {
              '--rot': `${bi % 2 ? 1.4 : -1.6}deg`,
            } as React.CSSProperties
          }
        >
          <span className="np-skill__meteor" aria-hidden="true">
            <MeteorCut uid={band.id} />
          </span>
          <span className="np-skill__impact" aria-hidden="true">
            <BurstCut />
          </span>

          <div className="np-skill__card">
            <header className="np-skill__head">
              <span className="np-skill__medal">
                <SpecimenIcon kind={band.id} />
              </span>
              <div>
                <p className="np-skill__tag">
                  <b>Specimen {String.fromCharCode(65 + bi)}</b>
                  <span>Recovered, Baku</span>
                </p>
                <h3 className="np-skill__title">{band.label}</h3>
              </div>
            </header>
            <p className="np-skill__assay">
              <span>Findings</span>
              <b>{pad(band.lines.length)}</b>
            </p>
            <ol className="np-skill__list">
              {band.lines.map((line, li) => (
                <li key={line} style={{ '--j': li } as React.CSSProperties}>
                  <span className="np-skill__no">{pad(li + 1)}</span>
                  <span className="np-skill__name">{line}</span>
                  <i aria-hidden="true" />
                  <small>
                    {String.fromCharCode(65 + bi)}.{pad(li + 1)}
                  </small>
                </li>
              ))}
            </ol>
            <footer className="np-skill__foot">
              <span>Confirmed in shipped code</span>
              <b className="np-skill__seal">Verified</b>
            </footer>
          </div>
        </article>
      ))}

      <div className="ob-rail__tail">
        <p>
          Findings are not aspirational. Each one appears in code that shipped
          and is still running.
        </p>
      </div>
    </div>
  )
}
