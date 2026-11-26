'use strict';
document.addEventListener('contextmenu', event => {
  if (event.target instanceof Element && event.target.closest('img, .event-type-cover, .gallery-tile, .about-photo')) {
    event.preventDefault();
  }
});

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
const content = window.LEE_CONTENT || { galleryItems: [], reviews: [] };
function el(tag, cls, text) { const node = document.createElement(tag); if (cls) node.className = cls; if (text !== undefined) node.textContent = text; return node; }
const reviewIconPaths = {
  left: 'M19 12H5m7 7-7-7 7-7',
  right: 'M5 12h14m-7-7 7 7-7 7',
  external: 'M7 17 17 7M7 7h10v10',
  star: 'm12 3 2.8 5.7 6.3.9-4.5 4.4 1.1 6.2-5.7-3-5.7 3 1.1-6.2-4.5-4.4 6.3-.9Z'
};

function reviewIcon(name) {
  const namespace = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(namespace, 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('class', 'ui-icon');
  svg.setAttribute('aria-hidden', 'true');
  const path = document.createElementNS(namespace, 'path');
  path.setAttribute('d', reviewIconPaths[name]);
  svg.append(path);
  return svg;
}

function reviewPlatformLogo(platform) {
  const image = el('img', 'review-platform-logo');
  image.src = `assets/reviews/${platform}.svg`;
  image.alt = '';
  image.width = 22;
  image.height = 22;
  return image;
}

function reviewStars(rating) {
  const stars = el('span', 'review-stars');
  stars.setAttribute('role', 'img');
  stars.setAttribute('aria-label', `${rating.toLocaleString('ro-RO')} din 5 stele`);
  for (let i = 0; i < 5; i++) {
    const star = el('span', 'review-star');
    const fill = el('span', 'review-star-fill');
    fill.style.width = `${Math.max(0, Math.min(1, rating - i)) * 100}%`;
    fill.append(reviewIcon('star'));
    star.append(reviewIcon('star'), fill);
    stars.append(star);
  }
  return stars;
}

function reviewExternalLink(url, className) {
  const link = el('a', className);
  link.href = url;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  return link;
}

function httpsLink(value) {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password ? url.href : null;
  } catch {
    return null;
  }
}

function setupReviews(items, platforms) {
  const root = $('#recenzii');
  if (!items.length) return;

  const interactive = $('.reviews-interactive', root);
  const intro = $('.reviews-intro', root);
  const proof = $('.reviews-platforms', root);
  const external = $('.review-external', root);
  const externalLinks = $('.review-external-links', root);
  const spotlight = $('.review-spotlight', root);
  const stage = $('.review-spotlight-stage', root);
  const controls = $('.review-spotlight-controls', root);
  const prev = $('[data-review-step="-1"]', controls);
  const next = $('[data-review-step="1"]', controls);
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const validRating = value => Number.isFinite(value) && value > 0 && value <= 5;
  const platformNames = { google: 'Google', facebook: 'Facebook' };
  const revealed = new WeakSet();

  const revealObserver = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      revealObserver.unobserve(entry.target);
      revealed.add(entry.target);
      if (!motion.matches) entry.target.classList.add('review-revealed');
    }
  }, { threshold: .08 });

  function observeReveal(node, delay = 0) {
    if (revealed.has(node)) return;
    node.style.setProperty('--review-delay', `${delay}ms`);
    revealObserver.observe(node);
  }

  function renderPlatforms() {
    for (const [key, name] of Object.entries(platformNames)) {
      const { url: configuredUrl, rating, recommendation, count: reviewCount } = platforms[key] || {};
      const url = httpsLink(configuredUrl);
      const hasRating = validRating(rating);
      const hasRecommendation = Number.isFinite(recommendation) && recommendation >= 0 && recommendation <= 100;
      const hasCount = Number.isInteger(reviewCount) && reviewCount >= 0;

      if (key !== 'facebook' && (hasRating || hasRecommendation || hasCount)) {
        const platform = url ? reviewExternalLink(url, 'review-platform') : el('div', 'review-platform');
        if (url) platform.setAttribute('aria-label', `Vezi recenziile pe ${name}`);
        const label = el('span', 'review-platform-label');
        label.append(reviewPlatformLogo(key), el('strong', '', name));
        const details = el('span', 'review-platform-details');
        if (hasRating) {
          details.append(el('span', 'review-platform-number', `${rating.toLocaleString('ro-RO')} / 5`), reviewStars(rating));
        }
        if (hasRecommendation) details.append(el('span', '', `${recommendation}% recomandă`));
        if (hasCount) details.append(el('span', '', `${reviewCount.toLocaleString('ro-RO')} ${reviewCount === 1 ? 'recenzie' : 'recenzii'}`));
        platform.append(label);
        if (details.childElementCount) platform.append(details);
        proof.append(platform);
      }

      if (url) {
        const link = reviewExternalLink(url, 'btn btn-ghost review-external-link');
        link.append(reviewPlatformLogo(key), el('span', '', `Vezi recenziile pe ${name}`), reviewIcon('external'));
        externalLinks.append(link);
      }
    }
    proof.hidden = !proof.childElementCount;
    external.hidden = !externalLinks.childElementCount;
  }

  function buildReview(item) {
    const card = el('article', 'review-card');
    const quote = el('blockquote');
    const text = item.review || '';
    quote.append(el('p', 'review-text', text));

    const attribution = el('footer', 'review-attribution');
    const avatar = el('span', 'review-avatar', item.initials || item.author?.split(/[\s&]+/).filter(Boolean).slice(0, 2).map(part => part[0]).join('') || '');
    avatar.setAttribute('aria-hidden', 'true');
    const byline = el('div', 'review-byline');
    byline.append(el('cite', '', item.author));
    const metadata = [item.eventType, item.location].filter(Boolean).join(' · ');
    if (metadata) byline.append(el('p', 'review-meta', metadata));
    attribution.append(avatar, byline);

    const sourceName = item.source?.toLowerCase();
    if (Object.hasOwn(platformNames, sourceName)) {
      const sourceUrl = httpsLink(item.sourceUrl);
      const source = sourceUrl ? reviewExternalLink(sourceUrl, 'review-source') : el('span', 'review-source');
      source.setAttribute('aria-label', `Sursa: ${platformNames[sourceName]}`);
      if (!sourceUrl) source.setAttribute('role', 'img');
      source.append(reviewPlatformLogo(sourceName));
      attribution.append(source);
    }
    if (validRating(item.rating)) attribution.append(reviewStars(item.rating));
    card.append(quote, attribution);
    return card;
  }

  function updateControls() {
    const maxScroll = stage.scrollWidth - stage.clientWidth;
    const left = stage.scrollLeft;
    const hidden = maxScroll <= 1;
    const atStart = left <= 1;
    const atEnd = left >= maxScroll - 1;
    if (controls.hidden !== hidden) controls.hidden = hidden;
    if (prev.disabled !== atStart) prev.disabled = atStart;
    if (next.disabled !== atEnd) next.disabled = atEnd;
  }

  function move(direction) {
    if (!stage.children[1]) return;
    const step = stage.children[1].offsetLeft - stage.children[0].offsetLeft;
    stage.scrollBy({ left: direction * step, behavior: motion.matches ? 'instant' : 'smooth' });
  }

  prev.append(reviewIcon('left'));
  next.append(reviewIcon('right'));
  prev.addEventListener('click', () => move(-1));
  next.addEventListener('click', () => move(1));
  stage.addEventListener('scroll', updateControls, { passive: true });
  stage.addEventListener('keydown', event => {
    if (event.target !== stage || !['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    move(event.key === 'ArrowLeft' ? -1 : 1);
  });

  renderPlatforms();
  interactive.hidden = false;
  const ordered = items.map(item => ({ item, length: [...(item.review || '')].length }));
  ordered.sort((first, second) => second.length - first.length);
  stage.replaceChildren(...ordered.map(({ item }) => buildReview(item)));
  updateControls();
  $('.reviews-fallback', root).hidden = true;
  new ResizeObserver(updateControls).observe(stage);
  observeReveal(intro);
  if (!proof.hidden) observeReveal(proof, 75);
  observeReveal(spotlight, 100);
}

function galleryInstagramUrl(value) {
  if (!value) return null;
  try {
    const url = new URL(value);
    const post = url.pathname.match(/^\/(p|reel)\/([\w-]+)\/?$/);
    if (!post || !['https://www.instagram.com', 'https://instagram.com'].includes(url.origin)) return null;
    return `https://www.instagram.com/${post[1]}/${post[2]}/`;
  } catch {
    return null;
  }
}

function setupGallery(config) {
  const root = $('#galerie');
  const grid = $('#gallery-grid', root);
  const empty = $('.gallery-empty', root);
  const filters = [...root.querySelectorAll('[data-gallery-filter]')];
  const instagramIcon = $('.gallery-social svg', root);
  const photo = $('.gallery-lightbox', root);
  const photoImage = $('.gallery-photo-stage img', photo);
  const photoStage = photoImage.parentElement;
  const photoTitle = $('#gallery-photo-title', photo);
  const photoDescription = $('.gallery-photo-description', photo);
  const photoPosition = $('.gallery-photo-position', photo);
  const prev = $('.gallery-prev', photo);
  const next = $('.gallery-next', photo);
  const video = $('.gallery-video', root);
  const videoTitle = $('#gallery-video-title', video);
  const embed = $('.gallery-video-embed', video);
  const videoStatus = $('.gallery-video-status', video);
  const videoLink = $('.gallery-video-link', video);
  const videoLinkFallback = videoLink.href;
  const items = config.flatMap(item => {
    if (item.type === 'image' && item.src) return [item];
    const instagramUrl = item.type === 'video' && galleryInstagramUrl(item.instagramUrl);
    return instagramUrl && item.thumbnail ? [{ ...item, instagramUrl }] : [];
  });

  let filtered = [];
  let photos = [];
  let position = 0;
  let opener;
  let swipe;
  let instagramScript;
  let embedObserver;
  let embedTimeout;
  let activePost;
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('gallery-reveal');
      observer.unobserve(entry.target);
    }
  }, { threshold: .12 });

  function showPhoto() {
    const item = photos[position];
    photo.classList.toggle('is-portrait', item.height > item.width);
    photoImage.alt = item.alt || item.title || '';
    photoImage.width = item.width || 0;
    photoImage.height = item.height || 0;
    photoImage.src = item.src;
    photoTitle.textContent = item.title || item.alt || 'Fotografie';
    photoDescription.textContent = item.description || '';
    photoPosition.textContent = [position + 1, photos.length].map(value =>
      String(value).padStart(2, '0')).join(' / ');
    prev.hidden = next.hidden = photos.length < 2;
  }

  function movePhoto(direction) {
    position = (position + direction + photos.length) % photos.length;
    showPhoto();
  }

  function loadInstagramScript() {
    if (!instagramScript) {
      instagramScript = new Promise((resolve, reject) => {
        const script = el('script');
        script.async = true;
        script.src = 'https://www.instagram.com/embed.js';
        script.addEventListener('load', resolve, { once: true });
        script.addEventListener('error', reject, { once: true });
        document.head.append(script);
      });
    }
    return instagramScript;
  }

  function showVideo(item) {
    videoTitle.textContent = item.title || 'Clip Instagram';
    videoLink.href = item.instagramUrl;
    videoStatus.textContent = 'Se încarcă postarea Instagram…';
    const quote = el('blockquote', 'instagram-media');
    quote.dataset.instgrmPermalink = item.instagramUrl;
    quote.dataset.instgrmVersion = '14';
    embed.replaceChildren(quote);
    activePost = quote;
    video.showModal();

    function unavailable() {
      if (activePost !== quote || !video.open) return;
      clearTimeout(embedTimeout);
      videoStatus.textContent = 'Postarea poate fi deschisă direct pe Instagram.';
    }

    embedObserver = new MutationObserver(() => {
      const frame = embed.querySelector('iframe');
      if (!frame) return;
      embedObserver.disconnect();
      frame.addEventListener('load', () => {
        if (activePost !== quote || !video.open) return;
        if (frame.getBoundingClientRect().height > 2) {
          clearTimeout(embedTimeout);
          videoStatus.textContent = '';
        }
      }, { once: true });
    });
    embedObserver.observe(embed, { childList: true, subtree: true });
    embedTimeout = setTimeout(unavailable, 8000);
    loadInstagramScript().then(() => {
      if (activePost === quote && video.open) window.instgrm.Embeds.process();
    }).catch(unavailable);
  }

  function makeTile(item) {
    const tile = el('button', 'gallery-tile');
    tile.type = 'button';
    tile.dataset.layout = item.layout || 'standard';
    tile.setAttribute('aria-haspopup', 'dialog');
    const title = item.title || item.alt || (item.type === 'video' ? 'Clip Instagram' : 'Fotografie');
    tile.setAttribute('aria-label', `Deschide: ${title}`);

    const image = el('img');
    image.alt = item.alt || title;
    image.decoding = 'async';
    image.loading = 'lazy';
    image.width = item.width || 960;
    image.height = item.height || 640;
    if (item.srcset) {
      image.sizes = item.layout === 'featured'
        ? 'auto, (max-width: 720px) 94vw, (max-width: 980px) 64vw, 285px'
        : 'auto, (max-width: 720px) 46vw, (max-width: 980px) 32vw, 380px';
      image.srcset = item.srcset;
    }
    image.src = item.thumbnail || item.src;
    tile.append(image);

    const overlay = el('span', 'gallery-tile-overlay');
    overlay.setAttribute('aria-hidden', 'true');
    overlay.append(el('span', '', title));
    if (item.type === 'video') {
      const play = el('span', 'gallery-play');
      play.setAttribute('aria-hidden', 'true');
      const badge = el('span', 'gallery-instagram-badge');
      badge.setAttribute('aria-hidden', 'true');
      badge.append(instagramIcon.cloneNode(true));
      tile.append(play, badge);
      if (item.duration) tile.append(el('span', 'gallery-duration', item.duration));
    } else {
      overlay.append(el('span', 'gallery-expand', '↗'));
    }
    tile.append(overlay);
    tile.addEventListener('click', () => {
      opener = tile;
      if (item.type === 'video') {
        showVideo(item);
        return;
      }
      photos = filtered;
      position = photos.indexOf(item);
      showPhoto();
      photo.showModal();
    });
    observer.observe(tile);
    return tile;
  }

  function renderGallery(type) {
    filtered = items.filter(item => item.type === type);
    grid.dataset.media = type;
    observer.disconnect();
    grid.replaceChildren(...filtered.map(makeTile));
    empty.hidden = filtered.length > 0;
    empty.textContent = type === 'video'
      ? 'Momentan nu există clipuri în galerie.'
      : 'Momentan nu există fotografii în galerie.';
  }

  filters.forEach(button => button.addEventListener('click', () => {
    if (button.getAttribute('aria-pressed') === 'true') return;
    filters.forEach(filter => filter.setAttribute('aria-pressed', String(filter === button)));
    renderGallery(button.dataset.galleryFilter);
  }));
  renderGallery('image');

  function clearVideo() {
    activePost = null;
    embedObserver?.disconnect();
    clearTimeout(embedTimeout);
    embed.replaceChildren();
    videoLink.href = videoLinkFallback;
    videoStatus.textContent = '';
  }

  function closeDialog(dialog) {
    if (dialog === video) clearVideo();
    dialog.close();
    opener?.focus({ preventScroll: true });
  }

  for (const dialog of [photo, video]) {
    $('.gallery-close', dialog).addEventListener('click', () => closeDialog(dialog));
    dialog.addEventListener('cancel', event => {
      event.preventDefault();
      closeDialog(dialog);
    });
    dialog.addEventListener('click', event => {
      if (event.target === dialog || event.target === photoStage) closeDialog(dialog);
    });
    dialog.addEventListener('close', () => {
      if (dialog.open) return;
      opener?.focus({ preventScroll: true });
    });
  }

  prev.addEventListener('click', () => movePhoto(-1));
  next.addEventListener('click', () => movePhoto(1));
  photoImage.addEventListener('load', () => {
    photo.classList.toggle('is-portrait', photoImage.naturalHeight > photoImage.naturalWidth);
  });
  photo.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    movePhoto(event.key === 'ArrowLeft' ? -1 : 1);
  });
  photoStage.addEventListener('touchstart', event => {
    swipe = event.touches.length === 1 ? event.touches[0] : null;
  }, { passive: true });
  photoStage.addEventListener('touchend', event => {
    if (!swipe) return;
    const { clientX, clientY } = event.changedTouches[0];
    const horizontal = clientX - swipe.clientX;
    const vertical = clientY - swipe.clientY;
    swipe = null;
    if (Math.abs(horizontal) > 45 && Math.abs(horizontal) > Math.abs(vertical)) {
      movePhoto(horizontal > 0 ? -1 : 1);
    }
  }, { passive: true });
  photoStage.addEventListener('touchcancel', () => { swipe = null; });
  photo.addEventListener('close', () => { swipe = null; });

  video.addEventListener('close', () => {
    if (!video.open && activePost) clearVideo();
  });
}

setupGallery(content.galleryItems || []);
setupReviews(content.reviews || [], content.reviewPlatforms || {});

function setupFaq() {
  const faq = $('#intrebari-frecvente');
  const tablist = $('.faq-tabs', faq);
  const tabs = [...tablist.querySelectorAll('[role="tab"]')];
  const groups = tabs.map(tab => document.getElementById(tab.getAttribute('aria-controls')));
  if (!tabs.length || groups.some(group => !group)) return;
  const questions = groups.map(group => [...group.querySelectorAll('details')]);
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let active = -1;

  tabs.forEach((tab, index) => {
    $('.faq-count', tab).textContent = questions[index].length;
    tab.style.setProperty('--faq-delay', `${index * 60}ms`);
    const group = groups[index];
    group.setAttribute('role', 'tabpanel');
    group.setAttribute('aria-labelledby', tab.id);
    $('.faq-group-title', group).hidden = true;
    questions[index].forEach((question, position) => {
      question.style.setProperty('--faq-delay', `${position * 60}ms`);
    });
    tab.addEventListener('click', () => selectCategory(index));
    tab.addEventListener('keydown', event => {
      let target;
      if (event.key === 'Home') target = 0;
      else if (event.key === 'End') target = tabs.length - 1;
      else if (event.key === 'ArrowLeft') target = (index + tabs.length - 1) % tabs.length;
      else if (event.key === 'ArrowRight') target = (index + 1) % tabs.length;
      else return;
      event.preventDefault();
      selectCategory(target);
      tabs[target].focus({ preventScroll: true });
    });
  });

  function selectCategory(index) {
    if (index === active) return;
    if (active !== -1) faq.classList.remove('faq-entered');
    tabs.forEach((tab, position) => {
      const selected = position === index;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
      groups[position].hidden = !selected;
      groups[position].classList.toggle('faq-changing', selected && active !== -1 && !motion.matches);
    });
    questions[index].forEach((question, position) => { question.open = position === 0; });
    active = index;
  }

  selectCategory(0);
  faq.classList.add('faq-enhanced');
  tablist.hidden = false;
  if (!motion.matches && 'IntersectionObserver' in window) {
    const entry = new IntersectionObserver(entries => {
      if (!entries.some(item => item.isIntersecting)) return;
      entry.disconnect();
      faq.classList.add('faq-entered');
      setTimeout(() => faq.classList.remove('faq-entered'), 240 + questions[active].length * 60);
    });
    entry.observe($('.faq-intro', faq));
  }
}

setupFaq();
const offerForm = $('#offer-form');
const eventDate = offerForm.elements.namedItem('data');

function setMinimumEventDate() {
  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  eventDate.min = `${today.getFullYear()}-${month}-${day}`;
}

setMinimumEventDate();
eventDate.addEventListener('focus', setMinimumEventDate);
window.addEventListener('focus', setMinimumEventDate);
offerForm.addEventListener('submit', event => {
  event.preventDefault();
  setMinimumEventDate();
  if (!eventDate.reportValidity()) return;

  const f = new FormData(offerForm);
  const msg = `Bună! Aș dori o ofertă, Lee Events. \nNume: ${f.get('nume')}\nEveniment: ${f.get('tip')}\nData: ${f.get('data')}\nLocalitatea: ${f.get('localitate')}\nDetalii: ${f.get('detalii') || '-'}`;
  window.open('https://wa.me/40747752366?text=' + encodeURIComponent(msg), '_blank', 'noopener,noreferrer');
});

// Meniu fix și indicator activ sincronizat cu secțiunea vizibilă.
const header = $('.header');
const sections = navLinks.map(link => document.querySelector(link.getAttribute('href'))).filter(Boolean);
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const headerControls = [menu, toggle, $('.header-offer', header)];
const headerAnimations = new WeakMap();
let activeSection;

function updateHeader() {
  const scrolled = window.scrollY > 24;
  if (header.classList.contains('is-scrolled') === scrolled) return;

  const initialPositions = headerControls.map(control => control.getBoundingClientRect().left);
  header.classList.toggle('is-scrolled', scrolled);

  headerControls.forEach((control, index) => {
    headerAnimations.get(control)?.cancel();
    if (reducedMotion.matches) return;
    const distance = initialPositions[index] - control.getBoundingClientRect().left;
    if (Math.abs(distance) < 1) return;
    headerAnimations.set(control, control.animate(
      [{ translate: `${distance}px 0` }, { translate: '0px 0' }],
      { duration: 500, easing: 'cubic-bezier(.22, 1, .36, 1)' }
    ));
  });
}

function updateNavigation() {
  updateHeader();
  const probe = (header.offsetHeight + window.innerHeight) / 2;
  let current = sections[0]?.id;
  for (const section of sections) {
    if (section.getBoundingClientRect().top <= probe) current = section.id;
  }
  if (current === activeSection) return;
  activeSection = current;
  navLinks.forEach(link => {
    const active = link.getAttribute('href') === '#' + current;
    link.classList.toggle('active', active);
    if (active) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
}
window.addEventListener('scroll', updateNavigation, { passive: true });
window.addEventListener('resize', updateNavigation);

let sectionScrollFrame = null;

function cancelSectionScroll() {
  if (sectionScrollFrame === null) return;
  cancelAnimationFrame(sectionScrollFrame);
  sectionScrollFrame = null;
}

function scrollToSection(top) {
  cancelSectionScroll();
  const start = window.scrollY;
  const limit = document.documentElement.scrollHeight - window.innerHeight;
  const target = Math.max(0, Math.min(top, limit));
  const distance = target - start;
  if (reducedMotion.matches || Math.abs(distance) < 2) {
    window.scrollTo({ top: target, behavior: 'instant' });
    return;
  }

  const duration = Math.min(1150, 420 + Math.sqrt(Math.abs(distance)) * 11);
  const startTime = performance.now();
  function move(now) {
    const progress = Math.min(1, (now - startTime) / duration);
    const eased = progress ** 3 * (progress * (progress * 6 - 15) + 10);
    window.scrollTo({ top: start + distance * eased, behavior: 'instant' });
    sectionScrollFrame = progress < 1 ? requestAnimationFrame(move) : null;
  }
  sectionScrollFrame = requestAnimationFrame(move);
}

window.addEventListener('wheel', cancelSectionScroll, { passive: true });
window.addEventListener('touchstart', cancelSectionScroll, { passive: true });
window.addEventListener('popstate', cancelSectionScroll);
const scrollKeys = new Set(['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' ']);
window.addEventListener('keydown', event => {
  if (scrollKeys.has(event.key)) cancelSectionScroll();
});

const sectionLinks = [
  ...navLinks,
  ...document.querySelectorAll('.hero .scroll, .hero-buttons a[href^="#"], .event-type-card a[data-event-type], .faq-actions a[href="#contact"]')
];
sectionLinks.forEach(link => link.addEventListener('click', event => {
  if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  const hash = link.getAttribute('href');
  const section = document.querySelector(hash);
  if (!section) return;

  event.preventDefault();
  if (link.dataset.eventType) $('#offer-form').elements.namedItem('tip').value = link.dataset.eventType;
  const bounds = section.getBoundingClientRect();
  const sectionTop = window.scrollY + bounds.top - header.offsetHeight;
  const availableHeight = window.innerHeight - header.offsetHeight;
  const centerOffset = hash === '#contact' ? (bounds.height - availableHeight) / 2 : 0;

  if (location.hash !== hash) history.pushState(null, '', hash);
  if (!section.hasAttribute('tabindex')) section.setAttribute('tabindex', '-1');
  section.focus({ preventScroll: true });
  scrollToSection(sectionTop + centerOffset);
}));
updateNavigation();
