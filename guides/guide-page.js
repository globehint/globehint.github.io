// Highlight active section in the side rail and the mobile drawer.
  // Uses IntersectionObserver instead of a scroll listener that
  // re-measures every section's offsetTop on every scroll event - that
  // approach gets slower as guides get longer, since it does more work
  // per scroll frame the more sections there are. IntersectionObserver
  // only fires when a section actually crosses the watched line, so the
  // cost stays flat no matter how long the guide is.
  const sections = document.querySelectorAll('.guide-section');
  const railLinks = document.querySelectorAll('.side-rail a');
  const drawerLinks = document.querySelectorAll('#section-drawer-sheet a');

  function markActive(id) {
    railLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + id));
    drawerLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + id));
  }

  let currentId = sections.length ? sections[0].id : '';
  markActive(currentId);

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        currentId = entry.target.id;
        markActive(currentId);
      }
    });
  }, {
    // Treat a section as "active" once it's crossed a line 140px below
    // the top of the viewport (matching the old scrollPos offset), and
    // give it some room below too so the active state doesn't flicker
    // between two adjacent short sections.
    rootMargin: '-140px 0px -60% 0px',
    threshold: 0
  });

  sections.forEach(sec => sectionObserver.observe(sec));

// Scroll progress bar - how far through the guide the reader is.
  const progressFill = document.getElementById('scroll-progress-fill');

  function updateProgress() {
    if (!progressFill) return;
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const pct = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
    progressFill.style.width = Math.min(100, Math.max(0, pct)) + '%';
  }

  window.addEventListener('scroll', updateProgress, { passive: true });
  window.addEventListener('resize', updateProgress);
  updateProgress();

  // Mobile floating section drawer - replaces the old horizontal toc-bar.
  const fab = document.getElementById('section-fab');
  const drawerSheet = document.getElementById('section-drawer-sheet');
  const drawerBackdrop = document.getElementById('section-drawer-backdrop');

  function closeDrawer() {
    if (!fab || !drawerSheet || !drawerBackdrop) return;
    drawerSheet.classList.remove('is-open');
    drawerBackdrop.classList.remove('is-open');
    fab.setAttribute('aria-expanded', 'false');
  }

  function openDrawer() {
    if (!fab || !drawerSheet || !drawerBackdrop) return;
    drawerSheet.classList.add('is-open');
    drawerBackdrop.classList.add('is-open');
    fab.setAttribute('aria-expanded', 'true');
  }

  if (fab && drawerSheet && drawerBackdrop) {
    fab.addEventListener('click', () => {
      const isOpen = drawerSheet.classList.contains('is-open');
      if (isOpen) closeDrawer(); else openDrawer();
    });

    drawerBackdrop.addEventListener('click', closeDrawer);

    // Tapping a section link should close the drawer so it doesn't sit
    // open over the section the reader just jumped to.
    drawerSheet.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', closeDrawer);
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeDrawer();
    });
  }

 // ===== THIS GUIDE'S OWN DATA, LAST UPDATED, CONTINUE EXPLORING, RELATED GUIDES =====
  // All three features need to know which row in guides.json describes the
  // guide currently on screen. There's no separate id/slug placeholder for
  // this - every guide already has a unique "url" field (e.g.
  // "guides/berlin.html"), and that's exactly what this page's own address
  // ends with once the file is saved/published under that name. Matching
  // against the live URL means nothing extra needs to be filled in by hand
  // when a new guide is written from this template.
  function escapeHtmlGuide(str) {
    return String(str).replace(/[&<>"']/g, c => (
      { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
    ));
  }

  const isSubfolderGuide = window.location.pathname.includes('/guides/') || document.body.dataset.depth === "1";
  const guidePrefix = isSubfolderGuide ? "../" : "";

  function findThisGuide(guides) {
    return guides.find(g => window.location.pathname.endsWith('/' + g.url) || window.location.pathname.endsWith(g.url));
  }

  function formatPublishedDate(dateStr) {
    const d = new Date(dateStr + 'T00:00:00');
    if (isNaN(d)) return dateStr;
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  function initLastUpdated(thisGuide) {
    if (!thisGuide || !thisGuide.published) return;
    const metaEl = document.getElementById('last-updated-meta');
    const dateEl = document.getElementById('last-updated-date');
    if (!metaEl || !dateEl) return;
    dateEl.textContent = formatPublishedDate(thisGuide.published);
    metaEl.style.display = '';
  }

  function initContinueExploring(thisGuide) {
    if (!thisGuide || !thisGuide.country) return;
    const link = document.getElementById('continue-exploring-link');
    if (!link) return;
    const countrySlug = thisGuide.country.toLowerCase().replace(/\s+/g, '');
    link.href = guidePrefix + countrySlug + '.html';
    link.style.display = '';
  }

  function initRelatedGuides(allGuides, thisGuide) {
    const grid = document.getElementById('related-grid');
    if (!grid) return;

    if (!thisGuide || !thisGuide.vibe) {
      grid.innerHTML = '<p class="no-related">Related guides aren\u2019t available for this page yet.</p>';
      return;
    }

    const related = allGuides
      .filter(g => g.vibe === thisGuide.vibe && g.url !== thisGuide.url)
      .sort((a, b) => new Date(b.published) - new Date(a.published))
      .slice(0, 3);

    if (related.length === 0) {
      grid.innerHTML = '<p class="no-related">No other ' + escapeHtmlGuide(thisGuide.vibe) + '-vibe guides published yet - check back soon.</p>';
      return;
    }

    const GUIDE_FALLBACK_BLURB = 'The full Globehint guide - where to stay, how to get around, and what not to miss.';

    grid.innerHTML = related.map((g, i) => {
      const vibeIcon = (window.GLOBEHINT_VIBE_ICONS && window.GLOBEHINT_VIBE_ICONS[g.vibe]) || '';
      const vibeLabel = g.vibe ? '<span class="cs-vibe">Best for: ' + escapeHtmlGuide(g.vibe.charAt(0).toUpperCase() + g.vibe.slice(1)) + '</span>' : '';
      const blurb = g.blurb || GUIDE_FALLBACK_BLURB;
      const photo = g.image
        ? '<img src="' + guidePrefix + g.image + '" alt="' + escapeHtmlGuide(g.imageAlt || g.name) + '" loading="lazy">'
        : '';
      return '<a href="' + guidePrefix + escapeHtmlGuide(g.url) + '" class="article-card" id="related-card-' + i + '">' +
        '<div class="card-stamp">' +
          '<svg viewBox="0 0 60 60" fill="none" aria-hidden="true">' +
            '<circle cx="30" cy="30" r="27" stroke="currentColor" stroke-width="1.4" stroke-dasharray="2.5 2.5"/>' +
            '<circle cx="30" cy="30" r="21" stroke="currentColor" stroke-width="1"/>' +
            '<g stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' + vibeIcon + '</g>' +
          '</svg>' +
          '<div class="card-stamp-text">' +
            '<span class="cs-country">' + (g.flag ? '<span class="fi fi-' + g.flag + '" aria-hidden="true"></span> ' : '') + escapeHtmlGuide(g.country) + '</span>' +
            vibeLabel +
          '</div>' +
          '<div class="card-hero-photo">' + photo + '</div>' +
        '</div>' +
        '<div class="card-body">' +
          '<span class="eyebrow">City deep dive</span>' +
          '<h3>' + escapeHtmlGuide(g.name) + ', properly</h3>' +
          '<p class="card-blurb">' + escapeHtmlGuide(blurb) + '</p>' +
          '<span class="card-readmore">Read the guide →</span>' +
        '</div>' +
      '</a>';
    }).join('');
  }

  // Wait for DOMContentLoaded so navbar.js (loaded with `defer`) has
  // definitely run and created window.GLOBEHINT_GUIDES_READY before we look
  // for it - deferred scripts always execute before DOMContentLoaded fires,
  // while this inline script (not deferred) would otherwise run first and
  // find the global missing every time.
  document.addEventListener('DOMContentLoaded', () => {
    if (window.GLOBEHINT_GUIDES_READY) {
      window.GLOBEHINT_GUIDES_READY.then(guides => {
        const allGuides = guides || [];
        const thisGuide = findThisGuide(allGuides);
        initLastUpdated(thisGuide);
        initContinueExploring(thisGuide);
        initRelatedGuides(allGuides, thisGuide);
      });
    } else {
      console.error('Globehint: navbar.js did not initialise guides.json loading.');
      initRelatedGuides([], null);
    }
  });
