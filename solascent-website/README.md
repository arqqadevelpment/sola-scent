# Solascent website

A complete static website. No framework, no build step needed to view or host it.

## Pages
| File | Page |
|---|---|
| `index.html` | Home: three full-width hero sections + Shop All band |
| `shop.html` | Shop: all three diffusers |
| `ancient-amber.html` · `mon-cherry.html` · `apple-pine.html` | Fragrance landing pages |
| `contact.html` | Contact form + channels |

## View it
Double-click `index.html` (or run `python3 -m http.server` in this folder and open http://localhost:8000).

## Fill in the placeholders — `js/config.js`
- `price` for each product (shows "Price TBC" until set), `currency`
- `checkoutUrl` (payment/checkout link; the cart's Checkout button goes there)
- `email` and `formEndpoint` (e.g. a Formspree URL) for the contact form. Until `formEndpoint` is set the form runs in demo mode and does not send anything.

Other placeholders (notes, longevity, story copy, how-to-use text, social links, shipping/returns) are dashed italic text in the pages. Edit them in `_build/build.py` and re-run `python3 _build/build.py`, or edit the HTML directly.

## Notes
- Cart is saved in the browser (localStorage). Real payments need a checkout service (Stripe, Shopify Buy Button, etc.).
- Bottle images are the supplied white-background masters; replace with scene photography in `assets/img/` keeping the file names.
- Deploy by uploading this folder to any static host (Netlify, Vercel, GitHub Pages, cPanel).
- Fonts load from Google Fonts. Brand fonts (thmanyah serif, Aktiv Grotesk) are stood in by Cormorant Garamond and Hanken Grotesk.

## Home page content
Copy comes from "SOLASCENT — Homepage Structure & Content". Sections: Hero, Brand story, Collections (three worlds), Signature scents, Product care, Real spaces, Final statement, Footer with newsletter.
Edit it in `_build/build.py` (`page_home`, `WORLDS`) and re-run `python3 _build/build.py`.
Newsletter: set `newsletterEndpoint` in `js/config.js`; until then it runs in demo mode.
