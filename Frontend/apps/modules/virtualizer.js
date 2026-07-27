/**
 * Нативный виртуализатор VRAM с расширенным буфером и плавной подгрузкой
 */

let isFastScrolling = false;
let scrollTimeout = null;
let lastScrollTop = window.scrollY;
let lastScrollTime = Date.now();
let isScrollListenerAttached = false;

const VELOCITY_THRESHOLD = 2.5; 

// Прозрачный 1x1 GIF для освобождения VRAM
const EMPTY_PIXEL = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

// 🎯 Увеличиваем буфер до 1200px, так как картинки легкие и должны успевать рендериться до входа в кадр
const OBSERVER_OPTIONS = {
  root: null,
  rootMargin: '1200px 0px 1200px 0px',
  threshold: 0
};

export function initChunkVirtualizer(containerId = 'album-gallery-container') {
  const container = document.getElementById(containerId);
  if (!container) return;

  const cards = container.querySelectorAll('.gallery-card');
  if (!cards.length) return;

  if (!isScrollListenerAttached) {
    window.addEventListener('scroll', handleScrollVelocity, { passive: true });
    isScrollListenerAttached = true;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const card = entry.target;

      if (entry.isIntersecting) {
        card.dataset.inView = 'true';

        if (!isFastScrolling) {
          mountImagesInCard(card);
        }
      } else {
        card.dataset.inView = 'false';
        // Выгружаем только если карточка реально далеко от экрана (сработал большой rootMargin)
        unmountImagesFromCard(card);
      }
    });
  }, OBSERVER_OPTIONS);

  cards.forEach((card) => {
    const img = card.querySelector('img');
    if (img) {
      if (!img.dataset.originalSrc) {
        img.dataset.originalSrc = img.getAttribute('data-original-src') || img.src;
      }
      img.setAttribute('decoding', 'async');
    }

    observer.observe(card);
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
    mountVisibleCardsOnly();
  }, 100);
}

function mountVisibleCardsOnly() {
  const visibleCards = document.querySelectorAll('.gallery-card[data-in-view="true"]');
  visibleCards.forEach((card) => {
    mountImagesInCard(card);
  });
}

function mountImagesInCard(card) {
  if (card.dataset.isMounted === 'true') return;

  const img = card.querySelector('img');
  if (!img) return;

  const originalSrc = img.dataset.originalSrc;
  if (!originalSrc) return;

  card.dataset.isMounted = 'true';

  // Если картинка уже есть в DOM и совпадает — просто включаем класс
  if (img.src === originalSrc) {
    img.classList.add('is-loaded');
    return;
  }

  const tempImg = new Image();
  tempImg.src = originalSrc;

  tempImg.decode()
    .then(() => {
      if (card.dataset.inView === 'true') {
        img.src = originalSrc;
        img.classList.add('is-loaded');
      } else {
        card.dataset.isMounted = 'false';
      }
    })
    .catch(() => {
      if (card.dataset.inView === 'true') {
        img.src = originalSrc;
        img.classList.add('is-loaded');
      } else {
        card.dataset.isMounted = 'false';
      }
    });
}

function unmountImagesFromCard(card) {
  card.dataset.isMounted = 'false';

  const img = card.querySelector('img');
  if (!img) return;

  // Очищаем источник для экономии памяти, когда карточка далеко
  img.src = EMPTY_PIXEL;
  img.removeAttribute('src'); 
  img.classList.remove('is-loaded');
}