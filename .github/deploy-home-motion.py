from pathlib import Path

index = Path("index.html")
text = index.read_text(encoding="utf-8")
replacements = [
    ("  let assistantOpen=false;\n  let wanderTimer=0;",
     "  let assistantOpen=false;\n  const ENRIQUE_WANDERING_ENABLED=false;\n  let wanderTimer=0;"),
    ("    return !assistantOpen&&!document.hidden&&window.innerWidth>700&&!reducedMotion.matches&&!wanderAnimation;",
     "    return ENRIQUE_WANDERING_ENABLED&&!assistantOpen&&!document.hidden&&window.innerWidth>700&&!reducedMotion.matches&&!wanderAnimation;"),
    ("    if(assistantOpen||reducedMotion.matches||window.innerWidth<=700)return;",
     "    if(!ENRIQUE_WANDERING_ENABLED||assistantOpen||reducedMotion.matches||window.innerWidth<=700)return;"),
    ("  window.tbrnEnriqueWanderNow=runEnriqueWander;\n  document.body.appendChild(wanderer);",
     "  window.tbrnEnriqueWanderNow=()=>{};")
]
for old, new in replacements:
    if old not in text:
        raise SystemExit(f"index.html expected block not found: {old[:70]}")
    text = text.replace(old, new, 1)
index.write_text(text, encoding="utf-8")

november = Path("hub-november.js")
text = november.read_text(encoding="utf-8")
replacements = [
    ("  document.body.classList.add('tbrn-november-theme');\n",
     """  document.body.classList.add('tbrn-november-theme');

  const homeDashboardIsVisible = () => {
    const home = document.getElementById('home');
    return Boolean(
      !document.getElementById('tbrnWelcome') &&
      home && !home.classList.contains('hidden') &&
      document.visibilityState === 'visible'
    );
  };
"""),
    ("if (!width || !height || welcomeIsOpen() || document.hidden) return;",
     "if (!width || !height || welcomeIsOpen() || !homeDashboardIsVisible()) return;"),
    ("""      context.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);

      if (now >= nextLaunch) {""",
     """      context.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);

      const homeVisible = homeDashboardIsVisible();
      canvas.hidden = !homeVisible;
      if (!homeVisible) particles = [];

      if (homeVisible && now >= nextLaunch) {"""),
    ("""      const fly = now => {
        const raw = Math.min(1, (now - started) / duration);""",
     """      const fly = now => {
        if (!homeDashboardIsVisible()) {
          flyer.remove();
          return;
        }
        const raw = Math.min(1, (now - started) / duration);"""),
    ("""    const homeIsVisible = () => {
      const home = document.getElementById('home');
      return Boolean(
        !document.getElementById('tbrnWelcome') &&
        home && !home.classList.contains('hidden') &&
        document.visibilityState === 'visible'
      );
    };""",
     "    const homeIsVisible = homeDashboardIsVisible;"),
    ("""    window.addEventListener('resize', reset, { passive: true });
    schedule(true);""",
     """    window.addEventListener('resize', reset, { passive: true });
    const home = document.getElementById('home');
    if (home) {
      new MutationObserver(() => {
        if (!homeIsVisible()) clearScene();
      }).observe(home, { attributes: true, attributeFilter: ['class'] });
    }
    schedule(true);""")
]
for old, new in replacements:
    if old not in text:
        raise SystemExit(f"hub-november.js expected block not found: {old[:70]}")
    text = text.replace(old, new, 1)
november.write_text(text, encoding="utf-8")
