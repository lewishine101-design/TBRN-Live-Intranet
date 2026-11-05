(function () {
  'use strict';

  const SEEN_KEY = 'tbrn-hub-update-notifications-seen-v1';
  const TYPES = ['Operational', 'System update', 'Urgent', 'New feature', 'Design update', 'Administration', 'Enrique', 'Seasonal update'];
  let updates = [], defaults = [], panel, button, manager, notificationRef, unsubscribeNotifications;
  let previewAudience = 'admin', editingId = null;

  const escapeHtml = value => String(value ?? '').replace(/[&<>'"]/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  })[character]);
  const timestamp = value => { const time = value ? Date.parse(value) : NaN; return Number.isFinite(time) ? time : null; };
  const normaliseAudience = update => update?.audience === 'admin' ? 'admin' : 'all';
  const dateLabel = update => timestamp(update.publishAt)
    ? new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(update.publishAt))
    : update.date || '';
  const readSeen = () => {
    try { const value = JSON.parse(localStorage.getItem(SEEN_KEY) || '[]'); return new Set(Array.isArray(value) ? value : []); }
    catch (_) { return new Set(); }
  };
  const writeSeen = seen => localStorage.setItem(SEEN_KEY, JSON.stringify([...seen]));

  function isAdmin() {
    const profile = document.getElementById('tbrnAccessProfile');
    const role = document.getElementById('tbrnProfileRole')?.textContent?.trim().toLowerCase() || '';
    return Boolean(window.adminMode || profile?.classList.contains('is-admin') || role.includes('admin') || role.includes('developer'));
  }

  function notificationState(update, now = Date.now()) {
    if (update.archived) return 'archived';
    const publish = timestamp(update.publishAt), expiry = timestamp(update.expiresAt);
    if (publish && publish > now) return 'scheduled';
    if (expiry && expiry <= now) return 'expired';
    return 'active';
  }

  function visibleUpdates() {
    const active = updates.filter(update => notificationState(update) === 'active');
    return (!isAdmin() || previewAudience === 'staff') ? active.filter(update => normaliseAudience(update) === 'all') : active;
  }

  function updateButton() {
    if (!button) return;
    const count = visibleUpdates().filter(update => !readSeen().has(update.id)).length;
    button.classList.toggle('has-notifications', count > 0);
    button.setAttribute('aria-expanded', panel?.classList.contains('is-open') ? 'true' : 'false');
    const current = button.querySelector('.hub-notification-count');
    if (!count) current?.remove();
    else if (current) current.textContent = count > 9 ? '9+' : String(count);
    else button.insertAdjacentHTML('beforeend', '<span class="hub-notification-count" aria-label="' + count + ' unread updates">' + (count > 9 ? '9+' : count) + '</span>');
  }

  function render() {
    if (!panel) return;
    const seen = readSeen(), shown = visibleUpdates(), admin = isAdmin();
    const controls = panel.querySelector('.hub-notification-admin-controls');
    controls.hidden = !admin;
    controls.querySelector('select').value = previewAudience;
    panel.querySelector('.hub-notification-list').innerHTML = shown.length ? shown.map(update => {
      const restricted = normaliseAudience(update) === 'admin';
      return '<button type="button" class="hub-notification-item' + (!seen.has(update.id) ? ' is-unread' : '') + (String(update.type).toLowerCase() === 'urgent' ? ' is-urgent' : '') + '" data-update-id="' + escapeHtml(update.id) + '">' +
        '<span class="hub-notification-dot" aria-hidden="true"></span><span><span class="hub-notification-meta"><span><span class="hub-notification-type">' + escapeHtml(update.type || 'Update') + '</span>' +
        (admin ? '<span class="hub-notification-audience ' + (restricted ? 'is-restricted' : '') + '">' + (restricted ? 'Admins only' : 'All staff') + '</span>' : '') +
        '</span><span class="hub-notification-date">' + escapeHtml(dateLabel(update)) + '</span></span><h3>' + escapeHtml(update.title) + '</h3><p>' + escapeHtml(update.message) + '</p></span></button>';
    }).join('') : '<div class="hub-notification-empty">There are no notifications available for this audience.</div>';
    updateButton();
  }

  function closePanel() { panel?.classList.remove('is-open'); updateButton(); }
  function togglePanel(event) {
    event.preventDefault(); event.stopImmediatePropagation();
    panel.classList.toggle('is-open'); render();
  }

  function buildPanel() {
    const existing = document.getElementById('hubNotificationPanel');
    if (existing) return existing;
    const element = document.createElement('aside');
    element.id = 'hubNotificationPanel';
    element.className = 'hub-notification-panel';
    element.setAttribute('aria-label', 'Hub updates');
    element.innerHTML = '<div class="hub-notification-head"><div><h2>Hub updates</h2><p>New features, fixes and operational changes</p></div><div class="hub-notification-actions"><button type="button" data-mark-all>Mark all read</button><button type="button" class="hub-notification-close" data-close aria-label="Close updates">×</button></div></div>' +
      '<div class="hub-notification-admin-controls" hidden><label for="hubNotificationAudiencePreview">Admin preview</label><div class="hub-notification-admin-row"><select id="hubNotificationAudiencePreview"><option value="admin">All admin notifications</option><option value="staff">General staff view</option></select><button type="button" data-manage-notifications>Manage</button></div><span>Restricted notices never appear for general staff.</span></div><div class="hub-notification-list"></div>';
    document.body.appendChild(element);
    element.querySelector('[data-close]').onclick = closePanel;
    element.querySelector('[data-mark-all]').onclick = () => {
      const seen = readSeen(); visibleUpdates().forEach(update => seen.add(update.id)); writeSeen(seen); render();
    };
    element.querySelector('[data-manage-notifications]').onclick = openManager;
    element.querySelector('select').onchange = event => { previewAudience = event.target.value === 'staff' ? 'staff' : 'admin'; render(); };
    element.querySelector('.hub-notification-list').onclick = event => {
      const item = event.target.closest('[data-update-id]'); if (!item) return;
      const seen = readSeen(); seen.add(item.dataset.updateId); writeSeen(seen); render();
    };
    document.addEventListener('click', event => {
      if (element.classList.contains('is-open') && !element.contains(event.target) && !button?.contains(event.target)) closePanel();
    });
    return element;
  }

  function localDateTime(value) {
    const time = timestamp(value); if (!time) return '';
    return new Date(time - new Date(time).getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  }
  const formValue = id => manager.querySelector('#' + id)?.value?.trim() || '';
  const formDate = id => { const value = formValue(id); return value ? new Date(value).toISOString() : ''; };
  function managerStatus(message, error = false) {
    const status = manager?.querySelector('[data-manager-status]'); if (!status) return;
    status.textContent = message; status.classList.toggle('is-error', error);
  }

  function renderManagerList() {
    if (!manager) return;
    const ordered = [...updates].sort((a, b) => (timestamp(b.publishAt) || 0) - (timestamp(a.publishAt) || 0));
    manager.querySelector('[data-notification-manager-list]').innerHTML = ordered.length ? ordered.map(update => {
      const state = notificationState(update), audience = normaliseAudience(update) === 'admin' ? 'Admins only' : 'All staff';
      return '<article class="hub-manager-item is-' + state + '" data-manager-id="' + escapeHtml(update.id) + '"><div class="hub-manager-item-top"><div><span class="hub-manager-state">' + state + '</span><span class="hub-manager-category">' + escapeHtml(update.type || 'Update') + '</span></div><span class="hub-manager-audience">' + audience + '</span></div>' +
        '<h3>' + escapeHtml(update.title) + '</h3><p>' + escapeHtml(update.message) + '</p><div class="hub-manager-dates"><span>Publish: ' + escapeHtml(update.publishAt ? new Date(update.publishAt).toLocaleString('en-GB') : dateLabel(update) || 'Immediately') + '</span><span>Expiry: ' + escapeHtml(update.expiresAt ? new Date(update.expiresAt).toLocaleString('en-GB') : 'No expiry') + '</span></div>' +
        '<div class="hub-manager-item-actions"><button type="button" data-edit-notification>Edit</button><button type="button" data-archive-notification>' + (update.archived ? 'Restore' : 'Archive') + '</button><button type="button" class="danger" data-delete-notification>Remove</button></div></article>';
    }).join('') : '<div class="hub-manager-empty">No notifications have been created.</div>';
  }

  function auditDate(value, fallback = '—') {
    const time = timestamp(value);
    return time ? new Date(time).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' }) : fallback;
  }

  function auditEffectiveDate(update) {
    return update.publishAt || update.createdAt || update.updatedAt || update.date || '';
  }

  function generateAuditReport() {
    if (!isAdmin()) return;
    const generatedAt = new Date();
    const ordered = [...updates].sort((a, b) => (timestamp(auditEffectiveDate(b)) || 0) - (timestamp(auditEffectiveDate(a)) || 0));
    const totals = ordered.reduce((summary, update) => {
      const state = notificationState(update);
      summary[state] = (summary[state] || 0) + 1;
      return summary;
    }, { active: 0, scheduled: 0, expired: 0, archived: 0 });
    const rows = ordered.map((update, index) => {
      const state = notificationState(update);
      const audience = normaliseAudience(update) === 'admin' ? 'Admins only' : 'All staff';
      const effective = update.publishAt ? auditDate(update.publishAt) : (update.date || auditDate(update.createdAt || update.updatedAt, 'Immediately'));
      return '<tr><td>' + (index + 1) + '</td><td><strong>' + escapeHtml(update.title) + '</strong><span>' + escapeHtml(update.message) + '</span></td><td>' + escapeHtml(update.type || 'Update') + '</td><td>' + audience + '</td><td>' + escapeHtml(effective) + '</td><td>' + escapeHtml(auditDate(update.expiresAt, 'No expiry')) + '</td><td><span class="status status-' + state + '">' + state + '</span></td><td>' + escapeHtml(auditDate(update.updatedAt, '—')) + '</td></tr>';
    }).join('');
    const report = '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>TBRN Notification Audit Report</title><style>' +
      '@page{size:A4 landscape;margin:12mm}*{box-sizing:border-box}body{margin:0;color:#17382d;font:12px/1.45 Arial,sans-serif}header{display:flex;justify-content:space-between;gap:24px;padding-bottom:16px;border-bottom:3px solid #0b7655}h1{margin:3px 0 2px;font-size:25px}.brand{color:#0b7655;font-size:14px;font-weight:900}.meta{text-align:right;color:#5f756c}.summary{display:flex;gap:8px;margin:16px 0}.summary span{padding:7px 10px;border-radius:8px;background:#eef5f2;font-weight:700}table{width:100%;border-collapse:collapse;table-layout:fixed}th{padding:8px;background:#0b5d47;color:white;text-align:left;font-size:9px;text-transform:uppercase;letter-spacing:.04em}td{padding:8px;border:1px solid #d8e2de;vertical-align:top;overflow-wrap:anywhere}tbody tr:nth-child(even){background:#f6f8f7}td:nth-child(1){width:3%}td:nth-child(2){width:27%}td:nth-child(3){width:10%}td:nth-child(4){width:9%}td:nth-child(5),td:nth-child(6),td:nth-child(8){width:13%}td:nth-child(7){width:8%}td strong,td span{display:block}.status{display:inline-block;padding:3px 6px;border-radius:99px;background:#e5eee9;font-size:9px;font-weight:800;text-transform:uppercase}.status-active{background:#dff4e8;color:#087044}.status-scheduled{background:#e4effc;color:#235f9f}.status-expired,.status-archived{background:#ecefed;color:#64716b}footer{margin-top:14px;padding-top:9px;border-top:1px solid #cfdad5;color:#71837b;font-size:9px}@media print{.no-print{display:none}}</style></head><body>' +
      '<header><div><div class="brand">TBRN LIVE</div><h1>Notification Audit Report</h1><div>Complete notification register</div></div><div class="meta"><strong>Generated</strong><br>' + escapeHtml(auditDate(generatedAt.toISOString())) + '<br><br><strong>Total records</strong><br>' + ordered.length + '</div></header>' +
      '<div class="summary"><span>Active: ' + totals.active + '</span><span>Scheduled: ' + totals.scheduled + '</span><span>Expired: ' + totals.expired + '</span><span>Archived: ' + totals.archived + '</span></div>' +
      '<table><thead><tr><th>#</th><th>Notification</th><th>Category</th><th>Audience</th><th>Effective from</th><th>Expiry</th><th>Status</th><th>Last amended</th></tr></thead><tbody>' + (rows || '<tr><td colspan="8">No notifications have been recorded.</td></tr>') + '</tbody></table>' +
      '<footer>Generated from the TBRN Live Admin Notification Manager. This register includes active, scheduled, expired and archived notifications held by the Hub at the time of generation.</footer></body></html>';
    const blob = new Blob([report], { type: 'text/html;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'TBRN_Notification_Audit_' + generatedAt.toISOString().slice(0, 10) + '.html';
    document.body.appendChild(link); link.click(); link.remove();
    window.setTimeout(() => URL.revokeObjectURL(link.href), 1000);
    managerStatus('Audit report generated. Open it to print or save as PDF.');
  }

  function resetForm(update = null) {
    editingId = update?.id || null;
    manager.querySelector('[data-manager-form-title]').textContent = update ? 'Edit notification' : 'Create notification';
    manager.querySelector('#hubManagerTitle').value = update?.title || '';
    manager.querySelector('#hubManagerMessage').value = update?.message || '';
    manager.querySelector('#hubManagerType').value = TYPES.includes(update?.type) ? update.type : 'Operational';
    manager.querySelector('#hubManagerAudience').value = normaliseAudience(update || {});
    manager.querySelector('#hubManagerPublish').value = localDateTime(update?.publishAt);
    manager.querySelector('#hubManagerExpiry').value = localDateTime(update?.expiresAt);
    manager.querySelector('[data-save-notification]').textContent = update ? 'Save changes' : 'Publish notification';
    manager.querySelector('.hub-manager-form').hidden = false;
    managerStatus('');
    manager.querySelector('#hubManagerTitle').focus();
  }

  function buildManager() {
    const existing = document.getElementById('hubNotificationManager');
    if (existing) return existing;
    const element = document.createElement('div');
    element.id = 'hubNotificationManager';
    element.className = 'hub-notification-manager';
    element.innerHTML = '<section class="hub-manager-shell" role="dialog" aria-modal="true" aria-labelledby="hubManagerHeading"><header><div><span class="hub-manager-kicker">Admin control</span><h2 id="hubManagerHeading">Notification Manager</h2><p>Create, schedule and control what staff can see.</p></div><button type="button" data-close-manager aria-label="Close Notification Manager">×</button></header>' +
      '<div class="hub-manager-toolbar"><button type="button" class="primary" data-new-notification>+ New notification</button><button type="button" data-preview-staff>Preview general staff view</button><button type="button" data-generate-audit>Generate audit report</button><span data-manager-status></span></div>' +
      '<div class="hub-manager-body"><div class="hub-manager-list" data-notification-manager-list></div><form class="hub-manager-form" hidden><div class="hub-manager-form-head"><h3 data-manager-form-title>Create notification</h3><button type="button" data-cancel-form>Cancel</button></div>' +
      '<label>Title<input id="hubManagerTitle" maxlength="90" required></label><label>Message<textarea id="hubManagerMessage" maxlength="400" rows="5" required></textarea></label><div class="hub-manager-grid"><label>Category<select id="hubManagerType">' + TYPES.map(type => '<option>' + escapeHtml(type) + '</option>').join('') + '</select></label><label>Audience<select id="hubManagerAudience"><option value="all">All staff</option><option value="admin">Admins only</option></select></label><label>Publish date and time<input id="hubManagerPublish" type="datetime-local"></label><label>Expiry date and time<input id="hubManagerExpiry" type="datetime-local"></label></div><p class="hub-manager-help">Leave publish blank to show immediately. Leave expiry blank to keep it visible until archived.</p><button type="submit" class="hub-manager-save" data-save-notification>Publish notification</button></form></div></section>';
    document.body.appendChild(element);
    element.querySelector('[data-close-manager]').onclick = closeManager;
    element.querySelector('[data-new-notification]').onclick = () => resetForm();
    element.querySelector('[data-generate-audit]').onclick = generateAuditReport;
    element.querySelector('[data-cancel-form]').onclick = () => { element.querySelector('.hub-manager-form').hidden = true; editingId = null; };
    element.querySelector('[data-preview-staff]').onclick = () => { previewAudience = 'staff'; closeManager(); panel.classList.add('is-open'); render(); };
    element.querySelector('.hub-manager-form').onsubmit = saveForm;
    element.querySelector('[data-notification-manager-list]').onclick = handleManagerAction;
    return element;
  }

  function openManager() {
    if (!isAdmin()) return;
    manager = buildManager(); closePanel(); manager.classList.add('is-open');
    manager.querySelector('.hub-manager-form').hidden = true; editingId = null; renderManagerList();
    managerStatus(notificationRef ? 'Live data connected' : 'Connecting to live data…');
  }
  function closeManager() { manager?.classList.remove('is-open'); }

  async function saveForm(event) {
    event.preventDefault(); if (!isAdmin()) return;
    const title = formValue('hubManagerTitle'), message = formValue('hubManagerMessage');
    const publishAt = formDate('hubManagerPublish'), expiresAt = formDate('hubManagerExpiry');
    if (!title || !message) return managerStatus('Add a title and message.', true);
    if (publishAt && expiresAt && Date.parse(expiresAt) <= Date.parse(publishAt)) return managerStatus('Expiry must be after the publish date.', true);
    const existing = updates.find(update => update.id === editingId);
    const next = {
      ...(existing || {}),
      id: existing?.id || 'notice-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7),
      title, message, type: formValue('hubManagerType') || 'Operational',
      audience: formValue('hubManagerAudience') === 'admin' ? 'admin' : 'all',
      publishAt, expiresAt,
      date: dateLabel({ publishAt }) || new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date()),
      archived: existing?.archived || false,
      createdAt: existing?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const nextUpdates = existing ? updates.map(update => update.id === existing.id ? next : update) : [next, ...updates];
    managerStatus('Saving…');
    try {
      await persistUpdates(nextUpdates);
      manager.querySelector('.hub-manager-form').hidden = true; editingId = null;
      managerStatus('Notification saved and shared live.');
    } catch (_) { managerStatus('Unable to save to the live Hub. Please try again.', true); }
  }

  async function handleManagerAction(event) {
    const item = event.target.closest('[data-manager-id]'); if (!item || !isAdmin()) return;
    const update = updates.find(entry => entry.id === item.dataset.managerId); if (!update) return;
    if (event.target.closest('[data-edit-notification]')) return resetForm(update);
    if (event.target.closest('[data-archive-notification]')) {
      managerStatus(update.archived ? 'Restoring…' : 'Archiving…');
      try { await persistUpdates(updates.map(entry => entry.id === update.id ? { ...entry, archived: !entry.archived, updatedAt: new Date().toISOString() } : entry)); }
      catch (_) { managerStatus('Unable to update the live notification.', true); }
    }
    if (event.target.closest('[data-delete-notification]')) {
      if (!window.confirm('Remove “' + update.title + '”? This cannot be undone.')) return;
      managerStatus('Removing…');
      try { await persistUpdates(updates.filter(entry => entry.id !== update.id)); }
      catch (_) { managerStatus('Unable to remove the live notification.', true); }
    }
  }

  async function firebaseReference() {
    if (notificationRef) return notificationRef;
    for (let attempt = 0; attempt < 40; attempt += 1) {
      if (window.firebase?.apps?.length && window.firebase.firestore && window.firebase.auth) break;
      await new Promise(resolve => window.setTimeout(resolve, 250));
    }
    if (!window.firebase?.apps?.length) throw new Error('Firebase unavailable');
    if (!window.firebase.auth().currentUser) await window.firebase.auth().signInAnonymously();
    notificationRef = window.firebase.firestore().collection('tbrnSharedState').doc('state');
    return notificationRef;
  }

  async function persistUpdates(nextUpdates) {
    const ref = await firebaseReference();
    await ref.set({ hubNotifications: nextUpdates, hubNotificationsUpdatedAt: window.firebase.firestore.FieldValue.serverTimestamp() }, { merge: true });
  }

  async function connectLiveUpdates() {
    try {
      const ref = await firebaseReference();
      unsubscribeNotifications?.();
      unsubscribeNotifications = ref.onSnapshot(snapshot => {
        const live = snapshot.data()?.hubNotifications;
        updates = Array.isArray(live) ? live : defaults;
        render(); renderManagerList();
        if (manager?.classList.contains('is-open')) managerStatus('Live data connected');
      }, () => managerStatus('Live notification connection interrupted.', true));
    } catch (_) { managerStatus('Live notifications are temporarily unavailable.', true); }
  }

  function connectButton() {
    const candidate = document.querySelector('.modern-update-button'); if (!candidate) return false;
    if (candidate === button && candidate.dataset.notificationCentre === 'true') return true;
    button = candidate; button.dataset.notificationCentre = 'true';
    button.setAttribute('aria-haspopup', 'true'); button.setAttribute('aria-controls', 'hubNotificationPanel');
    updateButton(); return true;
  }

  function openWelcomeAccessPrompt(event) {
    if (!event.target.closest?.('#tbrnEnter')) return;
    event.preventDefault(); event.stopImmediatePropagation();
    const overlay = document.getElementById('tbrnAccessPinOverlay'), input = document.getElementById('tbrnAccessPinInput'), error = document.getElementById('tbrnAccessPinError');
    if (overlay && input) {
      if (error) error.textContent = ''; input.value = ''; overlay.classList.add('is-open');
      window.setTimeout(() => input.focus(), 60); return;
    }
    sessionStorage.setItem('tbrnWelcomePassed', 'true');
    const welcome = document.getElementById('tbrnWelcome'); welcome?.classList.add('is-leaving');
    document.body.classList.remove('tbrn-welcome-open'); window.setTimeout(() => welcome?.remove(), 700);
  }

  document.addEventListener('click', openWelcomeAccessPrompt, true);
  document.addEventListener('keydown', event => {
    if ((event.key === 'Enter' || event.key === ' ') && event.target.closest?.('#tbrnEnter')) openWelcomeAccessPrompt(event);
  }, true);
  document.addEventListener('click', event => {
    const candidate = event.target.closest?.('.modern-update-button'); if (!candidate) return;
    button = candidate; button.dataset.notificationCentre = 'true';
    button.setAttribute('aria-haspopup', 'true'); button.setAttribute('aria-controls', 'hubNotificationPanel');
    togglePanel(event);
  }, true);
  document.addEventListener('keydown', event => { if (event.key === 'Escape') { closePanel(); closeManager(); } });

  async function loadUpdates() {
    try {
      const response = await fetch('hub-updates.json?v=' + Date.now(), { cache: 'no-store' });
      const payload = response.ok ? await response.json() : [];
      defaults = Array.isArray(payload) ? payload.filter(update => update?.id && update?.title).map(update => ({ ...update, audience: normaliseAudience(update) })) : [];
    } catch (_) { defaults = []; }
    updates = defaults; render(); connectLiveUpdates();
  }

  function initialise() {
    panel = buildPanel(); manager = buildManager(); connectButton(); loadUpdates();
    const observer = new MutationObserver(() => connectButton());
    observer.observe(document.documentElement, { childList: true, subtree: true });
    const profile = document.getElementById('tbrnAccessProfile');
    if (profile) new MutationObserver(() => { previewAudience = isAdmin() ? previewAudience : 'staff'; render(); }).observe(profile, { attributes: true, childList: true, subtree: true });
    window.setInterval(render, 60000);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialise, { once: true });
  else initialise();
})();
