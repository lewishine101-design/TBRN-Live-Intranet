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
})();
// Deployment marker: November dashboard theme v3.
