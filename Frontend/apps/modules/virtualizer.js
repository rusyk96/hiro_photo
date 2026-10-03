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
    const isVertical = card.offsetHeight > card.offsetWidth || 
                       (img.naturalHeight && img.naturalHeight > img.naturalWidth);

    const delay = isVertical ? 70 : 40;
    const duration = isVertical ? 550 : 400;
    const startScale = isVertical ? 0.98 : 0.96;

    setTimeout(() => {
      requestAnimationFrame(() => {
        if (typeof img.getAnimations === 'function') {
          img.getAnimations().forEach(anim => anim.cancel());
        }

        // WAAPI проявляет растр поверх ВСЕГДА ВАЛЯЮЩЕГОСЯ СЕРОГО СКЕЛЕТА
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
          img.style.willChange = '';
        };
      });
    }, delay);
  };

  // Переключаем src
  if (img.src !== originalSrc) {
    // Картинку держим скрыть через класс, пока она загрузится
    img.classList.remove('is-loaded');
    card.classList.add('skeleton-active'); // Скелетон под ней виден СРАЗУ
    img.src = originalSrc;

    if (img.decode) {
      img.decode().then(() => revealCard()).catch(() => revealCard());
    } else {
      img.onload = () => revealCard();
      img.onerror = () => card.classList.remove('skeleton-active');
    }
  } else if (img.complete) {
    revealCard();
  }
}

function unmountImagesFromCard(card) {
  card.dataset.isMounted = 'false';

  const img = card.querySelector('img');
  if (!img) return;

  // Отменяем текущие WAAPI-анимации
  if (typeof img.getAnimations === 'function') {
    img.getAnimations().forEach(anim => anim.cancel());
  }

  // 1. Возвращаем карточке статус скелетона СРАЗУ
  card.classList.add('skeleton-active');
  
  // 2. Снимаем класс загруженности (картинка прячется CSS-правилом .gallery-card:not(.is-loaded) img { opacity: 0 })
  img.classList.remove('is-loaded');
  
  // 3. Убираем инлайн-стили opacity, чтобы CSS полностью управлял картинкой
  img.style.opacity = '';

  // 4. Освобождаем VRAM
  img.src = EMPTY_PIXEL;
}

// 🚀 ЭКСПОРТ-АЛИАС (для поддержки импортов)
export { initChunkVirtualizer as initVirtualizer };