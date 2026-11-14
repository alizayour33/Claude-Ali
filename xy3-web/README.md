# X&Y3 website (Next.js + Tailwind)

Marketing site for X&Y3: white-label smart ice cream vending machines.

## Pages

| Route | What it is |
|---|---|
| `/` | Homepage (hero, wrap showcase, solutions, growth path, gallery, machines, software, CTA) |
| `/machines` | Catalog grouped by floor-standing / countertop, plus a spec comparison table |
| `/machines/[slug]` | One page per machine (6), pre-rendered at build time |
| `/about` | Company story, manufacturing pillars, values, certifications |
| `/contact` | Quote form (`?machine=xy-bowl` pre-selects a model) |
| `/api/quote` | Serverless function that emails quote requests via Resend |

## Edit content

- **Machines** (names, text, specs, images): `src/lib/machines.ts`
- **Contact details, WhatsApp, social links**: `src/lib/site.ts`
- **Colors and fonts**: `src/app/globals.css` (`@theme` block)
- **Images**: `public/images/`; **logos**: `public/brand/`

Items shown with a dashed orange outline on the site are placeholders. Replace them with real figures.

## Run locally

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build check
```

## Deploy on Vercel

1. Import the GitHub repo in Vercel.
2. Set **Root Directory** to `xy3-web` (Framework: Next.js is auto-detected).
3. Add environment variables (see `.env.example`):
   - `RESEND_API_KEY`: from https://resend.com (free tier is fine)
   - `QUOTE_TO_EMAIL`: inbox that receives quote requests
   - `QUOTE_FROM_EMAIL`: a sender on a domain you verified in Resend
   - `NEXT_PUBLIC_WHATSAPP`: your WhatsApp number, digits only
   - `NEXT_PUBLIC_SITE_URL`: your final domain (used for the sitemap and SEO)
4. Deploy.

Until `RESEND_API_KEY` and `QUOTE_TO_EMAIL` are set, the form shows a friendly message with a pre-filled WhatsApp link instead of failing.
