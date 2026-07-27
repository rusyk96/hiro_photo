import { fetchManifestPhotos } from '../api.js';
import { setLightboxPhotos, initLightboxEvents } from '../lightbox.js';
import { initChunkVirtualizer } from '../virtualizer.js';
import { GridEngine } from './grid/grid.js';

let cachedPhotos = [];

export async function renderAlbumGallery() {
  const container = document.getElementById('album-gallery-container');
  if (!container) return;

  const rawPhotos = await fetchManifestPhotos();
  setLightboxPhotos(rawPhotos);

  cachedPhotos = rawPhotos.map((item, index) => ({
    ...item,
    originalIndex: index,
    isPortrait: item.type === 'portrait'
  }));

  buildSmartBentoGallery(cachedPhotos);

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
  
  const gridEngine = new GridEngine();
  const isMobile = window.innerWidth < 768;

  // 🚀 Вся сложная сборка и рандомизация теперь происходят строго один раз внутри движка!
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