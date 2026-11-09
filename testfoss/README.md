# NGL Testfoss demo

This additive scenario exercises NGL's stock ferredoxin cofactor representations,
a molecular surface toggle, and the checked-in ala3 DCD trajectory. It loads only
local files and `build/js/ngl.dev.js`; it does not contact RCSB or a compute
service.

## Run

From the repository root, use Node.js 18 for the upstream build/tests (150
passed, 1 skipped), Node.js 24 for browser tooling, Python 3, and lmscript:

```bash
npm ci
npm run build
npm test -- --run
npm ci --prefix testfoss
npm run --prefix testfoss browsers:install
lmscript install github:lmctl-ai/lmwebtest@v0.1.10
export PATH="$HOME/.cache/lmscript/tools/github/lmctl-ai/lmwebtest/v0.1.10:$PATH"
python3 testfoss/server.py --root . --port 8000 &
SERVER_PID=$!
trap 'kill "$SERVER_PID"' EXIT
TESTFOSS_URL=http://127.0.0.1:8000 lmscript testfoss/browser.lms
```

If Playwright cannot download a browser on your host, set
`TESTFOSS_CHROMIUM=/absolute/path/to/chrome` in the final command's environment
to use an existing Chromium/Chrome executable instead.

Then open `http://127.0.0.1:8000/testfoss/` for manual controls. The browser test
checks molecular state and DOM status, not pixels or numerical simulation output.
Build products, `node_modules`, and Playwright browsers are local/CI artifacts;
none belongs in a commit.
