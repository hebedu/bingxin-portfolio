(() => {
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const root = document.documentElement;
  root.classList.add('pfx-on');
  const $$ = s => [...document.querySelectorAll(s)];

  // Cursor follower ring, eased toward the real cursor.
  const ring = document.createElement('div');
  ring.className = 'pfx-ring';
  ring.setAttribute('aria-hidden', 'true');
  document.body.append(ring);
  let mx = -100, my = -100, rx = -100, ry = -100, raf = 0;
  const follow = () => {
    rx += (mx - rx) * .22; ry += (my - ry) * .22;
    ring.style.setProperty('--cx', rx.toFixed(1) + 'px');
    ring.style.setProperty('--cy', ry.toFixed(1) + 'px');
    raf = Math.abs(mx - rx) + Math.abs(my - ry) > .3 ? requestAnimationFrame(follow) : 0;
  };
  addEventListener('pointermove', e => {
    mx = e.clientX; my = e.clientY;
    ring.classList.add('is-on');
    const t = e.target.closest?.('a,button,[data-project-open]');
    ring.classList.toggle('is-link', !!t);
    ring.classList.toggle('is-text', !t && !!e.target.closest?.('h2 .ch,.signature'));
    if (!raf) raf = requestAnimationFrame(follow);
  }, {passive: true});
  document.addEventListener('pointerleave', () => ring.classList.remove('is-on'));
  addEventListener('pointerdown', () => ring.classList.add('is-down'));
  addEventListener('pointerup', () => ring.classList.remove('is-down'));

  // Magnetic buttons/links: pulled toward the cursor while hovered.
  const magnets = $$('.hero-nav a, .contact-item, .works-count, .footer-bottom a');
  for (const el of magnets) {
    el.classList.add('pfx-mag');
    const strength = el.classList.contains('contact-item') ? .12 : .35;
    el.addEventListener('pointermove', e => {
      const r = el.getBoundingClientRect();
      el.classList.add('is-pulling');
      el.style.setProperty('--tx', ((e.clientX - r.left - r.width / 2) * strength).toFixed(1) + 'px');
      el.style.setProperty('--ty', ((e.clientY - r.top - r.height / 2) * strength).toFixed(1) + 'px');
    });
    el.addEventListener('pointerleave', () => {
      el.classList.remove('is-pulling');
      el.style.setProperty('--tx', '0px');
      el.style.setProperty('--ty', '0px');
    });
  }

  // Section-level lean: pointer position within a section drives --px/--py on it.
  const lean = sel => {
    const sec = document.querySelector(sel);
    if (!sec) return;
    let f = 0;
    sec.addEventListener('pointermove', e => {
      if (f) return;
      f = requestAnimationFrame(() => {
        f = 0;
        const r = sec.getBoundingClientRect();
        sec.style.setProperty('--px', ((e.clientX - r.left) / r.width * 2 - 1).toFixed(3));
        sec.style.setProperty('--py', ((e.clientY - r.top) / r.height * 2 - 1).toFixed(3));
      });
    });
    sec.addEventListener('pointerleave', () => { sec.style.setProperty('--px', 0); sec.style.setProperty('--py', 0); });
  };
  lean('.journey-section');
  lean('.contact-section');

  // Click burst in the site palette.
  const colors = ['#357672', '#6da08c', '#efd179', '#ff9b6a', '#9cc9a8'];
  addEventListener('pointerdown', e => {
    if (e.button !== 0 || e.target.closest('iframe,.project-modal')) return;
    for (let i = 0; i < 9; i++) {
      const b = document.createElement('span');
      b.className = 'pfx-bit';
      const a = (i / 9) * Math.PI * 2 + Math.random() * .6, d = 26 + Math.random() * 30;
      b.style.cssText = `--x0:${e.clientX}px;--y0:${e.clientY}px;--dx:${(Math.cos(a) * d).toFixed(1)}px;--dy:${(Math.sin(a) * d).toFixed(1)}px;--r:${Math.round(Math.random() * 360)}deg;background:${colors[i % colors.length]}`;
      b.setAttribute('aria-hidden', 'true');
      b.addEventListener('animationend', () => b.remove(), {once: true});
      document.body.append(b);
    }
  });
})();

// Window portrait: hearts float up over the cat, leaves drift off the plant, the cat says 喵 on click.
(() => {
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const art = document.querySelector('.about-art');
  if (!art) return;
  // Hot spots in % of the displayed (mirrored) image.
  const cat = {x: [20, 38], y: [62, 82]}, plant = {x: [62, 86], y: [44, 74]}, face = {x: [38, 58], y: [44, 66]};
  const inside = (z, px, py) => px >= z.x[0] && px <= z.x[1] && py >= z.y[0] && py <= z.y[1];
  const spawn = (cls, text, x, y, extra = '') => {
    const s = document.createElement('span');
    s.className = 'pfx-pop ' + cls;
    s.textContent = text;
    s.setAttribute('aria-hidden', 'true');
    s.style.cssText = `left:${x + scrollX}px;top:${y + scrollY}px;--dx:${(Math.random() * 40 - 20).toFixed(0)}px;--r:${(Math.random() * 60 - 30).toFixed(0)}deg;${extra}`;
    s.addEventListener('animationend', () => s.remove(), {once: true});
    document.body.append(s);
  };
  let last = 0;
  art.addEventListener('pointermove', e => {
    const r = art.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width * 100, py = (e.clientY - r.top) / r.height * 100;
    art.classList.toggle('is-cat', inside(cat, px, py));
    const now = performance.now();
    if (now - last < 60) return;
    last = now;
    const burst = (n, fn) => { for (let i = 0; i < n; i++) fn((Math.random() - .5) * 26, (Math.random() - .5) * 18); };
    if (inside(cat, px, py)) burst(2, (ox, oy) => spawn('pfx-heart', '♥', e.clientX + ox, e.clientY + oy, `color:${Math.random() < .5 ? '#ff9b6a' : '#f07a8a'};font-size:${14 + Math.random() * 10 | 0}px`));
    else if (inside(plant, px, py)) burst(2, (ox, oy) => spawn('pfx-leaf', '', e.clientX + ox, e.clientY + oy, `background:${Math.random() < .5 ? '#357672' : '#6da08c'}`));
    else if (inside(face, px, py)) burst(2, (ox, oy) => spawn('pfx-spark', Math.random() < .5 ? '✦' : '✧', e.clientX + ox, e.clientY + oy, `font-size:${12 + Math.random() * 8 | 0}px`));
  });
  art.addEventListener('pointerleave', () => art.classList.remove('is-cat'));
  art.addEventListener('click', e => {
    const r = art.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width * 100, py = (e.clientY - r.top) / r.height * 100;
    if (inside(cat, px, py)) spawn('pfx-meow', ['喵~', '喵！', 'meow'][Math.floor(Math.random() * 3)], r.left + r.width * .3, r.top + r.height * .58);
    art.classList.remove('is-hop'); void art.offsetWidth; art.classList.add('is-hop');
  });
  art.addEventListener('animationend', () => art.classList.remove('is-hop'));
})();

// Hero toys: each layer the cursor is over sprays its own little things.
(() => {
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const stage = document.querySelector('.hero-stage');
  if (!stage) return;
  const spawn = (cls, text, x, y, extra = '') => {
    const s = document.createElement('span');
    s.className = 'pfx-pop ' + cls;
    s.textContent = text;
    s.setAttribute('aria-hidden', 'true');
    s.style.cssText = `left:${x + scrollX}px;top:${y + scrollY}px;--dx:${(Math.random() * 40 - 20).toFixed(0)}px;--r:${(Math.random() * 60 - 30).toFixed(0)}deg;${extra}`;
    s.addEventListener('animationend', () => s.remove(), {once: true});
    document.body.append(s);
  };
  const pick = a => a[Math.random() * a.length | 0];
  const heart = (x, y) => spawn('pfx-heart', '♥', x, y, `color:${pick(['#ff9b6a', '#f07a8a'])};font-size:${14 + Math.random() * 10 | 0}px`);
  const leaf = (x, y) => spawn('pfx-leaf', '', x, y, `background:${pick(['#357672', '#6da08c', '#9cc9a8'])}`);
  const star = c => (x, y) => spawn('pfx-spark', pick(['✦', '✧']), x, y, `color:${c};font-size:${12 + Math.random() * 8 | 0}px`);
  // Front-most first; the first layer whose box contains the cursor wins.
  const zones = [
    ['.hl-note-ideas', star('#efd179')],
    ['.hl-note-designer', star('#ff9b6a')],
    ['.hl-title', star('#efd179')],
    ['.hl-books', star('#ff9b6a')],
    ['.hl-sun', star('#efa24f')],
    ['.hl-city', star('#9cc9a8')],
    ['.hl-leaves', leaf],
    ['.hl-girl', heart],
  ].map(([s, fn]) => [stage.querySelector(s), fn]).filter(([el]) => el);
  let last = 0;
  stage.addEventListener('pointermove', e => {
    const now = performance.now();
    if (now - last < 60) return;
    last = now;
    const hit = zones.find(([el]) => {
      const r = el.getBoundingClientRect();
      return e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
    });
    if (!hit) return;
    for (let i = 0; i < 2; i++) hit[1](e.clientX + (Math.random() - .5) * 26, e.clientY + (Math.random() - .5) * 18);
  });
})();

// Site-wide trail: everywhere else, moving the cursor leaves a soft trail of dots and leaves.
(() => {
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const colors = ['#357672', '#6da08c', '#efd179', '#ff9b6a', '#9cc9a8'];
  let lx = 0, ly = 0, i = 0;
  addEventListener('pointermove', e => {
    // The hero and the window portrait spray their own things; skip modals and iframes.
    if (e.target.closest?.('.hero-stage,.about-art,.project-modal,iframe')) return;
    if (Math.hypot(e.clientX - lx, e.clientY - ly) < 14) return;
    lx = e.clientX; ly = e.clientY;
    const s = document.createElement('span');
    s.className = 'pfx-trail' + (i++ % 3 === 0 ? ' is-leaf' : '');
    s.setAttribute('aria-hidden', 'true');
    s.style.cssText = `left:${e.clientX + scrollX}px;top:${e.clientY + scrollY}px;background:${colors[i % colors.length]};--dx:${(Math.random() * 16 - 8).toFixed(0)}px;--r:${(Math.random() * 180 - 90).toFixed(0)}deg`;
    s.addEventListener('animationend', () => s.remove(), {once: true});
    document.body.append(s);
  }, {passive: true});
})();
