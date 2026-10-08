(function () {
  'use strict';

  document.body.classList.add('tbrn-halloween-preview');

  function addPreviewBadge() {
    if (document.querySelector('.tbrn-halloween-preview-badge')) return;
    const badge = document.createElement('div');
    badge.className = 'tbrn-halloween-preview-badge';
    badge.setAttribute('aria-hidden', 'true');
    badge.textContent = '🎃 Halloween preview';
    document.body.appendChild(badge);
  }

  function themeEnrique() {
    const frame = document.getElementById('enriqueAssistantFrame');
    if (!frame) return;

    const apply = () => {
      try {
        const doc = frame.contentDocument;
        if (!doc || doc.getElementById('tbrn-halloween-enrique-style')) return;
        const style = doc.createElement('style');
        style.id = 'tbrn-halloween-enrique-style';
        style.textContent = `
          .launcher {
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
      } catch (error) {
        console.warn('Halloween Enrique styling unavailable', error);
      }
    };

    frame.addEventListener('load', apply, { once: true });
    apply();
  }

  addPreviewBadge();
  themeEnrique();

  const observer = new MutationObserver(themeEnrique);
  observer.observe(document.documentElement, { childList: true, subtree: true });
})();
