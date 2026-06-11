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
  // The customer enrollment flow (Mintleaf demo program on develop), captured
  // as an emulated iPhone in English (`mobile: true` sets both). The success
  // and welcome shots SUBMIT a real enrollment — each run creates a throwaway
  // test member; the unique email keeps re-runs on the new-member path
  // instead of the existing-member verification branch.
  ...enrollmentShots(),
];

function enrollmentShots() {
  const url = 'https://develop.stell.in/p/IpGeE4Bh';
  // Each enrollment attempt needs a fresh email — submitting the same address
  // twice (across shots, or on a shot retry) would route the second attempt
  // to existing-member verification instead. The function value is evaluated
  // per attempt by capture.mjs.
  const fillForm = (tag) => [
    { click: 'button:has-text("Continue")' },
    { fill: { selector: '#firstName', value: 'Emma' } },
    { fill: { selector: '#lastName', value: 'Davis' } },
    { fill: { selector: '#email', value: () => `mintleaf-docs+${Date.now()}-${tag}@example.com` } },
  ];
  const toConsents = (tag) => [
    ...fillForm(tag),
    { click: 'button[type="submit"]:has-text("Continue")' },
    { waitGone: 'text=Processing...' },
    { waitGone: 'text=Loading...' },
    { waitFor: 'h3:has-text("Consents"), h2:has-text("Consents"), h1:has-text("Consents")' },
  ];
  const toSuccess = (tag) => [
    ...toConsents(tag),
    // The first switch is the required consent; the submit stays disabled
    // until it's given.
    { click: '[role="switch"]' },
    { click: 'button[type="submit"]:has-text("Join")' },
    { waitGone: 'text=Joining...' },
    { waitFor: 'text=Almost there!' },
    // The badge starts grey ("Preparing your pass...") and turns black with
    // this label once the pass is generated; the pause lets its opacity
    // transition finish.
    { waitFor: 'button[aria-label="Add to Apple Wallet"]:not([disabled])' },
    { pause: 800 },
  ];
  // Trim each shot just below the "Powered by Stell" footer — the rest of
  // the emulated phone viewport is empty background. ("Powered by" and the
  // "Stell" link are separate elements, so match on the first part.)
  const clipBottom = 'text=Powered by';
  return [
    { name: 'enrollment/splash', url, mobile: true, clipBottom, waitFor: 'text=Join Mintleaf Rewards' },
    {
      // This shot never submits, so a clean static email is safe (no member
      // is created); the heading click drops the focus ring off the last field.
      name: 'enrollment/form',
      url,
      mobile: true,
      clipBottom,
      actions: [
        { click: 'button:has-text("Continue")' },
        { fill: { selector: '#email', value: 'emma.davis@example.com' } },
        { fill: { selector: '#firstName', value: 'Emma' } },
        { fill: { selector: '#lastName', value: 'Davis' } },
        { click: 'text=Personal details' },
      ],
    },
    { name: 'enrollment/consents', url, mobile: true, clipBottom, actions: toConsents('consents') },
    { name: 'enrollment/success', url, mobile: true, clipBottom, actions: toSuccess('success') },
    {
      name: 'enrollment/welcome',
      url,
      mobile: true,
      clipBottom,
      actions: [
        ...toSuccess('welcome'),
        // Tapping the wallet button downloads the pass and reveals the
        // welcome screen with the how-it-works guide.
        { click: 'button[aria-label="Add to Apple Wallet"]' },
        { waitFor: 'text=Welcome' },
      ],
    },
  ];
}
