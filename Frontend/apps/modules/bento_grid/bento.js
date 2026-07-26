import { fetchManifestPhotos } from '../api.js';
import { setLightboxPhotos, initLightboxEvents } from '../lightbox.js';
import { initChunkVirtualizer } from '../virtualizer.js';
import { VramMonitor } from '../vram-hud.js';
import { GridEngine } from './grids/grid.js';

new VramMonitor();

function isDesktop() {
  return window.innerWidth >= 768;
}

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
    // На мобиле выстраиваем последовательный поток через мобильный паттерн
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
      // Движок берет нужные кадры из массивов и генерирует HTML одного из 8 паттернов
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