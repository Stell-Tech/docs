// Declarative list of screenshots to capture from the staging merchant portal.
// name → output file images/<name>.png; path → portal route to visit.
// Optional: waitFor (CSS selector to await), clicks (selectors clicked in order
// before capture, e.g. to open a dialog), fullPage (default false).
export default [
  { name: 'portal/getting-started/dashboard', path: '/portal' },
  { name: 'portal/passes/list', path: '/portal/passes', waitFor: 'table' },
  {
    name: 'portal/passes/issue-dialog',
    path: '/portal/passes',
    waitFor: 'table',
    clicks: ['button:has-text("Issue pass")'],
  },
  {
    name: 'portal/passes/detail',
    path: '/portal/passes',
    waitFor: 'table',
    clicks: ['table tbody tr'],
    waitForUrl: '**/portal/passes/*',
  },
];
