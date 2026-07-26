/**
 * Нативный виртуализатор VRAM с жестким лимитом зоны видимости
 */

let isFastScrolling = false;
let scrollTimeout = null;
let lastScrollTop = window.scrollY;
let lastScrollTime = Date.now();
let isScrollListenerAttached = false;

const VELOCITY_THRESHOLD = 2.0; 

const EMPTY_PIXEL = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

const OBSERVER_OPTIONS = {
  root: null,
  rootMargin: '250px 0px 250px 0px', 
  threshold: 0
};

export function initChunkVirtualizer(containerId = 'album-gallery-container') {
  const container = document.getElementById(containerId);
  if (!container) return;

  // 🎯 1. Ищем паттерны/ряды
  let chunkRows = container.querySelectorAll('.bento-pattern-row, .bento-row, [class*="pattern-"]');
  
  // 🎯 2. Если рядов нет (фоллбэк) — работаем прямо с карточками!
  if (!chunkRows.length) {
    chunkRows = container.querySelectorAll('.gallery-card');
  }

  if (!chunkRows.length) return;

  if (!isScrollListenerAttached) {
    window.addEventListener('scroll', handleScrollVelocity, { passive: true });
    isScrollListenerAttached = true;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const chunk = entry.target;

      if (entry.isIntersecting) {
        chunk.dataset.inView = 'true';

        if (!isFastScrolling) {
          mountImagesInChunk(chunk);
        }
      } else {
        chunk.dataset.inView = 'false';
        unmountImagesFromChunk(chunk);
      }
    });
  }, OBSERVER_OPTIONS);

  chunkRows.forEach((chunk) => {
    // Подхватываем картинку независимо от того, чанк это или одиночный .gallery-card
    const imgs = chunk.tagName === 'IMG' ? [chunk] : chunk.querySelectorAll('img');
    imgs.forEach((img) => {
      if (!img.dataset.originalSrc) {
        img.dataset.originalSrc = img.getAttribute('data-original-src') || img.src;
      }
      img.setAttribute('decoding', 'async');
    });

    observer.observe(chunk);
  });
}

function handleScrollVelocity() {
  const now = Date.now();
  const currentScrollTop = window.scrollY;
  const deltaTime = now - lastScrollTime;
  const deltaScroll = Math.abs(currentScrollTop - lastScrollTop);

  if (deltaTime > 0) {
    const velocity = deltaScroll / deltaTime;
    isFastScrolling = velocity > VELOCITY_THRESHOLD;
  }

  lastScrollTime = now;
  lastScrollTop = currentScrollTop;

  clearTimeout(scrollTimeout);
  scrollTimeout = setTimeout(() => {
    isFastScrolling = false;
    mountVisibleChunksOnly();
  }, 80);
}

function mountVisibleChunksOnly() {
  const visibleChunks = document.querySelectorAll('[data-in-view="true"]');
  visibleChunks.forEach((chunk) => {
    mountImagesInChunk(chunk);
  });
}

function mountImagesInChunk(chunk) {
  if (chunk.dataset.isMounted === 'true') return;

  chunk.dataset.isMounted = 'true';

  const imgs = chunk.tagName === 'IMG' ? [chunk] : chunk.querySelectorAll('img');
  imgs.forEach((img) => {
    const originalSrc = img.dataset.originalSrc;
    if (!originalSrc) return;

    const tempImg = new Image();
    tempImg.src = originalSrc;

    tempImg.decode()
      .then(() => {
        if (chunk.dataset.inView === 'true' && chunk.dataset.isMounted === 'true') {
          img.src = originalSrc;
          img.classList.add('is-loaded');
        }
      })
      .catch(() => {
        if (chunk.dataset.inView === 'true' && chunk.dataset.isMounted === 'true') {
          img.src = originalSrc;
          img.classList.add('is-loaded');
        }
      });
  });
}

function unmountImagesFromChunk(chunk) {
  chunk.dataset.isMounted = 'false';

  const imgs = chunk.tagName === 'IMG' ? [chunk] : chunk.querySelectorAll('img');
  imgs.forEach((img) => {
    img.src = EMPTY_PIXEL;
    img.removeAttribute('src'); 
    img.classList.remove('is-loaded');
  });
}