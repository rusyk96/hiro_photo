import { fetchManifestPhotos } from '../api.js';
import { setLightboxPhotos, initLightboxEvents } from '../lightbox.js';
import { initChunkVirtualizer } from '../virtualizer.js';
import { VramMonitor } from '../vram-hud.js';
import { GridEngine } from './grid/grid.js';

new VramMonitor();

function isDesktop() {
  return window.innerWidth >= 768;
}

// 🎯 ГЛАВНЫЙ ЭКСПОРТ ДЛЯ РОУТЕРА
export async function renderAlbumGallery() {
  const container = document.getElementById('album-gallery-container');
  if (!container) return;

  // 1. Загружаем список фото
  const rawPhotos = await fetchManifestPhotos();
  setLightboxPhotos(rawPhotos);

  // 2. Индексируем кадры
  const indexedPhotos = rawPhotos.map((item, index) => ({
    ...item,
    originalIndex: index,
    isPortrait: item.type === 'portrait'
  }));

  // 3. Собираем Bento-сетку
  buildSmartBentoGallery(indexedPhotos);

  // 4. Запускаем виртуализатор
  requestAnimationFrame(() => {
    initChunkVirtualizer('album-gallery-container');
  });
}

function buildSmartBentoGallery(photos) {
  const container = document.getElementById('album-gallery-container');
  if (!container) return;

  container.innerHTML = '';
  const fragment = document.createDocumentFragment();
  const gridEngine = new GridEngine();

  let landscapes = photos.filter(p => !p.isPortrait);
  let portraits = photos.filter(p => p.isPortrait);

  // 1. МОБИЛКА
  if (!isDesktop()) {
    photos.forEach(photo => {
      const rowWrapper = document.createElement('div');
      rowWrapper.innerHTML = gridEngine.renderMobile(photo);
      if (rowWrapper.firstElementChild) {
        fragment.appendChild(rowWrapper.firstElementChild);
      }
    });
  } 
  // 2. ДЕСКТОП (Сборка через Pattern 1)
  else {
    while (landscapes.length > 0 || portraits.length > 0) {
      const rowHtml = gridEngine.buildNextDesktopRow(landscapes, portraits);
      if (!rowHtml) break;

      const rowWrapper = document.createElement('div');
      rowWrapper.innerHTML = rowHtml;

      if (rowWrapper.firstElementChild) {
        fragment.appendChild(rowWrapper.firstElementChild);
      }
    }
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