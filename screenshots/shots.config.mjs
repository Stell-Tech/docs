// Declarative list of screenshots to capture from the staging merchant portal.
// name → output file images/<name>.png; path → portal route to visit.
// Optional: waitFor (CSS selector to await), clicks (selectors clicked in order
// before capture, e.g. to open a dialog), fullPage (default false),
// collapseSidebar (collapse the nav sidebar before capture, default false),
// url (absolute URL for public pages outside the portal; replaces path and
// skips the login check), scrollTo (selector aligned to the viewport top).
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
    name: 'portal/programs/detail',
    path: '/portal/programs',
    clicks: ['main a[href^="/portal/programs/"]'],
    waitForUrl: '**/portal/programs/*',
  },
  // The template editor is wide; collapse the sidebar so the live preview
  // and settings panel fit the frame.
  {
    name: 'portal/programs/template-editor',
    path: '/portal/programs',
    clicks: ['main a[href^="/portal/programs/"]', 'text=Edit template'],
    waitForUrl: '**/template',
    collapseSidebar: true,
  },
  {
    name: 'portal/pass-templates/design-tab',
    path: '/portal/programs',
    clicks: ['main a[href^="/portal/programs/"]', 'text=Edit template', 'button:has-text("Design")'],
    waitForUrl: '**/template',
    collapseSidebar: true,
  },
  {
    name: 'portal/pass-templates/content-tab',
    path: '/portal/programs',
    clicks: ['main a[href^="/portal/programs/"]', 'text=Edit template', 'button:has-text("Content")'],
    waitForUrl: '**/template',
    collapseSidebar: true,
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
  // The wallet widget configurator is a public launchpad page, captured from
  // the develop environment via an absolute `url` (no portal session needed).
  // Query params seed the form and select the tab; `scrollTo` skips the hero.
  {
    name: 'embed/configurator-site',
    url: 'https://develop.stell.in/embed/configurator?nanoId=IpGeE4Bh&identifier=8e4a00f7-e6da-4048-9684-b42801178375',
    waitFor: 'text=Drop it on any page',
    scrollTo: '[role="tablist"]',
  },
  {
    name: 'embed/configurator-email',
    url: 'https://develop.stell.in/embed/configurator?nanoId=IpGeE4Bh&identifier=8e4a00f7-e6da-4048-9684-b42801178375&tab=link',
    waitFor: 'text=Email links',
    scrollTo: '[role="tablist"]',
  },
];
