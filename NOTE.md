# Solascent website — handover note

Welcome to the project. This note tells you where things stand, how to get running in minutes, and what is left to do. (`CLAUDE.md` has the detailed style rules if you work with Claude Code.)

## 1. What it is
A premium reed-diffuser online store for **Solascent** (home fragrance). Three products: **Ancient Amber**, **Mon Cherry**, **Apple Pine**. Plain static website, hosted on Vercel from GitHub.

- Repo: https://github.com/arqqadevelpment/sola-scent (branch `main`)
- Pages: Home, Shop, About Us, Contact, three product pages, Privacy Policy, Store Policy

## 2. Get set up (about 5 minutes)
You need **Git**, **Python 3.9+** and a browser. No `npm install` — there are no dependencies.

```bash
git clone https://github.com/arqqadevelpment/sola-scent.git
cd sola-scent/solascent-website
python3 -m http.server 8000        # open http://localhost:8000
```

To change page content or layout:
```bash
cd sola-scent
python3 _build/build.py            # regenerates the .html pages
```
Edit `_build/build.py` (HTML/copy), `solascent-website/css/styles.css` (styles) and `solascent-website/js/main.js` (behaviour). **Do not edit the generated `.html` files directly** — they are overwritten each time you run the generator. Hard-refresh the browser (Cmd/Ctrl+Shift+R) if you don't see a change.

## 3. Brand quick reference
- Colours: Obsidian `#0B0B0A`, Matte White `#FFFCF3`, Solar Brass `#D2AC2B`, Carbon Brown `#241F1A`, Raw Concrete `#9A9892`
- Brand fonts: thmanyah serif display + Aktiv Grotesk (**not installed yet**; the site uses Cormorant Garamond / Hanken Grotesk / DM Mono as stand-ins)
- Look and feel: quiet luxury, dark and warm, product-led, generous space, **pill-shaped buttons**, small uppercase labels, subtle parallax and fade-in motion
- Collections: Sacred Amber (Ancient Amber), The Secret Garden (Mon Cherry), Root & Ripe (Apple Pine)

## 4. Done so far
- Full site with cart drawer, mobile menu, product pages, shop, contact form, newsletter, About, Privacy and Policy pages
- Home page built from the brand content PDF: hero, brand story, collections (three scenes), signature scents, product care, client reviews, closing statement, footer
- Parallax and scroll animations (hero, collections intro, product care, closing)
- Vercel configuration (`vercel.json`); the repo deploys as-is with **no environment variables**

## 5. Still to do (in rough priority order)
1. **Prices and currency** → `solascent-website/js/config.js` (currently show "Price TBC")
2. **Checkout**: pick a provider (Shopify, Stripe links, WhatsApp orders…) and set `checkoutUrl`. The cart works but Checkout is not connected, so **do not launch payments yet**
3. **Contact form + newsletter endpoints** (e.g. Formspree) → `formEndpoint`, `newsletterEndpoint` in `config.js`. They currently run in demo mode and send nothing
4. **Real contact details and social links** (email, phone/WhatsApp, Instagram, TikTok, Facebook) in the footer, contact page, mobile menu
5. **Replace dummy reviews** (home page section 06) with real ones; add client photos as `assets/img/reviews/client-1.jpg … client-6.jpg`
6. **Legal wording** for Privacy Policy and Store Policy (currently placeholders, marked "Draft structure only"); shipping and returns text
7. **New bottle and scene photos with the new names** — the current bottle labels still read Dark Amber / Cherry Mongolia / Apple Cinnamon
8. **Brand fonts** (thmanyah serif display, Aktiv Grotesk): obtain files/licence, then add `@font-face`
9. **Official Visa logo** (current one is a simplified drawing), remove the card logos until payments are live
10. **Product pages** (Ancient Amber / Mon Cherry / Apple Pine) still use the earlier styling; bring them in line with the home page (smaller headlines, pill buttons already done, scene photos, etc.) when requested
11. Pages not built yet: FAQs, Gift Sets, Shipping & Returns, Product Care guide (footer shows them as plain text)
12. More About Us content; scent profile (top/heart/base notes, longevity, intensity) — only five key notes per product were supplied
13. Full mobile and accessibility pass, and a final cross-browser check

## 6. Open questions for the owner
- Keep the gold wave lines on the three product pages, or remove them like on the home page?
- Should "Shipping & Returns" in the footer link to the Store Policy page?
- Which checkout provider?

## 7. Where the files are
- **Source images** (large PNGs, brand PDFs, content PDF) are **not in the repo** (it is public). Ask the owner for the shared folder. Optimised versions are in `solascent-website/assets/img/`.
- Add new images optimised (≈1600–2000px wide JPEG, under ~250 KB), then reference them in `_build/build.py`.

## 8. Deploying
Push to `main`; Vercel builds nothing, it just serves `solascent-website/` (settings are in `vercel.json`). First-time setup: Vercel → Add New → Project → import the repo → Deploy.

## 9. Working agreements
- Change only what you are asked to change; mention anything else you notice.
- Never invent prices, claims, reviews or legal text; use placeholders until real content arrives.
- Keep product names consistent (Ancient Amber, Mon Cherry, Apple Pine).
- Check `git status` before every commit; never commit `.env` files, keys, PDFs or big source images.
