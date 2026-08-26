(() => {
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];

  const canonical = $('#canonical-url');
  if (canonical && location.protocol.startsWith('http')) canonical.href = location.origin + location.pathname;
  $('#year').textContent = new Date().getFullYear();

  const menuBtn = $('.menu-toggle');
  const mobileMenu = $('#mobile-menu');
  menuBtn?.addEventListener('click', () => {
    const open = mobileMenu.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  });
  $$('#mobile-menu a').forEach(a => a.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
    menuBtn?.setAttribute('aria-expanded', 'false');
  }));

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const brandHome = $('#brand-home');
  brandHome?.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, left: 0, behavior: reduced ? 'auto' : 'smooth' });
    history.replaceState(null, '', location.pathname + location.search);
  });
  $$('.reveal').forEach(el => {
    const delay = el.dataset.delay || 0;
    el.style.setProperty('--delay', `${delay}ms`);
  });
  if (!reduced && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('visible'); io.unobserve(entry.target); }
    }), { threshold: .12, rootMargin: '0px 0px -35px' });
    $$('.reveal').forEach(el => io.observe(el));
  } else $$('.reveal').forEach(el => el.classList.add('visible'));

  const track = $('#results-track');
  const scrollCard = dir => {
    if (!track) return;
    const card = $('.result-card', track);
    track.scrollBy({ left: (card?.getBoundingClientRect().width || 320) * dir + 16 * dir, behavior: reduced ? 'auto' : 'smooth' });
  };
  $('.carousel-arrow.prev')?.addEventListener('click', () => scrollCard(-1));
  $('.carousel-arrow.next')?.addEventListener('click', () => scrollCard(1));

  let autoScroll;
  if (track && !reduced) {
    const start = () => autoScroll = setInterval(() => {
      const end = track.scrollLeft + track.clientWidth >= track.scrollWidth - 10;
      if (end) track.scrollTo({ left: 0, behavior: 'smooth' }); else scrollCard(1);
    }, 4200);
    const stop = () => clearInterval(autoScroll);
    start(); track.addEventListener('pointerdown', stop); track.addEventListener('pointerup', start); track.addEventListener('mouseenter', stop); track.addEventListener('mouseleave', start);
  }


  const courseGrid = $('#course-grid');
  const coursePrev = $('.course-scroll-prev');
  const courseNext = $('.course-scroll-next');
  const scrollCourse = dir => {
    if (!courseGrid) return;
    const card = $('.course-card', courseGrid);
    const step = (card?.getBoundingClientRect().width || 320) + 14;
    courseGrid.scrollBy({ left: step * dir, behavior: reduced ? 'auto' : 'smooth' });
  };
  coursePrev?.addEventListener('click', () => scrollCourse(-1));
  courseNext?.addEventListener('click', () => scrollCourse(1));
  const updateCourseHints = () => {
    if (!courseGrid) return;
    const canScroll = courseGrid.scrollWidth > courseGrid.clientWidth + 4;
    const atStart = courseGrid.scrollLeft <= 8;
    const atEnd = courseGrid.scrollLeft + courseGrid.clientWidth >= courseGrid.scrollWidth - 8;
    if (coursePrev) {
      coursePrev.style.opacity = canScroll && !atStart ? '1' : '.22';
      coursePrev.disabled = !canScroll || atStart;
    }
    if (courseNext) {
      courseNext.style.opacity = canScroll && !atEnd ? '1' : '.22';
      courseNext.disabled = !canScroll || atEnd;
    }
  };
  courseGrid?.addEventListener('scroll', updateCourseHints, { passive: true });
  window.addEventListener('resize', updateCourseHints, { passive: true });
  updateCourseHints();

  function trackEvent(name, params = {}) {
    if (typeof window.gtag === 'function') window.gtag('event', name, params);
  }

  $$('.btn-checkout-infoproduto').forEach(btn => {
    btn.addEventListener('click', () => {
      trackEvent('click_checkout', { event_category: 'infoproduto', product_name: btn.dataset.product });
    });
  });

  const form = $('#lead-form');
  const error = $('#form-error');
  form?.addEventListener('submit', e => {
    e.preventDefault();
    error.style.display = 'none';
    if (!form.checkValidity()) {
      form.reportValidity();
      error.textContent = 'Confira os campos obrigatórios antes de continuar.';
      error.style.display = 'block';
      return;
    }
    const data = new FormData(form);
    const lines = [
      'Nova solicitação pelo site', '',
      `*Nome:* ${data.get('nome')}`,
      `*WhatsApp:* ${data.get('telefone')}`,
      `*Modalidade:* ${data.get('modalidade')}`,
      `*Objetivo:* ${data.get('objetivo')}`,
      `*Já fez ou faz musculação atualmente:* ${data.get('treino_forca')}`,
      `*Consultoria anterior:* ${data.get('consultoria_anterior')}`,
      `*Motivo de ter parado:* ${data.get('motivo_parou') || 'Não informado'}`,
      `*Lesão ou limitação:* ${data.get('limitacoes')}`
    ];
    const url = `https://wa.me/5574991052293?text=${encodeURIComponent(lines.join('\n'))}`;
    trackEvent('lead_whatsapp', { event_category: 'contato', event_label: 'Formulário WhatsApp' });
    window.open(url, '_blank', 'noopener,noreferrer');
  });
})();
