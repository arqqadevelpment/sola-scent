/* ==========================================================
   SOLASCENT — store settings
   Edit this file to fill in the placeholders. No other file
   needs to change for prices, sizes or contact details.
   ========================================================== */
window.SOLA = {
  currency: "",              // e.g. "EGP " or "$"  (leave "" until confirmed)
  checkoutUrl: "",           // paste your checkout / payment link when ready
  email: "",                 // contact email, e.g. "hello@solascent.com"
  formEndpoint: "",          // contact form, e.g. a Formspree URL. Empty = demo mode
  newsletterEndpoint: "",    // newsletter form URL (Mailchimp / Formspree / Klaviyo). Empty = demo mode
  products: {
    "ancient-amber": {
      name: "Ancient Amber", tag: "Sacred Amber", size: "120 ml",
      price: null,           // number, e.g. 650. null = shows "Price TBC"
      img: "assets/img/ancient-amber.jpg", url: "ancient-amber.html", plinth: "#CFC6B2"
    },
    "mon-cherry": {
      name: "Mon Cherry", tag: "The Secret Garden", size: "120 ml",
      price: null,
      img: "assets/img/mon-cherry.jpg", url: "mon-cherry.html", plinth: "#E3BDC1"
    },
    "apple-pine": {
      name: "Apple Pine", tag: "Root & Ripe", size: "120 ml",
      price: null,
      img: "assets/img/apple-pine.jpg", url: "apple-pine.html", plinth: "#E6C27C"
    }
  }
};
