(function () {
  'use strict';

  const SEEN_KEY = 'tbrn-hub-update-notifications-seen-v1';
  let updates = [];
  let panel;
  let button;
  let previewAudience = 'admin';

  const escapeHtml = value => String(value ?? '').replace(/[&<>'"]/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  })[character]);

  function readSeen() {
    try {
      const value = JSON.parse(localStorage.getItem(SEEN_KEY) || '[]');
      return new Set(Array.isArray(value) ? value : []);
    } catch (_) {
      return new Set();
    }
  }

  function writeSeen(seen) {
    localStorage.setItem(SEEN_KEY, JSON.stringify([...seen]));
  }

  function isAdmin() {
    const profile = document.getElementById('tbrnAccessProfile');
    const role = document.getElementById('tbrnProfileRole')?.textContent?.trim().toLowerCase() || '';
    return Boolean(window.adminMode || profile?.classList.contains('is-admin') || role.includes('admin'));
  }

  function normaliseAudience(update) {
    return update?.audience === 'admin' ? 'admin' : 'all';
  }

  function visibleUpdates() {
    if (!isAdmin() || previewAudience === 'staff') return updates.filter(update => normaliseAudience(update) === 'all');
    return updates;
  }

  function unreadUpdates() {
    const seen = readSeen();
    return visibleUpdates().filter(update => !seen.has(update.id));
  }

  function updateButton() {
    if (!button) return;
    const count = unreadUpdates().length;
    button.classList.toggle('has-notifications', count > 0);
    button.setAttribute('aria-expanded', panel?.classList.contains('is-open') ? 'true' : 'false');
    button.querySelector('.hub-notification-count')?.remove();
    if (count) button.insertAdjacentHTML('beforeend', `<span class="hub-notification-count" aria-label="${count} unread update${count === 1 ? '' : 's'}">${count > 9 ? '9+' : count}</span>`);
  }

  function render() {
    if (!panel) return;
    const seen = readSeen();
    const list = panel.querySelector('.hub-notification-list');
    const shown = visibleUpdates();
    const admin = isAdmin();
    panel.classList.toggle('is-admin-view', admin);
    const controls = panel.querySelector('.hub-notification-admin-controls');
    if (controls) {
      controls.hidden = !admin;
      const select = controls.querySelector('select');
      if (select) select.value = previewAudience;
    }
    list.innerHTML = shown.length ? shown.map(update => {
      const unread = !seen.has(update.id);
      const restricted = normaliseAudience(update) === 'admin';
      return `<button type="button" class="hub-notification-item${unread ? ' is-unread' : ''}" data-update-id="${escapeHtml(update.id)}">
        <span class="hub-notification-dot" aria-hidden="true"></span>
        <span><span class="hub-notification-meta"><span><span class="hub-notification-type">${escapeHtml(update.type)}</span>${admin ? `<span class="hub-notification-audience ${restricted ? 'is-restricted' : ''}">${restricted ? 'Admins only' : 'All staff'}</span>` : ''}</span><span class="hub-notification-date">${escapeHtml(update.date)}</span></span>
        <h3>${escapeHtml(update.title)}</h3><p>${escapeHtml(update.message)}</p></span>
      </button>`;
    }).join('') : '<div class="hub-notification-empty">There are no notifications available for this audience.</div>';
    updateButton();
  }

  function closePanel() {
    panel?.classList.remove('is-open');
    updateButton();
  }

  function togglePanel(event) {
    event.preventDefault();
    event.stopImmediatePropagation();
    panel.classList.toggle('is-open');
    updateButton();
  }

  function buildPanel() {
    if (document.getElementById('hubNotificationPanel')) return document.getElementById('hubNotificationPanel');
    const element = document.createElement('aside');
    element.id = 'hubNotificationPanel';
    element.className = 'hub-notification-panel';
    element.setAttribute('aria-label', 'Hub updates');
    element.innerHTML = `<div class="hub-notification-head"><div><h2>Hub updates</h2><p>New features, fixes and operational changes</p></div><div class="hub-notification-actions"><button type="button" data-mark-all>Mark all read</button><button type="button" class="hub-notification-close" data-close aria-label="Close updates">×</button></div></div><div class="hub-notification-admin-controls" hidden><label for="hubNotificationAudiencePreview">Admin preview</label><select id="hubNotificationAudiencePreview"><option value="admin">All admin notifications</option><option value="staff">General staff view</option></select><span>Restricted notices never appear for general staff.</span></div><div class="hub-notification-list"></div>`;
    document.body.appendChild(element);
    element.querySelector('[data-close]').addEventListener('click', closePanel);
    element.querySelector('[data-mark-all]').addEventListener('click', () => {
      const seen = readSeen();
      visibleUpdates().forEach(update => seen.add(update.id));
      writeSeen(seen);
      render();
    });
    element.querySelector('#hubNotificationAudiencePreview').addEventListener('change', event => {
      previewAudience = event.target.value === 'staff' ? 'staff' : 'admin';
      render();
    });
    element.querySelector('.hub-notification-list').addEventListener('click', event => {
      const item = event.target.closest('[data-update-id]');
      if (!item) return;
      const seen = readSeen();
      seen.add(item.dataset.updateId);
      writeSeen(seen);
      render();
    });
    document.addEventListener('click', event => {
      if (!element.classList.contains('is-open') || element.contains(event.target) || button?.contains(event.target)) return;
      closePanel();
    });
    document.addEventListener('keydown', event => { if (event.key === 'Escape') closePanel(); });
    return element;
  }

  function connectButton() {
    const candidate = document.querySelector('.modern-update-button');
    if (!candidate) return false;
    button = candidate;
    button.dataset.notificationCentre = 'true';
    button.setAttribute('aria-haspopup', 'true');
    button.setAttribute('aria-controls', 'hubNotificationPanel');
    updateButton();
    return true;
  }

  // The modern Hub can redraw its top bar after initialisation. Listen at the
  // document level so a replacement bell continues to open this panel.
  document.addEventListener('click', event => {
    const candidate = event.target.closest?.('.modern-update-button');
    if (!candidate) return;
    button = candidate;
    button.dataset.notificationCentre = 'true';
    button.setAttribute('aria-haspopup', 'true');
    button.setAttribute('aria-controls', 'hubNotificationPanel');
    togglePanel(event);
  }, true);

  async function loadUpdates() {
    try {
      const response = await fetch(`hub-updates.json?v=${Date.now()}`, { cache: 'no-store' });
      if (!response.ok) throw new Error('Update feed unavailable');
      const payload = await response.json();
      updates = Array.isArray(payload) ? payload.filter(update => update && update.id && update.title).map(update => ({ ...update, audience: normaliseAudience(update) })) : [];
    } catch (_) {
      updates = [];
    }
    render();
  }

  function initialise() {
    panel = buildPanel();
    connectButton();
    loadUpdates();
    const observer = new MutationObserver(() => connectButton());
    observer.observe(document.documentElement, { childList: true, subtree: true });
    const profile = document.getElementById('tbrnAccessProfile');
    if (profile) new MutationObserver(() => { previewAudience = isAdmin() ? previewAudience : 'staff'; render(); }).observe(profile, { attributes: true, childList: true, subtree: true });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialise, { once: true });
  else initialise();
})();
