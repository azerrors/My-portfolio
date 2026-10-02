/**
 * Every figure here comes from the CV. Nothing on this page is invented, which
 * is why every figure on the page can be checked against it.
 */

export const person = {
  name: 'Azer Naghiyev',
  role: 'Frontend Developer',
  place: 'Baku, Azerbaijan',
  email: 'azer.nagi.2005@gmail.com',
  phone: '+994 77 594 28 54',
  github: { label: 'github.com/azerrors', href: 'https://github.com/azerrors' },
  linkedin: {
    label: 'linkedin.com/in/azer-nagiyev',
    href: 'https://www.linkedin.com/in/azer-nagiyev',
  },
  cta: 'Write to me',
}

/** Chapter I. Absorption lines: elements actually present in shipped code. */
export const bands = [
  {
    id: 'lang',
    label: 'Languages',
    lines: ['HTML', 'CSS', 'JavaScript', 'TypeScript'],
  },
  {
    id: 'frame',
    label: 'Frameworks',
    lines: [
      'React 19',
      'Next.js',
      'TanStack Query',
      'React Hook Form',
      'Redux Toolkit',
      'Zustand',
      'Zod',
    ],
  },
  {
    id: 'ui',
    label: 'Styling and interface',
    lines: ['Tailwind CSS v4', 'shadcn/ui', 'Radix UI', 'SCSS Modules'],
  },
  {
    id: 'tools',
    label: 'Tooling',
    lines: [
      'REST APIs',
      'Axios',
      'i18next',
      'Recharts',
      'Vite',
      'Git',
      'GitHub',
      'Docker',
    ],
  },
]

/** Chapter II. Field notes, newest first. */
export const entries = [
  {
    org: 'Technosol MMC',
    place: 'Baku',
    title: 'Frontend Developer',
    dates: '05 / 2025 to present',
    body: [
      'Architected and delivered an ERP frontend alone: sales, procurement, inventory, budgeting and cash flow, across 47 pages and 46 API modules.',
      'One generic mutation factory replaced roughly 3,000 lines of duplicated boilerplate and now backs 209 mutation hooks, so cache invalidation and notifications live in a single place.',
      'A second product, a task platform, carries role based access over 25 permission codes and three synced views of the same data: table, drag and drop board, and calendar. Chat runs live on SignalR, written straight into the query cache.',
    ],
  },
  {
    org: 'NovoPharma (Aloe+)',
    place: 'Baku',
    title: 'Junior Frontend Developer',
    dates: '08 / 2024 to 04 / 2025',
    body: [
      'Built responsive interfaces and the reusable component layer under them, and wired the app to its REST API with server state handled properly rather than in component effects.',
    ],
  },
  {
    org: 'Avromed MMC',
    place: 'Baku',
    title: 'QA Intern',
    dates: '02 / 2024 to 08 / 2024',
    body: [
      'Manual testing of web applications across browsers, defect reports, and verification of the fixes that came back.',
    ],
  },
]

export const education = {
  degree: 'Bachelor of Industrial Engineering',
  school: 'Azerbaijan State University of Economics (UNEC)',
  dates: '09 / 2022 to 06 / 2026',
}

/** Chapter II. Measured figures. */
export const figures = [
  { value: '45,000', unit: 'lines', note: 'ERP frontend, delivered solo' },
  { value: '47', unit: 'pages', note: 'across 46 API modules' },
  { value: '209', unit: 'hooks', note: 'on one mutation factory' },
  { value: '1,529', unit: 'keys', note: 'typed, in 3 languages' },
]

/** Chapter III. Three real bodies. No fourth one was invented to fill the chart. */
export const worlds = [
  {
    id: 'erp',
    exhibit: 'A',
    designation: 'ERP-01',
    name: 'Enterprise resource planning',
    org: 'Technosol MMC',
    year: '2025',
    radius: 0.42,
    size: 1,
    tint: '#E9A23B',
    specs: [
      ['Scale', '≈45,000 lines, 47 pages'],
      ['Surface', '46 API modules, 51 code split routes'],
      ['Transport', 'Axios, silent token refresh, normalized errors'],
      ['Language', 'AZ / EN / RU, 1,529 typed keys'],
    ],
    note: 'Nine material movement types mapped to warehouse visibility, accounting postings and seven document types, held in one rule table instead of scattered through the pages.',
  },
  {
    id: 'task',
    exhibit: 'B',
    designation: 'TSK-02',
    name: 'Task and collaboration platform',
    org: 'Technosol MMC',
    year: '2025',
    radius: 0.66,
    size: 0.82,
    tint: '#D9DEE8',
    specs: [
      ['Access', '25 permission codes, route guards, <Can> gating'],
      ['Views', 'Table, dnd-kit board, FullCalendar, one source'],
      ['Live', 'SignalR, written into the infinite query cache'],
      ['Language', 'AZ / EN / RU, 780 keys, 15 namespaces'],
    ],
    note: 'Filters live in the URL and pagination happens on the server, so a view someone sends you is the view you get.',
  },
  {
    id: 'aloe',
    exhibit: 'C',
    designation: 'ALO-03',
    name: 'Aloe+ storefront',
    org: 'NovoPharma',
    year: '2024',
    radius: 0.88,
    size: 0.66,
    tint: '#9FB3A6',
    specs: [
      ['Scope', 'Responsive interfaces, reusable components'],
      ['Data', 'REST over Axios, server state across the app'],
      ['Role', 'First production work, first year'],
    ],
    note: 'The one where the habits started: components that get reused, and state that lives where it belongs.',
  },
]

/** The wire. Every line restates something already on this page. */
export const wire = [
  'Late final: one ERP frontend now runs sales, procurement, inventory and cash flow',
  '209 mutation hooks share a single factory',
  'Task platform keeps table, board and calendar on one source',
  'Chat arrives live over SignalR, straight into the query cache',
  'Three languages, 1,529 typed keys',
  'The desk is open for select work in 2026',
]

/** The first projects, built by hand before AI tools, as they were published. */
export const backIssues = [
  {
    name: 'Worldcom',
    href: 'https://worldcom.vercel.app/',
    shot: '/plates/work/worldcom.jpg',
    date: new Date(2023, 11, 20),
    note: 'Pick a place on the map and read its weather. Light and dark editions, °C or °F.',
  },
  {
    name: 'Movie App',
    href: 'https://movie-app-kgd6.vercel.app/',
    shot: '/plates/work/movie-app.jpg',
    date: new Date(2024, 0, 14),
    note: 'A film and series catalogue: trending, popular, search, accounts and a list of your own.',
  },
  {
    name: 'Metailcom',
    href: 'https://metailcom.vercel.app/',
    shot: '/plates/work/metailcom.jpg',
    date: new Date(2024, 1, 14),
    note: 'A recipe book for meals and cocktails: search, trending dishes, favourites and a basket.',
  },
]
