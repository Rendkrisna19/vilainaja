const base = {
  width: 18,
  height: 18,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
}

export const ArrowUpRight = (p) => (<svg {...base} {...p}><path d="M7 17 17 7M8 7h9v9" /></svg>)
export const ArrowLeft = (p) => (<svg {...base} {...p}><path d="M19 12H5m6-6-6 6 6 6" /></svg>)
export const ArrowRight = (p) => (<svg {...base} {...p}><path d="M5 12h14m-6-6 6 6-6 6" /></svg>)
export const Calendar = (p) => (<svg {...base} {...p}><rect x="3.5" y="5" width="17" height="15" rx="3" /><path d="M8 3v4M16 3v4M3.5 10h17" /></svg>)
export const Users = (p) => (<svg {...base} {...p}><circle cx="9" cy="8" r="3.2" /><path d="M3 20c.5-3.4 3-5 6-5s5.5 1.6 6 5M16 5.2a3 3 0 0 1 0 5.6M18 15.4c1.8.6 2.8 2.2 3 4.6" /></svg>)
export const Bed = (p) => (<svg {...base} {...p}><path d="M3 18V7M3 14h18v4M21 14v-2a3 3 0 0 0-3-3h-7v5" /><circle cx="7" cy="11" r="1.6" /></svg>)
export const Ruler = (p) => (<svg {...base} {...p}><rect x="3" y="3" width="18" height="18" rx="3" /><path d="M3 9h4M3 15h4M9 3v4M15 3v4" /></svg>)
export const Door = (p) => (<svg {...base} {...p}><path d="M6 21V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v17M4 21h16" /><circle cx="14.5" cy="12.5" r=".6" fill="currentColor" /></svg>)
export const Star = (p) => (<svg {...base} fill="currentColor" strokeWidth={0} {...p}><path d="m12 2.8 2.7 5.9 6.4.7-4.8 4.3 1.4 6.3L12 16.7 6.3 20l1.4-6.3L2.9 9.4l6.4-.7z" /></svg>)
export const Menu = (p) => (<svg {...base} {...p}><path d="M4 8h16M4 16h16" /></svg>)
export const Close = (p) => (<svg {...base} {...p}><path d="M6 6l12 12M18 6 6 18" /></svg>)
