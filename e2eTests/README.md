# E2E tests (Playwright + Allure)

Standalone **ESM JavaScript** Playwright package for the Insurance Claims Management demo app. Uses Page Object Model, fixtures, env config, Allure reporting, and failure screenshots/videos.

Separate from `code/demo-app-ui` (which has its own empty Playwright scaffold). Prefer this `e2eTests/` package for new E2E work.

## Layout

```
e2eTests/
├── config/env.js                 # dotenv → baseURL + admin/claimant users
├── fixtures/index.js             # test/expect + page + auth fixtures
├── helpers/
│   ├── selectors.js              # getByRole / label / testid helpers
│   └── artifacts.js              # failure screenshot + video → Allure
├── pages/                        # Page Object Model
│   ├── base.page.js              # shared title(), button(), errorMessage(), logout()
│   ├── login.page.js
│   ├── signup.page.js
│   ├── admin-dashboard.page.js
│   ├── admin-claims.page.js
│   └── claims.page.js
├── tests/
│   ├── auth/
│   │   ├── login.smoke.spec.js   # TCID-0001 @smoke
│   │   └── signup.smoke.spec.js  # TCID-002 @smoke
│   └── claims/
│       ├── claims.submit.spec.js       # TCID-003 @functional
│       └── admin.claims.verify.spec.js # TCID-004 @functional
├── playwright.config.js          # Allure + HTML reporters, baseURL from env
├── .env.example                  # Copy to .env (gitignored)
└── package.json                  # "type": "module"
```

## Prerequisites

1. Full stack running from repo root (`./start-infra.sh`, `./start-app.sh`).
2. UI at `http://localhost:3001` (override with `E2E_BASE_URL`).
3. Node.js 20+.

## Install & run

```bash
cd e2eTests
cp .env.example .env
npm install
npm run install:browsers

npm test                  # all specs (cleans allure-results first)
npm run test:smoke        # titles matching @smoke
npm run test:functional   # titles matching @functional
npm run test:auth         # tests/auth only
npm run test:claims       # tests/claims only
npm run test:headed       # headed browser
npm run test:ui           # Playwright UI mode
```

### Env (no secrets in git)

| Variable | Purpose |
|----------|---------|
| `E2E_BASE_URL` | UI base URL (default `http://localhost:3001`) |
| `E2E_ADMIN_USER` / `E2E_ADMIN_PASSWORD` | Admin (`asAdmin`, `adminWithSubmittedClaim`) |
| `E2E_CLAIMANT_USER` / `E2E_CLAIMANT_PASSWORD` | Claimant (`asClaimant`, claim submit / seed) |

Demo users from the root README: `admin@demo.com` / `Admin123!`, `claimant@demo.com` / `Claimant123!`.

## Specs (TCID)

| TCID | File | Tag | What it covers |
|------|------|-----|----------------|
| TCID-0001 | `tests/auth/login.smoke.spec.js` | `@smoke` | Admin / claimant login + invalid credentials |
| TCID-002 | `tests/auth/signup.smoke.spec.js` | `@smoke` | Signup form, validation errors, register user |
| TCID-003 | `tests/claims/claims.submit.spec.js` | `@functional` | Claimant submit claim wizard |
| TCID-004 | `tests/claims/admin.claims.verify.spec.js` | `@functional` | Admin sees submitted claim (`adminWithSubmittedClaim` seeds the claim) |

## Fixtures

Import from `../../fixtures/index.js` (ESM — include `.js`):

| Fixture | Purpose |
|---------|---------|
| `loginPage` / `signupPage` / `claimsPage` / `adminDashboardPage` / `adminClaimsPage` | Page objects |
| `asAdmin` | Login as admin → `/admin/dashboard` |
| `asClaimant` | Login as claimant → `/claims` |
| `adminWithSubmittedClaim` | Claimant submits a claim, then admin is logged in (for TCID-004) |

On failure, auto fixtures attach a screenshot and video to Allure (`helpers/artifacts.js`).

## Allure (fresh results every run)

**Why reports look “old”:** `allure-playwright` appends into `allure-results/`. If that folder isn’t cleared, older runs mix into the next report. Also, a leftover `allure serve` (or an already-open report tab) can keep serving a previous `allure-report/` until you regenerate and reopen.

**What this package does:** every `npm test` / `test:*` script runs `clean:allure-results` first (`rimraf allure-results`), so each run starts empty. `report:allure:generate` always uses `allure generate … --clean -o allure-report`.

### After each run

```bash
cd e2eTests
npm test                         # cleans allure-results, then runs tests
npm run report:allure            # regenerate allure-report (--clean) and open it
```

Step-by-step:

```bash
npm run clean:allure-results     # optional; already done by npm test
npm test
npm run report:allure:generate   # rebuilds allure-report from current allure-results
npm run report:allure:open       # open the freshly generated folder
# or one shot:
npm run report:allure
```

If the browser still shows old data:

1. Stop any running Allure server (`Ctrl+C` in that terminal, or kill the `allure`/`java` process serving the report).
2. Prefer `npm run report:allure` (generate + open) over a long-lived `allure serve`.
3. Hard-refresh the tab, or close it and let `allure open` start again.

Helpers: `npm run clean:allure` (results + report), `npm run clean:allure-report`.

Also: `npm run report:playwright` for Playwright’s HTML report.

## How to add a test

1. Extend or add a page under `pages/`.
2. Prefer shared helpers on `BasePage` (`title()`, `button()`, `errorMessage()`) and `helpers/selectors.js`.
3. Put the spec in `tests/<module>/`.
4. Import `test` / `expect` from `../../fixtures/index.js` (with the `.js` extension).
5. Optional: use `asAdmin` / `asClaimant` / `adminWithSubmittedClaim` once `.env` has credentials.
6. Tag with `@smoke` or `@functional` in the `test.describe` title for `npm run test:smoke` / `test:functional`.
