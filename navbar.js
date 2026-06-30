// ===== VIBE ICONS =====
// One small icon per "vibe" category, used inside the double-ring stamp
// graphic on the homepage cards. To add a guide's vibe: set a "vibe" field
// in guides.json to one of the keys below (e.g. "vibe": "food"). To add a
// brand-new category later: add one more entry here with a new icon.
window.GLOBEHINT_VIBE_ICONS = {
  food: '<path d="M21 18v8a2.5 2.5 0 002.5 2.5v0M21 18v6M24 18v6M27 18v6M27 18v25M38 18c-3.2 0-4.5 2.6-4.5 7S34.8 32 38 32M38 18v25"/>',
  nature: '<path d="M16 38l8-12 5 6 6-9 9 15z"/><circle cx="36" cy="20" r="2.6"/>',
  history: '<path d="M18 19h24M18 41h24M23 23v14M30 23v14M37 23v14M20 19l2-4h16l2 4"/>',
  nightlife: '<path d="M18 19h24l-12 13z"/><path d="M30 32v9M24 41h12"/>'
};

// Set up the shared guides-loading promise immediately (not inside
// DOMContentLoaded) so other inline scripts on the page — which may run
// before DOMContentLoaded fires — can always find it and await it safely.
let __resolveGlobehintGuides;
window.GLOBEHINT_GUIDES = null;
window.GLOBEHINT_GUIDES_READY = new Promise(res => { __resolveGlobehintGuides = res; });

document.addEventListener("DOMContentLoaded", () => {
  const placeholder = document.getElementById("global-navbar");
  if (!placeholder) {
    // No navbar mount point on this page — still resolve so any other
    // script awaiting GLOBEHINT_GUIDES_READY doesn't hang forever.
    __resolveGlobehintGuides([]);
    return;
  }

  // ===== FLAG ICONS SAFETY NET =====
  // The Destinations mega-panel (and mobile drawer) below render country
  // flags as <span class="fi fi-xx"> — but the actual flag artwork comes
  // entirely from the external flag-icons stylesheet, not from anything
  // in site.css or navbar.js's own injected <style>. That link previously
  // had to be hand-added to every page's <head>, and a couple of pages
  // (pitstops.html, spotlights.html) shipped without it — same nav markup,
  // but every flag silently rendered as an empty box.
  //
  // Since every page that has a navbar can show flags via the mega-panel,
  // the dependency belongs here instead of being a per-page manual step.
  // Checking for an existing link first avoids loading it twice on pages
  // that still also link it directly in <head>.
  const FLAG_ICONS_HREF = "https://cdn.jsdelivr.net/gh/lipis/flag-icons@7.3.2/css/flag-icons.min.css";
  if (!document.querySelector('link[href="' + FLAG_ICONS_HREF + '"]')) {
    const flagIconsLink = document.createElement("link");
    flagIconsLink.rel = "stylesheet";
    flagIconsLink.href = FLAG_ICONS_HREF;
    document.head.appendChild(flagIconsLink);
  }

  // Determine path prefix based on whether the file is in a subfolder
  // If the current path contains a subfolder (like /guides/), prefix links with '../'
  const isSubfolder = window.location.pathname.includes('/guides/') || document.body.dataset.depth === "1";
  const prefix = isSubfolder ? "../" : "";

  // ===== GLOBEHINT GUIDE INDEX =====
  // The guide list now lives in one place: guides.json at the site root.
  // To publish a new guide: drop the .html file into /guides/, then add one
  // line to guides.json. Every page (nav, homepage, destinations) reads from
  // that same file automatically — nothing else needs to be touched.

  // ----- Build the Destinations mega-panel markup -----
  // Replaces the old per-country flyout list with a full-width,
  // multi-column grid (one column per continent), in the style worked out
  // in megamenu-mockups.html "Option 5b". Two rules keep this a fixed size
  // forever, however many guides get added:
  //   MEGA_MAX_COUNTRIES — at most this many countries shown per continent
  //     column; the rest collapse into one "+N more [continent] countries"
  //     link to destinations.html.
  //   MEGA_MAX_CITIES — at most this many cities shown per country; the
  //     rest collapse into one "+N more in [country]" link.
  // Countries are ordered by their most-recently-published guide (not
  // A–Z), and cities within a country the same way — so the panel doubles
  // as a lightweight "what's new" surface. A small dot marks a country
  // whose newest guide was published within the last 21 days.
  const MEGA_MAX_COUNTRIES = 4;
  const MEGA_MAX_CITIES = 4;
  const MEGA_CONTINENT_ORDER = ["Europe", "Asia", "Africa", "North America", "South America", "Oceania", "Antarctica"];
  const MEGA_FRESH_WINDOW_DAYS = 21;

  function escapeHtmlMega(str) {
    return String(str).replace(/[&<>"']/g, c => (
      { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
    ));
  }

  function buildMegaPanel(guides) {
    if (!guides.length) {
      return '<div class="gh-mega-empty">No guides published yet</div>';
    }

    // Group by continent, then by country within each continent.
    const byContinent = {};
    guides.forEach(g => {
      const c = g.continent || "Elsewhere";
      if (!byContinent[c]) byContinent[c] = [];
      byContinent[c].push(g);
    });

    const continentNames = Object.keys(byContinent).sort((a, b) => {
      const ai = MEGA_CONTINENT_ORDER.indexOf(a);
      const bi = MEGA_CONTINENT_ORDER.indexOf(b);
      if (ai === -1 && bi === -1) return a.localeCompare(b);
      if (ai === -1) return 1;
      if (bi === -1) return -1;
      return ai - bi;
    });

    const today = new Date();

    const columns = continentNames.map(continent => {
      const continentGuides = byContinent[continent];
      const byCountry = {};
      continentGuides.forEach(g => {
        if (!byCountry[g.country]) byCountry[g.country] = { flag: g.flag, cities: [] };
        byCountry[g.country].cities.push(g);
      });

      const countryNames = Object.keys(byCountry);
      countryNames.forEach(c => {
        byCountry[c].cities.sort((a, b) => new Date(b.published) - new Date(a.published));
      });
      // Order countries by their most recently published city, newest first.
      countryNames.sort((a, b) => new Date(byCountry[b].cities[0].published) - new Date(byCountry[a].cities[0].published));

      const shownCountries = countryNames.slice(0, MEGA_MAX_COUNTRIES);
      const hiddenCountryCount = countryNames.length - shownCountries.length;

      const countryBlocks = shownCountries.map(country => {
        const entry = byCountry[country];
        const shownCities = entry.cities.slice(0, MEGA_MAX_CITIES);
        const hiddenCityCount = entry.cities.length - shownCities.length;
        const isFresh = (today - new Date(shownCities[0].published)) / 86400000 <= MEGA_FRESH_WINDOW_DAYS;

        const cityLinks = shownCities.map(city =>
          `<a href="${prefix}${escapeHtmlMega(city.url)}" class="gh-mega-city-link">${escapeHtmlMega(city.name)}</a>`
        ).join('');
        const moreCities = hiddenCityCount > 0
          ? `<a href="${prefix}destinations.html" class="gh-mega-more-link">+${hiddenCityCount} more in ${escapeHtmlMega(country)} →</a>`
          : '';

        const countrySlug = country.toLowerCase().replace(/\s+/g, '');

        return `
          <div class="gh-mega-country">
            <a href="${prefix}${countrySlug}.html" class="gh-mega-country-name">
              <span class="fi fi-${entry.flag}" aria-hidden="true"></span>
              ${escapeHtmlMega(country)}
            </a>
            <div class="gh-mega-cities">${cityLinks}${moreCities}</div>
          </div>`;
      }).join('');

      const moreCountries = hiddenCountryCount > 0
        ? `<div class="gh-mega-col-more"><a href="${prefix}destinations.html">+${hiddenCountryCount} more ${escapeHtmlMega(continent)} countries →</a></div>`
        : '';

      return `
        <div class="gh-mega-col">
          <div class="gh-mega-col-head">${escapeHtmlMega(continent)}</div>
          ${countryBlocks}
          ${moreCountries}
        </div>`;
    }).join('');

    return `<div class="gh-mega-grid">${columns}</div>`;
  }

  // ----- Mobile drawer equivalent: groups by country (A–Z, uncapped) and
  // renders as a flat tap-accordion (no hover panels — touch devices don't
  // have hover). Deliberately kept separate from buildMegaPanel() above:
  // mobile's tap-to-expand pattern doesn't have the same "endless growth"
  // problem the desktop panel solves for, so there's no need to cap or
  // reorder it the same way. -----
  function buildMobileCountryList(guides) {
    const byCountry = {};
    guides.forEach(g => {
      if (!byCountry[g.country]) byCountry[g.country] = { flag: g.flag, cities: [] };
      byCountry[g.country].cities.push(g);
    });

    const countryNames = Object.keys(byCountry).sort((a, b) => a.localeCompare(b));
    countryNames.forEach(c => byCountry[c].cities.sort((a, b) => a.name.localeCompare(b.name)));

    if (countryNames.length === 0) {
      return '<span class="gh-dd-empty">No guides published yet</span>';
    }
    return countryNames.map(country => {
      const entry = byCountry[country];
      const countrySlug = country.toLowerCase().replace(/\s+/g, '');
      const cityLinks = entry.cities.map(city =>
        `<a href="${prefix}${escapeHtmlMega(city.url)}">${escapeHtmlMega(city.name)}</a>`
      ).join('');
      return `
        <div class="gh-mobile-country-group">
          <div class="gh-mobile-country-head" aria-expanded="false">
            <a href="${prefix}${countrySlug}.html">
              <span class="gh-flag fi fi-${entry.flag}" aria-hidden="true"></span>
              <span>${escapeHtmlMega(country)}</span>
            </a>
            <span class="gh-chevron-down" aria-hidden="true">▾</span>
          </div>
          <div class="gh-mobile-city-list">
            ${cityLinks}
          </div>
        </div>`;
    }).join('');
  }

  placeholder.innerHTML = `
    <style>
      .gh-dd-wrap {
        position: relative;
      }

      .gh-dd-trigger {
        display: inline-flex;
        align-items: center;
        gap: 5px;
      }

      .gh-dd-main-link {
        padding: 4px 0;
      }

      .gh-chevron-toggle {
        background: none;
        border: none;
        font: inherit;
        color: inherit;
        cursor: pointer;
        padding: 4px 2px;
        line-height: 1;
      }

      .gh-chevron-toggle .gh-chevron-down {
        display: inline-block;
        font-size: 0.65em;
        transition: transform 0.2s ease;
        opacity: 0.7;
      }

      .gh-dd-wrap.is-open .gh-chevron-toggle .gh-chevron-down,
      .gh-dd-wrap:hover .gh-chevron-toggle .gh-chevron-down {
        transform: translateY(1px);
      }

      .gh-country-panel {
        position: absolute;
        top: 100%;
        left: 50%;
        transform: translateX(-50%);
        min-width: 220px;
        background: #FAF6EE;
        border: 1px solid var(--tan, #D8C5A8);
        border-radius: 6px;
        box-shadow: 0 16px 32px -12px rgba(42, 24, 21, 0.22);
        padding: 8px;
        margin-top: 14px;
        list-style: none;
        opacity: 0;
        visibility: hidden;
        pointer-events: none;
        transform: translateX(-50%) translateY(-6px);
        transition: opacity 0.16s ease, transform 0.16s ease;
        z-index: 70;
      }

      /* Invisible bridge that fills the visual gap above the panel so
         :hover stays active while the cursor moves from the trigger
         down into the panel. */
      .gh-country-panel::before {
        content: "";
        position: absolute;
        top: -14px;
        left: 0;
        right: 0;
        height: 14px;
      }

      .gh-dd-wrap.is-open .gh-country-panel,
      .gh-dd-wrap:hover .gh-country-panel,
      .gh-dd-wrap:focus-within .gh-country-panel {
        opacity: 1;
        visibility: visible;
        pointer-events: auto;
        transform: translateX(-50%) translateY(0);
      }

      /* ===== DESTINATIONS MEGA PANEL =====
         Full-width, no second hover level — every continent is a column,
         every country lists its (capped) cities directly underneath.
         Distinct from .gh-country-panel above (which Spotlights/About Us
         still use for their small, simple dropdowns) since this one needs
         to span the header instead of being a narrow box under the link.

         Centering note: this panel sits inside .gh-dd-wrap (the
         Destinations link), not directly inside the header. A plain
         "position: absolute; left: 50%" centers on that link's own
         position, not the page — so on a wide screen, where the link
         sits well right of center, the panel drifts off-screen. Using
         "position: fixed" instead makes left/right relative to the
         viewport itself; "left: 0; right: 0; margin: 0 auto" then centers
         the panel the same way .nav-inner centers the header content. */
      .gh-destinations-panel {
        position: fixed;
        top: var(--gh-nav-height, 76px);
        left: 0;
        right: 0;
        width: auto;
        max-width: 1180px;
        margin: 0 auto;
        transform: translateY(-6px);
        background: #FAF6EE;
        border: 1px solid var(--tan, #D8C5A8);
        box-shadow: 0 26px 50px -18px rgba(42, 24, 21, 0.25);
        opacity: 0;
        visibility: hidden;
        pointer-events: none;
        transition: opacity 0.16s ease, transform 0.16s ease;
        z-index: 70;
      }

      .gh-destinations-panel::before {
        content: "";
        position: absolute;
        top: -28px;
        left: 0;
        right: 0;
        height: 28px;
      }

      .gh-dd-wrap.is-open .gh-destinations-panel,
      .gh-dd-wrap:hover .gh-destinations-panel,
      .gh-dd-wrap:focus-within .gh-destinations-panel {
        opacity: 1;
        visibility: visible;
        pointer-events: auto;
        transform: translateY(0);
      }

      .gh-mega-grid {
        padding: 30px 32px 34px;
        display: grid;
        grid-template-columns: repeat(6, 1fr);
        gap: 26px;
      }

      .gh-mega-col-head {
        font-family: 'Fraunces', serif;
        font-weight: 600;
        font-size: 0.98rem;
        color: var(--burgundy, #7A2E2A);
        border-bottom: 1.5px solid var(--tan, #D8C5A8);
        padding-bottom: 9px;
        margin-bottom: 12px;
      }

      .gh-mega-country {
        margin-bottom: 14px;
      }

      .gh-mega-country-name {
        font-family: 'JetBrains Mono', monospace;
        font-size: 0.65rem;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--fade, #A48F6E);
        margin-bottom: 4px;
        display: flex;
        align-items: center;
        gap: 5px;
      }

      .gh-mega-country-name:hover,
      .gh-mega-country-name:focus-visible {
        color: var(--ochre, #C98A2C);
      }

      .gh-mega-country-name .fi {
        font-size: 0.86rem;
        flex-shrink: 0;
      }

      .gh-mega-new-dot {
        width: 5px;
        height: 5px;
        border-radius: 50%;
        background: var(--ochre, #C98A2C);
        flex-shrink: 0;
      }

      .gh-mega-cities a {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 3px 0;
        font-size: 0.84rem;
        color: var(--ink, #2A1815);
      }

      .gh-mega-cities a:hover,
      .gh-mega-cities a:focus-visible { color: var(--ochre, #C98A2C); }
      .gh-mega-cities .fi { font-size: 0.74rem; flex-shrink: 0; }

      .gh-mega-more-link {
        display: block;
        padding: 3px 0;
        font-family: 'JetBrains Mono', monospace;
        font-size: 0.72rem;
        color: var(--fade, #A48F6E);
      }

      .gh-mega-more-link:hover,
      .gh-mega-more-link:focus-visible { color: var(--ochre, #C98A2C); }

      .gh-mega-col-more {
        font-family: 'JetBrains Mono', monospace;
        font-size: 0.72rem;
        color: var(--fade, #A48F6E);
        border-top: 1px dashed var(--tan, #D8C5A8);
        padding-top: 9px;
        margin-top: 2px;
      }

      .gh-mega-col-more a { color: var(--forest, #3F5443); font-weight: 600; }
      .gh-mega-col-more a:hover,
      .gh-mega-col-more a:focus-visible { color: var(--ochre, #C98A2C); }

      .gh-mega-empty {
        padding: 24px 32px;
        font-size: 0.88rem;
        color: var(--fade, #A48F6E);
      }

      @media (max-width: 1100px) {
        .gh-destinations-panel { width: 94vw; }
        .gh-mega-grid { grid-template-columns: repeat(3, 1fr); }
      }

      @media (max-width: 700px) {
        .gh-mega-grid { grid-template-columns: repeat(2, 1fr); }
      }

      .gh-country-item {
        position: relative;
      }

      .gh-country-trigger {
        width: 100%;
        display: flex;
        align-items: center;
        gap: 10px;
        background: none;
        border: none;
        font: inherit;
        font-size: 0.92rem;
        font-weight: 500;
        color: var(--ink, #2A1815);
        text-align: left;
        padding: 9px 10px;
        border-radius: 4px;
        cursor: pointer;
      }

      .gh-country-item:hover > .gh-country-trigger,
      .gh-country-item.is-open > .gh-country-trigger,
      .gh-country-trigger:hover,
      .gh-country-trigger:focus-visible {
        background: var(--paper-deep, #E8DCC8);
      }

      button.gh-vibe-trigger {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        box-sizing: border-box;
        background: none;
        border: none;
        font: inherit;
        cursor: pointer;
        text-align: left;
        padding: 9px 10px;
        border-radius: 4px;
        font-size: 0.92rem;
        font-weight: 500;
        color: var(--ink, #2A1815);
      }

      .gh-country-item.is-open > button.gh-vibe-trigger,
      button.gh-vibe-trigger:hover {
        background: var(--paper-deep, #E8DCC8);
      }
      .gh-flag {
        font-size: 1.15rem;
        line-height: 1;
        flex-shrink: 0;
      }

      .gh-country-name {
        flex: 1;
      }

      .gh-chevron {
        color: var(--fade, #A48F6E);
        font-size: 1rem;
        flex-shrink: 0;
      }

      .gh-city-panel {
        position: absolute;
        top: -8px;
        left: 100%;
        margin-left: 10px;
        min-width: 180px;
        background: #FAF6EE;
        border: 1px solid var(--tan, #D8C5A8);
        border-radius: 6px;
        box-shadow: 0 16px 32px -12px rgba(42, 24, 21, 0.22);
        padding: 8px;
        display: flex;
        flex-direction: column;
        opacity: 0;
        visibility: hidden;
        pointer-events: none;
        transform: translateX(-6px);
        transition: opacity 0.16s ease, transform 0.16s ease;
        z-index: 71;
      }

      /* Invisible bridge covering the horizontal gap so :hover stays
         active while moving the cursor from the country into its cities. */
      .gh-city-panel::before {
        content: "";
        position: absolute;
        top: 0;
        bottom: 0;
        left: -10px;
        width: 10px;
      }

      .gh-country-item:hover > .gh-city-panel,
      .gh-country-item.is-open > .gh-city-panel,
      .gh-country-item:focus-within > .gh-city-panel {
        opacity: 1;
        visibility: visible;
        pointer-events: auto;
        transform: translateX(0);
      }

      .gh-city-link {
        display: block;
        padding: 9px 12px;
        border-radius: 4px;
        font-size: 0.9rem;
        font-weight: 500;
        color: var(--ink, #2A1815);
        white-space: nowrap;
      }

      .gh-city-link:hover,
      .gh-city-link:focus-visible {
        background: var(--paper-deep, #E8DCC8);
        color: var(--ochre, #C98A2C);
      }

      .gh-city-link-icon {
        display: flex;
        align-items: center;
        gap: 9px;
      }

      .gh-vibe-icon {
        width: 17px;
        height: 17px;
        flex-shrink: 0;
        opacity: 0.75;
      }
      
      .gh-dd-static-label {
        cursor: default;
      }

      .gh-simple-panel {
        min-width: 160px;
      }

      .gh-dd-empty {
        padding: 10px 12px;
        font-size: 0.88rem;
        color: var(--fade, #A48F6E);
        list-style: none;
      }

      /* On small screens, hover menus are unreliable — the JS click/keyboard
         handling below takes over, but we still want the panels to stack
         sensibly rather than spill off-screen. */
      @media (max-width: 880px) {
        .gh-country-panel,
        .gh-city-panel {
          position: static;
          transform: none !important;
          min-width: 0;
          width: 100%;
          box-shadow: none;
          margin-top: 6px;
        }
        .gh-dd-wrap.is-open .gh-country-panel { display: block; }
        .gh-dd-wrap:not(.is-open) .gh-country-panel { display: none; }
        .gh-country-item.is-open > .gh-city-panel { display: flex; }
        .gh-country-item:not(.is-open) > .gh-city-panel { display: none; }
      }

      /* ===== MOBILE HAMBURGER + DRAWER ===== */
      .gh-mobile-toggle {
        display: none;
        flex-direction: column;
        justify-content: center;
        gap: 5px;
        width: 36px;
        height: 36px;
        background: none;
        border: none;
        cursor: pointer;
        padding: 0;
        flex-shrink: 0;
      }

      .gh-burger-line {
        display: block;
        width: 100%;
        height: 2px;
        background: var(--ink, #2A1815);
        border-radius: 1px;
        transition: transform 0.2s ease, opacity 0.2s ease;
      }

      .gh-mobile-toggle[aria-expanded="true"] .gh-burger-line:nth-child(1) {
        transform: translateY(7px) rotate(45deg);
      }
      .gh-mobile-toggle[aria-expanded="true"] .gh-burger-line:nth-child(2) {
        opacity: 0;
      }
      .gh-mobile-toggle[aria-expanded="true"] .gh-burger-line:nth-child(3) {
        transform: translateY(-7px) rotate(-45deg);
      }

      .gh-mobile-drawer {
        display: none;
        max-height: 0;
        overflow: hidden;
        background: var(--paper, #F3EADD);
        border-top: 1px solid var(--tan, #D8C5A8);
        transition: max-height 0.25s ease;
      }

      .gh-mobile-drawer.is-open {
        max-height: 70vh;
        overflow-y: auto;
      }

      .gh-mobile-links {
        display: flex;
        flex-direction: column;
        padding: 8px 32px 20px;
      }

      .gh-mobile-links > a {
        padding: 14px 0;
        font-size: 1rem;
        font-weight: 500;
        border-bottom: 1px solid var(--tan, #D8C5A8);
      }

      .gh-mobile-links > a:hover,
      .gh-mobile-links > a:focus-visible {
        color: var(--ochre, #C98A2C);
      }

      .gh-mobile-group {
        border-bottom: 1px solid var(--tan, #D8C5A8);
      }

      .gh-mobile-group-head {
        display: flex;
        align-items: center;
        cursor: pointer;
      }

      .gh-mobile-group-head > a,
      .gh-mobile-group-head > span {
        padding: 14px 0;
        font-size: 1rem;
        font-weight: 500;
        flex: 0 0 auto;
      }

      .gh-mobile-group-head > a:hover,
      .gh-mobile-group-head > a:focus-visible {
        color: var(--ochre, #C98A2C);
      }

      .gh-mobile-expand {
        display: flex;
        align-items: center;
        justify-content: center;
        margin-left: auto;
        background: none;
        border: none;
        padding: 14px 4px;
        cursor: pointer;
        color: inherit;
      }

      .gh-mobile-expand[aria-expanded="true"] .gh-chevron-down {
        transform: rotate(180deg);
      }

      .gh-chevron-down {
        display: inline-block;
        transition: transform 0.2s ease;
      }

      .gh-mobile-sublist {
        display: none;
        flex-direction: column;
        padding: 0 0 12px 14px;
      }

      .gh-mobile-group.is-open .gh-mobile-sublist {
        display: flex;
      }

      .gh-mobile-sublist a,
      .gh-mobile-sublist .gh-dd-empty {
        padding: 10px 0;
        font-size: 0.92rem;
        color: var(--ink-soft, #4A352F);
      }

      .gh-mobile-sublist a:hover,
      .gh-mobile-sublist a:focus-visible {
        color: var(--ochre, #C98A2C);
      }

      .gh-mobile-country-group {
        display: flex;
        flex-direction: column;
      }

      .gh-mobile-country-head {
        display: flex;
        align-items: center;
        width: 100%;
        padding: 10px 0;
        background: none;
        border: none;
        text-align: left;
        cursor: pointer;
      }

      .gh-mobile-country-head a,
      .gh-mobile-country-head > span:first-child {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 0.92rem;
        font-weight: 500;
        color: var(--ink, #2A1815);
        flex: 0 0 auto;
      }

      .gh-mobile-country-head a:hover,
      .gh-mobile-country-head a:focus-visible {
        color: var(--ochre, #C98A2C);
      }

      .gh-mobile-country-head .gh-chevron-down {
        margin-left: auto;
        padding: 10px 6px;
        margin: -10px -6px -10px auto;
      }

      .gh-mobile-city-list {
        display: none;
        flex-direction: column;
        padding-left: 22px;
      }

      .gh-mobile-country-group.is-open .gh-mobile-city-list {
        display: flex;
      }

      .gh-mobile-city-list a {
        display: flex;
        align-items: center;
        gap: 9px;
        padding: 8px 0;
        font-size: 0.88rem;
      }

      .gh-mobile-vibe-icon {
        width: 16px;
        height: 16px;
        flex-shrink: 0;
        opacity: 0.75;
      }

      @media (max-width: 880px) {
        .nav-cta { display: none; }
        .gh-mobile-toggle { display: flex; }
        .gh-mobile-drawer { display: block; }
      }

      @media (prefers-reduced-motion: reduce) {
        .gh-country-panel, .gh-city-panel { transition: none !important; }
      }
    </style>

    <header class="site-nav">
      <div class="nav-inner">
        <a href="${prefix}index.html" class="logo">
          <img src="${prefix}images/logo/globehint-logo.png" alt="Globehint logo" class="logo-mark">
          Globehint
        </a>
        <nav class="nav-links">
          <a href="${prefix}index.html">Home</a>
          <div class="gh-dd-wrap" id="gh-destinations-dd">
            <div class="gh-dd-trigger">
              <a href="${prefix}destinations.html" class="gh-dd-main-link">Destinations</a>
              <button type="button" class="gh-chevron-toggle" aria-haspopup="true" aria-expanded="false" aria-label="Show destination countries">
                <span class="gh-chevron-down" aria-hidden="true">▾</span>
              </button>
            </div>
            <div class="gh-destinations-panel" role="menu" id="gh-country-panel">
              <div class="gh-mega-empty">Loading…</div>
            </div>
          </div>
          <div class="gh-dd-wrap" id="gh-bestof-dd">
            <div class="gh-dd-trigger">
              <a href="${prefix}spotlights.html" class="gh-dd-main-link">Spotlights</a>
              <button type="button" class="gh-chevron-toggle" aria-haspopup="true" aria-expanded="false" aria-label="Show Spotlights menu">
                <span class="gh-chevron-down" aria-hidden="true">▾</span>
              </button>
            </div>
            <ul class="gh-country-panel gh-simple-panel" role="menu">
              <li class="gh-country-item">
                <button type="button" class="gh-country-trigger gh-vibe-trigger" aria-haspopup="true" aria-expanded="false">
                  <span>By Vibe</span>
                  <span class="gh-chevron" aria-hidden="true">›</span>
                </button>
                <div class="gh-city-panel">
                  <a href="${prefix}food.html" class="gh-city-link gh-city-link-icon"><svg class="gh-vibe-icon" viewBox="0 0 56 56" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${window.GLOBEHINT_VIBE_ICONS.food}</svg>Food</a>
                  <a href="${prefix}nature.html" class="gh-city-link gh-city-link-icon"><svg class="gh-vibe-icon" viewBox="0 0 56 56" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${window.GLOBEHINT_VIBE_ICONS.nature}</svg>Nature</a>
                  <a href="${prefix}history.html" class="gh-city-link gh-city-link-icon"><svg class="gh-vibe-icon" viewBox="0 0 56 56" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${window.GLOBEHINT_VIBE_ICONS.history}</svg>History</a>
                  <a href="${prefix}nightlife.html" class="gh-city-link gh-city-link-icon"><svg class="gh-vibe-icon" viewBox="0 0 56 56" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${window.GLOBEHINT_VIBE_ICONS.nightlife}</svg>Nightlife</a>
                </div>
              </li>
              <li class="gh-country-item"><a href="${prefix}daytrips.html" class="gh-country-trigger">Day Trips</a></li>
              <li class="gh-country-item"><a href="${prefix}curatedlists.html" class="gh-country-trigger">Curated Lists</a></li>
            </ul>
          </div>
          <a href="${prefix}pitstops.html">Pit Stops</a>
          <div class="gh-dd-wrap" id="gh-about-dd">
            <div class="gh-dd-trigger">
              <a href="${prefix}about.html" class="gh-dd-main-link">About Us</a>
              <button type="button" class="gh-chevron-toggle" aria-haspopup="true" aria-expanded="false" aria-label="Show About Us menu">
                <span class="gh-chevron-down" aria-hidden="true">▾</span>
              </button>
            </div>
            <ul class="gh-country-panel gh-simple-panel" role="menu">
              <li class="gh-country-item"><a href="${prefix}about.html" class="gh-country-trigger">About Globehint</a></li>
              <li class="gh-country-item"><a href="${prefix}howiresearch.html" class="gh-country-trigger">How I Research My Guides</a></li>
            </ul>
          </div>
          <a href="${prefix}index.html#bug-report">Support</a>
        </nav>
        <div class="nav-cta">
          <a href="https://www.tiktok.com" target="_blank" rel="noopener" aria-label="Globehint on TikTok">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M16.6 5.82s.51.5 0 0A4.278 4.278 0 0 1 15.54 3h-3.09v12.4a2.592 2.592 0 0 1-2.59 2.5c-1.42 0-2.6-1.16-2.6-2.6 0-1.72 1.66-3.01 3.37-2.48V9.66c-3.45-.46-6.47 2.22-6.47 5.64 0 3.33 2.76 5.7 5.69 5.7 3.14 0 5.69-2.55 5.69-5.7V9.01a7.35 7.35 0 0 0 4.3 1.38V7.3s-1.88.09-3.24-1.48z"/></svg>
          </a>
          <span class="nav-cta-divider"></span>
          <a href="https://www.instagram.com" target="_blank" rel="noopener" aria-label="Globehint on Instagram">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="3.6"/><circle cx="17.2" cy="6.8" r="0.9" fill="currentColor" stroke="none"/></svg>
          </a>
        </div>
        <button type="button" class="gh-mobile-toggle" id="gh-mobile-toggle" aria-expanded="false" aria-controls="gh-mobile-drawer" aria-label="Open menu">
          <span class="gh-burger-line"></span>
          <span class="gh-burger-line"></span>
          <span class="gh-burger-line"></span>
        </button>
      </div>

      <div class="gh-mobile-drawer" id="gh-mobile-drawer">
        <nav class="gh-mobile-links">
          <a href="${prefix}index.html">Home</a>

          <div class="gh-mobile-group">
            <div class="gh-mobile-group-head">
              <a href="${prefix}destinations.html">Destinations</a>
              <button type="button" class="gh-mobile-expand" aria-expanded="false" aria-label="Show destination countries">
                <span class="gh-chevron-down" aria-hidden="true">▾</span>
              </button>
            </div>
            <div class="gh-mobile-sublist" id="gh-mobile-destinations-list">
              <span class="gh-dd-empty">Loading…</span>
            </div>
          </div>

          <div class="gh-mobile-group">
            <div class="gh-mobile-group-head">
              <a href="${prefix}spotlights.html">Spotlights</a>
              <button type="button" class="gh-mobile-expand" aria-expanded="false" aria-label="Show Spotlights menu">
                <span class="gh-chevron-down" aria-hidden="true">▾</span>
              </button>
            </div>
            <div class="gh-mobile-sublist">
              <div class="gh-mobile-country-group">
                <button type="button" class="gh-mobile-country-head" aria-expanded="false">
                  <span>By Vibe</span>
                  <span class="gh-chevron-down" aria-hidden="true">▾</span>
                </button>
                <div class="gh-mobile-city-list">
                  <a href="${prefix}food.html"><svg class="gh-mobile-vibe-icon" viewBox="0 0 56 56" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${window.GLOBEHINT_VIBE_ICONS.food}</svg>Food</a>
                  <a href="${prefix}nature.html"><svg class="gh-mobile-vibe-icon" viewBox="0 0 56 56" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${window.GLOBEHINT_VIBE_ICONS.nature}</svg>Nature</a>
                  <a href="${prefix}history.html"><svg class="gh-mobile-vibe-icon" viewBox="0 0 56 56" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${window.GLOBEHINT_VIBE_ICONS.history}</svg>History</a>
                  <a href="${prefix}nightlife.html"><svg class="gh-mobile-vibe-icon" viewBox="0 0 56 56" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${window.GLOBEHINT_VIBE_ICONS.nightlife}</svg>Nightlife</a>
                </div>
              </div>
              <a href="${prefix}daytrips.html">Day Trips</a>
              <a href="${prefix}curatedlists.html">Curated Lists</a>
            </div>
          </div>

          <a href="${prefix}pitstops.html">Pit Stops</a>

          <div class="gh-mobile-group">
            <div class="gh-mobile-group-head">
              <a href="${prefix}about.html">About Us</a>
              <button type="button" class="gh-mobile-expand" aria-expanded="false" aria-label="Show About Us menu">
                <span class="gh-chevron-down" aria-hidden="true">▾</span>
              </button>
            </div>
            <div class="gh-mobile-sublist">
              <a href="${prefix}about.html">About Globehint</a>
              <a href="${prefix}howiresearch.html">How I Research My Guides</a>
            </div>
          </div>

          <a href="${prefix}index.html#bug-report">Support</a>
        </nav>
      </div>
    </header>
  `;

  // ----- Keep the mega panel's top offset matched to the header's real
  // rendered height (the CSS fallback of 76px is just a sane default for
  // the first paint before this runs, and for older browsers without
  // ResizeObserver). Needed because .gh-destinations-panel is now
  // `position: fixed` — fixed positioning has no idea how tall the
  // sticky header above it actually is, unlike `position: absolute`,
  // which could just use `top: 100%`. -----
  const siteNavEl = document.querySelector('header.site-nav');
  if (siteNavEl) {
    const syncNavHeight = () => {
      document.documentElement.style.setProperty('--gh-nav-height', siteNavEl.offsetHeight + 'px');
    };
    syncNavHeight();
    if (window.ResizeObserver) {
      new ResizeObserver(syncNavHeight).observe(siteNavEl);
    } else {
      window.addEventListener('resize', syncNavHeight);
    }
  }

  // ----- Interaction: click/tap toggles open state (works alongside :hover for desktop) -----
  const ddWrap = document.getElementById('gh-destinations-dd');
  if (!ddWrap) return;

  const ddTrigger = ddWrap.querySelector('.gh-chevron-toggle');
  const ddMainLink = ddWrap.querySelector('.gh-dd-main-link');
  const countryPanel = document.getElementById('gh-country-panel');
  const bestOfWrap = document.getElementById('gh-bestof-dd');
  const bestOfTrigger = bestOfWrap ? bestOfWrap.querySelector('.gh-chevron-toggle') : null;
  const bestOfMainLink = bestOfWrap ? bestOfWrap.querySelector('.gh-dd-main-link') : null;
  const aboutWrap = document.getElementById('gh-about-dd');
  const aboutTrigger = aboutWrap ? aboutWrap.querySelector('.gh-chevron-toggle') : null;
  const aboutMainLink = aboutWrap ? aboutWrap.querySelector('.gh-dd-main-link') : null;

  // Closes a simple secondary dropdown (Spotlights or About Us) and any
  // nested .gh-country-item flyout inside it (e.g. "By Vibe").
  function closeSecondary(wrap, trigger) {
  if (!wrap) return;
  wrap.classList.remove('is-open');
  trigger.setAttribute('aria-expanded', 'false');
  trigger.blur();
  wrap.querySelectorAll('.gh-country-item.is-open').forEach(item => {
    item.classList.remove('is-open');
    const itemTrigger = item.querySelector('.gh-country-trigger');
    itemTrigger.setAttribute('aria-expanded', 'false');
    itemTrigger.blur();
  });
}

  function closeBestOf() { closeSecondary(bestOfWrap, bestOfTrigger); }
  function closeAbout() { closeSecondary(aboutWrap, aboutTrigger); }

  // Closes a click-opened dropdown the moment the mouse actually leaves its
  // hover area. mouseleave only fires once the pointer leaves the element
  // AND its descendants, so moving from the trigger into the panel itself
  // (via the invisible hover-bridge) won't trigger this early.
  function addHoverClose(wrap, closeFn, resetTouch) {
    if (!wrap) return;
    wrap.addEventListener('mouseleave', () => {
      if (window.matchMedia('(hover: hover)').matches) {
        closeFn();
        if (resetTouch) resetTouch();
      }
    });
  }

  // Wires a secondary dropdown's chevron to open/close independently of
  // the others, and wires up any nested .gh-country-item flyouts inside it
  // (e.g. "By Vibe" inside Spotlights) the same way Destinations' countries work.
  function wireSecondaryDropdown(wrap, trigger) {
    if (!wrap || !trigger) return;
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!window.matchMedia('(hover: none)').matches) return;
      const isOpen = wrap.classList.contains('is-open');
      closeAll();
      if (!isOpen) {
        wrap.classList.add('is-open');
        trigger.setAttribute('aria-expanded', 'true');
      }
    });
   wrap.querySelectorAll('.gh-country-item').forEach(item => {
      const itemTrigger = item.querySelector('.gh-country-trigger');
      const hasFlyout = item.querySelector('.gh-city-panel');
      if (!hasFlyout) return; // plain link (Day Trips, Curated Lists, About Globehint, etc.) — let it navigate normally
      itemTrigger.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const isOpen = item.classList.contains('is-open');
        wrap.querySelectorAll('.gh-country-item.is-open').forEach(i => {
          i.classList.remove('is-open');
          const iTrigger = i.querySelector('.gh-country-trigger');
          iTrigger.setAttribute('aria-expanded', 'false');
          iTrigger.blur();
        });
        if (!isOpen) {
          item.classList.add('is-open');
          itemTrigger.setAttribute('aria-expanded', 'true');
        }
      });
     item.addEventListener('mouseleave', () => {
        if (window.matchMedia('(hover: hover)').matches && item.classList.contains('is-open')) {
          item.classList.remove('is-open');
          itemTrigger.setAttribute('aria-expanded', 'false');
          itemTrigger.blur();
        }
      });
    });
  }

  wireSecondaryDropdown(bestOfWrap, bestOfTrigger);
  wireSecondaryDropdown(aboutWrap, aboutTrigger);

  function closeAll() {
      ddWrap.classList.remove('is-open');
      ddTrigger.setAttribute('aria-expanded', 'false');
      ddTrigger.blur();
      ddWrap.querySelectorAll('.gh-country-item.is-open').forEach(item => {
        item.classList.remove('is-open');
        const trigger = item.querySelector('.gh-country-trigger');
        trigger.setAttribute('aria-expanded', 'false');
        trigger.blur();
      });
      closeBestOf();
      closeAbout();
    }

  // (The old wireUpCountryItems() function lived here — it wired up
  // per-country flyout toggles for the previous Destinations dropdown.
  // The mega panel below is flat links straight to each city page, so
  // there's no flyout to wire up anymore. Spotlights' "By Vibe" flyout
  // still works the same as before via wireSecondaryDropdown() above.)

  // The chevron toggles the country panel without navigating.
  // The "Destinations" text itself stays a normal link to destinations.html.
  ddTrigger.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.matchMedia('(hover: none)').matches) return;
    const isOpen = ddWrap.classList.contains('is-open');
    closeAll();
    if (!isOpen) {
      ddWrap.classList.add('is-open');
      ddTrigger.setAttribute('aria-expanded', 'true');
    }
  });

  // On touch devices, the main "Destinations" link also needs a way to reveal
  // the panel without immediately navigating away, so tapping it the first
  // time opens the panel; tapping again (or tapping a flag/city) navigates.
  let touchOpened = false;
  ddMainLink.addEventListener('click', (e) => {
    if (window.matchMedia('(hover: none)').matches && !touchOpened) {
      e.preventDefault();
      ddWrap.classList.add('is-open');
      ddTrigger.setAttribute('aria-expanded', 'true');
      touchOpened = true;
    }
  });

  // Same touch-tap behavior for the "Spotlights" and "About Us" links: first
  // tap opens the panel, second tap (or tapping an item inside it) navigates.
  let bestOfTouchOpened = false;
  if (bestOfMainLink && bestOfWrap && bestOfTrigger) {
    bestOfMainLink.addEventListener('click', (e) => {
      if (window.matchMedia('(hover: none)').matches && !bestOfTouchOpened) {
        e.preventDefault();
        bestOfWrap.classList.add('is-open');
        bestOfTrigger.setAttribute('aria-expanded', 'true');
        bestOfTouchOpened = true;
      }
    });
  }

  let aboutTouchOpened = false;
  if (aboutMainLink && aboutWrap && aboutTrigger) {
    aboutMainLink.addEventListener('click', (e) => {
      if (window.matchMedia('(hover: none)').matches && !aboutTouchOpened) {
        e.preventDefault();
        aboutWrap.classList.add('is-open');
        aboutTrigger.setAttribute('aria-expanded', 'true');
        aboutTouchOpened = true;
      }
    });
  }

  // ----- Destinations-specific hover close -----
  // .gh-destinations-panel is `position: fixed` and centered on the page,
  // so it's no longer a visual neighbor of the trigger the way the small
  // dropdowns (Spotlights/About, still `position: absolute` right under
  // their link) are — addHoverClose()'s plain mouseleave-on-wrap closes
  // the instant the cursor leaves the trigger, before it ever reaches the
  // panel, which is the dead-zone bug. Fix: on mouseleave, wait briefly
  // before closing, and cancel that close if the cursor lands on the
  // panel (or back on the trigger) within the grace window.
  let destinationsCloseTimer = null;
  function scheduleDestinationsClose() {
    if (!window.matchMedia('(hover: hover)').matches) return;
    clearTimeout(destinationsCloseTimer);
    destinationsCloseTimer = setTimeout(() => {
      closeAll();
      touchOpened = false;
    }, 250);
  }
  function cancelDestinationsClose() {
    clearTimeout(destinationsCloseTimer);
  }
  ddWrap.addEventListener('mouseleave', scheduleDestinationsClose);
  countryPanel.addEventListener('mouseenter', cancelDestinationsClose);
  countryPanel.addEventListener('mouseleave', scheduleDestinationsClose);

  addHoverClose(bestOfWrap, closeBestOf, () => { bestOfTouchOpened = false; });
  addHoverClose(aboutWrap, closeAbout, () => { aboutTouchOpened = false; });

  document.addEventListener('click', (e) => {
    const insideDestinations = ddWrap.contains(e.target);
    const insideBestOf = bestOfWrap && bestOfWrap.contains(e.target);
    const insideAbout = aboutWrap && aboutWrap.contains(e.target);
    if (!insideDestinations && !insideBestOf && !insideAbout) {
      closeAll();
      touchOpened = false;
      bestOfTouchOpened = false;
      aboutTouchOpened = false;
    } else {
      if (!insideBestOf) closeBestOf();
      if (!insideAbout) closeAbout();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeAll();
      touchOpened = false;
      bestOfTouchOpened = false;
      aboutTouchOpened = false;
    }
  });

  // ----- Mobile hamburger drawer: separate from the desktop dropdowns
  // above (which are hidden below 880px). Opens/closes the slide-down
  // panel, and lets its two accordion groups (Destinations, Spotlights)
  // expand independently — only one open at a time, to avoid a very tall
  // drawer on small screens. -----
  const mobileToggle = document.getElementById('gh-mobile-toggle');
  const mobileDrawer = document.getElementById('gh-mobile-drawer');
  const mobileDestinationsList = document.getElementById('gh-mobile-destinations-list');

  if (mobileToggle && mobileDrawer) {
    mobileToggle.addEventListener('click', () => {
      const isOpen = mobileDrawer.classList.contains('is-open');
      mobileDrawer.classList.toggle('is-open', !isOpen);
      mobileToggle.setAttribute('aria-expanded', String(!isOpen));
      mobileToggle.setAttribute('aria-label', isOpen ? 'Open menu' : 'Close menu');
    });

    // Accordion groups inside the drawer (Destinations, Spotlights, and any
    // future ones marked up the same way). The whole head row toggles the
    // dropdown — except a click that actually lands on the link text, which
    // navigates instead and is left alone (no preventDefault, no toggle).
    mobileDrawer.querySelectorAll('.gh-mobile-group-head').forEach(head => {
      const group = head.closest('.gh-mobile-group');
      const btn = head.querySelector('.gh-mobile-expand');
      const link = head.querySelector('a');

      function toggleGroup() {
        const isOpen = group.classList.contains('is-open');
        mobileDrawer.querySelectorAll('.gh-mobile-group.is-open').forEach(g => {
          g.classList.remove('is-open');
          g.querySelector('.gh-mobile-expand').setAttribute('aria-expanded', 'false');
        });
        if (!isOpen) {
          group.classList.add('is-open');
          btn.setAttribute('aria-expanded', 'true');
        }
      }

      head.addEventListener('click', (e) => {
        if (link && link.contains(e.target)) return; // let the link navigate normally
        e.preventDefault();
        toggleGroup();
      });
    });

    // "By Vibe" inside the Spotlights sublist: a static accordion (no
    // guides.json data, unlike Destinations' countries) so it's wired up
    // immediately rather than after a fetch.
    mobileDrawer.querySelectorAll('.gh-mobile-sublist > .gh-mobile-country-group').forEach(group => {
      const head = group.querySelector('.gh-mobile-country-head');
      head.addEventListener('click', () => {
        const isOpen = group.classList.contains('is-open');
        group.classList.toggle('is-open', !isOpen);
        head.setAttribute('aria-expanded', String(!isOpen));
      });
    });
  }

  // Re-attach handlers to the mobile country accordion items — called once
  // guides.json has loaded and the list is filled in. Mobile keeps its own
  // accordion-by-country structure (A–Z, no caps) since it's a different
  // interaction model from the desktop mega panel — tap-to-expand already
  // scrolls fine on a phone, so there's no equivalent need to cap it.
  function wireUpMobileCountryItems() {
    if (!mobileDestinationsList) return;
    mobileDestinationsList.querySelectorAll('.gh-mobile-country-group').forEach(group => {
      const head = group.querySelector('.gh-mobile-country-head');
      const link = head.querySelector('a');
      head.addEventListener('click', (e) => {
        if (link && link.contains(e.target)) return; // let the country link navigate normally
        const isOpen = group.classList.contains('is-open');
        mobileDestinationsList.querySelectorAll('.gh-mobile-country-group.is-open').forEach(g => {
          g.classList.remove('is-open');
          g.querySelector('.gh-mobile-country-head').setAttribute('aria-expanded', 'false');
        });
        if (!isOpen) {
          group.classList.add('is-open');
          head.setAttribute('aria-expanded', 'true');
        }
      });
    });
  }

  // ----- Load guides.json (the single source of truth for the whole site) -----
  fetch(`${prefix}guides.json`)
    .then(res => {
      if (!res.ok) throw new Error('guides.json not found (HTTP ' + res.status + ')');
      return res.json();
    })
    .then(guides => {
      window.GLOBEHINT_GUIDES = guides;
      __resolveGlobehintGuides(guides);
      // The mega panel is flat links straight to each city page — no
      // per-country flyout to wire up here (unlike the old per-country
      // list, and unlike Spotlights' "By Vibe" flyout, which still uses
      // wireSecondaryDropdown above).
      countryPanel.innerHTML = buildMegaPanel(guides);
      if (mobileDestinationsList) {
        mobileDestinationsList.innerHTML = buildMobileCountryList(guides);
        wireUpMobileCountryItems();
      }
    })
    .catch(err => {
      console.error('Globehint: could not load guides.json —', err);
      window.GLOBEHINT_GUIDES = [];
      __resolveGlobehintGuides([]);
      countryPanel.innerHTML = '<div class="gh-mega-empty">Couldn\u2019t load destinations</div>';
      if (mobileDestinationsList) {
        mobileDestinationsList.innerHTML = '<span class="gh-dd-empty">Couldn\u2019t load destinations</span>';
      }
    });
});

// ===== GLOBEHINT SHARED FOOTER =====
// Same idea as the navbar above: one footer, injected on every page, so
// nav links/coffee link/bug link/guide count never have to be hand-edited
// in five different files again.
document.addEventListener("DOMContentLoaded", () => {
  const footerPlaceholder = document.getElementById("global-footer");
  if (!footerPlaceholder) return;

  const isSubfolder = window.location.pathname.includes('/guides/') || document.body.dataset.depth === "1";
  const prefix = isSubfolder ? "../" : "";

  footerPlaceholder.innerHTML = `
    <style>
     footer.site-footer {
        border-top: 1px solid var(--tan, #D8C5A8);
        background: var(--paper-deep, #E8DCC8);
      }

      .footer-main {
        max-width: 1180px;
        margin: 0 auto;
        padding: 56px 32px 36px;
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        gap: 64px;
      }

      .footer-brand .logo {
        font-family: 'Fraunces', serif;
        font-weight: 600;
        font-size: 1.3rem;
        letter-spacing: -0.01em;
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 12px;
      }

      .footer-brand .logo-mark {
        width: 22px;
        height: 22px;
        flex-shrink: 0;
      }

      .footer-brand p {
        color: var(--ink-soft, #4A352F);
        font-size: 0.88rem;
        max-width: 280px;
        margin-bottom: 16px;
        text-align: left;
      }

      .footer-stat {
        font-family: 'JetBrains Mono', monospace;
        font-size: 0.74rem;
        color: var(--fade, #A48F6E);
        display: inline-flex;
        align-items: center;
        gap: 8px;
        background: var(--paper, #F3EADD);
        border: 1px solid var(--tan, #D8C5A8);
        border-radius: 100px;
        padding: 6px 14px;
        margin-left: -20px;
        width: fit-content;
      }

      .footer-stat strong {
        color: var(--ochre, #C98A2C);
        font-weight: 600;
      }

      /* middle/right columns: the column itself centers within its grid
         track, but the text/links inside stay left-aligned */
      .footer-col {
        display: flex;
        flex-direction: column;
        align-items: center;
      }

      .footer-col h4 {
        font-family: 'JetBrains Mono', monospace;
        font-size: 0.7rem;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: var(--fade, #A48F6E);
        margin-bottom: 16px;
        align-self: center;
      }

      .footer-col ul {
        list-style: none;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 11px;
        text-align: left;
      }

      .footer-col ul li.footer-coffee-item {
        align-self: center;
      }

      .footer-col a {
        font-size: 0.9rem;
        color: var(--ink-soft, #4A352F);
        transition: color 0.2s ease;
      }

      .footer-col a:hover {
        color: var(--ochre, #C98A2C);
      }

      .footer-coffee {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        background: var(--ink, #2A1815);
        color: var(--paper, #F3EADD) !important;
        padding: 10px 16px;
        border-radius: var(--radius, 3px);
        font-size: 0.85rem;
        font-weight: 400;
        transition: background 0.2s ease;
        width: fit-content;
      }

      .footer-coffee:hover {
        background: var(--forest, #3F5443);
        color: var(--paper, #F3EADD) !important;
      }

      .footer-bottom {
        border-top: 1px solid var(--tan, #D8C5A8);
      }

      .footer-bottom-inner {
        max-width: 1180px;
        margin: 0 auto;
        padding: 18px 32px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
      }

      .footer-legal {
        font-family: 'JetBrains Mono', monospace;
        font-size: 0.72rem;
        color: var(--fade, #A48F6E);
      }

      .footer-social {
        display: flex;
        align-items: center;
        background: var(--ink, #2A1815);
        border-radius: var(--radius, 3px);
        overflow: hidden;
        flex-shrink: 0;
      }

      .footer-social a {
        color: var(--paper, #F3EADD);
        padding: 8px 11px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.2s ease;
      }

      .footer-social a:hover {
        background: var(--forest, #3F5443);
      }

      .footer-social svg {
        width: 15px;
        height: 15px;
        flex-shrink: 0;
      }

      .footer-social-divider {
        width: 1px;
        height: 14px;
        background: rgba(250, 246, 238, 0.25);
        flex-shrink: 0;
      }

      @media (max-width: 760px) {
        .footer-main {
          grid-template-columns: 1fr;
          gap: 36px;
        }
        .footer-col {
          align-items: flex-start;
        }
        .footer-col h4 {
          align-self: flex-start;
        }
        .footer-bottom-inner {
          flex-direction: column;
          gap: 14px;
        }
      }
    </style>

    <footer class="site-footer">
      <div class="footer-main">

        <div class="footer-brand">
          <a href="${prefix}index.html" class="logo">
            Globehint
          </a>
          <p>Globehint - a one-person travel project, curated one location at a time.</p>
          <a href="${prefix}destinations.html" class="footer-stat">🗺️ <strong id="footer-guide-count">…</strong> guides published so far</a>
        </div>

        <div class="footer-col">
          <h4>Explore</h4>
          <ul>
            <li><a href="${prefix}index.html">Home</a></li>
            <li><a href="${prefix}destinations.html">Destinations</a></li>
            <li><a href="${prefix}spotlights.html">Spotlights</a></li>
            <li><a href="${prefix}about.html">About Us</a></li>
          </ul>
        </div>

        <div class="footer-col">
          <h4>Keep it going</h4>
          <ul>
            <li class="footer-coffee-item"><a href="${prefix}index.html#brew-bugs" class="footer-coffee">☕ Buy me a coffee</a></li>
            <li><a href="${prefix}index.html#bug-report">Report a bug / Suggest a city</a></li>
          </ul>
        </div>

      </div>

      <div class="footer-bottom">
        <div class="footer-bottom-inner">
          <span class="footer-legal">© <span id="footer-year"></span> Globehint. Thorough research to help you travel better.</span>
          <div class="footer-social">
            <a href="https://www.tiktok.com" target="_blank" rel="noopener" aria-label="Globehint on TikTok">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M16.6 5.82s.51.5 0 0A4.278 4.278 0 0 1 15.54 3h-3.09v12.4a2.592 2.592 0 0 1-2.59 2.5c-1.42 0-2.6-1.16-2.6-2.6 0-1.72 1.66-3.01 3.37-2.48V9.66c-3.45-.46-6.47 2.22-6.47 5.64 0 3.33 2.76 5.7 5.69 5.7 3.14 0 5.69-2.55 5.69-5.7V9.01a7.35 7.35 0 0 0 4.3 1.38V7.3s-1.88.09-3.24-1.48z"/></svg>
            </a>
            <span class="footer-social-divider"></span>
            <a href="https://www.instagram.com" target="_blank" rel="noopener" aria-label="Globehint on Instagram">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="3.6"/><circle cx="17.2" cy="6.8" r="0.9" fill="currentColor" stroke="none"/></svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  `;

  // Fill in the live guide count once guides.json has loaded — reuses the
  // exact same fetch the navbar dropdown already triggered above, so this
  // doesn't cost a second network request.
  if (window.GLOBEHINT_GUIDES_READY) {
    window.GLOBEHINT_GUIDES_READY.then(guides => {
      const countEl = document.getElementById('footer-guide-count');
      if (countEl) countEl.textContent = (guides || []).length;
    });
  }

  // Footer copyright year — always shows the current year, no manual
  // updates needed each January.
  const yearEl = document.getElementById('footer-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
});
