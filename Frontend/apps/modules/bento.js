import { THUMB_BASE_URL, fetchManifestPhotos } from './api.js';
import { setLightboxPhotos, initLightboxEvents } from './lightbox.js';
import { initChunkVirtualizer } from './virtualizer.js';
import { VramMonitor } from './vram-hud.js';

new VramMonitor();

function parsePhotosList(manifestData) {
  return manifestData.map((fileItem, index) => {
    const isPortrait = typeof fileItem === 'object' && fileItem.type === 'portrait';
    return {
      fileItem,
      originalIndex: index,
      isPortrait
    };
  });
}

function createCardHtml(fileItem, index) {
  const fileName = typeof fileItem === 'string' ? fileItem : fileItem.name;
  const cleanFileName = fileName.normalize('NFC');
  const photoUrl = `${THUMB_BASE_URL}${encodeURIComponent(cleanFileName)}`;

  return `
    <div class="gallery-card" onclick="openLightbox(${index})">
      <img 
        data-original-src="${photoUrl}" 
        alt="Кадр ${index + 1}" 
        class="gallery-img"
        loading="lazy"
        decoding="async"
        onerror="this.closest('.gallery-card').style.display='none';"
      />
    </div>
  `;
}

export async function renderAlbumGallery() {
  const container = document.getElementById('album-gallery-container');
  if (!container) return;

  const rawPhotos = await fetchManifestPhotos();
  setLightboxPhotos(rawPhotos);

  const analyzedPhotos = parsePhotosList(rawPhotos);
  buildSmartBentoGallery(analyzedPhotos);

  requestAnimationFrame(() => {
    initChunkVirtualizer('album-gallery-container');
  });
}

function buildSmartBentoGallery(photos) {
  const container = document.getElementById('album-gallery-container');
  if (!container) return;

  container.innerHTML = '';
  const fragment = document.createDocumentFragment();

  let landscapes = photos.filter(p => !p.isPortrait);
  let portraits = photos.filter(p => p.isPortrait);
  let isMirrored = false;

  while (landscapes.length > 0 || portraits.length > 0) {
    const row = document.createElement('div');

    // Сценарий 1: 3 горизонтали + 1 портрет
    if (landscapes.length >= 3 && portraits.length >= 1) {
      row.className = 'bento-pattern-row';
      const h1 = landscapes.shift();
      const h2 = landscapes.shift();
      const v1 = portraits.shift();
      const h3 = landscapes.shift();

      if (!isMirrored) {
        row.innerHTML = `
          <div class="bento-top-group">
            <div class="bento-left-col">
              ${createCardHtml(h1.fileItem, h1.originalIndex)}
              ${createCardHtml(h2.fileItem, h2.originalIndex)}
            </div>
            <div class="bento-right-col">
              ${createCardHtml(v1.fileItem, v1.originalIndex)}
            </div>
          </div>
          <div class="bento-bottom-full">
            ${createCardHtml(h3.fileItem, h3.originalIndex)}
          </div>
        `;
      } else {
        row.innerHTML = `
          <div class="bento-top-group">
            <div class="bento-right-col">
              ${createCardHtml(v1.fileItem, v1.originalIndex)}
            </div>
            <div class="bento-left-col">
              ${createCardHtml(h1.fileItem, h1.originalIndex)}
              ${createCardHtml(h2.fileItem, h2.originalIndex)}
            </div>
          </div>
          <div class="bento-bottom-full">
            ${createCardHtml(h3.fileItem, h3.originalIndex)}
          </div>
        `;
      }
      isMirrored = !isMirrored;
    } 
    // Сценарий 2: 2 горизонтали + 1 портрет
    else if (landscapes.length >= 2 && portraits.length >= 1) {
      row.className = 'bento-row';
      const h1 = landscapes.shift();
      const v1 = portraits.shift();
      const h2 = landscapes.shift();

      if (!isMirrored) {
        row.innerHTML = `
          <div class="bento-col-4">
            ${createCardHtml(h1.fileItem, h1.originalIndex)}
            ${createCardHtml(v1.fileItem, v1.originalIndex)}
          </div>
          <div class="bento-col-8">
            ${createCardHtml(h2.fileItem, h2.originalIndex)}
          </div>
        `;
      } else {
        row.innerHTML = `
          <div class="bento-col-8">
            ${createCardHtml(h2.fileItem, h2.originalIndex)}
          </div>
          <div class="bento-col-4">
            ${createCardHtml(h1.fileItem, h1.originalIndex)}
            ${createCardHtml(v1.fileItem, v1.originalIndex)}
          </div>
        `;
      }
      isMirrored = !isMirrored;
    } 
    // Сценарий 3: 3 вертикали
    else if (portraits.length >= 3) {
      row.className = 'bento-row';
      const v1 = portraits.shift();
      const v2 = portraits.shift();
      const v3 = portraits.shift();

      row.innerHTML = `
        <div class="bento-col-4">${createCardHtml(v1.fileItem, v1.originalIndex)}</div>
        <div class="bento-col-4">${createCardHtml(v2.fileItem, v2.originalIndex)}</div>
        <div class="bento-col-4">${createCardHtml(v3.fileItem, v3.originalIndex)}</div>
      `;
    }
    // Сценарий 4: 2 горизонтали (50/50)
    else if (landscapes.length >= 2) {
      row.className = 'bento-row';
      const h1 = landscapes.shift();
      const h2 = landscapes.shift();

      row.innerHTML = `
        <div class="bento-col-6">${createCardHtml(h1.fileItem, h1.originalIndex)}</div>
        <div class="bento-col-6">${createCardHtml(h2.fileItem, h2.originalIndex)}</div>
      `;
    }
    // 🎯 УМНАЯ ОБРАБОТКА ОСТАТКА (Фикс сброса сетки в конце)
    else {
      row.className = 'bento-row bento-remainder-row';
      const remaining = [...landscapes, ...portraits];
      landscapes = [];
      portraits = [];

      if (remaining.length === 1) {
        // Одинокий кадр растягиваем на всю ширину
        row.innerHTML = `<div class="bento-col-12">${createCardHtml(remaining[0].fileItem, remaining[0].originalIndex)}</div>`;
      } else if (remaining.length === 2) {
        // 2 кадра отдаем по 50%
        row.innerHTML = `
          <div class="bento-col-6">${createCardHtml(remaining[0].fileItem, remaining[0].originalIndex)}</div>
          <div class="bento-col-6">${createCardHtml(remaining[1].fileItem, remaining[1].originalIndex)}</div>
        `;
      } else {
        // 3+ остатка делим поровну по 33%
        remaining.forEach(item => {
          const col = document.createElement('div');
          col.className = 'bento-col-4';
          col.innerHTML = createCardHtml(item.fileItem, item.originalIndex);
          row.appendChild(col);
        });
      }
    }

    fragment.appendChild(row);
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
    if (img.complete && img.naturalHeight !== 0) {
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      img.addEventListener('load', resolve, { once: true });
      img.addEventListener('error', resolve, { once: true });
    });
  });

  return Promise.all(loadPromises);
}