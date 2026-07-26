import { fetchManifestPhotos } from '../api.js';
import { setLightboxPhotos, initLightboxEvents } from '../lightbox.js';
import { initChunkVirtualizer } from '../virtualizer.js';
import { VramMonitor } from '../vram-hud.js';
import { GridEngine } from './grids/grid.js';

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

  // 2. Индексируем кадры для корректной работы Лайтбокса
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

// Внутренняя логика сборки (вызывается из renderAlbumGallery)
function buildSmartBentoGallery(photos) {
  const container = document.getElementById('album-gallery-container');
  if (!container) return;

  container.innerHTML = '';
  const fragment = document.createDocumentFragment();
  const gridEngine = new GridEngine();

  // Делим фото на категории, сохраняя исходные структуры
  let landscapes = photos.filter(p => !p.isPortrait);
  let portraits = photos.filter(p => p.isPortrait);

  // 1. РЕНДЕР ДЛЯ МОБИЛКИ (до 768px)
  if (!isDesktop()) {
    photos.forEach(photo => {
      const rowWrapper = document.createElement('div');
      rowWrapper.innerHTML = gridEngine.renderMobile(photo);
      if (rowWrapper.firstElementChild) {
        fragment.appendChild(rowWrapper.firstElementChild);
      }
    });
  } 
  // 2. РЕНДЕР ДЛЯ ДЕСКТОПА (от 768px) — Работаем через 8 Bento-паттернов
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

  // Заливаем весь скомпонованный фрагмент в DOM
  container.appendChild(fragment);

  // Переинициализируем события лайтбокса
  initLightboxEvents();
}

// 🎯 ВТОРОЙ ЭКСПОРТ (для прелоадера роутера)
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