'use strict';
const $ = (selector, root = document) => root.querySelector(selector);
const menu = $('#menu'), toggle = $('.hamburger');
const navLinks = [...document.querySelectorAll('.menu a[href^="#"], .header-offer[href^="#"]')];
toggle.addEventListener('click', () => { const open = menu.classList.toggle('open'); toggle.setAttribute('aria-expanded', String(open)); toggle.setAttribute('aria-label', open ? 'Închide meniul' : 'Deschide meniul'); });
navLinks.forEach(link => link.addEventListener('click', () => {
  menu.classList.remove('open');
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-label', 'Deschide meniul');
}));
$('#year').textContent = new Date().getFullYear();
const content = window.LEE_CONTENT || { galerie: [], recenzii: [] };
function el(tag, cls, text) { const node = document.createElement(tag); if (cls) node.className = cls; if (text !== undefined) node.textContent = text; return node; }
function buildGallery(item) {
  const card = el('article', 'gallery-slide');
  const img = el('img');
  img.alt = item.alt ?? (item.titlu || 'Fotografie din galeria Lee Events');
  img.loading = 'lazy';
  if (item.width > 0 && item.height > 0) {
    img.width = item.width;
    img.height = item.height;
  }
  img.src = item.imagine;
  img.addEventListener('error', () => { img.alt = 'Imagine indisponibilă – verifică fișierul în assets/gallery'; });
  const label = el('div', 'gallery-caption');
  label.append(el('strong', '', item.titlu || ''), el('span', '', item.descriere || ''));
  card.append(img, label);
  return card;
}
function buildReview(item) {
  const card = el('article', 'review-slide');
  const header = el('div', 'review-card-header');
  const quote = el('span', 'review-quote-mark', '”');
  quote.setAttribute('aria-hidden', 'true');
  header.append(quote);
  const rating = Math.max(0, Math.min(5, Math.floor(Number(item.stele) || 0)));
  if (rating) {
    const stars = el('span', 'stars', '★'.repeat(rating));
    stars.setAttribute('role', 'img');
    stars.setAttribute('aria-label', `${rating} din 5 stele`);
    header.append(stars);
  }

  const author = el('div', 'review-author');
  author.append(el('strong', '', item.nume || ''));
  if (item.tipEveniment) author.append(el('small', '', item.tipEveniment));
  card.append(header, el('blockquote', '', item.text || ''), author);
  return card;
}

function setupReviews(items) {
  const root = $('.review-carousel');
  const track = $('#reviews-track', root);
  const controls = $('.review-arrows', root);
  if (!items.length) {
    track.append(el('p', 'empty', 'Momentan nu există recenzii de afișat.'));
    controls.hidden = true;
    return;
  }

  const cards = items.map(buildReview);
  track.append(...cards);
  const prev = $('[data-prev]', controls);
  const next = $('[data-next]', controls);

  function updateControls() {
    const max = track.scrollWidth - track.clientWidth;
    controls.hidden = max <= 1;
    prev.disabled = track.scrollLeft <= 1;
    next.disabled = track.scrollLeft >= max - 1;
  }

  function move(direction) {
    const step = cards[1].offsetLeft - cards[0].offsetLeft;
    track.scrollBy({ left: step * direction });
  }

  prev.addEventListener('click', () => move(-1));
  next.addEventListener('click', () => move(1));
  track.addEventListener('scroll', updateControls, { passive: true });
  window.addEventListener('resize', updateControls);
  updateControls();
}
function setupCarousel(name, items, makeCard) {
  const root = document.querySelector(`[data-carousel="${name}"]`);
  const track = $('.carousel-track', root);
  const dots = $('[data-dots]', root);
  const count = items.length;
  if (!count) {
    track.append(el('p', 'empty', 'Momentan nu există elemente de afișat.'));
    return;
  }

  const loop = count > 1;
  const first = loop ? count : 0;
  const cards = items.map(makeCard);
  if (loop) {
    for (let copy = 0; copy < 3; copy++) {
      cards.forEach(card => {
        const slide = copy === 1 ? card : card.cloneNode(true);
        if (copy !== 1) slide.setAttribute('aria-hidden', 'true');
        track.append(slide);
      });
    }
  } else {
    track.append(...cards);
  }

  const slides = [...track.children];
  let index = first + Math.floor(count / 2);
  const logicalIndex = position => (position - first + count) % count;
  const buttons = items.map((_, i) => {
    const dot = el('button', 'dot');
    dot.type = 'button';
    dot.setAttribute('aria-label', `Mergi la elementul ${i + 1}`);
    dot.addEventListener('click', () => {
      let target = first + i;
      if (loop) {
        target = [i, first + i, 2 * count + i].reduce((nearest, candidate) =>
          Math.abs(candidate - index) < Math.abs(nearest - index) ? candidate : nearest, target);
      }
      go(target);
    });
    dots.append(dot);
    return dot;
  });

  function positionOf(slide) {
    const left = slide.offsetLeft - track.offsetLeft;
    return left + (slide.offsetWidth - track.clientWidth) / 2;
  }

  function markActive(position) {
    index = position;
    slides.forEach((slide, i) => slide.classList.toggle('is-active', i === position));
    buttons.forEach((button, i) => {
      const active = i === logicalIndex(position);
      button.classList.toggle('active', active);
      button.setAttribute('aria-current', String(active));
    });
  }

  function go(position) {
    if (loop && (position < 0 || position >= slides.length)) {
      const equivalent = first + logicalIndex(index);
      position += equivalent - index;
      track.scrollTo({ left: positionOf(slides[equivalent]), behavior: 'instant' });
    }
    const target = (position + slides.length) % slides.length;
    markActive(target);
    track.scrollTo({ left: positionOf(slides[target]), behavior: 'smooth' });
  }

  function settle() {
    clearTimeout(timer);
    const left = track.scrollLeft;
    const nearest = slides.reduce((best, slide, i) =>
      Math.abs(positionOf(slide) - left) < Math.abs(positionOf(slides[best]) - left) ? i : best, 0);
    const target = loop ? first + logicalIndex(nearest) : nearest;
    if (target !== nearest) {
      track.scrollTo({ left: positionOf(slides[target]), behavior: 'instant' });
    }
    markActive(target);
  }

  root.querySelector('[data-prev]').addEventListener('click', () => go(index - 1));
  root.querySelector('[data-next]').addEventListener('click', () => go(index + 1));
  let timer;
  if ('onscrollend' in track) {
    track.addEventListener('scrollend', settle);
  } else {
    track.addEventListener('scroll', () => {
      clearTimeout(timer);
      timer = setTimeout(settle, 150);
    }, { passive: true });
  }
  markActive(index);
  track.scrollTo({ left: positionOf(slides[index]), behavior: 'instant' });
}
setupCarousel('gallery', content.galerie || [], buildGallery);
setupReviews(content.recenzii || []);

function instagramPost(item) {
  if (!item || typeof item.thumbnail !== 'string' || typeof item.title !== 'string') return null;
  const thumbnail = item.thumbnail.trim();
  const title = item.title.trim();
  if (!title || !/^assets\/(?:[^/?#:\\]+\/)*[^/?#:\\]+\.(?:webp|jpe?g)$/i.test(thumbnail) ||
    thumbnail.split('/').some(segment => segment === '.' || segment === '..')) return null;

  try {
    const url = new URL(item.url);
    const match = url.pathname.match(/^\/(p|reel)\/([\w-]+)\/?$/);
    if (!match || !['https://www.instagram.com', 'https://instagram.com'].includes(url.origin)) return null;
    return {
      thumbnail, title,
      url: `https://www.instagram.com/${match[1]}/${match[2]}/`,
      reel: item.type === 'reel' || match[1] === 'reel'
    };
  } catch {
    return null;
  }
}

function setupInstagram(items) {
  const gallery = $('.instagram-gallery');
  const posts = items.map(instagramPost).filter(Boolean);
  if (!gallery || !posts.length) return;

  const grid = $('#instagram-grid', gallery);
  const dialog = $('.instagram-dialog', gallery);
  const title = $('#instagram-post-title', dialog);
  const stage = $('.instagram-stage', dialog);
  const preview = $('.instagram-preview', dialog);
  const embed = $('.instagram-embed', dialog);
  const status = $('.instagram-dialog-status', dialog);
  const direct = $('.instagram-direct', dialog);
  let scriptReady;
  let activeEmbed;
  let observer;
  let frameObserver;
  let timeout;

  function loadScript() {
    if (window.instgrm?.Embeds?.process) return Promise.resolve();
    if (!scriptReady) {
      scriptReady = new Promise((resolve, reject) => {
        const script = el('script');
        script.async = true;
        script.src = 'https://www.instagram.com/embed.js';
        script.addEventListener('load', resolve, { once: true });
        script.addEventListener('error', reject, { once: true });
        document.head.append(script);
      });
    }
    return scriptReady;
  }

  function openPost(post) {
    observer?.disconnect();
    frameObserver?.disconnect();
    clearTimeout(timeout);
    title.textContent = post.title;
    stage.dataset.state = 'preview';
    preview.src = post.thumbnail;
    direct.href = post.url;
    status.textContent = 'Se încarcă postarea Instagram…';
    const quote = el('blockquote', 'instagram-media');
    quote.dataset.instgrmPermalink = post.url + '?utm_source=ig_embed&utm_campaign=loading';
    quote.dataset.instgrmVersion = '14';
    const link = el('a');
    link.href = post.url;
    link.textContent = 'Vezi această postare pe Instagram';
    quote.append(link);
    embed.replaceChildren(quote);
    activeEmbed = quote;
    dialog.showModal();

    function unavailable() {
      if (activeEmbed !== quote || !dialog.open) return;
      clearTimeout(timeout);
      status.textContent = 'Dacă postarea nu apare aici, o poți deschide direct pe Instagram.';
    }

    observer = new MutationObserver(() => {
      const frame = embed.querySelector('iframe');
      if (activeEmbed !== quote || !dialog.open || !frame) return;
      observer.disconnect();
      frame.addEventListener('load', () => {
        if (activeEmbed !== quote || !dialog.open) return;
        function revealEmbed() {
          if (activeEmbed !== quote || !dialog.open) return;
          // Instagram can load a collapsed frame when a post cannot be embedded.
          if (frame.getBoundingClientRect().height <= 2) {
            unavailable();
            return;
          }
          frameObserver?.disconnect();
          clearTimeout(timeout);
          stage.dataset.state = 'ready';
          status.textContent = '';
        }
        frameObserver = new ResizeObserver(revealEmbed);
        frameObserver.observe(frame);
        revealEmbed();
      }, { once: true });
    });
    observer.observe(embed, { childList: true, subtree: true });
    timeout = setTimeout(unavailable, 8000);
    loadScript().then(() => {
      if (activeEmbed === quote && dialog.open) window.instgrm.Embeds.process();
    }).catch(unavailable);
  }

  dialog.addEventListener('close', () => {
    if (dialog.open) return;
    activeEmbed = null;
    observer?.disconnect();
    frameObserver?.disconnect();
    clearTimeout(timeout);
    embed.replaceChildren();
    preview.removeAttribute('src');
    direct.removeAttribute('href');
  });

  const cards = posts.map(post => {
    const card = el('button', 'instagram-card');
    card.type = 'button';
    card.setAttribute('aria-haspopup', 'dialog');
    const image = el('img');
    image.alt = '';
    image.loading = 'lazy';
    image.decoding = 'async';
    image.src = post.thumbnail;
    card.append(image);
    if (post.reel) {
      const play = el('span', 'instagram-play');
      play.setAttribute('aria-hidden', 'true');
      card.append(play);
    }
    card.append(el('span', 'instagram-card-title', post.title));
    card.addEventListener('click', () => openPost(post));
    return card;
  });
  grid.append(...cards);
}

setupInstagram(Array.isArray(content.instagram) ? content.instagram : []);
$('#offer-form').addEventListener('submit', event => { event.preventDefault(); const f = new FormData(event.currentTarget); const msg = `Bună! Aș dori o ofertă, Lee Events. \nNume: ${f.get('nume')}\nEveniment: ${f.get('tip')}\nData: ${f.get('data')}\nLocalitatea: ${f.get('localitate')}\nDetalii: ${f.get('detalii') || '-'}`; window.open('https://wa.me/40747752366?text=' + encodeURIComponent(msg), '_blank', 'noopener,noreferrer'); });

// Meniu fix și indicator activ sincronizat cu secțiunea vizibilă.
const header = $('.header');
const sections = navLinks.map(link => document.querySelector(link.getAttribute('href'))).filter(Boolean);
function updateNavigation() { header.classList.toggle('is-scrolled', window.scrollY > 24); const probe = (header.offsetHeight + window.innerHeight) / 2; let current = sections[0]?.id; for (const section of sections) { if (section.getBoundingClientRect().top <= probe) current = section.id; } navLinks.forEach(link => { const active = link.getAttribute('href') === '#' + current; link.classList.toggle('active', active); if (active) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current'); }); }
window.addEventListener('scroll', updateNavigation, { passive: true });
window.addEventListener('resize', updateNavigation);

const centeredLinks = [
  ...navLinks,
  ...document.querySelectorAll('.hero-buttons a[href="#contact"], .event-type-card a[data-event-type]')
];
centeredLinks.forEach(link => link.addEventListener('click', event => {
  if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  const hash = link.getAttribute('href');
  const section = document.querySelector(hash);
  if (!section) return;

  event.preventDefault();
  if (link.dataset.eventType) $('#offer-form select[name="tip"]').value = link.dataset.eventType;
  const scrollTarget = $('[data-scroll-center]', section) || section;
  const bounds = scrollTarget.getBoundingClientRect();
  const visibleCenter = (header.offsetHeight + window.innerHeight) / 2;
  const sectionCenter = window.scrollY + bounds.top + bounds.height / 2;
  const top = sectionCenter - visibleCenter;

  if (location.hash !== hash) history.pushState(null, '', hash);
  if (!section.hasAttribute('tabindex')) section.setAttribute('tabindex', '-1');
  section.focus({ preventScroll: true });
  window.scrollTo({ top });
}));
updateNavigation();
