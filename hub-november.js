(function () {
  'use strict';

  // November theme release 3 — dashboard only; welcome screen remains original.

  document.body.classList.add('tbrn-november-theme');

  const emberField = document.createElement('div');
  emberField.className = 'tbrn-november-embers';
  emberField.setAttribute('aria-hidden', 'true');

  for (let index = 0; index < 22; index += 1) {
    const ember = document.createElement('i');
    ember.style.setProperty('--ember-x', `${3 + Math.random() * 94}%`);
    ember.style.setProperty('--ember-delay', `${-Math.random() * 12}s`);
    ember.style.setProperty('--ember-duration', `${8 + Math.random() * 9}s`);
    ember.style.setProperty('--ember-drift', `${-45 + Math.random() * 90}px`);
    ember.style.setProperty('--ember-size', `${2 + Math.random() * 3}px`);
    emberField.appendChild(ember);
  }

  document.body.appendChild(emberField);

  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const canvas = document.createElement('canvas');
    canvas.className = 'tbrn-november-fireworks';
    canvas.setAttribute('aria-hidden', 'true');
    document.body.appendChild(canvas);

    const context = canvas.getContext('2d');
    const colours = ['#ffb347', '#ffd166', '#ff6b35', '#7de2d1', '#9aa7ff', '#fff4d6'];
    let particles = [];
    let nextLaunch = performance.now() + 900;
    let lastFrame = performance.now();

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      const bounds = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, Math.round(bounds.width * ratio));
      canvas.height = Math.max(1, Math.round(bounds.height * ratio));
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    const welcomeIsOpen = () => Boolean(document.getElementById('tbrnWelcome'));

    const launchFirework = () => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (!width || !height || welcomeIsOpen() || document.hidden) return;

      const x = width * (.12 + Math.random() * .76);
      const y = height * (.08 + Math.random() * .45);
      const colour = colours[Math.floor(Math.random() * colours.length)];
      const count = 34 + Math.floor(Math.random() * 22);
      const phase = Math.random() * Math.PI * 2;

      for (let index = 0; index < count; index += 1) {
        const angle = phase + (Math.PI * 2 * index) / count + (Math.random() - .5) * .1;
        const speed = 46 + Math.random() * 94;
        particles.push({
          x, y,
          previousX: x,
          previousY: y,
          velocityX: Math.cos(angle) * speed,
          velocityY: Math.sin(angle) * speed,
          life: .85 + Math.random() * .65,
          age: 0,
          colour,
          size: 1.25 + Math.random() * 1.7
        });
      }
    };

    const animate = now => {
      const elapsed = Math.min((now - lastFrame) / 1000, .04);
      lastFrame = now;
      context.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);

      if (now >= nextLaunch) {
        launchFirework();
        if (Math.random() > .68) window.setTimeout(launchFirework, 260 + Math.random() * 420);
        nextLaunch = now + 2200 + Math.random() * 3600;
      }

      particles = particles.filter(particle => {
        particle.age += elapsed;
        if (particle.age >= particle.life) return false;
        particle.previousX = particle.x;
        particle.previousY = particle.y;
        particle.velocityY += 38 * elapsed;
        particle.velocityX *= .992;
        particle.x += particle.velocityX * elapsed;
        particle.y += particle.velocityY * elapsed;
        const alpha = Math.max(0, 1 - particle.age / particle.life);
        context.beginPath();
        context.moveTo(particle.previousX, particle.previousY);
        context.lineTo(particle.x, particle.y);
        context.strokeStyle = particle.colour;
        context.globalAlpha = alpha;
        context.lineWidth = particle.size;
        context.shadowColor = particle.colour;
        context.shadowBlur = 7;
        context.stroke();
        return true;
      });

      context.globalAlpha = 1;
      context.shadowBlur = 0;
      window.requestAnimationFrame(animate);
    };

    window.addEventListener('resize', resize, { passive: true });
    resize();
    window.requestAnimationFrame(animate);
  }

  const startCardRockets = () => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let sceneTimer = 0;
    let activeScene = null;
    const random = (minimum, maximum) => Math.floor(Math.random() * (maximum - minimum + 1)) + minimum;

    const clearScene = () => {
      if (!activeScene) return;
      activeScene.timers.forEach(timer => window.clearTimeout(timer));
      activeScene.rockets.forEach(rocket => rocket.remove());
      activeScene.cards.forEach(card => card.classList.remove('tbrn-rocket-card'));
      activeScene.stages.forEach(stage => stage.classList.remove('tbrn-rocket-stage'));
      activeScene = null;
    };

    const homeIsVisible = () => {
      const home = document.getElementById('home');
      return Boolean(
        !document.getElementById('tbrnWelcome') &&
        home && !home.classList.contains('hidden') &&
        document.visibilityState === 'visible'
      );
    };

    const schedule = first => {
      window.clearTimeout(sceneTimer);
      if (reduceMotion.matches) return;
      sceneTimer = window.setTimeout(showRockets, first ? random(5000, 8500) : random(15000, 27000));
    };

    const showRockets = () => {
      clearScene();
      if (!homeIsVisible()) {
        schedule(true);
        return;
      }

      const cards = Array.from(document.querySelectorAll(
        '#home #categories .catcard, #home #quick .doccard, #home .stats .stat'
      )).filter(card => {
        const rect = card.getBoundingClientRect();
        return rect.width >= 120 && rect.height >= 70 && rect.bottom > 0 && rect.top < window.innerHeight;
      });

      if (cards.length < 2) {
        schedule(true);
        return;
      }

      const firstIndex = random(0, cards.length - 1);
      const firstCard = cards[firstIndex];
      const remaining = cards.filter((card, index) => index !== firstIndex);
      const secondCard = remaining[random(0, remaining.length - 1)];
      activeScene = { rockets: [], cards: new Set(), stages: new Set(), timers: [] };
      const scene = activeScene;
      const later = (callback, delay) => {
        const timer = window.setTimeout(() => { if (activeScene === scene) callback(); }, delay);
        scene.timers.push(timer);
      };

      const buildRocket = (card, role) => {
        const stage = card.parentElement;
        if (!stage) return null;
        const rocket = document.createElement('button');
        const side = Math.random() > .5 ? 'right' : 'left';
        rocket.type = 'button';
        rocket.className = `tbrn-card-rocket tbrn-card-rocket--${side} tbrn-card-rocket--friend-${role}`;
        rocket.setAttribute('aria-label', 'Catch the firework rocket');
        rocket.title = 'Catch the firework rocket';
        rocket.tabIndex = -1;
        rocket.innerHTML = '<span class="tbrn-card-rocket__face"></span>';
        rocket.addEventListener('click', event => {
          event.preventDefault();
          event.stopPropagation();
          if (!rocket.classList.contains('is-peeking') || rocket.dataset.caught === 'true') return;
          rocket.dataset.caught = 'true';
          rocket.tabIndex = -1;
          rocket.classList.remove('is-peeking');
          rocket.classList.add('is-caught');
          window.tbrnUnlockAchievement?.('ghost-hunter');
        });

        stage.classList.add('tbrn-rocket-stage');
        card.classList.add('tbrn-rocket-card');
        const stageRect = stage.getBoundingClientRect();
        const cardRect = card.getBoundingClientRect();
        const inset = Math.min(34, Math.max(12, cardRect.width * .14));
        const left = side === 'right'
          ? cardRect.right - stageRect.left - 43 - inset
          : cardRect.left - stageRect.left + inset;
        rocket.style.left = `${Math.round(left)}px`;
        rocket.style.top = `${Math.round(cardRect.top - stageRect.top + 8)}px`;
        rocket.style.setProperty('--rocket-tilt', `${random(-6, 6)}deg`);
        rocket.style.setProperty('--rocket-flight-x', `${side === 'right' ? random(180, 430) : random(-430, -180)}px`);
        stage.appendChild(rocket);
        scene.rockets.push(rocket);
        scene.cards.add(card);
        scene.stages.add(stage);
        return rocket;
      };

      const peek = rocket => {
        if (!rocket || rocket.dataset.caught === 'true') return;
        rocket.tabIndex = 0;
        rocket.classList.remove('is-hiding');
        window.requestAnimationFrame(() => rocket.classList.add('is-peeking'));
      };
      const hide = rocket => {
        if (!rocket || rocket.dataset.caught === 'true') return;
        rocket.tabIndex = -1;
        rocket.classList.remove('is-peeking');
        rocket.classList.add('is-hiding');
      };

      const first = buildRocket(firstCard, 'a');
      const second = buildRocket(secondCard, 'b');
      if (!first || !second) {
        clearScene();
        schedule(false);
        return;
      }

      peek(first);
      later(() => peek(second), 800);
      later(() => hide(first), 1650);
      later(() => peek(first), 2350);
      later(() => hide(second), 3200);
      later(() => peek(second), 3900);
      later(() => {
        const launcher = Math.random() > .5 ? first : second;
        if (launcher.dataset.caught !== 'true') {
          launcher.classList.remove('is-peeking', 'is-hiding');
          launcher.classList.add('is-launching');
        }
        hide(launcher === first ? second : first);
      }, 5000);
      later(() => {
        clearScene();
        schedule(false);
      }, 6500);
    };

    const reset = () => {
      clearScene();
      schedule(true);
    };
    reduceMotion.addEventListener?.('change', reset);
    document.addEventListener('visibilitychange', () => document.visibilityState === 'visible' ? schedule(true) : clearScene());
    window.addEventListener('resize', reset, { passive: true });
    schedule(true);
  };

  startCardRockets();
})();
// Deployment marker: November dashboard theme v5 with live fireworks and card rockets.
