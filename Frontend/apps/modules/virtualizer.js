/**
 * Модуль нативной виртуализации Bento-сетки для защиты VRAM в Safari
 */

// Буфер в 600px сверху и снизу: кадры грузятся ДО того, как пользователь до них доскроллит
const OBSERVER_OPTIONS = {
  root: null,
  rootMargin: '600px 0px 600px 0px',
  threshold: 0
};

export function initChunkVirtualizer(containerId = 'album-gallery-container') {
  const container = document.getElementById(containerId);
  if (!container) return;

  // Находим все логические блоки / ряды вашей Bento-сетки
  const chunkRows = container.querySelectorAll('.bento-pattern-row, .bento-row');
  if (!chunkRows.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const chunk = entry.target;

      if (entry.isIntersecting) {
        mountChunk(chunk);
      } else {
        unmountChunk(chunk);
      }
    });
  }, OBSERVER_OPTIONS);

  chunkRows.forEach((chunk) => {
    // 1. Сохраняем исходный HTML блока
    if (!chunk.dataset.rawHtml) {
      chunk.dataset.rawHtml = chunk.innerHTML;
    }

    // 2. Фиксируем реальную высоту, чтобы сетка и скролл не «прыгали»
    const initialHeight = chunk.getBoundingClientRect().height;
    if (initialHeight > 0) {
      chunk.style.minHeight = `${initialHeight}px`;
    }

    chunk.dataset.isMounted = 'true';
    setupAsyncImages(chunk);

    observer.observe(chunk);
  });
}

/**
 * Вгружает картинки обратно при приближении к экрану
 */
function mountChunk(chunk) {
  if (chunk.dataset.isMounted === 'true') return;

  if (chunk.dataset.rawHtml) {
    chunk.innerHTML = chunk.dataset.rawHtml;
    chunk.dataset.isMounted = 'true';
    setupAsyncImages(chunk);
  }
}

/**
 * Полностью чистит DOM выгруженного блока, освобождая видеопамять GPU
 */
function unmountChunk(chunk) {
  if (chunk.dataset.isMounted === 'false') return;

  // Обновляем текущую высоту перед очисткой
  const currentHeight = chunk.getBoundingClientRect().height;
  if (currentHeight > 0) {
    chunk.style.minHeight = `${currentHeight}px`;
  }

  // Очищаем DOM (Safari моментально высвобождает VRAM)
  chunk.innerHTML = '';
  chunk.dataset.isMounted = 'false';
}

/**
 * Включает асинхронное декодирование для предотвращения фризов
 */
function setupAsyncImages(container) {
  const imgs = container.querySelectorAll('img');
  imgs.forEach((img) => {
    img.setAttribute('decoding', 'async');
  });
}