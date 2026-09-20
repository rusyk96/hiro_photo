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

  // 🚨 ЛОГ 1: Проверяем, сброшен ли класс при прошлом скрытии карточки
  if (img.classList.contains('is-loaded')) {
    console.warn('⚠️ [ПРОПУСК АНИМАЦИИ]: Класс is-loaded не был снят при unmount!', originalSrc.substring(0, 35));
    // Принудительно чистим, чтобы спасти ситуацию
    img.classList.remove('is-loaded'); 
  }

  card.dataset.isMounted = 'true';
  const mountTime = performance.now();

  const revealCard = (sourceType) => {
    const revealTime = performance.now();
    const decodeDuration = Math.round(revealTime - mountTime);

    requestAnimationFrame(() => {
      
      // 🚨 ЛОГ 2: Проверяем, видит ли браузер геометрию
      const currentHeight = img.offsetHeight;
      if (currentHeight === 0) {
        console.error(`❌ [ВЫСОТА 0]: Браузер не успел отрисовать карточку до проявки (${sourceType})`, originalSrc.substring(0, 35));
      }

      requestAnimationFrame(() => {
        img.classList.add('is-loaded');
        
        // 🚨 ЛОГ 3: Успешная проявка и время затраченное на нее
        console.log(`✅ [ПРОЯВКА: ${sourceType}] за ${decodeDuration}ms | Высота: ${currentHeight}px`, originalSrc.substring(0, 35));

        setTimeout(() => {
          card.classList.remove('skeleton-active');
        }, 300);
      });
    });
  };

  // Проверка кэша
  if (img.src === originalSrc && img.complete && img.naturalWidth > 0) {
    revealCard('CACHE');
    return;
  }

  img.src = originalSrc;

  // Обработка загрузки
  if (img.decode) {
    img.decode()
      .then(() => revealCard('DECODE_SUCCESS'))
      .catch((err) => {
        console.warn('⚠️ [DECODE_ERROR]:', err);
        revealCard('DECODE_CATCH');
      });
  } else {
    img.onload = () => revealCard('ONLOAD');
    img.onerror = () => {
      console.error('❌ [ОШИБКА ЗАГРУЗКИ ФОТО]:', originalSrc);
      card.classList.remove('skeleton-active');
    };
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