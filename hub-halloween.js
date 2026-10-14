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

  function startCardGhosts() {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let ghostTimer = 0;
    let activeGhost = null;

    const randomBetween = (minimum, maximum) =>
      Math.floor(Math.random() * (maximum - minimum + 1)) + minimum;

    const removeGhost = () => {
      if (!activeGhost) return;
      activeGhost.ghost.remove();
      activeGhost.card.classList.remove('tbrn-ghost-card');
      activeGhost.stage.classList.remove('tbrn-ghost-stage');
      activeGhost = null;
    };

    const homeIsVisible = () => {
      const home = document.getElementById('home');
      return Boolean(
        document.body.classList.contains('tbrn-halloween-preview') &&
        home &&
        !home.classList.contains('hidden') &&
        document.visibilityState === 'visible'
      );
    };

    const scheduleGhost = (firstAppearance) => {
      window.clearTimeout(ghostTimer);
      if (reduceMotion.matches) return;
      const delay = firstAppearance ? randomBetween(8000, 14000) : randomBetween(35000, 80000);
      ghostTimer = window.setTimeout(showGhost, delay);
    };

    const showGhost = () => {
      removeGhost();

      if (!homeIsVisible()) {
        scheduleGhost(true);
        return;
      }

      const cards = Array.from(document.querySelectorAll(
        '#home #categories .catcard, #home #quick .doccard, #home .stats .stat'
      )).filter((card) => {
        const rect = card.getBoundingClientRect();
        return rect.width >= 120 && rect.height >= 70 && rect.bottom > 0 && rect.top < window.innerHeight;
      });

      if (!cards.length) {
        scheduleGhost(true);
        return;
      }

      const card = cards[randomBetween(0, cards.length - 1)];
      const stage = card.parentElement;
      if (!stage) {
        scheduleGhost(false);
        return;
      }

      const ghost = document.createElement('span');
      const side = Math.random() > .5 ? 'right' : 'left';
      const variant = randomBetween(1, 3);
      ghost.className = `tbrn-card-ghost tbrn-card-ghost--${side} tbrn-card-ghost--${variant}`;
      ghost.setAttribute('aria-hidden', 'true');
      ghost.innerHTML = '<span class="tbrn-card-ghost__eye"></span><span class="tbrn-card-ghost__eye"></span><span class="tbrn-card-ghost__mouth"></span>';

      const ghostWidth = 58;
      const inset = Math.min(30, Math.max(10, card.offsetWidth * .13));
      const left = side === 'right'
        ? card.offsetLeft + card.offsetWidth - ghostWidth - inset
        : card.offsetLeft + inset;

      ghost.style.left = `${Math.round(left)}px`;
      ghost.style.top = `${Math.round(card.offsetTop + 8)}px`;
      ghost.style.setProperty('--ghost-tilt', `${randomBetween(-5, 5)}deg`);

      stage.classList.add('tbrn-ghost-stage');
      card.classList.add('tbrn-ghost-card');
      stage.appendChild(ghost);
      activeGhost = { ghost, card, stage };

      requestAnimationFrame(() => ghost.classList.add('is-peeking'));

      window.setTimeout(() => {
        if (!activeGhost || activeGhost.ghost !== ghost) return;
        ghost.classList.remove('is-peeking');
        ghost.classList.add('is-hiding');
        window.setTimeout(() => {
          if (activeGhost && activeGhost.ghost === ghost) removeGhost();
          scheduleGhost(false);
        }, 700);
      }, randomBetween(3200, 4800));
    };

    const resetGhosts = () => {
      removeGhost();
      scheduleGhost(true);
    };

    reduceMotion.addEventListener?.('change', resetGhosts);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') scheduleGhost(true);
      else removeGhost();
    });
    window.addEventListener('resize', resetGhosts, { passive: true });
    scheduleGhost(true);
  }

  themeEnrique();
  themeWanderer();
  startCardGhosts();

  const observer = new MutationObserver(() => {
    themeEnrique();
    themeWanderer();
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
})();
