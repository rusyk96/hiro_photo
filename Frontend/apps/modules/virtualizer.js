/**
 * Нативный виртуализатор VRAM с жестким лимитом зоны видимости
 */

let isFastScrolling = false;
let scrollTimeout = null;
let lastScrollTop = window.scrollY;
let lastScrollTime = Date.now();
let isScrollListenerAttached = false;

const VELOCITY_THRESHOLD = 2.0; 

// Прозрачный 1x1 GIF для освобождения декодированной памяти VRAM
const EMPTY_PIXEL = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

const OBSERVER_OPTIONS = {
  root: null,
  rootMargin: '350px 0px 350px 0px', // Небольшой буфер для плавного скролла
  threshold: 0
};

export function initChunkVirtualizer(containerId = 'album-gallery-container') {
  const container = document.getElementById(containerId);
  if (!container) return;

  // 🎯 Наблюдаем строго за .gallery-card, так как у них есть физический DOM-box (aspect-ratio)
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
        unmountImagesFromCard(card); // 💥 Жёсткая выгрузка при выходе из viewport
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
  }, 80);
}

function mountVisibleCardsOnly() {
  const visibleCards = document.querySelectorAll('.gallery-card[data-in-view="true"]');
  visibleCards.forEach((card) => {
    mountImagesInCard(card);
  });
}

function mountImagesInCard(card) {
  // Если уже смонтировано — пропускаем
  if (card.dataset.isMounted === 'true') return;

  const img = card.querySelector('img');
  if (!img) return;

  const originalSrc = img.dataset.originalSrc;
  if (!originalSrc) return;

  card.dataset.isMounted = 'true';

  const tempImg = new Image();
  tempImg.src = originalSrc;

  tempImg.decode()
    .then(() => {
      // 🛑 Двойная проверка: монтируем ТОЛЬКО если карточка ДО СИХ ПОР видима!
      if (card.dataset.inView === 'true') {
        img.src = originalSrc;
        img.classList.add('is-loaded');
      } else {
        // Если пока декодировалось, юзер уже ускроллил — сбрасываем статус
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

  // 1. Ставим чистый пиксель
  img.src = EMPTY_PIXEL;
  // 2. Полностью удаляем атрибут src для гарантированного высвобождения памяти браком
  img.removeAttribute('src'); 
  img.classList.remove('is-loaded');
}