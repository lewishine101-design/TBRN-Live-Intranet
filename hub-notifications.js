(function () {
  'use strict';

  const SEEN_KEY = 'tbrn-hub-update-notifications-seen-v1';
  let updates = [];
  let panel;
  let button;

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

  function unreadUpdates() {
    const seen = readSeen();
    return updates.filter(update => !seen.has(update.id));
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
    list.innerHTML = updates.length ? updates.map(update => {
      const unread = !seen.has(update.id);
      return `<button type="button" class="hub-notification-item${unread ? ' is-unread' : ''}" data-update-id="${escapeHtml(update.id)}">
        <span class="hub-notification-dot" aria-hidden="true"></span>
        <span><span class="hub-notification-meta"><span class="hub-notification-type">${escapeHtml(update.type)}</span><span class="hub-notification-date">${escapeHtml(update.date)}</span></span>
        <h3>${escapeHtml(update.title)}</h3><p>${escapeHtml(update.message)}</p></span>
      </button>`;
    }).join('') : '<div class="hub-notification-empty">There are no Hub updates to display.</div>';
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
    element.innerHTML = `<div class="hub-notification-head"><div><h2>Hub updates</h2><p>New features, fixes and operational changes</p></div><div class="hub-notification-actions"><button type="button" data-mark-all>Mark all read</button><button type="button" class="hub-notification-close" data-close aria-label="Close updates">×</button></div></div><div class="hub-notification-list"></div>`;
    document.body.appendChild(element);
    element.querySelector('[data-close]').addEventListener('click', closePanel);
    element.querySelector('[data-mark-all]').addEventListener('click', () => {
      writeSeen(new Set(updates.map(update => update.id)));
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
    if (!candidate || candidate.dataset.notificationCentre === 'true') return false;
    button = candidate;
    button.dataset.notificationCentre = 'true';
    button.setAttribute('aria-haspopup', 'true');
    button.setAttribute('aria-controls', 'hubNotificationPanel');
    button.addEventListener('click', togglePanel, true);
    updateButton();
    return true;
  }

  async function loadUpdates() {
    try {
      const response = await fetch(`hub-updates.json?v=${Date.now()}`, { cache: 'no-store' });
      if (!response.ok) throw new Error('Update feed unavailable');
      const payload = await response.json();
      updates = Array.isArray(payload) ? payload.filter(update => update && update.id && update.title) : [];
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
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialise, { once: true });
  else initialise();
})();
