# Prompt: Fill in guides/template.html

Copy everything below, replace **[DESTINATION]** (all instances) with the place you're writing about, then paste it into an AI chat along with the contents of `guides/template.html`.

---

You are writing a destination guide for Globehint, a travel website whose voice is direct, opinionated, and practical - like a well-travelled friend giving you the real version of a place, not a brochure. The house style favours specific detail over vague enthusiasm ("the tram stops running at 1am, so budget for a taxi after that" rather than "transport is convenient"), and is honest about what's overrated as well as what's worth it.

I am giving you an HTML template with bracketed placeholders like `[Location Name]`, `[Overview paragraph - ...]`, `[Featured Attraction 1 Name]`, etc. Your job is to research **[DESTINATION]** and rewrite the file with every placeholder replaced by accurate, specific, well-researched content - while leaving 100% of the HTML structure, classes, IDs, and JavaScript untouched.

## Research standard

- Every factual claim (prices, opening hours, transport costs, phrase pronunciations, distances, emergency numbers) must be something you're confident is true, not invented to sound plausible. If you're not confident about a specific number, use a realistic range or a softer phrasing ("a few euros" rather than a fabricated exact price) instead of guessing precisely.
- Flag anything you're materially unsure of at the end of your response as a short "Verify before publishing" list, rather than silently guessing inside the guide itself.
- Prices, hours, and transport details drift over time - note in your flagged list anything that's especially likely to be outdated in 6-12 months (e.g. entry fees, seasonal closures).
- **Never pad or force a count to hit a round number.** Every list length mentioned below (4 attractions, 12 minor attractions, 4 restaurants, 6 phrases, etc.) is a *default*, not a requirement. If your genuine research only supports 8 solid minor attractions instead of 12, or 3 real breakfast spots instead of 4, delete the extra `.poi-compact`/`.poi-card` blocks and leave a shorter, fully-real list. If a destination genuinely has more than enough - a bigger city might easily support 20 worthwhile minor attractions - duplicate the block as many extra times as needed and include them all. A shorter, 100%-real list is always better than a padded one with an invented entry sitting in it unflagged. Tell me in your response wherever you've deviated from a default count and why (e.g. "only 3 late-night bars listed - Location's after-dark scene is genuinely limited to a couple of streets").

## What to fill in

Work through the template section by section and replace every bracketed placeholder:

1. **`<head>`**: title, meta description, canonical URL, all OG/Twitter tags, and the three JSON-LD blocks (TouristAttraction, Article, BreadcrumbList). Use the URL slug `guides/[lowercase-hyphenated-name].html`.
2. **Hero section**: breadcrumb, H1, subhead/blurb (one punchy hook, not a generic sentence), hero image alt text describing what the photo should show (I'll source the actual photo separately).
3. **Overview**: 3-4 sentence lede, best time to visit, typical trip length, the quickfacts grid (currency, plug type, tap water, emergency number, SIM/WiFi, tipping norms), the "before you book," "closed on certain days," accessibility, and common-scams callouts.
4. **Attractions**: 4 featured "unmissable" attractions with full descriptions/tips (default 4 - fewer if the destination genuinely doesn't have 4 must-sees, more only if you'd truly call them all unmissable), 4 secondary attractions, ~12 compact-list minor attractions (add or delete rows to match how many genuinely distinct, worthwhile minor spots actually exist - don't split one attraction into two rows to hit the count, and don't omit a 13th, 14th, etc. if they're real and worth including), the day-trip nudge (name a real nearby day-trip-worthy place, or delete this block entirely if there isn't a standout one), 2 "skip unless completionist" entries with honest reasons (0-1 is fine if you can't name a genuinely overrated attraction - don't invent one just to fill the table; delete the table entirely if there's truly nothing to warn about), and one genuine local souvenir recommendation.
5. **Where to stay**: 4 real neighbourhoods with who they suit and a practical note each (fewer if the city is small enough that 4 distinct neighbourhoods don't make sense), plus a budget callout.
6. **Airport transport**: real methods with time/cost/notes - default 3 rows, but only as many as actually exist (a small airport might only have 2 realistic ways in/out; a major hub might have 4+).
7. **Getting around**: local transport modes, card/ticket system, a walking note.
8. **Tourist cards**: real passes with cost, validity, and an honest "worth it if..." verdict - default 2-3, but 1 is fine if that's all that exists, and delete the whole table (with a note explaining why) if the destination genuinely has no worthwhile tourist card.
9. **Eat & drink**: the signature local dish/debate, breakfast/dinner/quick-eats spots (default 4 each - go lower if you can't name that many genuinely good, real options in a category; go higher if the food scene warrants it), a coffee/drink-culture note. Real establishment names only if you're genuinely confident they exist - never invent a plausible-sounding name or a name mixing scripts/languages oddly. If you're not sure a specific place is real, describe the type of venue/area instead of naming one.
10. **Nightlife**: late-night bars and after-hours spots (default 3 and 2), a safety/getting-home callout. Fewer is fine for a destination that's genuinely not a nightlife city - don't invent bars to avoid an empty-looking list.
11. **Photogenic spots**: default 5 specific spots with a one-line timing/angle tip each - adjust up or down based on how many genuinely distinct photogenic spots the destination has.
12. **Day trips**: default 3 real day-trip destinations with transport, cost, and departure point - fewer if fewer genuinely good ones exist within a reasonable range, more if there are several.
13. **Walking tour**: a real, walkable, logical route with 4-6 stops, timing between them, and one insider tip on one stop - the stop count should fit the actual route, not a target number.
14. **Language**: 6 real local phrases with phonetic pronunciation, plus a language-etiquette note.
15. **Tips & tricks**: default 6 genuinely specific, non-generic practical tips - fewer if you can't reach 6 without resorting to generic filler ("bring a phone charger"); more if the destination has unusual quirks worth flagging.

**On adjusting counts**: when you add or remove a repeatable block (a `.poi-card`, `.poi-compact`, table row, etc.), duplicate or delete the entire HTML block cleanly - don't leave orphaned tags or partial blocks. Mention in your response any section where you significantly deviated from the defaults above and why, so I know it was a deliberate research-driven choice and not something skipped by accident.

## Also produce

After the HTML, give me the matching `guides.json` entry (ensure it is on one line for copy and pastability):

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
- Do not use em dashes, replace them with other correct alternatives.

Destination: **[DESTINATION]**
