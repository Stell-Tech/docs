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
  { name: 'portal/programs/list', path: '/portal/programs' },
  {
    name: 'portal/programs/template-editor',
    path: '/portal/programs',
    clicks: ['main a[href^="/portal/programs/"]', 'text=Edit template'],
    waitForUrl: '**/template',
  },
  { name: 'portal/engage/overview', path: '/portal/engage' },
  { name: 'portal/engage/campaign-new', path: '/portal/engage/campaigns' },
  { name: 'portal/engage/automations', path: '/portal/engage/automations' },
  { name: 'portal/engage/contacts', path: '/portal/engage/contacts' },
  { name: 'portal/engage/templates', path: '/portal/engage/templates' },
  { name: 'portal/engage/notifications', path: '/portal/engage/notifications' },
  { name: 'portal/transactions/list', path: '/portal/transactions' },
  { name: 'portal/organization/overview', path: '/portal/organization' },
  { name: 'portal/account/api-keys', path: '/portal/api-keys' },
];
