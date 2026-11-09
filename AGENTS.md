# Testfoss fork guidance

This public demonstration fork is pinned to upstream NGL commit
`0db88033650614103be761f151efc923b66e977e` on branch `testfoss-demo`.
Keep upstream source, examples, styles, build scripts, lockfiles, and existing
workflows untouched. Testfoss changes belong only in this file, the appended
`README.md` section, `durable-memory/**`, `testfoss/**`, and
`.github/workflows/testfoss.yml`.

## Reproduce

Use Node.js 18 for the upstream build/tests, Node.js 24 for browser tooling,
and Python 3. Node 18 runs the full upstream suite: 150 passed, 1 skipped.

```bash
npm ci
npm run build
npm test -- --run
npm ci --prefix testfoss
npm run --prefix testfoss browsers:install
lmscript install github:lmctl-ai/lmwebtest@v0.1.10
export PATH="$HOME/.cache/lmscript/tools/github/lmctl-ai/lmwebtest/v0.1.10:$PATH"
python3 testfoss/server.py --root . --port 8000 &
TESTFOSS_URL=http://127.0.0.1:8000 lmscript testfoss/browser.lms
```

Stop the server after the test. `.github/workflows/testfoss.yml` runs the same
build, full Vitest suite, and browser scenario with `contents: read` and no
secrets or deployment.

## Exact browser pins

- `@lmctl-ai/lmctl` `0.2.469` supplies `lmscript`.
- `lmwebtest` release `v0.1.10`, commit
  `2920befd355eacc654697820d690db074e94dce3`; Linux x64 executable SHA-256
  `b90cb79fc2b00627da226e563f77a395fedcb95aca01b076af8ff14755009690`.
- Playwright `1.63.0`, pinned by `testfoss/package-lock.json`.
- Checkout `actions/checkout@11d5960a326750d5838078e36cf38b85af677262`
  (v4.4.0); Node `actions/setup-node@49933ea5288caeca8642d1e84afbd3f7d6820020`
  (v4.4.0).

## Scope and limitations

The demo follows stock `examples/scripts/showcase/ferredoxin.js` and
`examples/scripts/parser/dcd.js` using local `data/1blu.mmtf`, `data/ala3.pdb`,
and `data/ala3.dcd`. Browser assertions cover parsed structure state,
representation visibility, DCD frame count, and seeking; they are not visual
regression, WebGL-performance, or molecular-dynamics correctness tests.

Never commit `build/`, generated Wasm, `dist/` changes, `node_modules/`,
Playwright downloads, screenshots, or other test output. Do not commit or push
from an automation session unless the operator explicitly requests it.
