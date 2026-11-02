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
})();
// Deployment marker: November dashboard theme v4 with live fireworks.
