# Huaxin Vending: reference capture (for the x&Y3 site)

Source: https://www.huaxinvending.com/ (captured 2026-11-14)
Files: `index.html` (rendered DOM), `homepage-full.png` (1440px full-page screenshot), `style-tokens.json` (computed styles)

> Use this as inspiration only. The text, photos, logos and brand belong to Huaxin. Write your own copy and use your own images.

## Style tokens
| Token | Value |
|---|---|
| Primary red (accent, h3, highlights) | `#E50312` rgb(229,3,18) |
| Deep red (buttons/links) | `#C40D23` rgb(196,13,35) |
| Alt red | `#D51518` |
| Text / ink | `#0F0B15` |
| Heading navy | `#071424` |
| Muted gray | `#888888` / `#999999` |
| Light section backgrounds | `#F3F5F6`, `#F6F5FA`, `#F3F3F3`, pink tint `#FFF6F6` |
| Base | white `#FFFFFF` |
| Font stack | "Microsoft YaHei", -apple-system, "Segoe UI", "PingFang SC", "Noto Sans SC", "Helvetica Neue", Arial, sans-serif |
| Sizes | body 14px/400 · h1 60px/900 · h2 33px/700 · h3 26px/900 (red) · buttons 16px/900 |
| Libraries | Swiper (carousels) |

Look and feel: a clean white page with a bold red accent, very heavy (900) headlines, and headings in two tones where one word is emphasized ("*One Platform*, Your Brand"). Sections alternate with light gray backgrounds and use card grids.

## Section order (homepage)
1. Header: logo, nav (Home, Products, About, System, Blog, Solutions, FAQ, Contact), "Send Inquiry" button, language switcher
2. Hero: big headline, product image, "Explore Machines" CTA
3. Platform intro ("One Platform, Your Brand")
4. Feature promo banner (açaí)
5. Stat counters (years, market share, units, countries, capacity)
6. Business solutions: 4 cards by audience
7. Growth path: 4 steps, then CTA
8. Partner logo wall
9. Placement/scenario gallery (12 images)
10. Product catalog grid (with prices and "View Details")
11. "Why choose us": 6 value cards (factory, QC, branding, shipping, support, certifications)
12. Software/OS section: 4 features and a CTA
13. "How to start": 5 steps
14. Blog grid and a recent posts list
15. Contact CTA band ("Talk to a Sales Manager", "Request Quote")
16. Footer: blurb, link columns, address/phone, social icons
17. Floating chat/WhatsApp widget

## Patterns worth reusing
- Stat counter strip to build trust
- Solution cards segmented by audience
- Numbered step sequences (growth path, onboarding)
- Repeated "Request Quote" CTA (it appears 3 times)
- Sticky inquiry button and floating chat

## Full-site crawl (2026-11-14)
- `pages/`: 520 English pages from `sitemap.xml` plus internal links. Each page is saved as `.html` (rendered DOM) and `.txt` (visible text only).
- `pages-index.json`: URL, HTTP status, title and saved filename for every page.
  - 5 links returned 404 on the live site: Cookie-Policy, refund_returns, Privacy-Policy, /84/, /contact-us/.
  - The working contact page is `pages/contact.html`. Products are in `all-ice-cream-vending-machines*.html` and `multi-category-vending-machines*`; About is `about.html`.
- `images/`: 1,017 images (176 MB), stored under the same paths they have on the site (`images/assets/huaxin/...`).
  - `images-index.json` maps each original URL to its local file.
  - 67 image references were malformed URLs and were skipped.
- `css/`: the site's 4 stylesheets (index, header, footer, swiper).
- Not captured: the language subdomains (it/ru/ar/es).
