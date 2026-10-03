// --- VIRTUALIZER.JS ---

let isFastScrolling = false;
let scrollTimeout = null;
let lastScrollTop = typeof window !== 'undefined' ? window.scrollY : 0;
let lastScrollTime = Date.now();
let isScrollListenerAttached = false;

const VELOCITY_THRESHOLD = 2.5; 
const EMPTY_PIXEL = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

const OBSERVER_OPTIONS = {
  root: null,
  rootMargin: '150% 0px 150% 0px', // Запас прогрузки
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
          mountImageOnly(card);
        }
      } else {
        card.dataset.inView = 'false';
        unmountImageOnly(card);
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
    mountVisibleImagesOnly();
  }, 100);
}

function mountVisibleImagesOnly() {
  const visibleCards = document.querySelectorAll('.gallery-card[data-in-view="true"]');
  visibleCards.forEach((card) => mountImageOnly(card));
}

// 🎯 МОНТИРУЕМ ТОЛЬКО РАСТР КАРТИНКИ
function mountImageOnly(card) {
  if (card.dataset.isMounted === 'true') return;

  const img = card.querySelector('img');
  if (!img) return;

  const originalSrc = img.dataset.originalSrc;
  if (!originalSrc) return;

  card.dataset.isMounted = 'true';

  const revealImage = () => {
    if (typeof img.getAnimations === 'function') {
      img.getAnimations().forEach(anim => anim.cancel());
    }

    // Проявляем растр поверх вечного скелета
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
    };
  };

  if (img.src !== originalSrc) {
    img.src = originalSrc;
    if (img.decode) {
      img.decode().then(() => revealImage()).catch(() => revealImage());
    } else {
      img.onload = () => revealImage();
    }
  } else if (img.complete) {
    revealImage();
  }
}

// 🎯 ВЫГРУЖАЕМ ТОЛЬКО РАСТР ИЗ VRAM (Скелетон остаётся нетронутым)
function unmountImageOnly(card) {
  card.dataset.isMounted = 'false';

  const img = card.querySelector('img');
  if (!img) return;

  if (typeof img.getAnimations === 'function') {
    img.getAnimations().forEach(anim => anim.cancel());
  }

  img.classList.remove('is-loaded');
  img.style.opacity = '0';
  img.src = EMPTY_PIXEL; // Очищаем гигабайты VRAM
}

export { initChunkVirtualizer as initVirtualizer };