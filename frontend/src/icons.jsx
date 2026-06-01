const s = { stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round', fill: 'none' }

export const IcoCheck = ({ className }) => <svg className={className} viewBox="0 0 24 24" {...s}><path d="M20 6L9 17l-5-5"/></svg>
export const IcoClose = ({ className }) => <svg className={className} viewBox="0 0 24 24" {...s}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
export const IcoPlus = ({ className }) => <svg className={className} viewBox="0 0 24 24" {...s}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
export const IcoMinus = ({ className }) => <svg className={className} viewBox="0 0 24 24" {...s}><line x1="5" y1="12" x2="19" y2="12"/></svg>
export const IcoArrowRight = ({ className }) => <svg className={className} viewBox="0 0 24 24" {...s}><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg>
export const IcoArrowLeft = ({ className }) => <svg className={className} viewBox="0 0 24 24" {...s}><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>

export const IcoSuccess = ({ className }) => <svg className={className} viewBox="0 0 24 24" {...s}><circle cx="12" cy="12" r="10"/><path d="M16 8l-5.5 8L8 13"/></svg>
export const IcoError = ({ className }) => <svg className={className} viewBox="0 0 24 24" {...s}><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
export const IcoWarning = ({ className }) => <svg className={className} viewBox="0 0 24 24" {...s}><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
export const IcoInfo = ({ className }) => <svg className={className} viewBox="0 0 24 24" {...s}><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>

export const IcoChart = ({ className }) => <svg className={className} viewBox="0 0 24 24" {...s}><rect x="3" y="12" width="4" height="9"/><rect x="10" y="7" width="4" height="14"/><rect x="17" y="3" width="4" height="18"/></svg>
export const IcoClipboard = ({ className }) => <svg className={className} viewBox="0 0 24 24" {...s}><rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"/><line x1="8" y1="10" x2="16" y2="10"/><line x1="8" y1="14" x2="16" y2="14"/><line x1="8" y1="18" x2="12" y2="18"/></svg>
export const IcoCalendar = ({ className }) => <svg className={className} viewBox="0 0 24 24" {...s}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>

export const IcoDownload = ({ className }) => <svg className={className} viewBox="0 0 24 24" {...s}><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
export const IcoTrash = ({ className }) => <svg className={className} viewBox="0 0 24 24" {...s}><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
export const IcoPalm = ({ className }) => <svg className={className} viewBox="0 0 24 24" {...s}><path d="M12 2v12M12 14c-4-2-8-1-10 2M12 14c4-2 8-1 10 2M12 9c-2-2-2-5 0-7M12 9c2-2 2-5 0-7"/><path d="M12 14v6M8 22h8"/></svg>

export const IcoDrink = ({ className }) => <svg className={className} viewBox="0 0 24 24" {...s}><path d="M6 2l8 10v8c0 1.1.9 2 2 2h2"/><path d="M18 22c1.1 0 2-.9 2-2v-8L12 2"/><path d="M6 12h12"/></svg>
export const IcoSparkle = ({ className }) => <svg className={className} viewBox="0 0 24 24" {...s}><path d="M12 3c0 0 2 4 6 6s-6 2-6 6c0-4-2-6-6-6s6-2 6-6"/></svg>
export const IcoDishes = ({ className }) => <svg className={className} viewBox="0 0 24 24" {...s}><circle cx="12" cy="12" r="9"/><path d="M8 12c0-2.2 1.8-4 4-4s4 1.8 4 4"/><line x1="3" y1="3" x2="6" y2="6"/><line x1="21" y1="3" x2="18" y2="6"/></svg>
export const IcoCandy = ({ className }) => <svg className={className} viewBox="0 0 24 24" {...s}><path d="M12 2C8 2 4 4 2 8c0 3 1 5 4 7 3 2 5 4 6 7 1-3 3-5 6-7 3-2 4-4 4-7-2-4-6-6-10-6z"/></svg>
export const IcoPalette = ({ className }) => <svg className={className} viewBox="0 0 24 24" {...s}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><circle cx="8" cy="8" r="1.5" fill="currentColor"/><circle cx="16" cy="8" r="1.5" fill="currentColor"/><circle cx="8" cy="16" r="1.5" fill="currentColor"/><circle cx="16" cy="16" r="1.5" fill="currentColor"/></svg>
export const IcoSearch = ({ className }) => <svg className={className} viewBox="0 0 24 24" {...s}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
