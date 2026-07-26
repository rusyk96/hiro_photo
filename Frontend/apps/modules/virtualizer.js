/**
 * Модуль нативной виртуализации VRAM
 * Сохраняет DOM-структуру, но управляет ресурсами картинок (src)
 */

// Увеличиваем буфер до 1200px (это ~2 экрана вверху и внизу), 
// чтобы картинки гарантированно успевали вгружаться ДО появления на экране.
const OBSERVER_OPTIONS = {
  root: null,
  rootMargin: '1200px 0px 1200px 0px',
  threshold: 0
};

export function initChunkVirtualizer(containerId = 'album-gallery-container') {
  const container = document.getElementById(containerId);
  if (!container) return;

  const chunkRows = container.querySelectorAll('.bento-pattern-row, .bento-row');
  if (!chunkRows.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const chunk = entry.target;

      if (entry.isIntersecting) {
        // Чанк вошёл в буферную зону (40% - 100%) -> Загружаем картинки в VRAM
        mountImagesInChunk(chunk);
      } else {
        // Чанк ушёл далеко (0%) -> Выгружаем тяжелые текстуры из VRAM
        unmountImagesFromChunk(chunk);
      }
    });
  }, OBSERVER_OPTIONS);

  chunkRows.forEach((chunk) => {
    // Сохраняем исходный URL для каждой картинки один раз при инициализации
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
 * Вгружает реальные изображения в VRAM
 */
function mountImagesInChunk(chunk) {
  if (chunk.dataset.isMounted === 'true') return;

  const imgs = chunk.querySelectorAll('img');
  imgs.forEach((img) => {
    const originalSrc = img.dataset.originalSrc;
    if (originalSrc && img.src !== originalSrc) {
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

/**
 * Выгружает тяжелые текстуры из GPU, сохраняя DOM и размеры блоков
 */
function unmountImagesFromChunk(chunk) {
  if (chunk.dataset.isMounted === 'false') return;

  const imgs = chunk.querySelectorAll('img');
  imgs.forEach((img) => {
    // Очищаем src, чтобы Safari высвободил мегабайты декодированного кадра из VRAM
    img.removeAttribute('src'); 
    img.classList.remove('is-loaded');
  });

  chunk.dataset.isMounted = 'false';
}