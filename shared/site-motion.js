(() => {
  // Reduced motion: leave the page static (no .motion-on, so nothing is hidden).
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const root = document.documentElement;
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  // Split the about heading into characters and the paragraph into lines for staggered motion.
  const h2 = document.querySelector('.about-copy h2');
  if (h2) {
    let c = 0;
    h2.setAttribute('aria-label', h2.textContent);
    for (const node of [...h2.childNodes]) {
      if (node.nodeType !== 3) continue;
      const frag = document.createDocumentFragment();
      for (const ch of node.textContent) {
        const s = document.createElement('span');
        s.className = 'ch'; s.textContent = ch; s.style.setProperty('--c', c++); s.setAttribute('aria-hidden', 'true');
        frag.append(s);
      }
      node.replaceWith(frag);
    }
  }
  const para = document.querySelector('.about-copy > p:last-child');
  if (para) {
    para.innerHTML = para.innerHTML.split(/<br\s*\/?>/i)
      .map((t, i) => `<span class="ln" style="--c:${i}">${t}</span>`).join('<br>');
  }
  $$('.contact-item').forEach((el, i) => el.style.setProperty('--c', i));

  // Each tracked element gets --k (how far it is "in": 0 off-screen → 1 settled → 0 leaving)
  // and --dir (1 below viewport centre, -1 above) so it enters from below and exits upward.
  const items = [];
  const track = (sel, kind) => $$(sel).forEach((el, i) => {
    el.dataset.reveal = kind;
    el.style.setProperty('--side', i % 2 ? 1 : -1);
    items.push({el, i, cur: 0, tgt: 0, dir: 1});
  });
  track('.works-heading', 'up');
  track('.work-card', 'card');
  track('.journey-art', 'zoom');
  track('.journey-stop', 'stop');
  track('.about-copy', 'left');
  track('.about-art', 'swing');
  track('.contact-card', 'contact');
  track('.footer-bottom', 'up');
  root.classList.add('motion-on');

  const clamp = v => v < 0 ? 0 : v > 1 ? 1 : v;
  const measure = () => {
    const ih = innerHeight, band = ih * .38;
    for (const it of items) {
      const r = it.el.getBoundingClientRect();
      const lag = (it.i % 5) * 36; // side-by-side siblings enter slightly staggered
      const enter = clamp((ih - r.top - lag) / band);
      const leave = clamp((r.bottom - lag * .5) / band);
      it.tgt = Math.min(enter, leave);
      it.dir = r.top + r.height / 2 > ih / 2 ? 1 : -1;
    }
  };

  const bar = document.createElement('div');
  bar.className = 'scroll-progress';
  bar.setAttribute('aria-hidden', 'true');
  document.body.append(bar);

  let raf = 0;
  const tick = () => {
    raf = 0;
    measure();
    let moving = false;
    for (const it of items) {
      const d = it.tgt - it.cur;
      if (Math.abs(d) > .001) { it.cur += d * .16; moving = true; } else it.cur = it.tgt;
      it.el.style.setProperty('--k', it.cur.toFixed(4));
      it.el.style.setProperty('--dir', it.dir);
    }
    const max = root.scrollHeight - innerHeight;
    bar.style.setProperty('--sp-page', max > 0 ? (scrollY / max).toFixed(4) : 0);
    if (moving) raf = requestAnimationFrame(tick);
  };
  const kick = () => { if (!raf) raf = requestAnimationFrame(tick); };
  addEventListener('scroll', kick, {passive: true});
  addEventListener('resize', kick);
  addEventListener('load', kick);
  kick();

  // Work card tilt + spotlight, fine pointers only.
  if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
    for (const card of $$('.work-card')) {
      let r2 = 0;
      card.addEventListener('pointermove', e => {
        if (r2) return;
        r2 = requestAnimationFrame(() => {
          r2 = 0;
          const r = card.getBoundingClientRect();
          const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
          card.classList.add('is-tilting');
          card.style.setProperty('--ry', ((x - .5) * 10).toFixed(2) + 'deg');
          card.style.setProperty('--rx', ((.5 - y) * 8).toFixed(2) + 'deg');
          card.style.setProperty('--mx', (x * 100).toFixed(1) + '%');
          card.style.setProperty('--my', (y * 100).toFixed(1) + '%');
        });
      });
      card.addEventListener('pointerleave', () => {
        card.classList.remove('is-tilting');
        card.style.setProperty('--rx', '0deg');
        card.style.setProperty('--ry', '0deg');
      });
    }
  }
})();
