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

function mountVisibleCardsOnly() {
  const visibleCards = document.querySelectorAll('.gallery-card[data-in-view="true"]');
  visibleCards.forEach((card) => mountImagesInCard(card));
}

function mountImagesInCard(card) {
  if (card.dataset.isMounted === 'true') return;

  const img = card.querySelector('img');
  if (!img) return;

  const originalSrc = img.dataset.originalSrc;
  if (!originalSrc) return;

  card.dataset.isMounted = 'true';

  const revealCard = () => {
    // 1. Детектируем ориентацию карточки/изображения
    const isVertical = card.offsetHeight > card.offsetWidth || 
                       (img.naturalHeight && img.naturalHeight > img.naturalWidth);

    // 2. ВАРИАТИВНЫЙ БУФЕР: разная задержка и параметры проявки
    const delay = isVertical ? 70 : 40;            // Для вертикалок даем больше времени на расчёт Houdini/Reflow
    const duration = isVertical ? 550 : 400;       // Вертикалки проявляем чуть мягче
    const startScale = isVertical ? 0.98 : 0.96;  // Амплитуда масштабирования

    // Фиксируем стартовую прозрачность до запуска кадра
    img.style.opacity = '0';

    // ⏳ 3. Применяем вариативный таймаут-буфер
    setTimeout(() => {
      // 🚀 4. Двойной rAF для гарантированной отрисовки нулевого кадра в GPU
      requestAnimationFrame(() => {
        void img.offsetHeight; // Reflow-фиксация

        requestAnimationFrame(() => {
          if (typeof img.getAnimations === 'function') {
            img.getAnimations().forEach(anim => anim.cancel());
          }

          // 🚀 5. Аппаратный запуск WAAPI
          const animation = img.animate(
            [
              { opacity: 0, transform: `scale(${startScale}) translateZ(0)` },
              { opacity: 1, transform: 'scale(1) translateZ(0)' }
            ],
            {
              duration: duration,
              easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
              fill: 'forwards'
            }
          );

          animation.onfinish = () => {
            img.classList.add('is-loaded');
            card.classList.remove('skeleton-active');
            img.style.opacity = '';
          };
        });
      });
    }, delay);
  };

  // Проверка кэша
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

  // 1. Отменяем текущие WAAPI-анимации проявки
  if (typeof img.getAnimations === 'function') {
    img.getAnimations().forEach(anim => anim.cancel());
  }

  // 2. Снимаем с картинки инлайн-стили и класс проявки
  img.style.opacity = '0';
  img.classList.remove('is-loaded');

  // 3. Возвращаем скелетон мгновенно без повторной проявки
  card.classList.add('skeleton-active');

  // 4. Освобождаем память VRAM от растра
  img.src = EMPTY_PIXEL;
  img.removeAttribute('src');
}

// 🚀 ЭКСПОРТ-АЛИАС (для поддержки импортов)
export { initChunkVirtualizer as initVirtualizer };