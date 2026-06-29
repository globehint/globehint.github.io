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
