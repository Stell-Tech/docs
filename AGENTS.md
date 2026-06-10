# Stell merchant documentation — project instructions

External user documentation for the **Stell merchant portal** (platform.getstell.com/portal) and the customer enrollment/onboarding processes. Built on [Mintlify](https://mintlify.com): pages are MDX with YAML frontmatter, configuration lives in `docs.json`.

- Use the Mintlify docs MCP server, `https://www.mintlify.com/docs/mcp`, to query information about using Mintlify
- For Mintlify product knowledge (components, configuration, writing standards), the Mintlify skill is installed via `npx skills add https://mintlify.com/docs`

## Audience

1. **Merchant staff and admins** (primary) — non-technical users of the merchant portal. They manage programs, issue passes, run Engage campaigns, and look up transactions for their own company.
2. **Support staff** (secondary) — the Onboarding & support tab documents the end-customer enrollment flow (web/App Clip via Launchpad) as a support reference.

Write for the merchant, not the operator. Assume no knowledge of Stell internals, AWS, or wallet provider APIs.

## Sources of truth

| What | Where |
|---|---|
| Merchant portal UI and behavior | `~/Code/stell-core/app/(portal)/portal/*` |
| Canonical terminology | `~/Code/stell-core/CONTEXT.md` (the `## Language` section) |
| Customer enrollment flows | `~/Code/launchpad` |
| Enrollment provider concepts | `~/Code/stell-core/docs/adr/0012-per-program-enrollment-provider.md` |

**Always verify against the portal route, never the shared component.** The portal reuses admin dashboard components; a capability visible in a component may be admin-only. If it isn't reachable under `/portal/*` for a portal user, it does not belong in these docs.

## Content boundaries

- **Never document admin-only features**: the admin dashboard (`/admin/*`), Quick Setup wizard, SuperAdmin controls, downtime toggles, certificate management internals, or anything merchants cannot reach.
- Never include internal identifiers, raw API payloads, AWS service names, or implementation file paths in published pages.
- Engage is a **Gated Module** — some companies don't have it. Note this where relevant ("If you don't see Engage in your navigation, it isn't enabled for your company — contact support") rather than assuming everyone has it.
- English only.

## Terminology

Canonical source: `stell-core/CONTEXT.md`. The merchant-facing essentials:

| Use | Don't use | Notes |
|---|---|---|
| **Pass** | card, coupon, ticket (as the entity) | "Card" is friendly prose only; imprecise for tickets/access credentials |
| **Issue** (a pass) | create, generate, new | Canonical verb in portal UI and docs |
| **Program** | scheme, campaign (for the loyalty product) | A campaign is an Engage concept |
| **Pass Template** | template (unqualified) | Ambiguous with Engage message templates |
| **Transaction** | payment, activity, receipt | A transaction may have no payment component |
| **Transaction Log** | pass history, payment history, recent activity | The canonical merchant view for investigating usage |
| Transaction statuses: **Approved / Denied / Failed / Pending** | valid, invalid | Surface the status reason when it explains a denial/failure |
| **Terminal** | reader, payment terminal | Terminal = the Stell tap point; reader = physical NFC hardware; payment terminal = POS/acquirer device |
| **Enroll / enrollment** (end customer) | sign up, register (for the customer flow) | Enrollment flow = form → identity → pass issued |
| **Placeholder** | variable, merge tag, merge field | The `{{…}}` tokens in Engage messages |
| Pass statuses: name them (**voided**, **expired**) | "terminal pass" | "Terminal" status wording collides with tap-point Terminal |
| **Wallet** (Apple Wallet, Google Wallet) | — | Spell out the provider name on first use per page |
| **Company** | organization, tenant, account | The merchant's scope in the portal |
| **Your own certificate** | BYO cert, merchant cert, unmanaged | For self-managed Apple signing certificates, if ever surfaced |

## Style

- Active voice, second person ("you")
- Keep sentences concise — one idea per sentence
- Sentence case for headings
- Bold for UI elements: Click **Issue pass**
- Code formatting for file names, commands, paths, and literal values
- Steps as numbered lists; one action per step
- Don't speculate about behavior — verify in the portal code or ask

## Screenshots

Screenshots are **generated** by the Playwright pipeline in `screenshots/` — never hand-edit or manually crop a generated PNG.

- Output path: `images/portal/<section>/<name>.png` (e.g. `images/portal/passes/list.png`)
- Embed as: `![Passes list](/images/portal/passes/list.png)` with meaningful alt text
- Capture: viewport 1440×900, `deviceScaleFactor: 2`, light mode
- To add a screenshot: add an entry to `screenshots/shots.config.ts`, then `npm run shots`
- Auth: `npm run shots:login` opens a headed browser for a manual staging login (MFA included); the session is saved to `screenshots/.auth/state.json` (gitignored) and reused until it expires
- If staging access is unavailable, write the content anyway and leave the image embed in place — backfill the capture later

## Workflow

Per section: read the portal section's code in stell-core → draft MDX → add screenshot entries and capture → review with `npx mint dev` → commit and push (Mintlify deploys via GitHub sync). Run `mint broken-links` before pushing navigation changes.
