# Testfoss NGL scenario

## Baseline and provenance

Upstream is NGL `0db88033650614103be761f151efc923b66e977e` (2.5.0).
The additive page reuses the stock ferredoxin selection strings and atom pairs,
and the stock ala3 DCD loading pattern. No upstream file is replaced.

Checked-in fixture SHA-256 values:

- `data/1blu.mmtf`:
  `c0b1a46bb9d7341e873f6ebefba4105c787775260ae171dcf3af108dc63d8d37`
- `data/ala3.pdb`:
  `720091c0953cad27c63e8efce4d9df048600a63ba4ff644e7be253aa633e11fe`
- `data/ala3.dcd`:
  `0cac4803deef32d1ceeb0f3e26bc4f40a8bc4a8495228581c7ea8030cdeee691`

## Commands

`npm ci && npm run build && npm test -- --run` is the upstream build/test gate
under Node.js 18 (150 passed, 1 skipped). Node.js 24 was also checked: the build
passed, but the MMTF and msgpack Vitest cases failed in binary decoding; both
cases passed under Node.js 20 and the full suite passed under Node.js 18. CI
therefore switches from Node 18 for upstream to Node 24 for lmwebtest rather
than excluding or modifying tests.

The browser gate installs Playwright 1.63.0 from `testfoss/package-lock.json`,
serves the repository with COOP/COEP and no-store headers, and invokes
`lmscript testfoss/browser.lms`. The `.lms` program uses
`cli="lmwebtest playwright"`; no direct Playwright test runner replaces it.
The full local invocation is in `AGENTS.md` and `testfoss/README.md`.

Browser tooling is pinned to lmctl 0.2.469 and lmwebtest v0.1.10
(commit `2920befd355eacc654697820d690db074e94dce3`, Linux x64 SHA-256
`b90cb79fc2b00627da226e563f77a395fedcb95aca01b076af8ff14755009690`).

## Decisions and limitations

The page exposes JSON state solely to make browser assertions deterministic.
It does not alter NGL or introduce a second molecular implementation. Surface
and trajectory work remains asynchronous inside NGL; tests verify component
state, not rendered pixels, frame energies, timing, or scientific trajectory
analysis. Network-loaded RCSB examples are deliberately avoided.

Generated `build/` output exists only after a local/CI build. `testfoss/pkg` is
not used. No output structure, dependency directory, browser binary, or build
artifact should be added to git.

## Remote verification

GitHub Actions run 42651534041 passed the Node 18 build, all 150 upstream tests
with one intentional skip, and the Node 24 lmwebtest cofactor/surface/DCD scenario.
