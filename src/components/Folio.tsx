import { useEffect, useState } from 'react'
import { useActiveSection } from '@/lib/useActiveSection'

/**
 * The running head. A broadsheet carries its name, the section and the page
 * number across the top of every page, so this bar does the same job: a real
 * <nav> of real anchors, and the folio on the right turns over as each section
 * reaches the middle of the window.
 *
 * Over the night sheets it inverts with the page, so it never sits as a cream
 * strip on a black sheet.
 */

export type Section = { id: string; label: string; page: number }

export default function Folio({
  sections,
  name,
  cta,
  href,
}: {
  sections: Section[]
  name: string
  cta: string
  href: string
}) {
  const active = useActiveSection(sections.map((s) => s.id))
  const [night, setNight] = useState(false)

  useEffect(() => {
    let raf = 0
    // the bar reads whatever sheet sits directly under it
    const read = () => {
      raf = 0
      let dark = false
      document
        .querySelectorAll<HTMLElement>('[data-np-night]')
        .forEach((el) => {
          const b = el.getBoundingClientRect()
          if (b.top <= 30 && b.bottom >= 30) dark = true
        })
      setNight(dark)
    }
    const queue = () => {
      if (!raf) raf = requestAnimationFrame(read)
    }
    read()
    addEventListener('scroll', queue, { passive: true })
    addEventListener('resize', queue, { passive: true })
    return () => {
      cancelAnimationFrame(raf)
      removeEventListener('scroll', queue)
      removeEventListener('resize', queue)
    }
  }, [])

  const now = sections[active]

  return (
    <nav className="np-bar" data-night={night} aria-label="Sections">
      <div className="np-bar__inner">
        <a className="np-bar__name" href="#front">
          {name}
        </a>

        <ul className="np-bar__links">
          {sections.slice(1).map((s) => (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                aria-current={s.id === now.id ? 'true' : undefined}
              >
                {s.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="np-bar__end">
          <span className="np-bar__folio" aria-live="off">
            <span className="np-bar__sect">{now.label}</span>
            <span>P. {now.page}</span>
          </span>
          <a className="np-btn np-btn--ink np-btn--sm" href={href}>
            {cta}
          </a>
        </div>
      </div>
    </nav>
  )
}
