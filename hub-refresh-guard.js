(function(){
  'use strict';

  const VIEW_KEY='tbrnRefreshView';
  const VERSION_KEY='tbrnPublishedVersion';
  let pendingVersion='';
  let pendingReason='';
  let applyTimer=null;

  function visible(id){
    const element=document.getElementById(id);
    return !!element&&!element.classList.contains('hidden')&&getComputedStyle(element).display!=='none';
  }

  function captureCurrentView(){
    let type='home';
    if(visible('adminView'))type='admin';
    else if(visible('categoryView'))type='category';
    else if(visible('documentView'))type='document';
    else if(visible('searchView'))type='search';

    let category=window.__tbrnCurrentCategory||null;
    try{category=window.currentCategory||currentCategory||category}catch(error){}
    const activeNav=document.querySelector('#nav button.active')?.dataset.cat||'';
    const state={
      type,
      category,
      pageId:window.__tbrnCurrentPageId||null,
      pageTitle:window.__tbrnCurrentPageTitle||document.querySelector('#documentView h1,#documentView h2,.document-title')?.textContent?.trim()||null,
      managedTitle:activeNav==='Admin'?(window.__activeManagedDirectoryTitle||null):null,
      search:document.querySelector('#globalSearch,#search')?.value||'',
      scrollY:window.scrollY||0,
      capturedAt:Date.now()
    };
    sessionStorage.setItem(VIEW_KEY,JSON.stringify(state));
    return state;
  }

  function editingIsActive(){
    const focused=document.activeElement;
    const typing=focused&&(focused.matches?.('input,textarea,select')||focused.isContentEditable);
    const openEditor=document.querySelector('.admin-modal.open,.modal.open,[role="dialog"].open,.hub-notification-manager.is-open');
    return !!(typing||openEditor||document.body.classList.contains('tbrn-dev-editing')||document.body.classList.contains('tbrn-dev-reordering'));
  }

  function applyUpdate(){
    clearTimeout(applyTimer);
    if(editingIsActive()){
      applyTimer=setTimeout(applyUpdate,1500);
      return;
    }
    captureCurrentView();
    if(pendingReason==='system'&&pendingVersion)sessionStorage.setItem(VERSION_KEY,pendingVersion);
    sessionStorage.setItem('tbrnUpdatedAfterReload','true');
    const url=new URL(window.location.href);
    url.searchParams.set('_tbrn_update',Date.now().toString());
    window.location.replace(url.toString());
  }

  function queueUpdate(version,reason='system'){
    if(reason==='system'&&version&&sessionStorage.getItem(VERSION_KEY)===version)return;
    pendingVersion=version||pendingVersion;
    pendingReason=reason;
    clearTimeout(applyTimer);
    applyTimer=setTimeout(applyUpdate,500);
  }

  function restoreSearchFallback(){
    let state;
    try{state=JSON.parse(sessionStorage.getItem(VIEW_KEY)||'null')}catch(error){return}
    if(!state)return;
    if(state.type==='search'&&state.search){
      const input=document.querySelector('#globalSearch,#search');
      if(input&&input.value!==state.search){
        input.value=state.search;
        input.dispatchEvent(new Event('input',{bubbles:true}));
      }
    }
    const scroll=Math.max(0,Number(state.scrollY)||0);
    [100,350,900].forEach(delay=>setTimeout(()=>window.scrollTo(0,scroll),delay));
  }

  window.tbrnOfferHubUpdate=queueUpdate;
  window.tbrnCaptureCurrentView=captureCurrentView;
  window.addEventListener('pagehide',captureCurrentView);
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')captureCurrentView()});
  window.addEventListener('load',()=>setTimeout(restoreSearchFallback,950),{once:true});
})();

