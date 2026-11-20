# E2E framework template (Playwright + Allure)

Standalone **JavaScript** Playwright package for the Insurance Claims Management demo app. This is a **framework template** — Page Object Model, fixtures, env config, and Allure are wired so you can add real journeys yourself.

Separate from `code/demo-app-ui` (which has its own empty Playwright scaffold). Prefer this `e2eTests/` package for new E2E work.

## Layout

```
e2eTests/
├── config/env.js              # dotenv → baseURL + test users
├── fixtures/index.js          # test/expect + page + auth fixtures
├── helpers/selectors.js       # getByRole / label / testid helpers
├── pages/                     # Page Object Model
│   ├── base.page.js
│   ├── login.page.js
│   ├── admin-dashboard.page.js
│   └── claims.page.js
├── tests/
│   ├── auth/                  # Auth module (example smoke lives here)
│   └── claims/                # Claims module (placeholder — add your tests)
├── playwright.config.js       # Allure + HTML reporters, baseURL from env
├── .env.example               # Copy to .env (gitignored)
└── package.json
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

npm test                 # all specs
npm run test:smoke       # titles matching @smoke
npm run test:auth
npm run test:claims
npm run test:headed
npm run test:ui
```

### Env (no secrets in git)

| Variable | Purpose |
|----------|---------|
| `E2E_BASE_URL` | UI base URL (default `http://localhost:3001`) |
| `E2E_ADMIN_USER` / `E2E_ADMIN_PASSWORD` | Admin (for `asAdmin` fixture) |
| `E2E_CLAIMANT_USER` / `E2E_CLAIMANT_PASSWORD` | Claimant (for `asClaimant` fixture) |

Demo users from the root README: `admin@demo.com` / `Admin123!`, `claimant@demo.com` / `Claimant123!`.

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
2. Prefer `helpers/selectors.js` (`getByRole`, `getByLabel`, `getByTestId`).
3. Put the spec in `tests/<module>/`.
4. Import `test` / `expect` from `../fixtures` (or `../../fixtures`).
5. Optional: use `asAdmin` / `asClaimant` fixtures once `.env` has credentials.
6. Tag smoke with `@smoke` in the title if you want `npm run test:smoke` to pick it up.

The only committed example is **login page loads** under `tests/auth/`. Claims folder has a skipped placeholder.
