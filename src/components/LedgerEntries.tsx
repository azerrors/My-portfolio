import { motion, useScroll, useSpring, type Variants } from 'framer-motion'
import { useRef } from 'react'
import Typewriter from '@/components/Typewriter'
import type { entries as Entries } from '@/data/site'

/**
 * The career ledger as a dossier. A spine runs down the left margin and is
 * inked in red as the reader goes down it; each role is a typed sheet that is
 * slid onto the desk, filed with a rubber stamp, and then typed out line by
 * line. The year stays pinned beside its sheet for as long as the sheet is on
 * screen, the way a file tab sticks out of a drawer.
 */

type Entry = (typeof Entries)[number]

const EASE = [0.22, 1, 0.36, 1] as const

const sheet: Variants = {
  hidden: { opacity: 0, y: 70, rotate: 2.5 },
  shown: (i: number) => ({
    opacity: 1,
    y: 0,
    rotate: i % 2 ? 0.5 : -0.7,
    transition: {
      type: 'spring',
      stiffness: 120,
      damping: 20,
      staggerChildren: 0.08,
      delayChildren: 0.15,
    },
  }),
}
const rise: Variants = {
  hidden: { y: '105%' },
  shown: { y: '0%', transition: { duration: 0.9, ease: EASE } },
}
const fade: Variants = {
  hidden: { opacity: 0, x: -10 },
  shown: { opacity: 1, x: 0, transition: { duration: 0.6, ease: EASE } },
}
const stamp: Variants = {
  hidden: { opacity: 0, scale: 2.3, rotate: -16 },
  shown: {
    opacity: 0.88,
    scale: 1,
    rotate: -6,
    transition: { type: 'spring', stiffness: 520, damping: 17, delay: 0.55 },
  },
}

const yearOf = (dates: string) => dates.match(/\d{4}/)?.[0] ?? ''

export default function LedgerEntries({ entries }: { entries: Entry[] }) {
  const listRef = useRef<HTMLOListElement>(null)
  const { scrollYProgress } = useScroll({
    target: listRef,
    offset: ['start 75%', 'end 55%'],
  })
  const ink = useSpring(scrollYProgress, { stiffness: 140, damping: 30 })

  return (
    <ol className="np-entries" ref={listRef}>
      <span className="np-spine" aria-hidden="true">
        <motion.span className="np-spine__ink" style={{ scaleY: ink }} />
      </span>

      {entries.map((entry, i) => (
        <li className="np-entry" key={entry.org}>
          <div className="np-entry__rail">
            <motion.span
              className="np-entry__node"
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true, amount: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 18 }}
            />
            <span className="np-entry__year">{yearOf(entry.dates)}</span>
          </div>

          <motion.article
            className="np-sheet"
            custom={i}
            variants={sheet}
            initial="hidden"
            whileInView="shown"
            viewport={{ once: true, amount: 0.25 }}
          >
            <span className="np-sheet__holes" aria-hidden="true" />

            <motion.p className="np-sheet__file" variants={fade}>
              File No. {String(i + 1).padStart(2, '0')}
              <span>
                {entry.org} / {entry.place}
              </span>
            </motion.p>

            <h3 className="np-sheet__title">
              <motion.span variants={rise}>{entry.title}</motion.span>
            </h3>

            <motion.p className="np-sheet__stamp" variants={stamp}>
              {entry.dates}
            </motion.p>

            <Typewriter
              className={
                entry.body.length > 1
                  ? 'np-typewriter np-typewriter--cols'
                  : 'np-typewriter'
              }
              paragraphs={entry.body}
            />
          </motion.article>
        </li>
      ))}
    </ol>
  )
}
