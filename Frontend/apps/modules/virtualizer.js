/**
 * Нативный виртуализатор VRAM (Оптимизированный без фризов)
 */

let isFastScrolling = false;
let scrollTimeout = null;
let lastScrollTop = window.scrollY;
let lastScrollTime = Date.now();
let isScrollListenerAttached = false;

const VELOCITY_THRESHOLD = 3.0; // Чуть повысим порог для сглаживания
const EMPTY_PIXEL = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

// На мобилках уменьшаем запас, чтобы не перегружать VRAM
const isMobile = window.innerWidth <= 768;
const OBSERVER_OPTIONS = {
  root: null,
  rootMargin: isMobile ? '600px 0px 600px 0px' : '1000px 0px 1000px 0px',
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
        unmountImagesFromCard(card);
      }
    });
  }, OBSERVER_OPTIONS);

  cards.forEach((card) => {
    const img = card.querySelector('img');
    if (img) {
      const realSrc = img.getAttribute('data-original-src') || img.dataset.originalSrc || img.src;
      if (realSrc && realSrc !== EMPTY_PIXEL) {
        img.dataset.originalSrc = realSrc;
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
  }, 120);
}

function mountVisibleCardsOnly() {
  const visibleCards = document.querySelectorAll('.gallery-card[data-in-view="true"]');
  visibleCards.forEach((card) => {
    mountImagesInCard(card);
  });
}

function mountImagesInCard(card) {
  const img = card.querySelector('img');
  if (!img) return;

  const originalSrc = img.dataset.originalSrc || img.getAttribute('data-original-src');
  if (!originalSrc || originalSrc === EMPTY_PIXEL) return;

  if (card.dataset.isMounted === 'true' && img.src === originalSrc) return;
  card.dataset.isMounted = 'true';

  // 🚀 ШАГ 1: Мгновенно включаем скелетон и прячем растр
  card.classList.add('skeleton-active');
  img.style.opacity = '0';

  // 🚀 ШАГ 2: Даём браузеру 1 кадр на отрисовку скелетона (Paint)
  requestAnimationFrame(() => {
    // Если пользователь успел быстро пролистать мимо, отменяем
    if (card.dataset.inView !== 'true') {
      card.dataset.isMounted = 'false';
      return;
    }

    // Подставляем реальный источник только ПОСЛЕ того, как скелетон отрисован
    img.src = originalSrc;

    // 🚀 ШАГ 3: Ждём декодирования растра
    img.decode()
      .then(() => {
        if (card.dataset.inView !== 'true') {
          card.dataset.isMounted = 'false';
          return;
        }

        // Отменяем висящие анимации
        img.getAnimations().forEach(a => a.cancel());

        // Снимаем скелетон
        card.classList.remove('skeleton-active');
        img.classList.add('is-loaded');

        // Запускаем плавное проявление растра ПОВЕРХ уже показанного скелетона
        img.animate(
          [
            { opacity: 0, transform: 'scale(0.97)' },
            { opacity: 1, transform: 'scale(1)' }
          ],
          {
            duration: 280,
            easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
            fill: 'forwards'
          }
        );
      })
      .catch(() => {
        if (card.dataset.inView === 'true') {
          card.classList.remove('skeleton-active');
          img.classList.add('is-loaded');
          img.style.opacity = '1';
        } else {
          card.dataset.isMounted = 'false';
        }
      });
  });
}


function unmountImagesFromCard(card) {
  card.dataset.isMounted = 'false';

  const img = card.querySelector('img');
  if (!img) return;

  img.getAnimations().forEach(anim => anim.cancel());

  // Возвращаем скелетон и размонтируем растр
  img.style.opacity = '0';
  img.src = EMPTY_PIXEL;
  img.classList.remove('is-loaded');
  
  card.classList.add('skeleton-active');
}
