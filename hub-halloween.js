(function () {
  'use strict';

  document.body.classList.add('tbrn-halloween-preview');

  function themeEnrique() {
    const frame = document.getElementById('enriqueAssistantFrame');
    if (!frame) return;
    const vampireAsset = new URL('assets/halloween/enrique-vampire.webp', window.location.href).href;

    const apply = () => {
      try {
        const doc = frame.contentDocument;
        if (!doc || doc.getElementById('tbrn-halloween-enrique-style-v2')) return;
        const style = doc.createElement('style');
        style.id = 'tbrn-halloween-enrique-style-v2';
        style.textContent = `
          .launcher {
            min-width: 192px;
            min-height: 70px;
            padding-left: 72px;
            overflow: visible;
            background: linear-gradient(135deg, #261934, #653c70 58%, #9a4a25);
            box-shadow: 0 18px 45px rgba(35, 20, 42, .38);
          }
          .launcher::before {
            content: "🦇";
            position: absolute;
            left: 19px;
            top: -19px;
            font-size: 20px;
            transform: rotate(-12deg);
            filter: drop-shadow(0 4px 4px rgba(0,0,0,.25));
          }
          .launcher-mark,
          .chat-head .avatar {
            border: 2px solid #ec8b3d;
            background: linear-gradient(145deg, #f7e7c4, #d8b9e3);
          }
          .launcher-mark {
            position: absolute;
            left: 7px;
            bottom: 5px;
            width: 68px;
            height: 82px;
            padding: 0;
            border: 0;
            border-radius: 0;
            background: transparent;
            overflow: visible;
          }
          .launcher-mark img {
            display: block;
            width: 100%;
            height: 100%;
            object-fit: contain;
            filter: drop-shadow(0 7px 6px rgba(0,0,0,.28));
          }
          .chat-head .avatar {
            background-image: url("${vampireAsset}");
            background-position: center 11%;
            background-size: 50px auto;
            background-repeat: no-repeat;
          }
          .chat-head .avatar svg { opacity: 0; }
          .chat-head {
            background: linear-gradient(135deg, #20152e, #54335f 62%, #743b25);
          }
          .quick:hover,
          .quick:focus-visible {
            border-color: #dc7a36;
            background: #fff3e9;
          }
          .send,
          .enrique-song-icon {
            background: #593565;
          }
        `;
        doc.head.appendChild(style);
        const launcherMark = doc.querySelector('.launcher-mark');
        if (launcherMark) launcherMark.innerHTML = `<img src="${vampireAsset}" alt="">`;
      } catch (error) {
        console.warn('Halloween Enrique styling unavailable', error);
      }
    };

    frame.addEventListener('load', apply, { once: true });
    apply();
  }

  function themeWanderer() {
    const wanderer = document.getElementById('enriqueWanderer');
    if (!wanderer || wanderer.dataset.halloweenVampire === 'true') return;
    wanderer.dataset.halloweenVampire = 'true';
    const image = document.createElement('img');
    image.src = new URL('assets/halloween/enrique-vampire.webp', window.location.href).href;
    image.alt = '';
    wanderer.replaceChildren(image);
  }

  themeEnrique();
  themeWanderer();

  const observer = new MutationObserver(() => {
    themeEnrique();
    themeWanderer();
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
})();
