# Prompt: Day Trip — `guides/daytrip-template.html`

Companion to `prompt-fill-guide-template.md` (which covers `guides/template.html`). Each section below is a standalone, copy-pasteable prompt for one template. Replace the bracketed placeholders in the prompt itself (e.g. `[DESTINATION]`, `[TOPIC]`) before pasting, and paste the actual template file's contents alongside it.

All shared house-style and research-standard rules from the main guide prompt apply here too: direct, opinionated, specific-over-vague voice; flag anything uncertain at the end rather than inventing it; don't touch HTML structure/classes/IDs/JS, only bracketed placeholder text and the handful of slug-based attributes.

---

Replace **[DESTINATION]** and **[BASE CITY]** throughout, then paste this with the template file.

---

You are writing a day-trip guide for Globehint, in the same direct, specific, opinionated house voice as its main city guides - a well-travelled friend's honest take, not brochure copy.

I am giving you the day-trip template (`guides/daytrip-template.html`), a lighter version of the full city guide template covering only what a day-tripper actually needs. Research **[DESTINATION]** as a day trip from **[BASE CITY]** and replace every bracketed placeholder while leaving all HTML structure, classes, IDs, and JavaScript untouched.

**Research standard**: every price, time, distance, and transport detail must be something you're confident is accurate, not invented to sound plausible. Use realistic ranges over fabricated precision where you're unsure. End your response with a "Verify before publishing" list of anything time-sensitive (ticket prices, seasonal train schedules, opening hours). **Never pad a list to hit a round number** - defaults below (transport options, breakfast/dinner spots, photo spots, etc.) are starting points, not requirements. Delete rows/blocks you can't fill with something real; duplicate and add extra ones if a category genuinely has more good options than the default. **On adjusting counts**: when you add or remove a repeatable block (a `.poi-card`, `.poi-compact`, table row, itinerary stop, etc.), duplicate or delete the entire HTML block cleanly - don't leave orphaned tags or partial blocks. Note any section where you deviated meaningfully from the default count and why.

**Sections to fill**:
1. `<head>`: title, description, canonical (`guides/[slug].html`), OG/Twitter tags, JSON-LD (Article + BreadcrumbList - note this template has no TouristAttraction block, unlike the main guide template).
2. Hero: breadcrumb ("Day Trips" not "Destinations"), H1 ("[DESTINATION]: Day Trip from [BASE CITY]"), subhead, duration badge (Half day / Full day).
3. Overview: lede, best months, duration + suggested departure time from [BASE CITY], quickfacts (currency, plug, tap water, emergency number, **distance from [BASE CITY]** instead of SIM/WiFi, tipping), "day trip or overnight?" callout (an honest steer - is one day really enough?), "before you go" callout, closed-days note, accessibility, common scams.
4. Getting There & Around: real transport options from [BASE CITY] with time/cost/notes - default 2-3 methods, but 1 is fine if that's genuinely the only sensible way to get there (e.g. a single direct train), and more if several realistic options exist; plus getting-around-once-there info.
5. Suggested Itinerary: a realistic hour-by-hour or stop-by-stop plan that fits within the stated duration - the number of stops should fit the actual place and pacing, not a fixed target; don't pad the itinerary with a weak stop just to fill the day.
6. Eat & Drink, Photogenic Spots, Language, Tips & Tricks: same standard as the main guide template - specific, real, no filler. List lengths (breakfast/dinner/quick-eats spots, photo spots, tips) follow the same defaults as the main guide prompt (4, 4, 4, 5, 6 respectively) but adjust up or down to match what's genuinely real for this smaller destination - a day-trip town will often have fewer real options than a capital city, and that's fine.

**Also produce** the matching `guides.json` entry (ensure it is on one line for copy and pastability):
```json
{"name": "[DESTINATION]", "url": "guides/[slug].html", "country": "[Country]", "continent": "[match an existing continent exactly]", "flag": "[lowercase ISO country code]", "vibe": "[pick one: food, nature, history, nightlife, alpine, wellness, adventure, art, design, shopping, spirituality, luxury, romance, family, tech, coastal, rural]", "published": "[today, YYYY-MM-DD]", "dayTripFrom": "[BASE CITY - must exactly match that city's own \"name\" field in guides.json]", "duration": "[Half day / Full day]", "blurb": "[same hook used in the subhead]", "image": "images/guides/[slug]-hero-800.jpg", "imageAlt": "[same alt text used in the hero]"}
```

**Rules**: keep `noindex, nofollow` as-is. Note in your response that once this page exists, the base city's own guide page needs its matching Day Trip card `href` updated from `#` to this page's real URL - that's a manual step outside this file. Do not use em dashes, replace them with other correct alternatives.

Destination: **[DESTINATION]**, day trip from **[BASE CITY]**

---
