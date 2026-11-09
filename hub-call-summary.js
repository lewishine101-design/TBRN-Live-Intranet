(function () {
  'use strict';

  const TITLE = 'TBRN Call Summary';
  const CATEGORY = 'Processes';
  const FILE = 'tbrn-call-summary.html?v=2';
  const data = typeof DATA !== 'undefined' ? DATA : window.DATA;
  if (!Array.isArray(data)) return;

  if (!data.some(item => item?.title === TITLE)) {
    data.push({
      title: TITLE,
      category: CATEGORY,
      html: 'Initial call information and structured claim note generator. Record caller details, incident information, vulnerability, hazards, photographs, VAT status, contractor appointment preferences and next steps. Generate, review, copy or print the completed call summary.',
      toolFile: FILE
    });
  }

  const resourceIndex = () => data.findIndex(item => item?.title === TITLE);
  const processTotal = () => data.filter(item => item?.category === CATEGORY).length;

  function refreshCounts() {
    const count = processTotal();
    const processNav = document.querySelector('#nav button[data-cat="Processes"] .badge');
    if (processNav) processNav.textContent = String(count);
    const processStat = document.getElementById('processCount');
    if (processStat) processStat.textContent = String(data.filter(item => item?.category === 'Processes' || item?.category === 'Knowledge Base').length);
    const documentStat = document.getElementById('docCount');
    if (documentStat) documentStat.textContent = String(data.length);
    document.querySelectorAll('#categories .catcard').forEach(card => {
      if (card.querySelector('h4')?.textContent?.trim() !== CATEGORY) return;
      const pill = card.querySelector('.smallpill');
      if (pill) pill.textContent = count + ' resource' + (count === 1 ? '' : 's');
    });
  }

  function restoreDocumentControls() {
    document.getElementById('documentView')?.classList.remove('tbrn-call-summary-open');
    document.getElementById('tbrnCallSummaryInstall')?.remove();
    document.getElementById('tbrnCallSummaryPopout')?.remove();
    const printButton = document.querySelector('#documentView .head-actions .primary');
    if (printButton) {
      printButton.textContent = 'Print';
      printButton.onclick = () => window.print();
    }
  }

  function openCallSummaryApp(install) {
    const width = Math.min(1450, Math.max(900, window.screen.availWidth - 100));
    const height = Math.min(1000, Math.max(700, window.screen.availHeight - 100));
    const left = Math.max(0, Math.round((window.screen.availWidth - width) / 2));
    const top = Math.max(0, Math.round((window.screen.availHeight - height) / 2));
    const url = 'tbrn-call-summary.html' + (install ? '?install=1' : '?standalone=1');
    window.open(url, 'tbrnCallSummaryApp', `popup=yes,width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`);
  }

  function addAppControls() {
    const actions = document.querySelector('#documentView .head-actions');
    const printButton = actions?.querySelector('.primary');
    if (!actions || !printButton) return;

    if (!document.getElementById('tbrnCallSummaryInstall')) {
      const install = document.createElement('button');
      install.id = 'tbrnCallSummaryInstall';
      install.className = 'action tbrn-call-summary-install';
      install.type = 'button';
      install.textContent = 'Install app';
      install.title = 'Install Initial Call Summary as an app';
      install.onclick = () => openCallSummaryApp(true);
      actions.insertBefore(install, printButton);

      const popout = document.createElement('button');
      popout.id = 'tbrnCallSummaryPopout';
      popout.className = 'action';
      popout.type = 'button';
      popout.textContent = 'Open separately';
      popout.title = 'Open Initial Call Summary in its own window';
      popout.onclick = () => openCallSummaryApp(false);
      actions.insertBefore(popout, printButton);
    }
  }

  function openCallSummary() {
    if (typeof hideAll !== 'function') return;
    if (typeof currentCategory !== 'undefined') currentCategory = CATEGORY;
    window.__tbrnCurrentCategory = CATEGORY;
    window.__tbrnCurrentPageTitle = TITLE;
    window.__tbrnCurrentPageId = 'tbrn-call-summary';
    hideAll();

    const view = document.getElementById('documentView');
    view?.classList.remove('hidden');
    view?.classList.add('tbrn-call-summary-open');
    const title = document.getElementById('docTitle');
    const meta = document.getElementById('docMeta');
    const icon = document.getElementById('docIcon');
    const canvas = document.getElementById('canvas');
    if (title) title.textContent = TITLE;
    if (meta) meta.textContent = 'Processes · Initial call note generator';
    if (icon) icon.textContent = '☎';
    if (canvas) canvas.innerHTML = '<div class="tbrn-call-summary-shell"><iframe id="tbrnCallSummaryFrame" src="' + FILE + '" title="TBRN Call Summary"></iframe></div>';

    const printButton = document.querySelector('#documentView .head-actions .primary');
    if (printButton) {
      printButton.textContent = 'Print summary';
      printButton.onclick = () => document.getElementById('tbrnCallSummaryFrame')?.contentWindow?.print();
    }
    addAppControls();
    if (typeof setNav === 'function') setNav(CATEGORY);
    window.scrollTo(0, 0);
    window.setTimeout(() => window.tbrnApplyInlineHeader?.(), 30);
  }

  const existingOpenDoc = window.openDoc;
  window.openDoc = function (index) {
    const item = data[index];
    if (item?.title === TITLE) return openCallSummary();
    restoreDocumentControls();
    return existingOpenDoc?.apply(this, arguments);
  };

  const style = document.createElement('style');
  style.textContent =
    '#documentView.tbrn-call-summary-open .workspace{overflow:visible}' +
    '#documentView.tbrn-call-summary-open .workspace-bar{display:none}' +
    '#documentView.tbrn-call-summary-open .document{padding:0;overflow:hidden;background:#f2f5f8}' +
    '#documentView.tbrn-call-summary-open #canvas{max-width:none;padding:0}' +
    '.tbrn-call-summary-shell{width:100%;min-height:760px;background:#f2f5f8}' +
    '.tbrn-call-summary-shell iframe{display:block;width:100%;height:max(760px,calc(100vh - 185px));border:0;background:#f2f5f8}' +
    '.tbrn-call-summary-install{background:#0b695d!important;border-color:#0b695d!important;color:#fff!important}' +
    '@media(max-width:760px){.tbrn-call-summary-shell,.tbrn-call-summary-shell iframe{min-height:820px;height:calc(100vh - 150px)}}';
  document.head.appendChild(style);

  refreshCounts();
  window.tbrnOpenCallSummary = openCallSummary;
  window.tbrnCallSummaryResourceIndex = resourceIndex;
})();
