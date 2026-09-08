# Veyl Protocol

Marketing site for Veyl, a confidential settlement layer for tokenized
equities. The app itself lives behind `links.app`.

Production domain: **veylprotocol.com**

## Stack

| Layer      | Choice                                      |
| ---------- | ------------------------------------------- |
| Build      | Vite + React 19 + TypeScript                |
| Styling    | Tailwind CSS v4 (CSS-first `@theme` tokens) |
| Components | shadcn/ui conventions on Radix primitives   |
| Animation  | GSAP + ScrollTrigger via `@gsap/react`      |
| Icons      | lucide-react plus hand-authored inline SVG  |
| Market data| Twelve Data                                 |

```bash
npm install
cp .env.example .env      # optional, see Market data below
npm run dev               # http://localhost:5173
npm run build             # tsc -b && vite build  -> dist/
npm run preview
npm run lint
```

## Market data

Prices in the hero are live. `src/lib/quotes.ts` batches one request for every
symbol on the page, caches for 60s in `sessionStorage`, refreshes each minute
while the tab is visible, and pauses on a hidden tab.

Without a key the page still renders: every value falls back to the seed
figures in `content.ts`, and the card reads `Indicative` instead of `Live`. A
marketing page must never show an error state or an empty price, so every
failure path is silent by design.

```bash
VITE_TWELVEDATA_KEY=your_key      # free tier: 800 requests/day
```

**A `VITE_` key is compiled into the public client bundle.** That is acceptable
for a rate-limited, read-only market-data key and nothing else. For production,
put a serverless function in front of the API and point `VITE_QUOTES_ENDPOINT`
at it; the key then stays server-side and is never shipped.

Figures shown before live data resolves are illustrative. The footer carries a
disclaimer to that effect.

## Brand assets

The mark is an iris aperture: six blades rotating into a hexagonal opening.
Privacy read as a mechanism rather than as a padlock, with six-fold rotational
symmetry matching the Swiss grid the site is built on.

Geometry is **computed, not hand-drawn**, so the blades are provably congruent:

```bash
python scripts/build-logo.py          # SVGs + the React component
node scripts/build-brand-assets.mjs   # PNG exports
```

`build-logo.py` writes `public/brand/*.svg`, `public/mark.svg` and
`src/components/site/VeylMark.tsx`. The component is generated from the same
geometry, so the inline mark in the nav can never drift from the asset files.
Edit the constants at the top of the script, never the output.

| File                          | Use                                          |
| ----------------------------- | -------------------------------------------- |
| `veyl-mark.svg`               | Tile with its own olive ground. Avatars.     |
| `veyl-glyph.svg`              | Transparent, olive. Light surfaces.          |
| `veyl-mark-mono.svg`          | Inherits `currentColor`. Print, one colour.  |
| `public/mark.svg`             | Favicon. Flat blades, wider opening.         |
| `png/veyl-mark-500.png`       | General social avatar.                       |
| `png/veyl-mark-400.png`       | X / Twitter profile.                         |
| `png/veyl-og-1200x630.png`    | Open Graph / link previews.                  |
| `png/veyl-x-header-1500x500.png` | X header.                                 |
| `png/veyl-maskable-512.png`   | PWA maskable icon.                           |

The favicon deliberately uses flat opacity and a wider aperture: graduated
blades turn to mush below about 20px.

Banner type uses a Georgia/serif stack rather than Newsreader, because librsvg
resolves fonts through the host and a webfont is not guaranteed to be installed.

## Instrument logos

Ticker logos are **vendored** into `public/logos/`, not hotlinked, so the rail
cannot break when a third-party CDN changes its terms or URL scheme. Sourced
once from `assets.parqet.com`.

They render desaturated and return to full colour on hover: twelve competing
corporate palettes would otherwise overrun a one-accent design.

To add a symbol, drop the file in `public/logos/` and add an entry to
`protocol.instruments` in `content.ts`.

## Routes

| Path           | Chunk  | Notes                                              |
| -------------- | ------ | -------------------------------------------------- |
| `/`            | eager  | Marketing page                                      |
| `/docs/:slug`  | eager  | Documentation, content in `src/config/docs.ts`      |
| `/app/*`       | lazy   | The app. Loads the entire wallet stack              |

Client-side routing means a direct hit on `/docs/network` must serve
`index.html`. `public/_redirects` covers Netlify-style hosts; on other
platforms configure the equivalent SPA fallback.

### Wallet stack isolation

wagmi, viem and Reown AppKit are large. `/app` is a `React.lazy` route and
`src/config/appkit.tsx` is imported **only** from inside it, so the marketing
and docs routes never download any of it. Verified on each build:

```bash
grep -c "@reown\|wagmi\|walletconnect" dist/assets/index-*.js   # must be 0
```

Do not import `@/config/appkit` from anything reachable by `/` or `/docs`.

## The app

`/app` is its own product surface with its own header and section nav. No
marketing chrome, no docs links.

| Route            | Section                                                   |
| ---------------- | --------------------------------------------------------- |
| `/app`           | Overview: network, gas balance, shortcuts, recent activity |
| `/app/deposit`   | Approve and deposit a tokenized equity                     |
| `/app/transfer`  | Confidential transfer with a sealed amount                 |
| `/app/redeem`    | Burn an encrypted balance, release the asset               |
| `/app/activity`  | Transactions submitted from this browser                   |

The connect button sits in the header. Sections render whether or not a wallet
is attached; connecting fills in the parts that need an address.

### No invented data

Every figure is read live or explicitly absent. The forms are fully wired: real
validation, real `writeContract` calls, real receipts via
`useWaitForTransactionReceipt`, real explorer links. What the app will not do is
show a confirmation for a transaction that did not happen.

| Surface              | Source                                                |
| -------------------- | ----------------------------------------------------- |
| Network, block       | Public RPC read. Works with no wallet                 |
| Gas balance          | `useBalance` on the connected address                 |
| Token balance        | `erc20Abi.balanceOf` on the selected instrument       |
| Allowance            | `erc20Abi.allowance`, drives approve vs deposit       |
| Activity             | Hashes this browser submitted, status from receipts   |
| Confidential balance | Sealed. Decrypts locally with the holder key          |

### Configuration

Contract and token addresses come from the environment, so a deployment needs
no code change:

```bash
VITE_VAULT_ADDRESS=0x...
VITE_ASSET_ADDRESSES={"AAPL":"0x...","AMZN":"0x..."}
VITE_FHE_RELAYER_URL=https://...
```

A form with a missing address stays fully interactive and reports which address
is missing at submit time, rather than failing silently.

### The FHE boundary

`src/lib/fhe.ts` is the single seam where the Zama relayer SDK plugs in. It
seals a transfer amount in the browser before submission.

It throws a specific error when unconfigured instead of returning something
shaped like ciphertext. A transfer that silently ships a readable amount is
worse than one that refuses to send, so the transfer form stops rather than
guesses.

### ABI shape

`src/config/contracts.ts` mirrors the documented privacy model:

- `deposit(token, uint256)` and `redeem(token, uint256)` take public amounts,
  because the origin chain records the lock and the release either way
- `confidentialTransfer(token, to, bytes encryptedAmount, bytes inputProof)`
  takes a sealed amount

### Wallet connection

Set `VITE_REOWN_PROJECT_ID` from [dashboard.reown.com](https://dashboard.reown.com).
Without it the app still renders and public chain reads still work; only the
connect flow is disabled, with a notice explaining why. A Reown project id is a
public client identifier by design; restrict it by domain in the Reown
dashboard rather than treating it as a secret.

Note on versions: the Reown React guide still says `wagmi@2.x`, but AppKit
1.8.23 imports `@wagmi/core/tempo`, which only exists in 3.x. This project runs
wagmi 3. Pinning to 2.x builds a broken bundle.

### Network

Settlement is on Robinhood Chain, an Arbitrum Orbit L2 using ETH for gas.
Values in `src/config/chains.ts` were verified against the live public RPC
(`eth_chainId` returned `0x1237` = 4663).

| Network | Chain ID | Public RPC                                  |
| ------- | -------- | ------------------------------------------- |
| Mainnet | 4663     | `https://rpc.mainnet.chain.robinhood.com`   |
| Testnet | 46630    | `https://rpc.testnet.chain.robinhood.com`   |

Public endpoints are rate limited. Set `VITE_RPC_MAINNET` to a dedicated
provider for production. `VITE_USE_TESTNET=true` switches the active chain.

## Preloader

`src/components/site/Preloader.tsx` plays once per tab, tracked in
`sessionStorage`. A readable holding scrambles character by character into
base64 ciphertext while the aperture closes over it: the product story told in
about three seconds.

It is skipped entirely under `prefers-reduced-motion`, and the decision is made
synchronously in a `useState` initialiser so it never flashes on an internal
navigation. The overlay is `aria-hidden`; the real page renders underneath and
is what assistive tech and crawlers read.

## Editing copy

All user-facing text is in `src/config/content.ts`, one export per section.
Components never hardcode a sentence.

- In `hero.headline`, the word in `{braces}` renders as olive italic serif.
- Icons are referenced by **name** (`icon: 'Lock'`) and resolved through the
  registry in `src/components/site/primitives.tsx`. Add an icon there first.
- Identity, links and the canonical domain live in `src/config/brand.ts`.
  `index.html` mirrors the title and meta tags; update both together.

House style: no em dashes. Use a colon, a semicolon, or a second sentence.

## Design system

Defined once in `src/index.css` under `@theme`. Direction and values were
sourced from the `ui-ux-pro-max` database (`editorial-grid-magazine` style,
warm off-white palette, Newsreader/Inter/JetBrains Mono tri-stack,
standard-tier scroll reveal).

**Neo-editorial, Swiss grid, warm minimalism**

- Ground is warm off-white `#faf9f5`, never pure white. White is reserved for
  floating cards so they read as lifted.
- One accent: olive `#4f5d31`. Contrast-verified at 6.8:1 on the ground, so it
  is safe for text, not only for decoration.
- Ink ramp: `--color-ink` 16.5:1, `--color-ink-soft` 8.4:1, `--color-ink-muted`
  4.95:1. `--color-ink-faint` is **decorative only** (3.3:1); never put body
  copy in it.
- Structure comes from 1px hairlines and dotted fields, not from boxes.
- Serif display (Newsreader) for headings, Inter for prose, JetBrains Mono for
  every eyebrow, index number and figure.

### Texture

Two dials, both in `src/index.css`:

```css
--grain-opacity: 0.055;   /* paper tooth. 0.03 to 0.09 */
--cipher-opacity: 0.5;    /* ciphertext field. 0.3 to 0.7 */
```

Grain is a fixed multiply layer applied site-wide rather than per section:
confining it to the hero would show a seam where the texture stops.

### Motion

- `src/hooks/useReveal.ts` owns section reveals and the hero intro.
- `[data-reveal]` / `[data-word]` are hidden **only** when `html.js-motion` is
  set, which a pre-paint inline script in `index.html` adds. No JS, or reduced
  motion, means content is visible with no flash and nothing is
  invisible-by-default for crawlers.
- The settlement diagram runs a looping timeline: a packet leaves the origin
  chain, is sealed at the protocol node, and continues as a filled marker.
  ScrollTrigger pauses it whenever the figure is off screen.
- Numbers count in via `AnimatedNumber`, which uses `useLayoutEffect` so the
  final figure never flashes before the count starts.
- The mobile nav sheet is a paused GSAP timeline played and reversed, so open
  and close are exact inverses and an interrupted tap resumes from where it is.
- Every timeline sits inside `gsap.matchMedia()`, so
  `prefers-reduced-motion: reduce` renders the final state immediately.

## Accessibility

- Focus ring is a 2px olive outline with 3px offset (WCAG 2.2 AAA appearance).
- `scroll-padding-top` keeps anchor targets clear of the fixed header.
- Skip-to-content link is the first tabbable element.
- The closed mobile sheet stays mounted for measurement but is `inert`, so its
  contents leave the tab order and the accessibility tree.
- The instrument rail pauses on hover and is disabled under reduced motion; its
  duplicated half is `aria-hidden` so it is announced once.

## Structure

```
public/
├── brand/           logo SVGs + png/ exports
├── logos/           vendored instrument logos
└── _redirects       SPA fallback
scripts/
├── build-logo.py            aperture geometry -> SVG + component
└── build-brand-assets.mjs   SVG -> PNG social sizes
src/
├── config/
│   ├── brand.ts     name, ticker, domain, links
│   ├── content.ts   every sentence on the marketing page
│   ├── docs.ts      every sentence in the documentation
│   ├── chains.ts    Robinhood Chain definitions
│   ├── assets.ts    tokenized equities + addresses
│   ├── contracts.ts addresses and ABIs
│   └── appkit.tsx   Reown provider. Dashboard-only import
├── routes/
│   ├── Home.tsx     marketing
│   ├── Docs.tsx     documentation
│   ├── NotFound.tsx
│   └── app/         AppLayout + Overview, Deposit,
│                    Transfer, Redeem, Activity
├── components/
│   ├── ui/          shadcn/ui: button, accordion, dialog
│   ├── app/         dashboard primitives: AssetPicker,
│                    AmountField, TxStatus
│   └── site/        Navbar, SlimHeader, Footer, Preloader, Sparkline,
│                    CipherField, AnimatedNumber, VeylMark, AppLink
├── sections/        Hero, Thesis, Protocol, Settlement,
│                    Capabilities, Faq, Closing
├── hooks/           useReveal, useMarketData, useTxFlow
├── lib/             quotes.ts, fhe.ts, utils.ts
└── index.css        design tokens + component layer
```

## Deploying to Netlify

`netlify.toml` carries the build settings, the SPA fallback and the cache and
security headers. Connect the repository and Netlify picks it up; nothing needs
configuring in the dashboard except environment variables.

| Setting        | Value           |
| -------------- | --------------- |
| Build command  | `npm run build` |
| Publish dir    | `dist`          |
| Node version   | 22 (`.nvmrc`)   |

`NPM_FLAGS = "--include=dev"` is set because the build runs `tsc -b` before
`vite build`, so devDependencies are required.

### Environment variables

Set these in **Site configuration, Environment variables**. `.env` is
gitignored, so nothing carries over from local: every value below has to be
entered in Netlify as well.

Everything prefixed `VITE_` is compiled into the public client bundle. None of
these is a secret, and none of them should ever be one.

**Required for the app to function**

| Variable                 | Notes                                                        |
| ------------------------ | ------------------------------------------------------------ |
| `VITE_REOWN_PROJECT_ID`  | From dashboard.reown.com. Restrict it by domain there.        |
| `VITE_ASSET_ADDRESSES`   | Verified stock token map, below. Paste as a single line.      |
| `VITE_VAULT_ADDRESS`     | The deployed vault. Deposits, transfers and redemptions fail without it. |
| `VITE_FHE_RELAYER_URL`   | Zama relayer. Confidential transfers need it.                 |

**Optional**

| Variable               | Effect if unset                                              |
| ---------------------- | ------------------------------------------------------------ |
| `VITE_TWELVEDATA_KEY`  | Hero prices fall back to seed figures and read `Indicative`.   |
| `VITE_QUOTES_ENDPOINT` | Preferred over the key: point it at your own proxy so the market-data key stays server side. |
| `VITE_RPC_MAINNET`     | Falls back to the rate-limited public RPC. Use a dedicated provider in production. |
| `VITE_RPC_TESTNET`     | Same, for testnet.                                            |
| `VITE_USE_TESTNET`     | `true` targets chain 46630 instead of 4663.                    |

### VITE_ASSET_ADDRESSES

Robinhood Chain stock tokens. Every address was verified against the live RPC:
`symbol()` matches the ticker, `decimals()` is 18, and the account has contract
bytecode.

```
VITE_ASSET_ADDRESSES={"AAPL":"0xaF3D76f1834A1d425780943C99Ea8A608f8a93f9","AMZN":"0x12f190a9F9d7D37a250758b26824B97CE941bF54","GOOGL":"0x2e0847E8910a9732eB3fb1bb4b70a580ADAD4FE3","META":"0xc0D6457C16Cc70d6790Dd43521C899C87ce02f35","MSFT":"0xe93237C50D904957Cf27E7B1133b510C669c2e74","MSTR":"0xec262a75e413fAfD0dF80480274532C79D42da09","NVDA":"0xd0601CE157Db5bdC3162BbaC2a2C8aF5320D9EEC","QCOM":"0x0f17206447090e464C277571124dD2688E48AEA9","SPY":"0x117cc2133c37B721F49dE2A7a74833232B3B4C0C","TSLA":"0x322F0929c4625eD5bAd873c95208D54E1c003b2d"}
```

### After the first deploy

- Add the production domain to the Reown project so the project id is not
  usable from anywhere else.
- Set `VITE_QUOTES_ENDPOINT` rather than shipping a market-data key, once a
  proxy exists.
- `X-Frame-Options: SAMEORIGIN` in `netlify.toml` blocks third-party framing.
  Remove it only if you later need the dapp to run inside a Safe App or an
  embedded wallet browser.

## Disclaimer

Copy on this site is marketing copy. Nothing in it is investment advice or an
offer to buy or sell securities.
