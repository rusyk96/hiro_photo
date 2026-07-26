/**
 * Нативный виртуализатор VRAM с детектором скорости скролла (Scroll Velocity Detection)
 */

let isFastScrolling = false;
let scrollTimeout = null;
let lastScrollTop = window.scrollY;
let lastScrollTime = Date.now();

// Порог скорости (пикселей в миллисекунду). Если скроллим быстрее — это "пролёт"
const VELOCITY_THRESHOLD = 2.5; 

const OBSERVER_OPTIONS = {
  root: null,
  rootMargin: '800px 0px 800px 0px',
  threshold: 0
};

export function initChunkVirtualizer(containerId = 'album-gallery-container') {
  const container = document.getElementById(containerId);
  if (!container) return;

  const chunkRows = container.querySelectorAll('.bento-pattern-row, .bento-row');
  if (!chunkRows.length) return;

  // 1. Отслеживаем скорость скролла окна
  window.addEventListener('scroll', handleScrollVelocity, { passive: true });

  // 2. Инициализируем Observer
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const chunk = entry.target;

      if (entry.isIntersecting) {
        // Если летим на бешеной скорости — НЕ вгружаем VRAM на пролёте
        if (!isFastScrolling) {
          mountImagesInChunk(chunk);
        } else {
          // Помечаем, что этот чанк должен монтироваться, как только скролл замедлится
          chunk.dataset.pendingMount = 'true';
        }
      } else {
        // Выгружаем ВСЕГДА и БЕЗ ЗАДЕРЖЕК, чтобы освобождать VRAM на лету
        unmountImagesFromChunk(chunk);
        chunk.dataset.pendingMount = 'false';
      }
    });
  }, OBSERVER_OPTIONS);

  chunkRows.forEach((chunk) => {
    const imgs = chunk.querySelectorAll('img');
    imgs.forEach((img) => {
      if (!img.dataset.originalSrc) {
        img.dataset.originalSrc = img.src;
      }
      img.setAttribute('decoding', 'async');
    });

    observer.observe(chunk);
  });
}

/**
 * Детектор скорости прокрутки
 */
function handleScrollVelocity() {
  const now = Date.now();
  const currentScrollTop = window.scrollY;
  const deltaTime = now - lastScrollTime;
  const deltaScroll = Math.abs(currentScrollTop - lastScrollTop);

  if (deltaTime > 0) {
    const velocity = deltaScroll / deltaTime;

    // Если скорость выше порога — включаем режим быстрых пролётов
    isFastScrolling = velocity > VELOCITY_THRESHOLD;
  }

  lastScrollTime = now;
  lastScrollTop = currentScrollTop;

  // Когда скролл останавливается или замедляется — догружаем видимые чанки
  clearTimeout(scrollTimeout);
  scrollTimeout = setTimeout(() => {
    isFastScrolling = false;
    processPendingChunks();
  }, 150); // 150мс паузы означает, что скролл замедлился/остановился
}

/**
 * Вгружает чанки, которые были пропущены во время быстрого пролёта
 */
function processPendingChunks() {
  const pendingChunks = document.querySelectorAll('[data-pending-mount="true"]');
  pendingChunks.forEach((chunk) => {
    mountImagesInChunk(chunk);
    chunk.dataset.pendingMount = 'false';
  });
}

function mountImagesInChunk(chunk) {
  if (chunk.dataset.isMounted === 'true') return;

  const imgs = chunk.querySelectorAll('img');
  imgs.forEach((img) => {
    const originalSrc = img.dataset.originalSrc;
    if (originalSrc && img.getAttribute('src') !== originalSrc) {
      img.src = originalSrc;
      
      if (img.complete) {
        img.classList.add('is-loaded');
      } else {
        img.addEventListener('load', () => img.classList.add('is-loaded'), { once: true });
      }
    }
  });

  chunk.dataset.isMounted = 'true';
}

function unmountImagesFromChunk(chunk) {
  // Важно: выгрузка происходит моментально при скролле в любую сторону
  const imgs = chunk.querySelectorAll('img');
  imgs.forEach((img) => {
    img.removeAttribute('src'); 
    img.classList.remove('is-loaded');
  });

  chunk.dataset.isMounted = 'false';
}