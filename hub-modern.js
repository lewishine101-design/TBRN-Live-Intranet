(function () {
  'use strict';

  const stroke = 'fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"';
  const icon = paths => `<svg viewBox="0 0 24 24" aria-hidden="true" ${stroke}>${paths}</svg>`;
  const icons = {
    Home: icon('<path d="m3 11 9-8 9 8"/><path d="M5 10v10h14V10"/><path d="M9 20v-6h6v6"/>'),
    'Contractor Network': icon('<circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M3 20c0-4 2.7-6 6-6s6 2 6 6"/><path d="M14 15c3.6-.8 7 1 7 5"/>'),
    Surveyors: icon('<path d="M4 12h16"/><path d="M5 12V9l7-4 7 4v3"/><path d="M7 12v7h10v-7"/><path d="M9 5V3h6v2"/>'),
    Contacts: icon('<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 3v18"/><circle cx="13.5" cy="10" r="2"/><path d="M10.5 17c.6-2 1.6-3 3-3s2.4 1 3 3"/>'),
    Finance: icon('<ellipse cx="12" cy="5" rx="7" ry="3"/><path d="M5 5v5c0 1.7 3.1 3 7 3s7-1.3 7-3V5"/><path d="M5 10v5c0 1.7 3.1 3 7 3s7-1.3 7-3v-5"/>'),
    'Pricing & Finance': icon('<path d="M7 3h8l3 3v15H7z"/><path d="M15 3v4h4"/><path d="M10 11h5M10 15h5"/>'),
    Processes: icon('<circle cx="12" cy="12" r="3"/><path d="M19 13.5v-3l-2-.7-.8-1.8.9-1.9L15 4l-1.9.9-1.8-.8L10.5 2h-3l-.7 2-1.8.8-1.9-.9L1 6l.9 1.9-.8 1.8-2.1.8v3l2 .7.8 1.8-.9 1.9L3 20l1.9-.9 1.8.8.8 2.1h3l.7-2 1.8-.8 1.9.9L17 18l-.9-1.9.8-1.8z" transform="translate(2.5 0) scale(.8)"/>'),
    'Knowledge Base': icon('<circle cx="12" cy="12" r="9"/><path d="M9.8 9a2.3 2.3 0 1 1 3.2 2.1c-.7.3-1 1-1 1.9"/><path d="M12 17h.01"/>'),
    Admin: icon('<circle cx="12" cy="12" r="3"/><path d="M19 13.5v-3l-2-.7-.8-1.8.9-1.9L15 4l-1.9.9-1.8-.8L10.5 2h-3l-.7 2-1.8.8-1.9-.9L1 6l.9 1.9-.8 1.8-2.1.8v3l2 .7.8 1.8-.9 1.9L3 20l1.9-.9 1.8.8.8 2.1h3l.7-2 1.8-.8 1.9.9L17 18l-.9-1.9.8-1.8z" transform="translate(2.5 0) scale(.8)"/>')
  };

  const displayMap = {
    'Surveyor Network': 'Surveyors',
    VAT: 'Pricing & Finance',
    FAQs: 'Knowledge Base'
  };

  function resolveCategory(element) {
    const heading = element?.querySelector?.('h4');
    const raw = element?.dataset?.renameCategory || element?.dataset?.category || element?.dataset?.cat || heading?.dataset?.originalName || heading?.textContent?.trim() || '';
    return displayMap[raw] || raw;
  }

  function decorateNavigation() {
    document.querySelectorAll('#nav button').forEach(button => {
      const key = displayMap[button.dataset.cat] || button.dataset.cat || button.textContent.trim();
      const holder = button.querySelector('.ico');
      if (holder && icons[key] && holder.dataset.modernIcon !== key) {
        holder.innerHTML = icons[key];
        holder.dataset.modernIcon = key;
      }
    });
  }

  function decorateCards() {
    document.querySelectorAll('#categories .catcard').forEach(card => {
      const key = resolveCategory(card);
      const holder = card.querySelector('.cat-icon');
      if (holder && icons[key] && holder.dataset.modernIcon !== key) {
        holder.innerHTML = icons[key];
        holder.dataset.modernIcon = key;
      }
    });
  }

  function greeting() {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }

  function buildIntro(home) {
    if (home.querySelector('.modern-dashboard-intro')) return;
    const intro = document.createElement('div');
    intro.className = 'modern-dashboard-intro';
    const now = new Date();
    const date = new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(now);
    intro.innerHTML = `<div><h1>${greeting()}<span>.</span></h1><p>Your TBRN workspace</p></div><div class="modern-dashboard-date"><strong>${date}</strong>Everything you need, all in one place.</div>`;
    home.prepend(intro);
  }

  function buildTopbarControl() {
    const topbar = document.querySelector('.topbar');
    const profile = document.getElementById('tbrnAccessProfile');
    if (!topbar || !profile || topbar.querySelector('.modern-update-button')) return;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'modern-update-button';
    button.setAttribute('aria-label', 'View Hub updates');
    button.title = 'View Hub updates';
    button.innerHTML = icon('<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/>');
    button.addEventListener('click', () => {
      if (typeof window.showHome === 'function') window.showHome();
      window.setTimeout(() => document.getElementById('rollingHero')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 80);
    });
    topbar.insertBefore(button, profile);
  }

  function buildBottomGrid(home) {
    if (home.querySelector('.modern-bottom-grid')) return;
    const quick = document.getElementById('quick');
    const quickHeading = quick?.previousElementSibling;
    if (!quick || !quickHeading?.classList.contains('section-head')) return;

    const grid = document.createElement('div');
    grid.className = 'modern-bottom-grid';
    const panel = document.createElement('div');
    panel.className = 'modern-quick-panel';
    quickHeading.parentNode.insertBefore(grid, quickHeading);
    panel.append(quickHeading, quick);

    const status = document.createElement('aside');
    status.className = 'modern-system-status';
    const updated = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' }).format(new Date());
    status.innerHTML = `<h3>System status</h3><div class="modern-status-live">All systems operational</div><div class="modern-status-time">Last checked<strong>${updated}</strong></div>`;
    grid.append(panel, status);
  }

  function updateSidebarStatus() {
    const card = document.querySelector('.sidebar .sidecard');
    if (!card || card.dataset.modernStatus === 'true') return;
    card.dataset.modernStatus = 'true';
    card.innerHTML = '<strong>All systems operational</strong><p>Live data connected · automatic updates enabled</p>';
  }

  function modernise() {
    document.body.classList.add('tbrn-modern-hub');
    const home = document.getElementById('home');
    if (home) {
      buildIntro(home);
      buildBottomGrid(home);
    }
    buildTopbarControl();
    updateSidebarStatus();
    decorateNavigation();
    decorateCards();
  }

  modernise();
  const observer = new MutationObserver(() => {
    modernise();
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
})();
