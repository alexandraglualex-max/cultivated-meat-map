# Cultivated Meat Map

A static site showing restaurants/retailers currently (or previously) selling
**cultivated (lab-grown) chicken and salmon** — grown from real animal cells,
not genetically modified. Built with plain HTML/CSS/JS + Leaflet, no build step.

## Files

- `index.html` — the site: a single vertical-scroll page (hero → about → map → who produces it → where it's banned → submit a tip). Styling is inline in the `<style>` block; no separate CSS file.
- `preview-common.js` — the map/filter/card logic that drives `index.html`.
- `data.json` — the location dataset.
- `bans.json` — the banned/restricted states list.
- `netlify.toml` — deploy config.
- `last-update-log.md` — plain-English changelog written by the monthly automated refresh (see below).

This started as four competing layout directions (editorial, lab-notebook, minimal, bold) that all shared `data.json`/`bans.json`/`preview-common.js`. The bold layout was picked as final, so it's now `index.html` and the other three have been deleted — one site, one set of files, nothing left to drift out of sync.

## Deploy to Netlify

1. Go to [app.netlify.com](https://app.netlify.com) → **Add new site → Deploy manually**.
2. Drag this whole folder onto the upload area. Netlify serves it as-is — no build command needed.
3. That's it — you'll get a live URL. Add a custom domain under **Site settings → Domain management** if you want one.

Alternative (Git-based, recommended once you're editing regularly):
1. Push this folder to a GitHub repo.
2. In Netlify: **Add new site → Import an existing project** → pick the repo.
3. Build command: leave blank. Publish directory: `.` (repo root).
4. Every push to your main branch auto-deploys.

## The "submit a location" form

The form in `index.html` uses **Netlify Forms** (`data-netlify="true"`) — free, no backend needed.
Once deployed, submissions appear under **Site settings → Forms** in your Netlify dashboard.
Nothing is added to the map automatically; you review a tip, then manually add it to `data.json`.

To turn on email notifications for new submissions: **Forms → Settings and usage → Form notifications**.

## Adding or editing a location

Open `data.json` — it's a plain array, so add a new object anywhere inside the `[ ]` brackets (comma after the previous entry's closing `}`):

```json
{
  "id": "unique-slug",
  "name": "Restaurant Name",
  "product": "chicken",          // "chicken" or "salmon"
  "company": "Company Name",
  "city": "City, State, Country",
  "address": "Street address",
  "lat": 00.0000,
  "lng": -00.0000,
  "status": "active",            // "active", "historical", or "pilot" (non-commercial test kitchen)
  "notes": "Short context.",
  "sourceUrl": "https://...",
  "sourceName": "Publication name",
  "lastVerified": "YYYY-MM-DD"
}
```

Get lat/lng from [latlong.net](https://www.latlong.net/) or by right-clicking the spot on Google Maps. Save the file, redeploy (or wait for auto-deploy if you're on Git-based deploys), and the new pin appears on the site. The hero stats ("N active locations," "N states restricting sale") are computed live from these files on page load — you never need to update a count by hand.

## Adding or editing a banned/restricted state

Open `bans.json`. Full bans and partial restrictions are two separate arrays, and each entry can carry its own citation:

```json
{
  "fullBans": [
    { "state": "State name", "note": "One-line context, e.g. when the law passed.", "sourceUrl": "https://...", "sourceName": "Publication name" }
  ],
  "restrictions": [
    { "state": "State name", "note": "One-line context.", "sourceUrl": "https://...", "sourceName": "Publication name" }
  ],
  "generalSourceUrl": "https://...",
  "generalSourceName": "Publication name",
  "lastVerified": "YYYY-MM-DD"
}
```

Add a state to `fullBans` for an outright sale/production ban, or to `restrictions` for anything short of that (labeling rules, institutional purchase bans, etc). Give each new entry its own `sourceUrl`/`sourceName` where you can. `generalSourceUrl`/`generalSourceName` is only a fallback the page shows when an entry's own source is `null` — that's there because the original 9 entries were compiled from one roundup article rather than 9 separate ones; new entries shouldn't rely on it.

## Data notes & sources (compiled Aug 6, 2026)

**Currently active:**
- Kann (Portland, OR) — Wildtype cultivated salmon
- barmini by José Andrés (Washington, DC) — Wildtype cultivated salmon
- The Walrus and the Carpenter (Seattle, WA) — Wildtype cultivated salmon
- Kingfisher Bar & Grill (Tucson, AZ) — Wildtype cultivated salmon
- Huber's Butchery & Bistro (Singapore) — GOOD Meat cultivated chicken (retail + bistro)

**Historical (no longer serving):**
- Bar Crenn (San Francisco) — Upside Foods cultivated chicken, 2023 pop-up ended
- China Chilcano (Washington, DC) — GOOD Meat cultivated chicken, limited tasting menu ended
- Keng Eng Kee Seafood, Singapore — GOOD Meat chicken satay, 2022 hawker collab
- Loo's Hainanese Curry Rice, Tiong Bahru Market, Singapore — GOOD Meat curry rice, hawker collab

**Non-commercial pilot:**
- The Chicken (Ness Ziona, Israel) — SuperMeat's in-house test restaurant; food is given away, not sold, because Israel hasn't approved commercial sale of cultivated meat.

**Dead ends worth knowing about (not on the map — no restaurant ever opened):**
- **Believer Meats** — got FDA/USDA approval for cultivated chicken in 2025, then shut down after a lawsuit before any product reached a restaurant or store.
- **Upside Foods x Pat LaFrieda shredded chicken** — held tasting *events* in NYC (not an open-to-the-public restaurant) while targeting a 2025–2026 relaunch; no permanent menu placement confirmed yet.

## Why there's no single "comprehensive registry" — and how to keep building one

No government agency, industry group, or company maintains a public master list of
every place cultivated meat is sold. That's structural, not a research gap:

- **Volumes are tiny.** Most "launches" are single-restaurant pop-ups producing a few
  pounds a week — covered once by trade press, then never updated.
- **Hawker/rotation models.** GOOD Meat swaps which Singapore hawker stall carries its
  chicken roughly every two months, so any list of hawker stalls goes stale fast.
- **Companies go dark.** Believer Meats had regulatory approval and a built factory,
  then closed before ever landing in a restaurant — no registry would have caught that
  in advance.
- **Regulatory approval ≠ availability.** Just because the FDA/USDA cleared a product
  doesn't mean it's on a menu anywhere; you have to track restaurant announcements
  separately from regulatory news.

To make this dataset as comprehensive as it can realistically be, treat it as a living
document fed from three channels:

1. **Company blogs/press pages** — check periodically: [wildtypefoods.com/news](https://www.wildtypefoods.com/news/blog), [goodmeat.co/all-news](https://www.goodmeat.co/all-news), [upsidefoods.com](https://upsidefoods.com/), SuperMeat's site. These are the first to announce new restaurant partners.
2. **Trade press that covers this beat closely** — Green Queen, Food Dive, AgFunderNews, vegconomist. Worth a recurring search rather than a one-time check.
3. **The "submit a location" form already on the site** — crowdsourced tips from anyone who's actually seen it on a menu, reviewed in your Netlify Forms dashboard before you add it to `data.json`.

**This is now automated.** A scheduled task ("cultivated-meat-map-refresh") runs on the
1st of every month, researches these same sources, and edits `data.json`/`bans.json`
directly — no manual review, no approval step. Each run appends a one-line summary to
`last-update-log.md` in this folder so you can see what changed at a glance.

What this automation does *not* do: push the updated files to your live Netlify site.
It only keeps the files in this folder current. See "Keeping the live site in sync"
below for how to close that last mile.

Full source links are in each entry's popup on the map and in `data.json`/`bans.json`.

## Keeping the live site in sync with the automated updates

The monthly refresh updates the files in this folder, but getting those changes onto
your actual published URL still needs a deploy step. Decided approach: **Netlify CLI
with a personal access token** — Netlify can deploy straight from this folder with one
command (`netlify deploy --prod`), no GitHub involved. Once you generate a token
(Netlify → User settings → Applications → New access token) and share it, that command
gets added to the scheduled task itself so publishing happens automatically after every
monthly refresh — genuinely zero manual steps from that point on. Not wired in yet;
the token is the only thing missing.

Until then, either redeploy manually (drag this folder onto Netlify's manual-deploy
page) after checking `last-update-log.md`, or connect a GitHub repo so pushes
auto-deploy — either works as a stopgap.

## Ideas for next steps (design/UI/access, as you build this out)

- Swap the OpenStreetMap tile layer for Mapbox/Stadia if you want a custom look (needs an API key).
- Add password-gate or Netlify Identity if you want to restrict who can view or submit.
- Add a "last updated" build timestamp pulled from a Netlify build hook.
- Consider a simple CMS (Netlify CMS / Decap) so non-technical editors can add locations without touching JSON.
