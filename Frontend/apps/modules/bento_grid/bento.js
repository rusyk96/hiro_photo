import { fetchManifestPhotos } from '../api.js';
import { setLightboxPhotos, initLightboxEvents } from '../lightbox.js';
import { initChunkVirtualizer } from '../virtualizer.js';
import { VramMonitor } from '../vram-hud.js';
import { GridEngine } from './grid/grid.js';

new VramMonitor();

// Кэш текущих фото для корректной пересборки при resize
let cachedPhotos = [];

// 🎯 ГЛАВНЫЙ ЭКСПОРТ ДЛЯ РОУТЕРА
export async function renderAlbumGallery() {
  const container = document.getElementById('album-gallery-container');
  if (!container) return;

  // 1. Загружаем список фото
  const rawPhotos = await fetchManifestPhotos();
  setLightboxPhotos(rawPhotos);

  // 2. Индексируем кадры
  cachedPhotos = rawPhotos.map((item, index) => ({
    ...item,
    originalIndex: index,
    isPortrait: item.type === 'portrait'
  }));

  // 3. Собираем Bento-сетку
  buildSmartBentoGallery(cachedPhotos);

  // 4. Запускаем виртуализатор с гарантией DOM-layout
  requestAnimationFrame(() => {
    setTimeout(() => {
      initChunkVirtualizer('album-gallery-container');
    }, 0);
  });
}

function buildSmartBentoGallery(photos) {
  const container = document.getElementById('album-gallery-container');
  if (!container || !photos || photos.length === 0) return;

  container.innerHTML = '';
  const fragment = document.createDocumentFragment();
  const gridEngine = new GridEngine();
  const isMobile = window.innerWidth < 768;

  // Клонируем элементы массивов
  let landscapes = photos.filter(p => !p.isPortrait).map(p => ({ ...p }));
  let portraits = photos.filter(p => p.isPortrait).map(p => ({ ...p }));

  let safetyIterator = 0;
  const MAX_ITERATIONS = photos.length;

  // Цикл сборки Bento с раздельной логикой под экраны
  while ((landscapes.length > 0 || portraits.length > 0) && safetyIterator < MAX_ITERATIONS) {
    const prevTotal = landscapes.length + portraits.length;
    
    // Вызов соответствующего билдера
    const rowHtml = isMobile
      ? gridEngine.buildNextMobileRow(landscapes, portraits)
      : gridEngine.buildNextDesktopRow(landscapes, portraits);

    if (!rowHtml) break;

    const rowWrapper = document.createElement('div');
    rowWrapper.innerHTML = rowHtml;

    if (rowWrapper.firstElementChild) {
      fragment.appendChild(rowWrapper.firstElementChild);
    }

    // Страховка от зависания цикла
    if (landscapes.length + portraits.length === prevTotal) {
      console.warn('[Bento Engine] Внимание: Длина массивов не изменилась. Завершаем сборку.');
      break;
    }

    safetyIterator++;
  }

  container.appendChild(fragment);
  initLightboxEvents();
}

export function waitForFirstImages(count = 4) {
  const container = document.getElementById('album-gallery-container');
  if (!container) return Promise.resolve();

  const images = Array.from(container.querySelectorAll('img')).slice(0, count);
  if (images.length === 0) return Promise.resolve();

  const loadPromises = images.map((img) => {
    if (img.complete && img.naturalHeight !== 0) return Promise.resolve();

    return new Promise((resolve) => {
      img.addEventListener('load', resolve, { once: true });
      img.addEventListener('error', resolve, { once: true });
    });
  });

  return Promise.all(loadPromises);
}

// 🎯 Автоматический сброс и пересборка сетки при resize (с debounce)
let resizeTimeout;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    if (cachedPhotos.length > 0) {
      buildSmartBentoGallery(cachedPhotos);
      initChunkVirtualizer('album-gallery-container');
    }
  }, 150);
});