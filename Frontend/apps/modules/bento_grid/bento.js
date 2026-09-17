// --- BENTO_GRID/BENTO.JS ---

import { fetchAlbumManifest } from '../api.js';
import { setLightboxPhotos, initLightboxEvents } from '../lightbox/lightbox.js';
import { initChunkVirtualizer } from '../virtualizer.js';
import { GridEngine } from './grid/grid-engine.js';

let cachedPhotos = [];

export async function renderAlbumGallery(albumId) {
  const container = document.getElementById('album-gallery-container');
  const crumbTitle = document.getElementById('crumb-album-title');

  if (!container) {
    console.error('❌ [Bento] Ошибка: #album-gallery-container не найден в DOM');
    return;
  }

  // 1. Запрашиваем манифест альбома
  const albumData = await fetchAlbumManifest(albumId);

  if (!albumData || !albumData.photos || albumData.photos.length === 0) {
    console.error(`❌ [Bento] Не удалось загрузить фотографии для альбома: "${albumId}"`);
    if (crumbTitle) crumbTitle.textContent = 'ОШИБКА ЗАГРУЗКИ';
    return;
  }

  // 2. Обновляем хлебные крошки названим альбома
  if (crumbTitle && albumData.catalog?.title) {
    crumbTitle.textContent = albumData.catalog.title.toUpperCase();
  }

  // 3. Отдаём полные данные в Lightbox
  setLightboxPhotos(albumData.photos);

  // 4. Формируем массив для Bento-движка с гарантированным флагом isPortrait
  cachedPhotos = albumData.photos.map((item, index) => ({
    ...item,
    originalIndex: index,
    isPortrait: item.isPortrait ?? (item.type === 'portrait')
  }));

  // 5. Строим Bento-сетку
  buildSmartBentoGallery(cachedPhotos);

  // 6. Запускаем виртуализатор VRAM
  requestAnimationFrame(() => {
    initChunkVirtualizer('album-gallery-container');
  });
}

function buildSmartBentoGallery(photos) {
  const container = document.getElementById('album-gallery-container');
  if (!container || !photos || photos.length === 0) return;

  container.innerHTML = '';
  
  const gridEngine = new GridEngine();
  const isMobile = window.innerWidth < 768;

  // 🚀 Генерируем HTML рядов
  const fullHtml = gridEngine.generateFullGrid(photos, isMobile);

  container.innerHTML = fullHtml;
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

let lastWindowWidth = window.innerWidth;
let resizeTimeout;

window.addEventListener('resize', () => {
  if (window.innerWidth === lastWindowWidth) return;
  
  lastWindowWidth = window.innerWidth;

  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    if (cachedPhotos.length > 0) {
      buildSmartBentoGallery(cachedPhotos);
      initChunkVirtualizer('album-gallery-container');
    }
  }, 150);
});
