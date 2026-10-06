(() => {
  const stage = document.querySelector('.journey-stage');
  if (!stage || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const section = stage.closest('.journey-section') || stage;

  // --jp eases toward scroll progress; the walk cycle pauses once scrolling settles.
  let cur = .5, tgt = .5, raf = 0, stillTimer = 0;
  const measure = () => {
    const r = section.getBoundingClientRect();
    const p = (innerHeight - r.top) / (innerHeight + r.height);
    tgt = p < 0 ? 0 : p > 1 ? 1 : p;
  };
  const tick = () => {
    raf = 0;
    measure();
    const d = tgt - cur;
    cur = Math.abs(d) > .0005 ? cur + d * .12 : tgt;
    stage.style.setProperty('--jp', cur.toFixed(4));
    if (cur !== tgt) raf = requestAnimationFrame(tick);
  };
  const kick = () => {
    stage.classList.remove('is-still');
    clearTimeout(stillTimer);
    stillTimer = setTimeout(() => stage.classList.add('is-still'), 450);
    if (!raf) raf = requestAnimationFrame(tick);
  };

  new IntersectionObserver(([e]) => stage.classList.toggle('journey-in', e.isIntersecting)).observe(stage);
  addEventListener('scroll', kick, {passive: true});
  addEventListener('resize', kick);
  measure(); cur = tgt; stage.style.setProperty('--jp', cur.toFixed(4));
  stage.classList.add('is-still');
})();
