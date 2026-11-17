#!/usr/bin/env python3
"""Generates the static Solascent pages into ../solascent-website/.
Run:  python3 _build/build.py
Edit copy/structure here, then re-run. Output is plain HTML (no framework)."""
import os, hashlib
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "solascent-website")

def _v(rel):
    with open(os.path.join(OUT, rel), "rb") as fh: return hashlib.md5(fh.read()).hexdigest()[:8]
V_CSS, V_JS, V_CFG = _v("css/styles.css"), _v("js/main.js"), _v("js/config.js")

F = {
 "ancient-amber":      dict(k="dark",   name="Ancient Amber",      tag="Sacred Amber",         mood="A rich, velvety blend of amber, spices, and sensual woods.",      theme="t-dark",   contour="#D2AC2B", note="black slate with brass contour",  n=1),
 "mon-cherry": dict(k="cherry", name="Mon Cherry", tag="The Secret Garden", mood="A playful expression of fruity florals and modern romance.",     theme="t-cherry", contour="#6E1B38", note="plum and crimson stone",          n=2),
 "apple-pine":  dict(k="apple",  name="Apple Pine",  tag="Root & Ripe",         mood="Crisp orchard fruit meets aromatic spices and evergreen woods.", theme="t-apple",  contour="#D2AC2B", note="cinnamon bark and amber",         n=3),
}
ORDER = ["ancient-amber", "mon-cherry", "apple-pine"]
NAV_L = [("Ancient Amber", "ancient-amber.html"), ("Mon Cherry", "mon-cherry.html"), ("Apple Pine", "apple-pine.html")]
NAV_R = [("About Us", "about.html"), ("Shop", "shop.html"), ("Contact Us", "contact.html")]
NAV = [("Home", "index.html"), ("About Us", "about.html"), ("Shop", "shop.html")] + NAV_L + [("Contact Us", "contact.html")]
SUB = {"Home": "", "About Us": "Our story", "Shop": "All diffusers", "Ancient Amber": "Sacred Amber", "Mon Cherry": "The Secret Garden",
       "Apple Pine": "Root &amp; Ripe", "Contact Us": ""}
SITE = "Solascent"
FONTS = "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=DM+Mono:wght@400;500&family=Hanken+Grotesk:wght@400;500;600&display=swap"

def ph(t): return f'<span class="ph">{t}</span>'

def logo(cls="", pos=""):
    return (f'<a class="logo {cls}" href="index.html" aria-label="Solascent home">'
            '<img class="mk" src="assets/img/logo-mark-light.png" alt="" width="34" height="34">'
            '<img class="wm" src="assets/img/logo-wordmark-light.png" alt="Solascent" width="120" height="15"></a>')

def head(title, desc, theme, img="assets/img/ancient-amber.jpg", file=""):
    return f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<meta name="description" content="{desc}">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<meta property="og:image" content="{img}">
<meta property="og:type" content="website">
<meta name="theme-color" content="#0B0B0A">
<link rel="icon" href="assets/img/favicon.png">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="{FONTS}">
<link rel="stylesheet" href="css/styles.css?v={V_CSS}">
</head>
<body class="{theme}">
<a class="skip" href="#main">Skip to content</a>
'''

CART_SVG = '<svg viewBox="0 0 26 26" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M5 9h16l-1.2 13.2H6.2z"/><path d="M9 11V8a4 4 0 0 1 8 0v3"/></svg>'

def lockup():
    return ('<a class="logo center" href="index.html" aria-label="Solascent home">'
            '<img src="assets/img/logo-lockup-light.png" alt="Solascent, the scent of nature" width="700" height="673"></a>')

def cart_btn(extra=""):
    return f'<button class="cart-btn" type="button" data-open-cart aria-label="Open cart"{extra}>{CART_SVG}<span class="badge" hidden>0</span></button>'

def header(active):
    cur = lambda n: ' aria-current="page"' if n == active else ""
    left = "".join(f'<a href="{u}"{cur(n)}>{n}</a>' for n, u in NAV_L)
    right = "".join(f'<a href="{u}"{cur(n)}>{n}</a>' for n, u in NAV_R)
    mob = "".join(f'<a href="{u}"{cur(n)}>{n}<small>{SUB[n]}</small></a>' for n, u in NAV)
    return f'''<header class="site-header">
  <div class="hd-left"><button class="menu-btn" type="button" data-open-menu aria-label="Open menu">Menu</button><nav class="nav" aria-label="Collections">{left}</nav></div>
  {lockup()}
  <div class="hd-right"><nav class="nav" aria-label="Main">{right}</nav>{cart_btn()}</div>
</header>
<div class="sheet" id="sheet" aria-hidden="true" role="dialog" aria-label="Menu">
  <div class="top"><button type="button" class="menu-close" data-close-menu aria-label="Close menu">×</button>{logo()}{cart_btn(' style="justify-self:end"')}</div>
  <nav aria-label="Mobile">{mob}</nav>
  <div class="foot">{ph("Instagram")} &nbsp; {ph("Social links TBC")}</div>
</div>
'''

def footer():
    return f'''<footer class="site-footer t-dark">
  <div class="news">
    <div><p class="ey" style="color:var(--brass)">Newsletter</p><h2 class="sr">A Little More Scent in Your Inbox.</h2>
      <p>Discover new fragrances, collection launches, and stories from SOLASCENT.</p></div>
    <form id="newsletterForm" novalidate>
      <label class="vh" for="nl-email">Email address</label>
      <div class="nl-row"><input id="nl-email" name="email" type="email" autocomplete="email" placeholder="Your email address" required><button class="btn" type="submit">Subscribe →</button></div>
      <p class="nl-msg" id="nlMsg" role="status"></p>
    </form>
  </div>
  <div class="cols">
    <div><a class="logo foot-logo" href="index.html" aria-label="Solascent home"><img src="assets/img/logo-lockup-light.png" alt="Solascent, the scent of nature" width="700" height="673" loading="lazy"></a></div>
    <div><h2>Shop</h2><ul><li><a href="shop.html">Shop All</a></li><li><a href="index.html#collections">Collections</a></li><li>{ph("Gift Sets")}</li></ul></div>
    <div><h2>Support</h2><ul><li><a href="contact.html">Contact</a></li><li>{ph("FAQs")}</li><li>{ph("Shipping &amp; Returns")}</li><li><a href="index.html#care">Product Care</a></li></ul></div>
    <div><h2>Social Media</h2><ul><li>{ph("Instagram")}</li><li>{ph("TikTok")}</li><li>{ph("Facebook")}</li></ul></div>
  </div>
  <div class="base"><span>© 2026 SOLASCENT. All Rights Reserved.</span><span class="legal"><a href="privacy.html">Privacy Policy</a><a href="policy.html">Store Policy</a></span><span class="pay" role="group" aria-label="Payment methods"><img src="assets/img/payments/visa.svg" alt="Visa" width="46" height="29" loading="lazy"><img src="assets/img/payments/mastercard.svg" alt="Mastercard" width="46" height="29" loading="lazy"></span></div>
</footer>
'''

DRAWER = '''<div class="scrim" id="scrim" data-close-cart></div>
<aside class="drawer" id="drawer" aria-hidden="true" role="dialog" aria-label="Cart">
  <div class="dh"><b>Your cart</b><button type="button" id="cartClose" data-close-cart>Close ×</button></div>
  <div class="items" id="cartItems"></div>
  <div class="df">
    <div class="tot"><span>Subtotal</span><span id="cartTotal">—</span></div>
    <small>Shipping and taxes are calculated at checkout.</small>
    <a class="btn full" id="checkout" href="#" aria-disabled="true">Checkout</a>
    <small id="checkoutNote" role="status"></small>
    <button type="button" class="btn ol full" data-close-cart>Continue shopping</button>
  </div>
</aside>
'''

def scripts():
    return f'<script src="js/config.js?v={V_CFG}"></script>\n<script src="js/main.js?v={V_JS}"></script>\n</body>\n</html>\n'

def contour(c):
    return (f'<svg class="contour" viewBox="0 0 1000 120" preserveAspectRatio="none" fill="none" aria-hidden="true">'
            f'<path d="M0 92 C 140 40 260 112 420 70 S 700 30 1000 84" stroke="{c}" stroke-width="1.1" opacity=".8"/>'
            f'<path d="M0 104 C 160 62 280 118 440 88 S 720 52 1000 98" stroke="{c}" stroke-width=".6" opacity=".5"/></svg>')

def plinth(slug, cap="", card=False, alt=""):
    f = F[slug]
    c = ""
    if card:
        c = (f'<a class="fc" href="{slug}.html"><span class="th" style="background-image:url(assets/img/{slug}.jpg);background-color:var(--plinth)"></span>'
             f'<span><span class="nm">{f["name"]}</span><small>120 ml · Reed diffuser</small></span><span aria-hidden="true" style="font-size:20px">→</span></a>')
    cp = f'<span class="cap">{cap}</span>' if cap else ""
    return (f'<div class="pl {f["theme"]}"><img src="assets/img/{slug}.jpg" alt="{alt or f["name"]+" reed diffuser, "+f["tag"]}" width="1400" height="1400">'
            f'<i class="glow"></i>{cp}{c}</div>')

# ---------------- pages ----------------
WORLDS = {
 "ancient-amber":      dict(coll="Sacred Amber",    desc="An exploration of rich amber, warm spices, and sensual woods, creating a deep and lasting atmosphere.", tags="Warm · Spiced · Resinous",
                         line="A rich, velvety blend of amber, spices, and sensual woods.", notes="Saffron · Bergamot · Amber · Cedarwood · Vanilla"),
 "mon-cherry": dict(coll="The Secret Garden", desc="A whimsical world of blooming florals, luscious fruits, and enchanting combinations.", tags="Floral · Fruity · Luminous",
                         line="A playful expression of fruity florals and modern romance.", notes="Cherry · Magnolia · Rose · Musk · Amber"),
 "apple-pine":  dict(coll="Root &amp; Ripe", desc="Where juicy fruits meet aromatic spices and grounding woods. A balance of freshness and warmth.", tags="Fruity · Spiced · Woody",
                         line="Crisp orchard fruit meets aromatic spices and evergreen woods.", notes="Green Apple · Cinnamon · Pine · Cedarwood · Musk"),
}

SCENES = {
    "ancient-amber": ("ancient-amber-scene.jpg", "Ancient Amber reed diffuser beside its box on a black marble shelf"),
    "mon-cherry": ("mon-cherry-scene.jpg", "Mon Cherry reed diffuser beside its box on pink marble with cherry blossom petals"),
    "apple-pine": ("apple-pine-scene.jpg", "Apple Pine reed diffuser beside its box on travertine with a red apple and cinnamon stick"),
}
HOME_THEME = {"ancient-amber": "t-light", "mon-cherry": "t-light", "apple-pine": "t-light"}

def fcard(slug):
    f = F[slug]
    return (f'<a class="fc" href="{slug}.html"><span class="th" style="background-image:url(assets/img/{slug}.jpg);background-color:var(--plinth)"></span>'
            f'<span><span class="nm">{f["name"]}</span><small>120 ml · Reed diffuser</small></span><span aria-hidden="true" style="font-size:20px">→</span></a>')

# PLACEHOLDER REVIEWS: dummy content for layout only. Replace with real customer reviews before launch.
REVIEWS = [
    ("Amina K.", "Ancient Amber", "Warm and rich without ever being overpowering. Guests ask about the scent every time they visit.", "AK", "#2b2a27"),
    ("Layla M.", "Mon Cherry", "Soft, floral and a little playful. It makes our entryway feel welcoming the moment you open the door.", "LM", "#7d1e3c"),
    ("Omar S.", "Apple Pine", "Crisp apple with a cosy, spiced finish. The bottle looks as good on the shelf as it smells.", "OS", "#6a4330"),
    ("Nour H.", "Ancient Amber", "Exactly the atmosphere I wanted for my study. Calm, grounded and elegant.", "NH", "#2b2a27"),
    ("Sara A.", "Mon Cherry", "I bought it as a gift and ended up ordering one for myself. The packaging feels truly premium.", "SA", "#7d1e3c"),
    ("Karim T.", "Apple Pine", "It reminds me of autumn evenings at home. Easy to set up and it spreads nicely through the room.", "KT", "#6a4330"),
]

def review_card(i, name, product, text, initials, color):
    more = " more" if i >= 3 else ""
    img = f"assets/img/reviews/client-{i+1}.jpg"
    slug = {"Ancient Amber": "ancient-amber", "Mon Cherry": "mon-cherry", "Apple Pine": "apple-pine"}[product]
    dark = f"assets/img/sig-{slug}.jpg"   # dark texture placeholder; a real client photo (above) shows on top when present
    return (f'<figure class="rev-card{more}"><div class="client"><span class="avatar" style="--c:{color};background-image:url({img}),url({dark})"><b>{initials}</b></span>'
            f'<div><figcaption class="who">{name}</figcaption><span class="ey">Bought · {product}</span></div></div>'
            f'<p class="stars" aria-label="5 out of 5 stars">★★★★★</p><blockquote>{text}</blockquote></figure>')

def page_home():
    worlds = ""
    for i, slug in enumerate(ORDER):
        f = F[slug]; w = WORLDS[slug]; rev = " rev" if i == 1 else ""
        theme = HOME_THEME[slug]
        if slug in SCENES:
            fn, alt = SCENES[slug]
            visual = (f'<div class="pl photo"><img src="assets/img/{fn}?v={_v("assets/img/" + fn)}" alt="{alt}" loading="lazy">' + fcard(slug) + '</div>')
        else:
            visual = plinth(slug, "Product master · scene photo to come", True)
        worlds += f'''<section class="hero home-world {theme}{rev}" aria-labelledby="h-{slug}">
  <div class="tx"><p class="ey">0{i+1} — {w["coll"]}</p>
    <h3 class="sr" id="h-{slug}">{f["name"]}</h3><p>{w["desc"]}</p>
    <div class="cta"><a class="btn" href="{slug}.html">Explore {f["name"]} →</a></div></div>
  {visual}
</section>
'''
    sig = ""
    for slug in ORDER:
        f = F[slug]; w = WORLDS[slug]
        sig += f'''<a class="sig {f["theme"]}" href="{slug}.html"><div class="pl"><img src="assets/img/sig-product-{slug}.jpg?v={_v("assets/img/sig-product-" + slug + ".jpg")}" alt="{f["name"]} reed diffuser" loading="lazy"></div>
  <div class="mt" style="background-image:url(assets/img/sig-{slug}.jpg)"><p class="ey">{w["coll"]}</p><h3 class="sr">{f["name"]}</h3><p>{w["line"]}</p><p class="notes-line">{w["notes"]}</p><span class="lnk" style="margin-left:0">(Discover)</span></div></a>
'''
    care = "".join(f'<div><div class="nu" aria-hidden="true">{n}</div><h3>{t}</h3><p>{d}</p></div>' for n, t, d in [
        ("01", "Set it up", "Remove the stopper and insert the reeds into the fragrance bottle. Allow them to absorb the fragrance for 5–6 hours."),
        ("02", "Let the scent flow", "Place your diffuser in a suitable area where air can circulate naturally, allowing the fragrance to disperse throughout your space."),
        ("03", "Refresh your fragrance", "Turn the reeds periodically to refresh the fragrance and maintain its presence."),
        ("04", "Handle with care", "Keep away from direct sunlight, heat, and flames. Avoid contact with skin and eyes, and keep out of reach of children and pets. Do not ingest.")])
    reviews = "".join(review_card(i, *r) for i, r in enumerate(REVIEWS))
    body = f'''<main id="main">
<section class="hero-brand t-dark" aria-labelledby="h1">
  <div class="bg"><img src="assets/img/hero.jpg?v={_v("assets/img/hero.jpg")}" alt="A woman reading in a sunlit living room beside a Solascent reed diffuser" fetchpriority="high"></div>
  <div class="tx"><h1 class="sr" id="h1"><span class="ln">Every Space Has a Soul.</span><em class="ln">Give It a Scent.</em></h1>
    <p>Thoughtfully crafted home fragrances to make every space unmistakably yours.</p>
    <div class="cta"><a class="btn" href="shop.html">Shop Now →</a></div></div>
</section>

<section class="band t-light story-band" id="story" aria-labelledby="h-story">
  <p class="ey">02 — Brand story</p>
  <div class="story"><h2 class="sr" id="h-story" data-split>Some Places Stay With You. Some Scents Make Them.</h2>
    <div class="bd"><p class="q">A familiar room. A quiet morning. A moment you wish could last a little longer.</p>
      <p>We believe scent has the power to turn ordinary spaces into personal experiences. Through the art of fragrance, we bring atmosphere, emotion, and everyday rituals together.</p>
      <p><a class="btn" href="about.html">Read more about Solascent →</a></p></div></div>
</section>

<section class="parallax" id="collections" data-parallax aria-labelledby="h-coll">
  <div class="pbg"><img src="assets/img/collections-bg.jpg?v={_v("assets/img/collections-bg.jpg")}" alt="A reed diffuser on a sunlit coffee table beside old books and a ceramic cup" loading="lazy"></div>
  <div class="pcon">
    <p class="ey">Discover our collections · Three worlds, three experiences</p>
    <h2 class="sr h2" id="h-coll">Find Your World of Scent.</h2>
    <p class="sub">Three distinctive fragrance collections, each with its own character, mood, and olfactory identity.</p>
    <a class="btn" href="shop.html" style="margin-top:10px">Shop Now →</a>
  </div>
</section>
{worlds}

<section class="band t-dark sig-band" aria-labelledby="h-sig">
  <div class="sig-head"><div class="sig-txt">
  <p class="ey">04 — Signature scents · Find your signature</p>
  <h2 class="sr h2" id="h-sig" style="margin-top:14px"><span class="ln">Every Scent Has a Story.</span><span class="ln">Which One Is Yours?</span></h2>
  <p class="sub">Discover the notes, ingredients, and distinctive character behind our fragrances.</p>
  </div>
  <a class="btn" href="shop.html">Explore the Fragrances →</a></div>
  <div class="sigs">{sig}</div>
</section>

<section class="band t-apple care-px" id="care" data-parallax aria-labelledby="h-care">
  <div class="pbg"><img src="assets/img/care-bg.jpg?v={_v("assets/img/care-bg.jpg")}" alt="" loading="lazy"></div>
  <p class="ey">05 — Product care · Make every scent last</p>
  <h2 class="sr h2" id="h-care" style="margin-top:14px">Quality in Every Detail.</h2>
  <p class="sub">A few simple steps can help you get the most out of your SOLASCENT diffuser and enjoy its fragrance throughout your space.</p>
  <div class="steps four">{care}</div>
  <p style="margin-top:50px"><a class="btn" href="#care">Explore Our Product Care Guide →</a></p>
</section>

<section class="band t-light" aria-labelledby="h-real">
  <p class="ey">06 — Client reviews</p>
  <h2 class="sr h2" id="h-real" style="margin-top:14px">Where Fragrance Finds Its Place.</h2>
  <p class="sub">Explore the fragrances people love and discover the next addition to your space.</p>
  <div class="revs" id="revs">{reviews}</div>
  <p class="rev-cta"><button class="btn" type="button" data-reviews-toggle aria-expanded="false" aria-controls="revs">Read more</button></p>
</section>

<section class="closing t-dark" data-parallax aria-labelledby="h-close">
  <div class="cbg pbg"><img src="assets/img/closing-bg.jpg?v={_v("assets/img/closing-bg.jpg")}" alt="A woman relaxing on a sofa in a sunlit living room beside a Solascent reed diffuser" loading="lazy"></div>
  <h2 class="sr" id="h-close">Make Yourself at Home.</h2>
  <p class="l1">Your space. Your rituals. Your atmosphere.</p>
  <p class="l2">Find the scent that makes it yours.</p>
  <a class="btn" href="shop.html">Shop Now →</a>
</section>
</main>
'''
    return (head("SOLASCENT — Every Space Has a Soul. Give It a Scent.",
                 "Thoughtfully crafted home fragrances and diffusers designed to transform your atmosphere. Ancient Amber, Mon Cherry and Apple Pine reed diffusers.", "t-dark home")
            + header("Home") + body + footer() + DRAWER + scripts())

NOTES = {"ancient-amber": "Saffron · Bergamot · Amber · Cedarwood · Vanilla", "mon-cherry": "Cherry · Magnolia · Rose · Musk · Amber", "apple-pine": "Green Apple · Cinnamon · Pine · Cedarwood · Musk"}

def page_fragrance(slug):
    f = F[slug]; o = [s for s in ORDER if s != slug]
    notes = "".join(f'<div><p class="ey">{n}</p><p class="sr">{ph("Note TBC")}</p><div class="n">0{i+1}</div></div>' for i, n in enumerate(["Top", "Heart", "Base"]))
    tiles = "".join(f'<div class="tile ph2" role="img" aria-label="{lb} (photography to come)"><svg viewBox="0 0 60 30" fill="none" stroke="#fff" stroke-width="1" aria-hidden="true"><path d="M30 28V12M30 28 14 10M30 28 46 10M30 28 4 18M30 28 56 18"/></svg><span class="lb">{lb}</span></div>'
                    for lb in ["Packaging · box and label", "Reed detail · macro", "Styled in the home", "Label material · " + f["note"]])
    steps = "".join(f'<div><div class="nu" aria-hidden="true">{r}</div><h3>{a}</h3>{ph(b)}</div>'
                    for r, (a, b) in zip(["I.", "II.", "III."], [("Set up", "Draft: open, insert reeds, flip after day one. Supplier to confirm."),
                                                                   ("Care", "Draft: flip reeds to refresh, keep upright."),
                                                                   ("Placement", "Draft: good airflow, away from heat and surfaces.")]))
    cards = "".join(f'''<a class="xc {F[s]["theme"]}" href="{s}.html"><div class="t"><p class="ey">{F[s]["tag"]}</p><p class="sr">{F[s]["name"]}</p><p style="font-size:14px;opacity:.8">{F[s]["mood"]}</p><span class="btn sm">Explore →</span></div>{plinth(s)}</a>''' for s in o)
    body = f'''<main id="main">
<section class="lh" aria-labelledby="h1">
  <div class="tx"><p class="ey">{f["tag"]} — 120 ML</p><h1 class="sr" id="h1">{f["name"]}</h1>
    <p>{f["mood"]} {ph("One-line scent intro")}</p>
    <div class="cta"><a class="btn" href="#shop">Shop {f["name"]} ↓</a></div>{contour(f["contour"])}</div>
  {plinth(slug, "Product master · scene photo to come")}
</section>
<section class="band alt" aria-labelledby="story"><div class="story"><div><p class="ey" style="margin-bottom:22px">02 — Fragrance story</p><h2 class="sr" id="story">{ph("Editorial headline")}</h2></div>
  <div class="bd"><p>{ph("Paragraph 1: the mood this scent creates, about 35 words.")}</p><p class="q">{ph("Pull quote about the atmosphere")}</p><p>{ph("Paragraph 2: where it fits in the home, about 35 words.")}</p><p class="ey">Best placed in · {ph("entryway, living room, bedroom")}</p></div></div></section>
<section class="band" aria-labelledby="profile"><p class="ey">03 — Scent profile</p><h2 class="sr h2" id="profile" style="margin-top:14px">Notes, layer by layer</h2>
  <div class="tl" aria-hidden="true"><i></i><b style="left:0"></b><b style="left:50%"></b><b style="right:0"></b></div>
  <div class="notes">{notes}</div>
  <p class="ey" style="margin-top:34px">Key notes · {NOTES[slug]}</p>
  <div class="meters"><span><b>Longevity</b> &nbsp;{ph("TBC")}</span><span><b>Intensity</b> &nbsp;{ph("TBC")}</span><span><b>Family</b> &nbsp;{ph("TBC")}</span></div></section>
<section class="band alt" aria-labelledby="gallery"><p class="ey" id="gallery">04 — Gallery</p>
  <div class="bento"><div class="tile big pl {f["theme"]}"><img src="assets/img/{slug}.jpg" alt="{f["name"]} bottle, front view" loading="lazy"><span class="lb" style="color:#0B0B0A">Bottle · front view</span></div>{tiles}</div></section>
<section class="buy" id="shop" aria-labelledby="buyh" data-buy>
  {plinth(slug)}
  <div class="info"><p class="ey">05 — Shop · {f["tag"]}</p><h2 class="sr" id="buyh">{f["name"]}</h2>
    <p class="price" data-price="{slug}">{ph("Price")}</p>
    <p style="font-size:15px"><b>Size</b> &nbsp; 120 ml / 4.06 fl. oz. <span style="opacity:.55">· one size</span></p>
    <div><p class="ey" style="margin-bottom:10px">Quantity</p><div class="qty"><button type="button" data-step="-1" aria-label="Decrease quantity">−</button><input type="text" inputmode="numeric" value="1" aria-label="Quantity" readonly><button type="button" data-step="1" aria-label="Increase quantity">+</button></div></div>
    <button class="btn full" type="button" data-add="{slug}">Add to Cart</button>
    <div class="rassure"><span>{ph("Shipping")}</span><span>{ph("Returns")}</span><span>{ph("Secure payment")}</span></div></div>
</section>
<section class="band" aria-labelledby="how"><p class="ey">06 — How to use</p><h2 class="sr h2" id="how" style="margin-top:14px">Set up in a minute</h2><div class="steps">{steps}</div></section>
<section class="band alt" aria-labelledby="explore"><p class="ey" id="explore">07 — Explore the collection</p><div class="xcol">{cards}</div></section>
</main>
<div class="buybar" id="buybar" aria-label="Quick add"><div><p class="ey">{f["tag"]} · 120 ML</p><p class="sr">{f["name"]}</p></div>
  <div class="r"><span data-price="{slug}">{ph("Price")}</span><button class="btn" type="button" data-add="{slug}">Add to Cart</button></div></div>
'''
    return (head(f'{f["name"]} Reed Diffuser — {f["tag"]} | Solascent', f'{f["name"]} premium reed diffuser by Solascent. {f["mood"]}', f["theme"], f"assets/img/{slug}.jpg")
            + header(f["name"]) + body + footer() + DRAWER + scripts())

def page_shop():
    cards = ""
    for s in ORDER:
        f = F[s]
        cards += f'''<article class="pc {f["theme"]}" style="--bg:transparent">
  <a class="pl" href="{s}.html" aria-label="View {f["name"]}"><img src="assets/img/{s}.jpg" alt="{f["name"]} reed diffuser" loading="lazy"><i class="glow"></i></a>
  <div class="mt"><p class="ey" style="color:var(--fg)">{f["tag"]}</p><h2 class="nm"><a href="{s}.html" style="color:#0B0B0A">{f["name"]}</a></h2><p style="opacity:.7">{f["mood"]}</p>
  <div class="rw"><span>120 ml</span><span data-price="{s}">{ph("Price")}</span></div></div>
  <div class="acts"><button class="btn full" type="button" data-add="{s}">Add to Cart</button><a class="btn ol full sm" href="{s}.html">View {f["name"]}</a></div>
</article>
'''
    body = f'''<main id="main" class="t-light">
<section class="sh"><p class="ey" style="color:#7b6a1d">The collection</p><h1 class="sr">Shop All Diffusers</h1><p>{ph("One supporting line")} &nbsp;·&nbsp; 3 fragrances</p></section>
<section class="pg" aria-label="Products">{cards}</section>
<div class="reas"><span>{ph("Shipping")}</span><span>{ph("Returns")}</span><span>{ph("Secure payment")}</span></div>
</main>
'''
    return head("Shop All Diffusers | Solascent", "Shop Solascent premium reed diffusers: Ancient Amber, Mon Cherry and Apple Pine.", "t-dark") + header("Shop") + body + footer() + DRAWER + scripts()

def page_contact():
    body = f'''<main id="main">
<div class="ct" id="contactWrap">
  <section class="fm t-light" aria-labelledby="h1"><p class="ey" style="color:#7b6a1d">Contact Us</p><h1 class="sr" id="h1">We’d love to hear from you</h1>
    <p style="margin-top:20px;font-size:18px;opacity:.75">{ph("One line: questions about scents, orders or gifting")}</p>
    <form id="contactForm" novalidate>
      <div class="fld"><label for="name">Name</label><input id="name" name="name" type="text" autocomplete="name" placeholder="Your name" required><span class="err" role="alert"></span></div>
      <div class="fld"><label for="email">Email</label><input id="email" name="email" type="email" autocomplete="email" placeholder="you@example.com" required><span class="err" role="alert"></span></div>
      <div class="fld"><label for="message">Message</label><textarea id="message" name="message" placeholder="How can we help?" required></textarea><span class="err" role="alert"></span></div>
      <p class="err" id="formErr" role="alert" style="color:#a3261f;margin-top:10px"></p>
      <div style="margin-top:26px"><button class="btn" type="submit">Send Message →</button></div>
      <p style="margin-top:12px;font-size:12px;opacity:.7">{ph("Privacy line")}</p>
    </form>
    <div class="form-ok" role="status"><p class="ey">Message received</p><p class="sr" style="margin:12px 0 18px">Thank you.</p><p>We’ll be in touch soon.</p>
      <p id="demoNote" style="display:none;margin-top:12px;font-size:12px;opacity:.7">Demo mode: this message was not sent. Set <code>formEndpoint</code> in js/config.js.</p>
      <p style="margin-top:24px"><a class="btn" href="shop.html">Back to Shop</a></p></div>
  </section>
  <aside class="sd"><p class="ey" style="color:#D2AC2B">Reach us</p><p class="sr" style="font-size:clamp(36px,4vw,56px)">Other ways to talk</p>
    <div><p class="ey">Email</p><p style="margin-top:6px">{ph("email TBC")}</p></div>
    <div><p class="ey">Phone / WhatsApp</p><p style="margin-top:6px">{ph("number TBC")}</p></div>
    <div><p class="ey">Response time</p><p style="margin-top:6px">{ph("TBC")}</p></div>
    <div><p class="ey" style="margin-bottom:12px">Follow</p><div class="soc"><span>Instagram</span><span>TikTok</span><span>{ph("other")}</span></div></div></aside>
</div>
</main>
'''
    return head("Contact Us | Solascent", "Contact Solascent with questions about scents, orders or gifting.", "t-dark") + header("Contact Us") + body + footer() + DRAWER + scripts()

LEGAL = {
    "privacy": dict(title="Privacy Policy", file="privacy.html", desc="How Solascent collects, uses and protects your personal information.",
        sections=[
            ("Information we collect", "Which details you give us (name, email, address, order history) and what we collect automatically (device, cookies)."),
            ("How we use your information", "Processing orders, customer support, newsletters you opt in to, and improving the website."),
            ("Cookies and analytics", "Which cookies the site uses and how visitors can manage them."),
            ("Sharing your information", "Which providers receive data (payments, delivery, email) and why."),
            ("Your rights and choices", "How to access, correct or delete your data and how to unsubscribe from emails."),
            ("Contact us", "Who to contact about privacy questions."),
        ]),
    "policy": dict(title="Store Policy", file="policy.html", desc="Shipping, returns and terms for Solascent orders.",
        sections=[
            ("Shipping", "Delivery areas, delivery times and costs."),
            ("Returns and refunds", "What can be returned, the time window and how refunds are issued."),
            ("Damaged or incorrect items", "How to report a problem with an order and how we resolve it."),
            ("Product care and safety", "Safe use of reed diffusers, as in the Product Care guide."),
            ("Terms of use", "Terms for using the website and placing orders."),
        ]),
}

def page_legal(key):
    d = LEGAL[key]
    ca = lambda on: ' aria-current="page"' if on else ""
    tabs = "".join(f'<a href="{v["file"]}"{ca(k == key)}>{v["title"]}</a>' for k, v in LEGAL.items())
    secs = "".join(f'<section class="lg-sec"><h2 class="sr">{i+1:02d}. {t}</h2><p>{ph(b)}</p></section>' for i, (t, b) in enumerate(d["sections"]))
    body = f'''<main id="main">
<section class="band t-light legal" aria-labelledby="h1">
  <nav class="legal-tabs" aria-label="Legal pages">{tabs}</nav>
  <p class="ey" style="margin-top:44px">Legal</p>
  <h1 class="sr" id="h1" style="margin-top:12px">{d["title"]}</h1>
  <p class="sub">Last updated: {ph("date")}</p>
  <p class="lg-note">Draft structure only. Replace the placeholder text in each section with your approved legal wording before launch.</p>
  <div class="lg-body">{secs}</div>
  <p style="margin-top:50px"><a class="btn" href="contact.html">Questions? Contact us →</a></p>
</section>
</main>
'''
    return head(d["title"] + " | Solascent", d["desc"], "t-dark") + header("") + body + footer() + DRAWER + scripts()

def page_about():
    body = f'''<main id="main">
<section class="band t-light" aria-labelledby="h1">
  <p class="ey">About Solascent</p>
  <h1 class="sr h2" id="h1" style="margin-top:14px">Some Places Stay With You. Some Scents Make Them.</h1>
  <div class="story" style="margin-top:50px"><div><p class="q">A familiar room. A quiet morning. A moment you wish could last a little longer.</p></div>
    <div class="bd"><p>We believe scent has the power to turn ordinary spaces into personal experiences. Through the art of fragrance, we bring atmosphere, emotion, and everyday rituals together.</p>
    <p>{ph("More about the brand to come: founders, craft, materials")}</p><p><a class="btn" href="shop.html">Shop All Diffusers →</a></p></div></div>
</section>
</main>
'''
    return head("About Us | Solascent", "Some places stay with you. Some scents make them. The story behind Solascent home fragrances.", "t-dark") + header("About Us") + body + footer() + DRAWER + scripts()

pages = {"about.html": page_about(), "privacy.html": page_legal("privacy"), "policy.html": page_legal("policy"), "index.html": page_home(), "shop.html": page_shop(), "contact.html": page_contact()}
for s in ORDER: pages[f"{s}.html"] = page_fragrance(s)
for name, html in pages.items():
    with open(os.path.join(OUT, name), "w", encoding="utf-8") as fh: fh.write(html)
    print("wrote", name, len(html)//1024, "KB")
