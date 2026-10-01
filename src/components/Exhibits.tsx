import { AnimatePresence, motion, type Variants } from 'framer-motion'
import type { worlds } from '@/data/site'

type World = (typeof worlds)[number]

/**
 * The clipping for whichever world is at the front. When the selection
 * changes the old clipping is pulled off the sheet, up and away, and the new
 * one is slapped down over it from below, its rows settling a beat apart and
 * the desk stamp landing last. Springs, not durations, so a quick run of
 * changes interrupts cleanly instead of queueing.
 */

const SHEET = {
  type: 'spring',
  stiffness: 240,
  damping: 26,
  mass: 0.9,
} as const

const clipping: Variants = {
  enter: { opacity: 0, y: 70, rotate: 5, scale: 0.96 },
  rest: {
    opacity: 1,
    y: 0,
    rotate: -1.2,
    scale: 1,
    transition: { ...SHEET, staggerChildren: 0.05, delayChildren: 0.12 },
  },
  leave: {
    opacity: 0,
    x: -70,
    y: -50,
    rotate: -9,
    transition: { duration: 0.32, ease: [0.4, 0, 1, 1] },
  },
}

const row: Variants = {
  enter: { opacity: 0, x: -12 },
  rest: { opacity: 1, x: 0, transition: SHEET },
}

const stamp: Variants = {
  enter: { opacity: 0, scale: 2.4, rotate: -14 },
  rest: {
    opacity: 0.85,
    scale: 1,
    rotate: 8,
    transition: { type: 'spring', stiffness: 520, damping: 18, delay: 0.42 },
  },
}

export function ExhibitPlate({
  world,
  plateRef,
}: {
  world: World
  plateRef: React.RefObject<HTMLDivElement | null>
}) {
  return (
    <div className="ob-system__plate" ref={plateRef}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.article
          className="ob-system__body"
          key={world.id}
          variants={clipping}
          initial="enter"
          animate="rest"
          exit="leave"
        >
          <motion.p className="ob-system__desig" variants={row}>
            <span>Exhibit {world.exhibit}</span>
            <span>
              {world.org} / {world.year}
            </span>
          </motion.p>
          <motion.h3 className="ob-system__name" variants={row}>
            {world.name}
          </motion.h3>
          <dl className="ob-specs">
            {world.specs.map(([k, v]) => (
              <motion.div key={k} variants={row}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </motion.div>
            ))}
          </dl>
          <motion.p className="ob-system__note" variants={row}>
            {world.note}
          </motion.p>
          <motion.p className="ob-system__stamp" variants={stamp}>
            {world.designation}
          </motion.p>
        </motion.article>
      </AnimatePresence>
    </div>
  )
}

/** The exhibit index. The red rule slides to whichever entry is live. */
export function ExhibitIndex({
  items,
  active,
}: {
  items: readonly World[]
  active: number
}) {
  return (
    <ul className="ob-system__index">
      {items.map((wd, i) => (
        <li key={wd.id} data-on={i === active}>
          {i === active ? (
            <motion.span
              className="ob-system__mark"
              layoutId="exhibit-mark"
              transition={SHEET}
            />
          ) : null}
          <b>{wd.exhibit}</b> {wd.designation}
        </li>
      ))}
    </ul>
  )
}
