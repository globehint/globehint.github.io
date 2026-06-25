document.addEventListener("DOMContentLoaded", () => {
  const placeholder = document.getElementById("global-navbar");
  if (!placeholder) return;

  // Determine path prefix based on whether the file is in a subfolder
  // If the current path contains a subfolder (like /guides/), prefix links with '../'
  const isSubfolder = window.location.pathname.includes('/guides/') || document.body.dataset.depth === "1";
  const prefix = isSubfolder ? "../" : "";

  placeholder.innerHTML = `
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
          <a href="${prefix}index.html#destinations">Destinations</a>
          <a href="${prefix}about.html">About Us</a>
          <a href="${prefix}index.html#brew-bugs">Support</a>
        </nav>
        <a href="${prefix}index.html#brew-bugs" class="nav-cta">Buy us a brew</a>
      </div>
    </header>
  `;
});
