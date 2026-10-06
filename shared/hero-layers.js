(() => {
  const hero = document.querySelector('.landing-hero');
  const stage = hero?.querySelector('.hero-stage');
  if (!stage) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const imgs = [...stage.querySelectorAll('img')];
  let visible = false;

  const sync = () => {
    const active = visible && !document.hidden && !reduced.matches && !document.body.classList.contains('project-modal-open');
    hero.classList.toggle('hero-in-view', active);
  };
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; sync(); }, {threshold: 0}).observe(hero);
  document.addEventListener('visibilitychange', sync);
  reduced.addEventListener('change', sync);
  new MutationObserver(sync).observe(document.body, {attributes: true, attributeFilter: ['class']});

  // Intro waits for every layer to decode so pieces never pop in out of order.
  if (!reduced.matches) {
    hero.classList.add('hero-pending');
    Promise.all(imgs.map(img => img.decode().catch(() => {}))).then(() => {
      hero.classList.remove('hero-pending');
      hero.classList.add('hero-enter');
      setTimeout(() => {
        hero.classList.remove('hero-enter');
        hero.classList.add('hero-ready');
      }, 3400);
    });
  }

  // Scroll + pointer drive one rAF loop; values ease toward targets so motion feels weighted.
  const fine = matchMedia('(pointer: fine)').matches;
  const cur = {px: 0, py: 0, sp: 0};
  const tgt = {px: 0, py: 0, sp: 0};
  let raf = 0;
  const measure = () => {
    const r = hero.getBoundingClientRect();
    tgt.sp = Math.min(1, Math.max(0, -r.top / r.height));
    stage.style.setProperty('--hh', r.height + 'px');
    stage.style.setProperty('--hw', r.width + 'px');
  };
  const tick = () => {
    raf = 0;
    let moving = false;
    for (const k in cur) {
      const d = tgt[k] - cur[k];
      if (Math.abs(d) > 0.0005) { cur[k] += d * 0.12; moving = true; } else cur[k] = tgt[k];
      stage.style.setProperty('--' + k, cur[k].toFixed(4));
    }
    if (moving) raf = requestAnimationFrame(tick);
  };
  const kick = () => { if (!raf && !reduced.matches) raf = requestAnimationFrame(tick); };
  addEventListener('scroll', () => { measure(); kick(); }, {passive: true});
  addEventListener('resize', () => { measure(); kick(); });
  measure(); kick();
  if (fine) {
    hero.addEventListener('pointermove', e => {
      const r = hero.getBoundingClientRect();
      tgt.px = (e.clientX - r.left) / r.width * 2 - 1;
      tgt.py = (e.clientY - r.top) / r.height * 2 - 1;
      kick();
    });
    hero.addEventListener('pointerleave', () => { tgt.px = tgt.py = 0; kick(); });
  }
})();
