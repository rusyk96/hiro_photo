/**
 * Нативный виртуализатор VRAM с детектором скорости скролла (Scroll Velocity Detection)
 */

let isFastScrolling = false;
let scrollTimeout = null;
let lastScrollTop = window.scrollY;
let lastScrollTime = Date.now();
let isScrollListenerAttached = false;

// Порог скорости (пикселей в миллисекунду). Если скроллим быстрее — это "пролёт"
const VELOCITY_THRESHOLD = 2.5; 

// Микроскопический прозрачный 1x1 пиксель (занимает 0 байт VRAM)
const EMPTY_PIXEL = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

const OBSERVER_OPTIONS = {
  root: null,
  rootMargin: '1000px 0px 1000px 0px', // Слегка увеличили буфер прорисовывания
  threshold: 0
};

export function initChunkVirtualizer(containerId = 'album-gallery-container') {
  const container = document.getElementById(containerId);
  if (!container) return;

  const chunkRows = container.querySelectorAll('.bento-pattern-row, .bento-row');
  if (!chunkRows.length) return;

  // 1. Отслеживаем скорость скролла окна (строго один раз)
  if (!isScrollListenerAttached) {
    window.addEventListener('scroll', handleScrollVelocity, { passive: true });
    isScrollListenerAttached = true;
  }

  // 2. Инициализируем Observer
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const chunk = entry.target;

      if (entry.isIntersecting) {
        chunk.dataset.inView = 'true';

        // Если летим на бешеной скорости — НЕ вгружаем VRAM на пролёте
        if (!isFastScrolling) {
          mountImagesInChunk(chunk);
        } else {
          // Помечаем, что этот чанк должен монтироваться, как только скролл замедлится
          chunk.dataset.pendingMount = 'true';
        }
      } else {
        // Чанк ушёл — мгновенно чистим и сбрасываем флаги
        chunk.dataset.inView = 'false';
        chunk.dataset.pendingMount = 'false';
        unmountImagesFromChunk(chunk);
      }
    });
  }, OBSERVER_OPTIONS);

  chunkRows.forEach((chunk) => {
    const imgs = chunk.querySelectorAll('img');
    imgs.forEach((img) => {
      if (!img.dataset.originalSrc) {
        // Запоминаем исходный src (или data-src)
        img.dataset.originalSrc = img.src || img.getAttribute('src');
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
    isFastScrolling = velocity > VELOCITY_THRESHOLD;
  }

  lastScrollTime = now;
  lastScrollTop = currentScrollTop;

  // Когда скролл останавливается или замедляется — догружаем видимые чанки
  clearTimeout(scrollTimeout);
  scrollTimeout = setTimeout(() => {
    isFastScrolling = false;
    processPendingChunks();
  }, 120);
}

/**
 * Вгружает чанки, которые были пропущены во время быстрого пролёта
 */
function processPendingChunks() {
  const pendingChunks = document.querySelectorAll('[data-pending-mount="true"]');
  pendingChunks.forEach((chunk) => {
    if (chunk.dataset.inView === 'true') {
      mountImagesInChunk(chunk);
    }
    chunk.dataset.pendingMount = 'false';
  });
}

/**
 * Вгружает реальные изображения в VRAM с предварительным асинхронным декодированием
 */
function mountImagesInChunk(chunk) {
  if (chunk.dataset.isMounted === 'true') return;

  // Фиксируем статус монтирования
  chunk.dataset.isMounted = 'true';

  const imgs = chunk.querySelectorAll('img');
  imgs.forEach((img) => {
    const originalSrc = img.dataset.originalSrc;
    if (!originalSrc) return;

    // Своевременно распаковываем WebP в фоновом потоке GPU
    const tempImg = new Image();
    tempImg.src = originalSrc;

    tempImg.decode()
      .then(() => {
        // ПРОВЕРКА RACE CONDITION:
        // Убеждаемся, что чанк ВСЁ ЕЩЁ находится в зоне видимости и смонтирован!
        if (chunk.dataset.inView === 'true' && chunk.dataset.isMounted === 'true') {
          img.src = originalSrc;
          img.classList.add('is-loaded');
        }
      })
      .catch(() => {
        // Фолбэк на случай ошибки decode()
        if (chunk.dataset.inView === 'true' && chunk.dataset.isMounted === 'true') {
          img.src = originalSrc;
          img.classList.add('is-loaded');
        }
      });
  });
}

/**
 * Выгружает картинки из VRAM
 */
function unmountImagesFromChunk(chunk) {
  chunk.dataset.isMounted = 'false';

  const imgs = chunk.querySelectorAll('img');
  imgs.forEach((img) => {
    img.src = EMPTY_PIXEL;
    img.removeAttribute('src'); // Полностью чистим VRAM
    img.classList.remove('is-loaded');
  });
}