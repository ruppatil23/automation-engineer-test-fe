# UI Automation — Playwright

This document explains how the UI tests are run locally and in CI (GitHub Actions), and how the CI job starts MongoDB and the backend before executing Playwright tests.

## Summary (what CI does)

- Starts a MongoDB service inside the job (containerized service).
- Installs frontend and backend dependencies.
- Starts the backend (`npm run dev`) from the `automation-engineer-test-be` folder in the background.
- Waits for a health-check endpoint (`http://localhost:8001/api/docs`) to respond.
- Installs Playwright browsers and runs the tests from the frontend folder.
- Uploads the Playwright HTML report as an artifact.

The workflow file is: `.github/workflows/ui-tests.yml`

## Environment variables used in CI

- `MONGO_URI` — mongodb://localhost:27017/shift-manager
- `PORT` — 8001 (backend HTTP port)
- `JWT_SECRET` — development secret for local CI
- `FRONTEND_URL` — http://localhost:5173
- `VITE_API_BASE_URL` — http://localhost:8001/api (passed to Playwright job step)

## Local setup (developer machine)

1. Start MongoDB (Docker example):

```bash
docker run -d --name shift-manager-mongo -p 27017:27017 mongo:6.0
```

2. Start the backend in one terminal:

```bash
cd automation-engineer-test-be
npm install
npm run dev
```

3. In another terminal, prepare and run Playwright from the frontend:

```bash
cd automation-engineer-test-fe
npm install
npx playwright install --with-deps
npx playwright test --headed
```

Notes:
- The frontend's Playwright config (`playwright.config.js`) starts the Vite dev server automatically via the `webServer` config when tests run.
- Ensure the backend is reachable at `http://localhost:8001/api` before running Playwright.

## CI (what we added)

The CI job (`.github/workflows/ui-tests.yml`) does the following:

- `services.mongodb`: runs a MongoDB container for the job
- `npm ci --prefix automation-engineer-test-be`: installs backend dependencies
- `npm --prefix automation-engineer-test-be run dev &`: starts the backend in background
- Polls `http://localhost:8001/api/docs` until the backend responds (30s timeout)
- Runs `npx playwright test` in the frontend folder; `VITE_API_BASE_URL` is set to `http://localhost:8001/api`
- Uploads `playwright-report/` as an artifact

If your backend repository is separate from the frontend repository, CI must either check out the backend repo too (requires auth) or test against a deployed/staging backend. The current workflow assumes the backend code is present in the same repo root under `automation-engineer-test-be`.

## Troubleshooting

- Backend fails to start / health-check times out: check backend logs and ensure Mongo service is healthy.
- Mongo not reachable: verify `services.mongodb` is healthy in the job or run a Docker container locally.
- Playwright tests can't find selectors: run tests locally in headed mode to inspect the app UI.

## How to verify in CI

- After a PR run, open the workflow run → check the `Start backend` and `Wait for backend` step logs.
- If Playwright fails, download the `playwright-report` artifact from the job and open `playwright-report/index.html` locally.

## References

- Workflow file: `.github/workflows/ui-tests.yml`
- Frontend Playwright config: `playwright.config.js`
- Backend start script: `automation-engineer-test-be/package.json` (`dev` script)

---

If you want, I can also add a small CI health-check endpoint or expand the backend `npm run dev` script to be more CI-friendly (log to file, disable interactive output). Want me to add that? 
