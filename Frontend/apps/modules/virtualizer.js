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

const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;

// Увеличенный запас прогрузки карточек (до появления на экране)
const OBSERVER_OPTIONS = {
  root: null,
  rootMargin: '200% 0px 200% 0px',
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
        // Выгружаем из VRAM только когда карточка реально далеко за пределами rootMargin
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

function mountImagesInCard(card) {
  if (card.dataset.isMounted === 'true') return;

  const img = card.querySelector('img');
  if (!img) return;

  const originalSrc = img.dataset.originalSrc;
  if (!originalSrc) return;

  card.dataset.isMounted = 'true';

  // Функция для проявки с гарантированным запуском CSS Transition
  const revealCard = () => {
    // 1. Ждем старта ближайшего кадра отрисовки
    requestAnimationFrame(() => {
      
      // 🚀 КРИТИЧЕСКИ ВАЖНО ДЛЯ МОБИЛОК: Принудительный Reflow.
      // Заставляем движок прочитать высоту. В этот момент браузер понимает: 
      // "Ага, мне нужно применить базовые стили (opacity: 0, scale: 0.96) прямо сейчас!"
      void img.offsetHeight;

      // 2. И только в следующем такте вешаем класс проявки
      requestAnimationFrame(() => {
        img.classList.add('is-loaded');

        // Снимаем подложку скелетона после полного завершения проявки
        setTimeout(() => {
          card.classList.remove('skeleton-active');
        }, 300);
      });
    });
  };

  // Если из кэша — всё равно прогоняем через revealCard для плавности!
  if (img.src === originalSrc && img.complete && img.naturalWidth > 0) {
    revealCard();
    return;
  }

  img.src = originalSrc;

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