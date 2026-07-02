# Prompt: Master Destination Package — guide + day trips + country page + suggestions

Companion to `prompt-fill-guide-template.md`, `prompt-fill-daytrip-template.md`, and `prompt-fill-country-template.md`. Use this one instead of running the other three separately when you're working through a country's destination list - it produces the full set of pages for one destination in a single pass and tells you what's still missing for that country.

Replace **[DESTINATION]** and **[COUNTRY]** below, then paste this along with the contents of **all three templates you'll need**: `guides/template.html`, `guides/daytrip-template.html`, and `country-template.html`. (If you already have a published country page for [COUNTRY], paste that instead of the blank country template - see Part 3.)

If you're working through a list of destinations for one country, also paste your **full destination list** for [COUNTRY] and the **current `guides.json`** (or just the entries for [COUNTRY] if the file is large) - both are needed for Part 3 and Part 4 to work properly.

---

You are writing for Globehint, a travel website whose voice is direct, opinionated, and practical - like a well-travelled friend giving you the real version of a place, not a brochure. Favour specific detail over vague enthusiasm ("the tram stops running at 1am, so budget for a taxi after that" rather than "transport is convenient"), and be honest about what's overrated as well as what's worth it. Do not use em dashes anywhere in any of the output; use other correct punctuation instead.

This is a combined job with four parts. Do them in order, and label each part clearly in your response (`## Part 1: Main Guide`, `## Part 2: Day Trips`, `## Part 3: Country Page`, `## Part 4: Further Destinations`) so the output is easy to split up when I go to publish it.

## Stay thorough through all four parts

This is a long, multi-part job and it's easy to front-load effort into Part 1 and coast through the rest. Don't. Treat each part - including every individual day trip in Part 2 - as its own full research task deserving the same care as the first thing you wrote, not a formality to close out once the "real" work is done.

- Do not shorten, summarize, skip, or generically fill any section because you're deep into a long response. If you catch yourself writing something vague ("a charming old town," "plenty of restaurants") instead of a specific, researched detail, stop and actually research it - the same standard from Part 1 applies word-for-word in Part 2's fourth day trip and in Part 4's tenth suggestion.
- Each day trip in Part 2 gets the full section list from the day-trip template, fully researched, even if you've already written two or three before it. Don't let later day trips get thinner than the first one.
- Before moving from one part to the next, briefly re-read what you just wrote and check it against that part's defaults and research standard - genuinely fix anything that's drifted into filler rather than pushing on regardless.
- If the job is large enough that quality would genuinely suffer by pushing through in one go (e.g. six or more day trips), say so explicitly and propose splitting the remainder into a follow-up response, rather than quietly producing weaker output to finish everything at once.
- Part 4's suggestions deserve the same honesty as everything else: a rushed, generic-sounding suggestion with no real justification is worse than a shorter, fully-real list. Don't pad it to look comprehensive.

## Shared research standard (applies to every part below)

- Every factual claim (prices, opening hours, transport costs, phrase pronunciations, distances, emergency numbers) must be something you're confident is true, not invented to sound plausible. Use a realistic range or softer phrasing over a fabricated precise figure.
- Never pad or force a list to hit a round number, and never delete a genuinely real entry just to hit one either. Defaults given below are starting points, not requirements - go shorter if that's all the real research supports, go longer if a destination genuinely has more worthwhile entries than the default. Whenever you deviate meaningfully from a default, say so briefly (one line is enough) - either inline as you go, or grouped at the end of that Part.
- Real establishment names only if you're genuinely confident they exist - never invent a plausible-sounding name. If unsure, describe the type of venue/area instead of naming one.
- End your entire response (not each part) with one consolidated **"Verify before publishing"** list, grouped by page, covering anything time-sensitive or uncertain across all parts.
- Do not change any HTML tag, class name, id, or `<script>` block in any template - only replace bracketed placeholder text and the handful of slug-based attribute values. Keep every `<meta name="robots" content="noindex, nofollow">` line as-is; I'll remove those myself when a page is ready to go live.

---

## Part 1: Main Guide (`guides/template.html`)

Research **[DESTINATION]** and rewrite the guide template with every placeholder replaced, following this section list and its defaults:

1. `<head>`: title, meta description, canonical URL (`guides/[slug].html`), OG/Twitter tags, JSON-LD (TouristAttraction, Article, BreadcrumbList).
2. Hero: breadcrumb, H1, subhead/blurb, hero image alt text.
3. Overview: 3-4 sentence lede, best time to visit, typical trip length, quickfacts grid, "before you book," closed-days note, accessibility, common scams.
4. Attractions: 4 featured unmissable attractions, 4 secondary attractions, ~12 compact minor attractions, the day-trip nudge block, 2 skip-unless-completionist entries (0-1 fine, delete table if nothing to warn about), one souvenir recommendation.
5. Where to stay: 4 real neighbourhoods (fewer if the city's too small for 4 distinct ones), plus a budget callout.
6. Airport transport: real methods with time/cost/notes, default 3 rows.
7. Getting around: local transport modes, card/ticket system, walking note.
8. Tourist cards: default 2-3 real passes with an honest "worth it if..." verdict; delete the table (with a note why) if none are worthwhile.
9. Eat & drink: signature dish/debate, breakfast/dinner/quick-eats spots (default 4 each), coffee/drink-culture note.
10. Nightlife: late-night bars and after-hours spots (default 3 and 2), safety/getting-home callout.
11. Photogenic spots: default 5, each with a one-line timing/angle tip.
12. **Day trips: default 3 real day-trip destinations with transport, cost, and departure point.** This list is the input to Part 2 below - see the handoff note there.
13. Walking tour: a real, walkable route with 4-6 stops and timing.
14. Language: 6 real local phrases with phonetic pronunciation, plus an etiquette note.
15. Tips & tricks: default 6 genuinely specific tips.

**Also produce** the matching `guides.json` entry:
```json
{
  "name": "[DESTINATION]",
  "url": "guides/[slug].html",
  "country": "[COUNTRY]",
  "continent": "[Europe/Asia/Africa/North America/South America/Oceania]",
  "flag": "[lowercase ISO country code]",
  "vibe": "[food, nature, history, nightlife, alpine, wellness, adventure, art, design, shopping, spirituality, luxury, romance, family, tech, coastal, rural]",
  "published": "[today's date, YYYY-MM-DD]",
  "blurb": "[same hook used in the subhead]",
  "image": "images/guides/[slug]-hero-800.jpg",
  "imageAlt": "[same alt text used in the hero]"
}
```

---

## Part 2: Day Trips (`guides/daytrip-template.html`)

**Handoff from Part 1**: take the real day-trip destinations you listed in [DESTINATION]'s "Day Trips" section above. For each one that is genuinely a distinct, worthwhile place to visit (not vague filler), produce a **complete, separate day-trip page** using `guides/daytrip-template.html`, with [DESTINATION] as the `[BASE CITY]`.

- If Part 1 turned up zero genuine day trips, skip this part entirely and say so in one line - do not invent one to fill the section.
- If Part 1 turned up more than 3 genuine day trips because the destination warrants it, write all of them, not just 3.
- For each day trip, fill every placeholder in the template:
  1. `<head>`: title, description, canonical (`guides/[slug].html`), OG/Twitter tags, JSON-LD (Article + BreadcrumbList only - no TouristAttraction block).
  2. Hero: breadcrumb ("Day Trips"), H1 ("[Day Trip Destination] Day Trip from [DESTINATION]"), subhead, duration badge.
  3. Overview: lede, best months, duration + suggested departure time, quickfacts (currency, plug, tap water, emergency number, distance from [DESTINATION] instead of SIM/WiFi, tipping), "day trip or overnight?" callout, "before you go" callout, closed-days note, accessibility, common scams.
  4. Getting There & Around: real transport options from [DESTINATION] with time/cost/notes, plus getting-around-once-there info.
  5. Suggested Itinerary: realistic hour-by-hour or stop-by-stop plan fitting the stated duration.
  6. Eat & Drink, Photogenic Spots, Language, Tips & Tricks: same standard as the main guide, defaults of 4/4/4/5/6, adjusted down freely for a small town.

- For each, also produce the matching `guides.json` entry (same schema as Part 1, plus `dayTripFrom` and `duration`):
```json
{
  "name": "[Day Trip Destination]",
  "url": "guides/[slug].html",
  "country": "[COUNTRY]",
  "continent": "[match Part 1]",
  "flag": "[lowercase ISO country code]",
  "vibe": "[pick one]",
  "published": "[today, YYYY-MM-DD]",
  "dayTripFrom": "[DESTINATION - must exactly match the name field used in Part 1]",
  "duration": "[Half day / Full day]",
  "blurb": "...",
  "image": "images/guides/[slug]-hero-800.jpg",
  "imageAlt": "..."
}
```

- **Cross-link reminder**: once these pages exist, [DESTINATION]'s own "Day Trips" section cards need their `href="#"` updated to the real published URLs, and each day-trip page's own day-trip-nudge/back-link (if the template has one) should point back to [DESTINATION]'s guide. Flag this as a manual step in your response rather than guessing at final filenames I haven't confirmed.

---

## Part 3: Country Page (`[countryname-lowercase-no-spaces].html`)

Using `country-template.html` (or the existing live country page for [COUNTRY], if I've pasted one instead - in that case just confirm it's already correct rather than rewriting it):

1. `<head>`: title, description, canonical (`[slug].html` at repo root, no subfolder), OG/Twitter tags, JSON-LD (CollectionPage + BreadcrumbList).
2. Hero: correct ISO 3166-1 alpha-2 flag class (e.g. `fi-pt`), H1, lede.
3. "More on the way" section: country name in the heading.
4. `const COUNTRY_NAME = "[Country Name]"` - must exactly match the `country` field used in Part 1 and Part 2's `guides.json` entries, same spelling and capitalization.

Save as `[countryname-lowercase-no-spaces].html` at the repo root (e.g. `germany.html`, `unitedkingdom.html`, no hyphens even for multi-word names), matching `countrySlug()` in `navbar.js`.

This part needs no research or fact-checking - it's pure configuration. Double-check the flag code and `COUNTRY_NAME` match before handing it back.

---

## Part 4: Further Destinations Worth a Guide

This part needs the destination list and `guides.json` context mentioned at the top - if I haven't pasted those, ask me for them instead of guessing.

Compare my full destination list for [COUNTRY] against what's already published (existing `guides.json` entries) and what's now covered by Parts 1-2 above. Then:

- List any places on my original list that **don't yet have a guide** and aren't covered by today's work, so I know what's left in the queue.
- Separately, suggest any **additional destinations not currently on my list** that genuinely deserve a Globehint guide for [COUNTRY] - real, well-known or distinctly worthwhile places, not padding. For each suggestion, give one line on why it's worth covering (e.g. "genuinely different vibe from the capital" or "a common independent day trip that isn't just a extension of [DESTINATION]'s own day trips"). Rank suggestions by how obvious an omission they'd be to someone who knows [COUNTRY] well - most obvious first.
- If [COUNTRY]'s list is basically complete already, say so plainly rather than inventing suggestions to fill space.
- Do not suggest a place as a new standalone guide if it's more honestly a day trip from a city already on the list (or from [DESTINATION] itself) - flag it as a day-trip candidate instead, and note which base city it'd hang off.

---

## Rules (apply across all parts)

- Match each template's existing section order and heading structure exactly.
- Only replace bracketed placeholder text and slug-based attribute values - never touch HTML structure, classes, ids, or scripts.
- Keep day-trip and other cross-link `href` attributes as `#` unless real published URLs are already confirmed.
- No em dashes anywhere - use commas, colons, or full stops instead.
- Label each part clearly (`## Part 1` etc.) so the response can be split cleanly when publishing.

Destination: **[DESTINATION]**
Country: **[COUNTRY]**
