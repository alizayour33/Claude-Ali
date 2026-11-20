# X&Y3 website (Next.js + Tailwind)

Public marketing site for X&Y3, built to the "Website Design & Developer Specification v1.0" (Phase 1).

## Pages

| Route | Page |
|---|---|
| `/` | Home (9 sections from the spec wireframe) |
| `/solutions` | Solutions overview |
| `/solutions/frozen-dessert` | Frozen Dessert Robotics |
| `/solutions/br3wbot` | Br3wBot Coffee Robotics |
| `/solutions/emerging` | Emerging Robotic Solutions |
| `/services` | Services |
| `/industries` | Industries |
| `/connect` | X&Y3 Connect (marketing page, concept dashboard) |
| `/support` | Support + support request form (gives a reference number) |
| `/about` | About |
| `/start-a-project` | Lead form with intent selector |
| `/partner` | Partner With X&Y3 + partner inquiry form |
| `/contact` | Contact routes |
| `/privacy`, `/terms` | Placeholders pending legal review |
| `/api/lead` | Form handler: validation, file checks, spam trap, rate limit, routing, email |

## Edit content

- **All copy**: `src/content/en.ts`
- **Emails, social links**: `src/lib/site.ts`
- **Colors and fonts**: `src/app/globals.css` (`@theme`)
- **Images**: `public/images/`. An empty `image: ""` in the content file shows a marked "Photo pending" frame.
- **Logo**: `src/components/Logo.tsx` (concept A). All three concepts are in `public/brand/`.

## Adding Arabic later

Add `"ar"` to `src/i18n/config.ts`, create `src/content/ar.ts` with the same shape as `en.ts`, and register it in `src/content/index.ts`. Arabic pages then appear under `/ar/...` with right-to-left layout. Remove the `/ar` redirects in `next.config.ts`.

## Run locally

```bash
npm install
npm run dev      # http://localhost:3000
npm run build
```

## Deploy on Vercel

1. Import the repo and set **Root Directory** to `xy3-web`.
2. Add the environment variables listed in `.env.example`.
3. Deploy. Vercel preview deployments act as the staging environment; the production branch is production.

Without `RESEND_API_KEY` and a recipient address, forms show a marked demo success state on preview/local, and an error on production (so real leads are never dropped silently).

## Not in this build (from the spec)

- CMS and CRM integration (to be selected before launch)
- Ticketing system integration (support requests are emailed with a reference number)
- X&Y3 Connect application (Phase 2, separate product)
- Final legal pages, final logo, Br3wBot and real installation photography
