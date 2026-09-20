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

  // 🚀 Проявка картинки поверх скелетона через WAAPI
  const revealCard = () => {
    void img.offsetHeight; // Reflow для фиксации базового opacity: 0

    if (typeof img.getAnimations === 'function') {
      img.getAnimations().forEach(anim => anim.cancel());
    }

    const animation = img.animate(
      [
        { opacity: 0, transform: 'scale(0.96) translateZ(0)' },
        { opacity: 1, transform: 'scale(1) translateZ(0)' }
      ],
      {
        duration: 400,
        easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
        fill: 'forwards'
      }
    );

    animation.onfinish = () => {
      img.classList.add('is-loaded');
      
      // Плавное угасание скелетона (чтобы он не пропадал резко)
      if (typeof card.animate === 'function') {
        const skelFade = card.animate(
          [{ opacity: 1 }, { opacity: 0 }],
          { duration: 200, easing: 'ease-out' }
        );
        skelFade.onfinish = () => card.classList.remove('skeleton-active');
      } else {
        card.classList.remove('skeleton-active');
      }
    };
  };

  // Гарантируем, что скелетон подложкой активен перед загрузкой картинки
  if (!card.classList.contains('skeleton-active') && !img.classList.contains('is-loaded')) {
    card.classList.add('skeleton-active');
  }

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

  // 1. Отменяем запущенные WAAPI-анимации проявки
  if (typeof img.getAnimations === 'function') {
    img.getAnimations().forEach(anim => anim.cancel());
  }

  // 2. Сбрасываем состояния растра
  img.src = EMPTY_PIXEL;
  img.removeAttribute('src'); 
  img.classList.remove('is-loaded');

  // 3. Возвращаем скелетон для следующего появления
  card.classList.add('skeleton-active');
}

// 🚀 ЭКСПОРТ-АЛИАС (для поддержки импортов)
export { initChunkVirtualizer as initVirtualizer };