# Prompt: Fill in guides/template.html

Copy everything below, replace **[DESTINATION]** (all instances) with the place you're writing about, then paste it into an AI chat along with the contents of `guides/template.html`.

---

You are writing a destination guide for Globehint, a travel website whose voice is direct, opinionated, and practical - like a well-travelled friend giving you the real version of a place, not a brochure. The house style favours specific detail over vague enthusiasm ("the tram stops running at 1am, so budget for a taxi after that" rather than "transport is convenient"), and is honest about what's overrated as well as what's worth it.

I am giving you an HTML template with bracketed placeholders like `[Location Name]`, `[Overview paragraph - ...]`, `[Featured Attraction 1 Name]`, etc. Your job is to research **[DESTINATION]** and rewrite the file with every placeholder replaced by accurate, specific, well-researched content - while leaving 100% of the HTML structure, classes, IDs, and JavaScript untouched.

## Research standard

- Every factual claim (prices, opening hours, transport costs, phrase pronunciations, distances, emergency numbers) must be something you're confident is true, not invented to sound plausible. If you're not confident about a specific number, use a realistic range or a softer phrasing ("a few euros" rather than a fabricated exact price) instead of guessing precisely.
- Flag anything you're materially unsure of at the end of your response as a short "Verify before publishing" list, rather than silently guessing inside the guide itself.
- Prices, hours, and transport details drift over time - note in your flagged list anything that's especially likely to be outdated in 6-12 months (e.g. entry fees, seasonal closures).

## What to fill in

Work through the template section by section and replace every bracketed placeholder:

1. **`<head>`**: title, meta description, canonical URL, all OG/Twitter tags, and the three JSON-LD blocks (TouristAttraction, Article, BreadcrumbList). Use the URL slug `guides/[lowercase-hyphenated-name].html`.
2. **Hero section**: breadcrumb, H1, subhead/blurb (one punchy hook, not a generic sentence), hero image alt text describing what the photo should show (I'll source the actual photo separately).
3. **Overview**: 3-4 sentence lede, best time to visit, typical trip length, the quickfacts grid (currency, plug type, tap water, emergency number, SIM/WiFi, tipping norms), the "before you book," "closed on certain days," accessibility, and common-scams callouts.
4. **Attractions**: 4 featured "unmissable" attractions with full descriptions/tips, 4 secondary attractions, 12 compact-list minor attractions, the day-trip nudge (name a real nearby day-trip-worthy place), 2 "skip unless completionist" entries with honest reasons, and one genuine local souvenir recommendation.
5. **Where to stay**: 4 real neighbourhoods with who they suit and a practical note each, plus a budget callout.
6. **Airport transport**: 3 real methods with time/cost/notes.
7. **Getting around**: local transport modes, card/ticket system, a walking note.
8. **Tourist cards**: 2-3 real passes with cost, validity, and an honest "worth it if..." verdict.
9. **Eat & drink**: the signature local dish/debate, 4 breakfast spots, 4 dinner spots, 4 quick-eats spots, a coffee/drink-culture note. (Real establishment names if you're confident of them; otherwise describe the type of venue/area rather than inventing a specific business name.)
10. **Nightlife**: 3 late-night bars, 2 after-hours spots, a safety/getting-home callout.
11. **Photogenic spots**: 5 specific spots with a one-line timing/angle tip each.
12. **Day trips**: 3 real day-trip destinations with transport, cost, and departure point - these should be places you'd genuinely recommend writing a full Globehint day-trip guide for later.
13. **Walking tour**: a real, walkable, logical route with 4-6 stops, timing between them, and one insider tip on one stop.
14. **Language**: 6 real local phrases with phonetic pronunciation, plus a language-etiquette note.
15. **Tips & tricks**: 6 genuinely specific, non-generic practical tips.

## Also produce

After the HTML, give me the matching `guides.json` entry:

```json
{
  "name": "[DESTINATION]",
  "url": "guides/[slug].html",
  "country": "[Country]",
  "continent": "[Europe/Asia/Africa/North America/South America/Oceania - match one of these exactly]",
  "flag": "[lowercase ISO country code, e.g. pt, jp, mx]",
  "vibe": "[pick the single best match from: food, nature, history, nightlife, alpine, wellness, adventure, art, design, shopping, spirituality, luxury, romance, family, tech, coastal, rural]",
  "published": "[today's date, YYYY-MM-DD]",
  "blurb": "[same one-to-two sentence hook used in the subhead]",
  "image": "images/guides/[slug]-hero-800.jpg",
  "imageAlt": "[same alt text used in the hero]"
}
```

## Rules

- Do not change any HTML tag, class name, id, or the `<script>` block at the bottom - only replace bracketed placeholder text and the handful of `[slug]`-based attribute values (canonical URL, image paths, hrefs).
- Do not remove the `<meta name="robots" content="noindex, nofollow">` line - I'll remove that myself once I've reviewed the guide.
- Keep the day-trip card `href` attributes as `#` unless I've told you the real day-trip guides already exist and their URLs.
- Match the section order and heading structure exactly as given in the template.

Destination: **[DESTINATION]**
