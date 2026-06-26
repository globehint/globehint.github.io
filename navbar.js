// ===== VIBE ICONS =====
// One small icon per "vibe" category, used inside the double-ring stamp
// graphic on the homepage cards. To add a guide's vibe: set a "vibe" field
// in guides.json to one of the keys below (e.g. "vibe": "food"). To add a
// brand-new category later: add one more entry here with a new icon.
window.GLOBEHINT_VIBE_ICONS = {
  food: '<path d="M22 19v13a4 4 0 004 4h0M22 19v9M26 19v17M36 19c-3 0-4.5 3-4.5 7.5S33 34 36 34"/>',
  nature: '<path d="M16 39l9.5-13.5 5 6.5 4-5.5 9.5 12.5"/>',
  history: '<path d="M20 40V24l10-7 10 7v16M20 40h20M25 40v-9h10v9"/>',
  nightlife: '<path d="M20 19h20l-10 11v8M25 38h10M30 30v8"/>'
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

  // Determine path prefix based on whether the file is in a subfolder
  // If the current path contains a subfolder (like /guides/), prefix links with '../'
  const isSubfolder = window.location.pathname.includes('/guides/') || document.body.dataset.depth === "1";
  const prefix = isSubfolder ? "../" : "";

  // ===== GLOBEHINT GUIDE INDEX =====
  // The guide list now lives in one place: guides.json at the site root.
  // To publish a new guide: drop the .html file into /guides/, then add one
  // line to guides.json. Every page (nav, homepage, destinations) reads from
  // that same file automatically — nothing else needs to be touched.

  // ----- Build the dropdown markup (only rendered if at least one country has a published guide) -----
  function buildCountryList(guides) {
    const byCountry = {}; // { "Portugal": { flag, cities: [...] } }
    guides.forEach(g => {
      if (!byCountry[g.country]) byCountry[g.country] = { flag: g.flag, cities: [] };
      byCountry[g.country].cities.push(g);
    });

    const countryNames = Object.keys(byCountry).sort((a, b) => a.localeCompare(b));
    countryNames.forEach(c => byCountry[c].cities.sort((a, b) => a.name.localeCompare(b.name)));

    if (countryNames.length === 0) {
      return '<li class="gh-dd-empty">No guides published yet</li>';
    }
    return countryNames.map(country => {
      const entry = byCountry[country];
      const cityLinks = entry.cities.map(city =>
        `<a href="${prefix}${city.url}" class="gh-city-link">${city.name}</a>`
      ).join('');
      return `
        <li class="gh-country-item">
          <button type="button" class="gh-country-trigger" aria-haspopup="true" aria-expanded="false">
            <span class="gh-flag" aria-hidden="true">${entry.flag}</span>
            <span class="gh-country-name">${country}</span>
            <span class="gh-chevron" aria-hidden="true">›</span>
          </button>
          <div class="gh-city-panel">
            ${cityLinks}
          </div>
        </li>`;
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
      .gh-country-item.is-open > .gh-country-trigger {
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

      @media (prefers-reduced-motion: reduce) {
        .gh-country-panel, .gh-city-panel { transition: none !important; }
      }
    </style>

    <header class="site-nav">
      <div class="nav-inner">
        <a href="${prefix}index.html" class="logo">
          <svg class="logo-mark" viewBox="0 0 26 26" fill="none">
            <circle cx="13" cy="13" r="12" stroke="#C98A2C" stroke-width="1.4"/>
            <path d="M13 4 C 17 8, 17 18, 13 22 C 9 18, 9 8, 13 4 Z" stroke="#2A1815" stroke-width="1.1" fill="none"/>
            <path d="M2 13 H24 M5 8.5 H21 M5 17.5 H21" stroke="#2A1815" stroke-width="0.8" opacity="0.6"/>
          </svg>
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
            <ul class="gh-country-panel" role="menu" id="gh-country-panel">
              <li class="gh-dd-empty">Loading…</li>
            </ul>
          </div>
          <a href="${prefix}about.html">About Us</a>
          <a href="${prefix}index.html#brew-bugs">Support</a>
        </nav>
        <a href="${prefix}index.html#brew-bugs" class="nav-cta">Buy us a brew</a>
      </div>
    </header>
  `;

  // ----- Interaction: click/tap toggles open state (works alongside :hover for desktop) -----
  const ddWrap = document.getElementById('gh-destinations-dd');
  if (!ddWrap) return;

  const ddTrigger = ddWrap.querySelector('.gh-chevron-toggle');
  const ddMainLink = ddWrap.querySelector('.gh-dd-main-link');
  const countryPanel = document.getElementById('gh-country-panel');

  function closeAll() {
    ddWrap.classList.remove('is-open');
    ddTrigger.setAttribute('aria-expanded', 'false');
    ddWrap.querySelectorAll('.gh-country-item.is-open').forEach(item => {
      item.classList.remove('is-open');
      item.querySelector('.gh-country-trigger').setAttribute('aria-expanded', 'false');
    });
  }

  // Re-attach click handlers to country triggers — called once the dropdown
  // content is filled in after guides.json loads.
  function wireUpCountryItems() {
    ddWrap.querySelectorAll('.gh-country-item').forEach(item => {
      const trigger = item.querySelector('.gh-country-trigger');
      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const isOpen = item.classList.contains('is-open');
        ddWrap.querySelectorAll('.gh-country-item.is-open').forEach(i => {
          i.classList.remove('is-open');
          i.querySelector('.gh-country-trigger').setAttribute('aria-expanded', 'false');
        });
        if (!isOpen) {
          item.classList.add('is-open');
          trigger.setAttribute('aria-expanded', 'true');
        }
      });
    });
  }

  // The chevron toggles the country panel without navigating.
  // The "Destinations" text itself stays a normal link to destinations.html.
  ddTrigger.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
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

  document.addEventListener('click', (e) => {
    if (!ddWrap.contains(e.target)) {
      closeAll();
      touchOpened = false;
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeAll();
      touchOpened = false;
    }
  });

  // ----- Load guides.json (the single source of truth for the whole site) -----
  fetch(`${prefix}guides.json`)
    .then(res => {
      if (!res.ok) throw new Error('guides.json not found (HTTP ' + res.status + ')');
      return res.json();
    })
    .then(guides => {
      window.GLOBEHINT_GUIDES = guides;
      __resolveGlobehintGuides(guides);
      countryPanel.innerHTML = buildCountryList(guides);
      wireUpCountryItems();
    })
    .catch(err => {
      console.error('Globehint: could not load guides.json —', err);
      window.GLOBEHINT_GUIDES = [];
      __resolveGlobehintGuides([]);
      countryPanel.innerHTML = '<li class="gh-dd-empty">Couldn\u2019t load destinations</li>';
    });
});
