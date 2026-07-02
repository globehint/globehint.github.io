// ===== VIBE ICONS =====
// One small icon per "vibe" category, used inside the double-ring stamp
// graphic on the homepage cards. To add a guide's vibe: set a "vibe" field
// in guides.json to one of the keys below (e.g. "vibe": "food"). To add a
// brand-new category later: add one more entry here with a new icon.
window.GLOBEHINT_VIBE_ICONS = {
  food: '<path d="M21 18v8a2.5 2.5 0 002.5 2.5v0M21 18v6M24 18v6M27 18v6M27 18v25M38 18c-3.2 0-4.5 2.6-4.5 7S34.8 32 38 32M38 18v25"/>',
  nature: '<path d="M16 38l8-12 5 6 6-9 9 15z"/><circle cx="36" cy="20" r="2.6"/>',
  history: '<path d="M18 19h24M18 41h24M23 23v14M30 23v14M37 23v14M20 19l2-4h16l2 4"/>',
  nightlife: '<path d="M18 19h24l-12 13z"/><path d="M30 32v9M24 41h12"/>',
  // ----- New vibes (added together; all drawn on the same 0 0 60 60
  // grid as the four above, ring/center at (30,30)) -----
  alpine: '<path d="M16 41h28L30 19z"/><path d="M26 27l4 4 4-4"/>',
  wellness: '<path d="M30 43C26 35 26 26 30 18C34 26 34 35 30 43Z"/><path d="M30 43C36 38 40 32 38 24C36 32 32 38 30 43Z"/><path d="M30 43C24 38 20 32 22 24C24 32 28 38 30 43Z"/><path d="M18 43h24"/>',
  // Adventure: redrawn as a proper compass needle — the original kite
  // shape only pointed one way (NE) so it sat lopsided inside the ring.
  // This version is two points mirrored exactly through the ring's
  // center (30,30) — the same construction as a standard compass-needle
  // icon — so it now reads as centered like the others.
  adventure: '<circle cx="30" cy="30" r="13"/><path d="M35.5 24.5L33.2 31.5L24.5 35.5L26.8 28.5Z"/>',
  art: '<circle cx="30" cy="30" r="12"/><circle cx="25" cy="26" r="1.8" fill="currentColor" stroke="none"/><circle cx="30" cy="23" r="1.8" fill="currentColor" stroke="none"/><circle cx="35" cy="26" r="1.8" fill="currentColor" stroke="none"/><circle cx="30" cy="36" r="1.8" fill="currentColor" stroke="none"/>',
  design: '<path d="M20 40L40 20"/><path d="M20 40l5-2-3-3z" fill="currentColor" stroke="none"/><path d="M35 20l5 5"/>',
  shopping: '<path d="M20 26h20l-2 17H22z"/><path d="M24 26v-4a6 6 0 0112 0v4"/><path d="M26 30v9M34 30v9"/>',
  spirituality: '<path d="M30 20c3 5 5 8 5 12a5 5 0 01-10 0c0-4 2-7 5-12z"/><path d="M22 43h16"/>',
  luxury: '<path d="M22 20h16l6 6-14 14-14-14z"/><path d="M22 20l8 6 8-6M30 26v14"/>',
  romance: '<path d="M30 42C20 34 16 28 16 23a7 7 0 0114 0a7 7 0 0114 0c0 5-4 11-14 19z"/>',
  family: '<circle cx="22" cy="24" r="4"/><path d="M16 40c0-6 3-10 6-10s6 4 6 10"/><circle cx="38" cy="24" r="4"/><path d="M32 40c0-6 3-10 6-10s6 4 6 10"/><circle cx="30" cy="32" r="3"/><path d="M26 42c0-4 2-7 4-7s4 3 4 7"/>',
  tech: '<rect x="22" y="22" width="16" height="16" rx="2"/><path d="M26 22v-4M34 22v-4M26 42v-4M34 42v-4M22 26h-4M22 34h-4M38 26h4M38 34h4"/>',
  coastal: '<path d="M16 37c3-3 6-3 9 0s6 3 9 0 6-3 9 0"/><circle cx="30" cy="22" r="5"/>',
  rural: '<path d="M30 43V19"/><path d="M30 23l-5-4M30 23l5-4M30 29l-5-4M30 29l5-4M30 35l-5-4M30 35l5-4"/>'
};
// Fallback icon for any vibe that's in guides.json but has no hand-drawn
// icon above yet (e.g. a brand-new vibe typo'd into a guide before its
// icon was added here) — keeps the nav flyout and Spotlights tiles from
// ever rendering blank.
window.GLOBEHINT_GENERIC_VIBE_ICON = '<circle cx="30" cy="30" r="13"/><path d="M35 21l-5 12-12 5 5-12z"/>';
window.GLOBEHINT_escapeHtml = function (str) {
  return String(str).replace(/[&<>"']/g, c => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
};
window.GLOBEHINT_photoFallback = function (label) {
  return '<div class="photo-fallback" role="img" aria-label="' + window.GLOBEHINT_escapeHtml(label) + '"><svg viewBox="0 0 40 40" fill="none"><circle cx="20" cy="20" r="18" stroke="currentColor" stroke-width="1.3"/><path d="M13 24l5-9 4 6 3-4 5 7M13 24h14" stroke="currentColor" stroke-width="1.1" fill="none"/></svg></div>';
};
window.GLOBEHINT_cardPicture = function (imagePath, alt, opts) {
  opts = opts || {};
  const sizes = opts.sizes || '(max-width: 600px) 50vw, 260px';
  const loading = opts.loading || 'lazy';
  // imagePath is always "<...>/images/guides/<slug>-hero-800.jpg" per the
  // guides.json image-field convention — derive the 400w/1200w webp
  // variants and the matching jpg fallback from that same base.
  const base = imagePath.replace(/-hero-800\.jpg$/, '-hero');
  const altText = window.GLOBEHINT_escapeHtml(alt);
  return '<picture>' +
    '<source type="image/webp" srcset="' +
      base + '-400.webp 400w, ' +
      base + '-800.webp 800w, ' +
      base + '-1200.webp 1200w" ' +
      'sizes="' + sizes + '">' +
    '<img src="' + imagePath + '" alt="' + altText + '" loading="' + loading + '">' +
  '</picture>';
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
  const FLAG_ICONS_HREF = "https://cdn.jsdelivr.net/npm/flag-icons@7.5.0/css/flag-icons.min.css";
  if (!document.querySelector('link[href="' + FLAG_ICONS_HREF + '"]')) {
  const flagIconsLink = document.createElement("link");
  flagIconsLink.rel = "stylesheet";
  flagIconsLink.href = FLAG_ICONS_HREF;
  flagIconsLink.integrity = "sha256-tyPeBlnZW2qWbAF1hQiCt9qo6SOgOSymvJBum+FrrwI=";
  flagIconsLink.crossOrigin = "anonymous";
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
  //
  // IMAGE FIELD CONVENTION: the "image" field on every guides.json entry
  // must always point at the -800.jpg variant (e.g.
  // "images/guides/berlin-hero-800.jpg"), never the raw -hero.jpg source
  // file. The raw file is multiple MB; -800.jpg is the pre-compressed
  // version the image workflow (generate-hero-images.yml) generates
  // automatically the moment you commit the raw source.
  
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

  const escapeHtmlMega = window.GLOBEHINT_escapeHtml;

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

  // ----- Build the "By Vibe" flyout (desktop hover panel + mobile list) -----
  // Capped at GH_VIBE_PANEL_MAX entries so it can never grow into an
  // unmanageable wall of links as more vibes get used.
  //
  // Ordering rule:
  //   - Once GH_VIBE_PANEL_MAX (10) distinct vibes have at least one
  //     published guide, the panel shows the 10 *most recently active*
  //     vibes — i.e. ranked by the publish date of each vibe's newest
  //     guide, newest first. This mirrors the "most recent" ordering the
  //     Destinations mega-panel already uses for countries.
  //   - Until that 10-vibe threshold is reached, recency-ranking a
  //     handful of vibes isn't meaningful (it would just reflect whatever
  //     order guides happened to be published in), so the shown vibes are
  //     shuffled into a random order instead. The list re-shuffles on
  //     every page load until the 10th vibe arrives, at which point it
  //     switches over to the recency ordering above and stays stable.
  const GH_VIBE_PANEL_MAX = 10;

  function pickVibesForPanel(guides) {
    const latestByVibe = {};
    guides.forEach(g => {
      if (!g.vibe) return;
      const published = new Date(g.published);
      if (!latestByVibe[g.vibe] || published > latestByVibe[g.vibe]) {
        latestByVibe[g.vibe] = published;
      }
    });

    let vibes = Object.keys(latestByVibe);
    if (vibes.length === 0) return [];

    if (vibes.length < GH_VIBE_PANEL_MAX) {
      // Fewer than 10 vibes published so far — random order (Fisher-Yates).
      for (let i = vibes.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [vibes[i], vibes[j]] = [vibes[j], vibes[i]];
      }
      return vibes;
    }

    return vibes
      .sort((a, b) => latestByVibe[b] - latestByVibe[a])
      .slice(0, GH_VIBE_PANEL_MAX);
  }

  function buildVibeFlyout(guides, isMobile) {
    const vibes = pickVibesForPanel(guides);
    if (vibes.length === 0) {
      return '<span class="gh-dd-empty">No vibes published yet</span>';
    }
    const icons = window.GLOBEHINT_VIBE_ICONS || {};
    const iconClass = isMobile ? 'gh-mobile-vibe-icon' : 'gh-vibe-icon';
    const linkClass = isMobile ? '' : ' class="gh-city-link gh-city-link-icon"';
    return vibes.map(vibe => {
      const iconPath = icons[vibe] || window.GLOBEHINT_GENERIC_VIBE_ICON;
      const label = escapeHtmlMega(vibe.charAt(0).toUpperCase() + vibe.slice(1));
      return `<a href="${prefix}${escapeHtmlMega(vibe)}.html"${linkClass}><svg class="${iconClass}" viewBox="0 0 56 56" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${iconPath}</svg>${label}</a>`;
    }).join('');
  }

  placeholder.innerHTML = `

    <header class="site-nav">
      <div class="nav-inner">
        <a href="${prefix}index.html" class="logo">
          <img src="${prefix}images/logo/globehint-logo.webp" alt="Globehint logo" class="logo-mark">
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
                <div class="gh-city-panel" id="gh-vibe-panel-desktop">
                  <span class="gh-dd-empty">Loading…</span>
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
                <div class="gh-mobile-city-list" id="gh-vibe-panel-mobile">
                  <span class="gh-dd-empty">Loading…</span>
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
      // Destinations mega-panel should only show full destination guides,
      // not day trips (day trips have dayTripFrom set, pointing back at
      // their parent destination) — day trips already surface on their
      // parent guide page and on the Day Trips page itself.
      const destinationGuidesOnly = guides.filter(g => !g.dayTripFrom);
      countryPanel.innerHTML = buildMegaPanel(destinationGuidesOnly);
      if (mobileDestinationsList) {
        mobileDestinationsList.innerHTML = buildMobileCountryList(guides);
        wireUpMobileCountryItems();
      }
      const vibePanelDesktop = document.getElementById('gh-vibe-panel-desktop');
      if (vibePanelDesktop) vibePanelDesktop.innerHTML = buildVibeFlyout(guides, false);
      const vibePanelMobile = document.getElementById('gh-vibe-panel-mobile');
      if (vibePanelMobile) vibePanelMobile.innerHTML = buildVibeFlyout(guides, true);
    })
    .catch(err => {
      console.error('Globehint: could not load guides.json —', err);
      window.GLOBEHINT_GUIDES = [];
      __resolveGlobehintGuides([]);
      countryPanel.innerHTML = '<div class="gh-mega-empty">Couldn\u2019t load destinations</div>';
      if (mobileDestinationsList) {
        mobileDestinationsList.innerHTML = '<span class="gh-dd-empty">Couldn\u2019t load destinations</span>';
      }
      const vibePanelDesktop = document.getElementById('gh-vibe-panel-desktop');
      if (vibePanelDesktop) vibePanelDesktop.innerHTML = '<span class="gh-dd-empty">Couldn\u2019t load vibes</span>';
      const vibePanelMobile = document.getElementById('gh-vibe-panel-mobile');
      if (vibePanelMobile) vibePanelMobile.innerHTML = '<span class="gh-dd-empty">Couldn\u2019t load vibes</span>';
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
            <li class="footer-coffee-item"><a href="https://www.buymeacoffee.com/globehint" class="footer-coffee" target="_blank" rel="noopener">☕ Buy me a coffee</a></li>
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
