/**
 * Нативный виртуализатор VRAM с виртуализацией DOM
 */

let isFastScrolling = false;
let scrollTimeout = null;
let lastScrollTop = window.scrollY;
let lastScrollTime = Date.now();
let isScrollListenerAttached = false;

const VELOCITY_THRESHOLD = 2.5; 

// Прозрачный 1x1 GIF для освобождения VRAM
const EMPTY_PIXEL = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

// 🚀 Запас прогрузки: ровно 2 экрана (200vh) сверху и 2 экрана снизу
// Это обеспечивает плавный скролл с упреждающей загрузкой и быстрым сбросом VRAM
const OBSERVER_OPTIONS = {
  root: null,
  rootMargin: '200vh 0px 200vh 0px',
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
        // Выгружаем из VRAM, когда карточка уходит за пределы 2 экранов
        unmountImagesFromCard(card);
      }
    });
  }, OBSERVER_OPTIONS);

  cards.forEach((card) => {
    const img = card.querySelector('img');
    if (img) {
      const src = img.getAttribute('data-original-src') || img.dataset.originalSrc || img.src;
      if (src && src !== EMPTY_PIXEL) {
        img.dataset.originalSrc = src;
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

  // Функция для проявки фото и отключения скелетона
  const revealCard = () => {
    img.classList.add('is-loaded');
    card.classList.remove('skeleton-active');
  };

  // Если URL уже совпадает и картинка загружена (из кэша)
  if (img.src === originalSrc && img.complete && img.naturalWidth > 0) {
    revealCard();
    return;
  }

  // Назначаем реальный URL
  img.src = originalSrc;

  // Декодируем растр перед показом для плавности
  if (img.decode) {
    img.decode()
      .then(() => revealCard())
      .catch(() => revealCard());
  } else {
    img.onload = () => revealCard();
    img.onerror = () => card.classList.remove('skeleton-active');
  }
}

function unmountImagesFromCard(card) {
  card.dataset.isMounted = 'false';

  const img = card.querySelector('img');
  if (!img) return;

  // Освобождаем ресурсы VRAM
  img.src = EMPTY_PIXEL;
  img.removeAttribute('src'); 
  img.classList.remove('is-loaded');

  // Возвращаем скелетон для повторного скролла
  card.classList.add('skeleton-active');
}

// 🚀 ЭКСПОРТ-АЛИАС (для поддержки импортов)
export { initChunkVirtualizer as initVirtualizer };