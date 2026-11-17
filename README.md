# Solascent

Premium reed diffuser storefront. A plain static website: HTML, CSS and vanilla JavaScript.
**No framework, no package manager, no dependencies to install, no build step to deploy.**

```
solascent-website/     the site (this is what gets deployed)
  *.html               pages: home, shop, about, contact, 3 product pages, privacy, policy
  css/styles.css
  js/config.js         store settings: prices, checkout link, form endpoints (public values only)
  js/main.js           cart, menu, animations, forms
  assets/img/          optimised images, logos, payment icons
_build/build.py        optional Python 3 page generator (standard library + no installs)
vercel.json            Vercel configuration
```

## Run locally

```bash
cd solascent-website
python3 -m http.server 8000      # then open http://localhost:8000
```

(Opening `index.html` directly also works, but a local server matches production.)

## Edit pages

The `.html` files are committed so the site deploys as-is. They are produced by `_build/build.py`;
edit copy and layout there, then regenerate. Prices and links live in `solascent-website/js/config.js`.

```bash
python3 _build/build.py          # rewrites the pages inside solascent-website/
```

## Deploy on Vercel

`vercel.json` already sets everything:

| Setting | Value |
|---|---|
| Framework preset | Other (none) |
| Install command | none |
| Build command | none |
| Output directory | `solascent-website` |

Import the repository in Vercel and deploy; no changes are needed.

### Environment variables

**None required.** Nothing in the site reads environment variables, and no secrets belong in this repo.
`js/config.js` is shipped to the browser, so only put **public** values there (a Formspree form URL,
a hosted checkout or payment link, a public contact email). If you later add server-side code
(for example a Stripe secret key), set that in Vercel → Project → Settings → Environment Variables,
never in the repository.
